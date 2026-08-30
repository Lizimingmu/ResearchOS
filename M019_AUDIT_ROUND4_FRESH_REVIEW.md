# M019 Round 4 Fresh System Review

- review_mode: `ROUND4_FRESH_DIFF_REVIEW`
- scope: 当前稳定工作树的 Git diff，以及 `M019_AUDIT_ROUND1_SOFTWARE.md`、现有 Round 3、最新 evidence / pedagogy / scientific final review；未重扫完整历史
- review_target: 找出前三轮未覆盖、且能由当前差异直接复现的重要缺陷
- current_snapshot_byte_sha256: `9c70964bf5badee91a8bb9e90deb4eef88f314cb4a81ac1fb1e92249496e41ae`
- current_snapshot_declared_claims_sha256: `ecbf59429035e5afb944133176225bf2a79ff522f9d68c67bf2415c9a66c751e`

## Severity counts

| Severity | Count |
|---|---:|
| BLOCKER | 1 |
| MAJOR | 4 |
| MINOR | 1 |

## BLOCKER

### R4-B01 — 最终审查结论没有绑定当前快照，且现有 scientific final 已与当前内容发生事实冲突

**Evidence**

- `M019_SCIENTIFIC_REREVIEW_FINAL.md:28-31` 把“当前证据”写成：`src-multiomics` 出现 0 次、当前快照引用 0 次，并据此关闭该 MAJOR。
- 当前 `src/data/evidence.ts:280` 已重新存在一个含 DOI `10.1186/s13059-017-1215-1`、PMID `28476144` 的新 `src-multiomics`；当前快照中该 ID 出现 16 次，分布于 guide 与 claim 来源字段。修复方向可能合理，但旧 final 的“当前证据”已经不再描述当前工作树。
- `M019_SCIENTIFIC_REREVIEW_FINAL.md`、`M019_PEDAGOGY_REREVIEW_FINAL3.md` 和 `M019_EVIDENCE_REREVIEW_FINAL3.md` 均未记录当前快照 byte hash、snapshot 中声明的 claims hash，或来源注册表 hash。`artifacts/curriculum-evidence-rereview-final2.json` 只记录固定的 `currentSnapshotGeneratedAt: 2026-08-31T00:00:00+08:00`；该时间不能区分同日多次刷新后的不同内容。
- 当前 scorer 与 snapshot 已在 pedagogy FINAL3 之后继续修改。因此，各 final 中的 `0 MAJOR`、`BLOCKER` 或 `RESOLVED` 数字不能被机器证明属于同一个内容版本，也没有一个聚合 gate 拒绝混用这些版本。

**Impact**

当前 `pending_review` 隔离不能替代审查可追溯性。只要 review artifact 没有和 exact snapshot/source registry 做不可变绑定，就无法从现有 final 文件推出当前工作树已通过科学、证据或教学激活门槛；任何激活决定都可能使用过期结论。

**Required action / closure evidence**

1. 在 snapshot 生成阶段产生 canonical whole-snapshot hash、claims hash 和 source-registry hash。
2. 每个独立审查 Markdown/JSON 必须记录这三个值；聚合 gate 在任一值不一致时直接 `FAIL_STALE_REVIEW`。
3. 对当前 hash 重新生成 scientific 与 pedagogy final，明确覆盖本轮新增来源与 scorer 版本；不得把窄范围 final 的“remaining 0”解释成全库 0。
4. 在完成前继续保持所有候选 `pending_review`，禁止激活或写入标准化能力。

## MAJOR

### R4-M01 — scientific packet 的高风险路由遗漏 54 条 formal claim

**Evidence**

- `scripts/scientific-audit.mjs:27-28` 先取得 HIGH-risk manifest 的 `guideSectionId`，再只保留 `claim.contentId` 直接等于 guide ID 的 claim。
- 当前数据中有 182 个 HIGH-risk guide；该算法报告 182 条 high-risk claim，全部是 guide claim。
- concept/method claim 的 `contentId` 是 formal lesson ID，并通过 lesson 的 `guideSectionId` / `guideSectionIds` 间接关联 manifest。按该关系计算，另有 **54** 条 formal claim 属于 HIGH-risk guide，但没有进入 `highRiskClaims`。
- 可复现实例包括 `staged-concept-statistical-unit`、`staged-concept-biological-technical-replicate`、`staged-concept-pseudoreplication`、`staged-concept-confounding`、`staged-concept-confidence-interval`、`staged-concept-p-value`、`staged-concept-multiple-testing-fdr`。这些正是需优先审查的高风险主题。
- `M019_CURRICULUM_SCIENTIFIC_REVIEW.md` 因而把“High-risk claim records routed for review: 182”呈现为完整路由，实际至少应包含当前 182 条 guide claim 加上述 54 条 formal claim。

**Impact**

packet 的 `PASS` 不代表高风险 claim 路由完整；审查者若只消费 `highRiskClaims` 会系统性漏掉 formal concept/method 的高风险主张。

**Required action / closure evidence**

- 建立 `contentId -> guideSectionIds` 的显式索引，对 guide、concept、method（以及如适用的 case）统一传播 scientific risk；不要比较异构 ID。
- 新增测试断言：每条与 HIGH guide 关联的 claim 必须恰好进入 high-risk review 集合；测试中至少固定上述 54 条当前漏项的计数或完整 ID 集。
- packet 必须分别报告 high-risk guide claims 与 formal claims，并在遗漏时 `FAIL`。

### R4-M02 — `GSEA` 正则吞并 `GSVA/ssGSEA`，给样本级打分 claim 添加两条错误方法来源

**Evidence**

- `src/data/self-rescue-guide/build.ts:148` 的 `/GSEA/i` 位于 `:150-151` 的 `/GSVA|ssGSEA/i`、`/ssGSEA/i` 之前；`sourceIdsFor` 对所有命中做 `flatMap`，不是互斥匹配。
- 字符串 `ssGSEA` 包含 `GSEA`，所以当前 `guide-v1-m06-t21`（GSVA and ssGSEA）被映射为 `src-gsea, src-camera, src-gsva, src-ssgsea`。
- 对应 claim “产生样本级相对基因集分数以描述表达模式；分数不是通路活性或因果机制的直接测量。”也带有同样四条来源。
- `src-gsea` 是 ranked-list GSEA；`src-camera` 是考虑基因相关性的 competitive gene-set test；它们不是 GSVA/ssGSEA 的样本级评分方法来源。当前真正直接对应的来源是 `src-gsva` 与 `src-ssgsea`。

**Impact**

来源数量看似增加，但 provenance 被错误方法论文稀释；claim-level 审查可能把不相关 citation 误判为独立支持。这类 substring collision 也会污染后续任何包含 `GSEA` 子串的方法名。

**Required action / closure evidence**

- 优先使用 exact title mapping，或把 `GSEA` 改为有边界且排除 `ssGSEA` 的模式；方法映射应互斥并显式区分 GSEA、CAMERA、GSVA、ssGSEA。
- 新增映射测试：`GSVA and ssGSEA` 只得到 `src-gsva`、`src-ssgsea`；单独 GSEA 才得到 `src-gsea`，CAMERA 仅在 claim 实际涉及 competitive/correlation-aware testing 时加入。
- 刷新 snapshot 后对受影响 guide 与 claim 重新做 source-level review。

### R4-M03 — 修复后的评分器仍可用无关套话和 criterion 四字片段确定性伪通过

**Evidence**

- `src/services/stagedAssessment.ts:39-40` 只要求 reasoning 含一个预置 marker；`:46-50` 的 change-mind 只需命中任一 criterion 的任意连续四个规范化字符、匹配反事实正则并出现动作词。
- 对当前 `staged-concept-research-question-apply-v1`，选择全部 expected options，为每个 option 引用其允许行的真实全文，但两个 reasoning 都写同一无关句：`这是无关套话，因此若结果改变也不解释事实与决定的关系。`
- change-mind 只写：`如果问题中的不成立，我会撤回。`，其中“问题中的”只是 criterion 的四字窗口，并没有给出可检验反证事实。
- 直接调用当前 `evaluateStagedAssessment` 返回 `status=passed`、`nextRoute=complete`、`acceptedEvidenceUnits=2`。现有 `tests-node/suite.mjs:2548-2571` 只拒绝“复制完整 option label”和“漏掉一个 option”的反例，没有覆盖此 payload。

**Impact**

新增的 row/fragment/marker schema 仍只证明字符串共现，不能证明回答建立了“事实 -> 决定”的关系或提出了可操作反证。即使当前固定 `createsCompetence=false`，该结果也会误导 pilot 审核，并阻止把 scorer 作为未来 learner-facing gate。

**Required action / closure evidence**

- 在不能可靠语义评分前，把开放 reasoning/change-mind 的自动结果降为 `review_required`，不得自动 `passed`。
- 若保留确定性自动判定，应为每个 option 编码可验证的关系要素（方向、比较、阈值、更新动作），而非一个 marker；change-mind 应要求题目特定的完整反证条件，而非任意四字窗口。
- 将上述 exact payload 加为负例，并跨多种 assessment 验证；关闭前继续固定 `createsCompetence=false`。

### R4-M04 — `nextRoute="remediation"` 只是显示文本，UI 没有执行 remediation 路由或 retry

**Evidence**

- `src/features/curriculum-preview/CurriculumPreviewView.tsx:41-53` 在第一次评分后以 `Boolean(evaluation)` 永久禁用 fieldset 和按钮。
- 同一组件仅打印 `nextRoute={evaluation.nextRoute}`；没有用该值选择/展开 lesson.remediation、切换当前 asset、重置本地回答，或触发任何 route/state transition。
- service 测试 `tests-node/suite.mjs:2558-2561` 只断言返回字符串等于 `remediation`。没有 component/E2E 测试证明 critical error 后实际进入新的 remediation asset。

**Impact**

当前界面把“路由成功”和“返回了一个枚举值”混为一谈。critical error 后用户被锁在原 asset，只能手工寻找另一个 `<details>`；retry 同样不可执行。任何报告中“错误进入 remediation 分支”的端到端表述都缺少实现证据。

**Required action / closure evidence**

- 二选一：实现本地 preview workflow，消费 `nextRoute` 并切换到对应 fresh asset/允许 retry；或把字段重命名为 `recommendedNextRoute` 并明确标注“display-only，无路由”。
- 增加组件/E2E 测试：提交 critical option 后，remediation asset 被实际选中/聚焦且 primary 不可重放；partial 后可进入一次新的 retry；全过程仍不得写 learner state。

## MINOR

### R4-m01 — scientific audit 把 active 数写成常量，而不是报告实际状态

**Evidence**

- `scripts/scientific-audit.mjs:58` 在 `policy` 中硬编码 `activeGeneratedItems: 0`。
- audit 的 `invalidLifecycle` 会让非 pending 内容报错，但 JSON 中这个字段本身不会随 inventory 改变；未来出现 active item 时，artifact 可同时显示 `status=FAIL` 与 `activeGeneratedItems=0`，造成自相矛盾。

**Impact**

该字段不能作为 pending 隔离的可审计计数，容易被下游误当成从 inventory 得出的事实。

**Required action / closure evidence**

- 若表达政策，将字段改名为 `requiredActiveGeneratedItems: 0`；若表达现状，则从 inventory 派生 `counts.activeGeneratedItems`。
- 新增一个含 active fixture 的负例，断言实际计数、FAIL 状态和错误列表一致。

## Activation disposition

当前工作树必须继续保持 `pending_review`。在 R4-B01 关闭前，任何 final review 的 severity 汇总都不能作为当前 snapshot 的激活证明；R4-M01 至 R4-M04 关闭前，高风险审查 packet 与评分/路由模拟也不能升级为正式 learner-facing 能力判定。
