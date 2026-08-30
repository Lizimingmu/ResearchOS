export interface ResearchTerm {
  english: string;
  chinese: string;
  abbreviation?: string;
  preferred: string;
  definition: string;
  domain: "统计" | "临床" | "预测模型" | "组学" | "单细胞" | "空间组学" | "科研推理";
}

const term = (english: string, chinese: string, definition: string, domain: ResearchTerm["domain"], abbreviation?: string): ResearchTerm => ({
  english, chinese, abbreviation, preferred: abbreviation ? `${chinese}（${english}, ${abbreviation}）` : `${chinese}（${english}）`, definition, domain,
});

export const researchTerms: Record<string, ResearchTerm> = {
  "statistical-unit": term("Statistical Unit", "统计单位", "用于估计不确定性的最小独立单位；嵌套其中的细胞、图像或技术重复不能被当作额外独立样本。", "统计"),
  "biological-replicate": term("Biological Replicate", "生物学重复", "在研究设计下独立取样或独立接受处理的患者、动物、培养物或其他实验单位。", "统计"),
  pseudoreplication: term("Pseudoreplication", "伪重复", "把相关或嵌套观测误当作独立重复，会低估标准误并夸大证据强度。", "统计"),
  confounding: term("Confounding", "混杂", "共同影响暴露与结局、且不位于暴露后因果通路上的因素可能扭曲暴露—结局关联。", "临床"),
  "selection-bias": term("Selection Bias", "选择偏倚", "纳入、排除或结局可观测性与研究关系相关时，分析样本可能产生系统性偏差。", "临床"),
  "missing-data": term("Missing Data", "缺失数据", "缺失处理必须结合缺失机制、分析模型和敏感性分析，完整病例分析并非默认安全。", "统计"),
  "multiple-testing": term("Multiple Testing", "多重检验", "同时检验大量假设会增加偶然发现，需要定义假设族并控制合适的错误率。", "统计", "FDR"),
  "effect-size-vs-p": term("Effect Size vs P Value", "效应量与 P 值", "P 值不等于效应大小、精确度或临床重要性，应优先解释估计值及其不确定性。", "统计"),
  "confidence-interval": term("Confidence Interval", "置信区间", "置信区间展示与数据及模型相容的参数范围，但不能涵盖未建模偏倚。", "统计", "95% CI"),
  "cox-ph": term("Cox Proportional Hazards Model", "Cox 比例风险模型", "用于带删失时间结局的半参数模型；风险比解释依赖比例风险假设、时间起点和变量设定。", "临床", "Cox PH"),
  overfitting: term("Overfitting", "过拟合", "模型学习了开发数据中的偶然特征，导致表观性能优于新数据中的真实表现。", "预测模型"),
  "internal-validation": term("Internal Validation", "内部验证", "通过 bootstrap 或重复交叉验证评估整个开发流程在开发总体中的乐观偏倚。", "预测模型"),
  "external-validation": term("External Validation", "外部验证", "将锁定模型原样应用到时间、地点或临床环境不同的数据中，评价可迁移性。", "预测模型"),
  calibration: term("Calibration", "校准度", "比较预测概率与实际发生概率是否一致，包括校准截距、斜率和校准曲线。", "预测模型"),
  "c-index": term("Concordance Index", "一致性指数", "衡量风险排序与结局排序的一致程度，不代表概率准确或临床效用。", "预测模型", "C-index"),
  "decision-curve": term("Decision Curve Analysis", "决策曲线分析", "在明确临床行动和阈值概率的前提下，用净获益评价模型的潜在决策价值。", "预测模型", "DCA"),
  "competing-risks": term("Competing Risks", "竞争风险", "某类事件发生后会阻止目标事件发生，原因特异风险与累积发生概率回答不同问题。", "临床"),
  "data-leakage": term("Data Leakage", "数据泄漏", "评估集信息进入预处理、特征选择或调参流程，会产生过于乐观的性能估计。", "预测模型"),
  "scrna-deg-pseudobulk": term("Pseudobulk Differential Expression", "伪批量差异表达分析", "按患者与细胞类型聚合计数，以患者等生物学单位完成差异表达推断。", "单细胞", "Pseudobulk DE"),
  "differential-abundance": term("Differential Abundance", "差异丰度", "在样本层面比较细胞状态或群体比例，并处理组成性、捕获深度与生物学重复。", "单细胞", "DA"),
  "trajectory-limits": term("Trajectory Inference", "轨迹推断", "根据高维状态重建相对连续结构，不等同于直接测得时间、方向或谱系。", "单细胞"),
  "cell-communication-limits": term("Cell–Cell Communication", "细胞间通讯", "配体—受体表达提供候选相互作用线索，不能单独证明蛋白活性、方向或因果通讯。", "单细胞"),
  "spatial-colocalization": term("Spatial Colocalization", "空间共定位", "空间邻近或共现是关联证据，不能在缺少重复、分子验证和扰动时解释为机制。", "空间组学"),
  "multiomics-integration": term("Multi-omics Integration", "多组学整合", "联合多个组学层面提取互补信息，必须处理尺度、缺失、批次、泄漏和可解释性。", "组学"),
  "pathway-enrichment": term("Pathway Enrichment", "通路富集分析", "检验基因集合是否在候选列表或排序统计量中富集；富集不等于通路被激活或具有因果作用。", "组学"),
  "gsea-vs-ora": term("GSEA vs Over-representation Analysis", "GSEA 与过度表示分析", "GSEA 利用完整排序，ORA 使用阈值化基因列表；两者都需要明确背景、方向和多重检验。", "组学", "GSEA / ORA"),
  "batch-effect": term("Batch Effect", "批次效应", "由实验批次或平台差异引入的系统变化，若与研究条件重叠可能无法可靠校正。", "组学"),
  "dag-adjustment": term("DAG-guided Covariate Adjustment", "DAG 引导的协变量调整", "先明确因果图，再选择阻断后门路径且不条件化碰撞变量的充分调整集。", "统计", "DAG"),
  "estimand-first": term("Estimand before Estimator", "先明确估计目标", "在选择模型前明确总体、策略、结局、时间范围、伴发事件和目标对比。", "临床"),
  "target-trial-protocol": term("Target-trial Emulation", "目标试验模拟", "把资格、策略、分配、时间零点、随访、结局和分析与假想随机试验协议对齐。", "临床"),
  "immortal-time": term("Immortal-time Bias", "不死时间偏倚", "暴露定义错误地把暴露发生前必然无事件的时间计入暴露组，从而制造虚假获益。", "临床"),
  "nested-resampling": term("Nested Resampling", "嵌套重采样", "在外层评估内部完成全部预处理、特征选择和调参，避免性能评估泄漏。", "预测模型"),
  "sc-differential-abundance": term("Sample-aware Differential Abundance", "样本感知的差异丰度", "以患者或生物样本为独立单位比较细胞组成，并保留样本间变异。", "单细胞", "DA"),
  "velocity-assumptions": term("RNA Velocity", "RNA 速度", "利用剪接与未剪接 RNA 动力学推断局部状态方向，依赖动力学、采样和稳态等假设。", "单细胞"),
  "spatial-autocorrelation": term("Spatial Autocorrelation", "空间自相关", "空间邻近观测往往相关，检验必须使用合适的空间零模型和样本层面推断。", "空间组学"),
};

export const methodTitleZh: Record<string, string> = {
  "time-varying-confounding":"既往治疗影响的时变混杂", "competing-risk-question":"竞争风险估计目标选择", "restricted-cubic-splines":"限制性立方样条", "missingness-mechanism":"缺失机制审核", "multiple-imputation-compatibility":"与实质模型兼容的多重插补", "clustered-outcomes":"聚类结局与统计推断", "repeated-measures-estimand":"重复测量对比", "negative-control":"阴性对照推理", "spectrum-bias":"诊断谱与应用环境", "reference-standard":"参考标准偏倚", "threshold-net-benefit":"决策阈值与净获益", "calibration-hierarchy":"校准度的分层评价", "bootstrap-optimism":"Bootstrap 乐观偏倚校正", "external-validation-size":"外部评价样本量", "precision-recall":"罕见结局性能评价", "prediction-transport":"预测模型可迁移性", "rnaseq-design-matrix":"RNA-seq 设计矩阵", "dispersion-shrinkage":"计数模型离散度收缩", "correlated-gene-sets":"考虑基因相关性的基因集检验", "bulk-deconvolution":"Bulk 去卷积可识别性", "proteomics-imputation":"蛋白质组缺失值策略", "doublet-audit":"双细胞检测审核", "ambient-rna":"环境 RNA 污染", "sctransform-assumptions":"单细胞方差稳定化", "integration-benchmark":"批次整合：少去除，多验证", "annotation-evidence":"细胞类型注释证据", "cnv-from-rna":"基于 RNA 的拷贝数推断", "spatial-spot-resolution":"空间点位混合", "multiomics-latent-factors":"多组学潜在因子解释", "supervised-multiomics":"无泄漏的监督式多组学", "radiomics-reproducibility":"影像组学特征可重复性", "model-development-size":"预测模型开发样本量", "reporting-vs-bias":"报告规范与偏倚风险", "multivariable-adjustment":"多变量调整", "interaction-subgroup":"交互作用与亚组分析", "time-dependent-bias":"时间依赖偏倚", "patient-level-replication":"患者层面的生物学重复", "cluster-annotation":"细胞簇注释", "marker-circularity":"标志物循环论证", "double-dipping":"数据双重使用", "cell-proportion-testing":"细胞比例检验", "discovery-validation":"发现与验证", "feature-selection-leakage":"特征选择泄漏", "cross-validation-misuse":"交叉验证误用", "clustering-stability":"无监督聚类稳定性", "candidate-model-selection":"多候选模型选择", "causal-language":"因果措辞校准", "power-information":"生存分析中的事件数与信息量", "assay-validation":"分析性能验证与临床验证", "model-updating":"验证后的模型更新", "batch-correction-sensitivity":"批次校正敏感性", "spatial-resolution":"空间分辨率与去卷积", "reporting-vs-rigor":"报告规范与研究严谨性",
};

export function getResearchTerm(id: string, englishTitle: string): ResearchTerm {
  return researchTerms[id] ?? term(englishTitle, methodTitleZh[id] ?? englishTitle, `该概念用于识别与“${methodTitleZh[id] ?? englishTitle}”相关的设计、分析和解释边界。`, "科研推理");
}

export function bilingualMethodTitle(id: string, englishTitle: string): string {
  const item = getResearchTerm(id, englishTitle);
  return item.chinese === item.english ? item.english : `${item.chinese}（${item.english}${item.abbreviation ? `, ${item.abbreviation}` : ""}）`;
}
