import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  stripHtml,
  parseFeed,
  isRoundup,
  dedupItems,
  selectItems,
  fetchAllNews,
  MAX_ITEMS_PER_SOURCE,
  type NewsItem,
  type NewsSource,
} from "../news.ts";

const NOW = new Date("2026-03-09T08:00:00Z");
const SOURCE: NewsSource = { id: "qbitai", name: "量子位", url: "https://www.qbitai.com/feed" };

function makeItem(over: Partial<NewsItem> = {}): NewsItem {
  return {
    sourceId: "qbitai",
    sourceName: "量子位",
    title: "DeepSeek 发布新一代模型",
    link: "https://example.com/a",
    published: NOW,
    excerpt: "摘要",
    ...over,
  };
}

function hoursAgo(h: number): Date {
  return new Date(NOW.getTime() - h * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// stripHtml
// ---------------------------------------------------------------------------

describe("stripHtml", () => {
  it("removes tags and collapses whitespace", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>\n\n<p>again</p>")).toBe("Hello world again");
  });

  it("decodes named and numeric entities", () => {
    expect(stripHtml("&ldquo;AI&rdquo; &amp; &#39;x&#x27;")).toBe("“AI” & 'x'");
    expect(stripHtml("A&nbsp;B")).toBe("A B");
  });

  it("decodes entity-escaped markup in a second pass", () => {
    expect(stripHtml("&lt;p&gt;Hello&lt;/p&gt;")).toBe("Hello");
  });

  it("drops script and style content", () => {
    expect(stripHtml("<script>alert(1)</script>visible<style>p{}</style>")).toBe("visible");
  });

  it("replaces unknown entities with a space", () => {
    expect(stripHtml("A &foo; B")).toBe("A B");
  });
});

// ---------------------------------------------------------------------------
// parseFeed
// ---------------------------------------------------------------------------

describe("parseFeed", () => {
  const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>量子位</title>
    <item>
      <title>DeepSeek 发布新一代模型</title>
      <link>https://www.qbitai.com/2026/03/123.html?utm_source=rss&amp;utm_medium=feed&amp;keep=1</link>
      <pubDate>Sun, 08 Mar 2026 20:00:00 GMT</pubDate>
      <description><![CDATA[<p>一句话<b>摘要</b>内容</p>]]></description>
    </item>
    <item>
      <title>:fire: 某开源项目发布 v2</title>
      <link>https://www.oschina.net/news/999</link>
      <pubDate>Sun, 08 Mar 2026 22:00:00 GMT</pubDate>
      <description>短说明</description>
    </item>
    <item>
      <title>缺少日期</title>
      <link>https://www.qbitai.com/2026/03/456.html</link>
    </item>
  </channel>
</rss>`;

  it("parses RSS items, strips utm params and cleans titles/excerpts", () => {
    const items = parseFeed(RSS, SOURCE);
    expect(items).toHaveLength(2);

    const first = items[0]!;
    expect(first.sourceId).toBe("qbitai");
    expect(first.sourceName).toBe("量子位");
    expect(first.title).toBe("DeepSeek 发布新一代模型");
    expect(first.link).toBe("https://www.qbitai.com/2026/03/123.html?keep=1");
    expect(first.published).toEqual(new Date("2026-03-08T20:00:00Z"));
    // Tags collapse to spaces, so the words stay separated.
    expect(first.excerpt).toBe("一句话 摘要 内容");

    // oschina-style emoji shortcode removed from the title.
    expect(items[1]!.title).toBe("某开源项目发布 v2");
  });

  it("skips entries missing a title, link or date", () => {
    const items = parseFeed(RSS, SOURCE);
    expect(items.map((it) => it.title)).not.toContain("缺少日期");
  });

  it("parses Atom entries with rel=alternate links", () => {
    const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>OpenClaw ships MCP support</title>
    <link rel="alternate" href="https://example.com/atom-post?utm_campaign=daily"/>
    <published>2026-03-08T21:30:00Z</published>
    <summary>New MCP server support lands.</summary>
  </entry>
</feed>`;
    const items = parseFeed(ATOM, SOURCE);
    expect(items).toHaveLength(1);
    expect(items[0]!.link).toBe("https://example.com/atom-post");
    expect(items[0]!.published).toEqual(new Date("2026-03-08T21:30:00Z"));
    expect(items[0]!.excerpt).toBe("New MCP server support lands.");
  });
});

// ---------------------------------------------------------------------------
// isRoundup
// ---------------------------------------------------------------------------

describe("isRoundup", () => {
  it("detects headline digests by title keyword", () => {
    expect(isRoundup({ title: "早报｜DeepSeek 融资消息", link: "https://example.com/a" })).toBe(true);
    expect(isRoundup({ title: "【钛晨报】今日要闻", link: "https://example.com/b" })).toBe(true);
    expect(isRoundup({ title: "本周 AI 大事件盘点", link: "https://example.com/c" })).toBe(true);
    expect(isRoundup({ title: "AI 周报：一周回顾", link: "https://example.com/d" })).toBe(true);
  });

  it("detects the 雷峰网 zaobao column by URL even without a title keyword", () => {
    expect(
      isRoundup({
        title: "DeepSeek 完成新一轮融资",
        link: "https://www.leiphone.com/category/zaobao/abc.html",
      }),
    ).toBe(true);
  });

  it("keeps regular articles", () => {
    expect(isRoundup({ title: "DeepSeek 即将完成 800 亿元融资", link: "https://www.ifanr.com/1234" })).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// dedupItems
// ---------------------------------------------------------------------------

describe("dedupItems", () => {
  it("merges the same story from two outlets, keeping the fuller excerpt", () => {
    const short = makeItem({
      sourceName: "钛媒体",
      title: "曝 DeepSeek 即将完成至少 800 亿元融资",
      link: "https://tmtpost.com/a",
      excerpt: "短摘要",
    });
    const long = makeItem({
      sourceName: "量子位",
      title: "[独家] 曝 DeepSeek 即将完成至少 800 亿元融资",
      link: "https://qbitai.com/b",
      excerpt: "更详细的摘要，包含融资规模、估值和参与方信息",
    });
    const out = dedupItems([short, long]);
    expect(out).toHaveLength(1);
    expect(out[0]!.link).toBe("https://qbitai.com/b");
  });

  it("keeps the first copy when the excerpts tie", () => {
    const first = makeItem({ title: "同一标题的新闻", link: "https://example.com/1", excerpt: "一样长" });
    const second = makeItem({ title: "同一标题的新闻", link: "https://example.com/2", excerpt: "也三字" });
    const out = dedupItems([first, second]);
    expect(out).toHaveLength(1);
    expect(out[0]!.link).toBe("https://example.com/1");
  });

  it("keeps unrelated stories", () => {
    const out = dedupItems([
      makeItem({ title: "OpenAI 发布新视频模型", link: "https://example.com/1" }),
      makeItem({ title: "小米汽车交付量创纪录", link: "https://example.com/2" }),
    ]);
    expect(out).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// selectItems
// ---------------------------------------------------------------------------

describe("selectItems", () => {
  it("keeps only in-window items and drops roundups", () => {
    const { items, stats } = selectItems(
      [
        {
          source: SOURCE,
          items: [
            makeItem({ title: "新鲜的新闻", published: hoursAgo(1), link: "https://example.com/1" }),
            makeItem({ title: "太旧的新闻", published: hoursAgo(27), link: "https://example.com/2" }),
            makeItem({ title: "未来时间的新闻", published: hoursAgo(-3), link: "https://example.com/3" }),
            makeItem({ title: "AI 早报｜今日要闻", published: hoursAgo(2), link: "https://example.com/4" }),
          ],
        },
      ],
      NOW,
    );
    expect(items).toHaveLength(1);
    expect(items[0]!.title).toBe("新鲜的新闻");
    // fetched counts in-window non-roundup entries.
    expect(stats).toEqual([{ id: "qbitai", name: "量子位", fetched: 1, kept: 1 }]);
  });

  it("caps each source at MAX_ITEMS_PER_SOURCE", () => {
    const titles = [
      "机器人马拉松大赛落幕",
      "芯片公司发布新一代加速卡",
      "医疗影像模型通过审批",
      "自动驾驶出租车扩展城区",
      "气象预测模型提前预警台风",
      "智能音箱加入大模型助手",
      "农业无人机完成百万亩作业",
      "法律助手通过司法考试",
      "古籍修复用上视觉模型",
      "蛋白质结构预测再突破",
      "音乐生成模型发布新专辑",
      "代码助手支持全仓库重构",
      "电力调度引入强化学习",
      "港口自动化吞吐量创新高",
      "远程手术机器人完成首例",
      "银行客服全面智能化",
      "教育平板推出 AI 批改",
      "工业质检缺陷率下降",
      "电影特效公司采用生成视频",
      "图书馆上线智能检索",
    ];
    const { items, stats } = selectItems(
      [
        {
          source: SOURCE,
          items: titles.map((title, i) =>
            makeItem({ title, link: `https://example.com/${i}`, published: hoursAgo(i * 0.1) }),
          ),
        },
      ],
      NOW,
    );
    expect(titles).toHaveLength(20);
    expect(items).toHaveLength(MAX_ITEMS_PER_SOURCE);
    expect(stats[0]!.fetched).toBe(20);
    expect(stats[0]!.kept).toBe(15);
  });

  it("returns items newest first", () => {
    const { items } = selectItems(
      [
        {
          source: SOURCE,
          items: [
            makeItem({ title: "旧一点的消息", published: hoursAgo(5), link: "https://example.com/1" }),
            makeItem({ title: "最新的消息", published: hoursAgo(1), link: "https://example.com/2" }),
          ],
        },
      ],
      NOW,
    );
    expect(items.map((it) => it.title)).toEqual(["最新的消息", "旧一点的消息"]);
  });
});

// ---------------------------------------------------------------------------
// fetchAllNews
// ---------------------------------------------------------------------------

describe("fetchAllNews", () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    vi.restoreAllMocks();
  });

  const feedXml = (pubDate: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>DeepSeek 发布新一代模型</title>
      <link>https://www.qbitai.com/2026/03/123.html</link>
      <pubDate>${pubDate}</pubDate>
      <description>一句话摘要</description>
    </item>
    <item>
      <title>AI 早报｜今日要闻</title>
      <link>https://www.qbitai.com/2026/03/124.html</link>
      <pubDate>${pubDate}</pubDate>
      <description>汇总</description>
    </item>
  </channel>
</rss>`;

  it("parses feeds, filters roundups and reports per-source stats", async () => {
    const pubDate = new Date(NOW.getTime() - 3 * 60 * 60 * 1000).toUTCString();
    globalThis.fetch = (async () => new Response(feedXml(pubDate), { status: 200 })) as typeof fetch;

    const result = await fetchAllNews([SOURCE], NOW);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.title).toBe("DeepSeek 发布新一代模型");
    expect(result.stats).toEqual([{ id: "qbitai", name: "量子位", fetched: 1, kept: 1, ok: true }]);
  });

  it("throws when every source fails", async () => {
    globalThis.fetch = (async () => {
      throw new Error("boom");
    }) as typeof fetch;

    await expect(fetchAllNews([SOURCE], NOW)).rejects.toThrow(/Every news source failed/);
  });

  it("keeps going when only some sources fail", async () => {
    const failing: NewsSource = { id: "fail", name: "故障源", url: "https://fail.example.com/feed" };
    const pubDate = new Date(NOW.getTime() - 3 * 60 * 60 * 1000).toUTCString();
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      if (String(input).includes("fail.example.com")) throw new Error("boom");
      return new Response(feedXml(pubDate), { status: 200 });
    }) as typeof fetch;

    const result = await fetchAllNews([SOURCE, failing], NOW);

    expect(result.items).toHaveLength(1);
    expect(result.stats.map((s) => s.ok)).toEqual([true, false]);
  });
});
