import type {
  DiagnosticCause,
  DiagnosticEvidence,
  DiagnosticModeId,
  DiagnosticPath,
  DiagnosticPathNode,
  DiagnosticSession,
  DiagnosticSessionStep,
  FailureLayer,
  GradeResult,
  ProblemCard,
  ProblemTrainingCase,
  SessionJudgmentInput,
  SessionStepKind,
} from "../domain/problemAtlas";

export const DIAGNOSTIC_MODES: DiagnosticModeId[] = [
  "quick",
  "differential",
  "sequential",
  "missing-info",
  "error-localization",
  "claim-boundary",
  "reviewer",
  "ai-verdict",
];

export const FAILURE_LAYERS: FailureLayer[] = ["sample", "experiment", "quantification", "statistics", "interpretation"];

export const VERDICTS = ["reasonable", "needs-check", "wrong"] as const;
export type AiVerdict = (typeof VERDICTS)[number];

export function createDiagnosticSession(taskId: string, problemId: string, mode: DiagnosticModeId, now = new Date()): DiagnosticSession {
  const timestamp = now.toISOString();
  return {
    id: taskId,
    taskId,
    problemId,
    mode,
    startedAt: timestamp,
    updatedAt: timestamp,
    steps: [],
  };
}

const MODE_KINDS: Record<DiagnosticModeId, SessionStepKind[]> = {
  quick: ["layer"],
  differential: ["ranking"],
  sequential: ["ranking", "reveal"],
  "missing-info": ["missing-info"],
  "error-localization": ["layer"],
  "claim-boundary": ["boundary"],
  reviewer: ["reviewer"],
  "ai-verdict": ["ai-verdict"],
};

const FAILURE_LAYER_VALUES: FailureLayer[] = ["sample", "experiment", "quantification", "statistics", "interpretation"];

function validateSequentialOrder(session: DiagnosticSession, input: SessionJudgmentInput): string | undefined {
  const previous = session.steps.filter((step) => step.kind === "ranking" || step.kind === "reveal");
  if (input.kind === "ranking") {
    if (previous.length === 0) {
      if (input.payload.baseline !== true) return "序贯排查必须先锁定证据揭示前的基线原因排序（baseline）。";
      return undefined;
    }
    const last = previous[previous.length - 1];
    if (last.kind !== "reveal") return "揭示证据后必须先锁定更新后的原因排序。";
    if (input.payload.baseline === true) return "基线排序只能作为第一步锁定。";
    const nodeId = asString(input.payload.nodeId);
    if (nodeId.length === 0) return "更新后的排序必须关联刚揭示的路径节点（nodeId）。";
    const revealedNodeId = asString(last.payload.nodeId);
    if (revealedNodeId.length > 0 && nodeId !== revealedNodeId) return `排序节点（${nodeId}）与刚揭示的节点（${revealedNodeId}）不一致。`;
    const alreadyRanked = session.steps.some((step) => step.kind === "ranking" && step.payload.baseline !== true && asString(step.payload.nodeId) === nodeId);
    if (alreadyRanked) return `节点 ${nodeId} 的更新排序已经锁定，不能重复提交。`;
    return undefined;
  }
  if (previous.length === 0) return "序贯排查必须先锁定基线原因排序，再揭示证据。";
  if (previous[previous.length - 1].kind !== "ranking") return "每步只能揭示一条尚未揭示的路径节点证据。";
  const nodeId = asString(input.payload.nodeId);
  if (nodeId.length === 0) return "揭示步骤必须携带路径节点 nodeId。";
  if (session.steps.some((step) => step.kind === "reveal" && asString(step.payload.nodeId) === nodeId)) {
    return `节点 ${nodeId} 的证据已经揭示，不能重复。`;
  }
  return undefined;
}

function validateSequentialPath(session: DiagnosticSession, input: SessionJudgmentInput, path: DiagnosticPath): string | undefined {
  if (input.kind === "ranking") {
    if (input.payload.baseline === true) return undefined;
    const nodeId = asString(input.payload.nodeId);
    if (!path.nodes.some((node) => node.id === nodeId)) return `未知路径节点（${nodeId}）：排序必须对应路径中的真实节点。`;
    return undefined;
  }
  const nodeId = asString(input.payload.nodeId);
  const node = path.nodes.find((entry) => entry.id === nodeId);
  if (!node) return `未知路径节点（${nodeId}）：只能按顺序揭示路径中的真实节点。`;
  const revealedIds = session.steps.filter((step) => step.kind === "reveal").map((step) => asString(step.payload.nodeId));
  const nextUnrevealed = path.nodes.find((entry) => !revealedIds.includes(entry.id));
  if (!nextUnrevealed || nodeId !== nextUnrevealed.id) return `只能揭示下一条尚未揭示的路径节点（${nextUnrevealed?.id ?? "路径已走完"}），不能乱序或重复。`;
  const evidenceIds = asStringArray(input.payload.evidenceIds);
  if (new Set(evidenceIds).size !== evidenceIds.length) return "揭示的证据 ID 不能重复。";
  for (const evidenceId of evidenceIds) {
    if (!node.availableEvidenceIds.includes(evidenceId)) return `证据 ${evidenceId} 不属于节点 ${nodeId} 的可用证据，禁止编造。`;
  }
  if (node.availableEvidenceIds.length > 0 && evidenceIds.length === 0) return "揭示步骤必须携带该节点的可用证据。";
  return undefined;
}

export function lockSessionStep(session: DiagnosticSession, input: SessionJudgmentInput, now = new Date(), path?: DiagnosticPath): { session: DiagnosticSession; error?: string } {
  if (session.completedAt) return { session, error: "该会话已完成，判断已锁定。" };
  if (input.mode !== session.mode) return { session, error: `该步骤的 mode（${input.mode}）与会话 mode（${session.mode}）不一致，拒绝提交。` };
  const allowed = MODE_KINDS[session.mode] ?? [];
  if (!allowed.includes(input.kind)) return { session, error: `mode ${session.mode} 不允许 kind ${input.kind}。` };
  if (session.mode === "sequential") {
    const orderError = validateSequentialOrder(session, input);
    if (orderError) return { session, error: orderError };
    if (path) {
      const pathError = validateSequentialPath(session, input, path);
      if (pathError) return { session, error: pathError };
    }
  }
  if (session.mode === "error-localization" && input.kind === "layer") {
    const order = asStringArray(input.payload.order);
    if (order.length !== 5 || new Set(order).size !== 5 || !order.every((layer) => FAILURE_LAYER_VALUES.includes(layer as FailureLayer))) {
      return { session, error: "错误定位必须为五个层级各分配一个唯一排名（1–5）。" };
    }
  }
  if (session.steps.some((step) => step.id === input.stepId && step.kind === input.kind)) {
    return { session, error: "该判断已经锁定，不能重复提交。" };
  }
  const step: DiagnosticSessionStep = {
    id: input.stepId,
    kind: input.kind,
    mode: input.mode,
    lockedAt: now.toISOString(),
    payload: input.payload,
  };
  return {
    session: {
      ...session,
      updatedAt: step.lockedAt,
      steps: [...session.steps, step],
    },
  };
}

export function isStepLocked(session: DiagnosticSession, stepId: string): boolean {
  return session.steps.some((step) => step.id === stepId);
}

export function stepOf(session: DiagnosticSession, stepId: string): DiagnosticSessionStep | undefined {
  return session.steps.find((step) => step.id === stepId);
}

export function nextPathNode(path: DiagnosticPath, session: DiagnosticSession): DiagnosticPathNode | undefined {
  const locked = new Set(session.steps.filter((step) => step.kind === "missing-info" || step.kind === "ranking").map((step) => step.id));
  return path.nodes.find((node) => !locked.has(node.id));
}

export function pathNode(path: DiagnosticPath, nodeId: string): DiagnosticPathNode | undefined {
  return path.nodes.find((node) => node.id === nodeId);
}

export function trainingCaseFor(cases: ProblemTrainingCase[], problemId: string, mode: DiagnosticModeId): ProblemTrainingCase | undefined {
  return cases.find((entry) => entry.problemId === problemId && entry.mode === mode);
}

export function causesFor(causes: DiagnosticCause[], problemId: string): DiagnosticCause[] {
  return causes.filter((cause) => cause.problemId === problemId).sort((a, b) => a.initialRank - b.initialRank);
}

export function evidenceFor(evidence: DiagnosticEvidence[], problemId: string): DiagnosticEvidence[] {
  return evidence.filter((item) => item.problemId === problemId).sort((a, b) => a.sequenceOrder - b.sequenceOrder);
}

const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const asString = (value: unknown): string => (typeof value === "string" ? value : "");

function stepPayload(session: DiagnosticSession, stepId: string): Record<string, unknown> {
  return stepOf(session, stepId)?.payload ?? {};
}

export function gradeQuickDiagnosis(session: DiagnosticSession, trainingCase: ProblemTrainingCase): GradeResult {
  const layer = asString(stepPayload(session, "quick-layer").layer);
  const expected = trainingCase.expected as { correctLayer: FailureLayer; layers: FailureLayer[] };
  const correct = expected.correctLayer;
  if (!layer) return { score: 0, feedback: ["尚未锁定判断。"], completed: false };
  if (layer === correct) return { score: 1, feedback: [...trainingCase.rubric], completed: true };
  const index = FAILURE_LAYERS.indexOf(layer as FailureLayer);
  const expectedIndex = FAILURE_LAYERS.indexOf(correct);
  const adjacent = Math.abs(index - expectedIndex) === 1;
  return { score: adjacent ? 0.5 : 0.25, feedback: [...trainingCase.rubric], completed: true };
}

function kendallAgreement(learner: string[], expected: string[]): number {
  if (expected.length < 2) return learner[0] === expected[0] ? 1 : 0;
  const position = new Map(expected.map((id, index) => [id, index]));
  let pairs = 0;
  let agreements = 0;
  for (let i = 0; i < learner.length; i += 1) {
    for (let j = i + 1; j < learner.length; j += 1) {
      const left = position.get(learner[i]);
      const right = position.get(learner[j]);
      if (left === undefined || right === undefined) continue;
      pairs += 1;
      if (left < right) agreements += 1;
    }
  }
  return pairs === 0 ? 0 : agreements / pairs;
}

export function gradeDifferential(session: DiagnosticSession, trainingCase: ProblemTrainingCase): GradeResult {
  const ranked = asStringArray(stepPayload(session, "differential-ranking").rankedCauseIds);
  const expected = trainingCase.expected as { causeOrder: string[] };
  if (ranked.length === 0) return { score: 0, feedback: ["尚未锁定排序。"], completed: false };
  const agreement = kendallAgreement(ranked, expected.causeOrder);
  const coverage = Math.min(1, ranked.length / expected.causeOrder.length);
  return { score: Number((agreement * 0.85 + coverage * 0.15).toFixed(3)), feedback: [...trainingCase.rubric], completed: true };
}

function rankingMatchesEvidence(learner: string[], evidence: DiagnosticEvidence): number {
  const ups = evidence.affectsCauseIds.filter((id) => evidence.direction[id] === "up");
  const downs = evidence.affectsCauseIds.filter((id) => evidence.direction[id] === "down");
  if (ups.length === 0 || downs.length === 0) return 1;
  const position = new Map(learner.map((id, index) => [id, index]));
  let pairs = 0;
  let correctPairs = 0;
  for (const up of ups) {
    for (const down of downs) {
      const upIndex = position.get(up);
      const downIndex = position.get(down);
      if (upIndex === undefined || downIndex === undefined) continue;
      pairs += 1;
      if (upIndex < downIndex) correctPairs += 1;
    }
  }
  return pairs === 0 ? 0 : correctPairs / pairs;
}

export function gradeSequential(session: DiagnosticSession, trainingCase: ProblemTrainingCase, evidence: DiagnosticEvidence[], path: DiagnosticPath): GradeResult {
  const rankingSteps = session.steps.filter((step) => step.kind === "ranking");
  const postRevealRankings = rankingSteps.filter((step) => step.payload.baseline !== true);
  if (postRevealRankings.length === 0) return { score: 0, feedback: ["尚未揭示证据或锁定排序。"], completed: false };
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  let total = 0;
  let earned = 0;
  for (const step of postRevealRankings) {
    const revealed = asStringArray(step.payload.revealedEvidenceIds);
    const ranked = asStringArray(step.payload.rankedCauseIds);
    for (const evidenceId of revealed) {
      const item = evidenceById.get(evidenceId);
      if (!item) continue;
      total += 1;
      earned += rankingMatchesEvidence(ranked, item);
    }
  }
  const revealedNodeIds = new Set(session.steps.filter((step) => step.kind === "reveal").map((step) => asString(step.payload.nodeId)));
  const rankedNodeIds = new Set(postRevealRankings.map((step) => asString(step.payload.nodeId)));
  const nodeIds = new Set(path.nodes.map((node) => node.id));
  const complete = path.nodes.length > 0
    && revealedNodeIds.size === path.nodes.length
    && path.nodes.every((node) => revealedNodeIds.has(node.id))
    && postRevealRankings.every((step) => nodeIds.has(asString(step.payload.nodeId)))
    && path.nodes.every((node) => rankedNodeIds.has(node.id));
  return { score: total === 0 ? 0 : Number((earned / total).toFixed(3)), feedback: [...trainingCase.rubric], completed: complete };
}

export function gradeMissingInfo(session: DiagnosticSession, trainingCase: ProblemTrainingCase, path: DiagnosticPath): GradeResult {
  const answers = session.steps.filter((step) => step.kind === "missing-info");
  if (answers.length === 0) return { score: 0, feedback: ["尚未选择下一步检查。"], completed: false };
  let correct = 0;
  for (const answer of answers) {
    const node = pathNode(path, asString(answer.payload.nodeId));
    if (node && asString(answer.payload.checkId) === node.expectedCheckId) correct += 1;
  }
  const expected = trainingCase.expected as { requiredNodes: number };
  const complete = answers.length >= expected.requiredNodes;
  return { score: Number((correct / answers.length).toFixed(3)), feedback: [...trainingCase.rubric], completed: complete };
}

export function gradeErrorLocalization(session: DiagnosticSession, trainingCase: ProblemTrainingCase): GradeResult {
  const order = asStringArray(stepPayload(session, "localization-order").order);
  const expected = trainingCase.expected as { layerOrder: FailureLayer[] };
  if (order.length === 0) return { score: 0, feedback: ["尚未锁定错误定位。"], completed: false };
  if (order.length !== 5 || new Set(order).size !== 5 || !order.every((layer) => FAILURE_LAYER_VALUES.includes(layer as FailureLayer))) {
    return { score: 0, feedback: ["五个层级必须各获得一个唯一排名（1–5）。"], completed: false };
  }
  const matches = expected.layerOrder.filter((layer, index) => order[index] === layer).length;
  return { score: Number((matches / expected.layerOrder.length).toFixed(3)), feedback: [...trainingCase.rubric], completed: true };
}

export function gradeClaimBoundary(session: DiagnosticSession, trainingCase: ProblemTrainingCase): GradeResult {
  const chosen = asString(stepPayload(session, "boundary-option").optionId);
  const expected = trainingCase.expected as { correctId: string };
  if (!chosen) return { score: 0, feedback: ["尚未选择结论。"], completed: false };
  return { score: chosen === expected.correctId ? 1 : 0, feedback: [...trainingCase.rubric], completed: true };
}

export function gradeReviewer(session: DiagnosticSession, trainingCase: ProblemTrainingCase): GradeResult {
  const causeId = asString(stepPayload(session, "reviewer-verdict").causeId);
  const severity = asString(stepPayload(session, "reviewer-verdict").severity);
  const expected = trainingCase.expected as { correctCauseId: string; correctSeverity: string };
  if (!causeId || !severity) return { score: 0, feedback: ["尚未锁定审稿判断。"], completed: false };
  const causeScore = causeId === expected.correctCauseId ? 0.6 : 0;
  const severityScore = severity === expected.correctSeverity ? 0.4 : 0;
  return { score: causeScore + severityScore, feedback: [...trainingCase.rubric], completed: true };
}

export function gradeAiVerdict(session: DiagnosticSession, trainingCase: ProblemTrainingCase): GradeResult {
  const verdicts = stepPayload(session, "ai-verdicts").verdicts;
  const expected = trainingCase.expected as { expectedVerdicts: Record<string, AiVerdict> };
  const expectedIds = Object.keys(expected.expectedVerdicts ?? {});
  if (!verdicts || typeof verdicts !== "object" || Array.isArray(verdicts)) return { score: 0, feedback: ["尚未锁定审核判断。"], completed: false };
  const entries = Object.entries(verdicts as Record<string, unknown>);
  if (entries.length === 0) return { score: 0, feedback: ["尚未锁定审核判断。"], completed: false };
  const unknownIds = entries.filter(([id]) => !expectedIds.includes(id)).map(([id]) => id);
  if (unknownIds.length > 0) return { score: 0, feedback: [`包含未知陈述 ID（${unknownIds.join(", ")}），拒绝评分。`], completed: false };
  const missingIds = expectedIds.filter((id) => entries.every(([entryId]) => entryId !== id));
  if (missingIds.length > 0) {
    return { score: 0, feedback: [`仍有陈述未判定（${missingIds.join(", ")}）；请逐条给出判断。`], completed: false };
  }
  const correct = entries.filter(([id, verdict]) => verdict === expected.expectedVerdicts[id]).length;
  return { score: Number((correct / entries.length).toFixed(3)), feedback: [...trainingCase.rubric], completed: true };
}

export function gradeSession(
  session: DiagnosticSession,
  card: ProblemCard,
  path: DiagnosticPath,
  trainingCase: ProblemTrainingCase | undefined,
  evidence: DiagnosticEvidence[],
): GradeResult {
  if (!trainingCase) return { score: 0, feedback: ["缺少该模式的训练案例。"], completed: false };
  switch (session.mode) {
    case "quick": return gradeQuickDiagnosis(session, trainingCase);
    case "differential": return gradeDifferential(session, trainingCase);
    case "sequential": return gradeSequential(session, trainingCase, evidence, path);
    case "missing-info": return gradeMissingInfo(session, trainingCase, path);
    case "error-localization": return gradeErrorLocalization(session, trainingCase);
    case "claim-boundary": return gradeClaimBoundary(session, trainingCase);
    case "reviewer": return gradeReviewer(session, trainingCase);
    case "ai-verdict": return gradeAiVerdict(session, trainingCase);
    default: return { score: 0, feedback: ["未知模式。"], completed: false };
  }
}

export function completeSession(session: DiagnosticSession, score: number, responseId: string, now = new Date()): DiagnosticSession {
  return {
    ...session,
    updatedAt: now.toISOString(),
    completedAt: now.toISOString(),
    score,
    responseId,
    steps: [...session.steps.filter((step) => step.kind !== "calibration"), { id: "calibration", kind: "calibration", mode: session.mode, lockedAt: now.toISOString(), payload: { score, responseId } }],
  };
}

export function modeSkillId(mode: DiagnosticModeId): string {
  switch (mode) {
    case "quick":
    case "sequential": return "troubleshooting";
    case "differential": return "scientific-diagnosis";
    case "missing-info":
    case "ai-verdict": return "evidence-discrimination";
    case "error-localization":
    case "reviewer": return "failure-recognition";
    case "claim-boundary": return "claim-calibration";
    default: return "troubleshooting";
  }
}

export function farTransferPrompt(card: ProblemCard, trainingCase: ProblemTrainingCase): string {
  const family = trainingCase.farTransferFamily;
  return `${family}：另一个课题组遇到了表面不同但结构相同的问题。请基于“${card.titleCn}”的诊断原则，识别风险并给出可辩护的结论，不要照抄原始案例措辞。`;
}
