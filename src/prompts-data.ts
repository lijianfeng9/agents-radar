/**
 * LLM prompt for the daily news digest.
 *
 * The model receives every outstanding news item plus the GitHub trending
 * snapshot and returns one structured JSON object. The report markdown, the
 * WeCom cards and the notification highlights are all rendered from that
 * single call — no second generation pass, no per-language duplication.
 */

import type { NewsItem } from "./news.ts";
import type { TrendingData } from "./trending.ts";

export const NEWS_SECTION_IDS = ["llm", "agents", "creator", "office"] as const;

export type NewsSectionId = (typeof NEWS_SECTION_IDS)[number];

export interface DailyNewsItem {
  title: string;
  summary: string;
  url: string;
}

export type DailyNewsSections = Record<NewsSectionId, DailyNewsItem[]>;

export interface DailyNewsCard {
  title: string;
  description: string;
  url: string;
  /** Cover image taken from the source feed; used as the WeCom card picurl. */
  image?: string;
}

/** A trending repo the model picked, with its one-line Chinese pitch. */
export interface DailyTrendingPick {
  repo: string;
  summary: string;
}

/** The LLM's structured output after validation. */
export interface DailyNews {
  summary: string[];
  sections: DailyNewsSections;
  trendingPicks: DailyTrendingPick[];
  cards: DailyNewsCard[];
}

// Highlight lists for notifications (Telegram / Feishu) — kept so the
// existing notify scripts keep working unchanged.
export interface ReportHighlights {
  [reportId: string]: string[];
}

// ---------------------------------------------------------------------------
// Input formatting
// ---------------------------------------------------------------------------

const MAX_TRENDING_LINES = 30;

function formatNewsItems(items: NewsItem[]): string {
  return items
    .map(
      (it, i) =>
        `${i + 1}. [${it.sourceName}] ${it.title}\n` +
        `   链接: ${it.link}\n` +
        `   摘要: ${it.excerpt || "（无摘要）"}`,
    )
    .join("\n");
}

function formatTrending(data: TrendingData): string {
  const trending = data.trendingRepos.slice(0, MAX_TRENDING_LINES).map((r) => {
    const stars =
      `⭐${r.totalStars.toLocaleString()}` +
      (r.todayStars > 0 ? `（今日 +${r.todayStars.toLocaleString()}）` : "");
    return `- ${r.fullName} ${stars}${r.language ? ` [${r.language}]` : ""}${r.description ? ` — ${r.description}` : ""}`;
  });
  const search = data.searchRepos.slice(0, MAX_TRENDING_LINES).map((r) => {
    const stars = `⭐${r.stargazersCount.toLocaleString()}`;
    return `- ${r.fullName} ${stars} [topic:${r.searchQuery}]${r.description ? ` — ${r.description}` : ""}`;
  });

  const trendingBlock = trending.length
    ? trending.join("\n")
    : "（今日 GitHub Trending 抓取失败，请将该部分留空）";
  const searchBlock = search.length ? search.join("\n") : "（无搜索结果）";

  return `### 今日 Trending（github.com/trending）\n${trendingBlock}\n\n### AI 主题搜索（近 7 天活跃）\n${searchBlock}`;
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

export function buildDailyNewsPrompt(items: NewsItem[], trending: TrendingData, dateStr: string): string {
  const newsBlock = formatNewsItems(items);
  const trendingBlock = formatTrending(trending);

  return `你是《AI 每日要闻》的主编。这份简报每天早上发给一家公司的全体员工：内容创作者、产品、运营、行政——都不写代码。他们想知道：昨天 AI 圈发生了什么大事，有哪些新工具、新玩法、新消息值得点开看。

今天是 ${dateStr}。以下是从中文科技媒体抓取的过去 24 小时新闻条目（按发布时间从新到旧编号），以及 GitHub 的趋势数据。

## 新闻条目（共 ${items.length} 条）
${newsBlock}

## GitHub 数据
${trendingBlock}

---
请输出一份 JSON 简报，规则如下：

**第一步 · 筛选**
- 只保留对 AI 有实质意义的条目：新模型/产品发布、能力升级、重要融资与行业事件、有用的新工具与玩法、值得关注的行业趋势。
- 与 AI 无关的内容（普通数码、汽车、财经、社会新闻）或纯营销稿直接丢弃。
- **删除重复**：同一事件如果多条来源都在报，只保留一条——选信息最完整的那条链接。

**第二步 · 分区**（固定四个，顺序不变；某区没有合格内容就输出空数组）
- "llm"：大模型动向（新模型发布、能力升级、重要融资/行业事件）
- "agents"：智能体 & 开源项目（AI 智能体、开源项目、开发者工具的重要更新）
- "creator"：创作者 · AIGC 玩法（对自媒体、短视频、设计有帮助的工具、模型与玩法）
- "office"：办公提效（文档、表格、演示、自动化、知识管理、企业内部 AI 应用）

**第三步 · 写条目**
- 数量：llm 4~8 条，agents 4~8 条，creator 2~6 条，office 2~6 条；宁缺毋滥，不凑数。
- 每条包含：
  - title：标题，尽量与原文一致，可去掉来源后缀、适度精简，不超过 30 字；
  - summary：一句话说明「是什么 + 为什么值得看」，不超过 40 字，不要用「今天」「本文」「该报道」这类词；
  - url：原文链接，**必须从上面条目中原样复制**，不得虚构或改写。

**第四步 · GitHub 趋势**
- trending：从 GitHub 数据中挑选 5~8 个与 AI 相关、对读者有启发的项目。优先选今日新增 stars 高的，或与智能体、AIGC、办公提效直接相关的。
- 每项包含：repo（仓库名，"owner/repo" 格式，必须与上文完全一致）、summary（一句话说明它是什么、为什么值得关注，不超过 40 字）。

**第五步 · 推送卡片**
- cards：挑选 6~8 条「最值得点开」的内容做企微推送卡片（优先重大模型/产品发布、能直接上手的工具、有趣的新玩法；可跨分区挑选，也可选 GitHub 趋势项目）。
- 每条 card：title 不超过 20 字，description 一句话不超过 35 字说清看点，url 必须来自上文条目或 GitHub 仓库链接。

**输出格式**：只返回合法 JSON，不要 markdown 代码块、不要任何解释：
{"summary":["速览1","速览2","速览3"],
 "sections":{"llm":[{"title":"","summary":"","url":""}],"agents":[],"creator":[],"office":[]},
 "trending":[{"repo":"owner/repo","summary":""}],
 "cards":[{"title":"","description":"","url":""}]}

**summary**：3~5 条今日速览，每条一句话（不超过 40 字），从各分区中提炼，让人一眼知道今天 AI 圈发生了什么。
`;
}
