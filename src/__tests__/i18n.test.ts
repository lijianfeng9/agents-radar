import { describe, it, expect } from "vitest";
import {
  MSG,
  GROUP_REPORTS,
  WEB_REPORT,
  TRENDING_REPORT,
  PH_REPORT,
  ISSUE_LABELS,
  FOOTER,
  NOTIFY_LABELS,
  REPORT_LABELS,
} from "../i18n.ts";

// ---------------------------------------------------------------------------
// Static bilingual strings
// ---------------------------------------------------------------------------

describe("bilingual string maps", () => {
  const maps = [
    { name: "MSG.noActivity", obj: MSG.noActivity },
    { name: "MSG.summaryFailed", obj: MSG.summaryFailed },
    { name: "MSG.trendingNoData", obj: MSG.trendingNoData },
    { name: "MSG.trendingFailed", obj: MSG.trendingFailed },
    { name: "MSG.comparisonFailed", obj: MSG.comparisonFailed },
    { name: "WEB_REPORT.title", obj: WEB_REPORT.title },
    { name: "WEB_REPORT.firstCrawl", obj: WEB_REPORT.firstCrawl },
    { name: "TRENDING_REPORT.title", obj: TRENDING_REPORT.title },
    { name: "PH_REPORT.title", obj: PH_REPORT.title },
    { name: "FOOTER.autoGen", obj: FOOTER.autoGen },
  ];

  for (const { name, obj } of maps) {
    it(`${name} has both zh and en`, () => {
      expect(obj).toHaveProperty("zh");
      expect(obj).toHaveProperty("en");
      expect(obj.zh).toBeTruthy();
      expect(obj.en).toBeTruthy();
      expect(obj.zh).not.toBe(obj.en);
    });
  }
});

// ---------------------------------------------------------------------------
// GROUP_REPORTS
// ---------------------------------------------------------------------------

describe("GROUP_REPORTS", () => {
  const groupIds = ["ai-hot-agents", "ai-creator", "ai-office", "ai-aigc"];

  it("covers exactly the four daily directions", () => {
    expect(Object.keys(GROUP_REPORTS).sort()).toEqual([...groupIds].sort());
  });

  for (const gid of groupIds) {
    it(`${gid} has complete bilingual fields`, () => {
      const info = GROUP_REPORTS[gid]!;
      expect(info).toBeDefined();
      for (const field of [info.title, info.comparison, info.detail, info.persona, info.focus]) {
        expect(field.zh).toBeTruthy();
        expect(field.en).toBeTruthy();
        expect(field.zh).not.toBe(field.en);
      }
      // "AIGC" is legitimately spelled the same in both languages.
      expect(info.short.zh).toBeTruthy();
      expect(info.short.en).toBeTruthy();
      expect(info.issueLabel.zh).toBeTruthy();
      expect(info.issueLabel.en).toBeTruthy();
      expect(info.issueLabel.zh).not.toBe(info.issueLabel.en);

      const zhTitle = info.issueTitle("2026-03-12", "zh");
      const enTitle = info.issueTitle("2026-03-12", "en");
      expect(zhTitle).toContain("2026-03-12");
      expect(enTitle).toContain("2026-03-12");
      expect(zhTitle).not.toBe(enTitle);

      expect(info.meta("12:00", 5, "zh")).toContain("覆盖项目: 5 个");
      expect(info.meta("12:00", 5, "en")).toContain("Projects covered: 5");
    });
  }

  it("issue titles carry direction-specific wording", () => {
    expect(GROUP_REPORTS["ai-hot-agents"]!.issueTitle("2026-03-12", "zh")).toContain("热门智能体");
    expect(GROUP_REPORTS["ai-hot-agents"]!.issueTitle("2026-03-12", "en")).toContain("Hot AI Agents");
    expect(GROUP_REPORTS["ai-creator"]!.issueTitle("2026-03-12", "zh")).toContain("创作者");
    expect(GROUP_REPORTS["ai-office"]!.issueTitle("2026-03-12", "zh")).toContain("办公");
    expect(GROUP_REPORTS["ai-aigc"]!.issueTitle("2026-03-12", "zh")).toContain("AIGC");
  });

  it("focus lines describe the intended audience topics", () => {
    expect(GROUP_REPORTS["ai-hot-agents"]!.focus.zh).toContain("智能体");
    expect(GROUP_REPORTS["ai-creator"]!.focus.zh).toContain("博主");
    expect(GROUP_REPORTS["ai-office"]!.focus.zh).toContain("办公");
    expect(GROUP_REPORTS["ai-aigc"]!.focus.zh).toContain("图像");
  });
});

// ---------------------------------------------------------------------------
// Dynamic title functions
// ---------------------------------------------------------------------------

describe("data-source title functions", () => {
  it("WEB_REPORT.issueTitle includes first crawl flag", () => {
    expect(WEB_REPORT.issueTitle("2026-03-12", true, "zh")).toContain("首次全量");
    expect(WEB_REPORT.issueTitle("2026-03-12", false, "zh")).not.toContain("首次全量");
    expect(WEB_REPORT.issueTitle("2026-03-12", true, "en")).toContain("First Crawl");
  });

  it("TRENDING_REPORT.issueTitle produces zh and en", () => {
    expect(TRENDING_REPORT.issueTitle("2026-03-12", "zh")).toContain("开源趋势");
    expect(TRENDING_REPORT.issueTitle("2026-03-12", "en")).toContain("Open Source Trends");
  });

  it("PH_REPORT.issueTitle produces zh and en", () => {
    expect(PH_REPORT.issueTitle("2026-03-12", "zh")).toContain("Product Hunt");
    expect(PH_REPORT.issueTitle("2026-03-12", "en")).toContain("Product Hunt");
  });
});

// ---------------------------------------------------------------------------
// Dynamic content functions
// ---------------------------------------------------------------------------

describe("dynamic content helpers", () => {
  it("WEB_REPORT.newContent formats count", () => {
    expect(WEB_REPORT.newContent(10, "zh")).toContain("10 篇");
    expect(WEB_REPORT.newContent(10, "en")).toContain("10 articles");
  });

  it("WEB_REPORT.generated formats timestamp", () => {
    expect(WEB_REPORT.generated("12:00", "zh")).toContain("12:00 UTC");
    expect(WEB_REPORT.generated("12:00", "en")).toContain("12:00 UTC");
  });
});

// ---------------------------------------------------------------------------
// ISSUE_LABELS
// ---------------------------------------------------------------------------

describe("ISSUE_LABELS", () => {
  it("maps the data-source reports to label names", () => {
    expect(ISSUE_LABELS.web.zh).toBe("web");
    expect(ISSUE_LABELS.web.en).toBe("web-en");
    expect(ISSUE_LABELS.trending.en).toBe("trending-en");
    expect(ISSUE_LABELS.ph.en).toBe("ph-en");
  });
});

// ---------------------------------------------------------------------------
// REPORT_LABELS
// ---------------------------------------------------------------------------

describe("REPORT_LABELS", () => {
  it("covers the four group reports in both languages", () => {
    expect(REPORT_LABELS["ai-hot-agents"]).toBe("热门智能体动态日报");
    expect(REPORT_LABELS["ai-hot-agents-en"]).toBe("Hot AI Agents Digest");
    expect(REPORT_LABELS["ai-creator"]).toBe("创作者 AI 赋能日报");
    expect(REPORT_LABELS["ai-office-en"]).toBe("AI Office Digest");
    expect(REPORT_LABELS["ai-aigc"]).toBe("AIGC 生成内容日报");
  });

  it("keeps labels for archived report types", () => {
    expect(REPORT_LABELS["ai-cli"]).toBeTruthy();
    expect(REPORT_LABELS["ai-infra-en"]).toBeTruthy();
    expect(REPORT_LABELS["ai-weekly"]).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// NOTIFY_LABELS
// ---------------------------------------------------------------------------

describe("NOTIFY_LABELS", () => {
  it("covers all current report types", () => {
    const expected = [
      "ai-hot-agents",
      "ai-creator",
      "ai-office",
      "ai-aigc",
      "ai-web",
      "ai-trending",
      "ai-ph",
    ];
    for (const key of expected) {
      expect(NOTIFY_LABELS[key]).toBeDefined();
      expect(NOTIFY_LABELS[key]!.zh).toBeTruthy();
      expect(NOTIFY_LABELS[key]!.en).toBeTruthy();
    }
  });

  it("keeps labels for discontinued report types", () => {
    for (const key of ["ai-cli", "ai-agents", "ai-infra", "ai-hn", "ai-arxiv", "ai-hf", "ai-community"]) {
      expect(NOTIFY_LABELS[key]).toBeDefined();
    }
  });
});
