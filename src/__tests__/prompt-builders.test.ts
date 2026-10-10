import { describe, it, expect } from "vitest";
import { buildDailyNewsPrompt, NEWS_SECTION_IDS } from "../prompts-data.ts";
import type { NewsItem } from "../news.ts";
import type { SearchRepo, TrendingData, TrendingRepo } from "../trending.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeItem(over: Partial<NewsItem> = {}): NewsItem {
  return {
    sourceId: "qbitai",
    sourceName: "量子位",
    title: "某模型发布",
    link: "https://www.qbitai.com/2026/03/123.html",
    published: new Date("2026-03-09T02:00:00Z"),
    excerpt: "一句话摘要",
    ...over,
  };
}

function makeTrendingRepo(over: Partial<TrendingRepo> = {}): TrendingRepo {
  return {
    fullName: "openclaw/openclaw",
    description: "Your own personal AI assistant",
    language: "TypeScript",
    todayStars: 1200,
    totalStars: 88000,
    forks: 5200,
    url: "https://github.com/openclaw/openclaw",
    ...over,
  };
}

function makeSearchRepo(over: Partial<SearchRepo> = {}): SearchRepo {
  return {
    fullName: "org/tool",
    description: "An agent tool",
    language: "Python",
    stargazersCount: 4300,
    pushedAt: "2026-03-08T00:00:00Z",
    url: "https://github.com/org/tool",
    searchQuery: "ai-agent",
    ...over,
  };
}

function makeTrending(over: Partial<TrendingData> = {}): TrendingData {
  return {
    trendingRepos: [makeTrendingRepo()],
    searchRepos: [makeSearchRepo()],
    trendingFetchSuccess: true,
    ...over,
  };
}

// ---------------------------------------------------------------------------
// Section ids
// ---------------------------------------------------------------------------

describe("NEWS_SECTION_IDS", () => {
  it("fixes the four directions in order", () => {
    expect(NEWS_SECTION_IDS).toEqual(["llm", "agents", "creator", "office"]);
  });
});

// ---------------------------------------------------------------------------
// buildDailyNewsPrompt
// ---------------------------------------------------------------------------

describe("buildDailyNewsPrompt", () => {
  it("numbers every news item with source, link and excerpt", () => {
    const prompt = buildDailyNewsPrompt(
      [
        makeItem(),
        makeItem({
          sourceId: "leiphone",
          sourceName: "雷峰网",
          title: "开源项目更新",
          link: "https://www.leiphone.com/news/456.html",
          excerpt: "第二条摘要",
        }),
      ],
      makeTrending(),
      "2026-03-09",
    );
    expect(prompt).toContain("## 新闻条目（共 2 条）");
    expect(prompt).toContain(
      "1. [量子位] 某模型发布\n   链接: https://www.qbitai.com/2026/03/123.html\n   摘要: 一句话摘要",
    );
    expect(prompt).toContain("2. [雷峰网] 开源项目更新");
    expect(prompt).toContain("链接: https://www.leiphone.com/news/456.html");
    expect(prompt).toContain("摘要: 第二条摘要");
    expect(prompt).toContain("今天是 2026-03-09");
  });

  it("notes an empty excerpt instead of leaving the line blank", () => {
    const prompt = buildDailyNewsPrompt([makeItem({ excerpt: "" })], makeTrending(), "2026-03-09");
    expect(prompt).toContain("摘要: （无摘要）");
  });

  it("lists trending repos with real stars and today's delta", () => {
    const prompt = buildDailyNewsPrompt([], makeTrending(), "2026-03-09");
    const stars = `${(88000).toLocaleString()}（今日 +${(1200).toLocaleString()}）`;
    expect(prompt).toContain(`- openclaw/openclaw ⭐${stars} [TypeScript] — Your own personal AI assistant`);
    expect(prompt).toContain("### 今日 Trending（github.com/trending）");
  });

  it("lists search repos with their topic label", () => {
    const prompt = buildDailyNewsPrompt([], makeTrending(), "2026-03-09");
    const stars = (4300).toLocaleString();
    expect(prompt).toContain(`- org/tool ⭐${stars} [topic:ai-agent] — An agent tool`);
    expect(prompt).toContain("### AI 主题搜索（近 7 天活跃）");
  });

  it("tells the model to leave the section empty when trending fetch failed", () => {
    const prompt = buildDailyNewsPrompt(
      [],
      makeTrending({ trendingRepos: [], searchRepos: [], trendingFetchSuccess: false }),
      "2026-03-09",
    );
    expect(prompt).toContain("（今日 GitHub Trending 抓取失败，请将该部分留空）");
    expect(prompt).toContain("（无搜索结果）");
  });

  it("caps the trending list at 30 lines", () => {
    const repos = Array.from({ length: 35 }, (_, i) =>
      makeTrendingRepo({ fullName: `owner/repo-${i + 1}`, url: `https://github.com/owner/repo-${i + 1}` }),
    );
    const prompt = buildDailyNewsPrompt(
      [],
      makeTrending({ trendingRepos: repos, searchRepos: [] }),
      "2026-03-09",
    );
    expect(prompt).toContain("owner/repo-30");
    expect(prompt).not.toContain("owner/repo-31");
  });

  it("describes the four fixed sections with their ids", () => {
    const prompt = buildDailyNewsPrompt([], makeTrending(), "2026-03-09");
    expect(prompt).toContain('"llm"：大模型动向');
    expect(prompt).toContain('"agents"：智能体 & 开源项目');
    expect(prompt).toContain('"creator"：创作者 · AIGC 玩法');
    expect(prompt).toContain('"office"：办公提效');
  });

  it("demands exact JSON and forbids invented URLs", () => {
    const prompt = buildDailyNewsPrompt([], makeTrending(), "2026-03-09");
    expect(prompt).toContain("只返回合法 JSON");
    expect(prompt).toContain('"summary"');
    expect(prompt).toContain('"sections"');
    expect(prompt).toContain('"trending"');
    expect(prompt).toContain('"cards"');
    expect(prompt).toContain("必须从上面条目中原样复制");
  });
});
