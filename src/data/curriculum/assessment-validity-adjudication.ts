import type { AssessmentTaskContract } from "../../domain/curriculum";
import type { AssessmentActionKey } from "./assessment-material-types";
export type SingleBestKeyBasis="external_blind_agree"|"external_blind_disagreement_adjudicated"|"external_blind_ambiguity_repaired";
export interface SingleBestKeyDecision{expectedActionKey:AssessmentActionKey;basis:SingleBestKeyBasis}
export interface AssessmentValidityOverride{taskContract?:AssessmentTaskContract;requiredActionKeys?:AssessmentActionKey[];promptCn?:string;actionLabelOverrides?:Partial<Record<AssessmentActionKey,string>>;adjudicationCn:string}
export const singleBestKeyManifest:Record<string,SingleBestKeyDecision>={
  "staged-concept-research-question-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-research-question-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-hypothesis-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-hypothesis-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-evidence-claim-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-evidence-claim-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-association-causation-apply": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-association-causation-remediation": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-association-causation-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-exploratory-confirmatory-remediation": {
    "expectedActionKey": "key_check",
    "basis": "external_blind_agree"
  },
  "staged-concept-exploratory-confirmatory-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-statistical-unit-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-statistical-unit-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-biological-technical-replicate-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-biological-technical-replicate-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-population-sample-apply": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-population-sample-remediation": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-population-sample-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-selection-bias-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-selection-bias-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-internal-external-validity-apply": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-internal-external-validity-remediation": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-internal-external-validity-review": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-effect-size-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-effect-size-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-standard-error-remediation": {
    "expectedActionKey": "key_check",
    "basis": "external_blind_agree"
  },
  "staged-concept-standard-error-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-confidence-interval-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-confidence-interval-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-p-value-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-p-value-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-multiple-testing-fdr-remediation": {
    "expectedActionKey": "key_check",
    "basis": "external_blind_agree"
  },
  "staged-concept-multiple-testing-fdr-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-power-apply": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-power-remediation": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-power-review": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-interaction-apply": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-interaction-remediation": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-interaction-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_agree"
  },
  "staged-concept-overfitting-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-overfitting-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-hazard-ratio-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-hazard-ratio-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-composition-state-remediation": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-composition-state-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-batch-effect-apply": {
    "expectedActionKey": "decision",
    "basis": "external_blind_agree"
  },
  "staged-concept-batch-effect-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_agree"
  },
  "staged-concept-batch-effect-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-bulk-mixture-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-bulk-mixture-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-rna-protein-apply": {
    "expectedActionKey": "decision",
    "basis": "external_blind_agree"
  },
  "staged-concept-rna-protein-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_agree"
  },
  "staged-concept-rna-protein-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_agree"
  },
  "staged-concept-pseudobulk-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-pseudobulk-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-alternative-explanation-apply": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-alternative-explanation-remediation": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-alternative-explanation-review": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-claim-boundary-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-claim-boundary-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-robustness-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-robustness-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-triangulation-apply": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-triangulation-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-triangulation-review": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-minimal-sufficient-analysis-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-minimal-sufficient-analysis-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-concept-evidence-redundancy-apply": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-evidence-redundancy-remediation": {
    "expectedActionKey": "key_check",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-evidence-redundancy-review": {
    "expectedActionKey": "change_mind",
    "basis": "external_blind_agree"
  },
  "staged-concept-negative-result-apply": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-negative-result-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-negative-result-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-concept-ai-cognitive-outsourcing-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-concept-ai-cognitive-outsourcing-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-differential-analysis-remediation": {
    "expectedActionKey": "key_check",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-method-differential-analysis-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-correlation-remediation": {
    "expectedActionKey": "key_check",
    "basis": "external_blind_agree"
  },
  "staged-method-correlation-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-linear-regression-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-linear-regression-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-logistic-regression-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-logistic-regression-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-cox-regression-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-cox-regression-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-kaplan-logrank-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-kaplan-logrank-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-restricted-cubic-spline-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-restricted-cubic-spline-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-method-bootstrap-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-bootstrap-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-roc-auc-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-method-roc-auc-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_ambiguity_repaired"
  },
  "staged-method-time-dependent-auc-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-time-dependent-auc-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-pca-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-pca-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-nmf-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-nmf-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-clustering-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-clustering-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-wgcna-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-wgcna-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-pseudobulk-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-pseudobulk-review": {
    "expectedActionKey": "boundary",
    "basis": "external_blind_agree"
  },
  "staged-method-differential-abundance-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-differential-abundance-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-trajectory-pseudotime-remediation": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  },
  "staged-method-trajectory-pseudotime-review": {
    "expectedActionKey": "decision",
    "basis": "external_blind_disagreement_adjudicated"
  }
} as const;
export const assessmentValidityOverrides:Record<string,AssessmentValidityOverride>={
"staged-concept-research-question-apply":{requiredActionKeys:["decision","key_check","boundary"],adjudicationCn:"ECOG 缺失需要处理，但现有材料不足以要求暂停并重定义 estimand；不把可选 contingency 强制成当前必要动作。"},
"staged-concept-population-sample-remediation":{promptCn:"只依据刺激材料，选择最能概括当前 12% 结果对全市青少年患病率外推限制的一项判断。",adjudicationCn:"原 O1/O3 均合理；收窄为患病率外推结论。"},
"staged-concept-selection-bias-apply":{actionLabelOverrides:{decision:"识别肿瘤体积同时影响组织可用性，并与标志物及复发相关，因此进入组织子样本可能扭曲关联",boundary:"现有未校正关联仅描述组织子样本；不能仅凭这些资料确定具体选择偏倚机制或外推全队列"},adjudicationCn:"删除原先超出材料的‘暴露与结局共同导致选择’因果措辞；独立验收同时删除边界选项未经材料确立的碰撞结构判断。"},
"staged-concept-effect-size-remediation":{taskContract:"classification",promptCn:"选择同时明确实施评价主尺度、区间计算层级与点估计是否达到预设实施界值的完整判断。",actionLabelOverrides:{decision:"以集群校正的绝对风险差及区间为实施评价主尺度；当前下降 0.5 个百分点的点估计未达到预设 1 个百分点界值"},adjudicationCn:"原题同时含效应尺度和集群精度两个首要问题；独立验收将所需尺度、区间层级和点估计界值合并为一个完整判断，避免尺度选择与界值结论并列竞争。"},
"staged-concept-confidence-interval-review":{actionLabelOverrides:{decision:"区间兼容小幅下降到超过采用界值的提升；当前既未确认采用价值，也未显示超过预设漏诊伤害"},promptCn:"选择能同时概括效应区间、采用界值与伤害界值的完整结论。",adjudicationCn:"合并原本两个均不越界的结论。"},
"staged-concept-power-apply":{taskContract:"integrated_judgment",requiredActionKeys:["decision","key_check","boundary"],adjudicationCn:"这是样本量/事件数规划与结果解释，不是竞争解释的下一证据题。"},
"staged-concept-censoring-apply":{taskContract:"multi_select_audit",requiredActionKeys:["decision","key_check"],adjudicationCn:"原 ordering 混合动作与边界，缺少唯一科学顺序。独立验收去除‘不能统一右删失’这一正确分类动作的否定复述，只保留事件类型编码和延迟进入风险集两项不冗余任务。"},
"staged-concept-censoring-remediation":{taskContract:"integrated_judgment",requiredActionKeys:["decision","key_check"],adjudicationCn:"诊断 interval censoring 与采用相应方法为并列必要判断。"},
"staged-concept-time-origin-apply":{taskContract:"integrated_judgment",requiredActionKeys:["decision","boundary"],adjudicationCn:"原 O1/O2 重复表达 time-zero alignment；保留对齐与 immortal-time 边界。"},
"staged-concept-batch-effect-review":{actionLabelOverrides:{boundary:"分中心方向相反且区间宽，integration 后的混合不能建立稳定疾病效应"},promptCn:"选择最能概括当前整合结果是否已建立稳定疾病效应的一项判断。",adjudicationCn:"区分后续分析策略与当前证据状态。"},
"staged-concept-pseudobulk-apply":{requiredActionKeys:["decision","key_check","boundary"],adjudicationCn:"是否取消配对属于未发生的替代设计，不是当前场景必要动作。"},
"staged-concept-triangulation-remediation":{taskContract:"integrated_judgment",requiredActionKeys:["decision"],promptCn:"从现有资料中选择最能形成偏倚互补证据组合的一项判断。",adjudicationCn:"scenario 要求选现有互补证据，不应由未来 change-mind 条件决定答案。"},
"staged-concept-evidence-redundancy-apply":{taskContract:"integrated_judgment",requiredActionKeys:["decision"],promptCn:"对现有三类证据按独立性与信息增量排序，选择最完整判断。",adjudicationCn:"原任务是现有证据排序，不是未来证据选择。"},
"staged-concept-negative-result-apply":{taskContract:"classification",promptCn:"依据效应、95% CI、最小重要效应和等效界值，选择当前阴性结果状态。",adjudicationCn:"选项是结果解释而非下一证据。"},
"staged-concept-negative-result-remediation":{taskContract:"classification",promptCn:"依据区间与非劣/等效界值，选择当前证据状态。",adjudicationCn:"原 O4 是等效判定标准而非新证据。"},
"staged-concept-negative-result-review":{taskContract:"classification",promptCn:"依据敏感度差、区间和预设非劣界值，选择当前研究结论。",adjudicationCn:"当前已可判断非劣，未来优效条件不是必要答案。"},
"staged-method-differential-analysis-remediation":{promptCn:"选择继续 group 效应估计前最先必须完成的结构诊断检查。",actionLabelOverrides:{key_check:"同时核对文库→供体映射与 design matrix 秩；任一失败即停止 group 效应估计"},adjudicationCn:"同时覆盖伪重复与完全共线两个根本缺陷。"},
"staged-method-restricted-cubic-spline-review":{actionLabelOverrides:{decision:"现有验证仅为 4.2–6.1 范围内的预测表现提供支持；不能验证 7.0 mmol/L 后的陡升形状"},promptCn:"选择同时写清已验证范围与未验证高端曲线的完整结论。",adjudicationCn:"合并原 O1/O3 两个各自正确但不完整的结论；独立验收将‘确认运输性’收窄为给定范围内预测表现的支持，不由两个汇总指标宣称普遍运输性。"},
"staged-method-roc-auc-remediation":{taskContract:"classification",promptCn:"依据独立队列的区分、校准和阈值净获益，选择当前更可用模型及证据状态。",adjudicationCn:"原场景没有明确错误步骤，实质是模型比较。"},
"staged-method-roc-auc-review":{actionLabelOverrides:{decision:"报告社区性能下降并暂停原阈值推荐；不能把转诊队列 AUC 外推为社区效用"},promptCn:"选择同时概括社区迁移表现和原阈值可用性的完整结论。",adjudicationCn:"合并原 O1/O3 两个合理结论。"},
"staged-method-cellchat-communication-review":{requiredActionKeys:["decision","key_check"],actionLabelOverrides:{key_check:"核对独立供体重现、30 μm 距离定义、蛋白效应区间以及缺失的功能扰动证据"},adjudicationCn:"将原来重叠的结论/边界改成结论 + 证据层级核查。"}
};
export const m0191cFlaggedLogicalIds=new Set<string>([
  "staged-concept-ai-cognitive-outsourcing-remediation",
  "staged-concept-association-causation-apply",
  "staged-concept-association-causation-remediation",
  "staged-concept-association-causation-review",
  "staged-concept-batch-effect-review",
  "staged-concept-biological-technical-replicate-remediation",
  "staged-concept-biological-technical-replicate-review",
  "staged-concept-bulk-mixture-remediation",
  "staged-concept-bulk-mixture-review",
  "staged-concept-censoring-apply",
  "staged-concept-censoring-remediation",
  "staged-concept-claim-boundary-remediation",
  "staged-concept-claim-boundary-review",
  "staged-concept-composition-state-remediation",
  "staged-concept-composition-state-review",
  "staged-concept-confidence-interval-remediation",
  "staged-concept-confidence-interval-review",
  "staged-concept-effect-size-remediation",
  "staged-concept-evidence-claim-remediation",
  "staged-concept-evidence-claim-review",
  "staged-concept-evidence-redundancy-apply",
  "staged-concept-evidence-redundancy-remediation",
  "staged-concept-exploratory-confirmatory-review",
  "staged-concept-hazard-ratio-remediation",
  "staged-concept-hypothesis-remediation",
  "staged-concept-interaction-apply",
  "staged-concept-interaction-remediation",
  "staged-concept-minimal-sufficient-analysis-remediation",
  "staged-concept-negative-result-apply",
  "staged-concept-negative-result-remediation",
  "staged-concept-negative-result-review",
  "staged-concept-overfitting-remediation",
  "staged-concept-p-value-remediation",
  "staged-concept-p-value-review",
  "staged-concept-population-sample-apply",
  "staged-concept-population-sample-remediation",
  "staged-concept-population-sample-review",
  "staged-concept-power-apply",
  "staged-concept-pseudobulk-apply",
  "staged-concept-pseudobulk-remediation",
  "staged-concept-research-question-apply",
  "staged-concept-research-question-remediation",
  "staged-concept-robustness-remediation",
  "staged-concept-robustness-review",
  "staged-concept-selection-bias-apply",
  "staged-concept-selection-bias-remediation",
  "staged-concept-statistical-unit-remediation",
  "staged-concept-time-origin-apply",
  "staged-concept-triangulation-remediation",
  "staged-method-bootstrap-remediation",
  "staged-method-bootstrap-review",
  "staged-method-cellchat-communication-review",
  "staged-method-clustering-remediation",
  "staged-method-cox-regression-remediation",
  "staged-method-differential-abundance-remediation",
  "staged-method-differential-abundance-review",
  "staged-method-differential-analysis-remediation",
  "staged-method-kaplan-logrank-remediation",
  "staged-method-kaplan-logrank-review",
  "staged-method-linear-regression-remediation",
  "staged-method-logistic-regression-remediation",
  "staged-method-nmf-remediation",
  "staged-method-nmf-review",
  "staged-method-pca-remediation",
  "staged-method-pseudobulk-remediation",
  "staged-method-restricted-cubic-spline-remediation",
  "staged-method-restricted-cubic-spline-review",
  "staged-method-roc-auc-remediation",
  "staged-method-roc-auc-review",
  "staged-method-time-dependent-auc-remediation",
  "staged-method-trajectory-pseudotime-remediation",
  "staged-method-trajectory-pseudotime-review",
  "staged-method-wgcna-remediation",
  "staged-method-wgcna-review"
] as const);

/** Zero-based stimulus facts, adjudicated for the 21 targeted repairs; not inferred from task type. */
export const assessmentValidityEvidence: Record<string, Partial<Record<AssessmentActionKey, number[]>>> = {
  "staged-concept-research-question-apply": { decision: [0,1,2,3], key_check: [0,1,2], boundary: [0,1,4] },
  "staged-concept-population-sample-remediation": { boundary: [0,1,2,3] },
  "staged-concept-selection-bias-apply": { decision: [0,1,2], key_check: [0,1,2,3], boundary: [0,1,2,3] },
  "staged-concept-effect-size-remediation": { decision: [0,1,2,3] },
  "staged-concept-confidence-interval-review": { decision: [1,2,3] },
  "staged-concept-power-apply": { decision: [0,1,2], key_check: [2], boundary: [3] },
  "staged-concept-censoring-apply": { decision: [0,1,2,3], key_check: [1] },
  "staged-concept-censoring-remediation": { decision: [0,1,2,3], key_check: [1,2,3] },
  "staged-concept-time-origin-apply": { decision: [0,1,2,3], boundary: [1,2,3] },
  "staged-concept-batch-effect-review": { boundary: [0,1,2,3] },
  "staged-concept-pseudobulk-apply": { decision: [0,1,2,3], key_check: [0,2,3], boundary: [0,1,2] },
  "staged-concept-triangulation-remediation": { decision: [0,1,2,3] },
  "staged-concept-evidence-redundancy-apply": { decision: [0,1,2,3] },
  "staged-concept-negative-result-apply": { decision: [0,1,2,3] },
  "staged-concept-negative-result-remediation": { decision: [0,1,2,3] },
  "staged-concept-negative-result-review": { decision: [0,1,2,3] },
  "staged-method-differential-analysis-remediation": { key_check: [0,1,2,3] },
  "staged-method-restricted-cubic-spline-review": { decision: [0,1,2] },
  "staged-method-roc-auc-remediation": { decision: [0,1,2] },
  "staged-method-roc-auc-review": { decision: [0,1,2,3] },
  "staged-method-cellchat-communication-review": { decision: [0,1,2], key_check: [1,2,3] },
};
