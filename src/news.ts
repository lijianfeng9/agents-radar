/**
 * Chinese tech-media RSS/Atom fetching for the daily news digest.
 *
 * A run pulls the last ~26 hours from every configured source, drops roundup
 * entries — early-bird digests (早报/晨报) and weekly recaps link to a list of
 * headlines instead of an article body, so a reader who clicks through lands
 * on a page of titles — merges near-duplicate stories reported by several
 * outlets, and caps the volume handed to the LLM prompt.
 */

export interface NewsSource {
  id: string;
  name: string;
  url: string;
}

export interface NewsItem {
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  published: Date;
  excerpt: string;
  /** Lead image from the feed entry, when the source provides one. */
  image?: string;
}

/** Per-source outcome, logged after each run. */
export interface NewsSourceStat {
  id: string;
  name: string;
  /** In-window, non-roundup entries the feed offered. */
  fetched: number;
  /** Entries selected for the prompt (after cap and dedup). */
  kept: number;
  ok: boolean;
}

export interface NewsFetchResult {
  items: NewsItem[];
  stats: NewsSourceStat[];
}

/** Slightly wider than 24 h so a run dispatched a couple of hours late still
 *  covers everything its predecessor missed. */
export const NEWS_WINDOW_MS = 26 * 60 * 60 * 1000;
export const MAX_ITEMS_PER_SOURCE = 15;
export const MAX_ITEMS_TOTAL = 70;
const FETCH_TIMEOUT_MS = 20_000;
const EXCERPT_CHARS = 300;

// ---------------------------------------------------------------------------
// Roundup detection
// ---------------------------------------------------------------------------

/**
 * Early-bird digests, weekly recaps and headline roundups. Their feed entry
 * looks like a normal article but the link opens a headline list.
 */
const ROUNDUP_TITLE_RE = /早报|晨报|晚报|周报|月报|盘点|汇总|速览|要闻|合集|集锦/;
/** 雷峰网的早报系列 has no title keyword; the column path identifies it. */
const ROUNDUP_URL_RE = /\/zaobao\//;

export function isRoundup(item: Pick<NewsItem, "title" | "link">): boolean {
  return ROUNDUP_TITLE_RE.test(item.title) || ROUNDUP_URL_RE.test(item.link);
}

// ---------------------------------------------------------------------------
// HTML / entity cleanup
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  middot: "·",
  bull: "•",
  laquo: "«",
  raquo: "»",
  times: "×",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
  plusmn: "±",
  permil: "‰",
  euro: "€",
  pound: "£",
  yen: "¥",
};

function codePointToChar(n: number): string {
  return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : " ";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => codePointToChar(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => codePointToChar(Number(dec)))
    .replace(/&([a-z][a-z0-9]*);/gi, (_, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? " ");
}

/**
 * Strip markup down to plain text. HTML inside a feed is sometimes
 * entity-escaped (`&lt;p&gt;`), so entities are decoded between two tag-strip
 * passes.
 */
export function stripHtml(raw: string): string {
  let s = raw.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");
  s = s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ");
  s = decodeEntities(s);
  s = s.replace(/<[^>]*>/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

/** Title cleanup: stripHtml plus emoji shortcodes (oschina uses ":fire:"). */
function cleanTitle(raw: string): string {
  return stripHtml(raw)
    .replace(/:[a-z0-9_+-]+:/g, "")
    .trim();
}

// ---------------------------------------------------------------------------
// Feed parsing (RSS 2.0 + Atom)
// ---------------------------------------------------------------------------

const ITEM_RE = /<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

function tag(block: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, "i"));
  return m?.[1] ?? "";
}

function tagAny(block: string, names: string[]): string {
  for (const name of names) {
    const v = tag(block, name);
    if (v) return v;
  }
  return "";
}

function extractLink(block: string): string {
  const atom =
    block.match(/<link\b[^>]*\brel="alternate"[^>]*\bhref="([^"]+)"/i) ??
    block.match(/<link\b[^>]*\bhref="([^"]+)"[^>]*>/i);
  if (atom?.[1]) return atom[1].trim();
  const rss = block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
  return rss?.[1] ? stripHtml(rss[1]) : "";
}

/** Drop analytics/tracking query params (ifanr appends utm_* to every link). */
function stripTracking(link: string): string {
  try {
    const u = new URL(link);
    for (const key of [...u.searchParams.keys()]) {
      if (key.startsWith("utm_")) u.searchParams.delete(key);
    }
    return u.toString();
  } catch {
    return link;
  }
}

function parseDate(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Lead image for the feed entry: first <img src> inside the content HTML
 * (leiphone / tmtpost / ifanr / appinn embed real covers there), falling back
 * to enclosure / media:* elements. The URL survives cleanup for the WeCom
 * card cover; a source without images simply yields undefined.
 */
function extractImage(block: string): string | undefined {
  const content = tagAny(block, ["content:encoded", "content", "description", "summary"]);
  const html = decodeEntities(content);
  const fromHtml = html.match(/<img\b[^>]*\bsrc="([^"]+)"/i);
  const media =
    block.match(/<media:(?:thumbnail|content)\b[^>]*\burl="([^"]+)"/i) ??
    block.match(/<enclosure\b[^>]*\burl="([^"]+)"/i);
  let src = decodeEntities(fromHtml?.[1] ?? media?.[1] ?? "").trim();
  if (src.startsWith("//")) src = `https:${src}`;
  return /^https?:\/\//i.test(src) ? src : undefined;
}

export function parseFeed(xml: string, source: NewsSource): NewsItem[] {
  const items: NewsItem[] = [];
  for (const m of xml.matchAll(ITEM_RE)) {
    const block = m[2] ?? "";
    const title = cleanTitle(tag(block, "title"));
    const link = stripTracking(extractLink(block));
    const published = parseDate(
      tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || tag(block, "dc:date"),
    );
    if (!title || !link || !published) continue;
    const excerpt = stripHtml(tagAny(block, ["content:encoded", "content", "description", "summary"])).slice(
      0,
      EXCERPT_CHARS,
    );
    const image = extractImage(block);
    items.push({ sourceId: source.id, sourceName: source.name, title, link, published, excerpt, image });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Cross-source dedup
// ---------------------------------------------------------------------------

const DUP_THRESHOLD = 0.6;

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

function bigrams(s: string): Set<string> {
  const out = new Set<string>();
  if (s.length <= 2) {
    if (s) out.add(s);
    return out;
  }
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const g of a) if (b.has(g)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Merge near-duplicate stories across outlets. Sources arrive in configured
 * priority order; within a duplicate cluster the copy with the longest excerpt
 * wins — media with the fullest text make the better prompt material.
 */
export function dedupItems(items: NewsItem[]): NewsItem[] {
  const kept: Array<{ item: NewsItem; grams: Set<string> }> = [];
  const out: NewsItem[] = [];
  for (const item of items) {
    const norm = normalizeTitle(item.title);
    if (!norm) {
      out.push(item);
      continue;
    }
    const grams = bigrams(norm);
    const dup = kept.find((k) => jaccard(k.grams, grams) >= DUP_THRESHOLD);
    if (!dup) {
      kept.push({ item, grams });
      out.push(item);
    } else if (item.excerpt.length > dup.item.excerpt.length) {
      const idx = out.indexOf(dup.item);
      if (idx >= 0) out[idx] = item;
      dup.item = item;
      dup.grams = grams;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Selection pipeline
// ---------------------------------------------------------------------------

interface SourceItems {
  source: NewsSource;
  items: NewsItem[];
}

/**
 * Window filter → roundup filter → per-source cap → cross-source dedup →
 * global cap. Returns the prompt-ready items plus per-source stats.
 */
export function selectItems(
  perSource: SourceItems[],
  now: Date,
): { items: NewsItem[]; stats: Omit<NewsSourceStat, "ok">[] } {
  const cutoff = now.getTime() - NEWS_WINDOW_MS;
  // Future-dated entries would sit at the top of tomorrow's list forever.
  const horizon = now.getTime() + 2 * 60 * 60 * 1000;

  const picked: NewsItem[] = [];
  const stats: Omit<NewsSourceStat, "ok">[] = [];
  for (const { source, items } of perSource) {
    const fresh = items
      .filter((it) => it.published.getTime() >= cutoff && it.published.getTime() <= horizon)
      .filter((it) => !isRoundup(it))
      .sort((a, b) => b.published.getTime() - a.published.getTime());
    const capped = fresh.slice(0, MAX_ITEMS_PER_SOURCE);
    picked.push(...capped);
    stats.push({ id: source.id, name: source.name, fetched: fresh.length, kept: capped.length });
  }

  const items = dedupItems(picked)
    .sort((a, b) => b.published.getTime() - a.published.getTime())
    .slice(0, MAX_ITEMS_TOTAL);
  return { items, stats };
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

async function fetchFeed(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; agents-radar/1.0)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export async function fetchAllNews(sources: NewsSource[], now = new Date()): Promise<NewsFetchResult> {
  const fetched = await Promise.all(
    sources.map(async (source) => {
      try {
        const xml = await fetchFeed(source.url);
        const items = parseFeed(xml, source);
        console.log(`  [news] ${source.name}: parsed ${items.length} entries`);
        return { source, items, ok: true };
      } catch (err) {
        console.error(`  [news] ${source.name}: fetch failed — ${err}`);
        return { source, items: [] as NewsItem[], ok: false };
      }
    }),
  );

  if (fetched.every((f) => !f.ok)) {
    throw new Error("Every news source failed to fetch — nothing to summarize.");
  }

  const { items, stats } = selectItems(fetched, now);
  const okById = new Map(fetched.map((f) => [f.source.id, f.ok]));
  return { items, stats: stats.map((s) => ({ ...s, ok: okById.get(s.id) ?? false })) };
}
