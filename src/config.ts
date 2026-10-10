/**
 * Loads and validates agents-radar configuration from config.yml.
 * Falls back to built-in defaults if the file is missing or the section absent.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { NewsSource } from "./news.ts";

interface RawNewsSource {
  id?: string;
  name?: string;
  url?: string;
  enabled?: boolean;
}

interface RawConfig {
  news_sources?: RawNewsSource[];
}

export interface RadarConfig {
  /** Ordered by priority — earlier sources win duplicate merges. */
  newsSources: NewsSource[];
}

// ---------------------------------------------------------------------------
// Defaults (mirrors config.yml)
// ---------------------------------------------------------------------------

const DEFAULT_NEWS_SOURCES: NewsSource[] = [
  { id: "qbitai", name: "量子位", url: "https://www.qbitai.com/feed" },
  { id: "leiphone", name: "雷峰网", url: "https://www.leiphone.com/feed" },
  { id: "tmtpost", name: "钛媒体", url: "https://www.tmtpost.com/feed" },
  { id: "ifanr", name: "爱范儿", url: "https://www.ifanr.com/feed" },
  { id: "oschina", name: "开源中国", url: "https://www.oschina.net/news/rss" },
  { id: "sspai", name: "少数派", url: "https://sspai.com/feed" },
  { id: "appinn", name: "小众软件", url: "https://www.appinn.com/feed/" },
];

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export function toNewsSource(e: RawNewsSource): NewsSource | null {
  if (e.enabled === false) return null;
  if (!e.id || !e.name || !e.url) return null;
  return { id: e.id, name: e.name, url: e.url };
}

function pickSources(raw: RawNewsSource[] | undefined): NewsSource[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_NEWS_SOURCES;
  const sources = raw.map(toNewsSource).filter((s): s is NewsSource => s !== null);
  return sources.length > 0 ? sources : DEFAULT_NEWS_SOURCES;
}

export function loadConfig(configPath = "config.yml"): RadarConfig {
  const resolved = path.resolve(configPath);

  if (!fs.existsSync(resolved)) {
    console.log(`[config] ${configPath} not found — using built-in defaults.`);
    return { newsSources: DEFAULT_NEWS_SOURCES };
  }

  const raw = yaml.load(fs.readFileSync(resolved, "utf-8")) as RawConfig;
  const newsSources = pickSources(raw?.news_sources);
  console.log(`[config] Loaded from ${configPath}: ${newsSources.length} news sources`);
  return { newsSources };
}
