import type { StagedCaseLabV1, StudioTemplateV1 } from "../../domain/curriculum";

interface CaseSeed {
  slug: string; titleCn: string; titleEn: string; theme: string; initial: string; result: string; conflict: string; validation: string; prerequisites: string[]; sources: string[];
}

const caseSeeds: CaseSeed[] = [
  { slug: "topic-to-question", titleCn: "从肿瘤免疫话题到可回答问题", titleEn: "From Topic to Answerable Question", theme: "Topic → Research Question", initial: "团队对‘肿瘤免疫与预后’感兴趣，但总体、暴露、结局和时间都未定义。", result: "既有队列包含治疗前样本、两种平台和三年随访；只有部分患者有匹配组织。", conflict: "导师希望直接进行全组学筛选，临床合作者更关心治疗前风险分层。", validation: "资源只够完成一个主要问题和一个预定义敏感性分析。", prerequisites: ["staged-concept-research-question"], sources: ["src-strobe", "src-remark"] },
  { slug: "evidence-to-claim", titleCn: "从多组学结果到主张边界", titleEn: "From Multi-Omics Evidence to a Bounded Claim", theme: "Evidence → Claim", initial: "肿瘤蛋白组显示 ECM program 与较差结局相关。", result: "调整后的关联仍在，但模型在同一队列内开发且无冻结验证。", conflict: "匹配 RNA 只部分同向，scRNA 未显示 CAF 数量同向增加。", validation: "空间染色在部分区域一致，但无法确认产生蛋白信号的细胞来源。", prerequisites: ["staged-concept-evidence-claim", "staged-concept-rna-protein"], sources: ["src-multiomics", "src-spatial"] },
  { slug: "confounding-observational", titleCn: "观察性治疗效果中的混杂", titleEn: "Confounding in Observational Treatment Effects", theme: "Confounding / observational interpretation", initial: "重症患者更可能接受治疗 A，也更可能发生一年结局。", result: "未调整模型显示治疗 A 与较差结局相关。", conflict: "调整基线严重度后效应减弱；团队还准备调整治疗后的炎症变化。", validation: "负对照结局提示仍可能存在未测量的就医行为差异。", prerequisites: ["staged-concept-confounding", "staged-concept-association-causation"], sources: ["src-dag", "src-strobe"] },
  { slug: "statistical-unit", titleCn: "三万细胞与六名患者", titleEn: "Thirty Thousand Cells and Six Patients", theme: "Statistical unit / pseudoreplication", initial: "两组各三名患者，共测得三万细胞。", result: "逐细胞 Wilcoxon 得到数千个极小 P value。", conflict: "按供体绘图后，一个供体驱动大部分差异，组内异质性很大。", validation: "pseudobulk 后效应方向相似但区间很宽，FDR 不再显著。", prerequisites: ["staged-concept-statistical-unit", "staged-concept-pseudoreplication"], sources: ["src-pseudobulk", "src-pseudorep"] },
  { slug: "overfitting-validation", titleCn: "高 AUC 的稀疏事件模型", titleEn: "A High-AUC Model with Sparse Events", theme: "Model overfitting / validation", initial: "42 个事件、120 个候选特征，团队报告开发 AUC=0.91。", result: "特征筛选、缺失填补和调参均在全数据完成。", conflict: "随机分割后 AUC 波动很大；预处理仍在分割前完成。", validation: "外部小队列 AUC=0.63，校准斜率明显低于 1。", prerequisites: ["staged-concept-overfitting", "staged-concept-data-leakage", "staged-concept-validation"], sources: ["src-tripod", "src-probaST", "src-calibration"] },
  { slug: "negative-result", titleCn: "未显著不是没有效应", titleEn: "Non-Significant Is Not No Effect", theme: "Negative result interpretation", initial: "小型随机实验的主要终点差异 P=0.12。", result: "效应估计方向有利，但 95% CI 同时包含临床重要获益和小幅伤害。", conflict: "团队想写‘两组无差异’，并把多个次要终点中的一个 P=0.04 作为新主要发现。", validation: "研究实际样本量低于方案，失访在两组不均衡。", prerequisites: ["staged-concept-confidence-interval", "staged-concept-power", "staged-concept-negative-result"], sources: ["src-consort", "src-asa-pvalue"] },
  { slug: "omics-subtype-mechanism", titleCn: "分子亚型不是机制", titleEn: "A Molecular Subtype Is Not a Mechanism", theme: "Omics subtype vs mechanism", initial: "NMF 在开发队列中给出四个看似清晰的蛋白组簇。", result: "不同 rank 和初始化下只有两个簇稳定，其余样本分配频繁变化。", conflict: "不稳定簇与结局差异最大，团队希望称为侵袭性机制亚型。", validation: "外部队列只能稳定重现一个连续 program，不能按原规则分成四类。", prerequisites: ["staged-concept-cluster-stability", "staged-concept-claim-boundary"], sources: ["src-nmf", "src-clustering"] },
  { slug: "bulk-single-cell-discordance", titleCn: "Bulk 蛋白组与单细胞转录组不一致", titleEn: "Bulk Proteomics and scRNA Discordance", theme: "Bulk vs single-cell discordance", initial: "bulk proteomics 显示 ECM 蛋白增加。", result: "匹配 bulk RNA 的相关基因集仅弱同向。", conflict: "scRNA 中 CAF 比例和转录程序均未同向增加，但组织捕获区域不同。", validation: "空间蛋白染色提示局部沉积增强，仍无法区分产生与积累。", prerequisites: ["staged-concept-bulk-mixture", "staged-concept-rna-protein", "staged-concept-cross-modal-validation"], sources: ["src-multiomics", "src-spatial"] },
  { slug: "composition-state", titleCn: "细胞比例变化还是细胞状态变化", titleEn: "Composition Change or Within-State Change", theme: "Composition vs within-state expression", initial: "治疗组的 bulk 炎症 signature 更高。", result: "单细胞显示髓系细胞比例增加，但每类髓系细胞的 signature 分数相近。", conflict: "另一种注释方案把部分髓系细胞分到不同亚群，比例效应减弱。", validation: "供体级 pseudobulk 未见清晰 within-state 表达差异。", prerequisites: ["staged-concept-composition-state", "staged-concept-pseudobulk"], sources: ["src-pseudobulk", "src-single-cell-2023"] },
  { slug: "main-figure-chain", titleCn: "从结果仓库选择 Main Figure", titleEn: "Selecting a Main Figure from a Result Warehouse", theme: "Main Figure selection / evidence chain", initial: "项目已有 34 张图：聚类、热图、富集、KM、相关、网络和单细胞结果。", result: "只有部分图直接回答预定义研究问题，多张图重复使用同一数据和同一 signal。", conflict: "团队希望保留全部显著结果；关键外部验证只有一张简单校准图。", validation: "删去重复图后可形成现象—主要关联—稳健性—验证的四步证据链。", prerequisites: ["staged-concept-evidence-claim", "staged-concept-evidence-redundancy"], sources: ["src-strobe", "src-remark"] },
  { slug: "alternative-next-step", titleCn: "用替代解释选择下一项最小分析", titleEn: "Choosing the Next Minimal Analysis from Alternatives", theme: "Alternative explanation / next-step design", initial: "候选 biomarker 与治疗反应相关。", result: "关联可能来自真实预测信息、基线严重度、中心测量差异或结局定义差异。", conflict: "团队可在再做一个复杂模型、中心分层复核或新实验之间选择。", validation: "中心分层和统一结局复核成本最低，且会使三个解释产生不同预测。", prerequisites: ["staged-concept-alternative-explanation", "staged-concept-minimal-sufficient-analysis"], sources: ["src-dag", "src-strobe"] },
  { slug: "ai-plan-audit", titleCn: "审查 AI 生成的生存分析计划", titleEn: "Auditing an AI-Generated Survival Plan", theme: "AI analysis-plan audit", initial: "AI 建议按最优 cut-point 二分所有 biomarker，再用 stepwise Cox 选择显著变量。", result: "计划未定义 time origin、事件、删失、事件数或验证数据。", conflict: "代码可运行并会自动输出 KM、HR、P value 和漂亮森林图。", validation: "研究者重写 estimand、冻结编码、按事件信息控制复杂度并预设验证。", prerequisites: ["staged-concept-ai-cognitive-outsourcing", "staged-concept-time-origin", "staged-concept-overfitting"], sources: ["src-nist-ai-rmf", "src-cox", "src-tripod"] },
];

export const stagedCaseLabs: StagedCaseLabV1[] = caseSeeds.map((seed) => ({
  schemaVersion: 1, id: `staged-case-${seed.slug}`, titleCn: seed.titleCn, titleEn: seed.titleEn, theme: seed.theme,
  capabilityIds: seed.slug === "ai-plan-audit" ? ["ai_oversight", "statistical_reasoning", "result_interpretation"] : ["scientific_question", "result_interpretation", "next_step_design"],
  prerequisiteIds: seed.prerequisites, initialContextCn: seed.initial,
  stages: [
    { id: "context", titleCn: "Stage 0 · 定义当前问题", evidenceCn: seed.initial, reasoningPromptCn: "当前已知、未知和可回答的问题分别是什么？", calibrationCn: "先冻结问题、总体、单位与时间；不得从标题预设最终解释。", updatePromptCn: "校准后，重写你的当前问题或主张边界。" },
    { id: "primary", titleCn: "Stage 1 · 主要证据", evidenceCn: seed.result, reasoningPromptCn: "这项证据提高或降低了哪些解释的可信度？", calibrationCn: "结果只对其设计、测量和分析层负责；同时记录效应、不确定性与仍共享的偏倚。", updatePromptCn: "说明你保留、降级或新增了哪个解释。" },
    { id: "conflict", titleCn: "Stage 2 · 冲突或替代解释", evidenceCn: seed.conflict, reasoningPromptCn: "列出至少两个仍能解释全部证据的模型，并给出区分预测。", calibrationCn: "冲突证据不应被平均掉；它用于暴露测量层、组成、选择或模型灵活性。", updatePromptCn: "哪一项竞争解释现在最值得优先测试？" },
    { id: "validation", titleCn: "Stage 3 · 验证与更新", evidenceCn: seed.validation, reasoningPromptCn: "当前最大可辩护结论是什么，下一项最小充分工作是什么？", calibrationCn: "验证的独立性和测量层必须准确命名；下一步应最大化区分力而非分析数量。", updatePromptCn: "用一句话更新结论，再写停止或升级条件。" },
  ],
  finalTaskCn: ["当前解释", "至少一个竞争解释", "最强证据", "最弱证据", "最大可辩护结论", "下一项最小充分分析或验证", "什么结果会改变判断"],
  sourceIds: seed.sources, contentOrigin: "ai_generated", verificationStatus: "pending", lifecycle: "pending_review",
}));

const paperFields = [
  { id: "question", labelCn: "真实研究问题", promptCn: "作者实际估计或比较了什么？", required: true },
  { id: "design", labelCn: "设计与统计单位", promptCn: "总体、采样、时间和独立单位是什么？", required: true },
  { id: "evidence", labelCn: "主要证据链", promptCn: "每张主图完成什么证据任务？", required: true },
  { id: "claim", labelCn: "最大主张", promptCn: "哪些文字超过或恰好匹配证据？", required: true },
  { id: "alternative", labelCn: "替代解释", promptCn: "最可能改变结论的竞争解释是什么？", required: false },
  { id: "transfer", labelCn: "可迁移结构", promptCn: "哪些项目架构可迁移，而非照搬方法？", required: false },
];

const studio = (id: string, studioType: StudioTemplateV1["studioType"], titleCn: string, purposeCn: string, fieldLabels: string[], level?: StudioTemplateV1["level"]): StudioTemplateV1 => ({
  schemaVersion: 1, id, studioType, titleCn, level, purposeCn,
  fields: fieldLabels.map((label, index) => ({ id: `${id}-field-${index + 1}`, labelCn: label, promptCn: `请先独立记录“${label}”；如使用 AI，随后写下接受或拒绝建议的依据。`, required: index < Math.min(4, fieldLabels.length) })),
  capabilityIds: studioType === "paper" ? ["literature_reading", "result_interpretation"] : studioType === "ai_audit" ? ["ai_oversight", "result_interpretation"] : ["scientific_question", "next_step_design", "result_interpretation"],
  producesTransferArtifact: true, createsCompetence: false, contentOrigin: "ai_generated", verificationStatus: "pending", lifecycle: "pending_review",
});

export const studioTemplates: StudioTemplateV1[] = [
  { ...studio("studio-paper-beginner", "paper", "Paper Studio · Beginner", "用六个核心问题重建一篇论文，不要求一次填写全部高级字段。", paperFields.slice(0, 4).map((field) => field.labelCn), "beginner"), fields: paperFields.slice(0, 4) },
  { ...studio("studio-paper-intermediate", "paper", "Paper Studio · Intermediate", "加入替代解释、方法审计和可迁移证据架构。", paperFields.slice(0, 5).map((field) => field.labelCn), "intermediate"), fields: paperFields.slice(0, 5) },
  { ...studio("studio-paper-advanced", "paper", "Paper Studio · Advanced", "完成审稿式证据—主张图与项目结构迁移。", paperFields.map((field) => field.labelCn), "advanced"), fields: paperFields },
  studio("studio-project-definition", "project", "Project Studio · 项目定义", "冻结问题、总体、estimand、主要证据与停止规则。", ["现象", "知识/决策缺口", "Research Question", "目标 estimand", "主要偏倚", "停止规则"]),
  studio("studio-project-weekly", "project", "Project Studio · 每周复盘", "用追加记录追踪证据与判断变化。", ["本周新增证据", "原判断", "更新后判断", "最大不确定性", "下周最小动作"]),
  studio("studio-project-unexpected", "project", "Project Studio · 意外结果", "先排查错误，再组织竞争解释和区分性测试。", ["意外观察", "数据/流程检查", "竞争解释", "区分预测", "下一项检查"]),
  studio("studio-project-next-step", "project", "Project Studio · 下一步决策", "比较候选行动的信息增益、成本和失败价值。", ["当前主张", "关键缺口", "候选行动", "预期分支", "成本/风险", "选择与理由"]),
  studio("studio-project-figure", "project", "Project Studio · Figure 规划", "为每个 panel 分配问题和证据任务。", ["主问题", "Figure 1 任务", "主要对比", "稳健性", "验证", "可删除冗余"]),
  studio("studio-project-validation", "project", "Project Studio · 验证规划", "准确区分内部、外部、技术、正交和跨模态支持。", ["待验证主张", "验证类型", "独立性", "冻结流程", "成功/失败标准", "推广边界"]),
  studio("studio-ai-plan", "ai_audit", "AI Audit Studio · Plan", "审查 AI 分析计划的问题对齐和推断风险。", ["目标问题", "统计单位", "时间/偏倚", "模型假设", "验证", "拒绝或修改项"]),
  studio("studio-ai-code", "ai_audit", "AI Audit Studio · Code", "以数据契约、测试和 diff 审查 AI 代码。", ["输入/输出契约", "最小真值测试", "边界案例", "API/版本", "人工审查决定"]),
  studio("studio-ai-literature", "ai_audit", "AI Audit Studio · Literature", "逐项核验文献标识符、元数据和主张支持。", ["AI 主张", "来源标识符", "元数据", "原文支持范围", "最终引用决定"]),
  studio("studio-ai-interpretation", "ai_audit", "AI Audit Studio · Interpretation", "拆解 AI 故事中的因果越界和替代解释。", ["观察", "AI 解释", "替代解释", "证据缺口", "最大结论", "研究者决定"]),
];
