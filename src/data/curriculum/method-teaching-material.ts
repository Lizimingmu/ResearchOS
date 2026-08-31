export interface MethodTeachingSupplement {
  walkthroughStepsCn: string[];
  paperReadingExample: { snippetCn: string; readerChecksCn: string[] };
  methodComparisonCn: Array<{ alternativeCn: string; chooseThisWhenCn: string; chooseAlternativeWhenCn: string }>;
}

export const methodTeachingMaterial: Record<string, MethodTeachingSupplement> = {
  "differential-analysis": {
    walkthroughStepsCn: ["把问题写成供体级预定义组间对比", "核对原始计数、样本QC与设计矩阵", "用均值—方差匹配模型估计 log fold change", "同时读取效应、CI/P值与完整检验族 FDR", "回到供体图检查方向、批次和异常驱动", "把结果限制为该测量层的组间差异"],
    paperReadingExample: { snippetCn: "Methods: cells were pooled by diagnosis and compared with a per-cell Wilcoxon test. Results: 4,218 genes had FDR<0.05.", readerChecksCn: ["供体数与统计单位是什么", "分组和批次是否完全重合", "FDR 的检验族及 effect size 是否报告"] },
    methodComparisonCn: [{ alternativeCn: "pseudobulk / mixed model", chooseThisWhenCn: "普通样本级连续或计数结局已有独立行", chooseAlternativeWhenCn: "细胞嵌套供体或同一供体有重复条件" }],
  },
  correlation: {
    walkthroughStepsCn: ["定义两变量、尺度和独立单位", "先画散点并标出中心/供体", "按形状选择 Pearson 或秩相关", "用区间和异常点敏感性读取不确定性", "检查范围限制与共同原因", "只报告共同变化而非方向机制"],
    paperReadingExample: { snippetCn: "A strong correlation (r=0.71, P<0.001) between pathway score and response was observed across 3,000 cells.", readerChecksCn: ["3,000 细胞来自多少供体", "散点是否由组间分离或异常点驱动", "score 与 response 的时间和共同原因"] },
    methodComparisonCn: [{ alternativeCn: "linear regression", chooseThisWhenCn: "只需对称描述两个变量的共同变化", chooseAlternativeWhenCn: "需条件均值、协变量调整或明确预测方向" }],
  },
  "linear-regression": {
    walkthroughStepsCn: ["冻结连续结局与系数尺度", "声明协变量角色和编码", "拟合条件均值并报告系数与CI", "检查残差、非线性和影响点", "做有理由的缺失/函数形式敏感性", "把系数解释限制为设计允许的关联或效应"],
    paperReadingExample: { snippetCn: "Variables with univariable P<0.10 entered a stepwise linear model; the final coefficient was reported as independent effect.", readerChecksCn: ["变量选择是否由目标问题而非P值决定", "函数形式与残差诊断", "‘independent’是否被误写成因果"] },
    methodComparisonCn: [{ alternativeCn: "restricted cubic spline", chooseThisWhenCn: "调整后均值关系在目标范围近似线性", chooseAlternativeWhenCn: "连续暴露有足够信息且线性假设不合理" }],
  },
  "logistic-regression": {
    walkthroughStepsCn: ["定义二元结局、预测/解释目标与time window", "检查事件数、编码与数据分离", "拟合 log-odds 模型并转换到可解释概率", "读取OR、CI及绝对风险", "预测用途另查校准、区分与内部验证", "常见结局下不把OR写成RR"],
    paperReadingExample: { snippetCn: "Odds ratios were interpreted as relative risks; performance was summarized by apparent AUC in the development cohort.", readerChecksCn: ["结局是否常见", "事件信息与参数数", "校准和验证是否独立"] },
    methodComparisonCn: [{ alternativeCn: "log-binomial / Poisson robust", chooseThisWhenCn: "目标是条件odds或二元预测", chooseAlternativeWhenCn: "目标明确是风险比且模型/数据允许" }],
  },
  "cox-regression": {
    walkthroughStepsCn: ["对齐资格、策略/暴露与time zero", "定义事件、删失、竞争事件和风险集", "按事件信息预先限定变量与函数形式", "估计每单位HR与CI而非固定时点风险比", "逐变量和全局检查PH及非线性", "同时给时间点绝对风险语境与验证边界"],
    paperReadingExample: { snippetCn: "Follow-up began at diagnosis, while treated patients were classified at treatment initiation; HR=0.62 was described as a 38% reduction in 5-year mortality.", readerChecksCn: ["诊断到治疗间 immortal time", "HR是否被错当固定时点risk ratio", "PH、事件数和删失处理"] },
    methodComparisonCn: [{ alternativeCn: "Kaplan–Meier / log-rank", chooseThisWhenCn: "需建模协变量与相对瞬时hazard", chooseAlternativeWhenCn: "只需预定义组的非参数生存描述与整体比较" }, { alternativeCn: "RMST / time-varying effect", chooseThisWhenCn: "PH近似可辩护且HR是目标尺度", chooseAlternativeWhenCn: "曲线交叉或临床问题是时间点/累计生存差" }],
  },
  "kaplan-logrank": {
    walkthroughStepsCn: ["统一time zero并逐人定义事件/删失", "在每个事件时刻建立风险集", "连乘条件生存概率形成KM曲线", "同时展示风险表和时点CI", "用预设log-rank比较整体曲线", "曲线交叉或竞争风险时改用匹配目标的方法"],
    paperReadingExample: { snippetCn: "The optimal biomarker cut-point was selected from the same data; KM curves separated and log-rank P=0.02, with no risk table.", readerChecksCn: ["cut-point选择偏倚", "time zero与删失是否一致", "风险表、效应尺度及曲线交叉"] },
    methodComparisonCn: [{ alternativeCn: "Cox regression", chooseThisWhenCn: "关注未经或简单分组的生存经验", chooseAlternativeWhenCn: "需要协变量建模、连续暴露或HR估计" }],
  },
  "restricted-cubic-spline": {
    walkthroughStepsCn: ["保留连续暴露并选可辩护参照", "按信息量预先定结点/自由度", "在回归模型中建立样条基函数", "画调整曲线、CI和数据分布", "检查稀疏尾部与总体/非线性贡献", "不把视觉拐点自动称生物阈值"],
    paperReadingExample: { snippetCn: "Five knots were tried and the curve with the smallest P value was selected; 7.3 was reported as a biological threshold.", readerChecksCn: ["结点与模型是否事后选择", "阈值附近数据密度", "整体关系、非线性和外部验证"] },
    methodComparisonCn: [{ alternativeCn: "linear term / prespecified categories", chooseThisWhenCn: "需平滑描述连续非线性且信息充分", chooseAlternativeWhenCn: "关系近似线性或临床类别有预设含义" }],
  },
  bootstrap: {
    walkthroughStepsCn: ["确定患者/供体等独立重采样单位", "每次有放回抽取同样数量单位", "在每个样本重跑全部选择与拟合", "收集估计、选择频率或乐观差", "用分布形成区间/校正结果", "声明它仍是内部信息而非外部验证"],
    paperReadingExample: { snippetCn: "We bootstrapped 10,000 cells, keeping the selected feature set fixed, and called the result external validation.", readerChecksCn: ["重采样层级是否应为供体", "特征选择是否每次重做", "bootstrap不能创造新场景"] },
    methodComparisonCn: [{ alternativeCn: "cross-validation", chooseThisWhenCn: "关注参数不确定性、选择稳定或乐观校正", chooseAlternativeWhenCn: "关注折外预测与调参数据隔离" }],
  },
  "cross-validation": {
    walkthroughStepsCn: ["按目标部署选择患者/中心/时间分折单位", "每折只在训练部分拟合预处理与特征选择", "需要调参时在训练折内再嵌套", "在保留折计算预设指标", "聚合全部折外预测并估计不确定性", "称为内部验证并说明与目标场景的距离"],
    paperReadingExample: { snippetCn: "Genes were selected once using all samples, followed by repeated 10-fold CV; fold SD was reported as the 95% CI.", readerChecksCn: ["全数据选基因造成泄漏", "重复折并非独立研究", "分折是否保留中心、供体与时间结构"] },
    methodComparisonCn: [{ alternativeCn: "bootstrap", chooseThisWhenCn: "需折外预测或嵌套调参", chooseAlternativeWhenCn: "需乐观校正、参数稳定性或小样本高效重采样" }],
  },
  "roc-auc": {
    walkthroughStepsCn: ["冻结预测时点和二元参照结局", "在未参与开发的数据生成连续分数", "扫阈值得到灵敏度与1-特异度", "报告AUC与CI及预设阈值性能", "另查校准、prevalence和决策后果", "不把排序能力写成临床效用"],
    paperReadingExample: { snippetCn: "A cut-point maximizing Youden index in the development data yielded sensitivity 88% and specificity 81%; AUC 0.84 had no CI.", readerChecksCn: ["cut-point与评价是否同数据", "参照标准和样本谱", "校准及阈值后果"] },
    methodComparisonCn: [{ alternativeCn: "calibration / decision analysis", chooseThisWhenCn: "问题是病例与非病例排序", chooseAlternativeWhenCn: "问题是概率准确或阈值决策净获益" }],
  },
  "time-dependent-auc": {
    walkthroughStepsCn: ["预先指定预测时间和病例/对照定义", "冻结模型与time zero", "处理该时点前删失", "估计AUC(t)及区间", "同步报告风险人数和校准(t)", "避免挑选曲线最高时点"],
    paperReadingExample: { snippetCn: "AUC(t) was plotted monthly and the maximum at 17 months was reported; cumulative/dynamic definition and censoring weights were omitted.", readerChecksCn: ["病例/对照定义", "删失估计与风险人数", "时点是否预设及模型是否外部评价"] },
    methodComparisonCn: [{ alternativeCn: "Harrell C-index", chooseThisWhenCn: "关注指定临床时间的区分", chooseAlternativeWhenCn: "需全随访的总体排序摘要且其可比对定义适用" }],
  },
  pca: {
    walkthroughStepsCn: ["建立样本×特征矩阵并审查缺失/异常", "冻结中心化和是否按特征缩放", "分解出正交scores与loadings", "同时读取解释方差、loadings和元数据", "检查批次、组成与个别样本驱动", "把PC解释为线性变异轴而非自动亚型/机制"],
    paperReadingExample: { snippetCn: "PC1 explained 47% of variance and separated cases from controls; loadings, scaling and batch labels were not reported, so PC1 was named the disease program.", readerChecksCn: ["中心化/缩放和特征过滤", "PC1 loading由哪些变量贡献", "group是否与batch或组成重合"] },
    methodComparisonCn: [{ alternativeCn: "clustering", chooseThisWhenCn: "目标是连续线性变异方向与QC", chooseAlternativeWhenCn: "在明确表征/距离下探索离散分组并审查稳定性" }],
  },
  nmf: {
    walkthroughStepsCn: ["准备非负矩阵并说明变换", "预设候选rank和多次初始化", "比较重构、共识与稳定性", "读取basis与sample coefficients", "冻结新样本投影规则做外部复现", "优先称program，除非离散亚型证据充分"],
    paperReadingExample: { snippetCn: "Rank 4 was chosen because survival P was smallest; one initialization produced four clean clusters.", readerChecksCn: ["rank是否按结局选择", "多初始化/重采样稳定性", "新样本分配和连续结构"] },
    methodComparisonCn: [{ alternativeCn: "PCA", chooseThisWhenCn: "非负加性程序具有科学解释", chooseAlternativeWhenCn: "允许正负loading并关注最大线性方差" }],
  },
  clustering: {
    walkthroughStepsCn: ["冻结样本、特征表征与缩放", "声明距离、算法和候选超参数", "在不看结局时拟合候选结构", "用重采样和扰动检查稳定性", "判断连续谱、软归属或离散簇", "冻结分配器在新样本验证"],
    paperReadingExample: { snippetCn: "k=3 had the largest survival difference and the heatmap looked clearest; no resampling or external assignment was reported.", readerChecksCn: ["结局是否参与选k", "距离/尺度扰动下稳定性", "新样本如何分配"] },
    methodComparisonCn: [{ alternativeCn: "PCA / continuous factor", chooseThisWhenCn: "目标确为离散群组且稳定性可检验", chooseAlternativeWhenCn: "数据主要呈连续轴或只需QC降维" }],
  },
  gsea: {
    walkthroughStepsCn: ["由供体级预定义对比生成完整有方向排名", "冻结基因集数据库与版本", "沿排名计算running sum和leading edge", "选择与设计相符的置换/零模型", "报告NES、FDR和leading edge", "把富集限制为集合成员偏向而非通路激活"],
    paperReadingExample: { snippetCn: "Only genes with P<0.05 were supplied to GSEA; phenotype labels were permuted across 20,000 cells from six donors.", readerChecksCn: ["GSEA是否使用完整排名", "可交换单位是否为供体", "基因集版本、NES/FDR与方向"] },
    methodComparisonCn: [{ alternativeCn: "ORA", chooseThisWhenCn: "有完整连续排名且希望避免任意显著阈值", chooseAlternativeWhenCn: "有预定义候选列表和清楚背景集合" }],
  },
  "gsva-ssgsea": {
    walkthroughStepsCn: ["定义用途是样本级program描述而非组间检验替代", "冻结表达尺度、基因集和算法实现", "按GSVA或ssGSEA计算样本分数", "检查队列组成、批次与分数分布", "以供体/样本为单位做后续比较", "不跨算法直接拼接原始分数或称活性"],
    paperReadingExample: { snippetCn: "GSVA scores from cohort A and ssGSEA scores from cohort B were concatenated and compared per cell as pathway activation.", readerChecksCn: ["两算法尺度与归一化是否可比", "独立单位是否为供体", "分数是否被过度解释为活性"] },
    methodComparisonCn: [{ alternativeCn: "GSEA", chooseThisWhenCn: "需要每个样本的相对program分数", chooseAlternativeWhenCn: "问题是预定义组间完整排名上的集合富集" }],
  },
  wgcna: {
    walkthroughStepsCn: ["以独立样本构建表达矩阵并做QC", "冻结相关、软阈值与模块参数", "识别模块并计算eigengene", "将模块与性状关联并检查批次/组成", "在新队列按冻结定义检查preservation", "把hub称网络内连接特征而非上游因果靶点"],
    paperReadingExample: { snippetCn: "Network parameters were tuned until a module correlated with outcome; the highest-connectivity gene was called a causal regulator.", readerChecksCn: ["参数是否按结局调优", "样本数、批次和细胞组成", "模块保存与hub因果越界"] },
    methodComparisonCn: [{ alternativeCn: "GSEA / predefined sets", chooseThisWhenCn: "目标是从样本相关结构发现候选模块", chooseAlternativeWhenCn: "已有版本化基因集且只需检验其富集" }],
  },
  pseudobulk: {
    walkthroughStepsCn: ["确定最小biological sample×condition×cell type单元", "在该单元汇总原始计数", "保留donor配对、组织和时间结构", "检查每单元细胞数/覆盖与过滤", "用样本级计数模型估计效应、CI和FDR", "报告独立donor数而非细胞总数"],
    paperReadingExample: { snippetCn: "Counts were summed per donor and cell type, ignoring that each donor contributed pre/post-treatment samples; the model used group only.", readerChecksCn: ["聚合键是否丢掉condition", "donor配对如何进入design", "低覆盖与独立n"] },
    methodComparisonCn: [{ alternativeCn: "per-cell mixed model", chooseThisWhenCn: "需要成熟计数工具且样本级组间推断是目标", chooseAlternativeWhenCn: "必须保留细胞级协变量/异质性并能正确建模供体层随机结构" }],
  },
  "differential-abundance": {
    walkthroughStepsCn: ["定义供体层样本和细胞群/邻域", "记录每样本总捕获与目标群计数", "选择count、比例或组成参照模型", "估计供体级差异及区间", "处理邻域/群体多重性与注释敏感性", "将结果限制为相对丰度而非增殖机制"],
    paperReadingExample: { snippetCn: "Treatment and control cells were pooled; a chi-square test on 40,000 cells showed the rare cluster doubled.", readerChecksCn: ["供体级复制和捕获深度", "组成分母与注释稳定性", "多重性及机制措辞"] },
    methodComparisonCn: [{ alternativeCn: "pseudobulk expression", chooseThisWhenCn: "问题是细胞群/邻域比例或计数", chooseAlternativeWhenCn: "问题是同一细胞类型内的基因表达状态" }],
  },
  "trajectory-pseudotime": {
    walkthroughStepsCn: ["明确快照数据能回答的状态排列问题", "冻结表征、邻接图和根的外部依据", "估计伪时间/分支并记录不确定性", "跨供体、算法、根和降维检查稳定性", "用真实时间、谱系或空间证据验证方向", "只提出状态转变假设，不把箭头当真实时间"],
    paperReadingExample: { snippetCn: "A UMAP path from one donor was rooted at the visually leftmost cluster and described as proven differentiation.", readerChecksCn: ["根与方向的外部依据", "供体一致性和算法敏感性", "快照排列与谱系/真实时间的边界"] },
    methodComparisonCn: [{ alternativeCn: "longitudinal / lineage tracing", chooseThisWhenCn: "快照数据用于提出相对状态顺序", chooseAlternativeWhenCn: "问题要求真实时间、祖先后代或因果方向" }],
  },
  "cellchat-communication": {
    walkthroughStepsCn: ["把目标限定为候选配体—受体兼容性", "按供体审查发送/接收群表达与组成", "冻结数据库版本、阈值和归一化", "比较供体层边权及组成敏感性", "用空间邻近增加接触可行性", "用蛋白、阻断/救援与功能读出升级机制"],
    paperReadingExample: { snippetCn: "CellChat found 2,000 significant edges in pooled cells; a denser network in responders was called enhanced signaling.", readerChecksCn: ["供体复制与细胞组成", "数据库/阈值及多重性", "空间和功能验证是否存在"] },
    methodComparisonCn: [{ alternativeCn: "spatial proximity / functional perturbation", chooseThisWhenCn: "需要从表达生成可排序候选边", chooseAlternativeWhenCn: "问题是实际接触、信号传递或功能后果" }],
  },
};
