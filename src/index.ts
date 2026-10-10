/**
 * agents-radar: daily digest for four AI directions — hot agents, creator
 * tools, office AI and AIGC — plus trending, official-content and Product
 * Hunt reports.
 *
 * Env vars:
 *   LLM_PROVIDER        - "anthropic" | "openai" | "github-copilot" | "openrouter" (default: anthropic)
 *   GITHUB_TOKEN        - GitHub token for API access
 *   DIGEST_REPO         - owner/repo where digest issues are posted (optional)
 *
 * Provider-specific env vars — see src/providers/ for full list.
 */

import fs from "node:fs";
import path from "node:path";
import { type RepoFetch, fetchRecentItems, fetchRecentReleases, fetchRecentDiscussions } from "./github.ts";
import {
  type RepoDigest,
  buildGroupPrompt,
  buildGroupComparisonPrompt,
  buildJsonTranslationPrompt,
} from "./prompts.ts";
import { buildTrendingPrompt, buildHighlightsPrompt, type ReportHighlights } from "./prompts-data.ts";
import {
  callLlm,
  translateToZh,
  parseLlmJson,
  saveFile,
  LLM_TOKENS_TRENDING,
  assertLlmHealthy,
  reportLlmHealth,
  llmHealthLine,
  isConnectionError,
} from "./report.ts";
import {
  type BilingualBody,
  saveGroupReport,
  saveWebReport,
  saveTrendingReport,
  savePhReport,
} from "./report-savers.ts";
import { loadWebState, fetchSiteContent, type WebFetchResult, type WebState } from "./web.ts";
import { fetchTrendingData, type TrendingData } from "./trending.ts";
import { fetchPhData, type PhData } from "./ph.ts";
import { loadConfig, type RadarGroup } from "./config.ts";
import { toCstDateStr, toUtcStr, sleep } from "./date.ts";
import { type Lang, MSG } from "./i18n.ts";

// ---------------------------------------------------------------------------
// Repo config — loaded from config.yml, falls back to built-in defaults
// ---------------------------------------------------------------------------

const { groups } = loadConfig();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// ---------------------------------------------------------------------------
// Phase 1: Fetch
// ---------------------------------------------------------------------------

/** Every tracked repo of one report group, with its fetched activity. */
interface GroupFetch {
  group: RadarGroup;
  fetched: RepoFetch[];
}

interface AllData {
  groupFetches: GroupFetch[];
  webResults: WebFetchResult[];
  trendingData: TrendingData;
  phData: PhData;
}

async function fetchAllData(since: Date, webState: WebState): Promise<AllData> {
  const allConfigs = groups.flatMap((g) => g.repos);
  console.log(`  Tracking: ${allConfigs.map((r) => r.id).join(", ")}, web, trending, ph`);

  const [groupFetches, webResults, trendingData, phData] = await Promise.all([
    Promise.all(
      groups.map(async (group) => ({
        group,
        fetched: await Promise.all(
          group.repos.map(async (cfg) => {
            try {
              const [issuesRaw, prs, releases, discussions] = await Promise.all([
                fetchRecentItems(cfg, "issues", since),
                fetchRecentItems(cfg, "pulls", since),
                fetchRecentReleases(cfg.repo, since),
                cfg.discussions ? fetchRecentDiscussions(cfg.repo, since) : Promise.resolve([]),
              ]);
              const issues = issuesRaw.filter((i) => !i.pull_request);
              console.log(
                `  [${cfg.id}] issues: ${issues.length}, prs: ${prs.length}, releases: ${releases.length}` +
                  (cfg.discussions ? `, discussions: ${discussions.length}` : ""),
              );
              return { cfg, issues, prs, releases, discussions };
            } catch (err) {
              console.error(`  [${cfg.id}] fetch failed: ${err}`);
              return { cfg, issues: [], prs: [], releases: [], discussions: [] };
            }
          }),
        ),
      })),
    ),
    Promise.all([
      fetchSiteContent("anthropic", webState).catch((err): WebFetchResult => {
        console.error(`  [web/anthropic] fetch failed: ${err}`);
        return {
          site: "anthropic",
          siteName: "Anthropic (Claude)",
          isFirstRun: false,
          newItems: [],
          totalDiscovered: 0,
        };
      }),
      fetchSiteContent("openai", webState).catch((err): WebFetchResult => {
        console.error(`  [web/openai] fetch failed: ${err}`);
        return { site: "openai", siteName: "OpenAI", isFirstRun: false, newItems: [], totalDiscovered: 0 };
      }),
    ]),
    fetchTrendingData().catch(
      (): TrendingData => ({
        trendingRepos: [],
        searchRepos: [],
        trendingFetchSuccess: false,
      }),
    ),
    fetchPhData().catch((): PhData => ({ products: [], fetchSuccess: false })),
  ]);

  return { groupFetches, webResults, trendingData, phData };
}

// ---------------------------------------------------------------------------
// Phase 2: LLM summaries
// ---------------------------------------------------------------------------

/** Call LLM with logging and error fallback. */
async function summarize(id: string, prompt: string, failMsg: string, maxTokens?: number): Promise<string> {
  console.log(`  [${id}] Calling LLM for summary...`);
  try {
    return await callLlm(prompt, maxTokens);
  } catch (err) {
    console.error(`  [${id}] LLM call failed: ${err}`);
    return failMsg;
  }
}

/** Summarize a repo's activity, returning a RepoDigest. Skips LLM if no data. */
async function summarizeRepo(
  { cfg, issues, prs, releases, discussions }: RepoFetch,
  prompt: string,
  noActivityMsg: string,
  failMsg: string,
): Promise<RepoDigest> {
  if (!issues.length && !prs.length && !releases.length && !discussions.length) {
    console.log(`  [${cfg.id}] No activity, skipping LLM call`);
    return { config: cfg, issues, prs, releases, discussions, summary: noActivityMsg };
  }
  const summary = await summarize(cfg.id, prompt, failMsg);
  return { config: cfg, issues, prs, releases, discussions, summary };
}

/** Every LLM-generated report body for one language. */
interface Summaries {
  /** Per-repo digests, keyed by report group id. */
  digestsByGroup: Map<string, RepoDigest[]>;
  trendingSummary: string;
}

/**
 * Generate every report body in English. Chinese comes from
 * `translateSummaries`, not from a second pass over the raw data — see
 * `translateToZh` in report.ts for why.
 */
async function generateSummaries(
  groupFetches: GroupFetch[],
  trendingData: TrendingData,
  dateStr: string,
): Promise<Summaries> {
  const lang: Lang = "en";
  const noActivity = MSG.noActivity[lang];
  const fail = MSG.summaryFailed[lang];

  const [groupResults, trendingSummary] = await Promise.all([
    Promise.all(
      groupFetches.map(async ({ group, fetched }) => ({
        gid: group.id,
        digests: await Promise.all(
          fetched.map((f) =>
            summarizeRepo(
              f,
              buildGroupPrompt(group.id, f.cfg, f.issues, f.prs, f.releases, f.discussions, dateStr, lang),
              noActivity,
              fail,
            ),
          ),
        ),
      })),
    ),
    (async () => {
      const hasData = trendingData.trendingRepos.length > 0 || trendingData.searchRepos.length > 0;
      if (!hasData) {
        return MSG.trendingNoData[lang];
      }
      return summarize(
        "trending",
        buildTrendingPrompt(trendingData, dateStr, lang),
        MSG.trendingFailed[lang],
        LLM_TOKENS_TRENDING,
      );
    })(),
  ]);

  return {
    digestsByGroup: new Map(groupResults.map((r) => [r.gid, r.digests])),
    trendingSummary,
  };
}

// ---------------------------------------------------------------------------
// Phase 2b: Chinese translation
// ---------------------------------------------------------------------------

/**
 * Fixed status strings ("no activity", "generation failed") are i18n constants,
 * not model output. Map them straight across rather than paying for a
 * translation call that would only re-derive Chinese we already have — on a
 * quiet day that is most of the quiet repos' digests.
 */
const FIXED_EN_TO_ZH = new Map(Object.values(MSG).map((m) => [m.en, m.zh] as [string, string]));

function localize(enText: string, maxTokens?: number): Promise<string> {
  const fixed = FIXED_EN_TO_ZH.get(enText);
  return fixed !== undefined ? Promise.resolve(fixed) : translateToZh(enText, maxTokens);
}

async function localizeDigest(d: RepoDigest): Promise<RepoDigest> {
  return { ...d, summary: await localize(d.summary) };
}

/** Translate a full set of English report bodies into Chinese. */
async function translateSummaries(en: Summaries): Promise<Summaries> {
  const [groupResults, trendingSummary] = await Promise.all([
    Promise.all(
      [...en.digestsByGroup.entries()].map(
        async ([gid, digests]) => [gid, await Promise.all(digests.map(localizeDigest))] as const,
      ),
    ),
    localize(en.trendingSummary, LLM_TOKENS_TRENDING),
  ]);
  return { digestsByGroup: new Map(groupResults), trendingSummary };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Pause between the two highlights attempts when the first one died on a
 * connection failure. Long enough that attempt 2 lands outside the outage that
 * just consumed callLlm's retry ladder, short enough that a healthy provider
 * hiccup still costs the run a single minute.
 */
const HIGHLIGHTS_COOLDOWN_MS = 60_000;

async function main(): Promise<void> {
  requireEnv("GITHUB_TOKEN");

  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateStr = toCstDateStr(now);
  const utcStr = toUtcStr(now);
  const digestRepo = process.env["DIGEST_REPO"] ?? "";

  const providerName = process.env["LLM_PROVIDER"] ?? "anthropic";
  console.log(`[${now.toISOString()}] Starting digest | provider: ${providerName}`);

  // 1. Fetch all data in parallel
  const webState = loadWebState();
  const { groupFetches, webResults, trendingData, phData } = await fetchAllData(since, webState);

  // 2. Generate every report body once in English, then translate to Chinese
  console.log("  Generating summaries (EN)...");
  const enSummaries = await generateSummaries(groupFetches, trendingData, dateStr);

  console.log("  Translating summaries (EN -> ZH)...");
  const zhSummaries = await translateSummaries(enSummaries);

  // First gate: dozens of calls have run by now, enough to tell an outage from
  // a flaky report. Bailing here costs nothing — no file has been written yet.
  assertLlmHealthy("summary");

  // 3. Generate cross-project comparisons per group in English, then translate
  console.log("  Calling LLM for comparative analyses (EN)...");
  const enComparisons = await Promise.all(
    groupFetches.map(async ({ group }) => {
      const digests = enSummaries.digestsByGroup.get(group.id) ?? [];
      const text = await summarize(
        `${group.id}-comparison`,
        buildGroupComparisonPrompt(group.id, digests, dateStr, "en"),
        MSG.comparisonFailed.en,
      );
      return [group.id, text] as const;
    }),
  );

  console.log("  Translating comparative analyses (EN -> ZH)...");
  // localize(), not translateToZh(): when a comparison fell back to the fixed
  // notice there is nothing to translate, and its Chinese text is already known.
  const comparisonBodies: Record<string, BilingualBody> = {};
  await Promise.all(
    enComparisons.map(async ([gid, enText]) => {
      comparisonBodies[gid] = { en: enText, zh: await localize(enText) };
    }),
  );

  // 4. Build + save all group reports (zh + en)
  const summariesByLang: Record<Lang, Summaries> = { zh: zhSummaries, en: enSummaries };

  await Promise.all(
    groupFetches.map(({ group }) =>
      saveGroupReport(
        group.id,
        {
          zh: summariesByLang.zh.digestsByGroup.get(group.id) ?? [],
          en: summariesByLang.en.digestsByGroup.get(group.id) ?? [],
        },
        comparisonBodies[group.id]!,
        utcStr,
        dateStr,
        digestRepo,
      ),
    ),
  );

  // Each saver now emits both languages: it generates its body in English,
  // translates it, and writes both files plus both issues.
  const trendingSummaries: BilingualBody = {
    zh: zhSummaries.trendingSummary,
    en: enSummaries.trendingSummary,
  };

  await Promise.all([
    saveWebReport(webResults, webState, utcStr, dateStr, digestRepo),
    saveTrendingReport(trendingData, trendingSummaries, utcStr, dateStr, digestRepo),
    savePhReport(phData, utcStr, dateStr, digestRepo),
  ]);

  // Second gate: an outage that starts *after* the first gate would otherwise
  // sail straight through — the savers each swallow their own failure and just
  // skip a report. Files are on disk by now, but the failing exit skips the
  // commit step, so they are never published.
  assertLlmHealthy("report");

  // 5. Generate highlights for notifications
  const readReport = (name: string): string | undefined => {
    const p = path.join("digests", dateStr, name);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : undefined;
  };

  // Highlights are extracted from the English reports only — the Chinese set is
  // translated from the result, so the Chinese files are never re-read here.
  const enReports: Record<string, string> = {};
  for (const { group } of groupFetches) {
    const en = readReport(`${group.id}-en.md`);
    if (en) enReports[group.id] = en;
  }
  for (const [id, enFile] of [
    ["ai-trending", "ai-trending-en.md"],
    ["ai-web", "ai-web-en.md"],
    ["ai-ph", "ai-ph-en.md"],
  ] as const) {
    const en = readReport(enFile);
    if (en) enReports[id] = en;
  }

  console.log("  Generating highlights for notifications...");
  const highlights: Record<Lang, ReportHighlights> = { zh: {}, en: {} };
  // Both passes parse JSON, and both retry once: the LLM occasionally emits
  // slightly malformed JSON that repairJson can't fix (seen 2026-07-13: zh
  // failed with "Expected ',' or ']' after array element"); a fresh generation
  // usually returns valid JSON.
  //
  // A connection failure is a different animal: attempt 1 has already burned
  // callLlm's full ~3 min connection ladder, so firing attempt 2 immediately
  // re-enters an outage that is demonstrably still going. On 2026-09-19 both
  // attempts failed back to back inside the same DashScope outage and the day
  // shipped with an empty highlights.json — notifications rendered section
  // links and no bullets. Wait out a cooldown first; a malformed-JSON retry
  // still goes straight through.
  const attemptJson = async (label: string, prompt: string): Promise<ReportHighlights> => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return parseLlmJson<ReportHighlights>(await callLlm(prompt, 2048));
      } catch (err) {
        const tag = attempt < 2 ? "retrying" : "giving up";
        console.error(`  [highlights] ${label} attempt ${attempt} failed (${tag}): ${err}`);
        if (attempt < 2 && isConnectionError(err)) {
          console.error(
            `  [highlights] connection down — cooling down ${HIGHLIGHTS_COOLDOWN_MS / 1000}s before retry`,
          );
          await sleep(HIGHLIGHTS_COOLDOWN_MS);
        }
      }
    }
    return {};
  };

  // English is extracted from the reports; Chinese is translated from that
  // result. The extraction prompt carries every report body, the translation
  // prompt carries only the short highlight list.
  highlights.en = await attemptJson("en", buildHighlightsPrompt(enReports, "en"));
  highlights.zh = Object.keys(highlights.en).length
    ? await attemptJson("zh", buildJsonTranslationPrompt(JSON.stringify(highlights.en)))
    : {};

  // If one language failed (generation or parse) but the other succeeded,
  // backfill the empty one from the other so notifications never render with
  // zero highlights. Seen 2026-07-13: zh failed intermittently while en was
  // fine, leaving notifications with only section headers and no bullets.
  const zhEmpty = Object.keys(highlights.zh).length === 0;
  const enEmpty = Object.keys(highlights.en).length === 0;
  if (zhEmpty && !enEmpty) {
    console.warn("  [highlights] zh empty — backfilling from en");
    highlights.zh = highlights.en;
  } else if (enEmpty && !zhEmpty) {
    console.warn("  [highlights] en empty — backfilling from zh");
    highlights.en = highlights.zh;
  }

  const highlightsPath = saveFile(JSON.stringify(highlights, null, 2), dateStr, "highlights.json");
  console.log(`  Saved ${highlightsPath}`);

  reportLlmHealth();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  // The tally is the first thing worth seeing when a run dies — it separates
  // "the provider was unreachable" from a genuine bug in the pipeline.
  console.error(`  [llm] ${llmHealthLine()}`);
  process.exit(1);
});
