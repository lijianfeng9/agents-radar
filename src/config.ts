/**
 * Loads and validates agents-radar configuration from config.yml.
 * Falls back to built-in defaults if the file is missing or a section is absent.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { RepoConfig } from "./github.ts";

// ---------------------------------------------------------------------------
// Schema types
// ---------------------------------------------------------------------------

interface RawRepoEntry {
  id: string;
  repo: string;
  name: string;
  paginated?: boolean;
  discussions?: boolean;
}

interface RawConfig {
  agents_repos?: RawRepoEntry[];
  creator_repos?: RawRepoEntry[];
  office_repos?: RawRepoEntry[];
  aigc_repos?: RawRepoEntry[];
}

export const GROUP_IDS = ["ai-hot-agents", "ai-creator", "ai-office", "ai-aigc"] as const;

export type GroupId = (typeof GROUP_IDS)[number];

export interface RadarGroup {
  id: GroupId;
  repos: RepoConfig[];
}

export interface RadarConfig {
  groups: RadarGroup[];
}

// ---------------------------------------------------------------------------
// Defaults (mirrors config.yml)
// ---------------------------------------------------------------------------

// 热门智能体：agent 框架、个人助理、桌面端 agent 产品。更新频繁，多数分页抓取。
const DEFAULT_AGENTS_REPOS: RepoConfig[] = [
  { id: "hermes-agent", repo: "NousResearch/hermes-agent", name: "Hermes Agent", paginated: true },
  { id: "agent-reach", repo: "Panniantong/Agent-Reach", name: "Agent Reach", paginated: true },
  { id: "career-ops", repo: "career-ops-hq/career-ops", name: "Career Ops", paginated: true },
  { id: "cherry-studio", repo: "CherryHQ/cherry-studio", name: "Cherry Studio", paginated: true },
  { id: "nanobot", repo: "HKUDS/nanobot", name: "Nanobot", paginated: true },
  { id: "cowagent", repo: "zhayujie/CowAgent", name: "CowAgent" },
];

// 博主 / 内容创作者赋能：短视频生成、数字人、配音翻译、自动分发。
const DEFAULT_CREATOR_REPOS: RepoConfig[] = [
  {
    id: "moneyprinter-turbo",
    repo: "harry0703/MoneyPrinterTurbo",
    name: "MoneyPrinterTurbo",
    paginated: true,
  },
  { id: "openmontage", repo: "calesthio/OpenMontage", name: "OpenMontage", paginated: true },
  { id: "pyvideotrans", repo: "jianchang512/pyvideotrans", name: "pyVideoTrans", paginated: true },
  { id: "toonflow", repo: "HBAI-Ltd/Toonflow-app", name: "Toonflow", paginated: true },
  { id: "opencreator", repo: "krillinai/OpenCreator", name: "OpenCreator" },
  { id: "livetalking", repo: "lipku/LiveTalking", name: "LiveTalking" },
];

// 办公与效率：文档/表格/演示、工作流自动化、知识管理。
const DEFAULT_OFFICE_REPOS: RepoConfig[] = [
  { id: "n8n", repo: "n8n-io/n8n", name: "n8n", paginated: true },
  { id: "ppt-master", repo: "hugohe3/ppt-master", name: "PPT Master", paginated: true },
  { id: "siyuan", repo: "siyuan-note/siyuan", name: "SiYuan", paginated: true },
  { id: "teable", repo: "teableio/teable", name: "Teable", paginated: true },
  { id: "genoffice", repo: "genspark-ai/genoffice", name: "GenOffice" },
  { id: "presenton", repo: "presenton/presenton", name: "Presenton" },
];

// AIGC：图像 / 视频 / 音频生成模型与创作工具。
const DEFAULT_AIGC_REPOS: RepoConfig[] = [
  { id: "comfyui", repo: "Comfy-Org/ComfyUI", name: "ComfyUI", paginated: true },
  {
    id: "open-generative-ai",
    repo: "Anil-matcha/Open-Generative-AI",
    name: "Open Generative AI",
    paginated: true,
  },
  { id: "invokeai", repo: "invoke-ai/InvokeAI", name: "InvokeAI", paginated: true },
  { id: "voicestudio", repo: "debpalash/VoiceStudio", name: "VoiceStudio", paginated: true },
  { id: "hunyuanvideo", repo: "Tencent-Hunyuan/HunyuanVideo", name: "HunyuanVideo" },
  { id: "gpt-sovits", repo: "RVC-Boss/GPT-SoVITS", name: "GPT-SoVITS", paginated: true },
];

const DEFAULT_REPOS: Record<GroupId, RepoConfig[]> = {
  "ai-hot-agents": DEFAULT_AGENTS_REPOS,
  "ai-creator": DEFAULT_CREATOR_REPOS,
  "ai-office": DEFAULT_OFFICE_REPOS,
  "ai-aigc": DEFAULT_AIGC_REPOS,
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export function toRepoConfig(e: RawRepoEntry): RepoConfig {
  return {
    id: e.id,
    repo: e.repo,
    name: e.name,
    ...(e.paginated ? { paginated: true } : {}),
    ...(e.discussions ? { discussions: true } : {}),
  };
}

function pickRepos(raw: RawRepoEntry[] | undefined, fallback: RepoConfig[]): RepoConfig[] {
  return Array.isArray(raw) && raw.length > 0 ? raw.map(toRepoConfig) : fallback;
}

export function loadConfig(configPath = "config.yml"): RadarConfig {
  const resolved = path.resolve(configPath);

  if (!fs.existsSync(resolved)) {
    console.log(`[config] ${configPath} not found — using built-in defaults.`);
    return { groups: GROUP_IDS.map((id) => ({ id, repos: DEFAULT_REPOS[id] })) };
  }

  const raw = yaml.load(fs.readFileSync(resolved, "utf-8")) as RawConfig;

  const groups: RadarGroup[] = [
    { id: "ai-hot-agents", repos: pickRepos(raw?.agents_repos, DEFAULT_AGENTS_REPOS) },
    { id: "ai-creator", repos: pickRepos(raw?.creator_repos, DEFAULT_CREATOR_REPOS) },
    { id: "ai-office", repos: pickRepos(raw?.office_repos, DEFAULT_OFFICE_REPOS) },
    { id: "ai-aigc", repos: pickRepos(raw?.aigc_repos, DEFAULT_AIGC_REPOS) },
  ];

  console.log(
    `[config] Loaded from ${configPath}: ` +
      groups.map((g) => `${g.repos.length} repos for ${g.id}`).join(", "),
  );

  return { groups };
}
