# CLAUDE.md

## Project overview

agents-radar is a daily digest generator for the AI open-source ecosystem. A GitHub Actions cron job runs at 22:37 UTC (06:37 CST next day) and produces bilingual (Chinese + English) reports, published as GitHub Issues and committed Markdown files.

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
export LLM_PROVIDER=anthropic   # anthropic | openai | github-copilot | openrouter | deepseek | qwen

# Anthropic (default)
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# OpenAI
# export OPENAI_API_KEY=sk-xxxxx

# GitHub Copilot — uses GITHUB_TOKEN

# OpenRouter
# export OPENROUTER_API_KEY=sk-or-xxxxx

# DeepSeek
# export DEEPSEEK_API_KEY=sk-xxxxx

# Qwen (Alibaba Model Studio) — provider used by the GitHub Actions cron
# export DASHSCOPE_API_KEY=sk-xxxxx
```

## Architecture

The pipeline runs in five sequential phases, each implemented as a named async function in `src/index.ts`:

1. **`fetchAllData`** — all network I/O in parallel: GitHub API (issues/PRs/releases) for 24 repos across the four groups, Anthropic/OpenAI sitemaps, GitHub Trending HTML + Search API, Product Hunt.
2. **`generateSummaries`** — per-repo LLM calls **in English only**, all in parallel, rate-limited to 5 concurrent requests by a queue in `src/report.ts`.
3. **`translateSummaries`** — translates the English bodies to Chinese via `translateToZh`.
4. **Comparisons** — four English LLM calls (one per group), each then translated.
5. **Save phase** — `buildGroupReportContent` (in `src/report-builders.ts`) assembles each group report; `saveGroupReport` (in `src/report-savers.ts`) takes both languages and writes both files + both GitHub Issues. Data-source reports use `saveWebReport` / `saveTrendingReport` / `savePhReport`, which generate their body in English, translate it, then write both language files.

The four groups come from `config.yml` (`agents_repos` → `ai-hot-agents`, `creator_repos` → `ai-creator`, `office_repos` → `ai-office`, `aigc_repos` → `ai-aigc`), declared once in `GROUP_IDS` (`src/config.ts`) and `GROUP_REPORTS` (`src/i18n.ts`). Reports target a non-developer audience (content/product/operations) — keep prompt tone plain when editing.

### English-first generation

Report bodies are generated **once in English** and translated to Chinese. Generating both languages from the raw GitHub/API data ran the whole pipeline twice for identical information; a translation prompt carries the finished report instead of the item dump, so it costs a fraction of the input tokens. Consequences for new code:

- Prompt builders still take a `lang` argument, but the pipeline only ever passes `"en"`. The `lang` branches remain because the fixed scaffolding (titles, headers, footers) is still rendered per language from `src/i18n.ts`.
- A `saveXxxReport` function emits **both** languages and takes no `lang` parameter. Do not call it once per language.
- `saveGroupReport` takes `digestsByLang: Record<Lang, RepoDigest[]>` — the per-language digests carry language-matched summaries, so keep the pairing when adding parameters.
- Fixed status strings (`MSG.noActivity`, `MSG.summaryFailed`, …) are mapped en→zh through `FIXED_EN_TO_ZH` in `src/index.ts` instead of being sent to the LLM.
- `translateToZh` falls back to the English text on failure — a partly-English Chinese report still carries the day's information.

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
| `ai-hot-agents.md` | `hot-agents` | Always generated |
| `ai-creator.md` | `creator` | Always generated |
| `ai-office.md` | `office` | Always generated |
| `ai-aigc.md` | `aigc` | Always generated |
| `ai-web.md` | `web` | Skipped if no new sitemap content |
| `ai-trending.md` | `trending` | Skipped if both data sources fail |
| `ai-ph.md` | `ph` | Skipped if Product Hunt fetch fails or token missing |

Discontinued types (`ai-cli`, `ai-agents`, `ai-infra`, `ai-hn`, `ai-arxiv`, `ai-hf`, `ai-community`, `ai-weekly`, `ai-monthly`) stay listed in `REPORT_LABELS` / `REPORT_FILES` / `index.html` / `DIGEST_ISSUE_LABELS` so archived reports remain reachable — do not add generation code back.

## Tracked sources

Four groups (6 repos each), all in `config.yml`:

- **`agents_repos`** → `ai-hot-agents`: Hermes Agent, Agent Reach, Career Ops, Cherry Studio, Nanobot, CowAgent
- **`creator_repos`** → `ai-creator`: MoneyPrinterTurbo, OpenMontage, pyVideoTrans, Toonflow, OpenCreator, LiveTalking
- **`office_repos`** → `ai-office`: n8n, PPT Master, SiYuan, Teable, GenOffice, Presenton
- **`aigc_repos`** → `ai-aigc`: ComfyUI, Open Generative AI, InvokeAI, VoiceStudio, HunyuanVideo, GPT-SoVITS

- **Web**: anthropic.com + openai.com via sitemap, state in `digests/web-state.json`
- **Trending**: github.com/trending (HTML) + GitHub Search API (6 topic queries aligned to the four directions: `ai-agent`, `aigc`, `llm`, `image-generation`, `text-to-video`, `text-to-speech`; 7-day window)
- **PH**: Product Hunt GraphQL API

## Key conventions

- All bilingual strings (titles, labels, footers, messages) are centralized in `src/i18n.ts`. Use the `Lang` type (`"zh" | "en"`) and `Record<Lang, string>` maps. Do not add inline bilingual ternaries elsewhere.
- Report **bodies** are not bilingual strings — they are generated in English and translated (see "English-first generation"). Never add a second generation call to produce Chinese.
- `translateToZh(text, maxTokens)` must be passed the same token budget the English body was generated with, or a long report gets truncated mid-translation.
- LLM prompt builders are split across two files: `src/prompts.ts` (repo-level prompts) and `src/prompts-data.ts` (data-source prompts).
- Discontinued report types (`ai-cli`, `ai-agents`, `ai-infra`, `ai-hn`, `ai-arxiv`, `ai-hf`, `ai-community`, `ai-weekly`, `ai-monthly`) remain in `REPORT_LABELS` (`src/i18n.ts`), `REPORT_FILES` (`src/generate-manifest.ts`), `LABELS` (`index.html`) and `DIGEST_ISSUE_LABELS` (`src/github.ts`) only so archived reports stay reachable — do not add generation code back.
- `callLlm(prompt, maxTokens?)` defaults to 4096 tokens. `LLM_TOKENS_WEB` = 8192, `LLM_TOKENS_TRENDING` = 6144, `LLM_TOKENS_LISTING` = 6144 (Product Hunt).
- The trending and Product Hunt reports render their item lists as **Markdown tables** (not bullet lists). Numeric columns are copied verbatim from the fetched data; the summary column is 2 sentences. Tables already have CSS in `index.html` and render natively in GitHub Issues too. The group reports instead use prose sections per repo (今日速览 / 版本与更新 / 重要进展 / 社区热点 / 值得关注的信号) plus an activity table in the cross-project comparison.
- `buildHighlightsPrompt(reportContents, lang, itemsPerReport = 4)` produces the notification highlight JSON (WeCom/Telegram/Feishu). The default of 4 items per report keeps the push under WeCom's 4000-byte markdown cap.
- Address the report **reader**, not the developer: the four group reports target content/product/operations people who want to know what to try or watch. Prompts say 不要编造数据里没有的内容 — do not let a prompt edit reintroduce developer-audience framing (build flags, PR internals).
- `callLlm` retries on two error classes, with separate budgets; the concurrency slot is released during every wait.
  - **429** — 3 retries, 5 s / 10 s / 20 s. A rate limit clears in seconds.
  - **Connection failure** (DNS/TCP/TLS, detected by `isConnectionError` walking the SDK's `cause` chain) — 6 retries, 5 / 10 / 20 / 40 / 60 / 60 s, capped by `RETRY_MAX_MS`. A network outage between the runner and the provider lasts minutes, not seconds. On 2026-09-03 the DashScope cn-beijing endpoint was unreachable from the GitHub runner for the whole LLM phase; the old shared 3-retry ladder gave up 35 s in and the run published a digest of nothing but "generation failed" placeholders.
- Every LLM call site degrades gracefully (a failed summary becomes a fixed notice, a failed translation falls back to English), which is right per report and wrong for the run as a whole. `llmStats` in `src/report.ts` counts attempts and final failures across the run, and `assertLlmHealthy(stage)` throws when at least `LLM_MIN_SAMPLES` (5) calls have run and at least `LLM_ABORT_RATIO` (50%) of them failed. `main()` calls it at two gates — after the summary/translation phase and after the save phase — so a provider outage exits non-zero *before* anything is committed, no issues are opened and no Telegram/Feishu message is sent. A missing day is recoverable by `workflow_dispatch`; a published day of placeholders is not.
- `reportLlmHealth()` logs the final tally and, when any call was lost, appends a warning to `$GITHUB_STEP_SUMMARY` so a partially degraded run is visible on the Actions run page without a log dive.
- The concurrency limiter (`LLM_CONCURRENCY = 5`) prevents 429s when many parallel LLM calls fire. Do not bypass it by calling SDK clients directly.
- LLM provider is selected via `LLM_PROVIDER` env var (default: `anthropic`). Valid values: `anthropic`, `openai`, `github-copilot`, `openrouter`, `deepseek`, `qwen`.
- The daily GitHub Actions run uses `qwen` (`qwen-flash`). It replaced `deepseek-v4-flash` in August 2026, after DeepSeek's 8/16 repricing pushed a run to ~¥3; qwen-flash is ~¥0.5. `qwen-flash` is tier-priced by single-request input length — every prompt here stays inside the cheapest 0–128K tier.
- The daily workflow only ever produces one digest per CST day. Two mechanisms enforce it: a workflow-level `concurrency: daily-digest` group (`cancel-in-progress: false`) serializes overlapping runs, and a `guard` job skips **scheduled** runs whose `digests/YYYY-MM-DD` folder is already committed (checked via `gh api .../contents/...`, so no second checkout). `workflow_dispatch` always proceeds — that is the escape hatch for regenerating a day. This exists because GitHub delayed the 2026-08-26 scheduled run by 5h07m; the manual catch-up run and the late scheduled run both completed and opened 18 duplicate issues for 2026-08-27.
- Provider implementations live in `src/providers/`. Each file implements the `LlmProvider` interface. The factory in `src/providers/index.ts` validates the provider name and logs only the provider name — never API keys or endpoint URLs.
- `closeSupersededIssues` in `src/github.ts` (run by `pnpm close-stale`, the workflow's last step) keeps only the most recent digest day's issues open and closes the rest. The retained day is the newest **open digest issue**, not today's date, so a failed run leaves yesterday's reports up instead of closing everything. Days are compared as CST dates via `toCstDateStr`, matching the `digests/YYYY-MM-DD` folders — a delayed cron and its manual catch-up run land on the same day and are both retained. Eligibility requires a label in `DIGEST_ISSUE_LABELS` (current group + data-source labels, plus the legacy `digest`/`openclaw`/`infra`/`hn`/`arxiv`/`hf`/`community`/`weekly`/`monthly`), and pull requests are excluded: the `/issues` REST endpoint returns PRs too, and the previous `closeStaleIssues` would have closed any open PR older than its cutoff.
- GitHub issue label colors are defined in `LABEL_COLORS` in `src/github.ts`. Add new labels there.
- GitHub Discussions have no REST API, so `fetchRecentDiscussions` uses GraphQL. Enable per-repo with `discussions: true` — most tracked repos have the board enabled but dormant, and an unconditional fetch would just burn quota. Only `buildGroupPrompt` renders a Discussions section, and it is omitted entirely when there is no data.
- `sampleNote(total, sampled, lang, by)` in `src/prompts.ts` formats the "(共 N 条，展示前 M 条)" note. Reuse it — do not inline the same string format. Pass `by: "engagement"` when the sample was ranked by comments + upvotes (discussions) instead of comments alone.
- Web state (`digests/web-state.json`) is committed to git on every run. It is the source of truth for which URLs have been seen. `saveWebReport` writes it once at the end, regardless of whether a report was generated.
- On 2026-10-10 the tracked sources were replaced wholesale: the CLI/OpenClaw/infra/skills lists and the HN/ArXiv/HF/community data sources were retired in favor of the four audience-facing groups (see "Tracked sources"). The monthly-report pruning notes below are kept for historical context.
- Tracked repos are pruned when they go quiet. Removed August 2026 after an activity audit:
  - `deepseek-harness` — Issues/PRs disabled upstream and the Discussions board dormant: 13/13 days of zero data.
  - `zeptoclaw`, `nullclaw` — no upstream push for 30+ days; 90% and 50% of days had no activity at all.
  - `nanobot`, `nanoclaw`, `lobsterai`, `codewhale` — 17–37 items per 24h, well under the 30-issue + 20-PR prompt sample, so the model was padding a full 8-section report out of a handful of items.
  - `picoclaw`, `moltis` — removed by maintainer decision alongside the above.
  - Same audit fixed two renames: `qwibitai/nanoclaw` → `nanocoai/nanoclaw`, `agentscope-ai/CoPaw` → `agentscope-ai/QwenPaw`.

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
