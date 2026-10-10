import { describe, it, expect, afterEach } from "vitest";
import { buildWecomMessage, sendToOneWebhook } from "../wecom.ts";
import type { Highlights } from "../notify.ts";

const BASE_URL = "https://example.com/radar";

describe("buildWecomMessage", () => {
  const origPagesUrl = process.env["PAGES_URL"];

  afterEach(() => {
    if (origPagesUrl !== undefined) {
      process.env["PAGES_URL"] = origPagesUrl;
    } else {
      delete process.env["PAGES_URL"];
    }
  });

  it("builds a daily message with zh + en reports", () => {
    const msg = buildWecomMessage(
      "2026-03-09",
      ["ai-cli", "ai-cli-en", "ai-agents", "ai-agents-en"],
      BASE_URL,
    );
    expect(msg).toContain("agents-radar");
    expect(msg).toContain("2026-03-09");
    expect(msg).toContain("📡");
    expect(msg).toContain(`[AI CLI 工具](${BASE_URL}/#2026-03-09/ai-cli)`);
    expect(msg).toContain(`[AI CLI Tools](${BASE_URL}/#2026-03-09/ai-cli-en)`);
  });

  it("renders zh-only reports without en link", () => {
    const msg = buildWecomMessage("2026-03-09", ["ai-hn"], BASE_URL);
    expect(msg).toContain("HN 社区动态");
    expect(msg).not.toContain("HN Community");
  });

  it("includes Web UI and RSS links", () => {
    const msg = buildWecomMessage("2026-03-09", ["ai-cli"], BASE_URL);
    expect(msg).toContain("🌐 Web UI");
    expect(msg).toContain("RSS");
    expect(msg).toContain(`${BASE_URL}/feed.xml`);
  });

  it("uses markdown links instead of HTML", () => {
    const msg = buildWecomMessage("2026-03-09", ["ai-cli", "ai-cli-en"], BASE_URL);
    expect(msg).not.toContain("<a href=");
    expect(msg).not.toContain("<b>");
    expect(msg).toContain("**agents-radar");
    expect(msg).toContain(`[AI CLI 工具](`);
  });

  it("includes highlights when provided", () => {
    const highlights: Highlights = {
      zh: {
        "ai-cli": ["Claude Code 发布 v1.2.0", "Gemini CLI 修复 streaming"],
        "ai-agents": ["OpenClaw 新增 MCP 支持"],
      },
      en: {
        "ai-cli": ["Claude Code releases v1.2.0"],
      },
    };
    const msg = buildWecomMessage(
      "2026-03-09",
      ["ai-cli", "ai-cli-en", "ai-agents", "ai-agents-en"],
      BASE_URL,
      highlights,
    );
    expect(msg).toContain("◦ Claude Code 发布 v1.2.0");
    expect(msg).toContain("◦ Gemini CLI 修复 streaming");
    expect(msg).toContain("◦ OpenClaw 新增 MCP 支持");
  });

  it("works without highlights", () => {
    const msg = buildWecomMessage("2026-03-09", ["ai-cli", "ai-cli-en"], BASE_URL, null);
    expect(msg).toContain("AI CLI 工具");
    expect(msg).not.toContain("◦");
  });

  it("trims highlights to stay within the 4096-byte WeCom limit, keeping all report links", () => {
    const reportIds = [
      "ai-cli",
      "ai-agents",
      "ai-infra",
      "ai-web",
      "ai-trending",
      "ai-hn",
      "ai-ph",
      "ai-arxiv",
      "ai-community",
    ];
    const reports = reportIds.flatMap((r) => [r, `${r}-en`]);
    const longLine = "这是一条相当长的中文摘要用于撑大消息体积示例内容";
    const highlights: Highlights = {
      zh: Object.fromEntries(
        reportIds.map((r) => [r, Array.from({ length: 6 }, (_, i) => `${longLine}第 ${i + 1} 条`)]),
      ),
      en: {},
    };

    const msg = buildWecomMessage("2026-03-09", reports, BASE_URL, highlights);

    expect(Buffer.byteLength(msg, "utf-8")).toBeLessThanOrEqual(4000);
    // Every report keeps its link even when bullets get dropped.
    for (const r of reportIds) {
      expect(msg).toContain(`${BASE_URL}/#2026-03-09/${r})`);
    }
    // The supplied highlights are long enough that trimming must have dropped
    // bullets, otherwise this test would prove nothing.
    const bulletCount = msg.split("◦").length - 1;
    expect(bulletCount).toBeGreaterThan(0);
    expect(bulletCount).toBeLessThan(54);
  });

  it("keeps all bullets when the message fits", () => {
    const highlights: Highlights = {
      zh: { "ai-cli": ["Claude Code 发布 v1.2.0", "Gemini CLI 修复 streaming"] },
      en: {},
    };
    const msg = buildWecomMessage("2026-03-09", ["ai-cli", "ai-cli-en"], BASE_URL, highlights);
    expect(msg).toContain("◦ Claude Code 发布 v1.2.0");
    expect(msg).toContain("◦ Gemini CLI 修复 streaming");
  });
});

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
    await expect(sendToOneWebhook("https://example.com/hook", "hi")).resolves.toBeUndefined();
  });

  it("throws when WeCom returns a non-zero errcode despite HTTP 200", async () => {
    mockFetch({ errcode: 93000, errmsg: "invalid webhook url" });
    await expect(sendToOneWebhook("https://example.com/hook", "hi")).rejects.toThrow(/errcode 93000/);
  });

  it("throws on a non-JSON body", async () => {
    globalThis.fetch = (async () =>
      new Response("<html>gateway error</html>", { status: 200 })) as typeof fetch;
    await expect(sendToOneWebhook("https://example.com/hook", "hi")).rejects.toThrow(/non-JSON/);
  });
});
