# CLAUDE.md

The authoritative project documentation is **[AGENTS.md](./AGENTS.md)** — read it first. It covers the architecture, the source-file map, the tracked sources, the outputs and the conventions.

Quick reference:

```bash
pnpm start          # run the full digest locally
pnpm test           # vitest
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm format:check   # Prettier
pnpm manifest       # regenerate manifest.json + feed.xml
pnpm notify:wecom   # WeCom push for the latest digest
```

Local run (never run `pnpm notify:wecom` locally — the webhook pushes to the real group):

```bash
set -a; source ../.env.secrets; set +a
LLM_PROVIDER=deepseek DIGEST_REPO= npx tsx src/index.ts
```

## Non-negotiable invariants

- The digest is generated **once, in Chinese**. `buildDailyNewsPrompt` → one `callLlm` → `saveDailyNews`. Never add a translation pass or a second generation call.
- Anti-hallucination: `normalizeDailyNews` drops any URL not in the allow-list (fetched news links + trending repo URLs), and trending stars always come from `buildTrendingRows` (real fetched data), never from the model. `saveDailyNews` throws rather than publish a digest with zero usable entries.
- `news.ts` filters roundup entries (早报/晨报/周报/盘点… and leiphone `/zaobao/` links) on purpose — they link to a headline list, not an article body. Do not relax that filter.
- Trending star parsing goes through `countAfterAnchor` in `src/trending.ts`: GitHub's inline SVG `path` data is full of digits, so the markup must be stripped before scanning for the count.
- WeCom: the highlights message is msgtype `text` (≤ 2048 bytes; plain text so 长按 → 复制 reproduces it — markdown copies as its raw source), ≤ 8 cards, card title ≤ 128 bytes / description ≤ 512 bytes, and the HTTP response is 200 even on failure — check `errcode`. Cards carry the article's `og:image` as `picurl` (`attachCardImages`); a failed fetch degrades to WeCom's gray placeholder, never an error.
- `callLlm`'s concurrency limiter (`LLM_CONCURRENCY = 5`) prevents 429s; do not bypass it by calling SDK clients directly. Retry ladders: 429 → 3 retries at 5/10/20 s; connection failure → 6 retries at 5/10/20/40/60/60 s.
- Report scaffolding (title, section headings, meta line) lives in `NEWS_REPORT` (`src/i18n.ts`); do not inline those strings.
- Discontinued report ids (`ai-hot-agents`, `ai-creator`, `ai-office`, `ai-aigc`, `ai-web`, `ai-trending`, `ai-ph`, and the older ones) stay in `REPORT_LABELS` / `REPORT_FILES` / `index.html` `LABELS` only so archived digests stay reachable — do not restore their generation code.
- The Web UI gives `ai-news` a news-article skin (`body.news-view`: paper card on a light canvas) and defaults to the light theme — the localStorage key is `ar-theme-v2`; do not revive the old `ar-theme` key, whose stored `dark` value would drag returning readers back into the dev-console look.
- Prompt tone targets a non-developer audience (content/product/operations). Keep summaries to one line, no developer jargon, 不要编造数据里没有的内容.

## Workflow facts

- Cron `37 22 * * *` UTC = 06:37 CST; a `guard` job skips scheduled runs whose `digests/YYYY-MM-DD` already exists, and `concurrency: daily-digest` serializes overlapping runs. `workflow_dispatch` always proceeds.
- The daily run uses `LLM_PROVIDER=deepseek` + `DEEPSEEK_API_KEY` and does **not** set `DIGEST_REPO` — CI writes files only, no GitHub issues.
- `index.html` + `manifest.json` + `feed.xml` are regenerated/committed after the digest step; `pnpm close-stale` runs last.
