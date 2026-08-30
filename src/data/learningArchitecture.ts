import type { ConceptLessonV1, MethodLessonV1, ResearchCaseV1, ResearchGuideSectionV1 } from "../domain/learningArchitecture";
import { researchCaseHash } from "../domain/learningArchitecture";

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
    interaction: "hierarchy_explorer", applyAssetId: "pa-statistical-unit-independent-v1", reviewAssetId: "pa-statistical-unit-review-v1", evidenceSourceIds: ["src-pseudorep"],
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
    interaction: "dag_placeholder", applyAssetId: "pa-confounding-apply-v1", reviewAssetId: "pa-confounding-review-v1", evidenceSourceIds: ["src-dag"],
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
  guideSectionIds: [], evidenceSourceIds: ["src-cox", "src-pmsampsize"],
}];

const oncologyCaseBase: Omit<ResearchCaseV1, "contentHash"> = {
  ...activeMeta, id: "case-evidence-claim-oncology-v1", contentType: "case_lab", titleCn: "ECM 状态与结局：证据如何改变主张", titleEn: "ECM State and Outcome: Updating the Claim",
  domain: "fictionalized_oncology_omics", difficulty: "intermediate", learningObjectives: ["从现象形成可回答的研究问题", "随新证据更新解释而不越过主张边界", "提出最小充分的下一步"],
  prerequisiteConceptIds: ["statistical-unit", "confounding"], initialContext: "一个虚构、去标识化的肿瘤蛋白组队列包含临床随访。研究团队观察到若干分子状态，但尚不知道这些状态代表细胞组成、细胞状态还是技术/取样差异。",
  stages: [
    { id: "context", titleCn: "Stage 0 · Context", evidenceBlocks: [{ type: "text", titleCn: "现象", bodyCn: "队列中可重复观察到四个蛋白组状态；分组未使用结局信息。" }], structuredPrompt: "当前已知与未知分别是什么？", reasoningPrompt: "写出当前最值得回答的 Research Question。" },
    { id: "proteomics", titleCn: "Stage 1 · Evidence A", evidenceBlocks: [{ type: "numeric_summary", titleCn: "蛋白组结果", values: [{ labelCn: "ECM 状态", value: "ECM-related proteins 较高" }, { labelCn: "结局", value: "与较差随访结局相关" }] }], reasoningPrompt: "什么改变了，什么没有改变？哪种解释更可信？", claimBoundaryPrompt: "蛋白组结果此时最多能建立什么？", revealExplanation: "它支持一个队列内关联，但不能单独建立细胞来源或机制。" },
    { id: "scrna", titleCn: "Stage 2 · Evidence B", evidenceBlocks: [{ type: "result_snippet", titleCn: "单细胞 RNA", bodyCn: "匹配的独立 scRNA 数据中，没有观察到 CAF transcriptional abundance 的同方向增加。" }], reasoningPrompt: "更新假设并排列竞争解释。", updatePrompt: "discordant scRNA 如何改变对 ECM 信号来源的判断？" },
    { id: "spatial", titleCn: "Stage 3 · Conflicting evidence", evidenceBlocks: [{ type: "figure_placeholder", titleCn: "空间/病理结果", bodyCn: "部分肿瘤区域显示 ECM 染色增强，但覆盖不完整，且未证明产生该信号的细胞类型或因果机制。" }], reasoningPrompt: "修订或捍卫当前解释，并指出最强与最弱证据。", claimBoundaryPrompt: "当前最大可辩护结论是什么？" },
  ],
  finalTask: ["当前解释", "竞争解释", "最强证据", "最弱证据", "剩余不确定性", "最大可辩护结论", "下一项最小充分分析或验证"],
  evidenceSourceIds: ["src-multiomics", "src-spatial"],
};

export const researchCases: ResearchCaseV1[] = [{ ...oncologyCaseBase, contentHash: researchCaseHash(oncologyCaseBase) }];
