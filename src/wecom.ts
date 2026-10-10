/**
 * WeCom (企业微信) group robot notification — reads manifest.json and sends a
 * markdown message with links to the latest reports. Skips silently if
 * WECOM_WEBHOOK_URLS is not set.
 *
 * Required env vars:
 *   WECOM_WEBHOOK_URLS — comma-separated list of group robot webhook URLs
 * Optional:
 *   PAGES_URL          — GitHub Pages base URL (defaults to the public deployment)
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { NOTIFY_LABELS } from "./i18n.ts";
import type { Highlights } from "./notify.ts";

const PAGES_URL_DEFAULT = "https://duanyytop.github.io/agents-radar";

// WeCom rejects markdown content over 4096 bytes (UTF-8), so stay under it.
const WECOM_MAX_BYTES = 4000;

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

export async function sendToOneWebhook(webhookUrl: string, content: string): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msgtype: "markdown", markdown: { content } }),
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

async function sendWecom(content: string): Promise<void> {
  const urls = getWebhookUrls();
  const results = await Promise.allSettled(urls.map((url) => sendToOneWebhook(url, content)));
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length) {
    const msgs = failures.map((r) => (r as PromiseRejectedResult).reason);
    console.error(`[wecom] ${failures.length}/${urls.length} webhook(s) failed:`, msgs);
    if (failures.length === urls.length) throw new Error("All WeCom webhooks failed");
  }
}

export function buildWecomMessage(
  date: string,
  reports: string[],
  pagesUrl?: string,
  highlights?: Highlights | null,
): string {
  const PAGES_URL = (pagesUrl ?? process.env["PAGES_URL"] ?? PAGES_URL_DEFAULT).replace(/\/$/, "");
  const ordered = reports.filter((r) => !r.endsWith("-en"));
  const zhHighlights = highlights?.zh ?? {};
  const enHighlights = highlights?.en ?? {};

  const blocks = ordered.map((r) => {
    const zhLabel = NOTIFY_LABELS[r]?.zh ?? r;
    const zhUrl = `${PAGES_URL}/#${date}/${r}`;
    const enKey = `${r}-en`;
    const enLabel = NOTIFY_LABELS[r]?.en ?? "EN";
    const head = reports.includes(enKey)
      ? `• [${zhLabel}](${zhUrl})  ·  [${enLabel}](${PAGES_URL}/#${date}/${enKey})`
      : `• [${zhLabel}](${zhUrl})`;
    // Fall back to en when a report's zh highlights are missing so a
    // single-language failure never blanks the message.
    const items = zhHighlights[r] ?? enHighlights[r] ?? [];
    return { head, bullets: items.map((h) => `  ◦ ${h}`) };
  });

  const header = `📡 **agents-radar · ${date}**`;
  const footer = `[🌐 Web UI](${PAGES_URL})  ·  [⊕ RSS](${PAGES_URL}/feed.xml)`;

  const render = (counts: number[]): string =>
    [
      header,
      ...blocks.map((b, i) => [b.head, ...b.bullets.slice(0, counts[i] ?? 0)].join("\n")),
      footer,
    ].join("\n\n");

  const counts = blocks.map((b) => b.bullets.length);
  let content = render(counts);

  // Drop highlight bullets round-robin (last report back to the first) until
  // the message fits, so one oversized digest trims evenly across reports
  // instead of losing only the trailing reports' highlights. Report links are
  // never trimmed.
  while (byteLength(content) > WECOM_MAX_BYTES) {
    let removed = false;
    for (let i = counts.length - 1; i >= 0; i--) {
      const n = counts[i] ?? 0;
      if (n === 0) continue;
      counts[i] = n - 1;
      removed = true;
      content = render(counts);
      if (byteLength(content) <= WECOM_MAX_BYTES) break;
    }
    if (!removed) break;
  }

  return content;
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
  const { date, reports } = latest;

  let highlights: Highlights | null = null;
  const highlightsPath = path.join("digests", date, "highlights.json");
  if (fs.existsSync(highlightsPath)) {
    try {
      highlights = JSON.parse(fs.readFileSync(highlightsPath, "utf-8")) as Highlights;
    } catch {
      console.log("[wecom] Failed to parse highlights.json — sending without highlights.");
    }
  }

  const content = buildWecomMessage(date, reports, undefined, highlights);

  console.log(
    `[wecom] Sending to ${urls.length} webhook(s) for ${date} (${reports.length} reports, ${byteLength(content)} bytes)…`,
  );
  await sendWecom(content);
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
