/**
 * Centralized i18n strings for bilingual (zh/en) report generation.
 */

export type Lang = "zh" | "en";

/** Get a bilingual string by language key. */
function t(zh: string, en: string): Record<Lang, string> {
  return { zh, en };
}

// ---------------------------------------------------------------------------
// Status & error messages (used in index.ts)
// ---------------------------------------------------------------------------

export const MSG = {
  noActivity: t("过去24小时无活动。", "No activity in the last 24 hours."),
  summaryFailed: t("⚠️ 摘要生成失败。", "⚠️ Summary generation failed."),
  trendingNoData: t(
    "⚠️ 今日趋势数据获取失败，无法生成报告。",
    "⚠️ Trending data unavailable, unable to generate report.",
  ),
  trendingFailed: t("⚠️ 趋势报告生成失败。", "⚠️ Trending report generation failed."),
  comparisonFailed: t("⚠️ 横向对比生成失败。", "⚠️ Comparative analysis generation failed."),
} as const;

// ---------------------------------------------------------------------------
// Group reports — the four daily directions (used in index.ts, prompts.ts,
// report-builders.ts, report-savers.ts). Keyed by RadarGroup id.
// ---------------------------------------------------------------------------

const groupMeta = (utcStr: string, count: number, lang: Lang) =>
  lang === "en"
    ? `> Generated: ${utcStr} UTC | Projects covered: ${count}\n\n`
    : `> 生成时间: ${utcStr} UTC | 覆盖项目: ${count} 个\n\n`;

export interface GroupReportI18n {
  /** H1 title of the report file. */
  title: Record<Lang, string>;
  /** "> 生成时间 …" metadata line. */
  meta: (utcStr: string, count: number, lang: Lang) => string;
  /** Heading of the cross-project comparison section. */
  comparison: Record<Lang, string>;
  /** Heading of the per-project detail section. */
  detail: Record<Lang, string>;
  /** Issue label used when DIGEST_REPO is configured. */
  issueLabel: Record<Lang, string>;
  /** Issue title when DIGEST_REPO is configured. */
  issueTitle: (dateStr: string, lang: Lang) => string;
  /** Short label for notifications (WeCom / Telegram / Feishu links). */
  short: Record<Lang, string>;
  /** Prompt persona: who writes, and who reads. */
  persona: Record<Lang, string>;
  /** Prompt focus: what to look for and summarize. */
  focus: Record<Lang, string>;
}

export const GROUP_REPORTS: Record<string, GroupReportI18n> = {
  "ai-hot-agents": {
    title: t("热门智能体动态日报", "Hot AI Agents Digest"),
    meta: groupMeta,
    comparison: t("横向对比", "Cross-Project Comparison"),
    detail: t("各项目详细报告", "Per-Project Reports"),
    issueLabel: t("hot-agents", "hot-agents-en"),
    issueTitle: (d, lang) => (lang === "en" ? `🤖 Hot AI Agents Digest ${d}` : `🤖 热门智能体动态日报 ${d}`),
    short: t("热门智能体", "Hot Agents"),
    persona: t(
      "你是一位关注 AI 智能体生态的行业观察员。读者是不写代码的内容、产品、运营同事。",
      "You are an industry observer watching the AI agent ecosystem. Your readers work in content, product and operations — they do not write code.",
    ),
    focus: t(
      "智能体框架、个人 AI 助理、桌面端 agent 产品的最新动态：谁发布了新版本、上线了什么能力、社区在讨论什么、出现了哪些新用法和新玩法。",
      "The latest in agent frameworks, personal AI assistants and desktop agent products: who shipped a new release, what new capabilities landed, what the community is discussing, and which new use cases are emerging.",
    ),
  },
  "ai-creator": {
    title: t("创作者 AI 赋能日报", "Creator AI Digest"),
    meta: groupMeta,
    comparison: t("横向对比", "Cross-Project Comparison"),
    detail: t("各项目详细报告", "Per-Project Reports"),
    issueLabel: t("creator", "creator-en"),
    issueTitle: (d, lang) => (lang === "en" ? `🎬 Creator AI Digest ${d}` : `🎬 创作者 AI 赋能日报 ${d}`),
    short: t("博主赋能", "Creator AI"),
    persona: t(
      "你是一位关注创作者经济的 AI 工具观察员。读者是自媒体博主和新媒体运营，不写代码。",
      "You are an AI-tools observer covering the creator economy. Your readers are bloggers and social-media operators — they do not write code.",
    ),
    focus: t(
      "给博主、短视频和新媒体创作者的 AI 工具：视频生成与剪辑、数字人与口播、配音翻译、自动分发、选题与文案助手。读者关心「能不能直接用来做内容」。",
      "AI tools for bloggers, short-video and social-media creators: video generation and editing, digital humans and talking avatars, dubbing and translation, auto-publishing, and topic/script assistants. Readers care about whether they can use it for real content production.",
    ),
  },
  "ai-office": {
    title: t("AI 办公效率日报", "AI Office Digest"),
    meta: groupMeta,
    comparison: t("横向对比", "Cross-Project Comparison"),
    detail: t("各项目详细报告", "Per-Project Reports"),
    issueLabel: t("office", "office-en"),
    issueTitle: (d, lang) => (lang === "en" ? `💼 AI Office Digest ${d}` : `💼 AI 办公效率日报 ${d}`),
    short: t("办公 AI", "Office AI"),
    persona: t(
      "你是一位关注办公效率与自动化的 AI 观察员。读者是行政、运营和知识工作者，不写代码。",
      "You are an AI observer covering office productivity and automation. Your readers are admin, operations and knowledge workers — they do not write code.",
    ),
    focus: t(
      "日常办公提效的 AI 工具与平台：文档、表格、演示文稿、自动化工作流、知识管理、企业内部应用搭建。读者关心「能不能直接用在日常工作中」。",
      "AI tools and platforms for everyday office work: documents, spreadsheets, presentations, automation workflows, knowledge management and internal tool building. Readers care about whether they can use it in daily work.",
    ),
  },
  "ai-aigc": {
    title: t("AIGC 生成内容日报", "AIGC Digest"),
    meta: groupMeta,
    comparison: t("横向对比", "Cross-Project Comparison"),
    detail: t("各项目详细报告", "Per-Project Reports"),
    issueLabel: t("aigc", "aigc-en"),
    issueTitle: (d, lang) => (lang === "en" ? `🎨 AIGC Digest ${d}` : `🎨 AIGC 生成内容日报 ${d}`),
    short: t("AIGC", "AIGC"),
    persona: t(
      "你是一位关注生成式内容技术的 AI 观察员。读者是内容创作者和业务同事，不写代码。",
      "You are an AI observer covering generative content technology. Your readers are content creators and business teams — they do not write code.",
    ),
    focus: t(
      "图像、视频、音频、语音生成模型与创作工具的最新进展：新模型发布、能力升级、创作玩法、可落地的产出。",
      "The latest in image, video, audio and speech generation models and creative tools: new model releases, capability upgrades, creative playbooks and production-ready outputs.",
    ),
  },
};

// ---------------------------------------------------------------------------
// Data-source reports (used in report-builders.ts via prompts-data.ts)
// ---------------------------------------------------------------------------

export const WEB_REPORT = {
  title: t("AI 官方内容追踪报告", "Official AI Content Report"),
  firstCrawl: t("首次全量", "First full crawl"),
  todayUpdate: t("今日更新", "Today's update"),
  newContent: (count: number, lang: Lang) =>
    lang === "en" ? `New content: ${count} articles` : `新增内容: ${count} 篇`,
  generated: (utcStr: string, lang: Lang) =>
    lang === "en" ? `Generated: ${utcStr} UTC` : `生成时间: ${utcStr} UTC`,
  sourcesHeader: t("数据来源:", "Sources:"),
  issueTitle: (dateStr: string, isFirstRun: boolean, lang: Lang) =>
    lang === "en"
      ? `🌐 Official AI Content Report ${dateStr}${isFirstRun ? " (First Crawl)" : ""}`
      : `🌐 AI 官方内容追踪报告 ${dateStr}${isFirstRun ? "（首次全量）" : ""}`,
} as const;

export const TRENDING_REPORT = {
  title: t("AI 开源趋势日报", "AI Open Source Trends"),
  sources: t("数据来源: GitHub Trending + GitHub Search API", "Sources: GitHub Trending + GitHub Search API"),
  issueTitle: (dateStr: string, lang: Lang) =>
    lang === "en" ? `📈 AI Open Source Trends ${dateStr}` : `📈 AI 开源趋势日报 ${dateStr}`,
} as const;

export const PH_REPORT = {
  title: t("Product Hunt AI 产品日报", "Product Hunt AI Products Digest"),
  issueTitle: (dateStr: string, lang: Lang) =>
    lang === "en" ? `🚀 Product Hunt AI Digest ${dateStr}` : `🚀 Product Hunt AI 产品日报 ${dateStr}`,
} as const;

// Labels still used when creating digest issues (only when DIGEST_REPO is set).
export const ISSUE_LABELS = {
  web: t("web", "web-en"),
  trending: t("trending", "trending-en"),
  ph: t("ph", "ph-en"),
} as const;

// ---------------------------------------------------------------------------
// Footer (used in report.ts)
// ---------------------------------------------------------------------------

export const FOOTER = {
  autoGen: t("本日报由", "This digest is auto-generated by"),
} as const;

// ---------------------------------------------------------------------------
// Report labels for manifest/RSS (used in generate-manifest.ts) and
// notification labels (used in notify.ts / wecom.ts / feishu.ts).
// ---------------------------------------------------------------------------

export const REPORT_LABELS: Record<string, string> = {
  "ai-hot-agents": "热门智能体动态日报",
  "ai-hot-agents-en": "Hot AI Agents Digest",
  "ai-creator": "创作者 AI 赋能日报",
  "ai-creator-en": "Creator AI Digest",
  "ai-office": "AI 办公效率日报",
  "ai-office-en": "AI Office Digest",
  "ai-aigc": "AIGC 生成内容日报",
  "ai-aigc-en": "AIGC Digest",
  "ai-web": "AI 官方内容追踪报告",
  "ai-web-en": "Official AI Content Report",
  "ai-trending": "AI 开源趋势日报",
  "ai-trending-en": "AI Open Source Trends",
  "ai-ph": "Product Hunt AI 产品日报",
  "ai-ph-en": "Product Hunt AI Products Digest",
  // Discontinued report types and rollups are no longer generated; kept so
  // archived reports still render a proper title in the sidebar and RSS feed.
  "ai-cli": "AI CLI 工具社区动态日报",
  "ai-cli-en": "AI CLI Tools Digest",
  "ai-agents": "AI Agents 生态日报",
  "ai-agents-en": "AI Agents Ecosystem Digest",
  "ai-infra": "AI 基础设施日报",
  "ai-infra-en": "AI Infrastructure Digest",
  "ai-hn": "Hacker News AI 社区动态日报",
  "ai-hn-en": "Hacker News AI Community Digest",
  "ai-arxiv": "ArXiv AI 研究日报",
  "ai-arxiv-en": "ArXiv AI Research Digest",
  "ai-hf": "Hugging Face 热门模型周报",
  "ai-hf-en": "Hugging Face Trending Models Weekly",
  "ai-community": "技术社区 AI 动态日报",
  "ai-community-en": "Tech Community AI Digest",
  "ai-weekly": "AI 工具生态周报",
  "ai-weekly-en": "AI Tools Weekly Digest",
  "ai-monthly": "AI 工具生态月报",
  "ai-monthly-en": "AI Tools Monthly Digest",
};

export const NOTIFY_LABELS: Record<string, Record<Lang, string>> = {
  "ai-hot-agents": t("热门智能体", "Hot Agents"),
  "ai-creator": t("博主赋能", "Creator AI"),
  "ai-office": t("办公 AI", "Office AI"),
  "ai-aigc": t("AIGC", "AIGC"),
  "ai-web": t("官网动态", "Official Updates"),
  "ai-trending": t("GitHub 趋势", "GitHub Trends"),
  "ai-ph": t("Product Hunt", "Product Hunt"),
  // Discontinued report types — kept so old links and archived pages still
  // resolve to a readable label.
  "ai-cli": t("AI CLI 工具", "AI CLI Tools"),
  "ai-agents": t("AI Agents 生态", "AI Agents Ecosystem"),
  "ai-infra": t("AI 基础设施", "AI Infrastructure"),
  "ai-hn": t("HN 社区动态", "HN Community"),
  "ai-arxiv": t("ArXiv 研究", "ArXiv Research"),
  "ai-hf": t("HF 模型", "HF Models"),
  "ai-community": t("技术社区", "Tech Community"),
};
