import { describe, it, expect, afterEach } from "vitest";
import {
  buildWecomText,
  buildWecomCards,
  sendToOneWebhook,
  extractOgImage,
  fetchOgImage,
  attachCardImages,
  type WecomCard,
} from "../wecom.ts";
import type { DailyNewsFile } from "../report-savers.ts";

const BASE_URL = "https://example.com/radar";

function makeNews(over: Partial<DailyNewsFile> = {}): DailyNewsFile {
  return {
    date: "2026-03-09",
    generated: "2026-03-09 01:10",
    sources: ["量子位", "雷峰网"],
    fetchedCount: 45,
    summary: ["Claude 发布新模型", "某开源智能体新增 MCP 支持"],
    sections: { llm: [], agents: [], creator: [], office: [] },
    trending: [],
    cards: [
      { title: "新模型发布", description: "推理能力全面提升", url: "https://example.com/a" },
      { title: "智能体更新", description: "新增 MCP 支持", url: "https://example.com/b" },
    ],
    ...over,
  };
}

// ---------------------------------------------------------------------------
// buildWecomText
// ---------------------------------------------------------------------------

describe("buildWecomText", () => {
  it("renders the header, bullets and the report link", () => {
    const msg = buildWecomText("2026-03-09", makeNews(), BASE_URL);
    expect(msg).toContain("📡 AI 每日要闻 · 2026-03-09");
    expect(msg).toContain("今日速览");
    expect(msg).toContain("◦ Claude 发布新模型");
    expect(msg).toContain("◦ 某开源智能体新增 MCP 支持");
    expect(msg).toContain(`📖 完整日报：${BASE_URL}/#2026-03-09/ai-news`);
    expect(msg).toContain(`🌐 日报网站：${BASE_URL}`);
  });

  it("omits the bullet block when news.json is missing", () => {
    const msg = buildWecomText("2026-03-09", null, BASE_URL);
    expect(msg).not.toContain("今日速览");
    expect(msg).not.toContain("◦");
    expect(msg).toContain(`${BASE_URL}/#2026-03-09/ai-news`);
  });

  it("carries no markdown markers so 长按复制 reproduces it exactly", () => {
    const msg = buildWecomText("2026-03-09", makeNews(), BASE_URL);
    expect(msg).not.toContain("**");
    expect(msg).not.toContain("](");
    expect(msg).not.toContain("<a href=");
    expect(msg).toContain("📡 AI 每日要闻");
  });

  it("trims bullets to fit the 2048-byte text limit, keeping the report link", () => {
    const long = "这是一条相当长的中文速览用于撑大消息体积";
    const news = makeNews({
      summary: Array.from({ length: 40 }, (_, i) => `第 ${i + 1} 条：${long}${long}`),
    });
    const msg = buildWecomText("2026-03-09", news, BASE_URL);

    expect(Buffer.byteLength(msg, "utf-8")).toBeLessThanOrEqual(2048);
    // Bullets were dropped, but the report link never is.
    const bulletCount = msg.split("◦").length - 1;
    expect(bulletCount).toBeGreaterThan(0);
    expect(bulletCount).toBeLessThan(40);
    expect(msg).toContain(`${BASE_URL}/#2026-03-09/ai-news`);
  });

  it("keeps all bullets when the message fits", () => {
    const msg = buildWecomText("2026-03-09", makeNews(), BASE_URL);
    expect(msg.split("◦").length - 1).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// buildWecomCards
// ---------------------------------------------------------------------------

describe("buildWecomCards", () => {
  it("slices to the 8-article limit, preserving order", () => {
    const cards = Array.from({ length: 10 }, (_, i) => ({
      title: `卡片 ${i + 1}`,
      description: "说明",
      url: `https://example.com/${i + 1}`,
    }));
    const out = buildWecomCards(makeNews({ cards }));
    expect(out).toHaveLength(8);
    expect(out[0]!.url).toBe("https://example.com/1");
    expect(out[7]!.url).toBe("https://example.com/8");
  });

  it("returns no cards when news.json is missing", () => {
    expect(buildWecomCards(null)).toEqual([]);
  });

  it("truncates oversized fields on character boundaries", () => {
    const out = buildWecomCards(
      makeNews({
        cards: [{ title: "标".repeat(200), description: "描".repeat(600), url: "https://example.com/a" }],
      }),
    );
    const card = out[0]!;
    expect(Buffer.byteLength(card.title, "utf-8")).toBeLessThanOrEqual(128);
    expect(Buffer.byteLength(card.description, "utf-8")).toBeLessThanOrEqual(512);
    // No replacement characters — the slice never splits a glyph.
    expect(card.title).not.toContain("\uFFFD");
    expect(card.description).not.toContain("\uFFFD");
    expect(card.url).toBe("https://example.com/a");
  });

  it("passes a card's feed image through as picurl, omitting it when absent", () => {
    const out = buildWecomCards(
      makeNews({
        cards: [
          {
            title: "有图",
            description: "",
            url: "https://example.com/a",
            image: "https://img.example.com/a.jpg",
          },
          { title: "无图", description: "", url: "https://example.com/b" },
        ],
      }),
    );
    expect(out[0]!.picurl).toBe("https://img.example.com/a.jpg");
    expect(out[1]).not.toHaveProperty("picurl");
  });
});

// ---------------------------------------------------------------------------
// extractOgImage / fetchOgImage / attachCardImages
// ---------------------------------------------------------------------------

describe("extractOgImage", () => {
  it("reads og:image regardless of attribute order", () => {
    expect(extractOgImage('<meta property="og:image" content="https://cdn.example.com/a.jpg">')).toBe(
      "https://cdn.example.com/a.jpg",
    );
    expect(extractOgImage('<meta content="https://cdn.example.com/b.jpg" property="og:image">')).toBe(
      "https://cdn.example.com/b.jpg",
    );
  });

  it("prefers og:image over twitter:image and accepts single quotes", () => {
    const html =
      "<meta name='twitter:image' content='https://cdn.example.com/t.jpg'>" +
      "<meta property='og:image' content='https://cdn.example.com/o.jpg'>";
    expect(extractOgImage(html)).toBe("https://cdn.example.com/o.jpg");
  });

  it("falls back to twitter:image", () => {
    expect(extractOgImage('<meta name="twitter:image" content="https://cdn.example.com/t.jpg">')).toBe(
      "https://cdn.example.com/t.jpg",
    );
  });

  it("returns undefined when the page declares no cover", () => {
    expect(extractOgImage("<html><head><title>x</title></head></html>")).toBeUndefined();
  });
});

describe("fetchOgImage", () => {
  const origFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it("resolves a relative cover against the article URL", async () => {
    globalThis.fetch = (async () =>
      new Response('<html><head><meta property="og:image" content="/img/cover.png"></head></html>', {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })) as typeof fetch;
    await expect(fetchOgImage("https://example.com/posts/1")).resolves.toBe(
      "https://example.com/img/cover.png",
    );
  });

  it("returns undefined for non-HTML responses", async () => {
    globalThis.fetch = (async () =>
      new Response("x", { status: 200, headers: { "Content-Type": "image/png" } })) as typeof fetch;
    await expect(fetchOgImage("https://example.com/a")).resolves.toBeUndefined();
  });

  it("swallows network errors instead of failing the push", async () => {
    globalThis.fetch = (async () => {
      throw new Error("boom");
    }) as typeof fetch;
    await expect(fetchOgImage("https://example.com/a")).resolves.toBeUndefined();
  });
});

describe("attachCardImages", () => {
  const origFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it("attaches covers and keeps cards usable when one fetch fails", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      if (String(input).includes("fail")) throw new Error("boom");
      return new Response('<meta property="og:image" content="https://cdn.example.com/ok.jpg">', {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }) as typeof fetch;

    const cards: WecomCard[] = [
      { title: "a", description: "d", url: "https://example.com/ok" },
      { title: "b", description: "d", url: "https://example.com/fail" },
    ];
    await attachCardImages(cards);
    expect(cards[0]!.picurl).toBe("https://cdn.example.com/ok.jpg");
    expect(cards[1]!.picurl).toBeUndefined();
    expect(cards[1]!.url).toBe("https://example.com/fail");
  });

  it("skips the og:image fetch for cards that already have a feed image", async () => {
    let fetched = 0;
    globalThis.fetch = (async () => {
      fetched++;
      return new Response('<meta property="og:image" content="https://cdn.example.com/og.jpg">', {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }) as typeof fetch;

    const cards: WecomCard[] = [
      { title: "a", description: "d", url: "https://example.com/a", picurl: "https://img.example.com/a.jpg" },
    ];
    await attachCardImages(cards);
    expect(cards[0]!.picurl).toBe("https://img.example.com/a.jpg");
    expect(fetched).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// sendToOneWebhook
// ---------------------------------------------------------------------------

describe("sendToOneWebhook", () => {
  const origFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  const mockFetch = (body: unknown, status = 200): void => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;
  };

  it("resolves when WeCom reports errcode 0", async () => {
    mockFetch({ errcode: 0, errmsg: "ok" });
    const payload = { msgtype: "markdown", markdown: { content: "hi" } };
    await expect(sendToOneWebhook("https://example.com/hook", payload)).resolves.toBeUndefined();
  });

  it("posts the payload as JSON", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
      calls.push({ url: String(args[0]), init: args[1] ?? {} });
      return new Response(JSON.stringify({ errcode: 0 }), { status: 200 });
    }) as typeof fetch;

    const payload = { msgtype: "markdown", markdown: { content: "hi" } };
    await sendToOneWebhook("https://example.com/hook", payload);

    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe("https://example.com/hook");
    expect(calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual(payload);
  });

  it("throws when WeCom returns a non-zero errcode despite HTTP 200", async () => {
    mockFetch({ errcode: 93000, errmsg: "invalid webhook url" });
    await expect(sendToOneWebhook("https://example.com/hook", {})).rejects.toThrow(/errcode 93000/);
  });

  it("throws on a non-JSON body", async () => {
    globalThis.fetch = (async () =>
      new Response("<html>gateway error</html>", { status: 200 })) as typeof fetch;
    await expect(sendToOneWebhook("https://example.com/hook", {})).rejects.toThrow(/non-JSON/);
  });

  it("throws on a non-200 HTTP response", async () => {
    mockFetch({ errcode: 0 }, 500);
    await expect(sendToOneWebhook("https://example.com/hook", {})).rejects.toThrow(/HTTP 500/);
  });
});
