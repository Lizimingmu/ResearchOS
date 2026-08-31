import type { StagedAssessmentAssetV1 } from "../../domain/curriculum";
import type { AssessmentRole, MaterializedAssessmentRole } from "./assessment-material-types";

const actionLabels = (material: MaterializedAssessmentRole) => ({
  decision: material.decisionCn,
  key_check: material.keyCheckCn,
  boundary: material.maximumBoundaryCn,
  change_mind: material.changeMindCn,
});

const hashOrder = (id: string, length: number) => [...Array(length).keys()].sort((left, right) => {
  const score = (index: number) => [...`${id}:${index}`].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 0);
  return score(left) - score(right);
});

const stimulusFor = (material: MaterializedAssessmentRole): StagedAssessmentAssetV1["stimulus"] => {
  const rows = material.factsCn.map((fact, index) => [`F${index + 1}`, fact, index === 0 ? "起始资料" : index === 3 ? "边界/更新资料" : "新增判断资料"]);
  if (material.stimulusFormat === "evidence_matrix") return {
    format: "evidence_matrix",
    columnsCn: ["证据ID", "未解释的原始材料", "在判断中的角色"],
    rowsCn: rows.map((row, index) => [row[0], row[1], index === 0 ? "建立问题" : index === 3 ? "限制最大主张" : "改变解释权重"]),
    noteCn: material.representationPurposeCn,
  };
  if (material.stimulusFormat === "decision_timeline") return {
    format: "decision_timeline",
    columnsCn: ["时点", "当时可见的材料", "在揭示前必须冻结的判断"],
    rowsCn: rows.map((row, index) => [`T${index}`, row[1], index === 0 ? "初始判断" : index === 3 ? "最终更新" : `第 ${index} 次更新`]),
    noteCn: material.representationPurposeCn,
  };
  return {
    format: "case_table",
    columnsCn: ["记录ID", "患者/样本/分析资料", "资料角色"],
    rowsCn: rows,
    noteCn: material.representationPurposeCn,
  };
};

export function buildMaterializedAssessment(id: string, role: AssessmentRole, material: MaterializedAssessmentRole): StagedAssessmentAssetV1 {
  const labels = actionLabels(material);
  const actionOptions = material.requiredActionKeys.map((key) => ({ id: `${id}-${role}-${key}`, labelCn: labels[key], key, correct: true as const }));
  const distractorOptions = material.plausibleDistractorsCn.map((distractor, index) => ({ id: `${id}-${role}-distractor-${index + 1}`, labelCn: distractor.labelCn, key: `distractor_${index + 1}` as const, correct: false as const }));
  const rawOptions = [...actionOptions, ...distractorOptions];
  const options = hashOrder(`${id}:${role}`, rawOptions.length).map((index) => rawOptions[index]);
  const expectedOptionIds = options.filter((option) => option.correct).map((option) => option.id);
  const stimulus = stimulusFor(material);
  const optionFeedbackCn = Object.fromEntries(options.map((option) => {
    if (option.correct) {
      const factIndex = material.evidenceFactIndexByAction[option.key];
      return [option.id, `该决定成立，因为 F${factIndex + 1} 提供了“${material.factsCn[factIndex]}”。它只完成“${option.labelCn}”这一判断任务，不能替代其余边界检查。`];
    }
    const index = option.key === "distractor_1" ? 0 : 1;
    const distractor = material.plausibleDistractorsCn[index];
    return [option.id, `这里不成立：${distractor.whyWrongCn}。在“${distractor.whenMayHoldCn}”时它可能合理；本题给出的四条资料并不满足该条件，因此不能选择。`];
  }));
  const evidenceExpectations = material.requiredActionKeys.map((key) => {
    const factIndex = material.evidenceFactIndexByAction[key];
    const optionId = `${id}-${role}-${key}`;
    return { optionId, allowedRowIds: [material.stimulusFormat === "decision_timeline" ? `T${factIndex}` : `F${factIndex + 1}`], requiredFactFragmentsCn: [material.factsCn[factIndex].replace(/[\s，。；：、“”‘’（）()\-—]/g, "").slice(0, 10)], reasoningMarkersCn: key === "boundary" ? ["只能", "限于", "不足"] : key === "change_mind" ? ["若", "一旦", "更新"] : ["因为", "因此", "所以"] };
  });
  return {
    id: `${id}-${role}-v2`, role, scenarioCn: material.scenarioCn,
    promptCn: "先只依据刺激材料独立判断。选择所有必要但不冗余的行动；每个选择必须引用一条不同资料，并说明该事实如何支持决定、同时排除哪条半正确路径。",
    options: options.map(({ id: optionId, labelCn }) => ({ id: optionId, labelCn })), expectedOptionIds, stimulus,
    reasoningCriteriaCn: [material.decisionCn, material.keyCheckCn, material.maximumBoundaryCn, material.changeMindCn],
    feedbackCn: [`应完成的判断：${material.decisionCn}`, `必须核对：${material.keyCheckCn}`, `最大边界：${material.maximumBoundaryCn}`, `改变判断的证据：${material.changeMindCn}`],
    optionFeedbackCn,
    scoringRule: {
      minimumEvidenceUnits: expectedOptionIds.length,
      criticalErrorOptionIds: distractorOptions.map((option) => option.id),
      evidenceExpectations,
      partialCreditCn: "选择方向正确但证据行错配、没有排除半正确解释，或漏掉必要行动时，仅记录 review_required，不产生标准化能力。",
      stopRuleCn: "任一半正确 distractor 被选中，或未给出与所选项对应的材料事实时，停止自动判定并送人工审核。",
      changeMindCriteriaCn: [material.changeMindCn, material.maximumBoundaryCn],
      changeMindActionMarkersCn: ["撤回", "收窄", "修改", "停止", "改为", "重新", "更新"],
    },
    maximumConclusionCn: material.maximumBoundaryCn,
    materialization: {
      contentVersion: "m019.1", diseaseAreaCn: material.diseaseAreaCn, studyDesignCn: material.studyDesignCn, dataModalityCn: material.dataModalityCn,
      independentFactsCn: [...material.factsCn], representationPurposeCn: material.representationPurposeCn,
      authorRationaleCn: material.requiredActionKeys.map((key) => `${key}: ${labels[key]} ← F${material.evidenceFactIndexByAction[key] + 1}`), blindReviewStatus: "pending",
    },
    hints: [], confidenceRequired: true, responseLocked: true,
  };
}
