import type { ConceptLessonV1, LearningContentRegistryEntryV1, MethodLessonV1, ResearchCaseV1, ResearchGuideSectionV1 } from "../domain/learningArchitecture";
import { researchCaseHash } from "../domain/learningArchitecture";
import type { LearningUnitV1, PracticeAssetBindingV1, PracticeAssetV1 } from "../domain/learningKernel";
import { learningUnitHash, practiceAssetHash } from "../domain/learningKernel";
import { learningUnitById, learningUnits, practiceAssetById } from "./learningUnits";

const activeMeta = {
  schemaVersion: 1 as const,
  revision: 1,
  contentOrigin: "verified_seed" as const,
  verificationStatus: "verified" as const,
  lifecycle: "active" as const,
};

export const guideSections: ResearchGuideSectionV1[] = [
  {
    ...activeMeta, id: "guide-research-not-analysis", contentType: "guide", chapterId: "research-foundations", anchor: "research-not-analysis",
    titleCn: "科研不等于做分析", titleEn: "Research Is Not Running Analyses", classification: "reference_only",
    summaryCn: "分析是回答问题的工具，不是科研问题本身。",
    bodyCn: ["科研从可被证据约束的问题开始：现象是什么、未知是什么、哪些观察能够区分解释。", "方法选择必须服从问题、设计和数据生成过程；得到显著结果并不会自动补上缺失的研究问题。"],
    glossaryTerms: [{ zh: "科研问题", en: "Research Question", definitionCn: "能够由明确研究设计和证据回答、且边界清楚的问题。" }],
    links: [{ type: "case_lab", targetId: "case-evidence-claim-oncology-v1", labelCn: "进入 Evidence → Claim Case Lab" }], evidenceSourceIds: ["src-strobe"],
  },
  {
    ...activeMeta, id: "guide-research-question", contentType: "guide", chapterId: "research-foundations", anchor: "research-question",
    titleCn: "Research Question", titleEn: "Research Question", classification: "threshold_concept",
    summaryCn: "把现象、总体、比较、结局和证据边界组织成可回答的问题。",
    bodyCn: ["好的 Research Question 不只是话题。它明确要解释或估计什么、面向谁、比较什么，以及什么证据会改变判断。", "问题的重要性与可回答性需要同时成立；复杂分析不能挽救模糊问题。"],
    glossaryTerms: [{ zh: "估计目标", en: "Estimand", definitionCn: "研究希望从数据中估计的明确定义量。" }],
    links: [{ type: "case_lab", targetId: "case-evidence-claim-oncology-v1", labelCn: "用分阶段证据练习问题更新" }], evidenceSourceIds: ["src-strobe"],
  },
  {
    ...activeMeta, id: "guide-evidence-claim", contentType: "guide", chapterId: "research-foundations", anchor: "evidence-claim",
    titleCn: "证据与主张", titleEn: "Evidence and Claim", classification: "threshold_concept",
    summaryCn: "最大可辩护结论不能超过设计、测量和验证直接支持的范围。",
    bodyCn: ["观察到关联并不等于建立因果机制；预测性能也不等于生物学解释。", "表达结论时应同时说明最强证据、最弱环节、竞争解释和仍未解决的不确定性。"],
    glossaryTerms: [{ zh: "主张边界", en: "Claim Boundary", definitionCn: "当前证据允许陈述的最大结论范围。" }],
    links: [{ type: "case_lab", targetId: "case-evidence-claim-oncology-v1", labelCn: "审查多组学证据链" }], evidenceSourceIds: ["src-strobe"],
  },
  {
    ...activeMeta, id: "guide-statistical-unit", contentType: "guide", chapterId: "study-design", anchor: "statistical-unit",
    titleCn: "统计单位", titleEn: "Statistical Unit", classification: "threshold_concept",
    summaryCn: "用于推断的独立信息层级由研究问题和分配/采样结构决定。",
    bodyCn: ["细胞、ROI 或重复测量可能提高同一患者的测量精度，但不会自动增加独立患者数。", "把嵌套观测当作独立样本会造成 pseudoreplication，并产生过窄的不确定性。"],
    glossaryTerms: [{ zh: "统计单位", en: "Statistical Unit", definitionCn: "在目标推断中贡献独立信息的单位。" }],
    links: [{ type: "concept_lesson", targetId: "concept-statistical-unit-v1", labelCn: "学习并操作 Hierarchy Explorer" }], evidenceSourceIds: ["src-pseudorep"],
  },
  {
    ...activeMeta, id: "guide-confidence-interval", contentType: "guide", chapterId: "statistics", anchor: "confidence-interval",
    titleCn: "置信区间", titleEn: "Confidence Interval", classification: "threshold_concept",
    summaryCn: "区间表达估计在模型和抽样假设下的不确定性，而不是参数为真的概率。",
    bodyCn: ["区间宽度反映信息量与变异；它应与效应大小和研究问题一起解释。"],
    glossaryTerms: [{ zh: "置信区间", en: "Confidence Interval", definitionCn: "在重复抽样解释下具有指定覆盖率的区间构造。" }],
    links: [], evidenceSourceIds: ["src-strobe"],
  },
];

export const conceptLessons: ConceptLessonV1[] = [
  {
    ...activeMeta, id: "concept-statistical-unit-v1", contentType: "concept_lesson", conceptId: "statistical-unit",
    titleCn: "统计单位", titleEn: "Statistical Unit", capabilityIds: ["study_design", "statistical_reasoning"],
    whyItMattersCn: "单位错了，标准误、P value 和置信区间都可能显得比真实情况更乐观。",
    intuitionCn: "先问每一条信息来自哪个独立来源。一个患者的很多细胞像对同一本书读很多页，不等于拥有很多本独立的书。",
    preciseExplanationCn: "Statistical Unit 是对目标推断贡献独立信息的层级。患者组间推断通常以患者为单位；细胞或 ROI 是嵌套测量，除非问题本身定义在更低层级且模型正确处理依赖。",
    workedExampleCn: "6 名患者每人两个组织块、每块 20 个 ROI。患者组间比较的主要 n 是 6；块和 ROI 可改善患者内测量，但不能写成 n=240 个独立患者级观察。",
    explainPromptCn: "为什么 3 名患者 × 10,000 个细胞不能自动视为患者组间比较的 n=30,000？",
    explanationChecklistCn: ["指出患者级研究问题", "指出细胞共享患者来源而相关", "区分测量精度与独立样本量"],
    interaction: "hierarchy_explorer", unitId: "lu-statistical-unit-v1",
    applyPromptCn: "两组各 6 名患者；每人两个组织块，每块 20 个 ROI。患者组间比较的主要统计单位是什么？为什么？",
    remediationExplanationCn: "观测数量不等于独立来源数量。先把 ROI 按患者重新分组，再问患者组间差异由多少个独立来源支持。",
    remediationPromptCn: "新的样本结构会保留相同原则，但不会复用刚才的题面。",
    applyAssetId: "lu-statistical-unit-v1-independent-v1", remediationAssetId: "pa-m018-statistical-unit-remediation-v1", reviewAssetId: "lu-statistical-unit-v1-review-v1", evidenceSourceIds: ["src-pseudorep"],
  },
  {
    ...activeMeta, id: "concept-confounding-v1", contentType: "concept_lesson", conceptId: "confounding",
    titleCn: "混杂", titleEn: "Confounding", capabilityIds: ["study_design", "statistical_reasoning", "result_interpretation"],
    whyItMattersCn: "混杂会让暴露与结局的关联看起来像目标效应，即使它来自共同原因。",
    intuitionCn: "先画出你相信的数据生成关系，再决定调整；变量多并不等于偏倚少。",
    preciseExplanationCn: "Confounder 是目标暴露与结局的共同原因。是否调整取决于因果问题和结构假设；碰撞点或中介变量不能因为可测就机械加入模型。",
    workedExampleCn: "治疗选择受疾病严重度影响，而严重度也影响结局。未经设计或分析处理的治疗—结局关联混合了治疗差异与基线严重度差异。",
    explainPromptCn: "为什么‘把所有基线变量都放进回归’不是可靠的混杂控制策略？",
    explanationChecklistCn: ["说明共同原因", "说明调整依赖因果结构", "提到 collider/mediator 风险"],
    interaction: "dag_placeholder", unitId: "concept-confounding-v1",
    applyPromptCn: "观察研究中疾病严重度同时影响治疗选择和结局。界定目标问题，并选择可辩护的混杂控制策略。",
    remediationExplanationCn: "变量同时与暴露和结局相关并不足以决定调整。先区分共同原因、中介和碰撞点，再考虑测量时间与目标 estimand。",
    remediationPromptCn: "请在新的职业暴露场景中重新识别共同原因与不应机械调整的变量。",
    applyAssetId: "pa-m018-confounding-apply-v1", remediationAssetId: "pa-m018-confounding-remediation-v1", reviewAssetId: "pa-m018-confounding-review-v1", evidenceSourceIds: ["src-dag"],
  },
];

export const methodLessons: MethodLessonV1[] = [{
  ...activeMeta, id: "method-cox-v1", contentType: "method_lesson", methodId: "cox-regression", titleCn: "Cox 比例风险回归", titleEn: "Cox Proportional Hazards Regression",
  capabilityIds: ["statistical_reasoning", "result_interpretation"], scientificQuestionCn: "协变量如何与 time-to-event 结局的相对瞬时风险相关？",
  inputsCn: ["明确时间起点后的随访时间", "事件状态或删失（censoring）", "预先定义并正确编码的协变量"],
  coreLogicCn: "Cox 模型比较给定时刻仍处于风险集中的个体之相对 hazard；它不是在某一固定时间直接建模生存概率。",
  outputsCn: ["回归系数 β", "Hazard Ratio (HR = expβ)", "Confidence Interval", "P value"],
  assumptionsCn: ["比例风险（proportional hazards）", "时间起点定义正确", "删失机制适当", "函数形式和交互设定合理", "事件数与模型复杂度相称"],
  appropriateWhenCn: ["结局包含时间和事件信息", "目标是估计协变量与相对 hazard 的关联", "关键假设可被检查"],
  inappropriateWhenCn: ["只关心固定时点绝对风险却不做相应估计", "明显非比例风险仍用单一 HR 概括", "时间起点或 immortal time 无法厘清"],
  misusePatternsCn: ["把 HR 解释成绝对风险比", "不说明连续变量每单位含义", "任意或数据驱动调整变量", "事件过少却拟合过多参数", "忽略 PH violation", "无验证地逐步筛选变量"],
  reviewerChecksCn: ["time origin 与 censoring 是否明确", "HR 的单位和参考组", "PH 检查及处理", "变量选择依据", "事件数、缺失数据和验证"],
  paperAppearanceCn: "Methods 应说明时间起点、事件定义、删失、协变量编码、PH 检查与缺失处理；Results 应报告 HR、CI 和绝对风险语境，而不只给 P value。",
  applyPromptCn: "某研究对 42 个事件同时放入 18 个数据驱动筛选的协变量，只报告 HR=1.8、P=0.03，并称风险增加 80%，未说明变量单位、time origin 或 PH 检查。请列出至少三项审稿问题，并写出最大可接受结论。",
  unitId: "method-cox-v1", applyAssetId: "pa-m018-cox-apply-v1", reviewAssetId: "pa-m018-cox-review-v1",
  interactionContract: { kind: "methods_audit", checklistOptionIds: ["time-origin", "events-complexity", "ph", "hr-unit", "selection", "overadjustment"], reasoningRequired: true, maximumConclusionRequired: true },
  guideSectionIds: [], evidenceSourceIds: ["src-cox", "src-pmsampsize"],
}];

const oncologyCaseBase: Omit<ResearchCaseV1, "contentHash"> = {
  ...activeMeta, id: "case-evidence-claim-oncology-v1", contentType: "case_lab", titleCn: "ECM 状态与结局：证据如何改变主张", titleEn: "ECM State and Outcome: Updating the Claim",
  domain: "fictionalized_oncology_omics", difficulty: "intermediate", learningObjectives: ["从现象形成可回答的研究问题", "随新证据更新解释而不越过主张边界", "提出最小充分的下一步"],
  prerequisiteConceptIds: ["statistical-unit", "confounding"], initialContext: "一个虚构、去标识化的肿瘤蛋白组队列包含临床随访。研究团队观察到若干分子状态，但尚不知道这些状态代表细胞组成、细胞状态还是技术/取样差异。",
  stages: [
    { id: "context", titleCn: "Stage 0 · Context", evidenceBlocks: [{ type: "text", titleCn: "现象", bodyCn: "队列中可重复观察到四个蛋白组状态；分组未使用结局信息。" }], structuredPrompt: "当前已知与未知分别是什么？", reasoningPrompt: "写出当前最值得回答的 Research Question。", revealExplanation: "此时应先形成可被后续证据改变的问题，不能预设 ECM 状态的细胞来源或机制。", updatePrompt: "校准后，你会怎样收窄或重写 Research Question？" },
    { id: "proteomics", titleCn: "Stage 1 · Evidence A", evidenceBlocks: [{ type: "numeric_summary", titleCn: "蛋白组结果", values: [{ labelCn: "ECM 状态", value: "ECM-related proteins 较高" }, { labelCn: "结局", value: "与较差随访结局相关" }] }], reasoningPrompt: "什么改变了，什么没有改变？哪种解释更可信？", claimBoundaryPrompt: "蛋白组结果此时最多能建立什么？", revealExplanation: "它支持一个队列内关联，但不能单独建立细胞来源或机制。", updatePrompt: "看过校准后，你会如何更新当前主张边界？" },
    { id: "scrna", titleCn: "Stage 2 · Evidence B", evidenceBlocks: [{ type: "result_snippet", titleCn: "单细胞 RNA", bodyCn: "匹配的独立 scRNA 数据中，没有观察到 CAF transcriptional abundance 的同方向增加。" }], reasoningPrompt: "更新假设并排列竞争解释。", revealExplanation: "discordance 会降低‘CAF 数量增加是唯一来源’的可信度，但并不排除状态变化、蛋白稳定性或取样差异。", updatePrompt: "discordant scRNA 如何改变对 ECM 信号来源的判断？" },
    { id: "spatial", titleCn: "Stage 3 · Conflicting evidence", evidenceBlocks: [{ type: "figure_placeholder", titleCn: "空间/病理结果", bodyCn: "部分肿瘤区域显示 ECM 染色增强，但覆盖不完整，且未证明产生该信号的细胞类型或因果机制。" }], reasoningPrompt: "修订或捍卫当前解释，并指出最强与最弱证据。", claimBoundaryPrompt: "当前最大可辩护结论是什么？", revealExplanation: "空间结果提供局部一致性，却仍不能单独锁定细胞来源或因果机制；结论应保留竞争解释。", updatePrompt: "校准后，是否需要修订最大可辩护结论？" },
  ],
  finalTask: ["当前解释", "竞争解释", "最强证据", "最弱证据", "剩余不确定性", "最大可辩护结论", "下一项最小充分分析或验证"],
  evidenceSourceIds: ["src-multiomics", "src-spatial"],
};

export const researchCases: ResearchCaseV1[] = [{ ...oncologyCaseBase, contentHash: researchCaseHash(oncologyCaseBase) }];

type ArchitectureAssetSeed = Omit<PracticeAssetV1, "schemaVersion" | "revision" | "contentHash" | "difficulty" | "provenance"> & { sourceIds: string[] };

const makeArchitectureAsset = ({ sourceIds, ...seed }: ArchitectureAssetSeed): PracticeAssetV1 => {
  const semantic: Omit<PracticeAssetV1, "contentHash"> = {
    schemaVersion: 1,
    revision: 1,
    difficulty: "foundation",
    ...seed,
    provenance: { contentOrigin: "verified_seed", verificationStatus: "verified", evidenceSourceIds: sourceIds },
  };
  return { ...semantic, contentHash: practiceAssetHash(semantic) };
};

const architectureOnlyPracticeAssets: PracticeAssetV1[] = [
  makeArchitectureAsset({
    id: "pa-m018-statistical-unit-remediation-v1", role: "independent", conceptTarget: "statistical-unit", interaction: "claim_boundary",
    titleCn: "统计单位 · 新补救案例", scenarioCn: "一项纵向研究纳入 9 位受试者，每人采集 5 个时间点并在每个时间点测量 3 个技术孔。",
    promptCn: "患者层变化的暴露与结局相关时，主要独立单位是什么？技术孔和时间点分别贡献什么？",
    options: [{ id: "subject", labelCn: "9 位受试者" }, { id: "timepoint", labelCn: "45 个时间点" }, { id: "well", labelCn: "135 个技术孔" }, { id: "row", labelCn: "全部数据行" }],
    hints: [], rubric: { expectedOptionIds: ["subject"], minReasoningChars: 20, minClaimBoundaryChars: 12 },
    feedback: { correctCn: ["把独立来源定位在受试者层。"], missedCn: ["时间点与技术孔仍共享同一受试者来源。"], overreachCn: ["不能把重复测量或技术孔改写成独立受试者。"], reasoningChainCn: ["明确患者层问题", "画出受试者→时间点→技术孔", "把不确定性对齐独立来源", "限制推广总体"], maximalConclusionCn: "数据可支持这 9 位受试者覆盖总体中的患者层关联估计；重复测量提高轨迹与测量精度。" }, sourceIds: ["src-pseudorep"],
  }),
  makeArchitectureAsset({
    id: "pa-m018-confounding-apply-v1", role: "independent", conceptTarget: "confounding", interaction: "multi_select",
    titleCn: "混杂 · 独立 Apply", scenarioCn: "观察性队列比较治疗 A 与 B。基线疾病严重度影响治疗选择，也影响 1 年结局；治疗后的炎症指标可能受治疗影响。",
    promptCn: "选择所有可辩护判断，并写出理由和最大可接受结论。",
    options: [{ id: "severity-common-cause", labelCn: "基线严重度是需要处理的共同原因候选" }, { id: "adjust-post", labelCn: "机械调整治疗后炎症指标" }, { id: "define-estimand", labelCn: "先定义目标效应与时间顺序" }, { id: "all-baseline", labelCn: "把所有基线变量都加入模型" }],
    hints: [], rubric: { expectedOptionIds: ["severity-common-cause", "define-estimand"], minReasoningChars: 24, minClaimBoundaryChars: 12 },
    feedback: { correctCn: ["识别基线严重度的共同原因角色。", "先明确 estimand 和时间顺序。"], missedCn: ["检查治疗后变量是否是中介或碰撞点。"], overreachCn: ["变量更多不等于偏倚更少，也不能把观察关联直接称为因果效应。"], reasoningChainCn: ["定义暴露、结局与目标效应", "声明共同原因结构", "避免机械调整治疗后变量", "报告残余混杂"], maximalConclusionCn: "在明确结构假设并处理基线严重度后，可报告调整后的观察关联；仍需承认未测量混杂与模型依赖。" }, sourceIds: ["src-dag"],
  }),
  makeArchitectureAsset({
    id: "pa-m018-confounding-remediation-v1", role: "independent", conceptTarget: "confounding", interaction: "multi_select",
    titleCn: "混杂 · 新补救案例", scenarioCn: "职业暴露研究中，年龄影响暴露岗位分配和疾病风险；岗位体检由早期症状影响，也影响进入最终分析样本。",
    promptCn: "选择所有可辩护判断，并说明应优先处理的结构风险。",
    options: [{ id: "age-common-cause", labelCn: "年龄是共同原因候选" }, { id: "condition-screen", labelCn: "无条件按是否体检分层" }, { id: "selection-risk", labelCn: "体检/入组过程可能带来选择偏倚" }, { id: "adjust-everything", labelCn: "调整所有可测变量即可" }],
    hints: [], rubric: { expectedOptionIds: ["age-common-cause", "selection-risk"], minReasoningChars: 24, minClaimBoundaryChars: 12 },
    feedback: { correctCn: ["区分共同原因和选择机制。"], missedCn: ["入组受症状影响时，条件化可能打开非因果路径。"], overreachCn: ["不能用‘已调整很多变量’替代结构论证。"], reasoningChainCn: ["按时间顺序画结构", "识别年龄共同原因", "审查选择/碰撞路径", "限制因果措辞"], maximalConclusionCn: "当前最多支持对结构假设敏感的调整后关联，需报告选择机制与残余偏倚。" }, sourceIds: ["src-dag"],
  }),
  makeArchitectureAsset({
    id: "pa-m018-confounding-review-v1", role: "review", conceptTarget: "confounding", interaction: "multi_select",
    titleCn: "混杂 · 延迟陌生变式", scenarioCn: "一项饮食与结局研究中，健康意识影响饮食选择和就医行为；研究者还计划调整由饮食改变导致的体重变化。",
    promptCn: "延迟回忆：选择所有需要优先审查的结构，并说明最大结论边界。",
    options: [{ id: "awareness", labelCn: "健康意识是共同原因候选" }, { id: "weight-mediator", labelCn: "体重变化可能是中介" }, { id: "pvalue", labelCn: "只要 P<0.05 就不存在混杂" }, { id: "all-adjust", labelCn: "所有变量都应调整" }],
    hints: [], rubric: { expectedOptionIds: ["awareness", "weight-mediator"], minReasoningChars: 24, minClaimBoundaryChars: 12 },
    feedback: { correctCn: ["同时识别共同原因候选与潜在中介。"], missedCn: ["调整集合取决于 estimand。"], overreachCn: ["显著性不证明混杂已控制。"], reasoningChainCn: ["重建时间顺序", "定义目标效应", "选择调整集合", "保留未测量混杂"], maximalConclusionCn: "可报告对指定调整集合敏感的关联估计，不能仅凭模型结果断言因果。" }, sourceIds: ["src-dag"],
  }),
  makeArchitectureAsset({
    id: "pa-m018-cox-apply-v1", role: "independent", conceptTarget: "cox-regression", interaction: "multi_select",
    titleCn: "Cox · Methods audit", scenarioCn: "某研究只有 42 个事件，却同时放入 18 个数据驱动筛选的协变量；只报告 HR=1.8、P=0.03，并称风险增加 80%。",
    promptCn: "勾选全部必须追问的问题，写出简短审稿理由和最大可辩护结论。",
    options: [{ id: "time-origin", labelCn: "time origin 不清楚" }, { id: "events-complexity", labelCn: "事件数与变量复杂度不相称" }, { id: "ph", labelCn: "未报告 PH 检查" }, { id: "hr-unit", labelCn: "HR 的变量单位/参考组不清楚" }, { id: "selection", labelCn: "数据驱动变量选择" }, { id: "overadjustment", labelCn: "可能过度调整或调整不当" }],
    hints: [], rubric: { expectedOptionIds: ["time-origin", "events-complexity", "ph", "hr-unit", "selection", "overadjustment"], minReasoningChars: 28, minClaimBoundaryChars: 16 },
    feedback: { correctCn: ["检查 time origin、事件复杂度、PH、HR 单位与变量选择。"], missedCn: ["任何漏项都可能改变 HR 的可解释性或稳定性。"], overreachCn: ["HR=1.8 不能脱离单位、时间和基线风险直接写成绝对风险增加 80%。"], reasoningChainCn: ["确认 time origin/事件/删失", "审查事件数与自由度", "检查 PH 和函数形式", "明确 HR 单位与参考组", "限制关联性措辞"], maximalConclusionCn: "当前只能说模型报告了 HR=1.8 的条件关联；在时间起点、单位、PH 与模型稳定性澄清前，不能接受‘风险增加 80%’的宽泛结论。" }, sourceIds: ["src-cox", "src-pmsampsize"],
  }),
  makeArchitectureAsset({
    id: "pa-m018-cox-review-v1", role: "review", conceptTarget: "cox-regression", interaction: "multi_select",
    titleCn: "Cox · 延迟陌生审查", scenarioCn: "一项复发研究从手术后 6 个月才纳入仍存活者，却把 time origin 写成手术日；连续 biomarker 的 HR 未说明每单位含义，也未检查 PH。",
    promptCn: "在新的场景中选择全部关键审稿问题，并写出最大可接受结论。",
    options: [{ id: "landmark", labelCn: "纳入规则与 time origin 可能造成 immortal-time/landmark 问题" }, { id: "unit", labelCn: "HR 的 biomarker 单位不清楚" }, { id: "ph", labelCn: "PH 未检查" }, { id: "absolute", labelCn: "单一 HR 不能替代绝对风险语境" }, { id: "ignore", labelCn: "样本量较大即可忽略上述问题" }],
    hints: [], rubric: { expectedOptionIds: ["landmark", "unit", "ph", "absolute"], minReasoningChars: 28, minClaimBoundaryChars: 16 },
    feedback: { correctCn: ["识别进入风险集、单位、PH 与绝对风险语境。"], missedCn: ["time origin 与纳入时点不一致会改变风险集。"], overreachCn: ["大样本不能修复时间定义错误。"], reasoningChainCn: ["重建入组与 time origin", "检查 risk set", "明确单位/参考组", "检查 PH", "收窄主张"], maximalConclusionCn: "在重建正确风险集并澄清单位与 PH 前，只能把该 HR 视为不可充分解释的模型输出。" }, sourceIds: ["src-cox"],
  }),
];

const requiredLegacyAsset = (id: string): PracticeAssetV1 => {
  const asset = practiceAssetById.get(id);
  if (!asset) throw new Error(`M018.1 缺少 legacy Practice Asset：${id}`);
  return asset;
};

export const learningArchitecturePracticeAssets: PracticeAssetV1[] = [
  requiredLegacyAsset("lu-statistical-unit-v1-independent-v1"),
  requiredLegacyAsset("lu-statistical-unit-v1-review-v1"),
  ...architectureOnlyPracticeAssets,
];

const architectureAssetUnitId: Record<string, string> = {
  "lu-statistical-unit-v1-independent-v1": "lu-statistical-unit-v1",
  "lu-statistical-unit-v1-review-v1": "lu-statistical-unit-v1",
  "pa-m018-statistical-unit-remediation-v1": "lu-statistical-unit-v1",
  "pa-m018-confounding-apply-v1": "concept-confounding-v1",
  "pa-m018-confounding-remediation-v1": "concept-confounding-v1",
  "pa-m018-confounding-review-v1": "concept-confounding-v1",
  "pa-m018-cox-apply-v1": "method-cox-v1",
  "pa-m018-cox-review-v1": "method-cox-v1",
};

export const learningArchitecturePracticeBindings: PracticeAssetBindingV1[] = learningArchitecturePracticeAssets.map((asset, index) => ({
  schemaVersion: 1,
  id: `m018-binding-${asset.id}`,
  unitId: architectureAssetUnitId[asset.id],
  assetKind: "learning_practice",
  assetId: asset.id,
  assetRevision: asset.revision,
  assetHash: asset.contentHash,
  role: asset.role,
  order: index + 1,
  hintPolicy: "none",
  feedbackPolicy: "after_lock",
  lockRequired: true,
  confidenceRequired: true,
  competenceEligible: true,
  minStage: asset.role === "review" ? "review_eligible" : "independent_ready",
}));

const makeArchitectureKernelUnit = (input: { id: string; titleCn: string; titleEn: string; domain: LearningUnitV1["domain"]; order: number; terms: string[]; sources: string[] }): LearningUnitV1 => {
  const semantic: Omit<LearningUnitV1, "contentHash"> = {
    schemaVersion: 1, id: input.id, revision: 1, titleCn: input.titleCn, titleEn: input.titleEn, domain: input.domain,
    estimatedMinutes: 10, curriculumOrder: input.order, projectRelevanceTerms: input.terms,
    learningObjectives: ["完成无提示、带信心的标准化 Apply", "在到期后的陌生表面复习中保持核心判断"], blocks: [], prerequisiteEdgeIds: [],
    practiceBindingIds: learningArchitecturePracticeBindings.filter((binding) => binding.unitId === input.id).map((binding) => binding.id),
    delayedReviewPlan: [{ afterDays: 3, role: "review" }, { afterDays: 14, role: "far_transfer" }], evidenceSourceIds: input.sources,
    contentOrigin: "verified_seed", verificationStatus: "verified", scientificRisk: "HIGH", lifecycle: "active",
  };
  return { ...semantic, contentHash: learningUnitHash(semantic) };
};

export const learningArchitectureKernelUnits: LearningUnitV1[] = [
  learningUnitById.get("lu-statistical-unit-v1")!,
  makeArchitectureKernelUnit({ id: "concept-confounding-v1", titleCn: "混杂", titleEn: "Confounding", domain: "experimental_design", order: 4, terms: ["混杂", "观察研究", "因果", "调整"], sources: ["src-dag"] }),
  makeArchitectureKernelUnit({ id: "method-cox-v1", titleCn: "Cox 比例风险回归", titleEn: "Cox Proportional Hazards Regression", domain: "statistics", order: 5, terms: ["Cox", "survival", "生存", "time-to-event", "hazard"], sources: ["src-cox", "src-pmsampsize"] }),
];

export const learningArchitectureUnitById = new Map(learningArchitectureKernelUnits.map((unit) => [unit.id, unit]));
export const learningArchitectureAssetById = new Map(learningArchitecturePracticeAssets.map((asset) => [asset.id, asset]));
export const learningArchitectureBindingByAssetId = new Map(learningArchitecturePracticeBindings.map((binding) => [binding.assetId, binding]));

export const learningContentRegistry: LearningContentRegistryEntryV1[] = [
  ...guideSections.map((section) => ({ schemaVersion: 1 as const, id: section.id, contentType: section.contentType, titleCn: section.titleCn, capabilityIds: [], prerequisiteIds: [], thread: "reference" as const, projectRelevanceTerms: [], estimatedMinutes: 5, rationaleCn: section.summaryCn, contentOrigin: section.contentOrigin, verificationStatus: section.verificationStatus, lifecycle: section.lifecycle, evidenceSourceIds: section.evidenceSourceIds })),
  ...conceptLessons.map((lesson, index) => ({ schemaVersion: 1 as const, id: lesson.id, contentType: lesson.contentType, titleCn: lesson.titleCn, capabilityIds: lesson.capabilityIds, prerequisiteIds: index === 0 ? [] : [conceptLessons[0].id], thread: "foundation" as const, projectRelevanceTerms: lesson.conceptId === "statistical-unit" ? learningUnits[0].projectRelevanceTerms : ["混杂", "观察研究", "因果", "治疗", "cohort"], estimatedMinutes: 10, rationaleCn: lesson.whyItMattersCn, unitId: lesson.unitId, applyAssetId: lesson.applyAssetId, remediationAssetId: lesson.remediationAssetId, reviewAssetId: lesson.reviewAssetId, contentOrigin: lesson.contentOrigin, verificationStatus: lesson.verificationStatus, lifecycle: lesson.lifecycle, evidenceSourceIds: lesson.evidenceSourceIds })),
  ...methodLessons.map((lesson) => ({ schemaVersion: 1 as const, id: lesson.id, contentType: lesson.contentType, titleCn: lesson.titleCn, capabilityIds: lesson.capabilityIds, prerequisiteIds: ["concept-statistical-unit-v1"], thread: "project_overlay" as const, projectRelevanceTerms: ["Cox", "survival", "生存", "time-to-event", "hazard", "随访", "事件"], estimatedMinutes: 10, rationaleCn: lesson.scientificQuestionCn, unitId: lesson.unitId, applyAssetId: lesson.applyAssetId, reviewAssetId: lesson.reviewAssetId, contentOrigin: lesson.contentOrigin, verificationStatus: lesson.verificationStatus, lifecycle: lesson.lifecycle, evidenceSourceIds: lesson.evidenceSourceIds })),
  ...researchCases.map((researchCase) => ({ schemaVersion: 1 as const, id: researchCase.id, contentType: researchCase.contentType, titleCn: researchCase.titleCn, capabilityIds: ["scientific_question", "result_interpretation", "next_step_design"] as LearningContentRegistryEntryV1["capabilityIds"], prerequisiteIds: ["concept-statistical-unit-v1", "concept-confounding-v1"], thread: "project_overlay" as const, projectRelevanceTerms: ["oncology", "肿瘤", "omics", "蛋白组", "ECM"], estimatedMinutes: 12, rationaleCn: researchCase.learningObjectives.join("；"), contentOrigin: researchCase.contentOrigin, verificationStatus: researchCase.verificationStatus, lifecycle: researchCase.lifecycle, evidenceSourceIds: researchCase.evidenceSourceIds })),
];
