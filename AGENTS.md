# AGENTS.md

## Project overview

agents-radar is a daily digest generator for the AI open-source ecosystem. A GitHub Actions cron job runs at 22:37 UTC (06:37 CST next day) and produces bilingual (Chinese + English) reports, published as GitHub Issues and committed Markdown files.

Reports are organized into four audience-facing directions, each backed by its own repo list in `config.yml`:

| Group id | Direction | File |
|----------|-----------|------|
| `ai-hot-agents` | 热门智能体动态 — agent projects people are actually using/updating | `ai-hot-agents.md` |
| `ai-creator` | 博主/创作者赋能 — video, audio and content-creation tooling for creators | `ai-creator.md` |
| `ai-office` | 办公与效率 — productivity, automation, docs, tables, slides | `ai-office.md` |
| `ai-aigc` | AIGC — image/video/audio generation stacks | `ai-aigc.md` |

Plus three data-source reports: `ai-trending.md` (GitHub trending retargeted at the five directions), `ai-web.md` (Anthropic/OpenAI site news), `ai-ph.md` (Product Hunt). Reports are written for a non-developer audience (content, product, operations) — not for the maintainers of the tracked projects.

## Commands

```bash
pnpm start          # run the full digest locally
pnpm test           # vitest (unit tests)
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm lint:fix       # ESLint --fix
pnpm format         # Prettier --write src
pnpm format:check   # Prettier --check src
```

Required env vars for local runs:

```bash
export GITHUB_TOKEN=ghp_xxxxx
export DIGEST_REPO=owner/repo   # omit to skip GitHub issue creation

# LLM provider (default: anthropic)
export LLM_PROVIDER=anthropic   # anthropic | openai | github-copilot | openrouter | deepseek

# Anthropic (default)
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# OpenAI
# export OPENAI_API_KEY=sk-xxxxx

# GitHub Copilot — uses GITHUB_TOKEN

# OpenRouter
# export OPENROUTER_API_KEY=sk-or-xxxxx

# DeepSeek
# export DEEPSEEK_API_KEY=sk-xxxxx
```

## Architecture

The pipeline runs in five sequential phases, each implemented as a named async function in `src/index.ts`:

1. **`fetchAllData`** — all network I/O in parallel: GitHub API (issues/PRs/releases) for 24 repos across the four groups, Anthropic/OpenAI sitemaps, GitHub Trending HTML + Search API, Product Hunt.
2. **`generateSummaries`** — per-repo LLM calls **in English only**, all in parallel, rate-limited to 5 concurrent requests by a queue in `src/report.ts`.
3. **`translateSummaries`** — translates the English bodies to Chinese via `translateToZh`.
4. **Comparisons** — four English LLM calls (one per group), each translated.
5. **Save phase** — `buildGroupReportContent` (in `src/report-builders.ts`) assembles each group report; `saveGroupReport` (in `src/report-savers.ts`) generates each body in English, translates it, then writes both language files (+ issues when `DIGEST_REPO` is set). Data-source reports use `saveWebReport` / `saveTrendingReport` / `savePhReport`.

## Source files

| File | Responsibility |
|------|---------------|
| `src/index.ts` | Orchestration: group config, phase functions, `main()` |
| `src/i18n.ts` | Centralized bilingual strings: `Lang` type, `GROUP_REPORTS`, report titles, issue labels, footer text, `REPORT_LABELS`, `NOTIFY_LABELS` |
| `src/github.ts` | GitHub API helpers: `fetchRecentItems`, `fetchRecentReleases`, `fetchRecentDiscussions` (GraphQL), `createGitHubIssue`; shared `RepoFetch` type |
| `src/config.ts` | Loads `config.yml` into `RadarConfig` (`groups: RadarGroup[]`); `GROUP_IDS`, built-in defaults per group when a section is missing |
| `src/prompts.ts` | LLM prompt builders for repo reports: `buildGroupPrompt`, `buildGroupComparisonPrompt`; plus `buildTranslationPrompt` / `buildJsonTranslationPrompt` |
| `src/prompts-data.ts` | LLM prompt builders for data-source reports: `buildTrendingPrompt`, `buildWebReportPrompt`, `buildPhPrompt`, `buildHighlightsPrompt` |
| `src/report.ts` | `callLlm` (with concurrency limiter), `translateToZh`, `saveFile`, `autoGenFooter` (uses i18n), LLM token budget constants |
| `src/report-builders.ts` | `buildGroupReportContent` — assembles the final Markdown string for one group report in one language |
| `src/report-savers.ts` | `saveGroupReport`, `saveWebReport`, `saveTrendingReport`, `savePhReport` — English LLM call + translation + both language files + optional GitHub issues; exports `LANGS` and `BilingualBody` |
| `src/date.ts` | Date and timing utilities: `toCstDateStr`, `toUtcStr`, `weekdayOf`, `sleep` |
| `src/providers/types.ts` | `LlmProvider` interface, `ProviderName` type, `VALID_PROVIDER_NAMES` |
| `src/providers/openai-compatible.ts` | `OpenAICompatibleProvider` — shared base class for OpenAI-compatible providers |
| `src/providers/anthropic.ts` | `AnthropicProvider` — Anthropic SDK wrapper |
| `src/providers/openai.ts` | `OpenAIProvider` — extends `OpenAICompatibleProvider` |
| `src/providers/github-copilot.ts` | `GitHubCopilotProvider` — extends `OpenAICompatibleProvider` |
| `src/providers/openrouter.ts` | `OpenRouterProvider` — extends `OpenAICompatibleProvider` |
| `src/providers/deepseek.ts` | `DeepSeekProvider` — extends `OpenAICompatibleProvider` |
| `src/providers/qwen.ts` | `QwenProvider` — extends `OpenAICompatibleProvider`; Alibaba Model Studio |
| `src/providers/index.ts` | `createProvider` factory + barrel re-exports |
| `src/web.ts` | Sitemap-based web content fetching; state persisted to `digests/web-state.json` |
| `src/trending.ts` | GitHub Trending HTML scraper + Search API topic queries |
| `src/generate-manifest.ts` | Generates `manifest.json` (sidebar data for Web UI) and `feed.xml` (RSS 2.0 feed) |

## Report outputs

Files written to `digests/YYYY-MM-DD/`:

| File | Label | Notes |
|------|-------|-------|
| `ai-hot-agents.md` | `hot-agents` | Always generated; skipped per-repo when quiet |
| `ai-creator.md` | `creator` | Always generated |
| `ai-office.md` | `office` | Always generated |
| `ai-aigc.md` | `aigc` | Always generated |
| `ai-web.md` | `web` | Skipped if no new sitemap content |
| `ai-trending.md` | `trending` | Skipped if both data sources fail |
| `ai-ph.md` | `ph` | Skipped if Product Hunt fetch fails or token missing |

Discontinued types (`ai-cli`, `ai-agents`, `ai-infra`, `ai-hn`, `ai-arxiv`, `ai-hf`, `ai-community`, `ai-weekly`, `ai-monthly`) stay listed in `REPORT_LABELS` / `REPORT_FILES` / `index.html` so archived reports remain reachable — do not add generation code back.

## Tracked sources

Four groups (6 repos each), all in `config.yml`:

- **`agents_repos`** → `ai-hot-agents`: Hermes Agent, Agent Reach, Career Ops, Cherry Studio, Nanobot, CowAgent
- **`creator_repos`** → `ai-creator`: MoneyPrinterTurbo, OpenMontage, pyVideoTrans, Toonflow, OpenCreator, LiveTalking
- **`office_repos`** → `ai-office`: n8n, PPT Master, SiYuan, Teable, GenOffice, Presenton
- **`aigc_repos`** → `ai-aigc`: ComfyUI, Open Generative AI, InvokeAI, VoiceStudio, HunyuanVideo, GPT-SoVITS

- **Web**: anthropic.com + openai.com via sitemap, state in `digests/web-state.json`
- **Trending**: github.com/trending (HTML) + GitHub Search API (6 topic queries aligned to the four directions, 7-day window)
- **PH**: Product Hunt GraphQL API

## Key conventions

- All bilingual strings (titles, labels, footers, messages) are centralized in `src/i18n.ts`. Use the `Lang` type (`"zh" | "en"`) and `Record<Lang, string>` maps. Do not add inline bilingual ternaries elsewhere.
- The four group reports are declared once in `GROUP_REPORTS` (`src/i18n.ts`, keyed by group id with `{title, meta, comparison, detail, issueLabel, issueTitle, short, persona, focus}`) and once in `config.yml`. `config.ts` exposes `GROUP_IDS`; `prompts.ts` reads persona/focus from `GROUP_REPORTS` so each group's prompt speaks in the right voice. Adding a repo is a `config.yml` edit only.
- Report bodies are written for a non-developer audience (content/product/operations teams). Prompts explicitly say 不要编造数据里没有的内容 and avoid developer jargon; keep that tone when editing prompt text.
- LLM prompt builders are split across two files: `src/prompts.ts` (repo-level prompts) and `src/prompts-data.ts` (data-source prompts).
- Report **bodies** are generated in English and translated to Chinese (see CLAUDE.md "English-first generation"). Never add a second generation call to produce Chinese. `translateToZh(text, maxTokens)` must be passed the same token budget the English body was generated with.
- `callLlm(prompt, maxTokens?)` defaults to 4096 tokens. `LLM_TOKENS_WEB` = 8192, `LLM_TOKENS_TRENDING` = 6144, `LLM_TOKENS_LISTING` = 6144 (Product Hunt).
- `buildHighlightsPrompt(reportContents, lang, itemsPerReport = 4)` produces the WeCom/Telegram/Feishu highlight JSON. `itemsPerReport` defaults to 4 to keep the push under WeCom's 4000-byte markdown cap.
- Discontinued report types (`ai-cli`, `ai-agents`, `ai-infra`, `ai-hn`, `ai-arxiv`, `ai-hf`, `ai-community`, `ai-weekly`, `ai-monthly`) remain in `REPORT_LABELS` (`src/i18n.ts`), `REPORT_FILES` (`src/generate-manifest.ts`), `LABELS` (`index.html`) and the legacy label list in `src/github.ts` only so archived reports stay reachable — do not add generation code back.
- On 429 rate-limit errors `callLlm` retries with exponential backoff; on connection failures it uses a longer ladder (see CLAUDE.md). The concurrency slot is released during every wait.
- The concurrency limiter (`LLM_CONCURRENCY = 5`) prevents 429s when many parallel LLM calls fire. Do not bypass it by calling SDK clients directly.
- LLM provider is selected via `LLM_PROVIDER` env var (default: `anthropic`). Valid values: `anthropic`, `openai`, `github-copilot`, `openrouter`, `deepseek`, `qwen`.
- Provider implementations live in `src/providers/`. Each file implements the `LlmProvider` interface. The factory in `src/providers/index.ts` validates the provider name and logs only the provider name — never API keys or endpoint URLs.
- GitHub issue label colors are defined in `LABEL_COLORS` in `src/github.ts`. Add new labels there.
- GitHub Discussions have no REST API, so `fetchRecentDiscussions` uses GraphQL. Enable per-repo with `discussions: true` — most tracked repos have the board enabled but dormant, and an unconditional fetch would just burn quota. Only `buildGroupPrompt` renders a Discussions section, and it is omitted entirely when there is no data.
- `sampleNote(total, sampled, lang, by)` in `src/prompts.ts` formats the "(共 N 条，展示前 M 条)" note. Reuse it — do not inline the same string format. Pass `by: "engagement"` when the sample was ranked by comments + upvotes (discussions) instead of comments alone.
- Web state (`digests/web-state.json`) is committed to git on every run. It is the source of truth for which URLs have been seen.

## Web UI & RSS Feed

- Web UI: `index.html` reads `manifest.json` to build the sidebar, then fetches `digests/YYYY-MM-DD/report.md` on demand.
- RSS Feed: `feed.xml` at the repo root. Generated by `src/generate-manifest.ts` in the same `pnpm manifest` step. Contains the latest 30 items (newest first) across all report types. Item links use hash routing: `https://<owner>.github.io/agents-radar/#YYYY-MM-DD/report`, where `<owner>` is `GITHUB_REPOSITORY_OWNER` at generation time (falls back to `duanyytop` locally).
- Both `manifest.json` and `feed.xml` are committed together in the "Commit manifest and feed" GHA step.
- The `REPORT_LABELS` map in `src/i18n.ts` must be kept in sync with the `LABELS` object in `index.html` when adding new report types.

## Adding a repo to a group

1. Add the entry to the matching section in `config.yml` (`agents_repos`, `creator_repos`, `office_repos`, `aigc_repos`). Set `paginated: true` when the repo has >100 daily issue/PR updates. That is the whole change — no code edits needed.
2. If the repo list in a README/AGENTS/CLAUDE source table is now stale, update it.

## Adding a new report group

1. Add the group id to `GROUP_IDS` in `src/config.ts`, a built-in default repo list, and the section name in `RawConfig`/`loadConfig`.
2. Add an entry to `GROUP_REPORTS` in `src/i18n.ts` (`title`, `meta`, `comparison`, `detail`, `issueLabel`, `issueTitle`, `short`, `persona`, `focus`).
3. Add a `config.yml` section.
4. Add the report ID, label and file name to `REPORT_LABELS` (`src/i18n.ts`), `LABELS` (`index.html`) and `REPORT_FILES` (`src/generate-manifest.ts`).
5. Add a label color pair in `LABEL_COLORS` and the label to `DIGEST_ISSUE_LABELS` in `src/github.ts`.
6. Nothing else: `index.ts`, `report-builders.ts` and `report-savers.ts` iterate `config.groups` generically.
7. Update both README files and this file.
