/**
 * Report saver functions — LLM call + file save + optional GitHub issue.
 * Extracted from index.ts for separation of concerns.
 *
 * Each saver emits both languages. The body is generated once in English and
 * translated to Chinese (see `bilingualBody`), so a saver owns the whole
 * bilingual output for its report instead of being called once per language.
 */

import { type Lang, WEB_REPORT, TRENDING_REPORT, PH_REPORT, GROUP_REPORTS, ISSUE_LABELS } from "./i18n.ts";
import { buildGroupReportContent } from "./report-builders.ts";
import { buildWebReportPrompt, buildPhPrompt } from "./prompts-data.ts";
import type { RepoDigest } from "./prompts.ts";
import {
  callLlm,
  translateToZh,
  saveFile,
  autoGenFooter,
  LLM_TOKENS_WEB,
  LLM_TOKENS_LISTING,
} from "./report.ts";
import { createGitHubIssue } from "./github.ts";
import { saveWebState, type WebFetchResult, type WebState } from "./web.ts";
import type { PhData } from "./ph.ts";
import type { TrendingData } from "./trending.ts";

/** Output languages, in the order reports are written. */
export const LANGS = ["zh", "en"] as const;

/** A report body in both languages. */
export type BilingualBody = Record<Lang, string>;

/**
 * Generate a report body once in English, then translate it to Chinese.
 * Throws if the English generation fails — there is nothing to save then.
 * A failed translation degrades to English rather than throwing.
 */
async function bilingualBody(enPrompt: string, maxTokens: number): Promise<BilingualBody> {
  const en = await callLlm(enPrompt, maxTokens);
  const zh = await translateToZh(en, maxTokens);
  return { en, zh };
}

// ---------------------------------------------------------------------------
// Group reports (the four daily directions)
// ---------------------------------------------------------------------------

export async function saveGroupReport(
  gid: string,
  digestsByLang: Record<Lang, RepoDigest[]>,
  comparison: BilingualBody,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  const info = GROUP_REPORTS[gid];
  if (!info) throw new Error(`Unknown report group: ${gid}`);

  for (const lang of LANGS) {
    const fileName = lang === "en" ? `${gid}-en.md` : `${gid}.md`;
    const content = buildGroupReportContent(
      gid,
      digestsByLang[lang],
      comparison[lang],
      utcStr,
      dateStr,
      autoGenFooter(lang),
      lang,
    );

    console.log(`  Saved ${saveFile(content, dateStr, fileName)}`);

    if (digestRepo) {
      const issueTitle = info.issueTitle(dateStr, lang);
      const issueUrl = await createGitHubIssue(issueTitle, content, info.issueLabel[lang]);
      console.log(`  Created ${gid} issue (${lang}): ${issueUrl}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Web report
// ---------------------------------------------------------------------------

export async function saveWebReport(
  webResults: WebFetchResult[],
  webState: WebState,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  const hasNewContent = webResults.some((r) => r.newItems.length > 0);

  if (hasNewContent) {
    console.log("  [web] Calling LLM for web content report (EN) + translation (ZH)...");
    try {
      const summary = await bilingualBody(buildWebReportPrompt(webResults, dateStr, "en"), LLM_TOKENS_WEB);
      const isFirstRun = webResults.some((r) => r.isFirstRun);
      const totalNew = webResults.reduce((sum, r) => sum + r.newItems.length, 0);

      const anthropicNew = webResults.find((r) => r.site === "anthropic")?.newItems.length ?? 0;
      const anthropicTotal = webResults.find((r) => r.site === "anthropic")?.totalDiscovered ?? 0;
      const openaiNew = webResults.find((r) => r.site === "openai")?.newItems.length ?? 0;
      const openaiTotal = webResults.find((r) => r.site === "openai")?.totalDiscovered ?? 0;

      for (const lang of LANGS) {
        const fileName = lang === "en" ? "ai-web-en.md" : "ai-web.md";
        const mode = isFirstRun ? WEB_REPORT.firstCrawl[lang] : WEB_REPORT.todayUpdate[lang];

        const webTitle = `# ${WEB_REPORT.title[lang]} ${dateStr}\n\n`;
        const webMeta = `> ${mode} | ${WEB_REPORT.newContent(totalNew, lang)} | ${WEB_REPORT.generated(utcStr, lang)}\n\n`;
        const webSources =
          lang === "en"
            ? `${WEB_REPORT.sourcesHeader[lang]}\n` +
              `- Anthropic: [anthropic.com](https://www.anthropic.com) — ${anthropicNew} new articles (sitemap total: ${anthropicTotal})\n` +
              `- OpenAI: [openai.com](https://openai.com) — ${openaiNew} new articles (sitemap total: ${openaiTotal})\n\n`
            : `${WEB_REPORT.sourcesHeader[lang]}\n` +
              `- Anthropic: [anthropic.com](https://www.anthropic.com) — 新增 ${anthropicNew} 篇（sitemap 共 ${anthropicTotal} 条）\n` +
              `- OpenAI: [openai.com](https://openai.com) — 新增 ${openaiNew} 篇（sitemap 共 ${openaiTotal} 条）\n\n`;

        const webContent = webTitle + webMeta + webSources + `---\n\n` + summary[lang] + autoGenFooter(lang);

        console.log(`  Saved ${saveFile(webContent, dateStr, fileName)}`);

        if (digestRepo) {
          const issueTitle = WEB_REPORT.issueTitle(dateStr, isFirstRun, lang);
          const webLabel = ISSUE_LABELS.web[lang];
          const webUrl = await createGitHubIssue(issueTitle, webContent, webLabel);
          console.log(`  Created web issue (${lang}): ${webUrl}`);
        }
      }
    } catch (err) {
      console.error(`  [web] Report generation failed: ${err}`);
    }
  } else {
    console.log("  [web] No new content detected, skipping report.");
  }

  saveWebState(webState);
  console.log("  [web] State saved.");
}

// ---------------------------------------------------------------------------
// Trending report
// ---------------------------------------------------------------------------

export async function saveTrendingReport(
  trendingData: TrendingData,
  trendingSummary: BilingualBody,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  const hasData = trendingData.trendingRepos.length > 0 || trendingData.searchRepos.length > 0;
  if (!hasData) {
    console.log("  [trending] No data available, skipping report.");
    return;
  }

  for (const lang of LANGS) {
    const fileName = lang === "en" ? "ai-trending-en.md" : "ai-trending.md";
    const header =
      `# ${TRENDING_REPORT.title[lang]} ${dateStr}\n\n` +
      `> ${TRENDING_REPORT.sources[lang]} | ${lang === "en" ? "Generated" : "生成时间"}: ${utcStr} UTC\n\n---\n\n`;

    const trendingContent = header + trendingSummary[lang] + autoGenFooter(lang);

    console.log(`  Saved ${saveFile(trendingContent, dateStr, fileName)}`);

    if (digestRepo) {
      const trendingTitle = TRENDING_REPORT.issueTitle(dateStr, lang);
      const trendingLabel = ISSUE_LABELS.trending[lang];
      const trendingUrl = await createGitHubIssue(trendingTitle, trendingContent, trendingLabel);
      console.log(`  Created trending issue (${lang}): ${trendingUrl}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Product Hunt
// ---------------------------------------------------------------------------

export async function savePhReport(
  phData: PhData,
  utcStr: string,
  dateStr: string,
  digestRepo: string,
): Promise<void> {
  if (!phData.fetchSuccess) {
    console.log("  [ph] No data available, skipping report.");
    return;
  }

  console.log("  [ph] Calling LLM for Product Hunt report (EN) + translation (ZH)...");
  try {
    const summary = await bilingualBody(buildPhPrompt(phData, dateStr, "en"), LLM_TOKENS_LISTING);

    for (const lang of LANGS) {
      const fileName = lang === "en" ? "ai-ph-en.md" : "ai-ph.md";
      const header =
        lang === "en"
          ? `# ${PH_REPORT.title[lang]} ${dateStr}\n\n` +
            `> Source: [Product Hunt](https://www.producthunt.com/) | ` +
            `${phData.products.length} products | Generated: ${utcStr} UTC\n\n` +
            `---\n\n`
          : `# ${PH_REPORT.title[lang]} ${dateStr}\n\n` +
            `> 数据来源: [Product Hunt](https://www.producthunt.com/) | ` +
            `共 ${phData.products.length} 个产品 | 生成时间: ${utcStr} UTC\n\n` +
            `---\n\n`;

      const phContent = header + summary[lang] + autoGenFooter(lang);

      console.log(`  Saved ${saveFile(phContent, dateStr, fileName)}`);

      if (digestRepo) {
        const phTitle = PH_REPORT.issueTitle(dateStr, lang);
        const phLabel = ISSUE_LABELS.ph[lang];
        const phUrl = await createGitHubIssue(phTitle, phContent, phLabel);
        console.log(`  Created PH issue (${lang}): ${phUrl}`);
      }
    }
  } catch (err) {
    console.error(`  [ph] Report generation failed: ${err}`);
  }
}
