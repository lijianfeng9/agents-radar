/**
 * Renders the daily news report markdown from the validated digest data.
 */

import { NEWS_REPORT } from "./i18n.ts";
import { NEWS_SECTION_IDS, type DailyNewsSections } from "./prompts-data.ts";

/** A trending repo joined with the real stars snapshot fetched from GitHub. */
export interface TrendingHighlight {
  repo: string;
  url: string;
  stars: string;
  summary: string;
}

export interface DailyNewsRenderInput {
  dateStr: string;
  utcStr: string;
  sourceNames: string[];
  /** News items that went into the prompt (before the LLM's selection). */
  fetchedCount: number;
  summary: string[];
  sections: DailyNewsSections;
  trending: TrendingHighlight[];
  footer: string;
}

function mdLink(text: string, url: string): string {
  // Brackets in a title would break the markdown link syntax.
  return `[${text.replace(/[[\]]/g, "")}](${url})`;
}

export function buildDailyNewsMarkdown(input: DailyNewsRenderInput): string {
  const { dateStr, utcStr, sourceNames, fetchedCount, summary, sections, trending, footer } = input;
  const itemCount = NEWS_SECTION_IDS.reduce((n, id) => n + sections[id].length, 0);

  const blocks: string[] = [
    `# ${NEWS_REPORT.title} ${dateStr}`,
    `> ${NEWS_REPORT.sources(sourceNames)} | ${NEWS_REPORT.meta(utcStr, itemCount, fetchedCount)}`,
  ];

  if (summary.length) {
    blocks.push(`## ${NEWS_REPORT.summaryHeading}\n\n${summary.map((s) => `- ${s}`).join("\n")}`);
  }

  for (const id of NEWS_SECTION_IDS) {
    const items = sections[id];
    if (!items.length) continue;
    blocks.push(
      `## ${NEWS_REPORT.sections[id]}\n\n` +
        items.map((it) => `- ${mdLink(it.title, it.url)} — ${it.summary}`).join("\n"),
    );
  }

  if (trending.length) {
    const rows = trending.map((r) => `| ${mdLink(r.repo, r.url)} | ${r.stars} | ${r.summary} |`).join("\n");
    blocks.push(
      `## ${NEWS_REPORT.trendingHeading}\n\n| 项目 | Stars | 说明 |\n| :--- | ---: | :--- |\n${rows}`,
    );
  }

  return blocks.join("\n\n") + "\n" + footer;
}
