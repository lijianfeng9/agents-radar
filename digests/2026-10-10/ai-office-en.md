# AI Office Digest 2026-10-10

> Generated: 2026-10-10 05:50 UTC | Projects covered: 6

- [n8n](https://github.com/n8n-io/n8n)
- [PPT Master](https://github.com/hugohe3/ppt-master)
- [SiYuan](https://github.com/siyuan-note/siyuan)
- [Teable](https://github.com/teableio/teable)
- [GenOffice](https://github.com/genspark-ai/genoffice)
- [Presenton](https://github.com/presenton/presenton)

---

## Cross-Project Comparison

# Cross-Project Comparison — Office Productivity & Automation
**Date: 2026-10-10**

## 1. Overview

Today’s landscape was split between shipping practical office features and hardening existing products at scale. GenOffice shipped v0.11.505 with fillable PDF form design and AI features that answer from starred files. n8n shipped a guardrail release that blocks saving workflows containing deprecated nodes, while making progress on live sub-workflow visibility. SiYuan had no release but closed a large batch of note-taking, database, mobile and performance requests. Teable had no release, with one linked-record performance complaint and a large permissions/access-control review queued. Across active projects, the recurring themes are AI grounded in your own files, privacy controls, and performance with real-world data volumes.

## 2. Activity Comparison

*Counts below are distinct Issues/PRs mentioned in the 2026-10-10 digest, not full repository totals. “N/A” is used where the digest did not report countable Issues/PRs — including projects that may rely on Discussions or had no reported activity — rather than implying the project is inactive.*

| Project | Issues count | PR count | Release status |
|---|---:|---:|---|
| **n8n** | 17 | 14 | Stable 2.42.6 and Beta 2.43.3 shipped; both block create/update of workflows with deprecated nodes |
| **SiYuan** | 23 | 6 | No release in last 24h |
| **Teable** | 1 | 1 | No release in last 24h |
| **GenOffice** | 11 | 11 | v0.11.505 stable desktop shipped; fillable PDF form design, multi-page Docs, other fixes |
| **PPT Master** | N/A | N/A | No activity in last 24h |
| **Presenton** | N/A | N/A | No activity in last 24h |

## 3. Shared Themes

- **AI grounded in your own files** — GenOffice added a starred-files knowledge base with clickable citations; SiYuan added an AI provider preset and requested stronger SQL search tooling for its assistant; n8n continued building out its Agents chat panel and AI Assistant reliability. *(GenOffice, SiYuan, n8n)*
- **Privacy and selective AI exposure** — GenOffice has multiple open PRs to hide Docs, Sheets and Markdown content from the AI while keeping the real text in the saved file. n8n’s AI Assistant cost/token scrutiny is a related efficiency and trust signal. *(GenOffice, n8n)*
- **Performance at scale with real data** — Teable users reported 7–9 second waits when editing records in heavily linked tables; GenOffice users hit large-Excel sorting/filtering limits; SiYuan addressed SQLite memory and bulk-import spikes; n8n dealt with editor memory, queue reliability and MCP session leaks. *(Teable, GenOffice, SiYuan, n8n)*
- **Document and form authoring** — GenOffice shipped fillable PDF form design, multi-page Docs and form-field arrangement; SiYuan improved database fields, backlink filtering and inline font control. *(GenOffice, SiYuan)*
- **Permissions and access-control hardening** — Teable queued a 375-change sync focused on enforcing permissions consistently; GenOffice advanced AI redaction controls. *(Teable, GenOffice)*
- **Localization and bilingual workflows** — SiYuan added lunar-calendar date fields and fixed CJK input-method issues; GenOffice worked on bilingual font pairing and Russian translations. *(SiYuan, GenOffice)*
- **Plugin/ecosystem extensibility** — SiYuan added a unified image/asset hook and marketplace fixes; n8n built custom Agents chat components; GenOffice proposed importing skills folders from other AI tools. *(SiYuan, n8n, GenOffice)*
- **Observability and trust in automation** — n8n added live sub-workflow progress indicators and fixed queue/error-workflow issues. This theme is strongest in n8n today. *(n8n)*

## 4. Positioning Differences

- **n8n** — Workflow automation platform for technical operations, IT and automation builders. Node-based, self-hosted/enterprise-friendly. Today’s focus: governance of old workflows, AI assistant platform plumbing, and reliability at scale.
- **SiYuan** — Knowledge management and note-taking workspace for individual knowledge workers, teams and CJK-language users. Local-first/PKM style, with databases, backlinks, plugins and mobile apps. Today’s focus: daily note experience, performance, mobile fixes and AI-assisted search.
- **Teable** — No-code database/spreadsheet-database hybrid for operations teams and internal tools. Today’s focus: permissions/security hardening and performance with heavily linked records.
- **GenOffice** — Integrated office productivity suite for admin, operations and knowledge workers. Covers Docs, Sheets, PDF and presentations with AI embedded in documents. Today’s focus: fillable PDF forms, file-grounded AI, privacy controls and Microsoft Word-style fidelity.
- **PPT Master / Presenton** — No activity reported in this window. They sit in the presentation-tool space by name, but the digest provides no current focus, target-user or approach signals to compare meaningfully.

## 5. Signals to Watch

- **AI becomes file-grounded and redactable.** GenOffice, SiYuan and n8n are all moving toward assistants that cite internal content and, in GenOffice’s case, let you hide sensitive text from the model. For operations teams, this means AI help can become more useful for internal documents without exposing everything.
- **Performance at scale is the next battleground.** Teable’s linked-record slowdown, GenOffice’s large-Excel limits, SiYuan’s import memory work and n8n’s memory/session leaks all point to the same lesson: test with real data volumes before standardizing.
- **Automation governance gets stricter.** n8n now blocks saving workflows with deprecated nodes. Teams running long-lived automations should clean up old nodes before upgrading or editing.
- **Permissions hardening arrives in bulk.** Teable’s 375-change access-control sync suggests stricter, more consistent permission enforcement in future releases. Review who has access to what before it lands.
- **Form and structured-data capture converge.** GenOffice’s fillable PDF forms, SiYuan’s databases and Teable’s linked records all address the same need: turning paper, PDFs and scattered data into structured, editable systems.
- **Mobile and cross-device reliability matters.** SiYuan closed a cluster of mobile issues, including encrypted notebooks, app restart, Android back-key behavior and iPad keyboard handling. Teams that sync between desktop and phone should test the next builds.
- **Localization and bilingual workflows mature.** SiYuan’s lunar-calendar fields and CJK fixes, plus GenOffice’s bilingual font and Russian translation work, show products moving beyond English-only defaults.
- **Quiet projects are not necessarily inactive.** PPT Master and Presenton had no activity today. Readers should monitor them for future releases rather than drawing conclusions from a single quiet day.

---

## Per-Project Reports

<details>
<summary><strong>n8n</strong> — <a href="https://github.com/n8n-io/n8n">n8n-io/n8n</a></summary>

# n8n Report — 2026-10-10

## Today's Highlights

Both the stable and beta channels shipped the same guardrail today: n8n now blocks creating or updating workflows that contain deprecated nodes. In practice, if you open an older workflow that relies on a retired node, you'll be stopped from saving changes until that node is replaced — worth checking your most-used automations before the next upgrade.

The other through-line in today's activity is reliability of the AI Assistant and of sub-workflows: a costly token-usage bug was closed, new work adds live progress indicators while sub-workflows run, and several leak/upgrade issues were reported against the 2.42.x self-hosted line.

---

## Releases & Updates

**Stable 2.42.6** and **Beta 2.43.3** both shipped the same feature: **blocking create/update of workflows with deprecated nodes**.

- What shipped: n8n's core now refuses to create or save a workflow that still uses a node the project has retired.
- What it means for you: workflows you already run keep running, but editing one that contains a deprecated node will fail to save until you swap that node for its replacement. This is a "do your housekeeping" release rather than a new capability.
- Release notes: [stable 2.42.6](https://github.com/n8n-io/n8n/compare/n8n@2.42.5...n8n@2.42.6) · [beta 2.43.3](https://github.com/n8n-io/n8n/compare/n8n@2.43.2...n8n@2.43.3)
- Related change requests: [#40707](https://github.com/n8n-io/n8n/issues/40707) · [#40706](https://github.com/n8n-io/n8n/issues/40706)

There were no other user-facing features in today's releases.

---

## Key Progress

**See sub-workflows while they run.** Two linked pull requests add live progress to the "Execute Sub-workflow" node: a growing arc on the node border, a "Step N" counter, and a "Running: <node name>" label — plus the plumbing that sends that progress to the editor session. Useful when a parent workflow calls other workflows and you currently just stare at a spinner. [#40640](https://github.com/n8n-io/n8n/pull/40640) · [#40639](https://github.com/n8n-io/n8n/pull/40639)

**Clearer Microsoft Teams setup.** The Teams connection flow now explains where to upload the app package each time it's downloaded — a fixed stumbling block in the setup stepper. [#40339](https://github.com/n8n-io/n8n/pull/40339)

**Groundwork for a richer in-product AI assistant.** A cluster of draft/exploratory PRs extends the Agents chat panel so it can host custom interactive cards, custom message and composer behaviours, and custom rendering for finished tool calls. Nothing to use yet — this is the plumbing for Assistant v2. [#40608](https://github.com/n8n-io/n8n/pull/40608) · [#40609](https://github.com/n8n-io/n8n/pull/40609) · [#40611](https://github.com/n8n-io/n8n/pull/40611) · [#40613](https://github.com/n8n-io/n8n/pull/40613) · [#40720](https://github.com/n8n-io/n8n/pull/40720)

**"Message an Agent" node gets documented outputs.** The node previously had no declared output schema, which limited what the AI builder, generated node types and validation could understand about it. [#40821](https://github.com/n8n-io/n8n/pull/40821)

**QuickBooks filtered results fix.** When fetching QuickBooks records with "Return All" plus a filter, records from earlier pages could be silently dropped. The fix keeps pagination going until a genuinely empty filtered page. [#40724](https://github.com/n8n-io/n8n/pull/40724)

**Public API clean-up.** The last legacy endpoint is being migrated to the modern controller pattern, and the older validation stack is being retired so all API documentation comes from one generated spec. Relevant if your team connects to n8n via the REST API. [#40756](https://github.com/n8n-io/n8n/pull/40756) · [#40801](https://github.com/n8n-io/n8n/pull/40801)

**Paywall pages for unavailable licensed features.** Inactive licensed modules now show a placeholder page instead of the settings sidebar silently dropping their links. [#40553](https://github.com/n8n-io/n8n/pull/40553)

**Queue reliability.** Work that a queue worker failed before it even started is now returned to the queue rather than marked failed, avoiding lost executions during rolling upgrades. [#40534](https://github.com/n8n-io/n8n/pull/40534)

---

## Community Buzz

The busiest thread of the day was an editor-breaking bug now closed:

- **Every node showing as "?" on shared instances.** On multi-user installs, the editor could show all nodes — even core ones like Webhook — as "?", blocking editing and failing saves, while executions kept working. Closed after 11 comments. [#39123](https://github.com/n8n-io/n8n/issues/39123)
- **AI Assistant cost shock.** A user reported ~137,000 input tokens and $0.42 for a five-word question, attributed to missing prompt caching and excessive tool round trips. Now closed. [#38130](https://github.com/n8n-io/n8n/issues/38130)
- **Assistant can't save large workflows.** An 84-node flow couldn't be saved by the assistant, with internal save and builder-limit errors. Closed. [#39135](https://github.com/n8n-io/n8n/issues/39135)
- **Accessibility as a blocker.** A blind user relying on screen readers (TalkBack, NVDA) raised critical accessibility problems across mobile and desktop, pushing back on it being treated as a feature request. [#28071](https://github.com/n8n-io/n8n/issues/28071)
- **Editor memory spikes.** Loading a workflow with a long publish history could consume several gigabytes because history rows are never pruned. Closed. [#39418](https://github.com/n8n-io/n8n/issues/39418)
- **"Workflow has issues" for API-created sub-workflows.** Calling sub-workflows created via the REST API fails validation even when nothing is wrong. Still open. [#40436](https://github.com/n8n-io/n8n/issues/40436)
- **Silent failure in the GitLab node.** Setting an issue's State to Open or Closed reports success but changes nothing. Still open. [#35799](https://github.com/n8n-io/n8n/issues/35799)
- **Jenkins with CSRF protection.** The Jenkins node can't trigger parameterized jobs on Jenkins instances that require a CSRF crumb. [#40761](https://github.com/n8n-io/n8n/issues/40761)
- **Credential form quirks.** A four-digit SFTP port (2222) vanishes from the credential form and isn't accepted. [#40803](https://github.com/n8n-io/n8n/issues/40803)
- **Self-hosted upgrade friction in 2.42.x.** Multiple reports today: a duplicated `parentFolderId` column breaking SQLite migrations and preventing startup [#40813](https://github.com/n8n-io/n8n/issues/40813); a Redis `hset` error logged on every execution of team-project workflows that use credentials [#40806](https://github.com/n8n-io/n8n/issues/40806); and MCP sessions leaking in queue mode until the instance runs out of memory [#40822](https://github.com/n8n-io/n8n/issues/40822).
- **Error workflows not firing.** When a workflow's settings point to "No Workflow", the value `DEFAULT` is treated as a real workflow ID, so the workflow's own Error Trigger never runs. [#40824](https://github.com/n8n-io/n8n/issues/40824)
- **Mistral integration.** Two related reports on "Type validation failed" errors with Mistral, with the original fix never merged. [#37352](https://github.com/n8n-io/n8n/issues/37352) · [#40646](https://github.com/n8n-io/n8n/issues/40646)

---

## Signals to Watch

- **Deprecated-node enforcement is now real.** Blocking saves is a firmer stance than a warning. Teams running long-lived automations should plan node replacements rather than discover them mid-edit after upgrading.
- **AI Assistant economics are under scrutiny.** The token-cost report being closed suggests attention to efficiency; the reworked Agents chat plumbing suggests investment in making the assistant a platform others build on, not just a chat box.
- **Resource lifecycle bugs around agents and MCP.** Today's leak report (agents never closed, MCP sessions piling up) points to a class of problem that matters most to self-hosted teams running agents continuously.
- **Observability for nested workflows.** Live sub-workflow progress is the kind of change that helps non-developers trust long-running processes, and it's close to shipping.
- **Upgrade quality on self-hosted installs.** SQLite migration failures, repeated Redis errors and a credential-form regression all landed on 2.42.x. Admin teams should read release notes before upgrading rather than auto-updating.
- **Accessibility pressure is rising.** A user framing screen-reader support as a blocking issue rather than a feature request is the kind of signal that often precedes a dedicated accessibility workstream.

</details>

<details>
<summary><strong>PPT Master</strong> — <a href="https://github.com/hugohe3/ppt-master">hugohe3/ppt-master</a></summary>

No activity in the last 24 hours.

</details>

<details>
<summary><strong>SiYuan</strong> — <a href="https://github.com/siyuan-note/siyuan">siyuan-note/siyuan</a></summary>

# SiYuan — Observational Report
**Date: 2026-10-10 | Source: github.com/siyuan-note/siyuan**

---

## 1. Today's Highlights

No new version shipped in the last 24 hours, but SiYuan's team closed or updated a very large batch of long-standing requests — notably inline font control, a single hook that catches every image going into your notes before it's uploaded, and several new ways to tame the backlinks panel. Read together, the day's activity shows a product sharpening its core note-taking experience (formatting, linking, search, databases) while quietly investing in performance and AI-assistant plumbing. Mobile reliability and notebook startup problems were also resolved in volume, which should matter to anyone who syncs between phone and desktop.

---

## 2. Key Progress

**Images and attachments are getting a proper "front door."**
[#18878](https://github.com/siyuan-note/siyuan/issues/18878) — the most-discussed item today — unifies how files enter a note so plugins can process them consistently, no matter how they arrive: pasting a screenshot, dragging from Finder, uploading from the web version, using the file picker, dropping into a database field, or setting a cover image. The stated motivation is practical: one large PNG pasted six different ways should be compressed, converted to JPEG, have its metadata stripped, and get a sensible filename — every time, not just sometimes. (27 comments)

**Backlinks panel gets real filtering.**
Three related requests closed together: filter backlinks by block type (e.g. exclude databases) [#19257](https://github.com/siyuan-note/siyuan/issues/19257), hide "propagated" reference blocks that only serve as pointers and take up space [#19251](https://github.com/siyuan-note/siyuan/issues/19251), and exclude specific entries from the backlink list [#19258](https://github.com/siyuan-note/siyuan/issues/19258).

**Databases get more usable in the flow of reading and writing.**
- View and edit database (attribute) fields in a sidebar or floating panel, so you don't have to scroll back to the top of a long document to change a value [#20331](https://github.com/siyuan-note/siyuan/issues/20331).
- Lunar-calendar input and display for date fields, aimed at things like birthday tracking in contact databases — including leap-month handling [#20322](https://github.com/siyuan-note/siyuan/issues/20322).

**Inline text styling.** Inline-level text can now carry its own font family [#17336](https://github.com/siyuan-note/siyuan/issues/17336) — a frequently requested formatting capability, closed today with 22 comments.

**Search that tells you what it's actually doing.** The search panel now disables filters, sorting, grouping and replace options that the currently selected search method silently ignores — so results match what the interface promises [#20338](https://github.com/siyuan-note/siyuan/issues/20338). Separately, a pull request proposes a document-only index for faster substring search inside documents [#20320](https://github.com/siyuan-note/siyuan/pull/20320).

**Reading and navigation polish.**
- Breadcrumb path no longer truncates deep hierarchies into "…" [#20340](https://github.com/siyuan-note/siyuan/issues/20340).
- Optional toggle to keep H1/H2 indicators and the collapse arrow always visible, instead of only on hover [#20333](https://github.com/siyuan-note/siyuan/issues/20333).
- Better rich-text entry inside table cells, so pasted multi-paragraph content is treated as real paragraphs [#20253](https://github.com/siyuan-note/siyuan/issues/20253).

**Flashcards.** Configurable default opening mode (popup vs. other layouts), so a card doesn't reset when you change how it's displayed [#19189](https://github.com/siyuan-note/siyuan/issues/19189). Wording in the flashcard settings and guide was corrected to match actual behavior across 22 languages [#20332](https://github.com/siyuan-note/siyuan/pull/20332).

**Marketplace and plugins.**
- Package detail pages get a clickable version number that opens that release's notes, with a dropdown to switch releases [#20078](https://github.com/siyuan-note/siyuan/pull/20078).
- Fixed: updating a plugin on another device could be misread as an uninstall [#20354](https://github.com/siyuan-note/siyuan/pull/20354).
- Fixed: stray macOS `.DS_Store` files made empty plugin/package folders look non-empty [#20355](https://github.com/siyuan-note/siyuan/pull/20355).

**Performance and memory.**
- Kernel memory tuning for the SQLite page cache, which was being multiplied across many connections [#20345](https://github.com/siyuan-note/siyuan/issues/20345).
- Reducing memory spikes during bulk Markdown imports — a real-world test importing ~900 files peaked at several GB of memory [#20347](https://github.com/siyuan-note/siyuan/issues/20347).

**AI assistant.**
- Atlas Cloud added as an AI provider preset alongside OpenRouter in the "aggregator" category [#20342](https://github.com/siyuan-note/siyuan/pull/20342).
- A request to strengthen the built-in agent's SQL search tooling, so it can query structured data and drive the search window more reliably [#20383](https://github.com/siyuan-note/siyuan/issues/20383).

---

## 3. Community Buzz

The most active threads today were about **images and formatting**, not bugs:

- **A unified image-processing hook** [#18878](https://github.com/siyuan-note/siyuan/issues/18878) (27 comments) — users clearly feel the pain of storage bloat and inconsistent handling across the many ways images enter a note.
- **Per-text font families** [#17336](https://github.com/siyuan-note/siyuan/issues/17336) (22 comments) — a formatting gap people had wanted for a long time.
- **Database indexing deadlock during startup sync** [#19221](https://github.com/siyuan-note/siyuan/issues/19221) (16 comments) — encrypted notebooks caused a mobile app to hang at the launch screen; a serious trust issue for anyone relying on encrypted notebooks.
- **Mobile build that couldn't open pages** [#19183](https://github.com/siyuan-note/siyuan/issues/19183) (10 comments).

A second cluster of complaints is clearly **mobile and cross-device friction**, all closed today:
- iPad search shortcut fails when a Chinese input method is active [#20006](https://github.com/siyuan-note/siyuan/issues/20006)
- Android system back button reloads the whole desktop-layout UI instead of closing the open popup [#20390](https://github.com/siyuan-note/siyuan/issues/20390)
- After swiping the app out of the background, it wouldn't reopen [#19244](https://github.com/siyuan-note/siyuan/issues/19244)
- Two close buttons on mobile settings screens [#19239](https://github.com/siyuan-note/siyuan/issues/19239)

And a pair of desktop oddities worth noting for Windows users: the taskbar shortcut disappeared after every update [#19266](https://github.com/siyuan-note/siyuan/issues/19266), and the editor jumped a full page when collapsing the virtual keyboard [#19254](https://github.com/siyuan-note/siyuan/issues/19254).

---

## 4. Signals to Watch

**1. A serious performance push.** The SQLite page-cache memory issue [#20345](https://github.com/siyuan-note/siyuan/issues/20345) and the bulk-import memory spike [#20347](https://github.com/siyuan-note/siyuan/issues/20347) both come from hands-on measurement rather than complaint threads. Large-workspace users should expect smoother behavior — and should watch for regressions during import.

**2. Mobile is getting a sustained cleanup.** Encrypted notebooks, app restart, Android back-key behavior, iPad keyboards, virtual keyboards — this is a cluster, not a one-off. If your team syncs between desktop and phone, the next few builds are the ones to test.

**3. The plugin ecosystem is being given better hooks — and a better storefront.** The asset-upload hook [#18878](https://github.com/siyuan-note/siyuan/issues/18878) plus marketplace fixes and release notes [#20078](https://github.com/siyuan-note/siyuan/pull/20078) suggest plugins are being treated as a first-class layer rather than an afterthought. For non-coders, the practical result is more trustworthy, better-described extensions.

**4. AI is moving from "chat" to "operate my notes."** The provider preset [#20342](https://github.com/siyuan-note/siyuan/pull/20342) lowers the cost of connecting an AI service, while the SQL-tooling request [#20383](https://github.com/siyuan-note/siyuan/issues/20383) is about the assistant querying your actual database content. That's the more interesting signal: assistance grounded in your own structured knowledge base, not generic text generation.

**5. Backlinks are becoming a query surface.** Three separate backlink refinements landing the same day — filtering by block type, hiding pointer-only references, excluding specific entries — points toward treating links as something to be sliced and shaped, much like the database views. Worth watching if your team's notes rely on reference trails rather than folder hierarchy.

**6. Localization and regional workflows matter.** Lunar-calendar date fields [#20322](https://github.com/siyuan-note/siyuan/issues/20322) and the Chinese-input-method iPad fix [#20006](https://github.com/siyuan-note/siyuan/issues/20006) show the product is being shaped for CJK-language daily use, not just translated into it.

---

*Note: all items above were marked closed or updated on 2026-10-10. "Closed" indicates the team considered the work resolved — it does not confirm a specific version has been published; no release was published in the last 24 hours.*

</details>

<details>
<summary><strong>Teable</strong> — <a href="https://github.com/teableio/teable">teableio/teable</a></summary>

# Teable — Report for 2026-10-10

## 1. Today's Highlights

No new version shipped, so nothing new to adopt today — but two signals stood out. A self-hosted team reported that editing a single record could trigger a 7–9 second wait once a table's records are heavily linked to other tables (an issue that has since been closed). Separately, a large batch of authorization and access-control changes from Teable's enterprise codebase is queued up for review, pointing to continued security hardening.

## 2. Releases & Updates

No new releases were published in the last 24 hours. There is nothing new to install or turn on in your workspace as of this report.

## 3. Key Progress

**Access-control tightening, queued for review** — [PR #3638](https://github.com/teableio/teable/pull/3638) (open)

A batch sync from Teable's enterprise codebase landed for review, bundling 375 changes since the last sync. The headline theme is closing gaps in who is allowed to reach which parts of the product — i.e., making sure permissions are enforced consistently, not just in the interface but across every path into the system. In plain terms: if your team relies on Teable's permissions to keep some tables or views restricted, this work is about making those restrictions harder to bypass.

Two caveats worth knowing: this is a pull request, not a shipped release, so nothing has changed in your workspace yet; and it is squarely developer-facing plumbing. There is no new button, view or feature to look for here — the value is reliability and safety of existing controls.

## 4. Community Buzz

**"One small edit, a large slowdown"** — [Issue #3663](https://github.com/teableio/teable/issues/3663) (closed)

This was the only issue with activity in the window, and it's the kind of report operations teams feel directly. A self-hosted user described a scenario where creating or deleting a single record caused the system to rewrite *every* linked cell that displays that table's main field — over 2,000 cells — taking 7–9 seconds per record created. Their server was otherwise idle, with CPU under 1% and the database at roughly 3%, so the bottleneck wasn't raw machine power.

Why a non-developer should care: this is exactly the shape of a real-world Teable setup — a projects or customers table linked into many other tables, where one field (the record name) shows up everywhere. In that configuration, adding a record becomes slow even on capable hardware. The issue was closed the same day with one comment, which usually means the team triaged it or linked it to a fix — but treat that as "acknowledged," not "solved in your version." If you self-host Teable and work with heavily linked tables, it's worth watching the changelog before assuming the wait is just your infrastructure.

## 5. Signals to Watch

- **Performance at scale with linked records is the live pain point.** The single most concrete piece of community feedback today was not about a missing feature but about slowness in everyday editing. As teams grow their linked tables, response time on simple actions becomes the deciding factor in whether Teable feels workable day to day.
- **Self-hosted deployments are the ones speaking up.** The reporter was running their own Docker setup with an external cache and database. That's a reminder that self-hosted teams often encounter issues cloud users never see, and their feedback tends to shape the roadmap.
- **Security and permissions work is arriving in bulk.** The 375-change sync suggests Teable is pulling enterprise-grade access controls back into the main product. Expect permission behavior to get stricter and more consistent over the coming releases — a good thing for anyone storing sensitive internal data, but worth planning a quick review of who has access to what before it lands.

</details>

<details>
<summary><strong>GenOffice</strong> — <a href="https://github.com/genspark-ai/genoffice">genspark-ai/genoffice</a></summary>

# GenOffice Report — 2026-10-10

Source: [github.com/genspark-ai/genoffice](https://github.com/genspark-ai/genoffice)

---

## 1. Today's Highlights

GenOffice shipped a stable desktop update (v0.11.505) whose headline addition is a **Form Design tab in PDF** — you can now *create* fillable PDF forms, not just fill in ones that already exist. That same request came in as a user suggestion yesterday ([#1923](https://github.com/genspark-ai/genoffice/issues/1923)), so the gap between "asked for" and "available" was about a day. Meanwhile, a large cluster of activity around **hiding sensitive content from the AI** and **answering questions from your own starred files** suggests the product is moving toward more private, knowledge-grounded assistance.

---

## 2. Releases & Updates

**v0.11.505 — stable desktop installers** ([release](https://github.com/genspark-ai/genoffice))

What's new that you can use today, without any technical setup:

- **Build fillable PDF forms yourself.** A new *Form Design* tab lets you author text fields, checkboxes, radio buttons, dropdowns, date fields and signature fields on a PDF.
- **Arrange fields like shapes.** Multi-select, arrange and clipboard operations work on form fields, so you can lay out a form and move groups of fields around.
- **Edit saved fields.** Once a field is placed, you can go back and change it rather than starting over.
- **Auto-detect fields.** GenOffice can scan a page and propose fields from blanks, boxes and gaps between labels — useful for turning a scanned or flat form into something people can type into.

A related pull request ([#1930](https://github.com/genspark-ai/genoffice/pull/1930), closed) describes the same snapshot as also including a **Multiple Pages layout in Docs**, fixes to page-anchored floating tables, **multiple saved custom model endpoints**, middle-click-to-close tabs, and English-only help.

---

## 3. Key Progress

**Fillable PDF authoring (shipped).** The most immediately useful change for admin and operations teams: replacing paper or print-to-PDF intake forms with real fillable ones, without a separate form-building tool.

**Interface scaling is in progress.** Issue [#1913](https://github.com/genspark-ai/genoffice/issues/1913) reports that on high-DPI screens the app's toolbars, tabs and sidebars stay uncomfortably small — zooming only affects the document, not the app itself. A pull request ([#1934](https://github.com/genspark-ai/genoffice/pull/1934)) adds a separate interface scale setting, described as "part 1 of 2," covering the shell and Sheets.

**Bilingual font control in style templates.** [#1931](https://github.com/genspark-ai/genoffice/issues/1931) notes that while document font controls can set East Asian and Latin fonts separately, the *Style template* editor still offers only one font — so a bilingual document style can't be saved. A fix is open ([#1932](https://github.com/genspark-ai/genoffice/pull/1932)).

**Ask your own files.** A three-part pull request ([#1915](https://github.com/genspark-ai/genoffice/pull/1915)) adds a knowledge-base channel: the AI answers from the files you've starred and cites them as clickable links, with a chat panel on the home screen. This is the "internal knowledge search" use case arriving inside the suite.

**Hiding content from the AI.** Several open pull requests ([#1887](https://github.com/genspark-ai/genoffice/pull/1887) for Markdown, [#1884](https://github.com/genspark-ai/genoffice/pull/1884) for Sheets, and [#1883](https://github.com/genspark-ai/genoffice/pull/1883) for Docs, now closed) let you mark a selection so the real text stays in your document and in the saved file, but the AI only sees a placeholder. Practical for client names, salaries or anything you don't want sent to a model.

**Import skills you already have.** [#1895](https://github.com/genspark-ai/genoffice/pull/1895) proposes importing existing "skills" folders from tools like Claude Code, Codex or Cursor — many of which are about Word, spreadsheets, presentations, PDFs and HTML, i.e. exactly what GenOffice opens.

**Export reliability for big spreadsheets.** [#1894](https://github.com/genspark-ai/genoffice/pull/1894) addresses printing and PDF export of large workbooks that previously failed with a "needs full load" message.

---

## 4. Community Buzz

**Most active discussions (by comment count):**

- [Issue #1927](https://github.com/genspark-ai/genoffice/issues/1927) — 7 comments. A 25.7 MB Excel file with ~21,000 rows and columns up to AA opens, but sorting and filtering are blocked with a "this workbook is too large to load fully into memory" message. This is the loudest practical complaint of the day and directly affects anyone working with large spreadsheets.
- [Issue #1778](https://github.com/genspark-ai/genoffice/issues/1778) — 7 comments, still open since Sep 30. GenOffice 0.11.0 crashes on Windows 11 after 1–2 minutes with any Excel file or new document.
- [Issue #1923](https://github.com/genspark-ai/genoffice/issues/1923) — 5 comments. The fillable-PDF request, now delivered in v0.11.505.
- [Issue #1910](https://github.com/genspark-ai/genoffice/issues/1910) — middle-click to close tabs, closed. Users expect browser-style behaviour.
- [Issue #1920](https://github.com/genspark-ai/genoffice/issues/1920) — true multi-page document layout like Microsoft Word, closed (appears in the snapshot notes).

**Also worth noting:**

- [Issue #1925](https://github.com/genspark-ai/genoffice/issues/1925) (closed) — two-column resume layouts render differently from Word, a common pain point for anyone producing CVs and templates.
- [Issue #1929](https://github.com/genspark-ai/genoffice/issues/1929) — users on 0.11.411 / Windows 11 can't log in, with a "cannot connect to GenSpark" message.
- [Issue #1924](https://github.com/genspark-ai/genoffice/issues/1924) — request for multiple saved custom AI models, freely switchable. The snapshot notes and [#1922](https://github.com/genspark-ai/genoffice/pull/1922) (adding Liquid AI's d1 as a preset endpoint) indicate this is being worked on.
- [Issue #1928](https://github.com/genspark-ai/genoffice/issues/1928) — request for OpenDocument support (.odt, .ott) for teams on LibreOffice.

---

## 5. Signals to Watch

**1. Privacy controls are becoming a feature, not an afterthought.** Three separate "hide this from the model" pull requests across Docs, Sheets and Markdown point toward a suite where you consciously decide what the AI is allowed to see — relevant for anyone handling confidential data in documents and spreadsheets.

**2. Your files become the AI's source.** The starred-files knowledge base ([#1915](https://github.com/genspark-ai/genoffice/pull/1915)) with clickable citations is the clearest step yet toward internal knowledge management rather than generic AI chat. Watch whether team/shared corpora follow individual starred files.

**3. Big-file limits are the current ceiling.** Large-file filtering ([#1927](https://github.com/genspark-ai/genoffice/issues/1927)), print/PDF export of streamed workbooks ([#1894](https://github.com/genspark-ai/genoffice/pull/1894)) and large-file memory handling all appear in the same week. If your work regularly involves six-figure row counts, this is the area to test before standardising on GenOffice.

**4. Interoperability both ways.** Requests for OpenDocument support, plus a pull request to import skills folders from other AI coding tools, suggest users want GenOffice to sit inside existing workflows rather than replace them. Microsoft Word fidelity (two-column layouts, multi-page view) remains the reference point users measure against.

**5. Accessibility and display settings maturing.** The UI-scale work ([#1913](https://github.com/genspark-ai/genoffice/issues/1913), [#1934](https://github.com/genspark-ai/genoffice/pull/1934)), Russian table ribbon translations ([#1933](https://github.com/genspark-ai/genoffice/pull/1933)) and bilingual font pairing ([#1932](https://github.com/genspark-ai/genoffice/pull/1932)) show the suite moving past core functionality into polish — a sign it's being adopted by non-English and mixed-language teams.

</details>

<details>
<summary><strong>Presenton</strong> — <a href="https://github.com/presenton/presenton">presenton/presenton</a></summary>

No activity in the last 24 hours.

</details>