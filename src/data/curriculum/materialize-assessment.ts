import type { AssessmentTaskContract, StagedAssessmentAssetV1 } from "../../domain/curriculum";
import type { AssessmentActionKey, AssessmentRole, MaterializedAssessmentRole } from "./assessment-material-types";
import { assessmentValidityOverrides,m0191cFlaggedLogicalIds,singleBestKeyManifest } from "./assessment-validity-adjudication";

const allActionKeys: AssessmentActionKey[] = ["decision", "key_check", "boundary", "change_mind"];
const specificityRepairIds = new Set([
  "staged-concept-power-remediation-v2", "staged-concept-interaction-apply-v2", "staged-concept-interaction-remediation-v2",
  "staged-concept-data-leakage-remediation-v2", "staged-concept-time-origin-remediation-v2", "staged-concept-time-origin-review-v2",
  "staged-concept-cluster-stability-apply-v2", "staged-concept-pseudobulk-remediation-v2", "staged-concept-cross-modal-validation-remediation-v2",
  "staged-concept-alternative-explanation-remediation-v2", "staged-concept-alternative-explanation-review-v2", "staged-concept-claim-boundary-remediation-v2",
  "staged-concept-minimal-sufficient-analysis-remediation-v2", "staged-concept-evidence-redundancy-remediation-v2",
  "staged-concept-negative-result-remediation-v2", "staged-concept-negative-result-review-v2",
]);
const multiFactTopic = /confounding|validation|cox|hazard-ratio|time-origin|pseudoreplication|statistical-unit|composition-state|external-validity|cluster-stability|gsea|cellchat|evidence-claim|claim-boundary|triangulation|cross-modal|pathway/i;
const variableFactContracts = new Set<AssessmentTaskContract>(["classification", "choose_next_evidence", "ordering_sequence", "multi_select_audit"]);
const nearMissLabelRewrites: Record<string, string> = {
  "因 P<0.001，直接称 GeneX 为治疗靶点": "GeneX 通过预设 FDR 且供体层效应稳定，因此把它优先列为治疗靶点候选",
  "q<0.10 意味 90% 确证": "把 q<0.10 的三项写成已确认候选，并把 10% 当作每一项的错误概率",
  "结果合理就无需测试": "结果与预期方向一致，因此只在真实标签上复算，不再运行伪标签对照",
  "AI 自动调阈值更客观": "由 AI 在交叉验证均值最高处固定阈值，再把同一队列称为外部验证",
  "P=0.04 已证明病例蛋白升高": "病例蛋白通过预设的单蛋白检验 P=0.04，因此不再检查本次筛选蛋白家族的 FDR",
  "整体 P<0.05 证明存在阈值": "整体样条模型 P<0.05，因此把图中弯折点直接固定为临床阈值",
};

const actionLabels=(material:MaterializedAssessmentRole,override?:Partial<Record<AssessmentActionKey,string>>)=>({decision:override?.decision??material.decisionCn,key_check:override?.key_check??material.keyCheckCn,boundary:override?.boundary??material.maximumBoundaryCn,change_mind:override?.change_mind??material.changeMindCn});

const hashOrder = (id: string, length: number) => [...Array(length).keys()].sort((left, right) => {
  const score = (index: number) => [...`${id}:${index}`].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 0);
  return score(left) - score(right);
});

const contractFor = (id: string, role: AssessmentRole, material: MaterializedAssessmentRole): AssessmentTaskContract => {
  if (material.taskContract) return material.taskContract;
  if (/time-origin|landmark|censoring|analysis-pipeline|reproducibility/i.test(id)) return "ordering_sequence";
  if (/confounding|pseudoreplication|data-leakage|cluster-stability|cellchat|gsea|validation/i.test(id)) return "multi_select_audit";
  if (/association-causation|population-sample|interaction|batch-effect|rna-protein|null-result/i.test(id)) return "classification";
  if (/alternative-explanation|triangulation|power|evidence-redundancy|negative-result|external-validity/i.test(id)) return "choose_next_evidence";
  return role === "apply" ? "integrated_judgment" : role === "remediation" ? "error_localization" : "claim_rewrite";
};

const legacyExpectedActionsFor=(contract:AssessmentTaskContract,material:MaterializedAssessmentRole):AssessmentActionKey[]=>{if(contract==="classification")return["decision"];if(contract==="claim_rewrite")return["boundary"];if(contract==="error_localization")return["key_check"];if(contract==="choose_next_evidence")return["change_mind"];return material.requiredActionKeys;};
const singleBestContracts=new Set<AssessmentTaskContract>(["classification","claim_rewrite","error_localization","choose_next_evidence"]);

const promptFor = (contract: AssessmentTaskContract, maximumSelections: number) => ({
  multi_select_audit: `只依据刺激材料选择所有必要但不冗余的审计动作（最多 ${maximumSelections} 项），并逐项引用证据。`,
  classification: "只依据刺激材料，选择最能概括当前证据状态的一项判断，并引用决定该分类的资料。",
  claim_rewrite: "选择唯一一条没有越过现有证据的结论改写，并指出原主张被收窄的依据。",
  error_localization: "选择最先必须修复的一处分析错误；不要把后续边界说明误当根因定位。",
  choose_next_evidence: "选择最能区分当前竞争解释、并会实际改变判断的下一项证据。",
  ordering_sequence: "按应执行的先后顺序选择动作；顺序本身参与判定，并为每一步引用资料。",
  integrated_judgment: `综合材料选择全部必要判断（最多 ${maximumSelections} 项），把每项与支持它的一条或多条资料对应。`,
})[contract];

const factIndicesFor = (id: string, contract: AssessmentTaskContract, material: MaterializedAssessmentRole, key: AssessmentActionKey): number[] => {
  const explicit = material.evidenceFactIndicesByAction?.[key];
  const primary = material.evidenceFactIndexByAction[key];
  const indices = explicit ?? (multiFactTopic.test(id) ? [primary, (primary + 1) % material.factsCn.length] : [primary]);
  return [...new Set(indices)].filter((index) => Number.isInteger(index) && index >= 0 && index < material.factsCn.length);
};

const factsFor = (assetId: string, contract: AssessmentTaskContract, material: MaterializedAssessmentRole): string[] => {
  const base = material.factsCn.map((fact) => specificityRepairIds.has(assetId) ? `${material.dataModalityCn}的具体数据资料显示：${fact}` : fact);
  if (variableFactContracts.has(contract) && base.length < 7) base.push(`场景边界：资料来自${material.diseaseAreaCn}的${material.studyDesignCn}，数据模态为${material.dataModalityCn}；结论必须与该设计和模态匹配。`);
  return base;
};

const stimulusFor = (material: MaterializedAssessmentRole, factsCn: string[]): StagedAssessmentAssetV1["stimulus"] => {
  const rows = factsCn.map((fact, index) => [`F${index + 1}`, fact, index === 0 ? "起始资料" : index === factsCn.length - 1 ? "边界/更新资料" : "新增判断资料"]);
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

function buildAssessment(id:string,role:AssessmentRole,material:MaterializedAssessmentRole,legacy=false):StagedAssessmentAssetV1{
 const logicalId=`${id}-${role}`,ov=legacy?undefined:assessmentValidityOverrides[logicalId],labels=actionLabels(material,ov?.actionLabelOverrides);
 const taskContract=ov?.taskContract??contractFor(id,role,material),required=ov?.requiredActionKeys??material.requiredActionKeys;
 const kd=!legacy&&singleBestContracts.has(taskContract)?singleBestKeyManifest[logicalId]:undefined;
 if(!legacy&&singleBestContracts.has(taskContract)&&!kd)throw new Error(`Missing item-specific key: ${logicalId}`);
 const expected=legacy?legacyExpectedActionsFor(taskContract,material):kd?[kd.expectedActionKey]:required;
 const revised=!legacy&&m0191cFlaggedLogicalIds.has(logicalId),assetId=`${logicalId}-${revised?"v3":"v2"}`,factsCn=factsFor(`${logicalId}-v2`,taskContract,material);
 const candidate=["multi_select_audit","integrated_judgment","ordering_sequence"].includes(taskContract)?required:allActionKeys;
 const actions=candidate.map(key=>({id:`${id}-${role}-${key}`,labelCn:labels[key],key,kind:"action" as const,correct:expected.includes(key)}));
 const distractors=material.plausibleDistractorsCn.map((x,index)=>({id:`${id}-${role}-distractor-${index+1}`,labelCn:nearMissLabelRewrites[x.labelCn]??x.labelCn,key:`distractor_${index+1}` as const,kind:"distractor" as const,correct:false as const}));
 const raw=[...actions,...distractors],options=hashOrder(`${id}:${role}`,raw.length).map(i=>raw[i]);
 const expectedOptionIds=taskContract==="ordering_sequence"?expected.map(key=>`${id}-${role}-${key}`):options.filter(x=>x.correct).map(x=>x.id),stimulus=stimulusFor(material,factsCn);
 const optionFeedbackCn=Object.fromEntries(options.map(option=>{if(option.kind==="action"&&option.correct){const ix=factIndicesFor(id,taskContract,material,option.key);return[option.id,`该判断由 ${ix.map(i=>`F${i+1}`).join("+")} 支持，直接回答当前题目焦点。`];}if(option.kind==="action")return[option.id,`“${option.labelCn}”可能属于完整审查，但不是当前最优判断焦点。`];const j=option.key==="distractor_1"?0:1,d=material.plausibleDistractorsCn[j];return[option.id,`这里不成立：${d.whyWrongCn}。`];}));
 const evidenceExpectations=expected.map(key=>{const ix=factIndicesFor(id,taskContract,material,key);return{optionId:`${id}-${role}-${key}`,allowedRowIds:ix.map(i=>material.stimulusFormat==="decision_timeline"?`T${i}`:`F${i+1}`),requiredFactFragmentsCn:ix.map(i=>material.factsCn[i].replace(/[\s，。；：、“”‘’（）()\-—]/g,"").slice(0,10)),reasoningMarkersCn:key==="boundary"?["只能","限于","不足"]:key==="change_mind"?["若","一旦","更新"]:["因为","因此","所以"]};});
 const rationale=expected.map(key=>`${key}: ${labels[key]} ← ${factIndicesFor(id,taskContract,material,key).map(i=>`F${i+1}`).join("+")}`);
 if(kd)rationale.push(`item-specific key manifest: ${kd.expectedActionKey}; basis=${kd.basis}`);if(ov?.adjudicationCn)rationale.push(`M019.1c adjudication: ${ov.adjudicationCn}`);
 return{id:assetId,role,taskContract,scenarioCn:material.scenarioCn,promptCn:ov?.promptCn??promptFor(taskContract,expected.length),options:options.map(({id,labelCn})=>({id,labelCn})),expectedOptionIds,stimulus,reasoningCriteriaCn:[labels.decision,labels.key_check,labels.boundary,labels.change_mind],feedbackCn:[`应完成的判断：${labels.decision}`,`必须核对：${labels.key_check}`,`最大边界：${labels.boundary}`,`改变判断的证据：${labels.change_mind}`],optionFeedbackCn,scoringRule:{minimumEvidenceUnits:evidenceExpectations.reduce((s,x)=>s+x.allowedRowIds.length,0),criticalErrorOptionIds:distractors.map(x=>x.id),evidenceExpectations,partialCreditCn:"证据错配、漏掉必要判断或选择 distractor 时不产生标准化能力。",stopRuleCn:"存在关键错误或证据错配时送人工审核。",changeMindCriteriaCn:[labels.change_mind,labels.boundary],changeMindActionMarkersCn:["撤回","收窄","修改","停止","改为","重新","更新"]},maximumConclusionCn:labels.boundary,materialization:{contentVersion:revised?"m019.1c":"m019.1",diseaseAreaCn:material.diseaseAreaCn,studyDesignCn:material.studyDesignCn,dataModalityCn:material.dataModalityCn,independentFactsCn:factsCn,representationPurposeCn:material.representationPurposeCn,authorRationaleCn:rationale,blindReviewStatus:"pending"},hints:[],confidenceRequired:true,responseLocked:true};
}
export const buildMaterializedAssessment=(id:string,role:AssessmentRole,material:MaterializedAssessmentRole)=>buildAssessment(id,role,material,false);
export const buildMaterializedAssessmentLegacyM0191b=(id:string,role:AssessmentRole,material:MaterializedAssessmentRole)=>buildAssessment(id,role,material,true);
