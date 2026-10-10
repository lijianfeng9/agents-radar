# agents-radar

English | [中文](./README.zh.md)

A GitHub Actions workflow that runs every morning at ~07:00 CST. It reads the last 24 hours of Chinese tech media plus the GitHub trending board, and publishes one Chinese daily report — **《AI 每日要闻》** — to the repo, the Web UI and the RSS feed, and pushes it to a WeCom (企业微信) group as markdown text plus a news-card message.

The report is written for a non-developer audience: content creators, product, operations and admin staff. Every item is a clickable headline that opens the original article, plus a one-line summary of why it is worth reading.

## The daily report

```
AI 每日要闻 2026-10-10
> 数据来源: 量子位 · 雷峰网 · 钛媒体 · 爱范儿 · 开源中国 · 少数派 · 小众软件 | 生成时间: … | 要闻 N 条 / 抓取 M 条

## 今日速览          3–5 one-line highlights across the day
## 🔥 大模型动向       new models, capability upgrades, industry events
## 🤖 智能体 & 开源项目  agents, open-source projects, developer tools
## 🎬 创作者 · AIGC 玩法 tools and playbooks for video / image / audio creators
## 💼 办公提效         docs, tables, slides, automation, knowledge management
## 📈 GitHub 趋势      paired with real star counts fetched from GitHub
```

### Data sources

| Source | Type | Data |
|--------|------|------|
| [量子位](https://www.qbitai.com/feed) · [雷峰网](https://www.leiphone.com/feed) · [钛媒体](https://www.tmtpost.com/feed) · [爱范儿](https://www.ifanr.com/feed) · [开源中国](https://www.oschina.net/news/rss) · [少数派](https://sspai.com/feed) · [小众软件](https://www.appinn.com/feed/) | RSS / Atom | Articles from the last 26 hours |
| [GitHub Trending](https://github.com/trending?since=daily) | HTML | Today's trending repos, total stars, today's new stars |
| GitHub Search API | REST | Repos active in the last 7 days across 6 AI topics (`ai-agent`, `aigc`, `llm`, `image-generation`, `text-to-video`, `text-to-speech`) |

The pipeline drops roundup entries (早报/晨报/周报 and the like — they link to a list of headlines, not an article body), merges near-duplicate stories reported by several outlets, and caps what reaches the LLM. Every link that ships in the final report is one the fetcher actually saw, and every star count comes from the fetched data — the model never invents either.

## Web UI

**[https://`<your-username>`.github.io/agents-radar](https://duanyytop.github.io/agents-radar)**

Browse all historical digests in a dark-themed interface — no login required. Reports are rendered from the Markdown files in this repo via GitHub Pages.

## RSS Feed

**[https://`<your-username>`.github.io/agents-radar/feed.xml](https://duanyytop.github.io/agents-radar/feed.xml)**

Subscribe in any RSS reader (Feedly, Reeder, NewsBlur, …). The feed carries the latest 30 items and is refreshed daily together with `manifest.json`.

## Notifications

| Channel | Script | What is sent |
|---------|--------|--------------|
| WeCom (企业微信) group robot | `pnpm notify:wecom` | Markdown text (header + 今日速览 + report link) **and** a `news` message with up to 8 article cards linking straight to the sources |
| Telegram | `pnpm notify` | Formatted message with report links + highlights |
| Feishu | `pnpm notify:feishu` | Card message with highlights |

Telegram and Feishu read `digests/<date>/highlights.json`; WeCom reads `digests/<date>/news.json`. Each step is skipped silently when its webhook/token secret is not configured.

**Setting up the WeCom push:**
1. In the target WeCom group, open **群机器人 → 添加机器人** and copy the webhook URL
2. Add it as the `WECOM_WEBHOOK_URLS` repository secret (comma-separate multiple groups)

## Features

- One Chinese report a day — no bilingual duplication, no second generation pass
- Only clickable truth ships: every URL is allow-listed from the fetched data, star counts are real
- Roundup and duplicate-story filtering built in
- Follows the four directions the team asked for: 热门智能体, 创作者赋能, 办公提效, AIGC
- Pushes to WeCom / Telegram / Feishu when configured
- News sources are configurable in `config.yml` — no code changes needed
- Runs on a daily schedule; supports manual triggering and catch-up runs

## Setup

### 1. Fork this repository

### 2. Customize `config.yml` (optional)

The `news_sources` section lists the RSS feeds to follow, in priority order (earlier sources win when the same story is merged). Add, remove or reorder entries — the pipeline reads the file on every run and falls back to built-in defaults if the section is missing.

```yaml
news_sources:
  - id: qbitai
    name: 量子位
    url: https://www.qbitai.com/feed
  # add more, or set `enabled: false` to pause one
```

### 3. Add Secrets

Go to **Settings → Secrets and variables → Actions**:

| Secret | Required | Description |
|--------|----------|-------------|
| `DEEPSEEK_API_KEY` | yes | LLM key for the scheduled runs (`LLM_PROVIDER=deepseek` in the workflow) |
| `WECOM_WEBHOOK_URLS` | recommended | Comma-separated WeCom group-robot webhook URLs |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | optional | Telegram push |
| `FEISHU_WEBHOOK_URLS` | optional | Comma-separated Feishu bot webhook URLs |

> `GITHUB_TOKEN` is provided automatically by GitHub Actions.

### 4. Enable the workflow

Confirm the workflow is enabled in the **Actions** tab. To test immediately, go to **Actions → Daily Agents Radar → Run workflow** (manual runs always proceed, even if today's digest already exists).

## LLM providers

Set `LLM_PROVIDER` to choose the model backend. Defaults to `anthropic`; the scheduled workflow runs `deepseek`.

| Provider | `LLM_PROVIDER` | Required env vars | Default model |
|----------|---------------|-------------------|---------------|
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-6` |
| OpenAI | `openai` | `OPENAI_API_KEY` | `gpt-4o` |
| GitHub Copilot | `github-copilot` | `GITHUB_TOKEN` | `gpt-4o` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` | `anthropic/claude-sonnet-4` |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` | `deepseek-v4-flash` |
| Qwen | `qwen` | `DASHSCOPE_API_KEY` | `qwen-flash` |

Override the model with `ANTHROPIC_MODEL` / `OPENAI_MODEL` / `GITHUB_COPILOT_MODEL` / `OPENROUTER_MODEL` / `DEEPSEEK_MODEL` / `QWEN_MODEL`. Providers live in `src/providers/`; adding one is a new file plus a factory registration.

## Running locally

```bash
pnpm install

# Option A: DeepSeek (used by CI)
export LLM_PROVIDER=deepseek
export DEEPSEEK_API_KEY=sk-xxxxxxxx

# Option B: Anthropic (default)
# export ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

export GITHUB_TOKEN=ghp_xxxxx          # optional: trending search API
export DIGEST_REPO=                     # leave empty to only write files (no GitHub issue)

pnpm start
```

> Do not run `pnpm notify:wecom` locally unless you mean to push to the real group.

## Output format

Files are written to `digests/YYYY-MM-DD/`:

| File | Content |
|------|---------|
| `ai-news.md` | The《AI 每日要闻》report (Chinese) |
| `news.json` | Structured digest — summary, sections, trending rows, push cards; feeds the WeCom push |
| `highlights.json` | 速览 bullets for the Telegram/Feishu notifiers |

When `DIGEST_REPO` is set, a GitHub Issue labeled `ai-news` is opened with the same markdown. The daily workflow does not set it, so CI runs write files only.

Historical digests live in [`digests/`](./digests/). Earlier report types (four per-direction group reports, official-site sitemap tracking, Product Hunt, GitHub trending report, and older CLI/HN/ArXiv/HF reports) were retired in October 2026 when the single daily news report replaced them; past reports remain browsable under `digests/` and in the Web UI.

## Schedule

| Workflow | Cron | UTC | CST |
|----------|------|-----|-----|
| Daily digest | `37 22 * * *` | 22:37 daily | 06:37 next day |

GitHub's scheduled runs are queued, not guaranteed — a 06:37 CST start typically lands the digest around 07:00 CST. The minute is off the hour on purpose: the `:00` slot is the most contended.

Two guards keep a day from being published twice: a `concurrency: daily-digest` group serializes overlapping runs, and a `guard` job skips any **scheduled** run whose `digests/YYYY-MM-DD` folder (CST date) is already committed. Manual `workflow_dispatch` runs always proceed, so a missed morning can be regenerated by hand.

---

Based on [duanyytop/agents-radar](https://github.com/duanyytop/agents-radar).
