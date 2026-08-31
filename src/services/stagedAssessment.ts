import type { StagedAssessmentAssetV1 } from "../domain/curriculum";

export interface StagedEvidenceUnit {
  rowId: string;
  supportsOptionId: string;
  quotedFactCn: string;
  reasoningCn: string;
}

export interface StagedAssessmentEvaluation {
  status: "review_required" | "partial" | "failed";
  selectedCorrectIds: string[];
  missedCorrectIds: string[];
  incorrectIds: string[];
  criticalErrorIds: string[];
  acceptedEvidenceUnits: StagedEvidenceUnit[];
  feedbackByOptionId: Record<string, string>;
  recommendedNextRoute: "human_review" | "retry" | "remediation";
  workflowImplemented: false;
  requiresHumanReview: boolean;
  createsCompetence: false;
}

export function evaluateStagedAssessment(
  asset: StagedAssessmentAssetV1,
  selectedOptionIds: string[],
  evidenceUnits: StagedEvidenceUnit[],
  changeMindCn: string,
): StagedAssessmentEvaluation {
  const knownIds = new Set(asset.options.map((option) => option.id));
  const expectedIds = new Set(asset.expectedOptionIds);
  const selectedIds = [...new Set(selectedOptionIds)].filter((id) => knownIds.has(id));
  const selectedCorrectIds = selectedIds.filter((id) => expectedIds.has(id));
  const missedCorrectIds = asset.expectedOptionIds.filter((id) => !selectedIds.includes(id));
  const incorrectIds = selectedIds.filter((id) => !expectedIds.has(id));
  const criticalErrorIds = incorrectIds.filter((id) => asset.scoringRule.criticalErrorOptionIds.includes(id));
  const rowsById = new Map(asset.stimulus.rowsCn.map((row) => [row[0], row.slice(1).join(" ")]));
  const expectationsByOptionId = new Map(asset.scoringRule.evidenceExpectations.map((expectation) => [expectation.optionId, expectation]));
  const usedRowIds = new Set<string>();
  const normalize = (value: string) => value.toLowerCase().replace(/[\s，。；：、“”‘’（）()\-—]/g, "");
  const copiesDecisionLabel = (reasoning: string, optionId: string) => {
    const label = asset.options.find((option) => option.id === optionId)?.labelCn ?? "";
    const normalizedLabel = normalize(label);
    const normalizedReasoning = normalize(reasoning);
    return normalizedLabel.length >= 8 && normalizedReasoning.includes(normalizedLabel);
  };
  const acceptedEvidenceUnits = evidenceUnits.filter((unit) => {
    const rowId = unit.rowId.trim();
    const rowText = rowsById.get(rowId);
    const expectation = expectationsByOptionId.get(unit.supportsOptionId);
    const quote = normalize(unit.quotedFactCn);
    const reasoning = normalize(unit.reasoningCn);
    if (!rowText || !expectation || usedRowIds.has(rowId) || !selectedCorrectIds.includes(unit.supportsOptionId) || quote.length < 4) return false;
    if (!expectation.allowedRowIds.includes(rowId) || !normalize(rowText).includes(quote)) return false;
    if (!expectation.requiredFactFragmentsCn.some((fragment) => quote.includes(normalize(fragment)))) return false;
    if (unit.reasoningCn.trim().length < 12 || copiesDecisionLabel(unit.reasoningCn, unit.supportsOptionId)) return false;
    if (!expectation.reasoningMarkersCn.some((marker) => reasoning.includes(normalize(marker)))) return false;
    usedRowIds.add(rowId);
    return true;
  });
  const evidencedOptionIds = new Set(acceptedEvidenceUnits.map((unit) => unit.supportsOptionId));
  const hasEnoughEvidence = acceptedEvidenceUnits.length >= asset.scoringRule.minimumEvidenceUnits
    && asset.expectedOptionIds.every((id) => evidencedOptionIds.has(id));
  const normalizedChangeMind = normalize(changeMindCn);
  const hasCriterion = asset.scoringRule.changeMindCriteriaCn.some((criterion) => {
    const normalizedCriterion = normalize(criterion);
    for (let index = 0; index <= normalizedCriterion.length - 4; index += 1) if (normalizedChangeMind.includes(normalizedCriterion.slice(index, index + 4))) return true;
    return false;
  });
  const hasCounterfactual = /(若|如果|一旦|当).*(不成立|失败|相反|未复现|未达到|超过|低于|出现)/.test(changeMindCn);
  const hasUpdateAction = asset.scoringRule.changeMindActionMarkersCn.some((marker) => normalizedChangeMind.includes(normalize(marker)));
  const hasChangeRule = changeMindCn.trim().length >= 12 && hasCriterion && hasCounterfactual && hasUpdateAction;
  const exactOrder = asset.taskContract !== "ordering_sequence" || (selectedIds.length === asset.expectedOptionIds.length && selectedIds.every((id, index) => id === asset.expectedOptionIds[index]));
  const exactOptions = incorrectIds.length === 0 && missedCorrectIds.length === 0 && exactOrder;
  const mechanicallyReviewable = exactOptions && hasEnoughEvidence && hasChangeRule;
  const partial = !mechanicallyReviewable && criticalErrorIds.length === 0 && selectedCorrectIds.length > 0;
  return {
    status: mechanicallyReviewable ? "review_required" : partial ? "partial" : "failed",
    selectedCorrectIds,
    missedCorrectIds,
    incorrectIds,
    criticalErrorIds,
    acceptedEvidenceUnits,
    feedbackByOptionId: Object.fromEntries(asset.options.map((option) => [option.id, asset.optionFeedbackCn[option.id]])),
    recommendedNextRoute: mechanicallyReviewable ? "human_review" : criticalErrorIds.length > 0 ? "remediation" : "retry",
    workflowImplemented: false,
    requiresHumanReview: mechanicallyReviewable,
    createsCompetence: false,
  };
}
