# M020.1 Final Validation

验收日期：2026-09-23。结论：**PASS after minimal regression fixes**。

- 分支：`codex/m020.1-canonical-mapping-completion`
- 原目标提交：`4b94a5b17561c2569d975c19a624cafc07adfa3d`
- 比较基线：`4aca045cb5e4e211e1b1c31cf2d60910fa917ea0`
- 验收版本：包含本报告的修复提交；父提交为上述原目标提交。

原目标提交不能直接判为通过：首次 typecheck/full suite 在构建阶段失败；独立基线重载测试另发现迁移回归。以下 PASS 均指最小修复后的版本。

## 必需检查

| 检查 | 最终结果 |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS，204/204；0 failed、0 skipped |
| 独立 DOM 工作流（包含在 npm test） | PASS，1/1 |
| knowledge-schema audit | PASS，0 errors |
| knowledge-dependency audit | PASS，0 errors |
| supersession audit | PASS，0 errors |
| freshness audit | PASS，0 errors |
| learning-binding audit | PASS，0 errors |
| update-impact audit | PASS，0 errors |
| activation-safety audit | PASS，0 errors |
| `npm run audit:privacy` | PASS，4/4 |
| `git diff --check`、基线到最终版本的 diff check | PASS |
| `node scripts/validate-agent-handoff.mjs` | PASS |

七项审计还通过 `node scripts/run-knowledge-audit.mjs <group>` 逐项独立执行。Full suite 同时通过 M018 registry audit（297 entries / 9 assets）、localization（11 checks）和生产 bundle startup smoke。

## Canonical mapping 结果

| 指标 | M020 基线 | M020.1 验收版本 |
| --- | ---: | ---: |
| unresolvedBindings | 327 | **0** |
| KnowledgeUnit | 79 | **406** |
| KnowledgeLearningBinding | 688 | 688 |
| evidence sources | 85 | 85 |
| evidence claims | 375 | 460 |
| dangling bindings | 0 | **0** |

新增 327 个 self-canonical snapshot：229 个 Guide、85 个 legacy Method、13 个 Studio。新增 85 条 claim 为原 Method 正文和显式 source ID 的迁移记录，全部 pending。

逐条验证全部 688 个 binding：每条至少有一个精确 `KnowledgeUnit id + revision + hash`，每个引用都能解析到对应版本。原学习资产的 id/revision/hash、legacyActive 标记全部保持一致；原 79 个 KnowledgeUnit 和 375 条 claim 的 payload 保持一致。

全部新增 snapshot 都为 `verificationStatus=pending`、`lifecycle=pending_review`、`knowledgeStatus=REVIEW_REQUIRED`。**Scientific activation 新增 0；原 activation 标记变更 0。** 映射完成不代表科学审核完成：仍有 13 个 Studio 缺逐主张来源的审计提示，原 Cox 保守维护桥接仍保留审核缺口。

检查映射实现及全部变更：仅使用显式 ID/关系字段和资产自身快照；没有 title similarity、fuzzy、embedding 或语义推断绑定。

## 维护与历史保全

- 对基线中未解析的 `guide-v1-m01-t01` canonical owner 执行 revise，impact 包含该 Guide，生成精确 maintenance hold，`isKnowledgeLearningAllowed` 返回 false。
- 从指定基线 Git 源码独立生成真实 M020 工作区，验证 79 units / 327 unresolved；与兼容迁移使用的基线完整 deep-equal。基线指纹固定为 `sha256:0b5592e092ebb6a95c5e78896855a8f116287c258dcbd33709ec134f973a4c5b`，加入回归测试。
- 真实基线工作区迁移后达到 0 unresolved；重复重载幂等，不修改输入对象。
- 使用基线 service 真正执行一次 evidence update，再由新版重载：旧 candidates、来源版本及已有 ledger/holds 保留；新增关联 Guide 获得维护 hold。
- 新增回归测试验证 learning events、review logs、assessment history 和其他既有状态保持一致；历史 learning records 不补写当前知识绑定。旧版既有字段标准化行为未变。
- 篡改基线绑定、丢失更新 ledger/holds、新版空绑定仍拒绝；没有放宽正常运行时审计。旧空绑定只在精确匹配已知 M020 基线的受限迁移过程中读取，最终工作区必须通过严格审计。

## M019 科学边界

**未修改 M019 Guide / Lesson / assessment / Case 科学正文、答案、评分规则或原始内容数据文件。** 基线到验收版本的 `src` / `data` 变更仅为 canonical seed/adapter/service 和状态迁移四个文件；Learning Kernel 与原课程/评估语料无 diff。全部 688 条原资产 revision/hash 不变也提供了运行时交叉证据。

未新增 generated/migrated scientific activation；未重写历史 learning records。未进行科学内容扩写、课程修订、批量激活或后续里程碑开发。

## 仅修复本次引入的回归

1. `adaptLegacyMethodConcept` 直接将更宽的 `ContentOrigin` 传入 `KnowledgeOrigin`，产生 TS2322；改用既有 `origin()` 归一化。
2. 新 seed 与严格空绑定校验使已保存的 M020 workspace 无法重载。增加精确基线识别、先验证旧历史再补齐映射的受限迁移；保存旧科学 payload 和用户历史，追加已有证据更新所需的新增依赖维护记录。
3. 删除原 M020.1 说明文件的一处 Markdown 行尾双空格，使基线 diff whitespace gate 通过。

新增两项针对上述迁移回归的测试。没有新增依赖、界面功能或科学激活流程。

## 交付与 workspace

- 本报告、最小修复和审计结果提交到指定分支，并推送同名远端分支。
- Workspace clean：**是**，提交后 `git status --porcelain` 为空；本地与远端分支一致。
- 测试引起的 localization 时间戳变化已恢复；忽略目录中的构建产物与本地日志不纳入提交。
- 机器结果：`artifacts/m020/knowledge-audit.json`、`artifacts/m020/m020-1-validation.json`。
- 本次为代码、自动化测试和后台 DOM 验收，未声称完成打包应用或人工视觉验收。完成后停止。
