import { describe, it, expect } from "vitest";
import { NEWS_REPORT, FOOTER, NOTIFY_LABELS, REPORT_LABELS } from "../i18n.ts";

// ---------------------------------------------------------------------------
// FOOTER
// ---------------------------------------------------------------------------

describe("FOOTER", () => {
  it("has both zh and en", () => {
    expect(FOOTER.autoGen.zh).toBeTruthy();
    expect(FOOTER.autoGen.en).toBeTruthy();
    expect(FOOTER.autoGen.zh).not.toBe(FOOTER.autoGen.en);
  });
});

// ---------------------------------------------------------------------------
// NEWS_REPORT
// ---------------------------------------------------------------------------

describe("NEWS_REPORT", () => {
  it("carries the report title and issue metadata", () => {
    expect(NEWS_REPORT.title).toBe("AI 每日要闻");
    expect(NEWS_REPORT.issueTitle("2026-10-10")).toContain("AI 每日要闻");
    expect(NEWS_REPORT.issueTitle("2026-10-10")).toContain("2026-10-10");
    expect(NEWS_REPORT.issueLabel).toBe("ai-news");
  });

  it("formats the source line and the meta line", () => {
    expect(NEWS_REPORT.sources(["量子位", "雷峰网"])).toBe("数据来源: 量子位 · 雷峰网");
    const meta = NEWS_REPORT.meta("2026-10-09 23:00", 32, 45);
    expect(meta).toContain("2026-10-09 23:00 UTC");
    expect(meta).toContain("要闻 32 条");
    expect(meta).toContain("抓取 45 条");
  });

  it("covers all four sections with emoji headings", () => {
    expect(Object.keys(NEWS_REPORT.sections).sort()).toEqual(["agents", "creator", "llm", "office"]);
    expect(NEWS_REPORT.sections.llm).toContain("大模型");
    expect(NEWS_REPORT.sections.agents).toContain("智能体");
    expect(NEWS_REPORT.sections.creator).toContain("创作者");
    expect(NEWS_REPORT.sections.office).toContain("办公");
  });
});

// ---------------------------------------------------------------------------
// REPORT_LABELS
// ---------------------------------------------------------------------------

describe("REPORT_LABELS", () => {
  it("labels the current digest", () => {
    expect(REPORT_LABELS["ai-news"]).toBe("AI 每日要闻");
  });

  it("keeps labels for archived report types", () => {
    expect(REPORT_LABELS["ai-hot-agents"]).toBe("热门智能体动态日报");
    expect(REPORT_LABELS["ai-cli"]).toBeTruthy();
    expect(REPORT_LABELS["ai-weekly"]).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// NOTIFY_LABELS
// ---------------------------------------------------------------------------

describe("NOTIFY_LABELS", () => {
  it("labels the current digest in both languages", () => {
    expect(NOTIFY_LABELS["ai-news"]).toBeDefined();
    expect(NOTIFY_LABELS["ai-news"]!.zh).toBeTruthy();
    expect(NOTIFY_LABELS["ai-news"]!.en).toBeTruthy();
  });

  it("keeps labels for discontinued report types", () => {
    for (const key of ["ai-cli", "ai-agents", "ai-infra", "ai-hn", "ai-arxiv", "ai-hf", "ai-community"]) {
      expect(NOTIFY_LABELS[key]).toBeDefined();
    }
  });
});
