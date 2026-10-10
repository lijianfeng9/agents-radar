import { describe, it, expect } from "vitest";
import { buildGroupPrompt, buildGroupComparisonPrompt } from "../prompts.ts";
import { buildTrendingPrompt, buildWebReportPrompt } from "../prompts-data.ts";
import type { RepoConfig, GitHubItem, GitHubRelease, GitHubDiscussion } from "../github.ts";
import type { RepoDigest } from "../prompts.ts";
import type { TrendingData } from "../trending.ts";
import type { WebFetchResult } from "../web.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const cfg: RepoConfig = { id: "test", repo: "org/test", name: "TestTool" };

function makeItem(overrides: Partial<GitHubItem> = {}): GitHubItem {
  return {
    number: 1,
    title: "Issue",
    state: "open",
    user: { login: "alice" },
    labels: [],
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 5,
    reactions: { "+1": 2 },
    body: "body",
    html_url: "https://github.com/org/test/issues/1",
    ...overrides,
  };
}

function makeDiscussion(overrides: Partial<GitHubDiscussion> = {}): GitHubDiscussion {
  return {
    number: 42,
    title: "Discussion title",
    body: "Discussion body",
    category: "Ideas",
    author: "alice",
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 4,
    upvotes: 16,
    answered: false,
    html_url: "https://github.com/org/test/discussions/42",
    ...overrides,
  };
}

const release: GitHubRelease = {
  tag_name: "v1.0.0",
  name: "Release 1.0",
  body: "Release notes",
  published_at: "2026-03-09T00:00:00Z",
};

function makeDigest(overrides: Partial<RepoDigest> = {}): RepoDigest {
  return {
    config: cfg,
    issues: [],
    prs: [],
    releases: [],
    discussions: [],
    summary: "Summary",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildGroupPrompt
// ---------------------------------------------------------------------------

describe("buildGroupPrompt", () => {
  it("generates a Chinese prompt by default", () => {
    const result = buildGroupPrompt(
      "ai-hot-agents",
      cfg,
      [makeItem()],
      [makeItem()],
      [release],
      [],
      "2026-03-09",
    );
    expect(result).toContain("TestTool");
    expect(result).toContain("2026-03-09");
    expect(result).toContain("org/test");
    expect(result).toContain("v1.0.0");
    expect(result).toContain("今日速览");
    expect(result).toContain("不写代码");
  });

  it("generates an English prompt", () => {
    const result = buildGroupPrompt("ai-hot-agents", cfg, [makeItem()], [], [], [], "2026-03-09", "en");
    expect(result).toContain("TestTool");
    expect(result).toContain("Today's Highlights");
    expect(result).toContain("non-developer");
  });

  it("carries the direction-specific focus", () => {
    expect(buildGroupPrompt("ai-creator", cfg, [], [], [], [], "2026-03-09")).toContain("博主");
    expect(buildGroupPrompt("ai-office", cfg, [], [], [], [], "2026-03-09")).toContain("办公");
    expect(buildGroupPrompt("ai-aigc", cfg, [], [], [], [], "2026-03-09")).toContain("图像");
  });

  it("shows 无 when there is no data", () => {
    const result = buildGroupPrompt("ai-hot-agents", cfg, [], [], [], [], "2026-03-09");
    expect(result).toContain("无");
  });

  it("includes sample notes when issues exceed the limit", () => {
    const items = Array.from({ length: 50 }, (_, i) => makeItem({ number: i, comments: i }));
    const result = buildGroupPrompt("ai-hot-agents", cfg, items, [], [], [], "2026-03-09");
    expect(result).toContain("共 50 条");
    expect(result).toContain("30 条");
  });

  it("omits the Discussions section when there is no discussion data", () => {
    const result = buildGroupPrompt("ai-hot-agents", cfg, [makeItem()], [], [], [], "2026-03-09");
    expect(result).not.toContain("最新 Discussions");
  });

  it("renders the Discussions section when data is present", () => {
    const result = buildGroupPrompt("ai-hot-agents", cfg, [], [], [], [makeDiscussion()], "2026-03-09");
    expect(result).toContain("最新 Discussions");
    expect(result).toContain("#42 [Ideas]");
    expect(result).toContain("社区热点");
  });

  it("rejects an unknown group id", () => {
    expect(() => buildGroupPrompt("nope", cfg, [], [], [], [], "2026-03-09")).toThrow("nope");
  });
});

// ---------------------------------------------------------------------------
// buildGroupComparisonPrompt
// ---------------------------------------------------------------------------

describe("buildGroupComparisonPrompt", () => {
  it("includes all digest summaries when they have data", () => {
    const digests = [
      makeDigest({ config: { ...cfg, name: "Tool A" }, summary: "Summary A", issues: [makeItem()] }),
      makeDigest({ config: { ...cfg, name: "Tool B" }, summary: "Summary B", prs: [makeItem()] }),
    ];
    const result = buildGroupComparisonPrompt("ai-hot-agents", digests, "2026-03-09");
    expect(result).toContain("Tool A");
    expect(result).toContain("Summary A");
    expect(result).toContain("Tool B");
    expect(result).toContain("Summary B");
    expect(result).toContain("活跃度对比");
  });

  it("shows no-activity for empty digests", () => {
    const result = buildGroupComparisonPrompt(
      "ai-hot-agents",
      [makeDigest({ summary: "Summary" })],
      "2026-03-09",
    );
    expect(result).toContain("过去24小时无活动");
  });

  it("generates an English prompt", () => {
    const result = buildGroupComparisonPrompt("ai-hot-agents", [makeDigest()], "2026-03-09", "en");
    expect(result).toContain("No activity in the last 24 hours.");
    expect(result).toContain("Activity Comparison");
  });
});

// ---------------------------------------------------------------------------
// buildTrendingPrompt
// ---------------------------------------------------------------------------

describe("buildTrendingPrompt", () => {
  it("includes trending repos", () => {
    const data: TrendingData = {
      trendingRepos: [
        {
          fullName: "org/repo",
          description: "desc",
          language: "Python",
          todayStars: 100,
          totalStars: 5000,
          forks: 200,
          url: "https://github.com/org/repo",
        },
      ],
      searchRepos: [],
      trendingFetchSuccess: true,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("org/repo");
    expect(result).toContain("Python");
    expect(result).toContain("5,000");
    expect(result).toContain("+100 today");
    expect(result).toContain("办公与效率");
  });

  it("shows fetch failure message when trending fails", () => {
    const data: TrendingData = { trendingRepos: [], searchRepos: [], trendingFetchSuccess: false };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("未能抓取");
  });

  it("includes search repos with topic tag", () => {
    const data: TrendingData = {
      trendingRepos: [],
      searchRepos: [
        {
          fullName: "ai/agent",
          description: "An AI agent",
          language: "TypeScript",
          stargazersCount: 1000,
          pushedAt: "2026-03-08",
          url: "https://github.com/ai/agent",
          searchQuery: "ai-agent",
        },
      ],
      trendingFetchSuccess: false,
    };
    const result = buildTrendingPrompt(data, "2026-03-09");
    expect(result).toContain("[topic:ai-agent]");
    expect(result).toContain("1,000");
  });
});

// ---------------------------------------------------------------------------
// buildWebReportPrompt
// ---------------------------------------------------------------------------

describe("buildWebReportPrompt", () => {
  it("includes site sections for first run", () => {
    const results: WebFetchResult[] = [
      {
        site: "anthropic",
        siteName: "Anthropic",
        isFirstRun: true,
        newItems: [
          {
            url: "https://anthropic.com/news/test",
            title: "Test",
            lastmod: "2026-03-09",
            content: "Content",
            site: "anthropic",
            category: "news",
          },
        ],
        totalDiscovered: 50,
      },
    ];
    const result = buildWebReportPrompt(results, "2026-03-09");
    expect(result).toContain("首次全量抓取");
    expect(result).toContain("Anthropic");
    expect(result).toContain("内容格局总览"); // first-run-only section
  });

  it("shows incremental mode for non-first-run", () => {
    const results: WebFetchResult[] = [
      { site: "openai", siteName: "OpenAI", isFirstRun: false, newItems: [], totalDiscovered: 100 },
    ];
    const result = buildWebReportPrompt(results, "2026-03-09");
    expect(result).toContain("增量更新");
    expect(result).not.toContain("内容格局总览");
  });
});
