# ResearchOS Overnight Full-Build Readiness Report

分支：`codex/overnight-self-rescue-complete`  
基线：`55730c2`  
结论：**软件、内容生成、机器审计和独立复核链已完成；374 条生成候选全部保持 pending。当前不批准全库激活，下一步是人工试学与逐条审批。**

## 35 项交付问答

| # | 问题 | 结论与证据 |
|---:|---|---|
| 1 | 架构是否冻结？ | 是。沿用 M018.1 的 registry、Kernel、Today/Review、Progress、Case/Paper/Project 状态模型；本轮没有新一轮架构重写。 |
| 2 | 确定性缺陷是否修复？ | 是。关闭 Case 先修绕过、due-review phase drift、Cox 选项/补救复用、Paper 能力门、pending 内容泄漏、source mismatch、high-risk 漏路由、GSVA 来源串扰和伪自动通过。 |
| 3 | Statistical Unit E2E？ | PASS：Apply → restart → exact due review → `retained`，标准化事件可追溯。 |
| 4 | Confounding E2E？ | PASS：primary fail → fresh remediation → restart → due review；失败不创建能力。 |
| 5 | Cox E2E？ | PASS：9 个 plausible options / 5 correct；失败进入 distinct remediation；review 与 Progress 投影通过。 |
| 6 | Case 先修与重启？ | PASS：store 层阻断并返回精确缺失先修；中途重启保留推理/校准/更新，artifact 幂等。 |
| 7 | Today 是否打开精确任务？ | PASS：canonical `openLearningContentTask` 与 registry 元数据共同决定 exact content/phase。 |
| 8 | Review 是否只在 exact due 时合法？ | PASS：早到拒绝，due 后即使 persisted phase 漂移也强制打开 exact retrieval。 |
| 9 | Progress 是否避免重复计数？ | PASS：Kernel events、content progress 与 transfer artifacts 分层投影；同一事件/记录不重复。 |
| 10 | Paper 能力门？ | PASS：字段按具体 capability 解锁，不依赖全局最高等级；纯函数和 E2E 覆盖。 |
| 11 | Project 是否 append-only？ | PASS：记录和 transfer artifact 使用 canonical identity，重复提交不重复创造证据。 |
| 12 | Guide 是否达到 288 节？ | 是：10 模块、288/288 节；每节 742–958 中文字符，平均 832。 |
| 13 | Guide 完成度？ | 结构与机器清单 100%；内容仍为 AI 生成候选，不能把“生成完成”解释成科学审批完成。 |
| 14 | Concept 数量？ | 40；均有 Chinese-first 教学链、worked example、Explain 与三个独立 assessment。 |
| 15 | Method 数量？ | 21；均实现十维方法契约、直觉、worked walkthrough、Apply/remediation/review。 |
| 16 | Case 数量？ | 12；每案 4–6 阶段、锁定历史、校准和更新分离，final task 至少 3 项。 |
| 17 | 生成内容 active/verified 数量？ | 0/0。374/374 为 `ai_generated + pending + pending_review`；原 M018.1 已验证核心资产不受替换。 |
| 18 | 为什么仍 pending？ | 科学审查只完成差异式风险关闭；33 条证据主张仍部分支持，只有四个 assessment 原型完成深度材料实化，中文 distractor 与开放推理效度仍需人审。 |
| 19 | 新增来源？ | 相对基线新增 36 条 evidence records，仓库总数 85，本课程引用 78、missing 0；覆盖统计、回归、生存、组学、计算复现、论文阅读、图表和 AI 风险。 |
| 20 | 审核模式？ | TRUE_INDEPENDENT_REVIEW + diff-only re-review；最终审查绑定 snapshot byte hash、claims hash 和 source-registry hash，绑定不一致即 `FAIL_STALE_REVIEW`。 |
| 21 | 科学 BLOCKER/MAJOR？ | 首轮 B2/M19/Minor5；经多轮修复与最终当前快照复核，确定性科学问题关闭，但这不构成 361 条 claim 的批量人类批准。 |
| 22 | 证据审核结果？ | 最初 DIRECT 61 / SYNTHESIS 121 / WEAK 35 / UNSUPPORTED 0 / SOURCE_MISMATCH 136 / NEEDS_CURRENT 8；最终 104 条差异队列保守汇总为 71 evidence-ready、33 partial，SOURCE_MISMATCH 0、UNSUPPORTED 0。 |
| 23 | 教学审核结果？ | 初审 61/61 未达可教学/可评分标准；修复后 183/183 有语义化四行 stimulus 和 option-specific evidence contract，机器永不自动 complete。全库 B-01 与 M-03 仍需盲审/试学。 |
| 24 | 审查者是否冲突？ | 没有需要仲裁的激活冲突：科学、证据、教学和 fresh review 均同意保持 pending；“问题已修”只指其明确复核范围。 |
| 25 | Round 1 软件审计？ | PASS：178/178 tests；registry 297/9、Kernel 16/16、M015 32/32、状态和迁移不变量通过。 |
| 26 | Round 2 课程审计？ | 374 条候选、361 claims、248 条 high-risk 路由完成；激活结论仍为 HOLD/PENDING。 |
| 27 | Round 3 初学者 UX？ | 机器可确定的格式/伪通过风险已关闭；真实材料充分性、自然中文和学习负担需目标学习者试验。 |
| 28 | Round 4 fresh review？ | 发现 stale review binding、54 条 high-risk 漏路由、GSVA 串扰、伪评分、display-only route 误称及 hard-coded active count；均已修复并安排 exact-hash recheck。 |
| 29 | 前台 UI 是否通过？ | **未通过/未执行**。本地 preview URL 被 Codex in-app browser 的已保存用户权限拒绝；遵守权限，没有重试、绕过或换浏览器。 |
| 30 | 可访问性？ | 自动审计 11/11 PASS，SSR/键盘语义回归通过；真实 screen reader、视觉焦点遍历和高 DPI 仍未运行。 |
| 31 | 打包是否完成？ | 已以最终源码运行 web production build，并两次尝试 Tauri；offline 依赖可读，但系统缺少 MSVC `link.exe`，因此当前源码 installer/packaged restart 未生成。 |
| 32 | 明确阻断项？ | 外部：本地 URL 的已保存浏览器权限、MSVC linker 缺失。人工：目标学习者试学、全库 stimulus 独立作答、中文 distractor 盲审、开放题双人评分一致性、claim-level 审批。 |
| 33 | 下一项人工试验？ | 先做四原型（Confidence Interval、Differential Analysis、KM/log-rank、PCA）定向试学，再测 Statistical Unit、Confounding、Cox、Case 的真实前台/restart/due-review 流。 |
| 34 | 是否继续架构重构？ | 否。当前下一步不是 architecture redesign；只做试学发现的局部修复和评审证据补齐。 |
| 35 | 如何激活？ | 仅在 selective human approval + pilot 后逐条增量激活；不得一次性提升 374 条候选，也不得让当前结构预检创建标准化能力。 |

## 最终机器门禁

- `npm test`：178/178 PASS；localization 11/11；startup smoke PASS。
- `audit:curriculum`：288 Guide / 40 Concept / 21 Method / 12 Case / 13 Studio，PASS。
- `audit:curriculum-scientific`：374 items / 361 claims / 78 referenced sources / 248 high-risk claims，PASS。
- `content:audit`：0 errors / 1 intentional unsafe-plan fixture warning；85 evidence / 84 usable methods。
- Learning Kernel 16/16；M018 registry 297/9；M015 32/32；source-pack、Problem Atlas、localization、accessibility、performance、startup 全部 PASS。
- Performance：initial JS 1,119,622 bytes；CSS 75,214 bytes；scheduler 0.0092 ms。

## 发布边界

本轮发布的是可审计的候选内容、机器门禁和独立复核记录，不是完整课程的教学有效性声明。GitHub 分支可供 ChatGPT/人工继续检查；`main` 未合并，真实 Vault 和私人账户未触碰。
