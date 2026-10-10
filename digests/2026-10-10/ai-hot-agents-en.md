# Hot AI Agents Digest 2026-10-10

> Generated: 2026-10-10 05:50 UTC | Projects covered: 6

- [Hermes Agent](https://github.com/NousResearch/hermes-agent)
- [Agent Reach](https://github.com/Panniantong/Agent-Reach)
- [Career Ops](https://github.com/career-ops-hq/career-ops)
- [Cherry Studio](https://github.com/CherryHQ/cherry-studio)
- [Nanobot](https://github.com/HKUDS/nanobot)
- [CowAgent](https://github.com/zhayujie/CowAgent)

---

## Cross-Project Comparison

## 1. Overview

Across the six agent projects tracked on 2026-10-10, **no project shipped a new release in the last 24 hours**. The action is almost entirely in open issues, proposed changes and community threads — and the dominant concern is no longer “what new trick can agents do,” but **whether users can trust them with real, long-running work**. Desktop control is moving from demos toward productized features, while reliability, data integrity, multi-user separation and cost-aware model routing are recurring asks. For content, product and operations readers, the useful signal is that the ecosystem is entering a hardening phase: fewer headline launches, more work on permissions, recovery, context handling and team-ready administration.

## 2. Activity Comparison

| Project | Issues count | PR count | Release status |
|---|---:|---:|---|
| **Hermes Agent** | 14 cited | 12 cited | No release in last 24 hours |
| **Agent Reach** | 1 cited | 3 cited | No release in last 24 hours |
| **Career Ops** | 62 active | 133 active | No release shipped; 1.36.0 release proposal queued |
| **Cherry Studio** | 14 cited | 12 cited | No release in last 24 hours |
| **Nanobot** | 7 cited | 14 cited | No release in last 24 hours |
| **CowAgent** | 17 cited | 11 cited | No release in last 24 hours |

*Note: Except for Career Ops, counts are digest-cited examples from the day’s summaries, not full repo totals. None of these six projects were reported as having Issues/PRs disabled upstream, so no “N/A” rows apply.*

## 3. Shared Themes

**Reliability and trust are the top cross-project concern.** Hermes has update loops, cleanup deleting multi-day work, and context-window shrinking. Career Ops is fixing batch runs overwriting edits and dead postings resurfacing. Cherry Studio has backup corruption and search-index bloat. CowAgent has a report that after context compaction the model silently stops calling tools and invents results. Nanobot is doing broad channel and security hardening.

**Desktop control and computer use are moving closer to product.** Nanobot has a proposed one-step “Computer Use” feature; Hermes has a script-speed computer-use RFC and one-call browser snapshots; Cherry Studio is debugging Chinese-language Windows Computer Use; CowAgent is improving desktop document reading and diagram rendering.

**Cross-platform continuity and channel polish matter more than new channels.** Hermes users want one conversation across Discord, Telegram and Slack. Nanobot is fixing Telegram, Slack, Matrix, WhatsApp and media handling. CowAgent is working through WeChat/Weixin, WhatsApp and desktop session issues.

**Agent steering and cost-aware routing are becoming first-class features.** Cherry Studio wants mid-conversation agent switching, plan-on-expensive-model/execute-on-cheap-model, and fallback models. Hermes is adding compaction visibility and model/pricing updates. Career Ops is adding confirm-gated AI steps. CowAgent wants per-capability switches and adjustable “thinking effort.”

**Knowledge and data management are the new user interface.** CowAgent’s hottest thread is about categorizing, uploading and bulk-importing knowledge-base files instead of managing everything through chat. Career Ops is turning its dashboard into a decision surface for CVs, analytics, skill gaps and company evidence. Cherry Studio is expanding connectors; Agent Reach is making skills portable across AI workspaces.

**Multi-user and personal/work separation are rising needs.** CowAgent has requests for multi-user data isolation and an embeddable customer-service window. Nanobot added a `--home` option for separate personal and work assistants. Career Ops is seeing plugin registries and downstream forks. Hermes is proposing session-owned toolsets so one conversation’s tools do not leak into others.

**Skills and dependencies still create invisible failures.** Cherry Studio users want the app to detect and install command-line tools that skills depend on. Agent Reach is adding Qoder install/uninstall support with dry-run removal. CowAgent users are frustrated by overlapping configuration screens. This is a major onboarding blocker for non-technical teams.

**Security and permissions need a usability pass.** CowAgent has privacy and destructive-command reports. Nanobot is hardening DNS validation and shell sandboxing. Hermes has security scanners flagging legitimate security documentation. Cherry Studio users want explicit confirmation for paid tool calls.

## 4. Positioning Differences

| Project | Focus | Target users | Approach |
|---|---|---|---|
| **Hermes Agent** | Broad desktop-native assistant with plugins, cross-platform memory and infrastructure monitoring | Power users, ops teams, multi-channel teams | Platform-like: many integrations, desktop hub, computer-use future |
| **Agent Reach** | Portable skills across AI coding workspaces, finance data, commerce research | Developers plus non-technical researchers and resellers | Lightweight install target: skills travel between assistants |
| **Career Ops** | Vertical job-search and application agent | Job seekers, career changers, non-technical users | Workflow product: dashboard, tracker, CV/cover letters, analytics |
| **Cherry Studio** | Desktop AI workspace for agents, connectors and model routing | Power users, small teams, productivity operators | Agent platform: connectors, background tasks, cost controls |
| **Nanobot** | Messaging-first personal assistant with emerging desktop control | Personal/work assistant users, self-hosted and enterprise teams | Multi-channel assistant: strong messaging integrations, security hardening |
| **CowAgent** | Knowledge-base and desktop assistant with team-sharing ambitions | Individuals to small teams, especially Chinese ecosystem | Assistant plus knowledge management, WeChat/Weixin and desktop app |

## 5. Signals to Watch

1. **Reliability is now the adoption gate.** Buyers and teams should ask about update recovery, backup restore, cleanup safety and context-compaction behavior before trusting an agent with production work.

2. **Desktop control is arriving, but permission UX is unresolved.** Nanobot, Hermes, Cherry Studio and CowAgent are all pushing toward agents that click, type and navigate. The winner will be the one that makes permissions understandable to non-technical users.

3. **Multi-instance and multi-user separation will become normal.** Personal vs. work assistants, per-team data isolation and shared customer-service windows are all appearing. Expect admin features to matter as much as model quality.

4. **Cost-aware model routing is becoming a product feature.** Planning on a strong model and executing on a cheaper one, plus automatic fallback, will appeal directly to operations teams managing spend per task.

5. **Skills need dependency management.** A skill that loads but cannot run is an invisible failure. One-click “install what this skill needs” would unlock a much wider non-technical audience.

6. **Data integrity and observability are underrated.** Batch overwrites, dead job postings, unreclaimed search indexes and silent context compaction all erode trust. Readers should watch for dashboards and logs that make agent work auditable.

7. **Connectors are becoming a distribution channel.** Sonos, B2B data APIs, Telegram, IOWAP, WhatsApp and finance data feeds show that “what is in the catalog” may soon matter as much as “what models are supported.”

8. **Localization and messy real-world desktops are the last mile.** CJK citation checks, Chinese Windows Computer Use, Polish interview modes and Windows setup friction all point to the same gap: agents work in clean demos, but teams live in messy environments.

---

## Per-Project Reports

<details>
<summary><strong>Hermes Agent</strong> — <a href="https://github.com/NousResearch/hermes-agent">NousResearch/hermes-agent</a></summary>

# Hermes Agent Report — 2026-10-10

## 1. Today’s Highlights

There was no new Hermes release in the last 24 hours. The loudest conversations were about trust and recovery: a macOS Desktop updater that blocks its own update, and a cleanup rule that can silently delete multi-day agent work. At the same time, active development is pushing Hermes toward a more desktop-native assistant — with Telegram and infrastructure-monitoring plugins, faster browser understanding, and better continuity across chat platforms.

## 2. Releases & Updates

No new releases in the last 24 hours, so there is nothing new for non-developers to install today.

## 3. Key Progress

These are proposed fixes and features in the repository, not shipped releases.

- **Session-owned toolsets** — A proposed change would let one conversation have its own disposable tools, visible only to that chat. Useful for running a specialized assistant per conversation without leaking tools into other sessions. [PR #110527](https://github.com/NousResearch/hermes-agent/pull/110527)
- **Faster browser page understanding** — A one-call page snapshot for browser workspaces could let browser agents inspect visible controls with fewer round trips. Practical effect: quicker, cheaper browser automation. [PR #115056](https://github.com/NousResearch/hermes-agent/pull/115056)
- **Telegram inside Hermes Desktop** — A plugin-catalog entry for a Telegram Client desktop pane, built on a dedicated Telegram user session. Useful for teams that want Telegram conversations inside the Hermes desktop app. [PR #135380](https://github.com/NousResearch/hermes-agent/pull/135380)
- **Infrastructure fleet monitoring** — A plugin-catalog entry for IOWAP adds a desktop status chip with live node count and workload-assignment data. Useful for ops teams watching infrastructure from Hermes. [PR #134804](https://github.com/NousResearch/hermes-agent/pull/134804)
- **Compaction visibility** — Hermes would emit content-free marks when it compresses or prunes conversation memory. Useful for operators who need to know when long-chat context was compacted, without capturing message content. [PR #135808](https://github.com/NousResearch/hermes-agent/pull/135808)
- **Better citation checks for Chinese and Japanese** — A proposed fix makes grounded-citation sentence splitting and word counting CJK-aware. Useful for content teams working in Chinese/Japanese, where current checks are effectively blind. [PR #135989](https://github.com/NousResearch/hermes-agent/pull/135989)
- **Chat context preserved across merged messages** — A gateway fix would preserve quoted and speech context when several messages arrive together. Useful in busy group chats where replies can otherwise lose the thread. [PR #131009](https://github.com/NousResearch/hermes-agent/pull/131009)
- **Smarter Kanban notifications** — A proposed fix makes Kanban subscriptions honor their stored delivery mode, so not every notification starts an agent turn. Useful for reducing unwanted wake-ups. [PR #135983](https://github.com/NousResearch/hermes-agent/pull/135983)
- **New model/pricing support** — A fix would enable GPT-6.1 Sol Ultrafast requests and pricing. Useful for users who want the faster supported tier and accurate cost display. [PR #135984](https://github.com/NousResearch/hermes-agent/pull/135984)
- **Safer disk cleanup** — A fix prevents cleanup from deleting protected or out-of-scope tracked paths. Useful for anyone relying on Hermes cleanup tools. [PR #135986](https://github.com/NousResearch/hermes-agent/pull/135986)
- **More reliable scheduled jobs** — A cron fix would let jobs survive non-UTF-8 files in their output folder, preventing jobs from dying before they start. [PR #135979](https://github.com/NousResearch/hermes-agent/pull/135979)
- **Cleaner long replies** — A fix removes empty code blocks that appear when long gateway replies split near code fences. Useful for Discord/Telegram formatting. [PR #135978](https://github.com/NousResearch/hermes-agent/pull/135978)

## 4. Community Buzz

The most active community threads show a strong focus on reliability, long-running work, and cross-platform continuity.

- **macOS Desktop update loop** — The top issue: the Desktop app’s Update button fails because `hermes update` refuses a lock held by its own hand-off. Users report exit code 2 and a confusing “another update is already running” message. [Issue #133992](https://github.com/NousResearch/hermes-agent/issues/133992)
- **Cleanup deleting multi-day agent work** — A P0 issue says Hermes points temp files at a scratch directory, then deletes idle files after 24 hours with no log, no quarantine, and no keep-marker. This can silently destroy multi-day agent work parked there. [Issue #132401](https://github.com/NousResearch/hermes-agent/issues/132401)
- **Update failures with no recovery path** — A P1 pain cluster describes failed updates leaving half-applied installs, raw errors, and no in-product recovery. The report cites 5 mechanisms and 15 Discord threads in one week. [Issue #125437](https://github.com/NousResearch/hermes-agent/issues/125437)
- **Runaway `.git` on Windows** — A Windows report describes an interrupted update followed by a silent runaway: 332 packfiles totaling roughly 180 GiB written in about 7 hours, with no Hermes process owning it. [Issue #131444](https://github.com/NousResearch/hermes-agent/issues/131444)
- **Context window silently shrinking** — A bug says the context compressor can be clamped to an Ollama setting even on cloud providers, dropping a 1M window to 65,536. Important for anyone managing long chats and cost. [Issue #99943](https://github.com/NousResearch/hermes-agent/issues/99943)
- **Computer-use future** — An active RFC proposes “script-speed computer use” using semantic state, runahead execution, and autoresearch. The vision: once Hermes understands intent, routine computer interaction should feel like a compiled script. [Issue #112639](https://github.com/NousResearch/hermes-agent/issues/112639)
- **Cross-platform memory request** — Users want one conversation across Discord, Telegram, and other platforms instead of separate disconnected sessions. [Issue #79198](https://github.com/NousResearch/hermes-agent/issues/79198)
- **Message injection into live sessions** — A feature request asks for an official way to deliver a message into an existing live Hermes session, aimed at multi-agent setups with a long-running manager session. [Issue #103748](https://github.com/NousResearch/hermes-agent/issues/103748)
- **Mobile app with voice calling** — A popular request asks for native iOS and Android apps with real-time voice conversations. It has 12 thumbs-up. [Issue #11911](https://github.com/NousResearch/hermes-agent/issues/11911)
- **Desktop UX requests** — Readers are asking for a configurable chat width, a guided picker for subagent model/provider instead of free-text fields, and Windows minimize/tray behavior that matches expectations. [Issue #55287](https://github.com/NousResearch/hermes-agent/issues/55287), [Issue #67347](https://github.com/NousResearch/hermes-agent/issues/67347), [Issue #119120](https://github.com/NousResearch/hermes-agent/issues/119120)
- **Security scanners flagging documentation** — Reports say the cron scanner and skills guard treat security documentation as dangerous, blocking accurate security-related content. [Issue #84672](https://github.com/NousResearch/hermes-agent/issues/84672)
- **npm audit field report** — A security field report lists current npm audit findings and notes that some remediation targets are already superseded. [Issue #129426](https://github.com/NousResearch/hermes-agent/issues/129426)

## 5. Signals to Watch

- **Reliability is becoming the headline feature.** Update hand-offs, half-applied installs, runaway git data, and silent scratch deletion all point to the same concern: users are trusting Hermes with real work, and recovery paths are not keeping up.
- **The desktop app is becoming the hub.** Telegram, IOWAP fleet monitoring, chat width, and Windows window behavior show Hermes Desktop maturing as an integration surface, not just a chat window.
- **Cross-platform continuity is a growing demand.** Session groups, live-session message delivery, and quoted-context preservation all point to users wanting one assistant that remembers across Discord, Telegram, Slack, and other channels.
- **Computer use is moving toward speed and efficiency.** One-call browser snapshots and the script-speed computer-use RFC suggest the next wave is about making agents act faster and with fewer API calls, not just act at all.
- **Long-conversation memory and cost need clearer controls.** The compressor window bug and compaction Relay marks show growing pressure to make context handling predictable and observable.
- **Mobile and voice remain unmet demand.** The native mobile app with voice calling is one of the most liked open requests, but there is no shipped product in today’s data.
- **Security tooling needs a usability pass.** False positives against security documentation and cleanup safety fixes suggest the community wants guardrails that do not block legitimate work.

</details>

<details>
<summary><strong>Agent Reach</strong> — <a href="https://github.com/Panniantong/Agent-Reach">Panniantong/Agent-Reach</a></summary>

# Agent Reach Report — 2026-10-10

## 1. Today's Highlights

No new version shipped in the last 24 hours, but the day's activity shows the project quietly widening where its skills can live: a pull request adds support for installing (and cleanly removing) skills inside Qoder, another AI coding workspace. At the same time, contributors are hardening the stock-market data channel and using the repo to publish hands-on resale research — a sign the audience is stretching beyond pure engineering.

## 2. Releases & Updates

No new releases in the last 24 hours.

## 3. Key Progress

**Skills can now be installed into Qoder** — [PR #798](https://github.com/Panniantong/Agent-Reach/pull/798) (open)
This adds Qoder as a place Agent-Reach can set up its skills: reusable task instructions that teach an assistant how to do specific jobs. Concretely, the change looks for Qoder's personal skills folder, respects a custom folder location if a user has one, and — importantly for anyone who has experimented and wants to back out — removes those files again when you uninstall, or shows you exactly what would be removed in a "dry run" before anything is touched. Documentation for Qoder's command-line and desktop versions is included.

**More reliable stock data lookups** — [PR #795](https://github.com/Panniantong/Agent-Reach/pull/795) (open)
This tidies up the Xueqiu (Chinese stock community) channel. Previously, a request for a nonsensical number of results — say a negative count — was passed along instead of being rejected, and oversized requests weren't trimmed to the documented ceiling of five items. The fix means an agent asking for market "hot stocks" or searching a ticker gets a clear error or a sensibly capped list rather than a confusing failure. For non-technical users, this is the kind of behind-the-scenes work that makes an assistant's finance answers feel dependable.

## 4. Community Buzz

**A commerce research report — published, then closed** — [PR #797](https://github.com/Panniantong/Agent-Reach/pull/797) (closed)
A contributor added a research write-up on selling liquidation-sourced electronics on Whatnot, covering platform fees, pallet costs and per-item margins. Notably, they flagged it explicitly as *research, not a product change* — no code paths were touched. It's now closed. This is a useful signal about who is using the project: not just developers, but people doing gritty resale and margin math who want a place to keep that work versioned alongside their tooling.

**An odd, unexplained issue** — [Issue #796](https://github.com/Panniantong/Agent-Reach/issues/796) (open, 0 comments)
Titled simply "farm," this issue contains a pasted log of phone calls — dates, times, incoming/outgoing direction, durations, and South African mobile numbers. There's no explanation, no reproduction steps, and no community response yet. It reads as either a mistaken paste or tracker noise rather than a genuine feature request or bug.

## 5. Signals to Watch

- **Skills are becoming portable across AI workspaces.** The Qoder addition follows a pattern: Agent-Reach's value grows with each assistant it can plug into. Expect "where can my skills run?" to keep expanding — and note the emphasis on clean uninstall and previews, which matters for teams testing tools before committing.
- **Quiet reliability work on data channels.** The Xueqiu fix is unglamorous but telling: as agents are trusted with finance and market questions, input validation and sensible limits become the difference between a confident answer and a wrong one.
- **The repo is absorbing non-code work.** A margins-and-fees research report sitting in the same project as the tooling suggests readers are using Agent-Reach as a workspace for agent-assisted commerce, not just an install target.
- **Tracker hygiene is a watch item.** With only four items updated in a day and one of them an unexplained data dump, there's little community friction to report — but also little signal. Worth watching whether issue quality improves as more non-developers arrive.

</details>

<details>
<summary><strong>Career Ops</strong> — <a href="https://github.com/career-ops-hq/career-ops">career-ops-hq/career-ops</a></summary>

# Career Ops Report — 2026-10-10
*Source: [github.com/career-ops-hq/career-ops](https://github.com/career-ops-hq/career-ops)*

## 1. Today's Highlights
No new version shipped in the last 24 hours, but the project is running hot: 62 issues and 133 proposed changes were active, and a release proposal for 1.36.0 is sitting in the queue. The dominant theme is polish for the **web dashboard** — generated CVs, cover letters, analytics, skill gaps and company evidence are all being pulled into one place instead of living as loose files. Two more community members posted verified "I got hired" stories, which is the clearest signal yet that people are using this end-to-end, not just tinkering.

## 2. Releases & Updates
Nothing new to install today — no release was published in the last 24 hours.

One release is queued and not yet shipped: a "release main" proposal for **career-ops 1.36.0**, dated 2026-10-10 and flagged as pending ([PR #4676](https://github.com/career-ops-hq/career-ops/pull/4676)). The only feature named in it is a workflow guard that stops a proposed change from merging while a change it depends on is still open — useful for contributors, invisible to end users.

Separately, a sync issue flags merge conflicts when pulling upstream career-ops v1.35.0 into a downstream branch ([Issue #4893](https://github.com/career-ops-hq/career-ops/issues/4893)) — a sign that copies and derivatives of the project now exist and need tooling to stay in step.

## 3. Key Progress
**The web dashboard is turning into a real workspace**
- A request to show **generated CVs and cover letters inside the dashboard** rather than only on disk is open and being discussed ([Issue #4856](https://github.com/career-ops-hq/career-ops/issues/4856)).
- **Analytics is being expanded** from a small activity snapshot into progress and search statistics: tracked evaluations, average score, active applications, offers, and a funnel view ([Issue #4309](https://github.com/career-ops-hq/career-ops/issues/4309) / [PR #4310](https://github.com/career-ops-hq/career-ops/pull/4310)).
- **Recurring skill gaps** are being surfaced on the CV page, answering "what should I learn next?" from your own past evaluations — low-scoring roles count for more than high-scoring ones ([PR #4583](https://github.com/career-ops-hq/career-ops/pull/4583)).
- A **company evidence card** is being added to the report view, plus a fix so it actually reads your data ([PR #4581](https://github.com/career-ops-hq/career-ops/pull/4581)).
- The dashboard's "APPLIED" column was showing the evaluation date and never updating — now corrected ([Issue #4816](https://github.com/career-ops-hq/career-ops/issues/4816)). Installs that keep data in a separate folder from the app also had the dashboard looking in the wrong place; fixed ([PR #4430](https://github.com/career-ops-hq/career-ops/pull/4430)).

**Your tracker's numbers get more trustworthy**
- A batch run no longer **overwrites the pipeline file** with a stale copy from the start of the run, which could silently erase edits made while it worked ([PR #4912](https://github.com/career-ops-hq/career-ops/pull/4912)).
- Postings skipped because no "Apply" button was found no longer get **permanently blocked** — they're re-checked next scan ([PR #4866](https://github.com/career-ops-hq/career-ops/pull/4866)).
- Expired postings were being detected and then forgotten, so **dead roles resurfaced as fresh matches**; the verdict is now saved ([Issue #3891](https://github.com/career-ops-hq/career-ops/issues/3891)).
- Work is underway on a **listing identity scheme** so the same job posted under a branded URL and an ATS URL stops counting as two ([PR #4642](https://github.com/career-ops-hq/career-ops/pull/4642)). A related fix stops legacy trackers from silently losing their first row ([Issue #4776](https://github.com/career-ops-hq/career-ops/issues/4776)).

**Application materials get sharper**
- PDF generation now **keeps hyphenated terms whole** so things like "go-to-market" survive text extraction and still match what an ATS searches for ([PR #4911](https://github.com/career-ops-hq/career-ops/pull/4911)).
- An opt-in **GDPR consent footer** was added to CV templates for EU candidates ([Issue #4234](https://github.com/career-ops-hq/career-ops/issues/4234)).
- There's an open question about whether PDF mode should **produce an ATS-friendly CV variant alongside the styled one in a single run** ([Issue #3853](https://github.com/career-ops-hq/career-ops/issues/3853)).
- The CV fact-checker is being extended beyond numbers to catch **inflated scope claims and unsourced adoption claims** ([Issue #3685](https://github.com/career-ops-hq/career-ops/issues/3685)).

**Replies and onboarding**
- **reply-watch** now proposes status updates after reading replies (e.g. from Gmail) into a review folder, so you approve changes rather than having them applied automatically ([PR #4645](https://github.com/career-ops-hq/career-ops/pull/4645)).
- A **confirm-gated onboarding panel** that fills in your profile from the assistant is in review ([PR #4256](https://github.com/career-ops-hq/career-ops/pull/4256)).

## 4. Community Buzz
- **Two verified hires in one day**: an Applied Sciences intern on an ML team ([Issue #4915](https://github.com/career-ops-hq/career-ops/issues/4915)) and an IT Engineer at an MSP who tracked 25+ evaluations and built company-specific materials ([Issue #4918](https://github.com/career-ops-hq/career-ops/issues/4918)).
- **Tracker readability** is the most-commented thread: raw URLs up to 141 characters in the applications table should render as short clickable labels ([Issue #3516](https://github.com/career-ops-hq/career-ops/issues/3516), 6 comments).
- People keep asking for **rejection reasons to actually be used**. The field is recorded but nothing reads it, and the vocabulary is too loose to group meaningfully ([Issue #2785](https://github.com/career-ops-hq/career-ops/issues/2785), 5 comments) — a clear appetite for "why am I not getting through?" analysis.
- **Localization continues**: a first-timers-only request to translate the interview practice modes into Polish ([Issue #3291](https://github.com/career-ops-hq/career-ops/issues/3291)), plus a parity check across 18 localized evaluation templates ([PR #3927](https://github.com/career-ops-hq/career-ops/pull/3927)).
- **Search relevance debate**: reverse-sweep noise driven by title filtering should instead be gated on whether a company is in your domain at all ([Issue #3105](https://github.com/career-ops-hq/career-ops/issues/3105)).
- **Contributor pipeline is healthy**: a community member with six submitted changes (three merged) asked about formal recognition and org membership ([Issue #4860](https://github.com/career-ops-hq/career-ops/issues/4860)), and a **commute plugin v0.2.0** was submitted to the plugin registry ([PR #4835](https://github.com/career-ops-hq/career-ops/pull/4835)).
- **Windows friction persists**: the batch runner breaks under Git Bash on Windows ([Issue #4910](https://github.com/career-ops-hq/career-ops/issues/4910)), and setup can produce broken skill shortcuts on Windows checkouts ([PR #4734](https://github.com/career-ops-hq/career-ops/pull/4734)).

## 5. Signals to Watch
1. **From generated files to a decision surface.** The dashboard is absorbing analytics, CVs, skill gaps and company evidence. Expect the product's centre of gravity to shift from "run this and get files" to "open this and see what to do next."
2. **A data-integrity push.** Dead postings resurfacing, batch runs overwriting edits, duplicate listings, silently pinned scans — a cluster of fixes is hardening the tracker so its counts can be trusted as real reporting.
3. **Guardrails around the AI, not more autonomy.** Confirm-gated profile filling, reply proposals that need approval, anti-fabrication checks on CV claims, and guards on clicking submit controls all point the same way: the assistant proposes, the human approves.
4. **Localization is becoming structural.** Multi-language interview modes plus a parity gate across 18 locale templates suggests non-English job searches are a first-class use case, not a side project.
5. **An ecosystem is forming.** A plugin registry and downstream forks syncing with upstream mean career-ops is starting to be extended and redistributed by others — worth watching for the first widely-adopted third-party add-ons.

</details>

<details>
<summary><strong>Cherry Studio</strong> — <a href="https://github.com/CherryHQ/cherry-studio">CherryHQ/cherry-studio</a></summary>

# Cherry Studio — Ecosystem Report
**2026-10-10 · Source: github.com/CherryHQ/cherry-studio**

---

## 1. Today's Highlights

No new version shipped today, but the codebase is moving fast on the part of Cherry Studio that matters most to non-technical users: **agents you can steer**. Several in-flight changes would let you swap the agent running a conversation, approve a plan and then execute it on a cheaper model, and launch long jobs that keep running after you close the app. Two other threads worth noting: a newly requested connector for business data APIs, and a request that tool calls which cost money (HTTP 402 "Payment Required") get a proper confirmation step instead of failing silently.

---

## 2. Releases & Updates

**No new release in the last 24 hours.** All activity below is in issues and pull requests — proposed, under review, or just merged into the development branch, not yet in a downloadable build.

---

## 3. Key Progress

*Themes: agent control, background work, connectors, and fewer "is it frozen?" moments.*

**Steering agents mid-conversation**
- [PR #21419](https://github.com/CherryHQ/cherry-studio/pull/21419) — Switch the agent running a conversation from the top bar. Today, once a chat has messages, it's locked to the agent it started with; you'd have to delete and relink. This removes that dead end.
- [PR #21080](https://github.com/CherryHQ/cherry-studio/pull/21080) — Approve a plan, then choose which model executes it. Practical upshot: plan with an expensive frontier model, run the steps with a cheaper one.
- [PR #20712](https://github.com/CherryHQ/cherry-studio/pull/20712) — Turns in the Claude Code agent now retry and can fall back to a backup model when the primary fails.

**Work that outlives the app window**
- [PR #20711](https://github.com/CherryHQ/cherry-studio/pull/20711) — Detached background tasks that survive closing the session *and* restarting the app. Aimed at long jobs like dataset conversion, large file copies or training runs.
- [PR #21437](https://github.com/CherryHQ/cherry-studio/pull/21437) — Agent sessions rebuilt from a host-owned transcript, so extension state, context compaction and tool loadout carry across turns.

**Connectors (MCP) as a product surface**
- [PR #21117](https://github.com/CherryHQ/cherry-studio/pull/21117) — A built-in connector for ZoneFoundry (Sonos speaker control), off by default.
- [Issue #21425](https://github.com/CherryHQ/cherry-studio/issues/21425) — Request to add Datacircle as a built-in connector for B2B data APIs.
- [Issue #21060](https://github.com/CherryHQ/cherry-studio/issues/21060) — Request for a per-call settle/confirm step when a tool returns HTTP 402 Payment Required, so paid tool calls are explicit rather than mysterious failures.

**Quality-of-life and reliability**
- [PR #20663](https://github.com/CherryHQ/cherry-studio/pull/20663) — Image generation retries transient gateway errors instead of failing on the first 504.
- [PR #21125](https://github.com/CherryHQ/cherry-studio/pull/21125) — Local Ollama models cap their working memory to what your machine actually has, and report out-of-memory clearly instead of a vague HTTP 500.
- [PR #21348](https://github.com/CherryHQ/cherry-studio/pull/21348) — Error messages stop getting pasted into the chat body and instead name which stage failed.
- [PR #18151](https://github.com/CherryHQ/cherry-studio/pull/18151) — Empty assistant turns now show a clear "no response" error rather than a blank bubble.
- [PR #21196](https://github.com/CherryHQ/cherry-studio/pull/21196) / [PR #21115](https://github.com/CherryHQ/cherry-studio/pull/21115) — One-click migration of your notes directory, handling unsaved drafts and multi-window state.

---

## 4. Community Buzz

**Most active thread by far**
- [Issue #6505](https://github.com/CherryHQ/cherry-studio/issues/6505) — The unified FAQ and feedback thread for the Selection Assistant (the pop-up that appears when you highlight text). **372 comments** and still the de facto support hub. If you use the selection assistant at all, this is where answers live.

**Bugs users are actively reporting**
- [Issue #21418](https://github.com/CherryHQ/cherry-studio/issues/21418) — Restore triggers an automatic app restart, fails at startup with a file-rename permission error, the backup archive is reported corrupt, and old backups (v6) don't load in the new format (v7). Net effect: users experience a crash and cannot restore their data. High-impact and worth watching if you rely on backups.
- [Issue #21307](https://github.com/CherryHQ/cherry-studio/issues/21307) — A model card shows its "Vision" capability as switched on while the saved setting has no image support; the first clicks appear to do nothing. A confusing mismatch between what you see and what's stored.
- [Issue #21326](https://github.com/CherryHQ/cherry-studio/issues/21326) — Repeated Huorong antivirus pop-ups during Agent runs require manual "Allow" clicks, breaking multi-step tasks.
- [Issue #21405](https://github.com/CherryHQ/cherry-studio/issues/21405) — Computer Use on Chinese-language Windows can't click elements with Chinese names and locks up the entire session. (Closed since.)
- [Issue #18333](https://github.com/CherryHQ/cherry-studio/issues/18333) — In the multi-window setup, dragging a conversation into its own window freezes the live stream while the main window keeps generating, and unsent drafts disappear.
- [Issue #21417](https://github.com/CherryHQ/cherry-studio/issues/21417) — A reminder message about "deferred tools" is factually incorrect; well-behaved models respond by abandoning all MCP tools.
- [Issue #21428](https://github.com/CherryHQ/cherry-studio/issues/21428) — Deleting chats never reclaims the search index, so the database grows with dead data that even a cleanup pass can't recover.

**Feature asks with clear product intent**
- [Issue #21333](https://github.com/CherryHQ/cherry-studio/issues/21333) — Detect and offer to install the command-line tools a "skill" depends on. Concrete example: a browser-control skill loads, but its underlying executable isn't available in the agent session, so the skill silently can't work.
- [Issue #21431](https://github.com/CherryHQ/cherry-studio/issues/21431) — Notify users *at the start* of context compression, not after — people currently assume the app has frozen.
- [Issue #21372](https://github.com/CherryHQ/cherry-studio/issues/21372) — Agent browser navigation to Chrome Web Store extension pages may close Cherry Studio entirely.

**Open discussion**
- [Issue #21362](https://github.com/CherryHQ/cherry-studio/issues/21362) — Users report they can't access some models under a Qwen token plan; tagged help-wanted/discussion.

---

## 5. Signals to Watch

1. **Agents are being treated as staff, not chat.** Mid-conversation agent switching, scheduled background turns, detached subagents, and jobs that outlive the app are all landing at once. The mental model is shifting from "one assistant per chat" to "a roster of agents and long-running work you manage."

2. **Cost-aware model routing is becoming a first-class feature.** Plan on a strong model, execute on a cheaper one; automatic fallback when a model fails; memory-aware limits for local models. This is the infrastructure for teams that care about spend per task — expect it to show up as user-facing settings soon.

3. **The built-in connector catalog is becoming a distribution channel.** Sonos control and a B2B data API both arrived as connector requests in the same 24 hours, alongside a request for a payment-confirmation step. Expect "what's in the catalog" to matter as much as "what models are supported."

4. **Trust work is the quiet backlog.** Backup corruption, unreclaimed search indexes, antivirus interference, and "is it frozen?" status gaps are all unresolved. These aren't flashy, but they're what stands between a power-user tool and something an operations team can depend on daily.

5. **Real-desktop friction is still the weak point.** Chinese-language Windows element naming, Chrome Web Store navigation, mobile connection issues, and Linux window chrome all appeared today. Desktop agents work in demos; the remaining gap is messy real-world environments.

6. **Onboarding for skills needs a dependency story.** A skill that loads but can't run because its underlying tool isn't installed is invisible failure. Whoever solves "install what this skill needs" cleanly unlocks a much wider non-technical audience.

</details>

<details>
<summary><strong>Nanobot</strong> — <a href="https://github.com/HKUDS/nanobot">HKUDS/nanobot</a></summary>

# Nanobot Report — 2026-10-10

*Your daily read on the agent ecosystem. Source: [github.com/HKUDS/nanobot](https://github.com/HKUDS/nanobot)*

---

## 1. Today's Highlights

No new version shipped in the last 24 hours, but the most consequential item on the board is a proposed "Computer Use" feature that would let a Nanobot assistant see your screen and click, type and navigate on your behalf — installed in one step, with permissions handled inside Nanobot ([PR #6091](https://github.com/HKUDS/nanobot/pull/6091)). Alongside it, a large maintenance push cleaned up how the assistant behaves across messaging apps: Telegram, Slack, Matrix, WhatsApp and others each got a small but real fix. And a new option for running separate assistant instances (personal vs. work) landed as a closed pull request ([PR #6128](https://github.com/HKUDS/nanobot/pull/6128)).

---

## 2. Releases & Updates

No new releases were published in the last 24 hours. Everything below is work in progress or recently closed on the project board — intended for a future version, not something you can install today.

---

## 3. Key Progress

**A desktop-controlling assistant is being built in ([PR #6091](https://github.com/HKUDS/nanobot/pull/6091))** — still open, but the most ambitious item this cycle. It adds "Computer Use" to the apps section with a single install, permission, connection and uninstall flow. Nanobot keeps control of which model and agent runtime is used; a component called Cua supplies the screen observations and the actual keyboard/mouse input. Requires macOS 14.2 or newer. In plain terms: an assistant that can operate your desktop apps rather than just chat.

**Run separate assistants from one machine ([PR #6128](https://github.com/HKUDS/nanobot/pull/6128), closed)** — a new `--home` option lets you point Nanobot at a folder and get its own config and workspace, so you can keep a work assistant and a personal assistant fully apart without juggling config files by hand.

**Point Telegram at your own server ([PR #4919](https://github.com/HKUDS/nanobot/pull/4919), closed)** — the Telegram connection can now target a self-hosted or enterprise gateway instead of the public Telegram service. Relevant for teams with compliance or routing requirements.

**Longer messages stop breaking in Telegram ([PR #6139](https://github.com/HKUDS/nanobot/pull/6139))** — long replies were being split by raw text length before formatting was applied, which could cut messages at the wrong point or cause send failures. Now the split is measured after formatting, matching what the reader actually sees.

**More reliable AI responses across model providers** — a DeepSeek configuration that sent contradictory "think harder / don't think" instructions at the same time was corrected ([PR #6132](https://github.com/HKUDS/nanobot/pull/6132), closed); a model series available through GitHub Copilot that wasn't recognised is being addressed ([Issue #5898](https://github.com/HKUDS/nanobot/issues/5898)); and support was added for a newer style of request format used by `muse-spark` models ([Issue #5896](https://github.com/HKUDS/nanobot/issues/5896)).

**Small but visible polish across channels** — Matrix streamed replies now keep their formatting when edited ([PR #6138](https://github.com/HKUDS/nanobot/pull/6138)); Slack direct messages that mention the bot are no longer silently dropped ([PR #6134](https://github.com/HKUDS/nanobot/pull/6134)); file attachments written as `~/report.pdf` now actually open ([PR #6133](https://github.com/HKUDS/nanobot/pull/6133)); SVG images are read as text instead of being sent as broken images ([PR #6135](https://github.com/HKUDS/nanobot/pull/6135)); and tools connected to Nanobot can now return images, audio and linked resources properly rather than dumping unreadable internal text ([PR #6141](https://github.com/HKUDS/nanobot/pull/6141)).

**Security hardening (closed/ongoing)** — a DNS validation gap that could allow a connection to be redirected after a check was fixed ([PR #6069](https://github.com/HKUDS/nanobot/pull/6069), closed), and there's an open push to make restricted shell commands fail safely when no sandbox is available, rather than running anyway ([PR #5536](https://github.com/HKUDS/nanobot/pull/5536)).

**Docs cleanup for humans** — 2,282 manual line breaks across 58 documentation files were removed so paragraphs reflow naturally instead of breaking mid-sentence at odd widths ([PR #6131](https://github.com/HKUDS/nanobot/pull/6131), closed). Stale comments and explanations were also refreshed ([PR #6129](https://github.com/HKUDS/nanobot/pull/6129), closed).

---

## 4. Community Buzz

**A one-day fix sprint across every messaging channel.** One contributor (Chaoqi31) filed more than a dozen PRs on 2026-10-10 alone — tagged as an "AI batch PRs" set — touching Telegram, Matrix, Slack, file tools and provider behaviour. The volume and the pattern (many narrow, low-risk fixes) suggest the project is now in a stabilisation phase for its channel integrations rather than adding new ones. Most carry a "p2" priority, i.e. worth fixing but not urgent.

**"Send my images as one album, not five messages."** Two open requests from the same contributor target Telegram media handling: grouping consecutive photos and videos into a single album of 2–10 items ([Issue #6121](https://github.com/HKUDS/nanobot/issues/6121)), and correctly recognising image links that carry extra parameters like `?width=672`, which are currently misread as documents and break the grouping ([Issue #6123](https://github.com/HKUDS/nanobot/issues/6123)). Both are concrete, user-visible annoyances rather than deep technical issues.

**Multi-instance pain on Windows.** A bug filed back in March and closed today reports that the documented `NANOBOT_HOME` setting is ignored on Windows, so running two assistants at once leads to conflicts (including Telegram fighting over the same connection) because they share configuration ([Issue #1739](https://github.com/HKUDS/nanobot/issues/1739)). Its closure alongside the new `--home` option suggests a coordinated fix.

**WhatsApp messages from before startup were never filtered out.** A timing unit mismatch (milliseconds compared against seconds) meant a filter designed to drop old messages never triggered ([Issue #6120](https://github.com/HKUDS/nanobot/issues/6120), closed). A good example of the kind of quiet bug that only surfaces in real day-to-day use.

**Turning on web search broke everything for one user.** With DeepSeek web search enabled, every message on every channel returned an error about an unrecognised tool type ([Issue #6085](https://github.com/HKUDS/nanobot/issues/6085), closed).

---

## 5. Signals to Watch

**Desktop control is the next frontier for personal assistants.** If [PR #6091](https://github.com/HKUDS/nanobot/pull/6091) lands, Nanobot stops being something you talk to in a chat window and becomes something that operates your machine. Note the deliberate design choices: the install, permission and uninstall flow lives inside Nanobot, not in a separate tool. Watch how permissions are surfaced to non-technical users — that will decide whether this is empowering or unnerving.

**Separation of personal and work assistants is becoming a first-class need.** Both the new `--home` selector ([PR #6128](https://github.com/HKUDS/nanobot/pull/6128)) and the Windows multi-instance bug ([Issue #1739](https://github.com/HKUDS/nanobot/issues/1739)) point the same direction: people aren't running one assistant, they're running several, and they want those contexts walled off from each other.

**Enterprise and self-hosted deployments are being taken seriously.** Custom Telegram endpoints ([PR #4919](https://github.com/HKUDS/nanobot/pull/4919)) plus the DNS and shell-sandbox security work ([#6069](https://github.com/HKUDS/nanobot/pull/6069), [#5536](https://github.com/HKUDS/nanobot/pull/5536)) read as preparation for buyers who need control over where traffic goes and what the assistant is allowed to execute.

**Model support is a moving target, and that's a support burden.** GPT-6 via GitHub Copilot, DeepSeek's various thinking modes, and newer wire formats for third-party models all generated issues in this window. For teams evaluating agents, provider flexibility is a genuine advantage — but expect occasional breakage when a model provider changes something.

**The product is in a polish phase, not a features-free-for-all.** The dominant activity is small fixes to long messages, media attachments, formatting and filters. For content and operations teams, that's a good sign: the basics are being made dependable before the more dramatic capabilities (like computer use) arrive.

</details>

<details>
<summary><strong>CowAgent</strong> — <a href="https://github.com/zhayujie/CowAgent">zhayujie/CowAgent</a></summary>

# CowAgent Report — 2026-10-10

## 1. Today's Highlights

No new version shipped in the last 24 hours, but the community conversation is unusually dense and unusually practical. The single hottest thread is a long-running request to turn the knowledge base into something you can actually *manage* — folders, uploads, bulk imports — rather than something you have to talk to (Issue #2812, 23 comments). Alongside that, several brand-new requests landed today asking for cleaner configuration screens and per-user data separation, which suggests CowAgent is moving from "one power user's desktop assistant" toward "a tool a small team shares."

## 2. Releases & Updates

No new releases were published in the last 24 hours. That said, a large batch of closed pull requests (fixes to file reading, search, sessions and channels) is queued up for the next version — details in Key Progress below.

## 3. Key Progress

**Reading documents gets noticeably better.** A cluster of fixes from contributor rudycelekli improves how CowAgent extracts content: web pages keep their paragraph, list and table structure instead of collapsing into one run-on block ([PR #3632](https://github.com/zhayujie/CowAgent/pull/3632)); Word documents no longer drop tables nested inside table cells ([PR #3629](https://github.com/zhayujie/CowAgent/pull/3629)); Excel files with uncached array formulas show the real formula instead of a placeholder object ([PR #3631](https://github.com/zhayujie/CowAgent/pull/3631)); and file search returns an actual snippet when a match sits on a very long line, rather than just saying "omitted" ([PR #3630](https://github.com/zhayujie/CowAgent/pull/3630)). For anyone feeding reports, spreadsheets or web research into the agent, this is the difference between usable and garbled.

**Diagrams render as diagrams.** A long-requested feature — turning Mermaid code blocks into real flowcharts and sequence diagrams in the Web console and Desktop app — has a merged implementation ([Issue #3221](https://github.com/zhayujie/CowAgent/issues/3221), [PR #3620](https://github.com/zhayujie/CowAgent/pull/3620)). Previously CowAgent would happily draw you a flowchart as raw code; now it shows the picture.

**Chat titles and context indicator behave better.** Desktop sessions no longer lose their title when a new chat starts before the first message is fully stored ([PR #3625](https://github.com/zhayujie/CowAgent/pull/3625)), and models served through LinkAI now report real token usage so the context meter reflects reality instead of a rough character estimate ([PR #3624](https://github.com/zhayujie/CowAgent/pull/3624)).

**Cleanup and security hardening.** A deleted team conversation now disappears for every participant, not just the person who deleted it ([PR #3613](https://github.com/zhayujie/CowAgent/pull/3613)); deleted WeChat/Weixin instances no longer leave credentials on disk ([PR #3622](https://github.com/zhayujie/CowAgent/pull/3622)); and permission checks now correctly classify commands hidden inside shell substitutions, closing a way for a "read-only" session to do more than it should ([PR #3602](https://github.com/zhayujie/CowAgent/pull/3602)). The built-in browser window also stops letterboxing on high-resolution or scaled displays ([PR #3623](https://github.com/zhayujie/CowAgent/pull/3623)).

## 4. Community Buzz

**Knowledge base management is the loudest ask.** Issue #2812 — "let me categorize, add, delete and bulk-import documents in the knowledge base instead of doing it all through chat" — closed after 23 comments ([Issue #2812](https://github.com/zhayujie/CowAgent/issues/2812)). It was the most-discussed item of the day by a wide margin and reflects a recurring ops frustration: conversational interfaces are great for asking questions, terrible for managing 200 files.

**Security and privacy are being taken seriously by users.** An open report claims CowAgent can leak user privacy and execute destructive commands on the user's machine, and it applies across models and platforms ([Issue #2998](https://github.com/zhayujie/CowAgent/issues/2998), 7 comments). A separate, now-closed report described a way to inject configuration that could lead to arbitrary code execution ([Issue #3231](https://github.com/zhayujie/CowAgent/issues/3231)). Neither is a reason to panic, but both are the kind of thing operations teams reviewing desktop agents should track.

**Images may not be reaching the model at all.** A widely relevant report argues that when a user sends an image, the picture is reduced to a file path and routed through a text-only step, so the main model never actually "sees" it ([Issue #3608](https://github.com/zhayujie/CowAgent/issues/3608), 1 👍). If accurate, this explains a lot of disappointing vision results — and a related request asks CowAgent to recognize vision capability for models behind gateways and proxies where names carry prefixes like `openai/gpt-4o` ([Issue #3626](https://github.com/zhayujie/CowAgent/issues/3626)).

**Configuration fatigue is setting in.** Two new requests posted today describe the same underlying problem: the "Basic Configuration" tab contains a whole model-configuration section, while a separate "Models" tab has overlapping provider and capability cards ([Issue #3627](https://github.com/zhayujie/CowAgent/issues/3627), [Issue #3628](https://github.com/zhayujie/CowAgent/issues/3628)). The second also asks for on/off switches for individual capabilities (vision, image generation, speech recognition) and an adjustable "thinking effort" dial, rather than forcing a provider choice. One of those requests already has a 👍.

**Sharing and multi-user are the new frontier.** A request for multi-user data isolation — each person sees only their own data, habits and skills ([Issue #3618](https://github.com/zhayujie/CowAgent/issues/3618)) — and a request for a minimal, public-facing customer-service chat window that can be embedded in a website ([Issue #3113](https://github.com/zhayujie/CowAgent/issues/3113)) both point the same direction: people want to put CowAgent in front of other people, not just themselves.

**Smaller but telling.** A user reports that reopening the desktop app resets context and wipes progress ([Issue #3619](https://github.com/zhayujie/CowAgent/issues/3619)); a request for a custom text-to-speech endpoint was closed ([Issue #3430](https://github.com/zhayujie/CowAgent/issues/3430)); someone offered up a year-old WhatsApp integration extension ([Issue #2637](https://github.com/zhayujie/CowAgent/issues/2637)); and a user contributed a working patch for a custom OpenCode model that needed a session header ([Issue #3605](https://github.com/zhayujie/CowAgent/issues/3605)).

## 5. Signals to Watch

**The most important bug of the day is about trust, not features.** Issue #3633 reports that after the context gets compacted, the model silently stops calling tools and instead invents results — fake task IDs, claims that something "was already saved" ([Issue #3633](https://github.com/zhayujie/CowAgent/issues/3633)). For anyone relying on an agent to actually file, save or update something, this is the failure mode to watch: the agent sounds confident while doing nothing. It has zero comments so far, but it's the kind of report that tends to grow.

**The user base is maturing from hobbyist to operational.** Today's mix — bulk knowledge-base imports, multi-user isolation, an embeddable customer chat window, per-capability switches — is the vocabulary of teams running a shared assistant, not individuals tinkering. Expect pressure on administration features (permissions, data separation, storage choices) to keep growing; the pluggable memory backend proposal is the technical version of the same trend ([Issue #2956](https://github.com/zhayujie/CowAgent/issues/2956)).

**A quiet but steady reliability push is underway.** The volume of closed fixes around files, sessions, channels and cleanup suggests the project is spending this period hardening what already exists rather than launching headline features. If you're evaluating CowAgent for a content or ops workflow, the next release is likely to be a better-behaved one rather than a flashier one.

**Setup friction remains the biggest adoption blocker.** Install location and data location for the desktop client ([Issue #3136](https://github.com/zhayujie/CowAgent/issues/3136)) and the configuration-overlap complaints are plumbing, but they are exactly what stops a non-technical colleague from getting started. Watch whether the team invests in a setup-and-config cleanup in the coming cycle.

</details>