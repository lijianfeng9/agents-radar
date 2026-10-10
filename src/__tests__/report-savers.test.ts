import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import {
  normalizeDailyNews,
  buildTrendingRows,
  saveDailyNews,
  type SaveDailyNewsCtx,
} from "../report-savers.ts";
import type { NewsItem } from "../news.ts";
import type { SearchRepo, TrendingData, TrendingRepo } from "../trending.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NEWS_URL = "https://www.qbitai.com/2026/03/123.html";
const REPO_URL = "https://github.com/openclaw/openclaw";

function makeNewsItem(over: Partial<NewsItem> = {}): NewsItem {
  return {
    sourceId: "qbitai",
    sourceName: "量子位",
    title: "某模型发布",
    link: NEWS_URL,
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
    totalStars: 88123,
    forks: 5200,
    url: REPO_URL,
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

function makeTrendingData(over: Partial<TrendingData> = {}): TrendingData {
  return {
    trendingRepos: [makeTrendingRepo()],
    searchRepos: [makeSearchRepo()],
    trendingFetchSuccess: true,
    ...over,
  };
}

function makeCtx(over: Partial<SaveDailyNewsCtx> = {}): SaveDailyNewsCtx {
  return {
    dateStr: "2026-03-09",
    utcStr: "2026-03-09 01:10",
    sourceNames: ["量子位"],
    newsItems: [makeNewsItem()],
    trendingData: makeTrendingData(),
    digestRepo: "",
    ...over,
  };
}

const allowedUrls = new Set<string>([NEWS_URL, REPO_URL]);

const VALID_RAW = {
  summary: ["速览一", "速览二"],
  sections: {
    llm: [
      { title: "模型发布", summary: "说明", url: NEWS_URL },
      { title: "假新闻", summary: "说明", url: "https://fake.example.com/x" },
    ],
    agents: [],
    creator: [],
    office: [],
  },
  trending: [{ repo: "https://github.com/openclaw/openclaw/", summary: "好项目" }],
  cards: [
    { title: "卡片", description: "看点", url: NEWS_URL },
    { title: "假卡片", description: "看点", url: "https://fake.example.com/y" },
  ],
};

// ---------------------------------------------------------------------------
// normalizeDailyNews — only clickable truth ships
// ---------------------------------------------------------------------------

describe("normalizeDailyNews", () => {
  it("keeps only URLs that were actually fetched", () => {
    const news = normalizeDailyNews(VALID_RAW, allowedUrls);
    expect(news.sections.llm).toHaveLength(1);
    expect(news.sections.llm[0]!.url).toBe(NEWS_URL);
  });

  it("drops entries without a title or URL", () => {
    const news = normalizeDailyNews(
      {
        sections: {
          llm: [
            { title: "", summary: "无题", url: NEWS_URL },
            { title: "无链接", summary: "", url: "" },
          ],
        },
      },
      allowedUrls,
    );
    expect(news.sections.llm).toHaveLength(0);
  });

  it("dedupes repeated URLs inside a section", () => {
    const news = normalizeDailyNews(
      {
        sections: {
          llm: [
            { title: "第一条", summary: "", url: NEWS_URL },
            { title: "重复报道", summary: "", url: NEWS_URL },
          ],
        },
      },
      allowedUrls,
    );
    expect(news.sections.llm).toHaveLength(1);
  });

  it("keeps at most 6 summary bullets and drops non-strings", () => {
    const news = normalizeDailyNews(
      { summary: ["1", "2", "3", "4", "5", "6", "7", "8", 42, null] },
      allowedUrls,
    );
    expect(news.summary).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("strips a github.com prefix from trending picks", () => {
    const news = normalizeDailyNews(VALID_RAW, allowedUrls);
    expect(news.trendingPicks).toEqual([{ repo: "openclaw/openclaw", summary: "好项目" }]);
  });

  it("filters cards by the allow-list, including GitHub repo links", () => {
    const news = normalizeDailyNews(
      {
        cards: [
          { title: "新闻卡", description: "", url: NEWS_URL },
          { title: "项目卡", description: "", url: REPO_URL },
          { title: "假卡", description: "", url: "https://fake.example.com/z" },
        ],
      },
      allowedUrls,
    );
    expect(news.cards.map((c) => c.url)).toEqual([NEWS_URL, REPO_URL]);
  });

  it("caps cards at 8", () => {
    const urls = Array.from({ length: 10 }, (_, i) => `https://example.com/${i}`);
    const allowed = new Set(urls);
    const news = normalizeDailyNews(
      { cards: urls.map((url, i) => ({ title: `卡片${i}`, description: "", url })) },
      allowed,
    );
    expect(news.cards).toHaveLength(8);
  });

  it("returns an empty structure for garbage input", () => {
    const news = normalizeDailyNews(null, new Set());
    expect(news.summary).toEqual([]);
    expect(news.sections).toEqual({ llm: [], agents: [], creator: [], office: [] });
    expect(news.trendingPicks).toEqual([]);
    expect(news.cards).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// buildTrendingRows — stars come from fetched data, never from the model
// ---------------------------------------------------------------------------

describe("buildTrendingRows", () => {
  it("joins the real star snapshot onto the model's picks", () => {
    const rows = buildTrendingRows([{ repo: "openclaw/openclaw", summary: "好项目" }], makeTrendingData());
    expect(rows).toEqual([
      {
        repo: "openclaw/openclaw",
        url: REPO_URL,
        stars: `${(88123).toLocaleString()}（今日 +${(1200).toLocaleString()}）`,
        summary: "好项目",
      },
    ]);
  });

  it("falls back to the fetched description when the model wrote none", () => {
    const rows = buildTrendingRows([{ repo: "openclaw/openclaw", summary: "" }], makeTrendingData());
    expect(rows[0]!.summary).toBe("Your own personal AI assistant");
  });

  it("uses search results for repos not on the trending board", () => {
    const rows = buildTrendingRows([{ repo: "org/tool", summary: "" }], makeTrendingData());
    expect(rows[0]!.stars).toBe((4300).toLocaleString());
    expect(rows[0]!.url).toBe("https://github.com/org/tool");
  });

  it("prefers the trending snapshot over search data for the same repo", () => {
    const data = makeTrendingData({
      searchRepos: [makeSearchRepo({ fullName: "openclaw/openclaw", stargazersCount: 1 })],
    });
    const rows = buildTrendingRows([{ repo: "openclaw/openclaw", summary: "" }], data);
    expect(rows[0]!.stars).toContain((88123).toLocaleString());
  });

  it("drops picks that were not in the fetched data", () => {
    const rows = buildTrendingRows(
      [
        { repo: "fabricated/repo", summary: "假项目" },
        { repo: "openclaw/openclaw", summary: "" },
      ],
      makeTrendingData(),
    );
    expect(rows.map((r) => r.repo)).toEqual(["openclaw/openclaw"]);
  });

  it("dedupes repeated picks and caps rows at 8", () => {
    const repos = Array.from({ length: 10 }, (_, i) =>
      makeTrendingRepo({ fullName: `owner/repo-${i}`, url: `https://github.com/owner/repo-${i}` }),
    );
    const picks = [
      ...repos.map((r) => ({ repo: r.fullName, summary: "" })),
      { repo: "owner/repo-0", summary: "" },
    ];
    const rows = buildTrendingRows(picks, makeTrendingData({ trendingRepos: repos, searchRepos: [] }));
    expect(rows).toHaveLength(8);
    expect(rows[0]!.repo).toBe("owner/repo-0");
  });
});

// ---------------------------------------------------------------------------
// saveDailyNews
// ---------------------------------------------------------------------------

describe("saveDailyNews", () => {
  beforeEach(() => {
    vi.spyOn(fs, "mkdirSync").mockReturnValue(undefined);
    vi.spyOn(fs, "writeFileSync").mockReturnValue(undefined);
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const written = (suffix: string): string | undefined => {
    const call = vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]).includes(suffix));
    return call ? String(call[1]) : undefined;
  };

  it("writes ai-news.md, news.json and highlights.json and returns the digest", async () => {
    const file = await saveDailyNews(VALID_RAW, makeCtx());

    expect(file.date).toBe("2026-03-09");
    expect(file.sources).toEqual(["量子位"]);
    expect(file.fetchedCount).toBe(1);
    expect(file.sections.llm).toHaveLength(1);
    expect(file.trending).toHaveLength(1);
    expect(file.cards).toHaveLength(1);

    expect(written("ai-news.md")).toContain("# AI 每日要闻 2026-03-09");
    const newsJson = JSON.parse(written("news.json") ?? "{}") as { date: string; cards: unknown[] };
    expect(newsJson.date).toBe("2026-03-09");
    expect(newsJson.cards).toHaveLength(1);
    expect(JSON.parse(written("highlights.json") ?? "{}")).toEqual({
      zh: { "ai-news": ["速览一", "速览二"] },
      en: {},
    });
  });

  it("falls back to section items when the model produced no cards", async () => {
    const file = await saveDailyNews(
      {
        sections: {
          llm: [{ title: "模型发布", summary: "说明", url: NEWS_URL }],
          agents: [{ title: "项目更新", summary: "说明", url: REPO_URL }],
        },
      },
      makeCtx(),
    );
    expect(file.cards.map((c) => c.url)).toEqual([NEWS_URL, REPO_URL]);
  });

  it("carries the feed image onto matching cards", async () => {
    const raw = {
      sections: { llm: [{ title: "模型发布", summary: "说明", url: NEWS_URL }] },
      cards: [{ title: "卡片", description: "看点", url: NEWS_URL }],
    };
    const file = await saveDailyNews(
      raw,
      makeCtx({ newsItems: [makeNewsItem({ image: "https://img.example.com/cover.png" })] }),
    );
    expect(file.cards[0]!.image).toBe("https://img.example.com/cover.png");
  });

  it("keeps images on fallback cards and omits the key when the feed had none", async () => {
    const raw = {
      sections: {
        llm: [{ title: "模型发布", summary: "说明", url: NEWS_URL }],
        agents: [{ title: "项目更新", summary: "说明", url: REPO_URL }],
      },
    };
    const withImages = await saveDailyNews(
      raw,
      makeCtx({
        newsItems: [
          makeNewsItem({ image: "https://img.example.com/cover.png" }),
          makeNewsItem({ title: "仓库更新", link: REPO_URL, image: "https://img.example.com/repo.png" }),
        ],
      }),
    );
    expect(withImages.cards.map((c) => c.image)).toEqual([
      "https://img.example.com/cover.png",
      "https://img.example.com/repo.png",
    ]);

    const bare = await saveDailyNews(raw, makeCtx());
    expect(bare.cards[0]).not.toHaveProperty("image");
  });

  it("throws when nothing usable survives validation", async () => {
    const raw = {
      sections: { llm: [{ title: "假新闻", summary: "", url: "https://fake.example.com/x" }] },
      trending: [{ repo: "fabricated/repo", summary: "假项目" }],
      cards: [{ title: "假卡片", description: "", url: "https://fake.example.com/y" }],
    };
    await expect(saveDailyNews(raw, makeCtx())).rejects.toThrow(/no usable entries/);
  });
});
