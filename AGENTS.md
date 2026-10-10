# AGENTS.md

## Project overview

agents-radar is a daily Chinese AI news digest (《AI 每日要闻》). A GitHub Actions cron job runs at 22:37 UTC (06:37 CST next day), pulls the last ~26 hours from seven Chinese tech-media RSS feeds plus the GitHub trending snapshot, asks the LLM for **one** structured JSON digest, and publishes:

- `digests/YYYY-MM-DD/ai-news.md` — the report (Chinese only)
- `digests/YYYY-MM-DD/news.json` — structured digest; also the input to the WeCom push
- `digests/YYYY-MM-DD/highlights.json` — 速览 bullets for the Telegram/Feishu notifiers
- a GitHub Issue per day, only when `DIGEST_REPO` is set (the daily workflow does not set it)
- a WeCom (企业微信) push — markdown text + a `news` 图文卡片 message — via `pnpm notify:wecom`

The report is written for a non-developer audience (content, product, operations, admin staff): 今日速览, four fixed sections (🔥 大模型动向 / 🤖 智能体 & 开源项目 / 🎬 创作者 · AIGC 玩法 / 💼 办公提效) and a 📈 GitHub 趋势 table. Every item is a clickable title plus a one-line summary.

## Commands

```bash
pnpm start          # run the full digest locally
pnpm test           # vitest (unit tests)
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm lint:fix       # ESLint --fix
pnpm format         # Prettier --write src
pnpm format:check   # Prettier --check src
pnpm manifest       # regenerate manifest.json + feed.xml from digests/
pnpm notify:wecom   # send the WeCom push for the latest digest (reads news.json)
pnpm notify         # Telegram push (reads highlights.json)
pnpm notify:feishu  # Feishu push (reads highlights.json)
pnpm close-stale    # close digest issues older than the newest open day
```

Required env vars for local runs:

```bash
export GITHUB_TOKEN=ghp_xxxxx    # optional: trending search API + stale-issue closing
export DIGEST_REPO=owner/repo    # optional; set it to also open a GitHub issue

# LLM provider (default: anthropic)
export LLM_PROVIDER=deepseek     # anthropic | openai | github-copilot | openrouter | deepseek | qwen

# Anthropic (default)
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# DeepSeek — provider used by the GitHub Actions daily run
# export DEEPSEEK_API_KEY=sk-xxxxx

# OpenAI / OpenRouter / Qwen
# export OPENAI_API_KEY=sk-xxxxx
# export OPENROUTER_API_KEY=sk-or-xxxxx
# export DASHSCOPE_API_KEY=sk-xxxxx
```

A typical local run (never run `pnpm notify:wecom` locally — the webhook would push to the real group):

```bash
set -a; source ../.env.secrets; set +a
LLM_PROVIDER=deepseek DIGEST_REPO= npx tsx src/index.ts
```

## Architecture

`main()` in `src/index.ts` runs three phases:

1. **Fetch** — `fetchAllNews(config.newsSources, now)` and `fetchTrendingData()` in parallel. A trending failure is non-fatal (empty data, prompt says to leave the section out); every news source failing aborts the run.
2. **Generate** — `generateDailyNews`: `buildDailyNewsPrompt(items, trendingData, dateStr)` → `parseLlmJson(callLlm(prompt, LLM_TOKENS_NEWS))`. Two attempts; a connection failure waits `GENERATION_COOLDOWN_MS` (60 s) before attempt 2 so it lands outside the outage that just consumed `callLlm`'s retry ladder.
3. **Save** — `saveDailyNews` validates the model's JSON against the actually fetched data, renders the markdown, and writes `ai-news.md` / `news.json` / `highlights.json` (+ issue when `DIGEST_REPO` is set).

Notifications are separate scripts run after the digest step. `wecom.ts`, `notify.ts` and `feishu.ts` each read `manifest.json` for the latest date and then `digests/<date>/news.json` or `highlights.json`.

## Source files

| File | Responsibility |
|------|---------------|
| `src/index.ts` | Orchestration: the three phases above, `generateDailyNews`, `main()` |
| `src/news.ts` | RSS/Atom fetching: `parseFeed`, `stripHtml`, `isRoundup`, `dedupItems`, `selectItems`, `fetchAllNews`; window/cap constants |
| `src/trending.ts` | GitHub Trending HTML scraper (`parseTrendingHtml`) + Search API topic queries; `fetchTrendingData` |
| `src/config.ts` | Loads `config.yml` into `RadarConfig` (`newsSources: NewsSource[]`); built-in default source list when the file or section is missing |
| `src/prompts-data.ts` | `buildDailyNewsPrompt` + `NEWS_SECTION_IDS` + the `DailyNews*` types |
| `src/report.ts` | `callLlm` (concurrency limiter + retry ladders), `parseLlmJson`/`repairJson`, `is429`/`isConnectionError`/`isRetryable`, `saveFile`, `autoGenFooter`, token budgets |
| `src/report-builders.ts` | `buildDailyNewsMarkdown` — renders the report markdown from validated digest data |
| `src/report-savers.ts` | `normalizeDailyNews` (URL allow-list validation), `buildTrendingRows`, `saveDailyNews`; exports `DailyNewsFile` |
| `src/i18n.ts` | `NEWS_REPORT` (titles, section headings, meta), `Lang`, `FOOTER`, `REPORT_LABELS` / `NOTIFY_LABELS` (legacy ids kept) |
| `src/date.ts` | `toCstDateStr`, `toUtcStr`, `weekdayOf`, `sleep` |
| `src/wecom.ts` | WeCom push: `buildWecomText` (byte-budget markdown), `buildWecomCards` (≤8 news cards), `attachCardImages` (og:image covers → `picurl`), `sendToOneWebhook` |
| `src/notify.ts` | Telegram push from `highlights.json` |
| `src/feishu.ts` | Feishu card push from `highlights.json` |
| `src/github.ts` | GitHub API helpers: `createGitHubIssue`, `closeSupersededIssues`, label colors |
| `src/close-stale-issues.ts` | Entry point for `pnpm close-stale` |
| `src/generate-manifest.ts` | Generates `manifest.json` (sidebar data for the Web UI) and `feed.xml` (RSS 2.0) |
| `src/providers/*.ts` | `LlmProvider` implementations + `createProvider` factory (logs the provider name only — never keys or endpoints) |

## Report outputs

Files written to `digests/YYYY-MM-DD/`:

| File | Notes |
|------|-------|
| `ai-news.md` | The daily report; issue label `ai-news` |
| `news.json` | Structured digest (`DailyNewsFile`): summary, sections, trending rows, cards — consumed by the WeCom push |
| `highlights.json` | `{zh: {"ai-news": [速览…]}, en: {}}` — consumed by the Telegram/Feishu notifiers |

Discontinued types (`ai-hot-agents`, `ai-creator`, `ai-office`, `ai-aigc`, `ai-web`, `ai-trending`, `ai-ph`, `ai-cli`, `ai-agents`, `ai-infra`, `ai-hn`, `ai-arxiv`, `ai-hf`, `ai-community`, `ai-weekly`, `ai-monthly` and their `-en` variants) stay listed in `REPORT_LABELS` / `REPORT_FILES` / `index.html` `LABELS` / `DIGEST_ISSUE_LABELS` so archived reports remain reachable — do not add generation code back.

## Tracked sources

News sources live in `config.yml` (`news_sources:`), in priority order — earlier sources win when the same story is merged:

量子位 (qbitai) · 雷峰网 (leiphone) · 钛媒体 (tmtpost) · 爱范儿 (ifanr) · 开源中国 (oschina) · 少数派 (sspai) · 小众软件 (appinn)

Plus GitHub data, fetched in parallel every run:

- **Trending**: github.com/trending HTML (`parseTrendingHtml`) — total stars, forks, today's new stars
- **Search**: GitHub Search API, 6 topic queries (`ai-agent`, `aigc`, `llm`, `image-generation`, `text-to-video`, `text-to-speech`), 7-day window, sorted by stars. Authenticated with `GITHUB_TOKEN` when present (unauthenticated runs hit 403 rate limits).

## Key conventions

- The digest is generated **once, in Chinese**. Never add a translation pass or a second language variant; `highlights.json` keeps an empty `en` map only so the notifiers' shape is unchanged.
- Anti-hallucination invariants — keep them when touching the save path:
  - `normalizeDailyNews` drops any item whose `url` is not in the allow-list (fetched news links + trending repo URLs). A fabricated URL would 404 on click.
  - Trending stars in the report come from `buildTrendingRows` (real fetched data), never from the model; the model only picks the repo and writes the one-line summary.
  - `saveDailyNews` throws when the model returns no usable entries *and* no trending rows — a missing day beats a published empty report.
- `news.ts` selection pipeline, in order: 26 h window (+2 h future horizon) → roundup filter → per-source cap 15 → cross-source dedup → global cap 70.
  - Roundup entries (早报/晨报/周报… via `ROUNDUP_TITLE_RE`, plus leiphone's `/zaobao/` links) are filtered deliberately: they link to a list of headlines, not an article body.
  - Dedup is bigram Jaccard ≥ 0.6 on the normalized title; within a duplicate cluster the longest excerpt wins.
- Trending star counts must be parsed with `countAfterAnchor` — GitHub renders the number after an inline SVG whose `path` data is full of digits, so the tag markup has to be stripped before scanning for the first number.
- WeCom limits: markdown content ≤ 4000 bytes (`buildWecomText` drops 速览 bullets from the tail until it fits, never the report link), ≤ 8 cards, card title ≤ 128 bytes / description ≤ 512 bytes (`byteSlice` truncates on character boundaries). WeCom answers HTTP 200 even on failure — only the `errcode` in the body counts. Each card's cover is the article page's `og:image` (`attachCardImages`, per-card failure just renders gray) — without `picurl` WeCom shows a gray placeholder.
- `callLlm(prompt, maxTokens?)` defaults to `LLM_TOKENS_DEFAULT` (4096); the daily digest uses `LLM_TOKENS_NEWS` (8192). The concurrency limiter (`LLM_CONCURRENCY = 5`) exists to prevent 429s — do not bypass it by calling SDK clients directly.
- Retry ladders in `callLlm`: 429 → 3 retries at 5/10/20 s; connection failures (`isConnectionError` walks the SDK's `cause` chain) → 6 retries at 5/10/20/40/60/60 s, capped by `RETRY_MAX_MS`. The concurrency slot is released during every wait.
- LLM provider is selected via `LLM_PROVIDER` (default `anthropic`; valid: `anthropic`, `openai`, `github-copilot`, `openrouter`, `deepseek`, `qwen`). The daily workflow runs `deepseek` (`deepseek-v4-flash`).
- Prompt tone: the reader is a non-developer colleague. Prompts say 不要编造数据里没有的内容, avoid developer jargon, and keep every summary to one line — preserve that when editing `src/prompts-data.ts`.
- Report metadata (`# AI 每日要闻 <date>`, section headings, the 数据来源/生成时间 meta line) is centralized in `NEWS_REPORT` (`src/i18n.ts`) and rendered by `buildDailyNewsMarkdown`. Do not inline these strings.
- The daily workflow produces at most one digest per CST day: a `concurrency: daily-digest` group (`cancel-in-progress: false`) serializes overlapping runs, and a `guard` job skips **scheduled** runs whose `digests/YYYY-MM-DD` folder is already committed. `workflow_dispatch` always proceeds — that is the escape hatch for regenerating a day.
- `closeSupersededIssues` (`pnpm close-stale`, the workflow's last step) keeps only the newest open digest day and closes the rest. It compares CST dates via `toCstDateStr` and excludes pull requests.
- The daily workflow does not set `DIGEST_REPO`, so CI runs write files only and open no issues. `autoGenFooter` returns an empty string when `DIGEST_REPO` is unset, so local samples carry no footer.

## Web UI & RSS Feed

- Web UI: `index.html` reads `manifest.json` to build the sidebar, then fetches `digests/YYYY-MM-DD/<report>.md` on demand.
- `marked` and `DOMPurify` are vendored under `assets/vendor/` and loaded from the repo — the audience is behind mainland-China networks, so the page must not depend on CDNs (jsdelivr / fonts.googleapis.com) that are commonly unreachable there.
- The `ai-news` report renders with a news-article skin (`body.news-view`: white paper card on a light canvas, centered title + byline, accent-bar section headings) so the digest reads like a news page. The default theme is light — the localStorage key was bumped to `ar-theme-v2` because every returning visitor had the old dark default stored — and the toggle still switches to a coherent dark reading mode.
- RSS Feed: `feed.xml` at the repo root. Generated by `src/generate-manifest.ts` in the same `pnpm manifest` step. Contains the latest 30 items (newest first). Item links use hash routing: `https://<owner>.github.io/agents-radar/#YYYY-MM-DD/<report>`, where `<owner>` is `GITHUB_REPOSITORY_OWNER` at generation time (falls back to `duanyytop` locally).
- Both `manifest.json` and `feed.xml` are committed together in the "Commit manifest and feed" GHA step.
- The `NEWS_REPORT` title, `REPORT_LABELS` (`src/i18n.ts`) and the `LABELS` object in `index.html` must stay in sync; `REPORT_FILES` (`src/generate-manifest.ts`) decides which files the manifest picks up.

## Adding a news source

Add one entry to `news_sources:` in `config.yml` (`id`, `name`, `url`). That is the whole change — `config.ts` falls back to built-in defaults only when the section is entirely missing or empty. Set `enabled: false` to pause a source without deleting it. If a README/AGENTS source list is now stale, update it.

## Adding a digest section

1. Add the id to `NEWS_SECTION_IDS` in `src/prompts-data.ts` and to the `sections` map in `NEWS_REPORT` (`src/i18n.ts`).
2. Describe it in the prompt's 第二步 · 分区 list (with a count range) in `src/prompts-data.ts`.
3. Update the expected-structure tests. Nothing else — `report-builders.ts`, `report-savers.ts` and the prompt renderer all iterate `NEWS_SECTION_IDS`.
