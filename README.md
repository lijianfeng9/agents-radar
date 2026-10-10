# agents-radar

English | [中文](./README.zh.md)

A GitHub Actions workflow that runs every morning at ~07:00 CST. It aggregates AI ecosystem signals from four directions — hot agents, creator tooling, office AI and AIGC — and publishes bilingual (Chinese + English) daily digests as GitHub Issues and committed Markdown files.

### Data Sources

| Source | Type | Data |
|--------|------|------|
| [GitHub Repos](https://github.com) | API | Issues, PRs, releases from 24 tracked repos across 4 groups (agents / creator / office / AIGC) |
| [GitHub Trending](https://github.com/trending) | HTML + API | Daily trending repos + topic search (7-day window) |
| [Product Hunt](https://www.producthunt.com) | GraphQL API | Yesterday's top AI products by votes |
| [Anthropic](https://anthropic.com) + [OpenAI](https://openai.com) | Sitemap | New articles detected via `lastmod` diff |

## Web UI

**[https://duanyytop.github.io/agents-radar](https://duanyytop.github.io/agents-radar)**

Browse all historical digests in a clean, dark-themed interface — no login required. Reports are rendered from the Markdown files in this repo via GitHub Pages.

![Web UI](assets/web-en.png)

## Telegram Channel & Feishu Group

Subscribe to get daily digest notifications pushed directly to your preferred platform. Each message links to all reports for that day (ZH and EN variants) plus the Web UI and RSS feed.

<table>
  <tr>
    <td align="center"><b><a href="https://t.me/agents_radar">Join Telegram Channel</a></b></td>
    <td align="center"><b><a href="https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=b56v3be8-b027-4ee6-abc4-65bf1f80bccd">Join Feishu Group</a></b></td>
  </tr>
  <tr>
    <td><img src="assets/telegram.jpg" width="300" alt="Telegram notification"></td>
    <td><img src="assets/feishu.jpg" width="300" alt="Feishu notification"></td>
  </tr>
</table>

## RSS Feed

**[https://duanyytop.github.io/agents-radar/feed.xml](https://duanyytop.github.io/agents-radar/feed.xml)**

Subscribe in any RSS reader (Feedly, Reeder, NewsBlur, etc.) to receive new digests automatically. The feed includes the latest 30 reports across all report types, updated daily alongside `manifest.json`.

## MCP Server

**`https://agents-radar-mcp.duanyytop.workers.dev`**

A hosted [Model Context Protocol](https://modelcontextprotocol.io) server that exposes agents-radar data as tools. Any MCP-compatible client (Claude Desktop, OpenClaw, etc.) can query the latest AI ecosystem reports directly.

**Available tools:**

| Tool | Description |
|------|-------------|
| `list_reports` | List available dates and report types (last N days) |
| `get_latest` | Fetch the most recent report of a given type |
| `get_report` | Fetch a specific report by date and type |
| `search` | Keyword search across recent reports |

**Claude Desktop setup** — add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agents-radar": {
      "url": "https://agents-radar-mcp.duanyytop.workers.dev"
    }
  }
}
```

Restart Claude Desktop after saving. You can then ask Claude things like:
- *"What's the latest in AI CLI tools?"* → calls `get_latest`
- *"Search for Claude Code mentions this week"* → calls `search`
- *"Show me the AI trending report for 2026-03-05"* → calls `get_report`

**OpenClaw setup** — run the following command:

```bash
openclaw mcp add --transport http agents-radar https://agents-radar-mcp.duanyytop.workers.dev
```

Or add it manually to `~/.openclaw/openclaw.json`:

```json
{
  "mcpServers": {
    "agents-radar": {
      "type": "http",
      "url": "https://agents-radar-mcp.duanyytop.workers.dev"
    }
  }
}
```

You can then ask OpenClaw things like:
- *"What's the latest in AI CLI tools?"* → calls `get_latest`
- *"Search for Claude Code mentions this week"* → calls `search`
- *"Show me the AI trending report for 2026-03-05"* → calls `get_report`

**Self-hosting** — deploy your own instance from the `mcp/` directory:

```bash
cd mcp
pnpm install
wrangler deploy
```

## Tracked sources

Reports are organized into four audience-facing directions. Each direction tracks 6 GitHub repositories, generating a per-repo report plus a cross-project comparison — all written for non-developer readers (content, product, operations teams).

### 🤖 Hot AI Agents (热门智能体动态)

Agent projects people are actually using and updating, from personal assistants to domain agents.

| Project | Repository |
|---------|-----------|
| Hermes Agent | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| Agent Reach | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) |
| Career Ops | [career-ops-hq/career-ops](https://github.com/career-ops-hq/career-ops) |
| Cherry Studio | [CherryHQ/cherry-studio](https://github.com/CherryHQ/cherry-studio) |
| Nanobot | [HKUDS/nanobot](https://github.com/HKUDS/nanobot) |
| CowAgent | [zhayujie/CowAgent](https://github.com/zhayujie/CowAgent) |

### 🎬 Creator AI (博主/创作者赋能)

Video, audio and content-creation tooling for bloggers and new-media creators.

| Project | Repository |
|---------|-----------|
| MoneyPrinterTurbo | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) |
| OpenMontage | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) |
| pyVideoTrans | [jianchang512/pyvideotrans](https://github.com/jianchang512/pyvideotrans) |
| Toonflow | [HBAI-Ltd/Toonflow-app](https://github.com/HBAI-Ltd/Toonflow-app) |
| OpenCreator | [krillinai/OpenCreator](https://github.com/krillinai/OpenCreator) |
| LiveTalking | [lipku/LiveTalking](https://github.com/lipku/LiveTalking) |

### 💼 AI Office (办公与效率)

Productivity and automation: workflow automation, notes, tables, slides and documents.

| Project | Repository |
|---------|-----------|
| n8n | [n8n-io/n8n](https://github.com/n8n-io/n8n) |
| PPT Master | [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) |
| SiYuan | [siyuan-note/siyuan](https://github.com/siyuan-note/siyuan) |
| Teable | [teableio/teable](https://github.com/teableio/teable) |
| GenOffice | [genspark-ai/genoffice](https://github.com/genspark-ai/genoffice) |
| Presenton | [presenton/presenton](https://github.com/presenton/presenton) |

### 🎨 AIGC

Image, video and audio generation stacks — the tooling behind generative content.

| Project | Repository |
|---------|-----------|
| ComfyUI | [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) |
| Open Generative AI | [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) |
| InvokeAI | [invoke-ai/InvokeAI](https://github.com/invoke-ai/InvokeAI) |
| VoiceStudio | [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) |
| HunyuanVideo | [Tencent-Hunyuan/HunyuanVideo](https://github.com/Tencent-Hunyuan/HunyuanVideo) |
| GPT-SoVITS | [RVC-Boss/GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) |

All four lists live in `config.yml` (`agents_repos`, `creator_repos`, `office_repos`, `aigc_repos`) — add or remove repos there, no code changes needed.

### GitHub AI Trending

Two data sources are fetched in parallel every day:

| Source | Details |
|--------|---------|
| [github.com/trending](https://github.com/trending?since=daily) | Today's trending repos — parsed from HTML; includes today's new star count |
| GitHub Search API | Repos active in the last 7 days matching 6 topics aligned to the four directions: `ai-agent`, `aigc`, `llm`, `image-generation`, `text-to-video`, `text-to-speech` |

The LLM filters out non-AI repos, classifies the rest by direction (🤖 agents / 🎬 creator tools / 💼 office / 🎨 AIGC), and extracts trend signals.

### Official web content (sitemap-based)

| Organization | Site | Tracked sections |
|---|---|---|
| Anthropic | [anthropic.com](https://www.anthropic.com) | `/news/`, `/research/`, `/engineering/`, `/learn/` |
| OpenAI | [openai.com](https://openai.com) | research, publication, release, company, engineering, milestone, learn-guides, safety, product |

New articles are detected by comparing sitemap `lastmod` timestamps against a persisted state file (`digests/web-state.json`). On the **first run**, up to 25 recent articles per site are fetched and a comprehensive overview report is generated. On subsequent runs, only new or updated URLs trigger a report; if nothing changed, the web report step is skipped entirely.

## Features

- Tracks 24 AI projects across four directions — 🤖 hot agents, 🎬 creator tooling, 💼 office AI, 🎨 AIGC
- Generates a per-project summary plus a cross-project comparison for each direction, written in plain language for non-developer readers
- Scrapes official Anthropic and OpenAI web content via sitemaps; detects new articles incrementally
- Monitors GitHub Trending daily + searches 6 AI topics; classifies repos by direction and extracts trend signals
- Publishes GitHub Issues for each report type; commits Markdown files to `digests/YYYY-MM-DD/`
- Pushes a daily digest notification to Telegram / Feishu / WeCom (企业微信) when webhooks are configured
- Generates every report body once in English and translates it to Chinese, instead of running the whole pipeline twice per language
- Runs on a daily schedule via GitHub Actions; supports manual triggering
- All tracked repositories are configurable via `config.yml` — no code changes needed

## Setup

### 1. Fork this repository

### 2. Customize `config.yml` (optional)

Edit `config.yml` in the repo root to add, remove, or replace the tracked repositories. The file is fully commented. No code changes are needed — the pipeline reads it on every run and falls back to built-in defaults if the file is absent.

```yaml
# Add a repo to the hot-agents report
agents_repos:
  - id: my-agent
    repo: owner/my-agent
    name: My Agent
    paginated: true   # for repos with >100 daily issue/PR updates

# The other three sections work the same way:
# creator_repos  → ai-creator   (博主/创作者赋能)
# office_repos   → ai-office    (办公与效率)
# aigc_repos     → ai-aigc      (AIGC)
```

### 3. Add Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Required | Description |
|--------|----------|-------------|
| `LLM_PROVIDER` | optional | `anthropic` (default), `openai`, `github-copilot`, `openrouter`, `deepseek`, or `qwen` |
| `ANTHROPIC_API_KEY` | if Anthropic | API key — works with both Anthropic and Kimi Code |
| `ANTHROPIC_BASE_URL` | optional | API endpoint override. Set to `https://api.kimi.com/coding/` for Kimi Code; leave unset for Anthropic |
| `OPENAI_API_KEY` | if OpenAI | OpenAI API key |
| `OPENAI_BASE_URL` | optional | OpenAI endpoint override |
| `OPENROUTER_API_KEY` | if OpenRouter | OpenRouter API key |
| `DEEPSEEK_API_KEY` | if DeepSeek | DeepSeek API key |
| `DASHSCOPE_API_KEY` | if Qwen | Alibaba Model Studio API key |
| `TELEGRAM_BOT_TOKEN` | optional | Telegram bot token from [@BotFather](https://t.me/BotFather). If set, a message is sent after each digest run |
| `TELEGRAM_CHAT_ID` | optional | Telegram chat/channel/group ID to send notifications to |
| `FEISHU_WEBHOOK_URLS` | optional | Comma-separated Feishu custom bot webhook URLs. If set, a card message is sent to each group after each digest run |
| `WECOM_WEBHOOK_URLS` | optional | Comma-separated WeCom (企业微信) group robot webhook URLs. If set, a markdown message is sent to each group after each digest run |

> `GITHUB_TOKEN` is provided automatically by GitHub Actions. When using `github-copilot` as the provider, the same `GITHUB_TOKEN` is used for LLM calls.

**Setting up Telegram notifications** (optional):
1. Message [@BotFather](https://t.me/BotFather) on Telegram, create a bot, and copy the token
2. Add the bot to your channel/group, or start a DM with it
3. Get the chat ID via [@userinfobot](https://t.me/userinfobot) or the [getUpdates](https://core.telegram.org/bots/api#getupdates) API
4. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as repository secrets

**Setting up WeCom notifications** (optional):
1. In your WeCom group, open "Group Robot" (群机器人) → "Add Robot" and copy the webhook URL
2. Add `WECOM_WEBHOOK_URLS` as a repository secret (comma-separate multiple URLs)

> If neither secret is set, the notification step is silently skipped.

### 3. Enable the workflow

Confirm the workflow is enabled in the **Actions** tab.

To test immediately, go to **Actions → Daily Agents Radar → Run workflow**.

> **First run note**: The web content step will fetch up to 50 articles (25 per site) and may take a few extra minutes. Subsequent runs are fast — only new articles are processed.

## LLM providers

Set `LLM_PROVIDER` to choose which model backend powers the digest generation. Defaults to `anthropic`.

| Provider | `LLM_PROVIDER` | Required env vars | Default model |
|----------|---------------|-------------------|---------------|
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-6` |
| OpenAI | `openai` | `OPENAI_API_KEY` | `gpt-4o` |
| GitHub Copilot | `github-copilot` | `GITHUB_TOKEN` | `gpt-4o` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` | `anthropic/claude-sonnet-4` |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` | `deepseek-v4-flash` |
| Qwen | `qwen` | `DASHSCOPE_API_KEY` | `qwen-flash` |

Override the model name with `ANTHROPIC_MODEL`, `OPENAI_MODEL`, `GITHUB_COPILOT_MODEL`, `OPENROUTER_MODEL`, `DEEPSEEK_MODEL`, or `QWEN_MODEL` respectively. The Qwen endpoint can be overridden with `DASHSCOPE_BASE_URL`.

The scheduled daily run uses `qwen` / `qwen-flash`.

The provider abstraction lives in `src/providers/` — each provider is a separate file implementing the `LlmProvider` interface. Adding a new provider only requires creating a new file and registering it in the factory.

## Running locally

```bash
pnpm install

export GITHUB_TOKEN=ghp_xxxxx

# Option A: Anthropic (default)
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

# Option B: OpenAI
# export LLM_PROVIDER=openai
# export OPENAI_API_KEY=sk-xxxxxxxx

# Option C: GitHub Copilot (uses GITHUB_TOKEN)
# export LLM_PROVIDER=github-copilot

# Option D: OpenRouter
# export LLM_PROVIDER=openrouter
# export OPENROUTER_API_KEY=sk-or-xxxxxxxx

# Option E: DeepSeek
# export LLM_PROVIDER=deepseek
# export DEEPSEEK_API_KEY=sk-xxxxxxxx

# Qwen (Alibaba Model Studio)
# export LLM_PROVIDER=qwen
# export DASHSCOPE_API_KEY=sk-xxxxxxxx

export DIGEST_REPO=your-username/agents-radar  # optional; omit to only write files

pnpm start
```

## Output format

Files are written to `digests/YYYY-MM-DD/`:

| File | Content | GitHub Issue label |
|------|---------|-------------------|
| `ai-hot-agents.md` | Hot AI agents digest — cross-project comparison + per-project details | `hot-agents` |
| `ai-creator.md` | Creator AI digest — videos, digital humans, dubbing, content production | `creator` |
| `ai-office.md` | AI office digest — documents, spreadsheets, presentations, automation | `office` |
| `ai-aigc.md` | AIGC digest — image / video / audio generation stacks | `aigc` |
| `ai-web.md` | Official web content report (only written when new content exists) | `web` |
| `ai-trending.md` | GitHub AI trending report — repos classified by direction + trend signals (only written when data is available) | `trending` |
| `ai-ph.md` | Product Hunt AI products digest (only written when `PRODUCTHUNT_TOKEN` is set and data is available) | `ph` |

A shared state file `digests/web-state.json` tracks which web URLs have been seen; it is committed alongside the daily digests.

Each report is generated in both Chinese (`ai-hot-agents.md`) and English (`ai-hot-agents-en.md`). The Web UI sidebar shows ZH / EN toggle buttons for reports that have both variants.

---

The four direction reports (`ai-hot-agents.md`, `ai-creator.md`, `ai-office.md`, `ai-aigc.md`) share one structure:
```
Projects covered: 6

## Cross-Project Comparison
  Overview / Activity table / Shared themes / Positioning differences / Signals to watch

## Per-Project Reports
  <details> Hermes Agent  — Today's highlights / Releases & updates / Key progress /
                            Community buzz / Signals to watch
  <details> Agent Reach   — ...
  <details> Career Ops    — ...
  <details> Cherry Studio — ...
  <details> Nanobot       — ...
  <details> CowAgent      — ...
```

All bodies are written in plain language for non-developer readers (content, product and operations teams), focused on "what you can do with it" rather than implementation detail.

`ai-web.md` / `ai-web-en.md` structure:
```
Sources: anthropic.com (N articles) + openai.com (N articles)

Today's summary
Anthropic / Claude highlights  (news / research / engineering / learn)
OpenAI highlights              (research / release / company / safety / ...)
Strategic signals
Notable details
[First full crawl also includes: Content landscape overview]
```

`ai-trending.md` / `ai-trending-en.md` structure:
```
Sources: GitHub Trending + GitHub Search API

Today's summary
Top repos by direction
  🤖 Agents             — agent frameworks / personal assistants / automation
  🎬 Creator Tools      — video / digital human / dubbing / content production
  💼 Office & Productivity — documents / spreadsheets / presentations / automation
  🎨 AIGC               — image / video / audio generation
  🧩 Other AI Applications
Trend signal analysis
Projects to watch
```

Historical digests are stored in [`digests/`](./digests/). Published issues are tagged by type: [`hot-agents`](../../issues?q=is%3Aissue+label%3Ahot-agents) · [`creator`](../../issues?q=is%3Aissue+label%3Acreator) · [`office`](../../issues?q=is%3Aissue+label%3Aoffice) · [`aigc`](../../issues?q=is%3Aissue+label%3Aaigc) · [`web`](../../issues?q=is%3Aissue+label%3Aweb) · [`trending`](../../issues?q=is%3Aissue+label%3Atrending) · [`ph`](../../issues?q=is%3Aissue+label%3Aph).

Only the most recent day's issues are left open — `pnpm close-stale` closes everything older on each run, so the issue list stays at roughly one day's worth instead of thousands. Nothing is deleted: the label links above include closed issues, and the full archive also lives under `digests/` and in the Web UI. Issues without a digest label, and pull requests, are never touched.

The earlier report types (CLI tools, OpenClaw ecosystem, AI infrastructure, Hacker News, ArXiv, Hugging Face, Dev.to/Lobste.rs) were retired in October 2026 when the four directions above were introduced; past reports remain browsable under `digests/` and in the Web UI. Weekly and monthly rollups were discontinued in July 2026.

## Schedule

| Workflow | Cron | UTC | CST |
|----------|------|-----|-----|
| Daily digest | `37 22 * * *` | 22:37 daily | 06:37 next day |

To change the schedule, edit the cron expression in `.github/workflows/daily-digest.yml`.

GitHub's scheduled runs are queued, not guaranteed — typical delay for this workflow is 10-15 minutes, so a 06:37 CST start lands the digest around 07:00 CST. The minute is off the hour on purpose: the `:00` slot is the most contended, and while this workflow sat at `0 23 * * *` the delays degraded from minutes to hours (the 2026-08-26 run was dispatched 5h07m late, and the 2026-08-27 run was never created at all).

When a scheduled run is late enough that you dispatch a catch-up run manually, the two would otherwise both build the same day's digest and open a duplicate set of issues. Two guards prevent that: a `concurrency: daily-digest` group serializes overlapping runs, and a `guard` job skips any **scheduled** run whose `digests/YYYY-MM-DD` folder (CST date) is already committed. Manual `workflow_dispatch` runs always proceed, so you can still force a regeneration.

## Star History

[![Star History Chart](https://star-history.dera.page/svg?repos=duanyytop/agents-radar&type=Date)](https://star-history.dera.page/#duanyytop/agents-radar&Date)
