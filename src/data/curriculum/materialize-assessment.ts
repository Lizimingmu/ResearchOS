import type { AssessmentTaskContract, StagedAssessmentAssetV1 } from "../../domain/curriculum";
import type { AssessmentActionKey, AssessmentRole, MaterializedAssessmentRole } from "./assessment-material-types";

const allActionKeys: AssessmentActionKey[] = ["decision", "key_check", "boundary", "change_mind"];
const nearMissLabelRewrites: Record<string, string> = {
  "因 P<0.001，直接称 GeneX 为治疗靶点": "GeneX 通过预设 FDR 且供体层效应稳定，因此把它优先列为治疗靶点候选",
  "q<0.10 意味 90% 确证": "把 q<0.10 的三项写成已确认候选，并把 10% 当作每一项的错误概率",
  "结果合理就无需测试": "结果与预期方向一致，因此只在真实标签上复算，不再运行伪标签对照",
  "AI 自动调阈值更客观": "由 AI 在交叉验证均值最高处固定阈值，再把同一队列称为外部验证",
  "P=0.04 已证明病例蛋白升高": "病例蛋白通过预设的单蛋白检验 P=0.04，因此不再检查本次筛选蛋白家族的 FDR",
  "整体 P<0.05 证明存在阈值": "整体样条模型 P<0.05，因此把图中弯折点直接固定为临床阈值",
};

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

const contractFor = (role: AssessmentRole, material: MaterializedAssessmentRole): AssessmentTaskContract => material.taskContract
  ?? (role === "apply" ? "integrated_judgment" : role === "remediation" ? "error_localization" : "claim_rewrite");

const expectedActionsFor = (contract: AssessmentTaskContract, material: MaterializedAssessmentRole): AssessmentActionKey[] => {
  if (contract === "classification") return ["decision"];
  if (contract === "claim_rewrite") return ["boundary"];
  if (contract === "error_localization") return ["key_check"];
  if (contract === "choose_next_evidence") return ["change_mind"];
  return material.requiredActionKeys;
};

const promptFor = (contract: AssessmentTaskContract, maximumSelections: number) => ({
  multi_select_audit: `只依据刺激材料选择所有必要但不冗余的审计动作（最多 ${maximumSelections} 项），并逐项引用证据。`,
  classification: "只依据刺激材料，选择最能概括当前证据状态的一项判断，并引用决定该分类的资料。",
  claim_rewrite: "选择唯一一条没有越过现有证据的结论改写，并指出原主张被收窄的依据。",
  error_localization: "选择最先必须修复的一处分析错误；不要把后续边界说明误当根因定位。",
  choose_next_evidence: "选择最能区分当前竞争解释、并会实际改变判断的下一项证据。",
  ordering_sequence: "按应执行的先后顺序选择动作；顺序本身参与判定，并为每一步引用资料。",
  integrated_judgment: `综合材料选择全部必要判断（最多 ${maximumSelections} 项），把每项与支持它的一条或多条资料对应。`,
})[contract];

const factIndicesFor = (material: MaterializedAssessmentRole, key: AssessmentActionKey): number[] => {
  const indices = material.evidenceFactIndicesByAction?.[key] ?? [material.evidenceFactIndexByAction[key]];
  return [...new Set(indices)].filter((index) => Number.isInteger(index) && index >= 0 && index < material.factsCn.length);
};

const stimulusFor = (material: MaterializedAssessmentRole): StagedAssessmentAssetV1["stimulus"] => {
  const rows = material.factsCn.map((fact, index) => [`F${index + 1}`, fact, index === 0 ? "起始资料" : index === material.factsCn.length - 1 ? "边界/更新资料" : "新增判断资料"]);
  if (material.stimulusFormat === "evidence_matrix") return {
    format: "evidence_matrix",
    columnsCn: ["证据ID", "未解释的原始材料", "在判断中的角色"],
    rowsCn: rows.map((row, index) => [row[0], row[1], index === 0 ? "建立问题" : index === material.factsCn.length - 1 ? "限制最大主张" : "改变解释权重"]),
    noteCn: material.representationPurposeCn,
  };
  if (material.stimulusFormat === "decision_timeline") return {
    format: "decision_timeline",
    columnsCn: ["时点", "当时可见的材料", "在揭示前必须冻结的判断"],
    rowsCn: rows.map((row, index) => [`T${index}`, row[1], index === 0 ? "初始判断" : index === material.factsCn.length - 1 ? "最终更新" : `第 ${index} 次更新`]),
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
  const taskContract = contractFor(role, material);
  const expectedActionKeys = expectedActionsFor(taskContract, material);
  const candidateActionKeys = ["multi_select_audit", "integrated_judgment", "ordering_sequence"].includes(taskContract) ? material.requiredActionKeys : allActionKeys;
  const actionOptions = candidateActionKeys.map((key) => ({ id: `${id}-${role}-${key}`, labelCn: labels[key], key, kind: "action" as const, correct: expectedActionKeys.includes(key) }));
  const distractorOptions = material.plausibleDistractorsCn.map((distractor, index) => ({ id: `${id}-${role}-distractor-${index + 1}`, labelCn: nearMissLabelRewrites[distractor.labelCn] ?? distractor.labelCn, key: `distractor_${index + 1}` as const, kind: "distractor" as const, correct: false as const }));
  const rawOptions = [...actionOptions, ...distractorOptions];
  const options = hashOrder(`${id}:${role}`, rawOptions.length).map((index) => rawOptions[index]);
  const expectedOptionIds = options.filter((option) => option.correct).map((option) => option.id);
  const stimulus = stimulusFor(material);
  const optionFeedbackCn = Object.fromEntries(options.map((option) => {
    if (option.kind === "action" && option.correct) {
      const factIndices = factIndicesFor(material, option.key);
      return [option.id, `该判断由 ${factIndices.map((index) => `F${index + 1}`).join("+")} 共同支持：${factIndices.map((index) => `“${material.factsCn[index]}”`).join("；")}。它回答的是当前 ${taskContract} 任务。`];
    }
    if (option.kind === "action") {
      return [option.id, `“${option.labelCn}”本身可能是后续审查的一部分，但当前任务是 ${taskContract}；它没有直接完成题目要求的判断焦点，因此不是本题答案。`];
    }
    const index = option.key === "distractor_1" ? 0 : 1;
    const distractor = material.plausibleDistractorsCn[index];
    return [option.id, `这里不成立：${distractor.whyWrongCn}。在“${distractor.whenMayHoldCn}”时它可能合理；本题材料不满足该条件，采用它会越过“${material.maximumBoundaryCn}”这一解释边界。`];
  }));
  const evidenceExpectations = expectedActionKeys.map((key) => {
    const factIndices = factIndicesFor(material, key);
    const optionId = `${id}-${role}-${key}`;
    return { optionId, allowedRowIds: factIndices.map((index) => material.stimulusFormat === "decision_timeline" ? `T${index}` : `F${index + 1}`), requiredFactFragmentsCn: factIndices.map((index) => material.factsCn[index].replace(/[\s，。；：、“”‘’（）()\-—]/g, "").slice(0, 10)), reasoningMarkersCn: key === "boundary" ? ["只能", "限于", "不足"] : key === "change_mind" ? ["若", "一旦", "更新"] : ["因为", "因此", "所以"] };
  });
  return {
    id: `${id}-${role}-v2`, role, taskContract, scenarioCn: material.scenarioCn,
    promptCn: promptFor(taskContract, expectedActionKeys.length),
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
      authorRationaleCn: expectedActionKeys.map((key) => `${key}: ${labels[key]} ← ${factIndicesFor(material, key).map((index) => `F${index + 1}`).join("+")}`), blindReviewStatus: "pending",
    },
    hints: [], confidenceRequired: true, responseLocked: true,
  };
}
