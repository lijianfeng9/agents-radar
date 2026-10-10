import { describe, it, expect } from "vitest";
import { buildDailyNewsMarkdown, type DailyNewsRenderInput } from "../report-builders.ts";
import type { DailyNewsItem, DailyNewsSections } from "../prompts-data.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeItem(over: Partial<DailyNewsItem> = {}): DailyNewsItem {
  return {
    title: "某模型发布",
    summary: "一句话说明",
    url: "https://example.com/a",
    ...over,
  };
}

function makeSections(over: Partial<DailyNewsSections> = {}): DailyNewsSections {
  return { llm: [], agents: [], creator: [], office: [], ...over };
}

function makeInput(over: Partial<DailyNewsRenderInput> = {}): DailyNewsRenderInput {
  return {
    dateStr: "2026-03-09",
    utcStr: "2026-03-09 01:10",
    sourceNames: ["量子位", "雷峰网"],
    fetchedCount: 45,
    summary: ["速览一", "速览二"],
    sections: makeSections(),
    trending: [],
    footer: "",
    ...over,
  };
}

// ---------------------------------------------------------------------------
// buildDailyNewsMarkdown
// ---------------------------------------------------------------------------

describe("buildDailyNewsMarkdown", () => {
  it("renders the title, sources and meta line", () => {
    const md = buildDailyNewsMarkdown(makeInput());
    expect(md).toContain("# AI 每日要闻 2026-03-09");
    expect(md).toContain(
      "> 数据来源: 量子位 · 雷峰网 | 生成时间: 2026-03-09 01:10 UTC | 要闻 0 条 / 抓取 45 条",
    );
  });

  it("renders summary bullets", () => {
    const md = buildDailyNewsMarkdown(makeInput());
    expect(md).toContain("## 今日速览\n\n- 速览一\n- 速览二");
  });

  it("omits the summary block when there are no bullets", () => {
    const md = buildDailyNewsMarkdown(makeInput({ summary: [] }));
    expect(md).not.toContain("今日速览");
  });

  it("renders sections with linked items and skips empty ones", () => {
    const md = buildDailyNewsMarkdown(
      makeInput({
        sections: makeSections({
          llm: [makeItem()],
          office: [makeItem({ title: "办公工具更新", summary: "效率提升", url: "https://example.com/b" })],
        }),
      }),
    );
    expect(md).toContain("## 🔥 大模型动向\n\n- [某模型发布](https://example.com/a) — 一句话说明");
    expect(md).toContain("## 💼 办公提效\n\n- [办公工具更新](https://example.com/b) — 效率提升");
    expect(md).not.toContain("## 🤖");
    expect(md).not.toContain("## 🎬");
    // 1 + 1 items across sections.
    expect(md).toContain("要闻 2 条 / 抓取 45 条");
  });

  it("counts items across all four sections", () => {
    const md = buildDailyNewsMarkdown(
      makeInput({
        sections: makeSections({
          llm: [makeItem({ url: "https://example.com/1" })],
          agents: [makeItem({ url: "https://example.com/2" })],
          creator: [makeItem({ url: "https://example.com/3" })],
          office: [makeItem({ url: "https://example.com/4" })],
        }),
      }),
    );
    expect(md).toContain("要闻 4 条 / 抓取 45 条");
  });

  it("strips brackets from titles so the markdown link stays valid", () => {
    const md = buildDailyNewsMarkdown(
      makeInput({
        sections: makeSections({
          agents: [makeItem({ title: "独家[首发]：开源项目", url: "https://example.com/c" })],
        }),
      }),
    );
    expect(md).toContain("- [独家首发：开源项目](https://example.com/c) — 一句话说明");
  });

  it("renders the trending table with fetched stars", () => {
    const md = buildDailyNewsMarkdown(
      makeInput({
        trending: [
          {
            repo: "openclaw/openclaw",
            url: "https://github.com/openclaw/openclaw",
            stars: "88,000（今日 +1,200）",
            summary: "个人 AI 助手",
          },
        ],
      }),
    );
    expect(md).toContain("## 📈 GitHub 趋势");
    expect(md).toContain("| 项目 | Stars | 说明 |");
    expect(md).toContain(
      "| [openclaw/openclaw](https://github.com/openclaw/openclaw) | 88,000（今日 +1,200） | 个人 AI 助手 |",
    );
  });

  it("omits the trending section when there are no repos", () => {
    const md = buildDailyNewsMarkdown(makeInput());
    expect(md).not.toContain("GitHub 趋势");
  });

  it("appends the footer verbatim at the end", () => {
    const footer = "\n\n---\n*本日报由 agents-radar 自动生成。*";
    const md = buildDailyNewsMarkdown(makeInput({ footer }));
    expect(md.endsWith(footer)).toBe(true);
  });
});
