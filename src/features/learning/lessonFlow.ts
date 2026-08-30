import type { LearnerUnitStateV1, LearningUnitV1, PracticeRole } from "../../domain/learningKernel";

export type LessonStepKind = "instruction" | "prediction" | "worked" | "self_check" | "guided" | "independent" | "review" | "far_transfer" | "complete";
export interface LessonStep { id: string; kind: LessonStepKind; titleCn: string; role?: PracticeRole; blockKinds?: LearningUnitV1["blocks"][number]["kind"][]; }

export const coreLessonSteps: LessonStep[] = [
  { id: "why", kind: "instruction", titleCn: "为什么重要", blockKinds: ["why_important"] },
  { id: "intuition", kind: "instruction", titleCn: "建立直觉", blockKinds: ["intuition"] },
  { id: "predict", kind: "prediction", titleCn: "先做预测", role: "prediction" },
  { id: "explain", kind: "instruction", titleCn: "精确解释", blockKinds: ["precise_definition", "mechanism"] },
  { id: "worked", kind: "worked", titleCn: "逐步例题", role: "worked", blockKinds: ["worked_example"] },
  { id: "misconception", kind: "instruction", titleCn: "误区对照", blockKinds: ["misconception", "claim_boundary", "reviewer_view", "self_check"] },
  { id: "self-check", kind: "self_check", titleCn: "真实自检", role: "self_check" },
  { id: "guided", kind: "guided", titleCn: "带提示练习", role: "guided" },
  { id: "independent", kind: "independent", titleCn: "独立判断", role: "independent" },
];

export function stepsForLearner(state?: LearnerUnitStateV1, holdFeedbackFor?: PracticeRole): LessonStep[] {
  if (holdFeedbackFor === "independent") return coreLessonSteps;
  if (holdFeedbackFor === "review") return [{ id: "review", kind: "review", titleCn: "延迟陌生变式", role: "review" }];
  if (holdFeedbackFor === "far_transfer") return [{ id: "far-transfer", kind: "far_transfer", titleCn: "真实迁移", role: "far_transfer" }];
  if (!state || ["learning", "guided", "independent_ready", "unseen"].includes(state.stage)) return coreLessonSteps;
  if (state.stage === "review_eligible") return [{ id: "review", kind: "review", titleCn: "延迟陌生变式", role: "review" }];
  if (state.stage === "consolidating") return [{ id: "far-transfer", kind: "far_transfer", titleCn: "真实迁移", role: "far_transfer" }];
  return [{ id: "complete", kind: "complete", titleCn: "迁移已证明" }];
}

export function defaultStepForStage(state?: LearnerUnitStateV1): string {
  if (!state || state.stage === "learning") return "why";
  if (state.stage === "unseen") return state.selectedMode === "challenge" ? "independent" : "why";
  if (state.stage === "guided") return "guided";
  if (state.stage === "independent_ready") return "independent";
  if (state.stage === "review_eligible") return "review";
  if (state.stage === "consolidating") return "far-transfer";
  return "complete";
}
