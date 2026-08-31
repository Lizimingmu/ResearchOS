import type { AuthoredGuideContent } from "../types";

export const module07InterpretationContent: AuthoredGuideContent[] = [
  {
    titleEn: "Observation versus Meaning", tier: "tier3",
    whyItMattersCn: "把观测直接写成意义，会把测量误差、抽样过程和分析模型藏进一句貌似客观的话，使读者无法判断证据究竟支持到哪一层。",
    intuitionCn: "显微镜上的亮点是记录；称它为免疫激活，已经加入了标记物特异性、细胞来源和生物背景等假设。",
    preciseExplanationCn: ["观察应写成可复核的数据事实，包括对象、尺度、比较与不确定性；意义则是解释模型。Evidence→Claim 审计要逐步问：测量是否代表构念、比较是否识别目标关系、是否还有同样能产生该观察的解释。只有中间环节有依据，动词才可从“检测到”升级为“提示”或“支持”。"],
    biomedicalExample: { setupCn: "结直肠癌切片中，治疗后 CD8 染色面积增加。", dataCn: ["同一患者配对切片的 CD8 阳性面积中位数上升", "取材深度与肿瘤面积也发生变化"], wrongPathCn: "据此宣布治疗激活了肿瘤特异性 T 细胞。", reasoningStepsCn: ["先保留观察：所测切片中的 CD8 阳性面积增加", "再比较浸润、组织组成变化和染色批次三个解释，并用细胞计数、功能标记与批次对照区分"], conclusionCn: "当前支持切片层面的 CD8 信号增加，不足以证明抗原特异功能或治疗机制。" },
    misconceptionCn: ["“图上看得见”不等于解释不含假设；图像生成和标注本身也是测量过程。"],
    boundaryCn: ["即使观察可重复，意义仍只适用于所用标记、组织区域、时间点和样本总体。"],
    connectBackCn: "回接测量效度、分析单位与不确定性。", connectForwardCn: "为结果—机制区分和主张边界提供起点。", evidenceSourceIds: ["src-strobe", "src-strong-inference"]
  },
  {
    titleEn: "A Result Is Not a Mechanism", tier: "tier3",
    whyItMattersCn: "机制语言会引导实验、药物开发和临床推断；若仅凭关联结果升级机制，后续资源可能围绕一个未被识别的过程投入。",
    intuitionCn: "看到门开着不能说明谁开了门，更不能说明开门的完整链条。",
    preciseExplanationCn: ["结果是某设计和模型下的数据关系；机制要求明确实体、方向、时间顺序与过程，并产生可被干预或区分的预测。关联、空间邻近和通路富集可提供机制候选，却不能共同“投票”出因果过程；若它们共享样本或共同混杂，证据数量也不等于独立性。"],
    biomedicalExample: { setupCn: "肿瘤队列中高 YAP 通路分数与转移和较差生存相关。", dataCn: ["bulk RNA 通路分数与转移状态相关", "空间数据中高分区域靠近基质"], wrongPathCn: "写成“基质通过 YAP 驱动转移”。", reasoningStepsCn: ["确认结果只识别队列内共变且可能受肿瘤纯度影响", "设计类器官扰动、时间序列和救援实验，比较 YAP 因果作用与高侵袭肿瘤共同上调两种预测"], conclusionCn: "证据支持 YAP 程序与转移表型相容，驱动路径仍是待检验机制。" },
    misconceptionCn: ["多组相关图并不会自动补足方向、干预和替代路径。"],
    boundaryCn: ["体外扰动即使成功，也首先支持特定模型与条件下的功能，不自动证明人体治疗效应。"],
    connectBackCn: "建立在观察与解释分层上。", connectForwardCn: "连接竞争解释、正交证据和机制深度。", evidenceSourceIds: ["src-strong-inference", "src-strobe"]
  },
  {
    titleEn: "Statistical Credibility versus Biological Plausibility", tier: "tier2",
    whyItMattersCn: "统计上稳定但构念错误的估计和生物故事漂亮但数据脆弱的解释，都可能产生可信外观；两条检查链缺一不可。",
    intuitionCn: "统计可信度检查尺子是否量得准，生物合理性检查量到的东西是否值得这样解释；好尺子不能把错对象变对。",
    preciseExplanationCn: ["统计可信度涉及单位、设计、模型假设、效应区间、缺失与多重分析；生物合理性涉及时间、剂量、定位、已知过程和跨方法一致性。合理性用于提出先验与替代解释，不能作为有偏数据的豁免证；统计显著也不能迫使生物学接受一个没有可行过程的故事。Evidence→Claim 应分别记录两者，再说明汇合程度。"],
    biomedicalExample: { setupCn: "18 名患者的血浆蛋白组发现某细胞因子与免疫毒性强相关。", dataCn: ["经多重校正后区间仍很宽", "该因子在相关免疫细胞中有已知表达"], wrongPathCn: "因机制合理且 P 值小，直接称为临床预测标志物。", reasoningStepsCn: ["检查事件数、批次、采样时间和模型选择造成的统计不确定性", "把已知表达当作可检验背景，再以独立队列和功能测量验证"], conclusionCn: "这是生物上合理的候选关联，预测性能与因果作用均未确立。" },
    misconceptionCn: ["“符合文献”不能修复小样本、选择偏倚或多重探索。"],
    boundaryCn: ["生物学不确定时可降低解释强度，不应反向筛掉所有意外但可靠的观察。"],
    connectBackCn: "回接效应区间和构念效度。", connectForwardCn: "连接意外结果与正交验证。", evidenceSourceIds: ["src-strobe", "src-strong-inference"]
  },
  {
    titleEn: "Alternative Explanation", tier: "tier3",
    whyItMattersCn: "只为首选故事寻找支持会使相关、偏倚和机制候选混在一起；竞争解释迫使下一步产生真正能改变判断的信息。",
    intuitionCn: "好的替代解释不是一句“也许有偏倚”，而是另一张能预测不同后续观察的路线图。",
    preciseExplanationCn: ["先用同一观察分别建立至少两个可行模型，再写出各自独占或概率明显不同的预测，以及能够区分它们的测量。解释应覆盖生物过程、组成、测量、选择与分析选择。Evidence→Claim 只有在首选解释比替代解释预测得更好时才升级；无法区分时应保留并列，而不是用更多同源分析制造确定感。"],
    biomedicalExample: { setupCn: "败血症患者中某单核细胞转录程序与死亡相关。", dataCn: ["死亡者采血更晚且使用更多升压药", "bulk 去卷积提示单核细胞比例也更高"], wrongPathCn: "把程序命名为“致死性单核细胞状态”。", reasoningStepsCn: ["列出细胞内状态、细胞比例、病程时间和药物暴露四个解释", "预测单细胞内表达、绝对计数、早期连续采样与药物分层下各解释应呈现的不同模式"], conclusionCn: "队列显示程序—死亡关联；其细胞内来源和因果角色需区分性证据。" },
    misconceptionCn: ["不能产生不同预测的“替代解释”只是措辞变化，不会指导验证。"],
    boundaryCn: ["列出无限可能也无益；优先处理既可行、又会实质改变主张的解释。"],
    connectBackCn: "承接观察与机制分层。", connectForwardCn: "驱动敏感性分析、正交证据和下一步设计。", evidenceSourceIds: ["src-strong-inference", "src-dag"]
  },
  {
    titleEn: "Confounding Explanation", tier: "tier3",
    whyItMattersCn: "共同原因可在没有目标因果作用时制造暴露—结局关系，显著性、样本量或机械调整都不能自行排除它。",
    intuitionCn: "雨伞与交通事故同时增加，不是雨伞造成事故；天气是两者的共同原因。",
    preciseExplanationCn: ["混杂解释必须针对明确因果问题和时间顺序：变量同时影响暴露与结局且不位于目标效应路径上。应先以领域知识和 DAG 陈述假设，再通过设计、合适调整、负对照或定量敏感性降低风险。调整后关联仍在，只说明对已测且正确建模的混杂较稳健，不能证明不存在残余或未测混杂。"],
    biomedicalExample: { setupCn: "观察性队列比较接受新免疫治疗与常规治疗的生存。", dataCn: ["新治疗患者年龄更轻、体能状态更好", "多变量 Cox 调整了年龄但体能记录缺失较多"], wrongPathCn: "调整后 HR 显著，宣称新治疗延长生存。", reasoningStepsCn: ["画出疾病严重度、治疗选择和生存的因果图，并检查 time zero 对齐", "报告重叠、缺失、调整策略，并量化未测严重度需多强才可解释结果"], conclusionCn: "估计与治疗获益相容，但依赖无未测混杂、正确测量和时间对齐等条件。" },
    misconceptionCn: ["把所有可用变量塞进模型可能调整中介或打开 collider，并不等于控制更多偏倚。"],
    boundaryCn: ["DAG 使假设可见，不会用图形本身证明箭头真实。"],
    connectBackCn: "回接因果问题与变量角色。", connectForwardCn: "连接敏感性分析和主张边界。", evidenceSourceIds: ["src-dag", "src-strobe"]
  },
  {
    titleEn: "Composition Explanation", tier: "tier2",
    whyItMattersCn: "bulk 分子信号是多类细胞贡献的混合；比例变化可模拟细胞内调控，若忽略组成，靶点和机制可能被归错细胞。",
    intuitionCn: "合唱整体音量变大，可能是每个人唱得更响，也可能只是加入了更多高音声部。",
    preciseExplanationCn: ["bulk 丰度可近似看作细胞类型比例与类型内表达的加权和。观察到基因上调时，至少要比较比例变化、类型内状态变化及两者共同发生。去卷积依赖参考、标记特异性和线性等假设，只提供间接分解；绝对细胞计数、分选测量或供体级单细胞分析可提供不同误差结构。"],
    biomedicalExample: { setupCn: "纤维化肝组织 bulk RNA 中 COL1A1 上升。", dataCn: ["病例的成纤维细胞比例更高", "单细胞中每个成纤维细胞的 COL1A1 变化较小"], wrongPathCn: "断言所有肝细胞均被激活并产生胶原。", reasoningStepsCn: ["把总体差异分解为细胞比例与类型内表达", "用组织学绝对面积和供体级 pseudobulk 验证来源"], conclusionCn: "信号主要与成纤维细胞扩增相容，不能泛化为所有细胞的转录激活。" },
    misconceptionCn: ["在回归中加入一个估计比例并不会自动消除参考误差与共线性。"],
    boundaryCn: ["组成调整回答条件化问题；若组成是疾病效应的一部分，需明确是否希望保留这条路径。"],
    connectBackCn: "回接分析单位与混合测量。", connectForwardCn: "连接单细胞验证和层特异证据。", evidenceSourceIds: ["src-pseudobulk", "src-strobe"]
  },
  {
    titleEn: "Measurement Artifact", tier: "tier2",
    whyItMattersCn: "检测限、饱和、误分类和样本处理能生成稳定但非生物的模式；若伪影与组别绑定，增加样本只会更精确地估计偏差。",
    intuitionCn: "温度计卡在上限时，所有高温看起来相同；平坦结果描述的是仪器，不是病人。",
    preciseExplanationCn: ["测量伪影应从构念到仪器输出逐层审查：样本前处理、动态范围、特异性、批内漂移、缺失机制与数据变换。其可检验预测包括与板位、浓度或质控指标相关，以及换测量原理后不复现。重复同一平台主要评估重复性，不能单独证明构念有效。"],
    biomedicalExample: { setupCn: "ELISA 比较重症与轻症患者的高浓度细胞因子。", dataCn: ["多数重症样本达到标准曲线上限", "软件把超范围值记为同一个最大值"], wrongPathCn: "均值差不显著，因此重症不会继续升高。", reasoningStepsCn: ["检查原始曲线、稀释倍数与超范围编码", "重新稀释测量并用质谱或另一抗体对关键样本复核"], conclusionCn: "原数据在高浓度范围不可辨识，不能支持平台期或无差异。" },
    misconceptionCn: ["技术重复很一致只能说明同一测量过程稳定，不保证它测到了目标分子。"],
    boundaryCn: ["换平台一致也需检查两平台是否共享抗体、前处理或同一干扰物。"],
    connectBackCn: "回接测量效度与缺失机制。", connectForwardCn: "连接正交证据和批次伪影。", evidenceSourceIds: ["src-strobe", "src-nist-statistics-handbook"]
  },
  {
    titleEn: "Batch Artifact", tier: "tier2",
    whyItMattersCn: "当批次与条件重合时，技术与生物效应不可由数据唯一分开；事后校正常制造漂亮图，却不能恢复不存在的对照信息。",
    intuitionCn: "若所有病例白天测、所有对照夜间测，就无法知道差异来自疾病还是时段。",
    preciseExplanationCn: ["批次是处理、板、中心、操作者或建库时间造成的系统变化。最佳防线是设计阶段随机化、平衡和桥接样本。分析校正依赖批次内存在生物对比及模型可分性；校正后差异消失可能是真伪影，也可能是算法删除了与批次共线的真实信号，因此必须检查质控、阳性对照和生物信号保留。"],
    biomedicalExample: { setupCn: "病例单细胞样本在新试剂批次建库，对照在旧批次。", dataCn: ["UMAP 按条件完全分离", "线粒体比例和测序深度也随批次变化"], wrongPathCn: "用整合算法混合细胞后称批次已解决。", reasoningStepsCn: ["承认完全共线使条件效应不可辨识", "补做跨批桥接样本，并检查整合前后已知细胞标志与条件对照"], conclusionCn: "当前数据不能把条件与试剂批次分开；整合图不是识别证据。" },
    misconceptionCn: ["UMAP 混合不是无批次的证明，分离也不必然全是批次。"],
    boundaryCn: ["校正应服务明确 estimand；真实中心差异若属于目标使用场景，不应一律抹除。"],
    connectBackCn: "回接设计平衡和可辨识性。", connectForwardCn: "连接稳健性与跨中心异质性。", evidenceSourceIds: ["src-batch", "src-scib"]
  },
  {
    titleEn: "Heterogeneity", tier: "tier2",
    whyItMattersCn: "总体平均可能掩盖不同患者、中心或时间下方向相反的效应；但无约束搜亚组又会把噪声包装成精准医学。",
    intuitionCn: "平均鞋码适合不了任何具体人；然而逐人量到随机波动也不是可靠亚型。",
    preciseExplanationCn: ["异质性要先定义维度和效应尺度，再用交互或分层模型直接估计差异及区间。预设、足够信息和外部重复提高可信度；仅比较“一个亚组显著、另一个不显著”没有检验两者差异。还应区分真实效应修饰、基线风险差异、测量差异与中心实践差异。"],
    biomedicalExample: { setupCn: "随机试验怀疑药物只对高 PD-L1 肿瘤有效。", dataCn: ["高组 HR 0.68，低组 HR 0.89", "分组阈值为看数据后选择"], wrongPathCn: "因高组 P<0.05、低组 P>0.05，宣称存在亚组效应。", reasoningStepsCn: ["在预定义尺度检验 treatment×PD-L1 交互并报告区间", "把阈值探索标记为生成假设，并在独立试验验证连续交互"], conclusionCn: "现有结果提示可能的效应差异，尚未确立可用于治疗选择的亚组。" },
    misconceptionCn: ["森林图点估计不同不等于异质性证据充分。"],
    boundaryCn: ["统计交互依赖尺度；相对效应相同仍可能因基线风险不同产生绝对获益差异。"],
    connectBackCn: "回接交互与多重分析。", connectForwardCn: "连接亚组分析和临床决策价值。", evidenceSourceIds: ["src-interaction", "src-consort"]
  },
  {
    titleEn: "Outliers", tier: "tier2",
    whyItMattersCn: "异常点可能是录入错误、测量失败、真实极端患者或新亚群；自动删除会同时损害透明度和发现能力。",
    intuitionCn: "烟雾报警可能是坏传感器，也可能真有火；第一步是追溯来源，不是拔掉电池。",
    preciseExplanationCn: ["异常应相对于预先定义的测量、模型残差或影响度来描述，而非因其不合故事。审查原始记录、单位、样本链和质控，区分数据错误与合法极端；随后报告包含/排除、稳健估计或变换的影响。若单点决定结论，结论应降级并说明脆弱性。"],
    biomedicalExample: { setupCn: "20 个患者类器官中一个 IC50 比其余高百倍。", dataCn: ["该孔板边缘蒸发明显", "患者样本同时携带罕见耐药突变"], wrongPathCn: "为改善正态性直接删除该患者。", reasoningStepsCn: ["核对原始曲线并重复独立培养，而非只重复同孔", "分别评估技术失败和真实耐药两种解释对模型的预测"], conclusionCn: "在复测前该点来源未定，应呈现影响分析而不能静默删除。" },
    misconceptionCn: ["落在 1.5×IQR 之外不是删除许可，也不自动证明数据错误。"],
    boundaryCn: ["预先规定的质控失败可排除，但仍应报告数量、原因与组别分布。"],
    connectBackCn: "回接数据来源和模型诊断。", connectForwardCn: "连接敏感性分析与意外结果。", evidenceSourceIds: ["src-nist-statistics-handbook", "src-regression-strategies"]
  },
  {
    titleEn: "Negative Results", tier: "tier2",
    whyItMattersCn: "把未达显著阈值写成“没有作用”会忽略估计精度、最小重要效应和测量能力，也会阻断合理的后续设计。",
    intuitionCn: "没听见声音可能因为房间安静，也可能因为麦克风太差；沉默本身不能区分。",
    preciseExplanationCn: ["阴性结果需同时报告效应估计、置信区间、预设阈值、样本信息和数据质量。区间若包含重要获益与伤害，证据是不确定；区间若排除预定义的重要效应，才可支持“没有达到有意义幅度”。还应区分主要终点的预设检验和探索分析，并检查操纵、依从和测量是否足以检出目标变化。"],
    biomedicalExample: { setupCn: "小鼠肿瘤实验比较新药与载体，n=6/组。", dataCn: ["肿瘤体积差 −18%", "95% CI 从 −48% 到 +20%，P=0.28"], wrongPathCn: "结论写“新药无抗肿瘤作用”。", reasoningStepsCn: ["说明区间仍容许较大获益和一定伤害", "检查药物暴露与靶点结合，再决定扩大研究或停止"], conclusionCn: "实验对有意义效应缺乏精度，不能证明无作用。" },
    misconceptionCn: ["事后功效计算不能替代效应区间对信息量的说明。"],
    boundaryCn: ["阴性也可能很有信息，但前提是设计能排除事先定义的有意义范围。"],
    connectBackCn: "回接置信区间和功效。", connectForwardCn: "连接阴性分支与停止规则。", evidenceSourceIds: ["src-confidence-interval", "src-power"]
  },
  {
    titleEn: "Null Results", tier: "tier2",
    whyItMattersCn: "“与零相容”描述统计兼容性，不等于生物等价；混淆二者会把不精确研究误当成反证。",
    intuitionCn: "靶心附近没有命中，可能箭都很接近零，也可能箭散得太开。",
    preciseExplanationCn: ["零假设检验的非拒绝只表示数据未提供足够反对零的证据。等效或非劣问题必须预先给出临床或生物可接受界值，并以相应设计和区间判断是否完整落入界限。零附近的窄区间与跨越大效应的宽区间具有完全不同的科学含义。"],
    biomedicalExample: { setupCn: "两种 qPCR 试剂比较 Ct 差异。", dataCn: ["平均差 0.1 Ct", "95% CI −1.8 到 2.0 Ct，P=0.91"], wrongPathCn: "因 P 很大宣布两试剂等价。", reasoningStepsCn: ["先定义可接受的 Ct 差界值，如基于下游定量用途", "检查区间是否完全落入等效范围，并评估批次和样本类型"], conclusionCn: "当前估计接近零但精度不足，不能确认预定意义下的等效。" },
    misconceptionCn: ["P 值越大不代表越支持零；它也受样本量和变异影响。"],
    boundaryCn: ["贝叶斯支持零同样依赖先验与模型，不能绕开界值和测量问题。"],
    connectBackCn: "回接检验与区间。", connectForwardCn: "连接等效设计和阴性决策分支。", evidenceSourceIds: ["src-confidence-interval", "src-asa-pvalue"]
  },
  {
    titleEn: "Robustness", tier: "tier3",
    whyItMattersCn: "单一分析路径可能因合理但任意的选择而得出结论；稳健性告诉我们主张是否依赖一个脆弱开关。",
    intuitionCn: "桥要在可预期的风、温度和载重变化下仍可用，而不是在同一天重复走十次。",
    preciseExplanationCn: ["稳健性不是换三个软件重复同一假设，而是在合理的预处理、变量编码、模型形式、排除规则和不可验证假设间追踪目标主张。应预先界定合理集合，报告效应与边界如何改变，并指出哪项变化推翻结论。若所有分析共享同一选择偏倚或错误单位，结果一致也不提供对应稳健性。"],
    biomedicalExample: { setupCn: "队列发现炎症评分与复发风险相关。", dataCn: ["连续 Cox HR 1.35", "删去早期复发或改用样条后效应减弱"], wrongPathCn: "只展示最显著的中位数二分 KM 图并称稳健。", reasoningStepsCn: ["固定 estimand 后比较连续/非线性编码、早期事件处理和缺失方案", "绘制所有合理规格的估计区间并识别变化来源"], conclusionCn: "若方向保持但幅度依赖早期事件，主张应限定为敏感的队列内预后关联。" },
    misconceptionCn: ["重复抽样稳定、模型收敛和科学结论稳健是不同问题。"],
    boundaryCn: ["稳健性不能修复系统性偏倚；它只覆盖实际被扰动的选择或假设。"],
    connectBackCn: "回接研究者自由度和模型诊断。", connectForwardCn: "连接敏感性分析与主结论资格。", evidenceSourceIds: ["src-strobe", "src-regression-strategies"]
  },
  {
    titleEn: "Sensitivity Analysis", tier: "tier3",
    whyItMattersCn: "很多关键假设无法由当前数据验证；敏感性分析把“可能有影响”变成可量化的结论变化与推翻条件。",
    intuitionCn: "不是问地图会不会有误，而是问误差要多大、朝哪个方向，才会让路线选择改变。",
    preciseExplanationCn: ["先写出基准分析依赖的具体假设，再选择与该假设匹配的参数或替代方案，例如未测混杂强度、MNAR 偏移量、删失模型或测量误差范围。输出应是目标估计和结论随参数变化的轨迹，并用领域可行范围解释。随意跑很多模型但不对应假设，只是多重分析。"],
    biomedicalExample: { setupCn: "癌症队列中 25% 的生活质量结局缺失，病情重者更易失访。", dataCn: ["MAR 多重插补显示治疗组高 6 分", "完整病例显示高 9 分"], wrongPathCn: "两种结果都显著，因此缺失不影响结论。", reasoningStepsCn: ["设定 MNAR delta，令失访者在给定协变量下平均更差", "找出组间差降至临床重要界值以下所需 delta，并由临床团队判断其可行性"], conclusionCn: "结论对轻度 MNAR 偏移稳健，但在病情重者显著更差的可行情形下会改变。" },
    misconceptionCn: ["敏感性分析不是寻找仍显著的版本，而是显示结论何时变化。"],
    boundaryCn: ["参数范围应有数据或领域依据；超宽范围只说明逻辑可能，不等于现实风险相同。"],
    connectBackCn: "回接缺失机制与不可验证假设。", connectForwardCn: "连接决策阈值和下一步采集。", evidenceSourceIds: ["src-missing", "src-strobe"]
  },
  {
    titleEn: "Subgroup Analysis", tier: "tier2",
    whyItMattersCn: "亚组结论直接影响谁接受治疗；小样本、事后切点和多重搜索极易产生不可复现的差异。",
    intuitionCn: "在许多切法中总能找到一块颜色更深，但只有直接比较分块差异才回答是否真的不同。",
    preciseExplanationCn: ["亚组分析应预定义修饰变量、编码和效应尺度，以治疗×亚组交互直接估计差异并给区间。报告检验数量、亚组样本与事件，保留总体效应背景。探索结果应标记并外部验证；一组显著另一组不显著并非交互证据，因为两组估计都可能不精确且相互兼容。"],
    biomedicalExample: { setupCn: "临床试验按性别报告药物生存效应。", dataCn: ["男性 HR 0.72，P=0.03", "女性 HR 0.91，P=0.31"], wrongPathCn: "宣称药物只对男性有效。", reasoningStepsCn: ["检验预设的治疗×性别交互并报告效应差区间", "检查事件数、多重亚组和绝对风险差"], conclusionCn: "数据支持总体效应；性别差异仍不确定，不能作为用药限制。" },
    misconceptionCn: ["按亚组分别做检验不等于检验亚组之间的效应差异。"],
    boundaryCn: ["即使交互存在，也要验证测量、可重复性和临床阈值后才能用于个体决策。"],
    connectBackCn: "回接异质性与交互。", connectForwardCn: "连接临床 utility 和验证集设计。", evidenceSourceIds: ["src-interaction", "src-consort"]
  },
  {
    titleEn: "Researcher Degrees of Freedom", tier: "tier2",
    whyItMattersCn: "结局、样本、阈值、协变量和模型的灵活选择会放大偶然发现，而最终论文常只留下成功路径。",
    intuitionCn: "射很多箭后再画靶心，会让普通命中看成精准。",
    preciseExplanationCn: ["研究者自由度包括问题形成后的所有可变决策。其风险不只来自恶意 p-hacking，也来自合理选择被结果反馈反复引导。预注册、锁定主要 estimand、版本化分析计划、完整报告规格和独立验证能恢复可审计性；探索仍可进行，但必须与确认性证据分开。"],
    biomedicalExample: { setupCn: "团队分析 60 个细胞因子、三种结局和四个 cut-point。", dataCn: ["只报告最佳因子在 18 个月结局的最小 P 值", "切点由同一队列选择"], wrongPathCn: "称该标志物已被验证。", reasoningStepsCn: ["重建所有尝试并计算有效搜索空间", "把发现锁定为候选，在独立样本按固定规则评价效应与性能"], conclusionCn: "当前是选择后探索信号，普通 P 值和区间偏乐观。" },
    misconceptionCn: ["只做一次最终模型不代表只进行了一次分析；此前选择同样属于流程。"],
    boundaryCn: ["预注册不能保证问题或方法正确，但能区分事前承诺与事后发现。"],
    connectBackCn: "回接多重检验与数据泄漏。", connectForwardCn: "连接稳健性、补充材料和审计轨迹。", evidenceSourceIds: ["src-multiple-testing", "src-strobe"]
  },
  {
    titleEn: "Triangulation", tier: "tier3",
    whyItMattersCn: "不同偏倚结构的证据若对同一有限主张收敛，比在同一数据上重复近似模型更能削弱替代解释。",
    intuitionCn: "从不同方向定位同一坐标比用同一把有偏的尺子量三次更可信。",
    preciseExplanationCn: ["三角互证先定义共同构念与主张，再列每种方法的偏倚方向和独立程度。观察队列、遗传工具、组织定位和扰动实验可各自负责不同证据环节；结论应取它们真正重叠的部分。若样本、预处理、结局标签或关键假设共享，不能把相关结果计作独立复制。分歧也应保留，因为它可能定位边界。"],
    biomedicalExample: { setupCn: "研究 IL6 通路与类风湿疾病活动。", dataCn: ["纵向血浆 IL6 与活动度同步", "滑膜空间定位显示受体附近炎症细胞", "体外阻断降低细胞因子释放"], wrongPathCn: "三类结果共同证明阻断 IL6 可改善所有患者长期结局。", reasoningStepsCn: ["分别标注时间关联、组织相容性和体外功能证据", "检查治疗选择混杂、体外模型边界，并等待随机临床证据评价患者获益"], conclusionCn: "证据收敛支持 IL6 参与所测炎症过程，不足以推出普遍临床效用。" },
    misconceptionCn: ["多模态共享同一批患者是互补支持，不等于独立人群验证。"],
    boundaryCn: ["只有偏倚方向足够不同且共同构念明确时，收敛才实质增加可信度。"],
    connectBackCn: "回接替代解释与证据独立性。", connectForwardCn: "连接正交证据和研究策略。", evidenceSourceIds: ["src-strong-inference", "src-multiomics"]
  },
  {
    titleEn: "Orthogonal Evidence", tier: "tier3",
    whyItMattersCn: "同一平台的重复可能稳定复制同一系统误差；不同测量原理可测试信号究竟属于目标构念还是平台特性。",
    intuitionCn: "身份证、指纹和现场视频比三张同一身份证复印件提供更不同的核验。",
    preciseExplanationCn: ["正交性来自误差来源不同，而不是名称或软件不同。应先指出首个证据最可能的伪影，再选对该伪影不敏感的测量：抗体信号可用质谱、转录定位可用原位杂交、计算亚型可用独立预定义 assay。两者一致提高构念可信度；不一致要求检查时间、尺度和测量对象，不能择优删除。"],
    biomedicalExample: { setupCn: "免疫组化提示肿瘤细胞表达蛋白 X。", dataCn: ["抗体可能与同源蛋白交叉反应", "RNA 原位信号主要位于邻近巨噬细胞"], wrongPathCn: "再用同一抗体做 Western blot 后称独立验证。", reasoningStepsCn: ["用肽段质谱和敲除阳性/阴性对照检验抗体特异性", "用细胞分选或空间共检测确认细胞来源"], conclusionCn: "现有抗体重复支持技术再现，但蛋白身份与肿瘤细胞来源仍未确认。" },
    misconceptionCn: ["换图形、换统计包或换同源数据库通常不改变核心误差结构。"],
    boundaryCn: ["正交结果一致仍可受共同样本选择或共同标签错误影响。"],
    connectBackCn: "回接测量伪影。", connectForwardCn: "连接验证设计和证据链。", evidenceSourceIds: ["src-strong-inference", "src-multiomics"]
  },
  {
    titleEn: "Claim Boundary", tier: "tier3",
    whyItMattersCn: "边界明确才能让读者知道证据在哪些人、何种尺度、哪类关系和什么时间内有效，也能防止结果被二次传播时升级。",
    intuitionCn: "地图上的有效区域与道路同样重要；超出边界后，路线可能根本不存在。",
    preciseExplanationCn: ["主张至少要冻结总体、单位、暴露/干预、结局、时间范围、关系类型和测量层。Evidence→Claim 对照应逐项问：样本支持哪个总体，设计支持描述/预测/因果中的哪类动词，测量直接覆盖哪个构念，区间允许多大效应。超出的部分写成假设或下一步，而非结论。边界不是礼貌性 limitation，而是主张定义的一部分。"],
    biomedicalExample: { setupCn: "单中心回顾性晚期肺癌队列发现影像评分与一年死亡相关。", dataCn: ["评分在同院扫描协议下开发并评价", "未比较现有临床模型的增量价值"], wrongPathCn: "写成“可用于所有肺癌患者的临床决策 AI”。", reasoningStepsCn: ["限定晚期、单中心、既有扫描与一年预后关联", "指出跨中心校准、早期患者、前瞻流程和决策后果均未评价"], conclusionCn: "评分在该回顾性队列中具有内部预后关联；泛化与临床 utility 未知。" },
    misconceptionCn: ["在文末写一句“需更多验证”不能抵消标题和摘要中的越界动词。"],
    boundaryCn: ["边界应随新证据升级并版本化，而不是为了保守永久冻结。"],
    connectBackCn: "整合总体、单位、测量与因果类型。", connectForwardCn: "约束论文结论、图题和转化计划。", evidenceSourceIds: ["src-strobe", "src-tripod"]
  },
  {
    titleEn: "Evidence–Conclusion Mismatch", tier: "tier3",
    whyItMattersCn: "结论错配常不在数字，而在动词、总体或尺度偷偷升级；这会让正确分析承载它无法回答的问题。",
    intuitionCn: "收据能证明一次购买，不能证明商品长期有效；证据文件与结论许可证不相同。",
    preciseExplanationCn: ["逐句拆出结论的对象、关系、强度和适用域，再与设计能力对齐：横断面通常支持同期关联，预测验证支持规定场景的性能，随机干预才更接近分配策略的因果效应。检查代理结局被写成临床获益、训练表现被写成泛化、体外结果被写成人体机制等升级。修复方式是降级措辞或补充能识别缺失环节的证据。"],
    biomedicalExample: { setupCn: "类器官中敲低受体 Z 后细胞活力下降。", dataCn: ["使用单一细胞系来源和高剂量转染", "未做 rescue 或脱靶评估"], wrongPathCn: "结论称 Z 是患者肿瘤的已验证治疗靶点。", reasoningStepsCn: ["当前直接支持特定体外条件下敲低与活力下降", "脱靶、一般毒性和模型特异性仍可解释，需 rescue、多模型与体内安全性证据"], conclusionCn: "Z 是需要特异性验证的体外功能候选，而非已验证临床靶点。" },
    misconceptionCn: ["引用高影响力机制文献不会自动扩大本研究设计的推断能力。"],
    boundaryCn: ["报告指南提高透明度，不等于研究无偏或结论已验证。"],
    connectBackCn: "依赖证据—主张逐级映射。", connectForwardCn: "连接过度主张语言和审稿响应。", evidenceSourceIds: ["src-strobe", "src-strong-inference"]
  },
  {
    titleEn: "What Deserves a Main Conclusion", tier: "tier3",
    whyItMattersCn: "主结论决定摘要、标题和资源投入；把偶然、次要或脆弱结果放入其中会扭曲研究真正回答的问题。",
    intuitionCn: "主结论是判决主文，不是把所有有趣证词抄进最后一页。",
    preciseExplanationCn: ["候选结果应通过四问：是否直接回答预定义主问题；估计与不确定性是否足够；在合理分析和关键偏倚检查下是否保持；主张边界是否能一句说清。统计显著不是入选标准，机制趣味也不能替代设计对齐。若关键结论依赖补充材料中的未展示方法或对照，应把该证据移回主文。"],
    biomedicalExample: { setupCn: "肿瘤标志物研究得到主要连续效应、一个事后亚组和 12 条富集通路。", dataCn: ["连续效应经内部验证仍存在但区间较宽", "亚组和通路未预设且不稳定"], wrongPathCn: "以最显著通路作为标题主结论。", reasoningStepsCn: ["将预设标志物—结局关联及区间作为中心", "把亚组和通路标记为探索，并说明需何种验证才能升级"], conclusionCn: "主结论应是有边界的预后关联，机制和亚组仅作为生成假设。" },
    misconceptionCn: ["“最显著”与“最重要”不是同一排序。"],
    boundaryCn: ["阴性但能排除有意义效应的主要结果，同样可以成为主结论。"],
    connectBackCn: "综合稳健性、主问题和主张边界。", connectForwardCn: "连接主图、摘要与叙事顺序。", evidenceSourceIds: ["src-paper-structure", "src-strobe"]
  },
  {
    titleEn: "What Belongs in the Supplement", tier: "tier2",
    whyItMattersCn: "补充材料应增加透明度而非隐藏支撑主张的关键步骤；放置错误会使主文不可审计或被次要结果淹没。",
    intuitionCn: "仓库可保存零件清单，但承重梁不能从建筑图上消失。",
    preciseExplanationCn: ["主文保留理解主问题、主要设计、关键对照、效应与边界所必需的信息。补充可承载完整诊断、所有预设次要结果、额外规格、代码参数和负结果。若删除某项后读者无法判断主结论是否可靠，它不应只在补充；反之，补充也不能成为选择性堆放显著探索的避风港。"],
    biomedicalExample: { setupCn: "预测模型论文主文只放 AUC，校准和缺失处理在补充。", dataCn: ["校准斜率为 0.62", "28% 关键变量缺失且仅做完整病例"], wrongPathCn: "因篇幅限制不在主文讨论。", reasoningStepsCn: ["识别校准与缺失直接改变模型有效性判断", "将关键结果和限制移入主文，补充保留完整图与参数"], conclusionCn: "支撑性能主张的校准与缺失证据必须在主叙事可见。" },
    misconceptionCn: ["补充材料并不比主文“证据等级低”，但其可见性不能用来掩盖关键风险。"],
    boundaryCn: ["具体期刊篇幅不同，原则是可审计性而非固定图数。"],
    connectBackCn: "回接主结论资格。", connectForwardCn: "连接 Main vs Supplement 和方法复现。", evidenceSourceIds: ["src-strobe", "src-paper-structure"]
  },
  {
    titleEn: "Corroboration versus Redundancy", tier: "tier2",
    whyItMattersCn: "把同源结果当多重支持会夸大信心并消耗图版；真正佐证应改变误差结构或排除具体替代解释。",
    intuitionCn: "同一目击者换三种说法仍是一位证人；第二个独立摄像头才增加新信息。",
    preciseExplanationCn: ["先为每项结果写证据任务、输入样本、关键假设和最可能偏倚。若新分析共享这些元素且不会改变结论或决策，它多半是冗余；若它测量不同层、使用独立队列或产生可区分预测，则可构成 corroboration。相关热图、同一矩阵的 UMAP 与 PCA 通常是不同视图，不是独立证据。"],
    biomedicalExample: { setupCn: "同一 RNA-seq 队列用 GSEA、GSVA 和基因均值展示干扰素信号。", dataCn: ["三者使用同一基因和病例", "独立蛋白测定尚未进行"], wrongPathCn: "称三种方法独立验证通路激活。", reasoningStepsCn: ["标注三者共享表达矩阵与细胞组成偏倚", "选择蛋白、功能测定或独立队列回答具体剩余解释"], conclusionCn: "三个分析相互兼容但主要是同源重复，不能计作三次独立验证。" },
    misconceptionCn: ["算法名称不同并不保证证据独立。"],
    boundaryCn: ["冗余诊断仍可能用于质控，但应明确其工作不是升级生物主张。"],
    connectBackCn: "回接三角互证与正交性。", connectForwardCn: "连接图版选择和最小充分分析。", evidenceSourceIds: ["src-strong-inference", "src-multiomics"]
  },
  {
    titleEn: "Unexpected Results", tier: "tier2",
    whyItMattersCn: "意外结果可能揭示新机制，也可能暴露数据、流程或事后叙事问题；过快兴奋或删除都会失去信息。",
    intuitionCn: "导航把你带到陌生地点时，先核对定位和目的地，再决定是否发现了新路。",
    preciseExplanationCn: ["按顺序处理：冻结原始输出与时间戳；核对样本身份、单位、代码和质控；比较预期模型与若干替代解释；评估多重探索背景；提出能产生不同预测的复现或新实验。事后形成的解释必须标记为探索，不能在摘要中倒写成事前假设。"],
    biomedicalExample: { setupCn: "预期抑制剂降低炎症，却观察到低剂量增加细胞因子。", dataCn: ["效应只在一个板次出现", "该板对照孔也有轻微污染指标"], wrongPathCn: "立即提出“低剂量兴奋”机制并改写研究目的。", reasoningStepsCn: ["复核加药、板位、污染与剂量标签", "在独立批次预设双相曲线并加入靶点占有和 rescue 测量"], conclusionCn: "目前是需复核的意外模式，既不能作为机制发现，也不应无记录删除。" },
    misconceptionCn: ["意外且显著并不自动更“新颖”；选择背景往往使它更需验证。"],
    boundaryCn: ["若质控确认数据错误，应按规则排除并保留审计记录，而非继续生物解释。"],
    connectBackCn: "回接异常点和研究者自由度。", connectForwardCn: "连接结果到新问题和验证分支。", evidenceSourceIds: ["src-strong-inference", "src-strobe"]
  },
  {
    titleEn: "When Discordance Is Informative", tier: "tier3",
    whyItMattersCn: "层间、队列间或方法间不一致不必是失败；若可重复且符合不同过程预测，它能定位时间、尺度和边界。",
    intuitionCn: "两只钟读数不同，差值的规律可能告诉你一只受温度影响，而不是要求把它们平均。",
    preciseExplanationCn: ["先确认比较对象、时间、总体和方向真正可比，再排查身份、批次、功效与测量范围。若不一致持续存在，建立层特异模型：RNA 与蛋白可能受翻译和降解分离，bulk 与单细胞可能受组成分离，队列差异可能来自病例谱。每个模型应给出新预测。不要通过选择权重或删除结果强迫一致。"],
    biomedicalExample: { setupCn: "治疗后肿瘤 IFNG mRNA 上升，但蛋白下降。", dataCn: ["配对 RNA 在 6 小时采集", "蛋白在 48 小时采集且患者使用激素"], wrongPathCn: "只保留 RNA 并宣布通路激活。", reasoningStepsCn: ["核对时间、样本匹配、蛋白检测限和激素暴露", "比较短暂转录脉冲、翻译抑制和细胞组成变化的时间序列预测"], conclusionCn: "当前层间不一致提示动态或调控分离；激活的幅度与持续时间尚不能确定。" },
    misconceptionCn: ["简单取平均会掩盖不同层测量不同构念这一事实。"],
    boundaryCn: ["只有排除明显不可比和技术失败后，discordance 才能承担生物解释。"],
    connectBackCn: "整合层特异证据和替代解释。", connectForwardCn: "将不一致转化为下一项区分性实验。", evidenceSourceIds: ["src-multiomics", "src-strong-inference"]
  }
];
