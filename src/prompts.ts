/**
 * LLM prompt builders and item formatting.
 */

import type { RepoConfig, GitHubItem, GitHubRelease, GitHubDiscussion } from "./github.ts";
import { GROUP_REPORTS, MSG, type Lang } from "./i18n.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepoDigest {
  config: RepoConfig;
  issues: GitHubItem[];
  prs: GitHubItem[];
  releases: GitHubRelease[];
  discussions: GitHubDiscussion[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatItem(item: GitHubItem, lang: Lang = "zh"): string {
  const labels = item.labels.map((l) => l.name).join(", ");
  const labelStr = labels ? ` [${labels}]` : "";
  const body = (item.body ?? "").replace(/\n/g, " ").trim().slice(0, 300);
  const ellipsis = (item.body ?? "").length > 300 ? "..." : "";
  const t =
    lang === "en"
      ? {
          author: "Author",
          created: "Created",
          updated: "Updated",
          comments: "Comments",
          url: "URL",
          summary: "Summary",
        }
      : { author: "作者", created: "创建", updated: "更新", comments: "评论", url: "链接", summary: "摘要" };
  // Extract "owner/repo" from html_url to avoid full GitHub URLs that trigger cross-references
  const repoSlug = item.html_url.replace(/^https:\/\/github\.com\//, "").replace(/\/(issues|pull)\/\d+$/, "");
  const itemKind = item.html_url.includes("/pull/") ? "PR" : "Issue";
  const refStr = `${repoSlug} ${itemKind} #${item.number}`;
  return [
    `#${item.number} [${item.state.toUpperCase()}]${labelStr} ${item.title}`,
    `  ${t.author}: ${item.user.login} | ${t.created}: ${item.created_at.slice(0, 10)} | ${t.updated}: ${item.updated_at.slice(0, 10)} | ${t.comments}: ${item.comments} | 👍: ${item.reactions?.["+1"] ?? 0}`,
    `  ${t.url}: ${refStr}`,
    `  ${t.summary}: ${body}${ellipsis}`,
  ].join("\n");
}

export function formatDiscussion(d: GitHubDiscussion, lang: Lang = "zh"): string {
  const body = (d.body ?? "").replace(/\n/g, " ").trim().slice(0, 300);
  const ellipsis = (d.body ?? "").length > 300 ? "..." : "";
  const t =
    lang === "en"
      ? { author: "Author", created: "Created", updated: "Updated", comments: "Comments", url: "URL" }
      : { author: "作者", created: "创建", updated: "更新", comments: "评论", url: "链接" };
  const answered = d.answered ? (lang === "en" ? " [ANSWERED]" : " [已解决]") : "";
  // Same URL-shortening as formatItem: keep "owner/repo" only, so the rendered
  // issue body never contains a full github.com link that triggers back-refs.
  const repoSlug = d.html_url.replace(/^https:\/\/github\.com\//, "").replace(/\/discussions\/\d+$/, "");
  return [
    `#${d.number} [${d.category}]${answered} ${d.title}`,
    `  ${t.author}: ${d.author} | ${t.created}: ${d.created_at.slice(0, 10)} | ${t.updated}: ${d.updated_at.slice(0, 10)} | ${t.comments}: ${d.comments} | 👍: ${d.upvotes}`,
    `  ${t.url}: ${repoSlug} Discussion #${d.number}`,
    `  ${lang === "en" ? "Summary" : "摘要"}: ${body}${ellipsis}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Sampling helpers (shared)
// ---------------------------------------------------------------------------

const GROUP_ISSUE_LIMIT = 30;
const GROUP_PR_LIMIT = 20;
// Higher than the issue/PR limits: for a repo with Issues/PRs disabled the
// discussion list is the entire report, not a supplement to them.
const GROUP_DISCUSSION_LIMIT = 40;

/** Sort by comment count desc, take top N. */
export function topN(items: GitHubItem[], n: number): GitHubItem[] {
  return [...items].sort((a, b) => b.comments - a.comments).slice(0, n);
}

/**
 * Sort discussions by engagement (comments + upvotes) desc, take top N.
 * Unlike issues, upvotes are the primary signal on a discussion board — many
 * high-value threads are feature requests with votes but no replies.
 */
export function topDiscussions(items: GitHubDiscussion[], n: number): GitHubDiscussion[] {
  return [...items].sort((a, b) => b.comments + b.upvotes - (a.comments + a.upvotes)).slice(0, n);
}

/** What the top-N sample was ranked by, so the note doesn't misstate the sort. */
export type SampleBy = "comments" | "engagement";

const SAMPLE_BY_TEXT: Record<SampleBy, Record<Lang, string>> = {
  comments: { en: "comment count", zh: "评论数" },
  engagement: { en: "comments + upvotes", zh: "评论数 + 点赞数" },
};

export function sampleNote(
  total: number,
  sampled: number,
  lang: Lang = "zh",
  by: SampleBy = "comments",
): string {
  const criterion = SAMPLE_BY_TEXT[by][lang];
  if (lang === "en") {
    return total > sampled
      ? `(Total: ${total} items; showing top ${sampled} by ${criterion})`
      : `(Total: ${total} items)`;
  }
  return total > sampled
    ? `（共 ${total} 条，以下展示${criterion}最多的 ${sampled} 条）`
    : `（共 ${total} 条）`;
}

// ---------------------------------------------------------------------------
// Group prompts (the four daily directions)
// ---------------------------------------------------------------------------

function groupInfo(gid: string) {
  const info = GROUP_REPORTS[gid];
  if (!info) throw new Error(`Unknown report group: ${gid}`);
  return info;
}

/** Per-project digest prompt for one report group (persona comes from i18n). */
export function buildGroupPrompt(
  gid: string,
  cfg: RepoConfig,
  issues: GitHubItem[],
  prs: GitHubItem[],
  releases: GitHubRelease[],
  discussions: GitHubDiscussion[],
  dateStr: string,
  lang: Lang = "zh",
): string {
  const info = groupInfo(gid);
  const sampledIssues = topN(issues, GROUP_ISSUE_LIMIT);
  const sampledPrs = topN(prs, GROUP_PR_LIMIT);
  const sampledDiscussions = topDiscussions(discussions, GROUP_DISCUSSION_LIMIT);

  const noneStr = lang === "en" ? "None" : "无";
  const issuesText = sampledIssues.map((i) => formatItem(i, lang)).join("\n") || noneStr;
  const prsText = sampledPrs.map((p) => formatItem(p, lang)).join("\n") || noneStr;
  const releasesText = releases.length
    ? releases.map((r) => `- ${r.tag_name}: ${r.name}\n  ${(r.body ?? "").slice(0, 300)}`).join("\n")
    : noneStr;

  const issueNote = sampleNote(issues.length, sampledIssues.length, lang);
  const prNote = sampleNote(prs.length, sampledPrs.length, lang);

  // Repos without discussions enabled get no section at all, rather than an
  // empty one the model would feel obliged to comment on.
  const discussionsSection = sampledDiscussions.length
    ? (lang === "en"
        ? `\n## Latest Discussions (updated in last 24h)${sampleNote(discussions.length, sampledDiscussions.length, lang, "engagement")}\n`
        : `\n## 最新 Discussions（过去24小时内更新）${sampleNote(discussions.length, sampledDiscussions.length, lang, "engagement")}\n`) +
      sampledDiscussions.map((d) => formatDiscussion(d, lang)).join("\n") +
      "\n"
    : "";

  if (lang === "en") {
    return `${info.persona.en}

Focus: ${info.focus.en}

Based on the following GitHub data, generate the ${cfg.name} report for ${dateStr}.

# Data source: github.com/${cfg.repo}

## Latest Releases (last 24h)
${releasesText}

## Latest Issues (updated in last 24h)${issueNote}
${issuesText}

## Latest Pull Requests (updated in last 24h)${prNote}
${prsText}
${discussionsSection}
---

Generate a structured English report with the following sections:

1. **Today's Highlights** - 2-3 sentences on the most important updates and what they mean for readers
2. **Releases & Updates** - New versions and what shipped; point out what a non-developer can immediately use; omit if none
3. **Key Progress** - Notable new features and capabilities, explained in plain language without jargon
4. **Community Buzz** - The most active Issues/PRs/Discussions: what people are asking for, reporting, or excited about
5. **Signals to Watch** - Directional changes or new use cases visible in today's activity

Style: written for non-developer readers (content, product and operations teams). Plain language, no jargon. Prefer concrete "what you can do with it" over implementation detail, but stay factual — do not invent anything not supported by the data. Include GitHub links for each item.
`;
  }

  return `${info.persona.zh}

关注方向：${info.focus.zh}

请根据以下 GitHub 数据，生成 ${dateStr} 的 ${cfg.name} 动态日报。

# 数据来源: github.com/${cfg.repo}

## 最新 Releases（过去24小时）
${releasesText}

## 最新 Issues（过去24小时内更新）${issueNote}
${issuesText}

## 最新 Pull Requests（过去24小时内更新）${prNote}
${prsText}
${discussionsSection}
---

请生成一份结构清晰的中文日报，包含以下部分：

1. **今日速览** - 用2-3句话概括今天最重要的动态，以及这对读者意味着什么
2. **版本与更新** - 新版本及更新内容，点出「普通人不写代码也能直接用上」的部分；无则省略
3. **重要进展** - 值得关注的新功能、新能力，用通俗语言解释，避免技术黑话
4. **社区热点** - 讨论最热烈的 Issues/PRs/Discussions：大家在要什么、反馈什么问题、对什么感兴趣
5. **值得关注的信号** - 从今日动态中看到的方向性变化或新玩法

语言要求：写给不写代码的同事（内容、产品、运营）看，通俗直白，避免术语堆砌。优先说「能拿它做什么」，但必须以数据为准，不要编造数据里没有的内容。每个条目附上 GitHub 链接。
`;
}

/** Cross-project comparison prompt for one report group. */
export function buildGroupComparisonPrompt(
  gid: string,
  digests: RepoDigest[],
  dateStr: string,
  lang: Lang = "zh",
): string {
  const info = groupInfo(gid);
  const noActivityStr = MSG.noActivity[lang];

  const sections = digests
    .map((d) => {
      const hasData = d.issues.length || d.prs.length || d.releases.length || d.discussions.length;
      if (!hasData) return `## ${d.config.name} (github.com/${d.config.repo})\n${noActivityStr}`;
      return `## ${d.config.name} (github.com/${d.config.repo})\n${d.summary}`;
    })
    .join("\n\n---\n\n");

  if (lang === "en") {
    return `${info.persona.en}

Focus: ${info.focus.en}

The following are ${dateStr} digest summaries for each project:

${sections}

---

Generate a cross-project comparison report in English with these sections:

1. **Overview** - 3-5 sentences on the overall landscape in this direction today
2. **Activity Comparison** - Table comparing Issues count, PR count and Release status for each project. Repos with Issues/PRs disabled upstream use Discussions as their only community channel — mark those as "N/A" rather than reporting them as inactive
3. **Shared Themes** - Needs and features emerging across multiple projects (note which projects)
4. **Positioning Differences** - How the projects differ in focus, target users and approach
5. **Signals to Watch** - Trends worth following, and what they mean for readers

Style: concise, factual and data-backed, written for non-developer readers (content, product and operations teams).
`;
  }

  return `${info.persona.zh}

关注方向：${info.focus.zh}

以下是 ${dateStr} 各项目的动态摘要：

${sections}

---

请基于上述各项目的动态，生成一份横向对比分析报告，包含以下部分：

1. **整体概览** - 用3-5句话概括该方向今日整体态势
2. **活跃度对比** - 以表格形式汇总各项目今日的 Issues 数、PR 数、Release 情况。部分仓库上游关闭了 Issues/PR，仅以 Discussions 作为社区渠道，这类请标注 "N/A"，不要判定为不活跃
3. **共同关注的方向** - 多个项目都在推进或社区都在呼唤的需求（注明涉及哪些项目）
4. **差异化定位** - 各项目在功能侧重、目标用户、使用门槛上的差异
5. **值得关注的信号** - 从今日动态中提炼值得跟进的趋势，以及对读者的参考价值

语言要求：简洁、有数据支撑，写给不写代码的读者（内容、产品、运营）看。
`;
}

// ---------------------------------------------------------------------------
// Translation
// ---------------------------------------------------------------------------
// Every report body is generated once in English, then translated to Chinese.
// Generating both languages from the raw GitHub/API data doubled the LLM bill
// for identical information; a translation pass costs a fraction of the input
// tokens because its prompt is the finished report, not the source data.

/** Prompt that translates a finished English report body into Chinese. */
export function buildTranslationPrompt(text: string): string {
  return `Translate the following English technical report into Simplified Chinese.

${text}

---

Rules:
- Output ONLY the translation. No preamble, no explanation, no markdown fences around the whole output.
- Preserve the Markdown structure exactly: headings, tables (including column alignment rows), lists, blockquotes, bold/italic, horizontal rules, emoji.
- Keep URLs, link targets, code spans, code blocks, numbers and dates verbatim.
- Keep project names, repository slugs, usernames, version tags, file paths and API/config identifiers in their original form — do not translate them.
- Issue/PR references like #12345 and their link text stay as-is.
- Use natural technical Chinese, the register of a Chinese developer newsletter — not a literal word-for-word rendering.`;
}

/** Prompt that translates the string values of a JSON object into Chinese. */
export function buildJsonTranslationPrompt(json: string): string {
  return `Translate the string values in the following JSON into Simplified Chinese.

${json}

---

Rules:
- Return ONLY valid JSON. No markdown fences, no explanation.
- Keep every key exactly as-is. Keep the array lengths and nesting identical.
- Translate only the string values.
- Keep project names, repository slugs, version tags and numbers in their original form.
- Each translated string must stay under 30 Chinese characters.`;
}
