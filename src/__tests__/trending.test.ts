import { describe, it, expect } from "vitest";
import { parseTrendingHtml } from "../trending.ts";

// ---------------------------------------------------------------------------
// parseTrendingHtml
// ---------------------------------------------------------------------------

// Mirrors the live markup: the stars/forks number sits in the anchor's text
// node *after* an inline SVG whose path data is full of digits.
const ARTICLE = `<article class="Box-row">
  <h2 class="h3 lh-condensed">
    <a href="/morluto/rea" data-view-component="true" class="Link">morluto / rea</a>
  </h2>
  <p class="col-9 color-fg-muted my-1 pr-4">Reverse engineering, as a local agent capability</p>
  <div class="f6 color-fg-muted mt-2">
    <span itemprop="programmingLanguage">Python</span>
    14,927 stars today
  </div>
  <div class="f6 color-fg-muted mt-2">
    <a href="/morluto/rea/stargazers" data-view-component="true" class="tmp-mr-3 Link Link--muted d-inline-block"><svg aria-label="star" role="img" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-star">
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
</svg>
        54,714</a>
    <a href="/morluto/rea/forks" data-view-component="true" class="tmp-mr-3 Link Link--muted d-inline-block"><svg aria-label="fork" role="img" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-repo-forked">
    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
</svg>
        70</a>
  </div>
</article>`;

describe("parseTrendingHtml", () => {
  it("parses an article block with stars, forks and today's delta", () => {
    const repos = parseTrendingHtml(ARTICLE);
    expect(repos).toHaveLength(1);
    expect(repos[0]).toEqual({
      fullName: "morluto/rea",
      description: "Reverse engineering, as a local agent capability",
      language: "Python",
      todayStars: 14927,
      totalStars: 54714,
      forks: 70,
      url: "https://github.com/morluto/rea",
    });
  });

  it("never mistakes SVG path geometry for the star count", () => {
    // The bug this guards: reading the first digits after the anchor returned
    // "8" from the icon's path data (`d="M8 .25…"`).
    const repos = parseTrendingHtml(ARTICLE);
    expect(repos[0]!.totalStars).not.toBe(8);
    expect(repos[0]!.forks).not.toBe(5);
  });

  it("returns an empty list for HTML without article blocks", () => {
    expect(parseTrendingHtml("<html><body>nothing here</body></html>")).toEqual([]);
  });
});
