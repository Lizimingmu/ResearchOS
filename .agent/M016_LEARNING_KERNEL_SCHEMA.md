# M016 — Learning Kernel Schema v1

本文件是实现合同，不是要求逐字照抄的代码。字段可在实现中拆文件，但语义、枚举、默认值和不变量不得改变。

## 🧱 内容对象

```ts
type LearningStage =
  | "unseen"
  | "learning"
  | "guided"
  | "independent_ready"
  | "review_eligible"
  | "consolidating"
  | "transferable";

type DisclosureLayer = "understand" | "explain" | "judge";
type LearningMode = "learning" | "challenge";
type VerificationStatus = "verified" | "pending" | "rejected" | "not_required";

interface LearningBlockV1 {
  id: string;
  kind:
    | "why_important"
    | "intuition"
    | "precise_definition"
    | "mechanism"
    | "worked_example"
    | "misconception"
    | "self_check"
    | "claim_boundary"
    | "reviewer_view";
  layer: DisclosureLayer;
  titleCn: string;
  bodyCn: string;
  terms?: Array<{ zh: string; en: string; definitionCn: string }>;
  required: boolean;
  evidenceClaimIds: string[];
}

interface LearningUnitV1 {
  schemaVersion: 1;
  id: string;
  revision: number;
  contentHash: string;
  titleCn: string;
  titleEn: string;
  domain: "medical_research_foundations" | "statistics" | "experimental_design";
  estimatedMinutes: number; // validator: integer 8..12
  curriculumOrder: number;
  projectRelevanceTerms: string[];
  learningObjectives: string[];
  blocks: LearningBlockV1[];
  prerequisiteEdgeIds: string[];
  practiceBindingIds: string[];
  delayedReviewPlan: Array<{ afterDays: number; role: "review" | "far_transfer" }>;
  evidenceSourceIds: string[];
  contentOrigin: "verified_seed" | "verified_external" | "user" | "ai_generated";
  verificationStatus: VerificationStatus;
  scientificRisk: "LOW" | "MEDIUM" | "HIGH";
  lifecycle: "draft" | "pending_review" | "active" | "archived" | "deprecated" | "superseded";
}
```

校验器必须拒绝：缺少 11 段教学职能、8–12 分钟之外、重复 block ID、缺失来源依赖、长篇单 body 代替分块、非 active/verified 内容进入有效 curriculum。原型科学文本在 Codex gate 前可以随代码交付，但必须是 `pending_review` + `pending`，不得自升为 active/verified。

## 🧠 用户状态与事件

```ts
type InstructionExposure = "none" | "partial" | "complete";
type CompetenceLevel =
  | "unassessed"
  | "guided_only"
  | "independent_once"
  | "retained"
  | "transferred";

interface LearnerUnitStateV1 {
  schemaVersion: 1;
  unitId: string;
  unitRevision: number;
  stage: LearningStage;
  instruction: {
    exposure: InstructionExposure;
    completedBlockIds: string[];
    instructionCompletedAt?: string;
  };
  competence: {
    level: CompetenceLevel;
    evidenceEventIds: string[];
    lastDemonstratedAt?: string;
  };
  selectedMode?: LearningMode;
  activeThreadStartedAt?: string;
  dueAt?: string;
  misconceptionIds: string[];
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface LearningEventV1 {
  schemaVersion: 1;
  id: string;
  unitId: string;
  unitRevision: number;
  unitHash: string;
  type:
    | "instruction_block_completed"
    | "self_check_attempt"
    | "guided_attempt"
    | "independent_attempt"
    | "challenge_attempt"
    | "retrieval_attempt"
    | "variant_attempt"
    | "far_transfer_attempt";
  mode: LearningMode;
  occurredAt: string;
  asset?: { bindingId: string; kind: PracticeAssetKind; id: string; revision: number; hash: string };
  outcome?: "pass" | "fail" | "incomplete";
  score?: number;
  confidence?: 1 | 2 | 3 | 4;
  hintsUsed: string[];
  competenceEligible: boolean;
  resultingStage: LearningStage;
}
```

`instructionCompletedAt` 只能由完成全部 required instruction blocks 的 reducer 写入。Challenge event 的 `competenceEligible` 可以为 true，但禁止写 instruction 字段。所有 state 变化必须由纯 transition function 从 event 归约，不能由 UI 任意设置 stage。

## 🔗 先修关系与资产绑定

```ts
interface PrerequisiteEdgeV1 {
  schemaVersion: 1;
  id: string;
  fromUnitId: string;
  toUnitId: string;
  required: boolean;
  startGate: "instruction_complete_or_independent_evidence";
  independentGate: "independent_once";
  rationaleCn: string;
}

type PracticeAssetKind =
  | "method_concept"
  | "judgment_card"
  | "problem_card"
  | "audit_case"
  | "paper_task"
  | "project_case";

type PracticeRole = "worked" | "guided" | "independent" | "review" | "far_transfer";

interface PracticeAssetBindingV1 {
  schemaVersion: 1;
  id: string;
  unitId: string;
  assetKind: PracticeAssetKind;
  assetId: string;
  assetRevision: number;
  assetHash: string;
  role: PracticeRole;
  order: number;
  hintPolicy: "none" | "tiered" | "solution_visible";
  feedbackPolicy: "immediate" | "after_lock" | "after_submission";
  lockRequired: boolean;
  confidenceRequired: boolean;
  competenceEligible: boolean;
  minStage: LearningStage;
}
```

先修图必须是 DAG；未知节点、自环、循环和重复边均由确定性审计拒绝。Binding 必须引用存在且有效的资产 revision/hash。角色约束：`worked` 必须 solution visible 且不计能力；`guided` 必须 tiered hint 且不计独立能力；`independent/review/far_transfer` 必须 lock + confidence，且无 hint 才可计能力。

## 🗓️ Today 输出

```ts
type LearningActivityType =
  | "explanation"
  | "worked_example"
  | "self_check"
  | "guided_practice"
  | "independent_case"
  | "delayed_retrieval"
  | "variant_retrieval"
  | "spaced_retrieval"
  | "paper_transfer"
  | "ai_audit_transfer"
  | "project_transfer"
  | "far_transfer";

interface TodayLearningTaskV1 {
  id: string;
  unitId: string;
  unitRevision: number;
  stageAtScheduling: LearningStage;
  activityType: LearningActivityType;
  bindingId?: string;
  estimatedMinutes: number;
  priority: number;
  prioritySignals: {
    dueRisk: number;
    activeThreadContinuity: number;
    misconceptionRisk: number;
    prerequisiteUnlockValue: number;
    projectRelevance: number;
  };
  rationaleCn: string;
}
```

`stageAtScheduling` 和 rationale 是审计字段。生成器不得把旧 `DailyTask.type` 直接当成合法活动；实现期可扩展或替换 `DailyTask`，但必须保证旧持久化任务 ID 不会导致崩溃。

## 🗺️ Skill Map 投影

```ts
interface SkillMapProjectionV1 {
  unitId: string;
  learningProgress: {
    exposure: InstructionExposure;
    completedRequired: number;
    totalRequired: number;
  };
  demonstratedCompetence: {
    level: CompetenceLevel;
    evidenceCount: number;
    lastDemonstratedAt?: string;
  };
  labelCn: string; // e.g. “教学完成 · 能力尚未评估”
}
```

禁止将两轴压成单一百分比或单一 mastery badge。旧 `SkillEvidence` 可以作为历史证据显示，但迁移时不能据此伪造某个新 Unit 的 instruction completion。
