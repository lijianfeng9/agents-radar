/**
 * Daily news saver — validates the LLM output against the actually fetched
 * data, renders the markdown report, writes ai-news.md / news.json /
 * highlights.json, and optionally opens a GitHub issue (DIGEST_REPO only).
 */

import { NEWS_REPORT } from "./i18n.ts";
import { buildDailyNewsMarkdown, type TrendingHighlight } from "./report-builders.ts";
import {
  NEWS_SECTION_IDS,
  type DailyNews,
  type DailyNewsCard,
  type DailyNewsItem,
  type DailyNewsSections,
} from "./prompts-data.ts";
import { saveFile, autoGenFooter } from "./report.ts";
import { createGitHubIssue } from "./github.ts";
import type { NewsItem } from "./news.ts";
import type { TrendingData } from "./trending.ts";

/** Shape of digests/<date>/news.json — also consumed by the WeCom push. */
export interface DailyNewsFile {
  date: string;
  generated: string;
  sources: string[];
  /** News items that went into the prompt (before the LLM's selection). */
  fetchedCount: number;
  summary: string[];
  sections: DailyNewsSections;
  trending: TrendingHighlight[];
  cards: DailyNewsCard[];
}

const MAX_CARDS = 8;
const MAX_SUMMARY_BULLETS = 6;

export interface SaveDailyNewsCtx {
  dateStr: string;
  utcStr: string;
  sourceNames: string[];
  newsItems: NewsItem[];
  trendingData: TrendingData;
  digestRepo: string;
}

// ---------------------------------------------------------------------------
// Validation — the model may return anything; only clickable truth ships.
// ---------------------------------------------------------------------------

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function cleanItems(raw: unknown, allowedUrls: Set<string>): DailyNewsItem[] {
  if (!Array.isArray(raw)) return [];
  const out: DailyNewsItem[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    const e = (entry ?? {}) as Record<string, unknown>;
    const title = asString(e["title"]);
    const url = asString(e["url"]);
    // A fabricated URL would 404 on click — only links from the input ship.
    if (!title || !url || !allowedUrls.has(url) || seen.has(url)) continue;
    seen.add(url);
    out.push({ title, summary: asString(e["summary"]), url });
  }
  return out;
}

function cleanCards(raw: unknown, allowedUrls: Set<string>): DailyNewsCard[] {
  if (!Array.isArray(raw)) return [];
  const out: DailyNewsCard[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    const e = (entry ?? {}) as Record<string, unknown>;
    const title = asString(e["title"]);
    const url = asString(e["url"]);
    if (!title || !url || !allowedUrls.has(url) || seen.has(url)) continue;
    seen.add(url);
    out.push({ title, description: asString(e["description"]), url });
  }
  return out.slice(0, MAX_CARDS);
}

export function normalizeDailyNews(raw: unknown, allowedUrls: Set<string>): DailyNews {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const rawSections = (obj["sections"] ?? {}) as Record<string, unknown>;

  const sections = {} as DailyNewsSections;
  for (const id of NEWS_SECTION_IDS) sections[id] = cleanItems(rawSections[id], allowedUrls);

  const summary = Array.isArray(obj["summary"])
    ? obj["summary"].map(asString).filter(Boolean).slice(0, MAX_SUMMARY_BULLETS)
    : [];

  const trendingPicks = Array.isArray(obj["trending"])
    ? obj["trending"]
        .map((entry) => {
          const e = (entry ?? {}) as Record<string, unknown>;
          const repo = asString(e["repo"])
            .replace(/^https?:\/\/github\.com\//, "")
            .replace(/\/$/, "");
          return repo ? { repo, summary: asString(e["summary"]) } : null;
        })
        .filter((p): p is { repo: string; summary: string } => p !== null)
    : [];

  return { summary, sections, trendingPicks, cards: cleanCards(obj["cards"], allowedUrls) };
}

// ---------------------------------------------------------------------------
// Trending rows — stars come from fetched data, never from the model.
// ---------------------------------------------------------------------------

export function buildTrendingRows(
  picks: DailyNews["trendingPicks"],
  data: TrendingData,
): TrendingHighlight[] {
  const index = new Map<string, TrendingHighlight>();
  for (const r of data.trendingRepos) {
    index.set(r.fullName, {
      repo: r.fullName,
      url: r.url,
      stars: `${r.totalStars.toLocaleString()}${
        r.todayStars > 0 ? `（今日 +${r.todayStars.toLocaleString()}）` : ""
      }`,
      summary: r.description,
    });
  }
  for (const r of data.searchRepos) {
    if (!index.has(r.fullName)) {
      index.set(r.fullName, {
        repo: r.fullName,
        url: r.url,
        stars: r.stargazersCount.toLocaleString(),
        summary: r.description ?? "",
      });
    }
  }

  const rows: TrendingHighlight[] = [];
  const seen = new Set<string>();
  for (const { repo, summary } of picks) {
    const row = index.get(repo);
    if (!row || seen.has(repo) || rows.length >= MAX_CARDS) continue;
    seen.add(repo);
    rows.push(summary ? { ...row, summary } : row);
  }
  return rows;
}

/** Cards the model failed to produce: spread the top section items evenly. */
function fallbackCards(news: DailyNews): DailyNewsCard[] {
  const out: DailyNewsCard[] = [];
  for (let i = 0; ; i++) {
    let added = false;
    for (const id of NEWS_SECTION_IDS) {
      const item = news.sections[id][i];
      if (!item) continue;
      out.push({ title: item.title, description: item.summary, url: item.url });
      added = true;
      if (out.length >= MAX_CARDS) return out;
    }
    if (!added) return out;
  }
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

export async function saveDailyNews(raw: unknown, ctx: SaveDailyNewsCtx): Promise<DailyNewsFile> {
  const allowedUrls = new Set<string>();
  for (const item of ctx.newsItems) allowedUrls.add(item.link);
  for (const r of [...ctx.trendingData.trendingRepos, ...ctx.trendingData.searchRepos])
    allowedUrls.add(r.url);

  const news = normalizeDailyNews(raw, allowedUrls);
  const trending = buildTrendingRows(news.trendingPicks, ctx.trendingData);
  const cards = news.cards.length ? news.cards : fallbackCards(news);

  const itemCount = NEWS_SECTION_IDS.reduce((n, id) => n + news.sections[id].length, 0);
  if (itemCount === 0 && trending.length === 0) {
    throw new Error(
      "The LLM digest contains no usable entries — aborting instead of publishing an empty report.",
    );
  }

  const file: DailyNewsFile = {
    date: ctx.dateStr,
    generated: ctx.utcStr,
    sources: ctx.sourceNames,
    fetchedCount: ctx.newsItems.length,
    summary: news.summary,
    sections: news.sections,
    trending,
    cards,
  };

  const markdown = buildDailyNewsMarkdown({
    dateStr: ctx.dateStr,
    utcStr: ctx.utcStr,
    sourceNames: ctx.sourceNames,
    fetchedCount: ctx.newsItems.length,
    summary: news.summary,
    sections: news.sections,
    trending,
    footer: autoGenFooter("zh"),
  });

  console.log(`  Saved ${saveFile(markdown, ctx.dateStr, "ai-news.md")}`);
  console.log(`  Saved ${saveFile(JSON.stringify(file, null, 2), ctx.dateStr, "news.json")}`);

  // Kept for the Telegram / Feishu notifiers, which read highlights.json.
  const highlights = { zh: { "ai-news": news.summary }, en: {} };
  console.log(`  Saved ${saveFile(JSON.stringify(highlights, null, 2), ctx.dateStr, "highlights.json")}`);

  if (ctx.digestRepo) {
    const url = await createGitHubIssue(
      NEWS_REPORT.issueTitle(ctx.dateStr),
      markdown,
      NEWS_REPORT.issueLabel,
    );
    console.log(`  Created issue: ${url}`);
  }

  return file;
}
