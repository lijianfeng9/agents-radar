import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs";
import { toNewsSource, loadConfig } from "../config.ts";

// ---------------------------------------------------------------------------
// toNewsSource
// ---------------------------------------------------------------------------

describe("toNewsSource", () => {
  it("converts a basic entry", () => {
    const result = toNewsSource({ id: "qbitai", name: "量子位", url: "https://www.qbitai.com/feed" });
    expect(result).toEqual({ id: "qbitai", name: "量子位", url: "https://www.qbitai.com/feed" });
  });

  it("drops entries disabled explicitly", () => {
    const result = toNewsSource({ id: "x", name: "X", url: "https://x.example/feed", enabled: false });
    expect(result).toBeNull();
  });

  it("drops entries missing required fields", () => {
    expect(toNewsSource({ name: "X", url: "https://x.example/feed" })).toBeNull();
    expect(toNewsSource({ id: "x", url: "https://x.example/feed" })).toBeNull();
    expect(toNewsSource({ id: "x", name: "X" })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// loadConfig
// ---------------------------------------------------------------------------

describe("loadConfig", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns built-in defaults when config file does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const config = loadConfig("/nonexistent/config.yml");
    expect(config.newsSources.map((s) => s.id)).toEqual([
      "qbitai",
      "leiphone",
      "tmtpost",
      "ifanr",
      "oschina",
      "sspai",
      "appinn",
    ]);
  });

  it("loads news_sources from valid YAML in file order, skipping disabled entries", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(`
news_sources:
  - id: a
    name: A 媒体
    url: https://a.example/feed
  - id: b
    name: B 媒体
    url: https://b.example/feed
    enabled: false
  - id: c
    name: C 媒体
    url: https://c.example/feed
`);
    const config = loadConfig("test.yml");
    expect(config.newsSources).toEqual([
      { id: "a", name: "A 媒体", url: "https://a.example/feed" },
      { id: "c", name: "C 媒体", url: "https://c.example/feed" },
    ]);
  });

  it("falls back to defaults when every custom entry is invalid", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("news_sources:\n  - id: broken\n");
    const config = loadConfig("test.yml");
    expect(config.newsSources).toHaveLength(7);
    expect(config.newsSources[0]!.id).toBe("qbitai");
  });

  it("falls back to defaults for an empty news_sources list", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("news_sources: []");
    const config = loadConfig("test.yml");
    expect(config.newsSources.length).toBeGreaterThan(0);
    expect(config.newsSources[0]!.id).toBe("qbitai");
  });
});
