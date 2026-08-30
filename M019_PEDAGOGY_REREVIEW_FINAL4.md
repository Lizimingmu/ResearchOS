# M019 极窄 FINAL4 教学差异复核

- review_mode: `TRUE_INDEPENDENT_REVIEW`
- review_scope: 仅验证 `M019_PEDAGOGY_REREVIEW_FINAL3.md` 的 B-02 与 M-01
- current_snapshot: `artifacts/curriculum-content-snapshot.json`
- excluded: B-01、M-03 未重新评估
- current_state: `pending_review`

## 最终判定

| ID | FINAL4 状态 | 是否关闭 | 当前影响 |
|---|---|---|---|
| B-02 · 可执行评分 | **PARTIALLY_RESOLVED** | **否** | FINAL3 的整段复制伪通过已关闭，但通用 reasoning marker 仍可被机械塞入而通过；继续阻止该评分产生标准化能力 |
| M-01 · 三种测量表征 | **RESOLVED** | **是（确定性结构门槛）** | 183/183 assessment 已有与 format 匹配的 4 行语义 schema；不再只是旋转 format 字符串 |

## B-02 复核：PARTIALLY_RESOLVED

### 已验证关闭的 FINAL3 反例

当前实现已具备以下约束：

- `evidenceExpectations` 按正确 option 定义；全库 183 个 assessment 共 549 条 expectation。
- 183/183 assessment 的 expectation 数量与 `expectedOptionIds` 数量相等，`minimumEvidenceUnits` 也与正确 option 数量相等。
- 每个正确 option 都有且只有一个独立 `allowedRowId`；同一 assessment 不复用材料行支持多个正确项。
- 每条 expectation 的 `requiredFactFragmentsCn` 都真实存在于其允许的材料行；全库未发现无效引用。
- 每个正确 option 必须分别出现在 accepted evidence 中，不能只用其他 option 的多条证据凑总数。
- reasoning 必须包含配置的 marker，且整段复制正确 option label 会被拒绝。
- change-mind 同时要求：命中题目 criterion、出现反证句式、包含更新动作 marker。
- UI 使用 `O1/O2/...` 显示和输入选项，不再把 raw `expectedOptionId` 放入 placeholder。

本轮按 FINAL3 原反例重放 Confidence Interval Apply：

1. 选择全部 expected options；
2. 使用各自允许的不同材料行和真实事实片段；
3. reasoning 写“复述选项但未建立证据关系：”并整段复制对应正确 label；
4. change-mind 只直接复制 criterion。

当前结果为 `status=partial`、`nextRoute=retry`、`acceptedEvidenceUnits=0`，不再是 FINAL3 的 `passed/complete`。原复制伪通过已经确定性关闭。

change-mind 的分步复核也符合预期：

- 仅复制 criterion：`partial/retry`。
- 有反证句式但没有更新动作：`partial/retry`。
- criterion＋反证句式＋“撤回并重新判断”：可通过 change-mind 门槛。

### 尚未关闭的新反例

`reasoningMarkersCn` 当前大多是通用衔接词，而不是 option-specific 推理关系。549 条 expectation 只使用 15 种 marker；其中：

- “若”出现 223 次；
- “因此”“所以”“需要”“否则”“不满足”各出现 183 次；
- “只能”“限于”各出现 122 次。

本轮使用合法的独立 row、合法 option ID、合法事实片段，但 reasoning 只写：

> 这里只放入标记词「因此/若」，没有说明事实和决定的关系。

再提供合格的 change-mind 后，Confidence Interval Apply 仍返回 `status=passed`、`acceptedEvidenceUnits=2`、`nextRoute=complete`。也就是说，评分器确认了“引用了正确事实”和“出现了通用连接词”，但没有确认事实如何支持该 option。

因此 B-02 有实质进步但尚未关闭。若继续固定 `createsCompetence=false`，它可安全用于候选审核模拟；它仍不能产生标准化能力证据。

### B-02 最小关闭标准

1. 把通用 discourse markers 与 option-specific reasoning requirements 分开；每个 expectation 至少配置一个构念特异的关系/推断片段。
2. 评分必须验证“事实片段＋关系＋目标决定”组合，而不是三者分别出现即可。
3. 新增负例：合法 row、合法事实片段、正确 option、但 reasoning 仅包含通用 marker；该输入不得 `passed`。
4. 保持已经关闭的门槛：每个正确 option 独立证据、拒绝整段 label 复制、change-mind 的反证＋更新动作、O1 编号和 no-competence。

## M-01 复核：RESOLVED

### 全库结构检查

当前 61 课、183 个 assessment 的结果为：

- `case_table`：61 个；全部 4 行、3 列，行 ID 为 `C1–C4`。
- `evidence_matrix`：61 个；全部 4 行、4 列，行 ID 为 `E1–E4`。
- `decision_timeline`：61 个；全部 4 行、3 列，行 ID 为 `T0–T3`。
- format schema 违反数：0/183。
- 61/61 课的 Apply/remediation/review 三种 format 均互不相同。

三种格式不再只靠 `format` 字段命名：

- `case_table` 使用“病例/样本记录—可比较观察—处理/判读状态”，C1–C4 分别承载目标记录、近似行动、合格判别点和最大报告范围。
- `evidence_matrix` 使用“证据事实—支持/反驳对象—对结论/决定的约束”，E1–E4 分别承载待判断事实、近似行动、核心判别点和最大主张。
- `decision_timeline` 使用“时点—新增证据/结果—冻结决定或更新”，T0–T3 分别承载初始判断、当前行动、新证据检查和前提失败后的更新。

这直接关闭了 FINAL3 指出的“CI/Differential/PCA 标成 decision_timeline，但仍只有输入—结果—诊断三行”的问题。当前这些资产已采用 T0–T3 的时序决定结构；其他两种格式也已按各自 schema 物化为四行。

### M-01 边界

本判定只表示 **确定性的 format 语义结构门槛已关闭**。目标学习者是否真的把 delayed review 当作迁移、三种操作是否具有足够心理测量区分度，仍需 human pilot；但这不是 FINAL3 所列“仅旋转标签”的残余问题，故不继续把 M-01 记为机器可见的 MAJOR。

## 安全与激活含义

- 保持 `pending_review`、审核模拟 `createsCompetence=false`：安全。
- M-01 不再构成确定性结构阻断。
- B-02 仍未关闭；当前评分结果不得写入标准化能力。
- B-01、M-03 按要求未重评，本报告不改变它们此前的状态。

## FINAL4 结论

**B-02 PARTIALLY_RESOLVED；M-01 RESOLVED。旧的 option-label/criterion 复制伪通过已关闭，全库三种 format 的四行语义 schema 已通过；但仅塞入通用 reasoning marker 仍能伪通过，因此标准化评分阻断仍在。**
