# AI 办公效率日报 2026-10-10

> 生成时间: 2026-10-10 05:50 UTC | 覆盖项目: 6 个

- [n8n](https://github.com/n8n-io/n8n)
- [PPT Master](https://github.com/hugohe3/ppt-master)
- [SiYuan](https://github.com/siyuan-note/siyuan)
- [Teable](https://github.com/teableio/teable)
- [GenOffice](https://github.com/genspark-ai/genoffice)
- [Presenton](https://github.com/presenton/presenton)

---

## 横向对比

# 跨项目对比 — 办公生产力与自动化
**日期：2026-10-10**

## 1. 概述

今日动态分为两条主线：交付实用办公功能，以及大规模加固既有产品。GenOffice 发布了 v0.11.505，带来可填写 PDF 表单设计，以及从星标文件中作答的 AI 功能。n8n 发布了一个护栏版本，阻止保存包含已弃用节点的工作流，同时在实时子工作流可见性方面取得进展。SiYuan 没有发布新版本，但关闭了一大批笔记、数据库、移动端和性能相关的需求。Teable 没有发布新版本，有一项关联记录性能投诉，并排入了一项大型权限/访问控制审查。在活跃项目中，反复出现的主题是：基于自有文件的 AI、隐私控制，以及面对真实数据量时的性能。

## 2. 活跃度对比

*以下计数是 2026-10-10 摘要中提到的不同 Issue/PR，并非完整仓库总数。“N/A”用于摘要未报告可计数 Issue/PR 的情况——包括可能依赖 Discussions 或没有报告活动的项目——而不是暗示项目不活跃。*

| 项目 | Issue 数量 | PR 数量 | 发布状态 |
|---|---:|---:|---|
| **n8n** | 17 | 14 | 已发布 Stable 2.42.6 和 Beta 2.43.3；两者都会阻止创建/更新包含已弃用节点的工作流 |
| **SiYuan** | 23 | 6 | 过去 24 小时无发布 |
| **Teable** | 1 | 1 | 过去 24 小时无发布 |
| **GenOffice** | 11 | 11 | 已发布 v0.11.505 稳定版桌面端；可填写 PDF 表单设计、多页 Docs、其他修复 |
| **PPT Master** | N/A | N/A | 过去 24 小时无活动 |
| **Presenton** | N/A | N/A | 过去 24 小时无活动 |

## 3. 共同主题

- **基于自有文件的 AI** — GenOffice 新增了星标文件知识库，支持可点击引用；SiYuan 新增了 AI 提供商预设，并请求为其助手增强 SQL 搜索工具；n8n 继续完善其 Agents 聊天面板和 AI Assistant 可靠性。*(GenOffice, SiYuan, n8n)*
- **隐私与选择性 AI 暴露** — GenOffice 有多个开放 PR，用于对 AI 隐藏 Docs、Sheets 和 Markdown 内容，同时在保存文件中保留真实文本。n8n 的 AI Assistant 成本/token 审查是一个相关的效率与信任信号。*(GenOffice, n8n)*
- **真实数据规模下的性能** — Teable 用户报告，在大量关联的表中编辑记录时需等待 7–9 秒；GenOffice 用户遇到大型 Excel 排序/筛选限制；SiYuan 解决了 SQLite 内存和批量导入峰值问题；n8n 处理了编辑器内存、队列可靠性和 MCP 会话泄漏。*(Teable, GenOffice, SiYuan, n8n)*
- **文档与表单创作** — GenOffice 发布了可填写 PDF 表单设计、多页 Docs 和表单字段排列；SiYuan 改进了数据库字段、反链过滤和行内字体控制。*(GenOffice, SiYuan)*
- **权限与访问控制加固** — Teable 排入了一项包含 375 项变更的同步，重点是一致地执行权限；GenOffice 推进了 AI 脱敏控制。*(Teable, GenOffice)*
- **本地化与双语工作流** — SiYuan 新增了农历日期字段，并修复了 CJK 输入法问题；GenOffice 推进了双语字体搭配和俄语翻译。*(SiYuan, GenOffice)*
- **插件/生态可扩展性** — SiYuan 新增了统一的图片/资源钩子，并修复了插件市场相关问题；n8n 构建了自定义 Agents 聊天组件；GenOffice 提议从其他 AI 工具导入技能文件夹。*(SiYuan, n8n, GenOffice)*
- **自动化的可观测性与信任** — n8n 新增了实时子工作流进度指示器，并修复了队列/错误工作流问题。这一主题在今天的 n8n 中最为突出。*(n8n)*

## 4. 定位差异

- **n8n** — 面向技术运营、IT 和自动化构建者的工作流自动化平台。基于节点，适合自托管/企业环境。今日重点：旧工作流治理、AI 助手平台管线，以及大规模可靠性。
- **SiYuan** — 面向个人知识工作者、团队和 CJK 语言用户的知识管理与笔记工作区。本地优先/PKM 风格，具备数据库、反链、插件和移动应用。今日重点：每日笔记体验、性能、移动端修复和 AI 辅助搜索。
- **Teable** — 面向运营团队和内部工具的无代码数据库/电子表格数据库混合体。今日重点：权限/安全加固，以及大量关联记录下的性能。
- **GenOffice** — 面向行政、运营和知识工作者的集成办公生产力套件。覆盖 Docs、Sheets、PDF 和演示文稿，并将 AI 嵌入文档。今日重点：可填写 PDF 表单、基于文件的 AI、隐私控制，以及 Microsoft Word 风格的保真度。
- **PPT Master / Presenton** — 本时间窗口内未报告活动。从名称看，它们属于演示文稿工具领域，但摘要没有提供当前重点、目标用户或方法信号，无法进行有意义的比较。

## 5. 值得关注的信号

- **AI 变得基于文件且可脱敏。** GenOffice、SiYuan 和 n8n 都在朝着能引用内部内容的助手发展；在 GenOffice 的案例中，还允许你对模型隐藏敏感文本。对运营团队而言，这意味着 AI 助手可以更好地服务内部文档，而无需暴露所有内容。
- **大规模性能是下一个战场。** Teable 的关联记录变慢、GenOffice 的大型 Excel 限制、SiYuan 的导入内存工作，以及 n8n 的内存/会话泄漏，都指向同一个教训：在标准化之前，用真实数据量进行测试。
- **自动化治理变得更严格。** n8n 现在阻止保存包含已弃用节点的工作流。运行长期自动化流程的团队应在升级或编辑前清理旧节点。
- **权限加固将批量到来。** Teable 包含 375 项变更的访问控制同步，预示着未来版本中权限执行会更严格、更一致。在它落地前，先审查谁对什么拥有访问权限。
- **表单与结构化数据采集正在融合。** GenOffice 的可填写 PDF 表单、SiYuan 的数据库和 Teable 的关联记录都在满足同一需求：把纸质材料、PDF 和零散数据转化为结构化、可编辑的系统。
- **移动端与跨设备可靠性很重要。** SiYuan 关闭了一组移动端问题，包括加密笔记、应用重启、Android 返回键行为和 iPad 键盘处理。在桌面端和手机之间同步的团队应测试接下来的构建版本。
- **本地化与双语工作流日趋成熟。** SiYuan 的农历字段和 CJK 修复，加上 GenOffice 的双语字体和俄语翻译工作，表明产品正在超越仅英语的默认设置。
- **安静的项目不一定不活跃。** PPT Master 和 Presenton 今天没有活动。读者应关注它们未来的发布，而不是根据一个安静的日子下结论。

---

## 各项目详细报告

<details>
<summary><strong>n8n</strong> — <a href="https://github.com/n8n-io/n8n">n8n-io/n8n</a></summary>

# n8n 报告 — 2026-10-10

## 今日亮点

稳定版和 beta 渠道今天都发布了同一道护栏：n8n 现在会阻止创建或更新包含已弃用节点的工作流。实际影响是，如果你打开一个依赖已退役节点的旧工作流，在替换该节点之前将无法保存更改——下次升级前，值得检查一下你最常用的自动化。

今天活动中的另一条主线是 AI Assistant 和子工作流的可靠性：一个代价高昂的 token 用量 bug 已关闭，新工作会在子工作流运行时添加实时进度指示器，同时针对 2.42.x 自托管版本报告了多个泄漏/升级问题。

---

## 发布与更新

**Stable 2.42.6** 和 **Beta 2.43.3** 都发布了同一个功能：**阻止创建/更新包含已弃用节点的工作流**。

- 发布内容：n8n 核心现在会拒绝创建或保存仍在使用项目已退役节点的工作流。
- 对你的影响：你已在运行的工作流会继续运行，但编辑包含已弃用节点的工作流时，在将该节点替换为替代节点之前会保存失败。这是一个“该做清理了”的版本，而不是新能力。
- 发布说明：[stable 2.42.6](https://github.com/n8n-io/n8n/compare/n8n@2.42.5...n8n@2.42.6) · [beta 2.43.3](https://github.com/n8n-io/n8n/compare/n8n@2.43.2...n8n@2.43.3)
- 相关变更请求：[#40707](https://github.com/n8n-io/n8n/issues/40707) · [#40706](https://github.com/n8n-io/n8n/issues/40706)

今天的发布没有其他面向用户的功能。

---

## 关键进展

**在子工作流运行时查看它们。** 两个关联的 pull request 为“Execute Sub-workflow”节点添加了实时进度：节点边框上的增长弧线、“Step N”计数器，以及“Running: <node name>”标签——再加上将进度发送到编辑器会话的底层管道。当父工作流调用其他工作流，而你现在只能盯着加载转圈时，这会很有用。 [#40640](https://github.com/n8n-io/n8n/pull/40640) · [#40639](https://github.com/n8n-io/n8n/pull/40639)

**更清晰的 Microsoft Teams 设置。** Teams 连接流程现在会在每次下载应用包时说明要上传到哪里——这是设置步骤器中一个固定的绊脚石。 [#40339](https://github.com/n8n-io/n8n/pull/40339)

**为更丰富的产品内 AI 助手打基础。** 一组草稿/探索性 PR 扩展了 Agents 聊天面板，使其能够承载自定义交互卡片、自定义消息和输入框行为，以及已完成工具调用的自定义渲染。目前还没有可用的东西——这是 Assistant v2 的底层管道。 [#40608](https://github.com/n8n-io/n8n/pull/40608) · [#40609](https://github.com/n8n-io/n8n/pull/40609) · [#40611](https://github.com/n8n-io/n8n/pull/40611) · [#40613](https://github.com/n8n-io/n8n/pull/40613) · [#40720](https://github.com/n8n-io/n8n/pull/40720)

**“Message an Agent”节点获得文档化输出。** 该节点之前没有声明输出 schema，这限制了 AI 构建器、生成的节点类型和验证对其的理解。 [#40821](https://github.com/n8n-io/n8n/pull/40821)

**QuickBooks 筛选结果修复。** 当使用“Return All”加筛选器获取 QuickBooks 记录时，较早分页中的记录可能会被静默丢弃。此修复会让分页持续进行，直到出现真正为空的筛选结果页。 [#40724](https://github.com/n8n-io/n8n/pull/40724)

**公共 API 清理。** 最后一个旧版端点正在迁移到现代控制器模式，旧的验证栈也在退役，以便所有 API 文档都来自同一份生成的规范。如果你的团队通过 REST API 连接 n8n，这与你相关。 [#40756](https://github.com/n8n-io/n8n/pull/40756) · [#40801](https://github.com/n8n-io/n8n/pull/40801)

**不可用授权功能的付费墙页面。** 未激活的授权模块现在会显示占位页面，而不是让设置侧边栏静默丢弃它们的链接。 [#40553](https://github.com/n8n-io/n8n/pull/40553)

**队列可靠性。** 队列 worker 在尚未开始就失败的工作现在会被退回队列，而不是标记为失败，从而避免滚动升级期间丢失执行。 [#40534](https://github.com/n8n-io/n8n/pull/40534)

---

## 社区热议

今天最热闹的讨论串是一个导致编辑器不可用的 bug，现已关闭：

- **共享实例上每个节点都显示为“？”。** 在多用户安装中，编辑器可能将所有节点——甚至 Webhook 这类核心节点——显示为“？”，导致无法编辑、保存失败，而执行仍能正常工作。11 条评论后已关闭。 [#39123](https://github.com/n8n-io/n8n/issues/39123)
- **AI Assistant 成本冲击。** 一位用户报告，一个五个单词的问题消耗了约 137,000 个输入 token 和 $0.42，归因于缺少 prompt 缓存和过多的工具往返。现已关闭。 [#38130](https://github.com/n8n-io/n8n/issues/38130)
- **Assistant 无法保存大型工作流。** 一个 84 个节点的工作流无法被 assistant 保存，出现内部保存错误和构建器限制错误。已关闭。 [#39135](https://github.com/n8n-io/n8n/issues/39135)
- **无障碍访问是阻塞性问题。** 一位依赖屏幕阅读器（TalkBack、NVDA）的盲人用户提出了移动端和桌面端的关键无障碍问题，并反对将其视为功能请求。 [#28071](https://github.com/n8n-io/n8n/issues/28071)
- **编辑器内存飙升。** 加载具有很长发布历史的工作流可能消耗数 GB 内存，因为历史记录行从未被清理。已关闭。 [#39418](https://github.com/n8n-io/n8n/issues/39418)
- **API 创建的子工作流出现“Workflow has issues”。** 调用通过 REST API 创建的子工作流会验证失败，即使一切正常。仍处于打开状态。 [#40436](https://github.com/n8n-io/n8n/issues/40436)
- **GitLab 节点中的静默失败。** 将 issue 的 State 设置为 Open 或 Closed 会报告成功，但没有任何变化。仍处于打开状态。 [#35799](https://github.com/n8n-io/n8n/issues/35799)
- **带 CSRF 防护的 Jenkins。** Jenkins 节点无法在要求 CSRF crumb 的 Jenkins 实例上触发参数化 job。 [#40761](https://github.com/n8n-io/n8n/issues/40761)
- **凭据表单怪癖。** 四位数的 SFTP 端口（2222）会从凭据表单中消失，并且不被接受。 [#40803](https://github.com/n8n-io/n8n/issues/40803)
- **2.42.x 自托管升级摩擦。** 今天有多条报告：重复的 `parentFolderId` 列破坏 SQLite 迁移并阻止启动 [#40813](https://github.com/n8n-io/n8n/issues/40813)；每次执行使用凭据的团队项目工作流时都会记录 Redis `hset` 错误 [#40806](https://github.com/n8n-io/n8n/issues/40806)；以及 MCP 会话在队列模式下泄漏，直到实例内存耗尽 [#40822](https://github.com/n8n-io/n8n/issues/40822)。
- **错误工作流未触发。** 当工作流设置指向“No Workflow”时，值 `DEFAULT` 会被当作真实工作流 ID，因此工作流自身的 Error Trigger 永远不会运行。 [#40824](https://github.com/n8n-io/n8n/issues/40824)
- **Mistral 集成。** 两条相关报告涉及 Mistral 的“Type validation failed”错误，最初的修复从未被合并。 [#37352](https://github.com/n8n-io/n8n/issues/37352) · [#40646](https://github.com/n8n-io/n8n/issues/40646)

---

## 值得关注的信号

- **已弃用节点强制措施已经落地。** 阻止保存比警告更坚决。运行长期自动化的团队应提前规划节点替换，而不是在升级后编辑到一半才发现问题。
- **AI Assistant 的经济性正受到审视。** token 成本报告被关闭，表明对效率的关注；重构的 Agents 聊天底层管道表明，n8n 正在投资把 assistant 做成别人可以构建其上的平台，而不只是一个聊天框。
- **围绕 agents 和 MCP 的资源生命周期 bug。** 今天的泄漏报告（agents 从不关闭，MCP 会话不断堆积）指向了一类对持续运行 agents 的自托管团队最重要的问题。
- **嵌套工作流的可观测性。** 子工作流实时进度这类改动有助于非开发者信任长时间运行的流程，而且它即将发布。
- **自托管安装的升级质量。** SQLite 迁移失败、反复出现的 Redis 错误以及凭据表单回归都落在了 2.42.x 上。管理团队应在升级前阅读发布说明，而不是自动更新。
- **无障碍压力正在上升。** 用户将屏幕阅读器支持表述为阻塞性问题而非功能请求，这类信号往往预示着会有一个专门的无障碍工作方向。

</details>

<details>
<summary><strong>PPT Master</strong> — <a href="https://github.com/hugohe3/ppt-master">hugohe3/ppt-master</a></summary>

过去24小时无活动。

</details>

<details>
<summary><strong>SiYuan</strong> — <a href="https://github.com/siyuan-note/siyuan">siyuan-note/siyuan</a></summary>

# SiYuan — 观察报告
**日期：2026-10-10 | 来源：github.com/siyuan-note/siyuan**

---

## 1. 今日亮点

过去 24 小时内没有发布新版本，但 SiYuan 团队关闭或更新了一大批长期存在的请求——尤其是行内字体控制、一个能在图片上传前捕获所有进入笔记图片的统一钩子，以及若干驯服反向链接面板的新方式。综合来看，这一天的活动显示，产品正在打磨其核心记笔记体验（格式、链接、搜索、数据库），同时在悄然投入性能与 AI 助手底层管线。移动端可靠性与笔记本启动问题也大量得到解决，这对任何在手机与桌面端之间同步的人都很重要。

---

## 2. 关键进展

**图片与附件正在获得一个真正的“正门”。**
[#18878](https://github.com/siyuan-note/siyuan/issues/18878) ——今天讨论最多的条目——统一了文件进入笔记的方式，让插件无论文件如何进入都能一致处理：粘贴截图、从 Finder 拖入、从网页版上传、使用文件选择器、拖入数据库字段，或设置封面图。其动机很实际：同一张大 PNG 以六种不同方式粘贴时，都应该被压缩、转换为 JPEG、剥离元数据，并获得合理的文件名——每次如此，而不只是偶尔如此。（27 条评论）

**反向链接面板获得真正的筛选能力。**
三项相关请求一起关闭：按块类型筛选反向链接（例如排除数据库）[#19257](https://github.com/siyuan-note/siyuan/issues/19257)，隐藏仅作为指针且占用空间的“传播”引用块 [#19251](https://github.com/siyuan-note/siyuan/issues/19251)，以及从反向链接列表中排除特定条目 [#19258](https://github.com/siyuan-note/siyuan/issues/19258)。

**数据库在阅读与写作流程中更加好用。**
- 在侧边栏或浮动面板中查看和编辑数据库（属性）字段，这样就不必为了改一个值而滚回长文档顶部 [#20331](https://github.com/siyuan-note/siyuan/issues/20331)。
- 日期字段支持农历输入与显示，面向联系人数据库中的生日跟踪等场景——包括闰月处理 [#20322](https://github.com/siyuan-note/siyuan/issues/20322)。

**行内文本样式。** 行内级文本现在可以携带自己的字体族 [#17336](https://github.com/siyuan-note/siyuan/issues/17336)——这是一项长期被请求的格式能力，今天在 22 条评论后关闭。

**搜索会告诉你它实际在做什么。** 搜索面板现在会禁用当前所选搜索方法会静默忽略的筛选、排序、分组和替换选项——从而让结果与界面承诺一致 [#20338](https://github.com/siyuan-note/siyuan/issues/20338)。另外，一个拉取请求提出仅文档索引，以加快文档内子串搜索 [#20320](https://github.com/siyuan-note/siyuan/pull/20320)。

**阅读与导航打磨。**
- 面包屑路径不再把深层级截断成“…” [#20340](https://github.com/siyuan-note/siyuan/issues/20340)。
- 可选开关，让 H1/H2 指示器和折叠箭头始终可见，而不是仅在悬停时显示 [#20333](https://github.com/siyuan-note/siyuan/issues/20333)。
- 表格单元格内的富文本录入更好，粘贴的多段落内容会被当作真正的段落处理 [#20253](https://github.com/siyuan-note/siyuan/issues/20253)。

**闪卡。** 可配置默认打开模式（弹窗与其他布局），这样改变显示方式时卡片不会重置 [#19189](https://github.com/siyuan-note/siyuan/issues/19189)。闪卡设置和指南中的措辞已在 22 种语言中更正，以与实际行为一致 [#20332](https://github.com/siyuan-note/siyuan/pull/20332)。

**集市与插件。**
- 包详情页的版本号可点击，打开该版本的发布说明，并提供下拉菜单切换版本 [#20078](https://github.com/siyuan-note/siyuan/pull/20078)。
- 修复：在另一台设备上更新插件可能被误读为卸载 [#20354](https://github.com/siyuan-note/siyuan/pull/20354)。
- 修复：macOS 中零散的 `.DS_Store` 文件会让空的插件/包文件夹看起来非空 [#20355](https://github.com/siyuan-note/siyuan/pull/20355)。

**性能与内存。**
- 针对 SQLite 页缓存的内核内存调优，该缓存此前会在许多连接间成倍占用 [#20345](https://github.com/siyuan-note/siyuan/issues/20345)。
- 降低批量 Markdown 导入期间的内存峰值——一次真实测试导入约 900 个文件时，内存峰值达到数 GB [#20347](https://github.com/siyuan-note/siyuan/issues/20347)。

**AI 助手。**
- Atlas Cloud 被添加为 AI 提供商预设，与 OpenRouter 一起归入“聚合器”类别 [#20342](https://github.com/siyuan-note/siyuan/pull/20342)。
- 一项请求希望增强内置智能体的 SQL 搜索工具，使其能查询结构化数据并更可靠地驱动搜索窗口 [#20383](https://github.com/siyuan-note/siyuan/issues/20383)。

---

## 3. 社区热议

今天最活跃的讨论串是关于**图片与格式**，而不是 bug：

- **统一的图片处理钩子** [#18878](https://github.com/siyuan-note/siyuan/issues/18878)（27 条评论）——用户显然感受到存储膨胀，以及图片以多种方式进入笔记时处理不一致的痛苦。
- **按文本设置字体族** [#17336](https://github.com/siyuan-note/siyuan/issues/17336)（22 条评论）——人们长期想要补齐的一个格式能力缺口。
- **启动同步期间数据库索引死锁** [#19221](https://github.com/siyuan-note/siyuan/issues/19221)（16 条评论）——加密笔记本导致移动端应用卡在启动屏；对于依赖加密笔记本的人来说，这是一个严重的信任问题。
- **无法打开页面的移动端版本** [#19183](https://github.com/siyuan-note/siyuan/issues/19183)（10 条评论）。

第二类投诉明显集中在**移动端与跨设备摩擦**，且都已在今天关闭：
- 中文输入法激活时，iPad 搜索快捷键失效 [#20006](https://github.com/siyuan-note/siyuan/issues/20006)
- Android 系统返回键会重新加载整个桌面布局 UI，而不是关闭当前打开的弹窗 [#20390](https://github.com/siyuan-note/siyuan/issues/20390)
- 将应用从后台划掉后，它无法重新打开 [#19244](https://github.com/siyuan-note/siyuan/issues/19244)
- 移动端设置界面出现两个关闭按钮 [#19239](https://github.com/siyuan-note/siyuan/issues/19239)

还有两个桌面端异常值得 Windows 用户注意：每次更新后任务栏快捷方式都会消失 [#19266](https://github.com/siyuan-note/siyuan/issues/19266)；收起虚拟键盘时编辑器会跳动整整一页 [#19254](https://github.com/siyuan-note/siyuan/issues/19254)。

---

## 4. 值得关注的信号

**1. 一次认真的性能推进。** SQLite 页缓存内存问题 [#20345](https://github.com/siyuan-note/siyuan/issues/20345) 与批量导入内存峰值 [#20347](https://github.com/siyuan-note/siyuan/issues/20347) 都来自实际测量，而不是抱怨帖。大型工作区用户应期待更顺畅的表现——同时也要留意导入期间是否出现回归。

**2. 移动端正在得到持续清理。** 加密笔记本、应用重启、Android 返回键行为、iPad 键盘、虚拟键盘——这是一组问题，而非孤立事件。如果你的团队在桌面端和手机之间同步，接下来几个构建版本值得测试。

**3. 插件生态正在获得更好的钩子——以及更好的商店门面。** 资源上传钩子 [#18878](https://github.com/siyuan-note/siyuan/issues/18878)，加上集市修复和发布说明 [#20078](https://github.com/siyuan-note/siyuan/pull/20078)，表明插件正被视为一等层，而不是事后补充。对非程序员而言，实际结果是扩展更值得信赖、说明也更完善。

**4. AI 正从“聊天”走向“操作我的笔记”。** 提供商预设 [#20342](https://github.com/siyuan-note/siyuan/pull/20342) 降低了接入 AI 服务的成本，而 SQL 工具请求 [#20383](https://github.com/siyuan-note/siyuan/issues/20383) 则关乎助手查询你实际的数据库内容。这才是更有趣的信号：基于你自己的结构化知识库提供协助，而不是泛泛的文本生成。

**5. 反向链接正在成为一个查询界面。** 三项独立的反向链接改进在同一天落地——按块类型筛选、隐藏仅作指针的引用、排除特定条目——指向一种趋势：把链接当作可切片、可塑形的东西，就像数据库视图一样。如果你的团队笔记依赖引用路径而不是文件夹层级，这值得关注。

**6. 本地化与区域工作流很重要。** 农历日期字段 [#20322](https://github.com/siyuan-note/siyuan/issues/20322) 和中文输入法 iPad 修复 [#20006](https://github.com/siyuan-note/siyuan/issues/20006) 表明，这款产品正在为 CJK 语言的日常使用而塑造，而不仅仅是被翻译成这些语言。

---

*注：以上所有条目均在 2026-10-10 被标记为已关闭或已更新。“已关闭”表示团队认为该工作已解决——并不确认某个具体版本已发布；过去 24 小时内没有发布任何版本。*

</details>

<details>
<summary><strong>Teable</strong> — <a href="https://github.com/teableio/teable">teableio/teable</a></summary>

# Teable — 2026-10-10 报告

## 1. 今日要闻

今天没有新版本发布，因此暂无新功能可供采用——但有两个信号格外突出。一个自托管团队反馈，当某张表的记录与其他表大量关联后，编辑单条记录可能触发 7–9 秒等待（该 issue 后来已关闭）。另外，来自 Teable 企业代码库的一大批授权与访问控制变更已排队等待评审，表明安全加固仍在继续。

## 2. 发布与更新

过去 24 小时内未发布新版本。截至本报告，你的工作区中没有任何新内容需要安装或启用。

## 3. 关键进展

**访问控制收紧，等待评审** — [PR #3638](https://github.com/teableio/teable/pull/3638)（开放中）

来自 Teable 企业代码库的一批同步已提交评审，包含自上次同步以来的 375 项变更。核心主题是补齐“谁可以访问产品哪些部分”的缺口——也就是说，确保权限不仅在前端界面，而是在进入系统的每条路径上都得到一致执行。直白地说：如果你的团队依赖 Teable 权限来限制某些表或视图，这项工作就是要让这些限制更难以绕过。

有两点需要注意：这是一个 pull request，而不是已发布的版本，因此你的工作区尚未发生变化；而且它完全属于面向开发者的底层机制。这里没有新按钮、新视图或新功能可看——其价值在于现有控制项的可靠性与安全性。

## 4. 社区热议

**“小小一次编辑，大大一次卡顿”** — [Issue #3663](https://github.com/teableio/teable/issues/3663)（已关闭）

这是本时间窗口内唯一有动态的 issue，也是运维团队能直接感受到的那类反馈。一位自托管用户描述了一个场景：创建或删除单条记录会导致系统重写*所有*显示该表主字段的关联单元格——超过 2,000 个单元格——每创建一条记录耗时 7–9 秒。他们的服务器在其他方面处于空闲状态，CPU 低于 1%，数据库大约 3%，因此瓶颈并非机器原始性能。

为什么非开发者也要关心：这正是真实世界 Teable 部署的典型形态——一张 projects 或 customers 表被关联到许多其他表，其中一个字段（记录名称）无处不在。在这种配置下，即便硬件性能不错，新增记录也会变得很慢。该 issue 当天就被关闭，只有一条评论，这通常意味着团队已对其进行分诊，或将其关联到某个修复——但请把它视为“已确认”，而不是“你的版本中已解决”。如果你自托管 Teable，并且使用大量关联表，那么在认定等待只是你自身基础设施问题之前，值得关注 changelog。

## 5. 值得关注的信号

- **大规模关联记录下的性能是当前痛点。** 今天最具体的一条社区反馈，不是缺少某个功能，而是日常编辑变慢。随着团队扩大关联表规模，简单操作的响应时间将成为决定 Teable 日常是否可用的关键因素。
- **自托管部署的用户正在发声。** 反馈者运行的是自己的 Docker 环境，并使用外部缓存和数据库。这提醒我们，自托管团队常会遇到云用户从未见过的问题，而他们的反馈往往会影响路线图。
- **安全与权限相关工作正批量到来。** 375 项变更的同步表明，Teable 正在把企业级访问控制拉回主产品。预计未来版本中权限行为会变得更严格、更一致——对于存储敏感内部数据的任何人来说都是好事，但值得在它落地前规划一次快速审查，确认谁有权访问什么。

</details>

<details>
<summary><strong>GenOffice</strong> — <a href="https://github.com/genspark-ai/genoffice">genspark-ai/genoffice</a></summary>

# GenOffice 报告 — 2026-10-10

来源：[github.com/genspark-ai/genoffice](https://github.com/genspark-ai/genoffice)

---

## 1. 今日亮点

GenOffice 发布了稳定版桌面更新（v0.11.505），其重点新增功能是 **PDF 中的 Form Design 标签页**——你现在可以 *创建* 可填写的 PDF 表单，而不只是填写已有表单。同样的请求昨天作为用户建议提交（[#1923](https://github.com/genspark-ai/genoffice/issues/1923)），因此从“提出需求”到“可用”的间隔大约为一天。与此同时，围绕 **对 AI 隐藏敏感内容** 和 **根据你已加星标的文件回答问题** 的大量活动表明，产品正朝着更私密、以知识为依据的辅助方向发展。

---

## 2. 发布与更新

**v0.11.505 — 稳定版桌面安装程序**（[发布](https://github.com/genspark-ai/genoffice)）

今天即可使用的新功能，无需任何技术设置：

- **自己构建可填写的 PDF 表单。** 新的 *Form Design* 标签页允许你在 PDF 上创建文本字段、复选框、单选按钮、下拉框、日期字段和签名字段。
- **像排列形状一样排列字段。** 多选、排列和剪贴板操作均可用于表单字段，因此你可以布局表单并移动成组字段。
- **编辑已保存的字段。** 字段放置后，你可以返回修改，而不必从头再来。
- **自动检测字段。** GenOffice 可以扫描页面，并根据空白、方框和标签之间的间隙建议字段——适合将扫描件或扁平化表单变成可供人们输入的表单。

一个相关拉取请求（[#1930](https://github.com/genspark-ai/genoffice/pull/1930)，已关闭）描述同一快照还包含 **Docs 中的多页布局**、对页面锚定浮动表格的修复、**多个已保存的自定义模型端点**、中键单击关闭标签页，以及仅英文帮助。

---

## 3. 关键进展

**可填写 PDF 创作（已发布）。** 对行政和运营团队最直接有用的变化：无需单独的表单构建工具，即可用真正可填写的表单替代纸质或打印为 PDF 的录入表单。

**界面缩放正在进行中。** Issue [#1913](https://github.com/genspark-ai/genoffice/issues/1913) 报告称，在高 DPI 屏幕上，应用的工具栏、标签页和侧边栏仍然小得令人不适——缩放只影响文档，不影响应用本身。一个拉取请求（[#1934](https://github.com/genspark-ai/genoffice/pull/1934)）新增了单独的界面缩放设置，被描述为“两部分中的第一部分”，覆盖外壳和 Sheets。

**样式模板中的双语字体控制。** [#1931](https://github.com/genspark-ai/genoffice/issues/1931) 指出，虽然文档字体控件可以分别设置东亚字体和拉丁字体，但 *Style template* 编辑器仍然只提供一个字体选项——因此无法保存双语文档样式。修复 PR 已开放（[#1932](https://github.com/genspark-ai/genoffice/pull/1932)）。

**向你自己的文件提问。** 一个由三部分组成的拉取请求（[#1915](https://github.com/genspark-ai/genoffice/pull/1915)）新增了知识库通道：AI 会根据你已加星标的文件作答，并将它们引用为可点击链接，主屏幕上还有一个聊天面板。这就是“内部知识搜索”用例进入套件。

**对 AI 隐藏内容。** 多个开放的拉取请求（[#1887](https://github.com/genspark-ai/genoffice/pull/1887) 针对 Markdown，[#1884](https://github.com/genspark-ai/genoffice/pull/1884) 针对 Sheets，以及 [#1883](https://github.com/genspark-ai/genoffice/pull/1883) 针对 Docs，后者现已关闭）允许你标记选定内容，使真实文本保留在文档和保存的文件中，但 AI 只能看到占位符。这对于客户名称、薪资或任何你不想发送给模型的内容都很实用。

**导入你已有的技能。** [#1895](https://github.com/genspark-ai/genoffice/pull/1895) 提议从 Claude Code、Codex 或 Cursor 等工具导入现有的“skills”文件夹——其中许多都涉及 Word、电子表格、演示文稿、PDF 和 HTML，也就是 GenOffice 所打开的内容。

**大型电子表格的导出可靠性。** [#1894](https://github.com/genspark-ai/genoffice/pull/1894) 解决了大型工作簿的打印和 PDF 导出问题，这些工作簿此前会失败并提示“needs full load”。

---

## 4. 社区热议

**最活跃的讨论（按评论数）：**

- [Issue #1927](https://github.com/genspark-ai/genoffice/issues/1927) — 7 条评论。一个 25.7 MB 的 Excel 文件，包含约 21,000 行以及直到 AA 的列，可以打开，但排序和筛选被阻止，并提示“this workbook is too large to load fully into memory”。这是当天最响亮的实际抱怨，并直接影响任何处理大型电子表格的人。
- [Issue #1778](https://github.com/genspark-ai/genoffice/issues/1778) — 7 条评论，自 9 月 30 日起仍处于开放状态。GenOffice 0.11.0 在 Windows 11 上使用任何 Excel 文件或新建文档后 1–2 分钟就会崩溃。
- [Issue #1923](https://github.com/genspark-ai/genoffice/issues/1923) — 5 条评论。可填写 PDF 的请求，现已在 v0.11.505 中交付。
- [Issue #1910](https://github.com/genspark-ai/genoffice/issues/1910) — 中键单击关闭标签页，已关闭。用户期待浏览器风格的行为。
- [Issue #1920](https://github.com/genspark-ai/genoffice/issues/1920) — 类似 Microsoft Word 的真正多页文档布局，已关闭（出现在快照说明中）。

**同样值得注意：**

- [Issue #1925](https://github.com/genspark-ai/genoffice/issues/1925)（已关闭）— 双栏简历布局的渲染效果与 Word 不同，这是任何制作 CV 和模板的人常见的痛点。
- [Issue #1929](https://github.com/genspark-ai/genoffice/issues/1929) — 使用 0.11.411 / Windows 11 的用户无法登录，并提示“cannot connect to GenSpark”。
- [Issue #1924](https://github.com/genspark-ai/genoffice/issues/1924) — 请求支持多个已保存的自定义 AI 模型，并可自由切换。快照说明和 [#1922](https://github.com/genspark-ai/genoffice/pull/1922)（将 Liquid AI 的 d1 添加为预设端点）表明这项工作正在进行中。
- [Issue #1928](https://github.com/genspark-ai/genoffice/issues/1928) — 请求为使用 LibreOffice 的团队提供 OpenDocument 支持（.odt、.ott）。

---

## 5. 值得关注的信号

**1. 隐私控制正在成为功能，而非事后补充。** 三个分别针对 Docs、Sheets 和 Markdown 的“对模型隐藏此内容”拉取请求，指向一个由你有意识地决定 AI 可以查看哪些内容的套件——这与任何在文档和电子表格中处理机密数据的人相关。

**2. 你的文件成为 AI 的来源。** 带有可点击引用的已加星标文件知识库（[#1915](https://github.com/genspark-ai/genoffice/pull/1915)）是迄今迈向内部知识管理、而非通用 AI 聊天的最清晰一步。关注团队/共享语料库是否会跟随个人已加星标文件而来。

**3. 大文件限制是当前天花板。** 大文件筛选（[#1927](https://github.com/genspark-ai/genoffice/issues/1927)）、流式工作簿的打印/PDF 导出（[#1894](https://github.com/genspark-ai/genoffice/pull/1894)）以及大文件内存处理都在同一周出现。如果你的工作经常涉及六位数行数，那么在标准化采用 GenOffice 之前，这是需要测试的领域。

**4. 双向互操作性。** 对 OpenDocument 支持的请求，以及从其他 AI 编码工具导入 skills 文件夹的拉取请求，表明用户希望 GenOffice 融入现有工作流，而不是取代它们。Microsoft Word 保真度（双栏布局、多页视图）仍是用户衡量的参考点。

**5. 可访问性和显示设置日趋成熟。** UI 缩放工作（[#1913](https://github.com/genspark-ai/genoffice/issues/1913)、[#1934](https://github.com/genspark-ai/genoffice/pull/1934)）、俄语表格功能区翻译（[#1933](https://github.com/genspark-ai/genoffice/pull/1933)）和双语字体搭配（[#1932](https://github.com/genspark-ai/genoffice/pull/1932)）表明该套件正走过核心功能阶段，进入打磨阶段——这是它正被非英语和混合语言团队采用的迹象。

</details>

<details>
<summary><strong>Presenton</strong> — <a href="https://github.com/presenton/presenton">presenton/presenton</a></summary>

过去24小时无活动。

</details>