import type { LearningEventV1 } from "../domain/learningKernel";
import type { KnowledgeWorkspace } from "../domain/knowledge";
import { createKnowledgeLearningGate, resolveHistoricalKnowledgeBinding } from "./knowledge";

/** An outer maintenance gate; it does not change Learning Kernel scoring or stages. */
export function assertKnowledgeLearningAllowed(workspace: KnowledgeWorkspace, ...assetIds: Array<string | undefined>): void {
  const allowed = createKnowledgeLearningGate(workspace);
  if (assetIds.some((id) => id && !allowed(id))) {
    throw new Error("相关知识已更新或待审核，此内容暂停正式学习与能力计分。请到内容工作台的知识维护查看影响；原学习记录保留。");
  }
}

export function bindKnowledgeToLearningEvent(workspace: KnowledgeWorkspace, event: LearningEventV1): LearningEventV1 {
  const asset = event.asset;
  const resolved = resolveHistoricalKnowledgeBinding(workspace, asset?.id ?? event.unitId, asset?.revision ?? event.unitRevision, asset?.hash ?? event.unitHash);
  return { ...event, knowledgeBindingStatus: resolved.status,
    knowledgeUnitIds: [...new Set(resolved.bindings.map((binding) => binding.knowledgeUnitId))],
    knowledgeRevisionBindings: structuredClone(resolved.bindings) };
}
