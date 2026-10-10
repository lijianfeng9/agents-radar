import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs";
import { toRepoConfig, loadConfig } from "../config.ts";

// ---------------------------------------------------------------------------
// toRepoConfig
// ---------------------------------------------------------------------------

describe("toRepoConfig", () => {
  it("converts a basic entry", () => {
    const result = toRepoConfig({ id: "test", repo: "org/test", name: "Test" });
    expect(result).toEqual({ id: "test", repo: "org/test", name: "Test" });
  });

  it("includes paginated when true", () => {
    const result = toRepoConfig({ id: "test", repo: "org/test", name: "Test", paginated: true });
    expect(result).toEqual({ id: "test", repo: "org/test", name: "Test", paginated: true });
  });

  it("omits paginated when false", () => {
    const result = toRepoConfig({ id: "test", repo: "org/test", name: "Test", paginated: false });
    expect(result).not.toHaveProperty("paginated");
  });

  it("includes discussions when true", () => {
    const result = toRepoConfig({ id: "test", repo: "org/test", name: "Test", discussions: true });
    expect(result).toEqual({ id: "test", repo: "org/test", name: "Test", discussions: true });
  });

  it("omits discussions when false", () => {
    const result = toRepoConfig({ id: "test", repo: "org/test", name: "Test", discussions: false });
    expect(result).not.toHaveProperty("discussions");
  });
});

// ---------------------------------------------------------------------------
// loadConfig
// ---------------------------------------------------------------------------

describe("loadConfig", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns defaults when config file does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const config = loadConfig("/nonexistent/config.yml");
    expect(config.groups.map((g) => g.id)).toEqual(["ai-hot-agents", "ai-creator", "ai-office", "ai-aigc"]);
    for (const group of config.groups) {
      expect(group.repos.length).toBeGreaterThan(0);
    }
    expect(config.groups[0]!.repos[0]!.id).toBe("hermes-agent");
    expect(config.groups[3]!.repos[0]!.id).toBe("comfyui");
  });

  it("loads agents_repos from valid YAML", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(`
agents_repos:
  - id: custom-agent
    repo: org/custom-agent
    name: Custom Agent
    paginated: true
`);
    const config = loadConfig("test.yml");
    expect(config.groups[0]!.id).toBe("ai-hot-agents");
    expect(config.groups[0]!.repos).toEqual([
      { id: "custom-agent", repo: "org/custom-agent", name: "Custom Agent", paginated: true },
    ]);
  });

  it("falls back to defaults for empty agents_repos", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("agents_repos: []");
    const config = loadConfig("test.yml");
    expect(config.groups[0]!.repos.length).toBeGreaterThan(0);
    expect(config.groups[0]!.repos[0]!.id).toBe("hermes-agent");
  });

  it("loads aigc_repos from valid YAML", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(`
aigc_repos:
  - id: custom-gen
    repo: org/custom-gen
    name: Custom Gen
    discussions: true
`);
    const config = loadConfig("test.yml");
    expect(config.groups[3]!.id).toBe("ai-aigc");
    expect(config.groups[3]!.repos).toEqual([
      { id: "custom-gen", repo: "org/custom-gen", name: "Custom Gen", discussions: true },
    ]);
  });

  it("keeps every group even when only one section is present", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(`
office_repos:
  - id: o1
    repo: org/o1
    name: O1
`);
    const config = loadConfig("test.yml");
    expect(config.groups).toHaveLength(4);
    expect(config.groups[2]!.repos).toEqual([{ id: "o1", repo: "org/o1", name: "O1" }]);
    expect(config.groups[0]!.repos.length).toBeGreaterThan(0);
  });
});
