import { describe, it, expect } from "vitest";
import { buildGroupReportContent } from "../report-builders.ts";
import type { RepoDigest } from "../prompts.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDigest(overrides: Partial<RepoDigest> = {}): RepoDigest {
  return {
    config: { id: "test-tool", repo: "org/test-tool", name: "TestTool" },
    issues: [],
    prs: [],
    releases: [],
    discussions: [],
    summary: "Test summary content",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildGroupReportContent
// ---------------------------------------------------------------------------

describe("buildGroupReportContent", () => {
  it("includes title, meta, links and all sections (zh)", () => {
    const digests = [
      makeDigest({ config: { id: "hermes-agent", repo: "NousResearch/hermes-agent", name: "Hermes Agent" } }),
      makeDigest({ config: { id: "nanobot", repo: "HKUDS/nanobot", name: "Nanobot" } }),
    ];
    const result = buildGroupReportContent(
      "ai-hot-agents",
      digests,
      "Comparison content",
      "2026-03-09 00:00",
      "2026-03-09",
      "\n---\nfooter",
    );

    expect(result).toContain("# 热门智能体动态日报 2026-03-09");
    expect(result).toContain("覆盖项目: 2 个");
    expect(result).toContain("[Hermes Agent](https://github.com/NousResearch/hermes-agent)");
    expect(result).toContain("[Nanobot](https://github.com/HKUDS/nanobot)");
    expect(result).toContain("## 横向对比");
    expect(result).toContain("Comparison content");
    expect(result).toContain("## 各项目详细报告");
    expect(result).toContain("Test summary content");
    expect(result).toContain("footer");
  });

  it("renders in English", () => {
    const result = buildGroupReportContent(
      "ai-hot-agents",
      [makeDigest()],
      "comparison",
      "2026-03-09 00:00",
      "2026-03-09",
      "",
      "en",
    );
    expect(result).toContain("# Hot AI Agents Digest 2026-03-09");
    expect(result).toContain("Projects covered: 1");
    expect(result).toContain("## Cross-Project Comparison");
    expect(result).toContain("## Per-Project Reports");
  });

  it("uses the group-specific title for each direction", () => {
    expect(buildGroupReportContent("ai-creator", [makeDigest()], "c", "", "2026-03-09", "")).toContain(
      "# 创作者 AI 赋能日报 2026-03-09",
    );
    expect(buildGroupReportContent("ai-office", [makeDigest()], "c", "", "2026-03-09", "")).toContain(
      "# AI 办公效率日报 2026-03-09",
    );
    expect(buildGroupReportContent("ai-aigc", [makeDigest()], "c", "", "2026-03-09", "")).toContain(
      "# AIGC 生成内容日报 2026-03-09",
    );
  });

  it("wraps every project in a details block", () => {
    const digests = [makeDigest(), makeDigest({ config: { id: "b", repo: "org/b", name: "B" } })];
    const result = buildGroupReportContent("ai-office", digests, "c", "", "2026-03-09", "");
    const detailsCount = result.split("<details>").length - 1;
    expect(detailsCount).toBe(2);
    expect(result).toContain("</details>");
  });

  it("rejects an unknown group id", () => {
    expect(() => buildGroupReportContent("nope", [], "c", "", "2026-03-09", "")).toThrow("nope");
  });
});
