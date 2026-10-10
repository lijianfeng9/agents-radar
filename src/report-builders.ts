/**
 * Report content builders — extracted from index.ts for testability.
 */

import type { RepoDigest } from "./prompts.ts";
import { GROUP_REPORTS, type Lang } from "./i18n.ts";

/**
 * Content of one group report: title, meta, repo links, cross-project
 * comparison and one <details> block per project.
 */
export function buildGroupReportContent(
  gid: string,
  digests: RepoDigest[],
  comparison: string,
  utcStr: string,
  dateStr: string,
  footer: string,
  lang: Lang = "zh",
): string {
  const info = GROUP_REPORTS[gid];
  if (!info) throw new Error(`Unknown report group: ${gid}`);

  const repoLinks = digests
    .map((d) => `- [${d.config.name}](https://github.com/${d.config.repo})`)
    .join("\n");

  const projectSections = digests
    .map((d) =>
      [
        `<details>`,
        `<summary><strong>${d.config.name}</strong> — <a href="https://github.com/${d.config.repo}">${d.config.repo}</a></summary>`,
        ``,
        d.summary,
        ``,
        `</details>`,
      ].join("\n"),
    )
    .join("\n\n");

  return (
    `# ${info.title[lang]} ${dateStr}\n\n` +
    info.meta(utcStr, digests.length, lang) +
    `${repoLinks}\n\n` +
    `---\n\n` +
    `## ${info.comparison[lang]}\n\n` +
    comparison +
    `\n\n---\n\n` +
    `## ${info.detail[lang]}\n\n` +
    projectSections +
    footer
  );
}
