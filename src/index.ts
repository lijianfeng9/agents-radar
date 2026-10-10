/**
 * agents-radar: daily Chinese AI news digest.
 *
 * Fetches the last ~26 hours from Chinese tech-media RSS feeds plus the GitHub
 * trending snapshot, asks the LLM for one structured digest, and writes
 * digests/<date>/ai-news.md + news.json. A generation failure fails the run —
 * a day is better missing than published as placeholders.
 *
 * Env vars:
 *   LLM_PROVIDER        - "anthropic" | "openai" | "deepseek" | "github-copilot" | "openrouter" (default: anthropic)
 *   GITHUB_TOKEN        - GitHub token (trending search API; issues when DIGEST_REPO is set)
 *   DIGEST_REPO         - owner/repo where digest issues are posted (optional)
 *
 * Provider-specific env vars — see src/providers/ for the full list.
 */

import { loadConfig } from "./config.ts";
import { fetchAllNews } from "./news.ts";
import { fetchTrendingData, type TrendingData } from "./trending.ts";
import { buildDailyNewsPrompt } from "./prompts-data.ts";
import { callLlm, parseLlmJson, isConnectionError, LLM_TOKENS_NEWS } from "./report.ts";
import { saveDailyNews } from "./report-savers.ts";
import { toCstDateStr, toUtcStr, sleep } from "./date.ts";

/**
 * Pause between digest-generation attempts when the first one died on a
 * connection failure. Long enough that attempt 2 lands outside the outage that
 * just consumed callLlm's retry ladder, short enough that a healthy provider
 * hiccup still costs the run a single minute.
 */
const GENERATION_COOLDOWN_MS = 60_000;

async function generateDailyNews(prompt: string): Promise<unknown> {
  // The model occasionally returns malformed JSON that repairJson can't fix; a
  // fresh generation usually comes back valid. A connection failure is a
  // different animal: attempt 1 has already burned callLlm's full ~3 min retry
  // ladder, so attempt 2 waits out a cooldown first instead of re-entering an
  // outage that is demonstrably still going.
  for (let attempt = 1; ; attempt++) {
    try {
      return parseLlmJson(await callLlm(prompt, LLM_TOKENS_NEWS));
    } catch (err) {
      if (attempt >= 2) throw err;
      console.error(`  [news] generation attempt ${attempt} failed, retrying: ${err}`);
      if (isConnectionError(err)) {
        console.error(
          `  [news] connection down — cooling down ${GENERATION_COOLDOWN_MS / 1000}s before retry`,
        );
        await sleep(GENERATION_COOLDOWN_MS);
      }
    }
  }
}

async function main(): Promise<void> {
  const now = new Date();
  const dateStr = toCstDateStr(now);
  const utcStr = toUtcStr(now);
  const digestRepo = process.env["DIGEST_REPO"] ?? "";
  const providerName = process.env["LLM_PROVIDER"] ?? "anthropic";
  console.log(`[${now.toISOString()}] Starting daily news digest | provider: ${providerName}`);

  const { newsSources } = loadConfig();

  console.log("  Fetching news sources and GitHub trending...");
  const [newsResult, trendingData] = await Promise.all([
    fetchAllNews(newsSources, now),
    fetchTrendingData().catch((err): TrendingData => {
      console.error(`  [trending] fetch failed: ${err}`);
      return { trendingRepos: [], searchRepos: [], trendingFetchSuccess: false };
    }),
  ]);

  for (const s of newsResult.stats) {
    console.log(`  [news] ${s.name}: ${s.ok ? `${s.kept}/${s.fetched} entries selected` : "fetch failed"}`);
  }
  console.log(`  [news] ${newsResult.items.length} items after filtering and dedup`);
  if (newsResult.items.length === 0) {
    throw new Error("No news items in the last 26 hours — aborting.");
  }

  console.log("  Calling LLM for the daily digest...");
  const raw = await generateDailyNews(buildDailyNewsPrompt(newsResult.items, trendingData, dateStr));

  const sourceNames = newsResult.stats.filter((s) => s.kept > 0).map((s) => s.name);
  const file = await saveDailyNews(raw, {
    dateStr,
    utcStr,
    sourceNames,
    newsItems: newsResult.items,
    trendingData,
    digestRepo,
  });

  const itemCount = Object.values(file.sections).reduce((n, items) => n + items.length, 0);
  console.log(
    `  Digest: ${itemCount} news entries, ${file.trending.length} trending repos, ${file.cards.length} cards`,
  );
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
