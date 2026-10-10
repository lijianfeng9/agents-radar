/**
 * WeCom (企业微信) group robot notification — reads the latest digest from
 * manifest.json and sends a highlights text message plus a news-card message
 * whose articles link straight to the original sources. Each article's cover
 * is the source page's og:image (WeCom draws a gray placeholder without it).
 * Skips silently if WECOM_WEBHOOK_URLS is not set.
 *
 * Required env vars:
 *   WECOM_WEBHOOK_URLS — comma-separated list of group robot webhook URLs
 * Optional:
 *   PAGES_URL          — GitHub Pages base URL (defaults to the public deployment)
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { DailyNewsFile } from "./report-savers.ts";

const PAGES_URL_DEFAULT = "https://duanyytop.github.io/agents-radar";

// WeCom rejects markdown content over 4096 bytes (UTF-8), so stay under it.
const WECOM_MAX_BYTES = 4000;
/** A news message carries at most 8 articles. */
const WECOM_MAX_CARDS = 8;
// Article field limits from the WeCom group-robot docs: title 128 bytes,
// description 512 bytes. An oversized field makes WeCom reject the message.
const CARD_TITLE_BYTES = 128;
const CARD_DESC_BYTES = 512;

const OG_TIMEOUT_MS = 8_000;
// Covers are declared in the <head>; 300KB is far beyond what that needs and
// keeps a pathological page from ballooning memory.
const OG_MAX_HTML_BYTES = 300_000;
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface WecomCard {
  title: string;
  description: string;
  url: string;
  /** Cover image; WeCom renders a gray placeholder card when this is missing. */
  picurl?: string;
}

function getWebhookUrls(): string[] {
  const raw = process.env["WECOM_WEBHOOK_URLS"] ?? "";
  return raw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

function byteLength(s: string): number {
  return Buffer.byteLength(s, "utf-8");
}

/** Truncate on character boundaries without splitting a multi-byte glyph. */
function byteSlice(s: string, maxBytes: number): string {
  if (byteLength(s) <= maxBytes) return s;
  let out = "";
  for (const ch of s) {
    if (byteLength(out + ch) > maxBytes) break;
    out += ch;
  }
  return out;
}

export async function sendToOneWebhook(webhookUrl: string, payload: unknown): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // WeCom answers HTTP 200 even on failure — only the errcode in the body tells.
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`WeCom API HTTP ${res.status}: ${body}`);
  }
  let errcode: number;
  try {
    errcode = (JSON.parse(body) as { errcode?: number }).errcode ?? -1;
  } catch {
    throw new Error(`WeCom API returned a non-JSON body: ${body}`);
  }
  if (errcode !== 0) {
    throw new Error(`WeCom API errcode ${errcode}: ${body}`);
  }
}

/** Push one payload to every webhook; returns how many webhooks failed. */
async function postToAllWebhooks(payload: unknown, label: string): Promise<number> {
  const urls = getWebhookUrls();
  const results = await Promise.allSettled(urls.map((url) => sendToOneWebhook(url, payload)));
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length) {
    const msgs = failures.map((r) => (r as PromiseRejectedResult).reason);
    console.error(`[wecom] ${label}: ${failures.length}/${urls.length} webhook(s) failed:`, msgs);
  }
  return failures.length;
}

/**
 * The highlights text: header, the day's 速览 bullets, and links to the full
 * report. Bullets are dropped from the tail until the message fits — the
 * report link is never trimmed.
 */
export function buildWecomText(date: string, news: DailyNewsFile | null, pagesUrl?: string): string {
  const base = (pagesUrl ?? process.env["PAGES_URL"] ?? PAGES_URL_DEFAULT).replace(/\/$/, "");
  const reportUrl = `${base}/#${date}/ai-news`;
  const header = `📡 **AI 每日要闻 · ${date}**`;
  const footer = `[📖 完整日报](${reportUrl})  ·  [🌐 日报网站](${base})`;

  const bullets = [...(news?.summary ?? [])];
  const render = (): string =>
    [header, ...(bullets.length ? ["**今日速览**", ...bullets.map((b) => `◦ ${b}`)] : []), footer].join(
      "\n\n",
    );

  let content = render();
  while (byteLength(content) > WECOM_MAX_BYTES && bullets.length) {
    bullets.pop();
    content = render();
  }
  return content;
}

export function buildWecomCards(news: DailyNewsFile | null): WecomCard[] {
  return (news?.cards ?? []).slice(0, WECOM_MAX_CARDS).map((c) => ({
    title: byteSlice(c.title, CARD_TITLE_BYTES),
    description: byteSlice(c.description, CARD_DESC_BYTES),
    url: c.url,
    ...(c.image ? { picurl: c.image } : {}),
  }));
}

const META_TAG_RE = /<meta\s[^>]*>/gi;
const ATTR_RE = /([a-zA-Z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

/** Pick the page's cover image from its og:image / twitter:image meta tags. */
export function extractOgImage(html: string): string | undefined {
  const found: Record<string, string> = {};
  for (const tag of html.match(META_TAG_RE) ?? []) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(ATTR_RE)) {
      attrs[m[1]!.toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
    }
    const key = (attrs["property"] ?? attrs["name"] ?? "").toLowerCase();
    const value = attrs["content"];
    if (value && (key === "og:image" || key === "og:image:secure_url" || key === "twitter:image")) {
      found[key] ??= value;
    }
  }
  return found["og:image"] ?? found["og:image:secure_url"] ?? found["twitter:image"];
}

/** Read at most maxBytes of a response body, decoded as UTF-8. */
async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder("utf-8");
  let out = "";
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    out += decoder.decode(value, { stream: true });
    if (total >= maxBytes) {
      await reader.cancel().catch(() => {});
      break;
    }
  }
  return out + decoder.decode();
}

/** Fetch a page and return its absolute og:image URL; undefined on any failure. */
export async function fetchOgImage(pageUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(pageUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(OG_TIMEOUT_MS),
      headers: { "User-Agent": BROWSER_UA, Accept: "text/html,application/xhtml+xml" },
    });
    if (!res.ok) return undefined;
    if (!(res.headers.get("content-type") ?? "").includes("html")) return undefined;
    const raw = extractOgImage(await readCapped(res, OG_MAX_HTML_BYTES));
    if (!raw) return undefined;
    const url = new URL(raw, res.url || pageUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Attach each article's cover so WeCom cards show an image instead of gray. */
export async function attachCardImages(cards: WecomCard[]): Promise<void> {
  await Promise.all(
    cards.map(async (card) => {
      if (card.picurl) return;
      const picurl = await fetchOgImage(card.url);
      if (picurl) card.picurl = picurl;
    }),
  );
}

async function main(): Promise<void> {
  const urls = getWebhookUrls();
  if (!urls.length) {
    console.log("[wecom] WECOM_WEBHOOK_URLS not set — skipping.");
    return;
  }

  if (!fs.existsSync("manifest.json")) {
    console.log("[wecom] manifest.json not found — skipping.");
    return;
  }

  const { dates } = JSON.parse(fs.readFileSync("manifest.json", "utf-8")) as {
    dates: { date: string; reports: string[] }[];
  };

  const latest = dates?.[0];
  if (!latest) {
    console.log("[wecom] manifest is empty — skipping.");
    return;
  }
  const { date } = latest;

  let news: DailyNewsFile | null = null;
  const newsPath = path.join("digests", date, "news.json");
  if (fs.existsSync(newsPath)) {
    try {
      news = JSON.parse(fs.readFileSync(newsPath, "utf-8")) as DailyNewsFile;
    } catch {
      console.log("[wecom] Failed to parse news.json — sending without highlights.");
    }
  }

  const text = buildWecomText(date, news);
  console.log(`[wecom] Sending highlights text for ${date} (${byteLength(text)} bytes)…`);
  const textFailures = await postToAllWebhooks({ msgtype: "markdown", markdown: { content: text } }, "text");

  let cardFailures = 0;
  const cards = buildWecomCards(news);
  if (cards.length) {
    await attachCardImages(cards);
    const withImage = cards.filter((c) => c.picurl).length;
    console.log(`[wecom] Sending ${cards.length} news card(s) (${withImage} with cover image)…`);
    cardFailures = await postToAllWebhooks({ msgtype: "news", news: { articles: cards } }, "cards");
  }

  // Either message carrying the day's content is enough to count as delivered.
  if (textFailures >= urls.length && (!cards.length || cardFailures >= urls.length)) {
    throw new Error("All WeCom webhooks failed for both text and cards");
  }
  console.log("[wecom] Done!");
}

// Only auto-send when run directly (`tsx src/wecom.ts`). Guard prevents an
// accidental send when another module imports from here.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e: unknown) => {
    console.error("[wecom]", e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
