# agents-radar

[English](./README.md) | 中文

每天早上约 07:00（北京时间）自动运行的 GitHub Actions 工作流：抓取过去 24 小时的中文科技媒体内容与 GitHub 趋势榜，生成一份中文日报 **《AI 每日要闻》**，提交到仓库、更新 Web UI 与 RSS，并推送到企业微信群（markdown 文本 + 图文卡片消息）。

日报面向非开发同事——内容创作、产品、运营、行政都能读。每条内容都是可点击的标题（直达原文）+ 一句话摘要（为什么值得看）。

## 日报结构

```
AI 每日要闻 2026-10-10
> 数据来源: 量子位 · 雷峰网 · 钛媒体 · 爱范儿 · 开源中国 · 少数派 · 小众软件 | 生成时间: … | 要闻 N 条 / 抓取 M 条

## 今日速览           当日 3–5 条一句话要闻
## 🔥 大模型动向       新模型、能力升级、重要融资与行业事件
## 🤖 智能体 & 开源项目 智能体、开源项目、开发者工具
## 🎬 创作者 · AIGC 玩法 对视频 / 图片 / 音频创作者有用的工具与玩法
## 💼 办公提效         文档、表格、演示、自动化、知识管理
## 📈 GitHub 趋势      搭配从 GitHub 实时抓取的真实 star 数
```

### 数据源

| 来源 | 类型 | 数据内容 |
|------|------|---------|
| [量子位](https://www.qbitai.com/feed) · [雷峰网](https://www.leiphone.com/feed) · [钛媒体](https://www.tmtpost.com/feed) · [爱范儿](https://www.ifanr.com/feed) · [开源中国](https://www.oschina.net/news/rss) · [少数派](https://sspai.com/feed) · [小众软件](https://www.appinn.com/feed/) | RSS / Atom | 过去 26 小时的文章 |
| [GitHub Trending](https://github.com/trending?since=daily) | HTML | 当日趋势仓库、总 star 数、当日新增 star |
| GitHub Search API | REST | 近 7 天活跃的 6 个 AI 主题仓库（`ai-agent`、`aigc`、`llm`、`image-generation`、`text-to-video`、`text-to-speech`） |

流水线会自动剔除「早报 / 晨报 / 周报」这类标题汇总条目（点进去只有一串标题，没有正文），并合并多家媒体对同一事件的重复报道。最终日报里的每个链接都来自真实抓取的数据，star 数也直接取自 GitHub——模型不会虚构链接或数字。

## Web UI

**[https://`<你的用户名>`.github.io/agents-radar](https://duanyytop.github.io/agents-radar)**

深色主题、无需登录，在线浏览所有历史日报。报告由本仓库的 Markdown 文件通过 GitHub Pages 渲染。

## RSS 订阅

**[https://`<你的用户名>`.github.io/agents-radar/feed.xml](https://duanyytop.github.io/agents-radar/feed.xml)**

在任意 RSS 阅读器（Feedly、Reeder、NewsBlur 等）中订阅。Feed 包含最新 30 条，与 `manifest.json` 每日同步更新。

## 通知推送

| 渠道 | 命令 | 推送内容 |
|------|------|---------|
| 企业微信群机器人 | `pnpm notify:wecom` | markdown 文本（标题 + 今日速览 + 日报链接）**以及**一条 `news` 图文消息（最多 8 张卡片，直达原文） |
| Telegram | `pnpm notify` | 消息 + 日报链接与速览 |
| 飞书 | `pnpm notify:feishu` | 卡片消息 + 速览 |

Telegram / 飞书读取 `digests/<日期>/highlights.json`，企业微信读取 `digests/<日期>/news.json`。对应密钥未配置时自动跳过。

**企业微信推送配置：**
1. 在目标企业微信群中打开 **群机器人 → 添加机器人**，复制 webhook 地址
2. 将其添加为仓库 Secret：`WECOM_WEBHOOK_URLS`（多个群用英文逗号分隔）

## 特性

- 每天一份中文日报——不做双语重复生成，只有一次模型调用
- 只发布「点得开」的内容：所有链接都经白名单校验，star 数来自真实抓取
- 内置标题汇总过滤与跨源去重
- 覆盖四个方向：热门智能体、创作者赋能、办公提效、AIGC
- 可推送企业微信 / Telegram / 飞书
- 消息源在 `config.yml` 中配置，无需改代码
- 每日定时运行，支持手动触发与补跑

## 部署

### 1. Fork 本仓库

### 2. 调整 `config.yml`（可选）

`news_sources` 按优先级列出要跟踪的 RSS 源（同一事件多家报道时，靠前的源优先保留）。增删、调序均可——流水线每次运行都会读取，配置段缺失时回退到内置默认值。

```yaml
news_sources:
  - id: qbitai
    name: 量子位
    url: https://www.qbitai.com/feed
  # 继续添加；设 `enabled: false` 可暂停某个源
```

### 3. 添加 Secrets

打开 **Settings → Secrets and variables → Actions**：

| Secret | 是否必需 | 说明 |
|--------|---------|------|
| `DEEPSEEK_API_KEY` | 必需 | 定时任务的模型密钥（工作流里 `LLM_PROVIDER=deepseek`） |
| `WECOM_WEBHOOK_URLS` | 建议配置 | 企业微信群机器人 webhook 地址，多个用英文逗号分隔 |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | 可选 | Telegram 推送 |
| `FEISHU_WEBHOOK_URLS` | 可选 | 飞书机器人 webhook 地址，多个用英文逗号分隔 |

> `GITHUB_TOKEN` 由 GitHub Actions 自动提供。

### 4. 启用工作流

在 **Actions** 页确认工作流已启用。想立即测试：**Actions → Daily Agents Radar → Run workflow**（手动运行总是执行，即使当天日报已存在）。

## 模型供应商

通过 `LLM_PROVIDER` 选择模型后端，默认 `anthropic`；定时工作流使用 `deepseek`。

| 供应商 | `LLM_PROVIDER` | 所需环境变量 | 默认模型 |
|--------|---------------|--------------|---------|
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-6` |
| OpenAI | `openai` | `OPENAI_API_KEY` | `gpt-4o` |
| GitHub Copilot | `github-copilot` | `GITHUB_TOKEN` | `gpt-4o` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` | `anthropic/claude-sonnet-4` |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` | `deepseek-v4-flash` |
| 通义千问 | `qwen` | `DASHSCOPE_API_KEY` | `qwen-flash` |

可用 `ANTHROPIC_MODEL` / `OPENAI_MODEL` / `GITHUB_COPILOT_MODEL` / `OPENROUTER_MODEL` / `DEEPSEEK_MODEL` / `QWEN_MODEL` 覆盖模型名。供应商实现位于 `src/providers/`，新增一个供应商 = 新建文件 + 在工厂注册。

## 本地运行

```bash
pnpm install

# 方案 A：DeepSeek（CI 使用）
export LLM_PROVIDER=deepseek
export DEEPSEEK_API_KEY=sk-xxxxxxxx

# 方案 B：Anthropic（默认）
# export ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

export GITHUB_TOKEN=ghp_xxxxx          # 可选：趋势搜索 API
export DIGEST_REPO=                     # 留空则只写文件（不创建 GitHub Issue）

pnpm start
```

> 除非确实要推送到真实群，否则不要在本地运行 `pnpm notify:wecom`。

## 输出文件

写入 `digests/YYYY-MM-DD/`：

| 文件 | 内容 |
|------|------|
| `ai-news.md` | 《AI 每日要闻》日报（中文） |
| `news.json` | 结构化日报——速览、分区条目、趋势行、推送卡片；企业微信推送的数据来源 |
| `highlights.json` | 速览条目，供 Telegram / 飞书通知使用 |

设置了 `DIGEST_REPO` 时会额外创建一个带 `ai-news` 标签的 GitHub Issue（内容与 markdown 相同）。定时工作流未设置该项，因此 CI 只写文件、不开 Issue。

历史日报存放在 [`digests/`](./digests/)。此前的报告类型（四个方向的仓库组日报、官网 sitemap 追踪、Product Hunt、GitHub 趋势报告，以及更早的 CLI / HN / ArXiv / HF 等）已于 2026 年 10 月随《AI 每日要闻》上线而退役，旧报告仍可在 `digests/` 和 Web UI 中浏览。

## 定时计划

| 工作流 | Cron | UTC | 北京时间 |
|--------|------|-----|---------|
| 每日简报 | `37 22 * * *` | 每天 22:37 | 次日 06:37 |

GitHub 的定时任务是排队执行而非准点保证——06:37 开始通常会在 07:00 左右产出日报。分钟数特意避开整点：整点是竞争最激烈的时段。

两个保护机制避免同一天重复发布：工作流级 `concurrency: daily-digest` 串行化重叠运行；`guard` 任务在 `digests/YYYY-MM-DD`（北京时间日期）已提交时跳过**定时**运行。手动 `workflow_dispatch` 总是执行，可用于补跑当天。

如需修改时间，编辑 `.github/workflows/daily-digest.yml` 中的 cron 表达式：

| 北京时间 | UTC cron |
|----------|----------|
| 次日 06:37 | `37 22 * * *` |
| 次日 07:37 | `37 23 * * *` |
| 次日 08:37 | `37 0 * * *` |

---

基于 [duanyytop/agents-radar](https://github.com/duanyytop/agents-radar)。
