# agents-radar

[English](./README.md) | 中文

每天早上约 07:00 CST 自动运行的 GitHub Actions 工作流。围绕四个方向 —— 热门智能体、博主/创作者赋能、办公 AI、AIGC —— 聚合 AI 生态信号，以中英双语每日简报的形式发布为 GitHub Issues 并提交为 Markdown 文件。

### 数据源

| 来源 | 类型 | 数据内容 |
|------|------|---------|
| [GitHub Repos](https://github.com) | API | 4 组共 24 个追踪仓库的 Issues、PR、Releases（智能体 / 创作者 / 办公 / AIGC） |
| [GitHub Trending](https://github.com/trending) | HTML + API | 每日热门仓库 + 主题搜索（7 天窗口） |
| [Product Hunt](https://www.producthunt.com) | GraphQL API | 昨日 AI 产品按投票排序 |
| [Anthropic](https://anthropic.com) + [OpenAI](https://openai.com) | Sitemap | 通过 `lastmod` 差异检测新文章 |

## Web UI

**[https://duanyytop.github.io/agents-radar](https://duanyytop.github.io/agents-radar)**

在线浏览所有历史简报，深色主题，无需登录。报告直接由本仓库的 Markdown 文件通过 GitHub Pages 渲染。每份报告支持中文 / 英文切换。

![Web UI](assets/web-zh.png) 

## Telegram 频道 & 飞书群

订阅你常用的平台，每日简报生成后自动推送通知，附带所有报告的直达链接（中文 / 英文）。

<table>
  <tr>
    <td align="center"><b><a href="https://t.me/agents_radar">加入 Telegram 频道</a></b></td>
    <td align="center"><b><a href="https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=b56v3be8-b027-4ee6-abc4-65bf1f80bccd">加入飞书群</a></b></td>
  </tr>
  <tr>
    <td><img src="assets/telegram.jpg" width="300" alt="Telegram 推送"></td>
    <td><img src="assets/feishu.jpg" width="300" alt="飞书推送"></td>
  </tr>
</table>

## RSS 订阅

**[https://duanyytop.github.io/agents-radar/feed.xml](https://duanyytop.github.io/agents-radar/feed.xml)**

在任意 RSS 阅读器（Feedly、Reeder、NewsBlur 等）中订阅，每日自动推送新简报。Feed 包含最新 30 条报告（覆盖所有报告类型），与 `manifest.json` 同步更新。

## MCP Server

**`https://agents-radar-mcp.duanyytop.workers.dev`**

基于 [Model Context Protocol](https://modelcontextprotocol.io) 的托管服务，将 agents-radar 数据暴露为工具接口。任何支持 MCP 的客户端（Claude Desktop、OpenClaw 等）均可直接查询最新 AI 生态报告。

**可用工具：**

| 工具 | 说明 |
|------|------|
| `list_reports` | 列出最近 N 天的可用日期和报告类型 |
| `get_latest` | 获取某类报告的最新一期 |
| `get_report` | 按日期和类型精确获取报告 |
| `search` | 关键词搜索最近 N 天的报告 |

**Claude Desktop 接入** — 编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "agents-radar": {
      "url": "https://agents-radar-mcp.duanyytop.workers.dev"
    }
  }
}
```

保存后重启 Claude Desktop，即可直接提问：
- *"最近 AI CLI 工具有什么动态？"* → 调用 `get_latest`
- *"搜索本周提到 Claude Code 的报告"* → 调用 `search`
- *"获取 2026-03-05 的 GitHub 趋势报告"* → 调用 `get_report`

**OpenClaw 接入** — 执行以下命令：

```bash
openclaw mcp add --transport http agents-radar https://agents-radar-mcp.duanyytop.workers.dev
```

或手动编辑 `~/.openclaw/openclaw.json`：

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

配置完成后即可在 OpenClaw 中直接提问：
- *"最近 AI CLI 工具有什么动态？"* → 调用 `get_latest`
- *"搜索本周提到 Claude Code 的报告"* → 调用 `search`
- *"获取 2026-03-05 的 GitHub 趋势报告"* → 调用 `get_report`

**自托管** — 从 `mcp/` 目录部署自己的实例：

```bash
cd mcp
pnpm install
wrangler deploy
```

## 追踪来源

报告按四个面向读者的方向组织。每个方向追踪 6 个 GitHub 仓库，生成每仓库简报 + 横向对比 —— 全部以通俗语言写给不写代码的读者（内容、产品、运营）看。

### 🤖 热门智能体动态

大家真正在用、在持续更新的智能体项目，从个人助理到垂直场景 Agent。

| 项目 | 仓库 |
|------|------|
| Hermes Agent | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| Agent Reach | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) |
| Career Ops | [career-ops-hq/career-ops](https://github.com/career-ops-hq/career-ops) |
| Cherry Studio | [CherryHQ/cherry-studio](https://github.com/CherryHQ/cherry-studio) |
| Nanobot | [HKUDS/nanobot](https://github.com/HKUDS/nanobot) |
| CowAgent | [zhayujie/CowAgent](https://github.com/zhayujie/CowAgent) |

### 🎬 博主 / 创作者赋能

面向博主与新媒体创作者的视频、音频与内容生产工具链。

| 项目 | 仓库 |
|------|------|
| MoneyPrinterTurbo | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) |
| OpenMontage | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) |
| pyVideoTrans | [jianchang512/pyvideotrans](https://github.com/jianchang512/pyvideotrans) |
| Toonflow | [HBAI-Ltd/Toonflow-app](https://github.com/HBAI-Ltd/Toonflow-app) |
| OpenCreator | [krillinai/OpenCreator](https://github.com/krillinai/OpenCreator) |
| LiveTalking | [lipku/LiveTalking](https://github.com/lipku/LiveTalking) |

### 💼 办公与效率

提升日常办公效率：工作流自动化、笔记、表格、演示与文档。

| 项目 | 仓库 |
|------|------|
| n8n | [n8n-io/n8n](https://github.com/n8n-io/n8n) |
| PPT Master | [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) |
| SiYuan | [siyuan-note/siyuan](https://github.com/siyuan-note/siyuan) |
| Teable | [teableio/teable](https://github.com/teableio/teable) |
| GenOffice | [genspark-ai/genoffice](https://github.com/genspark-ai/genoffice) |
| Presenton | [presenton/presenton](https://github.com/presenton/presenton) |

### 🎨 AIGC

图像、视频、音频生成技术栈 —— 生成式内容背后的工具。

| 项目 | 仓库 |
|------|------|
| ComfyUI | [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) |
| Open Generative AI | [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) |
| InvokeAI | [invoke-ai/InvokeAI](https://github.com/invoke-ai/InvokeAI) |
| VoiceStudio | [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) |
| HunyuanVideo | [Tencent-Hunyuan/HunyuanVideo](https://github.com/Tencent-Hunyuan/HunyuanVideo) |
| GPT-SoVITS | [RVC-Boss/GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) |

四组列表都写在 `config.yml`（`agents_repos`、`creator_repos`、`office_repos`、`aigc_repos`）中，增删仓库无需改代码。

### GitHub AI 趋势热榜

每天并行获取两个数据源：

| 来源 | 说明 |
|------|------|
| [github.com/trending](https://github.com/trending?since=daily) | 今日热榜，HTML 解析，含今日新增 Stars 数 |
| GitHub Search API | 7 天内活跃的 AI 相关仓库，覆盖 6 个与四大方向对齐的主题标签：`ai-agent`、`aigc`、`llm`、`image-generation`、`text-to-video`、`text-to-speech` |

LLM 负责过滤非 AI 项目，将结果按方向分类（🤖 智能体 / 🎬 创作者工具 / 💼 办公与效率 / 🎨 AIGC），并提炼趋势信号。

### 官网内容（基于 Sitemap）

| 组织 | 网站 | 追踪板块 |
|------|------|---------|
| Anthropic | [anthropic.com](https://www.anthropic.com) | `/news/`、`/research/`、`/engineering/`、`/learn/` |
| OpenAI | [openai.com](https://openai.com) | research、publication、release、company、engineering、milestone、learn-guides、safety、product |

通过对比 Sitemap 中的 `lastmod` 时间戳与持久化状态文件（`digests/web-state.json`）来检测新文章。**首次运行**时，每个站点最多抓取 25 篇近期文章并生成全量概览报告；后续运行仅处理新增或更新的 URL，无新内容则跳过网页报告步骤。

## 功能特性

- 追踪四大方向共 24 个 AI 项目 —— 🤖 热门智能体、🎬 创作者工具、💼 办公 AI、🎨 AIGC
- 每个方向生成每项目简报 + 横向对比分析，以通俗语言写给不写代码的读者
- 通过 Sitemap 抓取 Anthropic 和 OpenAI 官网内容，增量检测新文章
- 每日监测 GitHub Trending + 搜索 6 个 AI 主题，按方向分类并提炼趋势信号
- 以 GitHub Issues 形式发布报告，同时提交 Markdown 文件至 `digests/YYYY-MM-DD/`
- 配置了 Webhook 时，每日简报自动推送到 Telegram / 飞书 / 企业微信群
- 每份报告只用英文生成一次，再翻译成中文，不再对同一份数据跑两遍完整流水线
- 每日通过 GitHub Actions 定时运行，支持手动触发
- 所有追踪仓库均可通过 `config.yml` 配置，无需修改代码

## 部署配置

### 1. Fork 本仓库

### 2. 自定义 `config.yml`（可选）

编辑仓库根目录的 `config.yml`，可增删或替换追踪的仓库。文件内有详细注释，每次工作流运行时自动读取，无需改代码。若文件不存在则使用内置默认值。

```yaml
# 给「热门智能体」报告增加一个仓库
agents_repos:
  - id: my-agent
    repo: owner/my-agent
    name: My Agent
    paginated: true   # 每日 issue/PR 更新超过 100 条时开启

# 其余三个板块写法相同：
# creator_repos → ai-creator（博主/创作者赋能）
# office_repos  → ai-office（办公与效率）
# aigc_repos    → ai-aigc（AIGC）
```

### 3. 添加 Secrets

进入 **Settings → Secrets and variables → Actions**，添加以下密钥：

| Secret | 必填 | 说明 |
|--------|------|------|
| `LLM_PROVIDER` | 可选 | `anthropic`（默认）、`openai`、`github-copilot`、`openrouter`、`deepseek` 或 `qwen` |
| `ANTHROPIC_API_KEY` | Anthropic 时 | API 密钥，兼容 Anthropic 和 Kimi Code |
| `ANTHROPIC_BASE_URL` | 可选 | API 地址覆盖。使用 Kimi Code 时设置为 `https://api.kimi.com/coding/`，使用 Anthropic 时留空 |
| `OPENAI_API_KEY` | OpenAI 时 | OpenAI API 密钥 |
| `OPENAI_BASE_URL` | 可选 | OpenAI 端点覆盖 |
| `OPENROUTER_API_KEY` | OpenRouter 时 | OpenRouter API 密钥 |
| `DEEPSEEK_API_KEY` | DeepSeek 时 | DeepSeek API 密钥 |
| `DASHSCOPE_API_KEY` | Qwen 时 | 阿里云百炼 API 密钥 |
| `TELEGRAM_BOT_TOKEN` | 可选 | Telegram bot token，从 [@BotFather](https://t.me/BotFather) 获取。设置后每次 digest 完成自动推送通知 |
| `TELEGRAM_CHAT_ID` | 可选 | 接收通知的 Telegram 频道 / 群组 / 用户 ID |
| `FEISHU_WEBHOOK_URLS` | 可选 | 飞书自定义机器人 Webhook URL，多个用英文逗号分隔。设置后每次 digest 完成自动推送卡片通知到所有群 |
| `WECOM_WEBHOOK_URLS` | 可选 | 企业微信群机器人 Webhook URL，多个用英文逗号分隔。设置后每次 digest 完成自动推送 markdown 通知到所有群 |

> `GITHUB_TOKEN` 由 GitHub Actions 自动提供，无需手动添加。使用 `github-copilot` 作为 Provider 时，同一 `GITHUB_TOKEN` 也用于 LLM 调用。

**配置 Telegram 推送**（可选）：
1. 向 [@BotFather](https://t.me/BotFather) 创建 bot，复制 token
2. 将 bot 加入频道 / 群组，或直接与 bot 私聊
3. 通过 [@userinfobot](https://t.me/userinfobot) 获取 chat ID
4. 在仓库 Secrets 中添加 `TELEGRAM_BOT_TOKEN` 和 `TELEGRAM_CHAT_ID`

**配置企业微信推送**（可选）：
1. 在企业微信群中打开「群机器人」→「添加机器人」，复制 Webhook 地址
2. 在仓库 Secrets 中添加 `WECOM_WEBHOOK_URLS`（多个地址用英文逗号分隔）

> 两个 secret 均未设置时，通知步骤静默跳过，不影响正常运行。

### 3. 启用工作流

在 **Actions** 标签页中确认工作流已启用。

如需立即测试，进入 **Actions → Daily Agents Radar → Run workflow** 手动触发。

> **首次运行说明**：网页内容步骤将抓取最多 50 篇文章（每站 25 篇），可能需要额外几分钟。后续运行仅处理新内容，速度更快。

## LLM 模型供应商

通过 `LLM_PROVIDER` 环境变量选择模型后端，默认为 `anthropic`。

| 供应商 | `LLM_PROVIDER` | 所需环境变量 | 默认模型 |
|--------|---------------|------------|----------|
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-6` |
| OpenAI | `openai` | `OPENAI_API_KEY` | `gpt-4o` |
| GitHub Copilot | `github-copilot` | `GITHUB_TOKEN` | `gpt-4o` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` | `anthropic/claude-sonnet-4` |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` | `deepseek-v4-flash` |
| Qwen | `qwen` | `DASHSCOPE_API_KEY` | `qwen-flash` |

可通过 `ANTHROPIC_MODEL`、`OPENAI_MODEL`、`GITHUB_COPILOT_MODEL`、`OPENROUTER_MODEL`、`DEEPSEEK_MODEL` 或 `QWEN_MODEL` 分别覆盖默认模型名称；Qwen 的接入点可用 `DASHSCOPE_BASE_URL` 覆盖。

每日定时任务使用 `qwen` / `qwen-flash`。

Provider 抽象层位于 `src/providers/`，每个供应商对应独立文件并实现 `LlmProvider` 接口。新增供应商只需创建新文件并在工厂函数中注册。

## 本地运行

```bash
pnpm install

export GITHUB_TOKEN=ghp_xxxxx

# 方式 A: Anthropic（默认）
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

# 方式 B: OpenAI
# export LLM_PROVIDER=openai
# export OPENAI_API_KEY=sk-xxxxxxxx

# 方式 C: GitHub Copilot（使用 GITHUB_TOKEN）
# export LLM_PROVIDER=github-copilot

# 方式 D: OpenRouter
# export LLM_PROVIDER=openrouter
# export OPENROUTER_API_KEY=sk-or-xxxxxxxx

# 方式 E: DeepSeek
# export LLM_PROVIDER=deepseek
# export DEEPSEEK_API_KEY=sk-xxxxxxxx

# Qwen（阿里云百炼）
# export LLM_PROVIDER=qwen
# export DASHSCOPE_API_KEY=sk-xxxxxxxx

export DIGEST_REPO=your-username/agents-radar  # 可选，留空则仅写入本地文件

pnpm start
```

## 输出格式

文件写入 `digests/YYYY-MM-DD/`：

| 文件 | 内容 | GitHub Issue 标签 |
|------|------|------------------|
| `ai-hot-agents.md` | 热门智能体动态 — 横向对比 + 各项目详细报告 | `hot-agents` |
| `ai-creator.md` | 博主/创作者赋能 — 视频、数字人、配音、内容生产 | `creator` |
| `ai-office.md` | 办公与效率 — 文档、表格、演示、工作流自动化 | `office` |
| `ai-aigc.md` | AIGC — 图像 / 视频 / 音频生成技术栈 | `aigc` |
| `ai-web.md` | 官网内容报告（仅在有新内容时生成） | `web` |
| `ai-trending.md` | GitHub AI 趋势热榜 — 按方向分类 + 趋势信号分析（仅在有数据时生成） | `trending` |
| `ai-ph.md` | Product Hunt AI 产品简报（仅在设置 `PRODUCTHUNT_TOKEN` 且有数据时生成） | `ph` |

`digests/web-state.json` 用于记录已处理的 URL，随每日简报一并提交。

每份报告都会生成中文（`ai-hot-agents.md`）和英文（`ai-hot-agents-en.md`）两个版本，Web UI 侧边栏为双语报告提供 ZH / EN 切换。

---

四份方向报告（`ai-hot-agents.md`、`ai-creator.md`、`ai-office.md`、`ai-aigc.md`）结构一致：
```
覆盖项目: 6 个

## 横向对比
  整体概览 / 活跃度对比表 / 共同关注的方向 / 差异化定位 / 值得关注的信号

## 各项目详细报告
  <details> Hermes Agent  — 今日速览 / 版本与更新 / 重要进展 /
                            社区热点 / 值得关注的信号
  <details> Agent Reach   — ...
  <details> Career Ops    — ...
  <details> Cherry Studio — ...
  <details> Nanobot       — ...
  <details> CowAgent      — ...
```

所有正文都以通俗语言写给不写代码的读者（内容、产品、运营），侧重「能拿它做什么」而非实现细节。

`ai-web.md` 结构：
```
数据来源: anthropic.com (N 篇) + openai.com (N 篇)

今日速览
Anthropic/Claude 内容精选  (news / research / engineering / learn)
OpenAI 内容精选            (research / release / company / safety / ...)
战略信号解读
值得关注的细节
[首次全量时额外包含: 内容格局总览]
```

`ai-trending.md` 结构：
```
数据来源: GitHub Trending + GitHub Search API

今日速览
各方向热门项目
  🤖 智能体         — Agent 框架 / 个人助理 / 自动化
  🎬 创作者工具     — 视频 / 数字人 / 配音 / 内容生产
  💼 办公与效率     — 文档 / 表格 / 演示 / 工作流自动化
  🎨 AIGC          — 图像 / 视频 / 音频生成
  🧩 其他 AI 应用
趋势信号分析
值得关注的项目
```

历史简报存储在 [`digests/`](./digests/)。已发布的 Issues 按类型打标签：[`hot-agents`](../../issues?q=is%3Aissue+label%3Ahot-agents) · [`creator`](../../issues?q=is%3Aissue+label%3Acreator) · [`office`](../../issues?q=is%3Aissue+label%3Aoffice) · [`aigc`](../../issues?q=is%3Aissue+label%3Aaigc) · [`web`](../../issues?q=is%3Aissue+label%3Aweb) · [`trending`](../../issues?q=is%3Aissue+label%3Atrending) · [`ph`](../../issues?q=is%3Aissue+label%3Aph)。

只有最近一天的 Issue 保持 open —— 每次运行 `pnpm close-stale` 会关闭更早的全部日报 Issue，列表因此稳定在一天的量级，而不是几千条。不会删除任何内容：上面的标签链接包含已关闭的 Issue，完整存档同时保存在 `digests/` 和 Web UI 里。没有日报标签的 Issue 以及 Pull Request 不会被动到。

早期的报告类型（CLI 工具、OpenClaw 生态、AI 基础设施、Hacker News、ArXiv、Hugging Face、Dev.to/Lobste.rs）已在 2026 年 10 月改版为上述四大方向时退役，历史报告仍可在 `digests/` 和 Web UI 中浏览；每周 / 每月汇总报告已于 2026 年 7 月停更。

## 定时计划

默认 cron 表达式 `"37 22 * * *"` = **22:37 UTC = 次日 06:37 CST**。

GitHub 的定时任务是排队执行的，并不准时 —— 本工作流实测延迟通常在 10~15 分钟，所以 06:37 CST 启动、约 07:00 CST 出报告。分钟数刻意避开整点：`:00` 是排队最挤的时段，工作流用 `0 23 * * *` 期间延迟从几分钟恶化到几小时（2026-08-26 那次晚了 5 小时 07 分才派发，2026-08-27 那次干脆没被创建）。

定时任务迟到、你手动补跑一次之后，延迟的定时任务仍可能再跑一遍，生成同一天的报告并开出重复 issue。两道保险防止这种情况：workflow 级 `concurrency: daily-digest` 让重叠的 run 串行执行；`guard` job 会跳过 `digests/YYYY-MM-DD`（CST 日期）已提交的**定时** run。手动 `workflow_dispatch` 永远照常执行，需要重新生成时不受影响。

修改时间请编辑 `.github/workflows/daily-digest.yml` 中的 cron 表达式：

| CST      | UTC cron       |
|----------|----------------|
| 06:37 次日 | `37 22 * * *` |
| 07:37 次日 | `37 23 * * *` |
| 08:37    | `37 0 * * *`   |

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=duanyytop/agents-radar&type=Date)](https://star-history.com/#duanyytop/agents-radar&Date)
