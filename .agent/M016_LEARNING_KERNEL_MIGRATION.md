# M016 — Backward-compatible Migration Plan

## 🧭 版本策略

- 前端 `CURRENT_STATE_SCHEMA`: `4 → 5`。
- SQLite `PRAGMA user_version`: 保持 `2`，因为现有数据库仍保存同一 JSON payload；只有 Rust 表结构变化时才升级 SQLite user version。
- 新增集合：`learnerUnitStates`、`learningEvents`；可选新增 `pausedLearningUnitIds`。
- LearningUnit、PrerequisiteEdge 和 PracticeAssetBinding 第一阶段作为内置版本化内容加载，不复制进每个用户 payload。

## 🔄 v4 → v5 迁移

迁移是确定性、幂等、仅追加默认字段：

```ts
learnerUnitStates: []
learningEvents: []
pausedLearningUnitIds: []
onboarding: {
  ...oldOnboarding,
  learningKernelOnboardingCompletedAt: undefined,
  learningKernelOnboardingSkippedAt: undefined
}
```

必须原样保留所有 v4 数据：papers、projects、responses、reviewItems、reviewLogs、skillEvidence、assessmentHistory、misconceptions、Problem Atlas、Personal Content Studio、Obsidian 设置/批次和旧 onboarding/tutorial 时间。

## 🚫 禁止推断

迁移不得根据以下旧字段自动创建 LearningUnit 进度或能力：

- `completedTaskIds` / `snoozedTaskIds`
- `onboarding.completed` / `baselineCompleted` / tutorial timestamps
- Method 页面浏览或旧教程完成
- 一般 `skillEvidence`、assessment 分数或 review log
- ProblemCard/AI Audit/Paper 的完成状态

原因：这些记录缺少当前 unit revision、教学 exposure、练习角色和 rubric 语义。默认 `[]` 表示“尚未进入新学习内核”，不是能力为零。

允许的唯一兼容展示：旧 SkillEvidence 可在 Skill Map 的“历史证据”区域显示，并标记“未映射到 Learning Unit v1”；它不能改变新 unit stage。

## 👋 Onboarding 兼容

现有用户不应被强制弹出新 onboarding：

- 全新状态：直接进入 5 分钟 Statistical Unit onboarding。
- v4 已完成旧 onboarding：显示一次非阻塞入口卡“新的学习路径已上线”，用户主动点击后开始；不自动打开全屏面板。
- 用户跳过新 onboarding：记录独立时间戳，不创建 instruction/competence event；Today 仍可推荐 `unseen` 的 explanation。
- 用户完成：实际产生 Statistical Unit 的 block/event/state；不是只写 onboarding 完成布尔值。

## 🧯 回滚与未来版本

- 保持现有 future-schema fail-closed 行为；v6 数据不能被 v5 静默覆盖。
- v5 写入前后必须通过 SQLite backup round-trip 和 JSON migration tests。
- v4 fixture 迁移一次和再次打开结果字节语义等价，不能重复 seed event。
- 旧 v0.12.0 应用可能不理解 v5；发布说明必须明确升级前备份。不得宣传无损降级。
- 若 hydration 失败，沿用有界启动恢复，不重置用户数据库。

## ✅ 迁移验收

1. v4 fixture 的每个旧集合逐项保留。
2. 新集合为空，未伪造教学或能力状态。
3. v5 fixture 重开不重复创建任何 state/event。
4. onboarding 跳过零学习写入；完成会产生可追溯 block events。
5. Challenge pass 迁移/重开后仍无 instruction completion。
6. schema 5 的备份导出/恢复保持 LearningEvent revision/hash。
7. schema 6 fixture 被拒绝且数据库未修改。
