import type { AuthoredGuideContent } from "../types";

export const module01ScientificReasoningContent: AuthoredGuideContent[] = [
  {
    titleEn: "Research Is Not Running Analyses", tier: "tier1",
    whyItMattersCn: "软件能产生图和 P 值，却不能决定数据究竟允许回答什么。若先做分析再找问题，最漂亮的输出往往只是选择过程的产物。",
    intuitionCn: "研究像临床问诊：检验是针对鉴别诊断取证，不是把所有检查做完再编一个诊断。",
    preciseExplanationCn: ["科学工作先定义目标总体、比较、结局、时间和 estimand，再判断设计能否识别它，最后才选择估计器。分析正确只表示在给定数据与假设下计算正确，不保证问题重要、单位独立或主张可识别。", "同一数据可支持描述、预测或因果三种不同任务；任务改变，分割方式、协变量角色、性能指标和语言边界也随之改变。"],
    biomedicalExample: { setupCn: "某团队有 40 例肿瘤单细胞数据，想寻找免疫治疗标志物。", dataCn: ["每例细胞数 500–9000", "疗效组各 20 人", "先筛 18 万个细胞层差异"], wrongPathCn: "挑最显著基因做 ROC，称其预测并驱动疗效。", reasoningStepsCn: ["先把问题写成治疗前标志物对新患者 6 月应答的预测", "患者才是外推单位，按患者划分训练与验证", "特征筛选必须留在训练折内", "用校准、区分度及临床阈值评价", "机制主张另需扰动证据"], conclusionCn: "这批数据最多开发一个需外部验证的患者层预测候选，不能仅凭差异分析证明机制。" },
    misconceptionCn: ["分析数量多等于证据强；算法高级等于问题高级。"], boundaryCn: ["纯描述性质量控制可以由数据触发，但仍须说明记录对象和用途。"], connectForwardCn: "下一步把兴趣拆成可回答的 Research Question。", evidenceSourceIds: ["src-strobe", "src-strong-inference"]
  },
  {
    titleEn: "Topic, Phenomenon, Problem, and Question", tier: "tier1",
    whyItMattersCn: "把领域名当问题会导致纳入标准、结局和比较不断漂移。四层分清后，文献综述与实验才能围绕同一缺口收敛。",
    intuitionCn: "Topic 是地图，phenomenon 是地图上的烟，problem 是不知道为何起烟造成的行动缺口，question 是可派人验证的坐标。",
    preciseExplanationCn: ["Topic 指广泛领域；phenomenon 是被观察到的规律；problem 是该规律造成的知识或决策缺口；question 则把总体、变量、比较、时间与目标量约束为可由证据判别的句子。", "层级可回溯：问题若被回答，应确实缩小 problem；problem 若解决，应对领域中的理解或决策有价值。"],
    biomedicalExample: { setupCn: "研究者关注‘肿瘤微环境’。", dataCn: ["初诊黑色素瘤中 TCF7+ T 细胞比例差异大", "既往研究与应答相关但时间点混杂"], wrongPathCn: "把题目写成‘肿瘤微环境的单细胞研究’并遍历所有细胞群。", reasoningStepsCn: ["Topic 定为免疫微环境", "Phenomenon 是基线 TCF7+ 比例与应答共变", "Problem 是不清楚其是否提供治疗前增量预测", "Question 限定初诊患者、治疗前测量、6 月应答和现有临床模型比较"], conclusionCn: "可检验的是该比例是否改善新患者的治疗前预测，而非笼统‘研究微环境’。" },
    misconceptionCn: ["有现象就已有研究问题；方法名称可以替代 problem。"], boundaryCn: ["早期侦察可暂用宽 topic，但进入采样或确证前必须落到 question。"], connectBackCn: "承接‘分析服务于问题’。", connectForwardCn: "将 question 写成可审计的 estimand。", evidenceSourceIds: ["src-strong-inference", "src-paper-structure"]
  },
  {
    titleEn: "Research Question", tier: "tier1",
    whyItMattersCn: "问题是设计、数据字典、模型和结论之间的合同。缺一项约束，分析者就能在看过结果后悄悄改变人群、时间或比较。",
    intuitionCn: "把问题想成实验室订购单：样品是谁、何时取、与谁比、测什么、要估计哪个数，任何空栏都会收到‘看似相关但不能用’的货。",
    preciseExplanationCn: ["一个可操作问题至少说明目标总体、研究单位、暴露或策略、比较者、结局定义、time origin、时间窗与 estimand；预测问题还须说明预测时点和使用场景，因果问题还须说明干预版本及反事实对照。", "问题不是模型名。‘做 Cox’可能对应病因关联、治疗效应或风险预测，而三者对协变量、删失、验证和解释责任完全不同。", "审查时反问：若所有模型假设成立，最终数字精确对应哪一个现实量？哪些可能结果会支持、削弱或无法区分主张？"],
    biomedicalExample: { setupCn: "计划研究术后 ctDNA 与结直肠癌复发。", dataCn: ["240 名 II–III 期患者", "术后 4 周 ctDNA", "随访 24 月", "复发 52 例"], wrongPathCn: "问‘ctDNA 是否有预后价值’，用任意起点 Cox 得到 HR 后宣称可指导化疗。", reasoningStepsCn: ["总体限定为术后 4 周仍存活且有合格血样的患者", "暴露定义为预先阈值下的 ctDNA 阳性，预测时点为采血日", "结局定义 24 月影像或病理复发，并规定死亡如何处理", "estimand 选 ctDNA 阳性与阴性的 24 月累积复发风险差及冻结模型的增量预测", "把化疗决策效用留给需比较策略的后续研究"], conclusionCn: "本研究可估计术后 4 周 ctDNA 与 24 月复发风险及其预测增量；不能由观察性预后关联断言按 ctDNA 化疗能改善生存。" },
    misconceptionCn: ["‘是否相关’已经足够具体；主分析模型就是研究问题；数据可得性可在结果后重写总体。"], boundaryCn: ["问题可在可行性阶段迭代，但冻结时间、版本和原因必须可追溯。", "预测、病因和治疗决策问题不可用同一‘独立危险因素’措辞混合。"], connectBackCn: "把 topic/problem 压缩为证据合同。", connectForwardCn: "接着检验合同中的量是否真能被现有证据观察或识别。", evidenceSourceIds: ["src-strobe", "src-strong-inference", "src-target-trial"]
  },
  {
    titleEn: "What Makes a Question Answerable by Evidence", tier: "tier1",
    whyItMattersCn: "有些问题语言上具体，却要求数据从未记录的时间顺序、反事实或尺度；此时更复杂的模型也不会补出信息。",
    intuitionCn: "证据像钥匙：问题必须有对应锁芯；只有相关形状而缺关键齿位，不能靠用力旋转打开。",
    preciseExplanationCn: ["可回答性要求目标构念可操作化、所需对照可观察或在明确假设下可识别、独立信息量足够，并预先说明判别结果。设计性缺口如无对照、错误 time zero 或一个供体，通常不能由统计修复。", "还要区分‘数据可计算’与‘证据可判别’：任何两列都能算相关，但若多个机制产生同样预测，结果不会在解释之间移动信念。"],
    biomedicalExample: { setupCn: "一次横断面活检同时测炎症因子和纤维化。", dataCn: ["120 人单时点", "IL-6 与纤维化评分 r=.42", "无既往样本"], wrongPathCn: "问‘IL-6 是否启动纤维化’，用中介模型回答。", reasoningStepsCn: ["因果问题要求 IL-6 先于纤维化", "单时点不能区分反向因果", "共同病程严重度也能产生相关", "将问题改为同次活检的调整后关联", "纵向采样或干预用于区分机制"], conclusionCn: "现有证据可回答共现关联，不能回答 IL-6 是否启动纤维化。" },
    misconceptionCn: ["能拟合模型就能回答；样本量增加可修复缺失的时间顺序。"], boundaryCn: ["不可识别不等于问题不重要，而是应改变设计或收窄主张。"], connectBackCn: "检验 Research Question 的每个字段。", connectForwardCn: "可回答后再把机制预期写为 hypothesis。", evidenceSourceIds: ["src-strong-inference", "src-strobe"]
  },
  {
    titleEn: "Hypothesis", tier: "tier1",
    whyItMattersCn: "假设若只是‘会显著’，任何方向与机制都可事后解释；可检验假设应在见数据前暴露失败条件。",
    intuitionCn: "假设是机制给数据开的欠条：写明在什么条件下应出现何种差异，也允许证据追债。",
    preciseExplanationCn: ["假设连接一个数据生成机制与可观察预测，需明确方向、单位、条件和可能证伪的模式。统计零假设只是分析约束，不等同生物学假设；一个 P 值也不能在多个机制中自动选胜者。", "好的假设通常带对照与替代解释，并说明效应缺失、反向或仅在某环境出现时如何更新。"],
    biomedicalExample: { setupCn: "怀疑缺氧诱导耐药。", dataCn: ["6 条独立类器官系", "常氧/低氧随机处理", "药物 IC50 与 HIF 靶基因"], wrongPathCn: "假设写成‘低氧组有显著差异’。", reasoningStepsCn: ["机制预期 HIF 激活先于 IC50 上升", "加入 HIF 抑制应削弱耐药", "无药对照排除一般毒性", "跨类器官线评估方向一致性"], conclusionCn: "低氧升高 IC50 且被 HIF 抑制逆转可支持该条件下的 HIF 依赖耐药机制。" },
    misconceptionCn: ["假设必须被证明；零假设不拒绝即机制不存在。"], boundaryCn: ["纯探索阶段可无单一先验假设，但生成的假设必须在新证据中检验。"], connectForwardCn: "随后严格区分原始观察、分析结果与机制解释。", evidenceSourceIds: ["src-strong-inference"]
  },
  {
    titleEn: "Observation, Result, Interpretation, and Conclusion", tier: "tier1",
    whyItMattersCn: "论文常在一句话里从仪器读数跳到机制和临床价值，隐藏了模型、偏倚和外推假设。分层书写能定位哪一步需要证据。",
    intuitionCn: "显微镜照片是足迹，统计摘要是足迹模式，解释是对留下足迹者的推断，结论是法庭允许说到哪里。",
    preciseExplanationCn: ["Observation 是采集记录；result 是按预定处理得到的描述或估计；interpretation 用理论连接结果与机制；conclusion 综合设计、不确定性和替代解释形成受限主张。每向后一层都增加假设。", "审计方式是把一句结论逆向拆回对应数据、变换、比较和排除的解释。"],
    biomedicalExample: { setupCn: "空间转录组观察肿瘤边缘巨噬细胞与耗竭 T 细胞邻近。", dataCn: ["8 位患者", "患者层邻近富集 1.4 倍", "95% CI 1.1–1.8"], wrongPathCn: "写成‘巨噬细胞通过配体 X 导致 T 细胞耗竭并造成免疫治疗失败’。", reasoningStepsCn: ["观察是两个标签在空间坐标共现", "结果是患者层富集估计", "解释可提出细胞互作或共同解剖生态位", "未测蛋白活性与方向性", "结论停在复制的空间关联"], conclusionCn: "两类细胞在所测肿瘤边缘呈患者层空间关联，机制与治疗影响仍待功能验证。" },
    misconceptionCn: ["统计显著的结果可以直接写成机制；Discussion 中加‘可能’即可弥补设计。"], boundaryCn: ["强干预设计可缩短层级间距离，但仍需测量和适用域约束。"], connectBackCn: "假设给出预测，本主题约束结果后的语言。", connectForwardCn: "下一步检查 evidence 是否足以承载 claim。", evidenceSourceIds: ["src-strobe", "src-paper-structure"]
  },
  {
    titleEn: "Evidence versus Claim", tier: "tier1",
    whyItMattersCn: "证据与主张不匹配是过度解释的核心：引用很多、模态很多都可能共享同一偏倚，无法支持更强动词。",
    intuitionCn: "证据是桥墩，claim 是桥面跨度；桥墩数量、独立性和位置共同决定能跨多远。",
    preciseExplanationCn: ["审查证据需看直接性、独立性、设计强度、测量有效性和不确定性。主张则包含总体、方向、因果程度和适用范围；任何维度超出证据都形成缺口。", "同队列 RNA、蛋白和影像的一致可做三角支持，却共享选择和患者组成，不能当三个独立复制。"],
    biomedicalExample: { setupCn: "乳腺癌队列发现基因 Y 高表达与较差生存。", dataCn: ["单中心 96 人", "RNA 与 IHC 同一组织", "细胞系敲低减慢增殖"], wrongPathCn: "宣称 Y 是普适治疗靶点且抑制可改善患者生存。", reasoningStepsCn: ["患者证据支持关联", "IHC 提供正交测量但非独立队列", "细胞系支持特定系统中的功能", "缺少体内治疗窗与临床干预", "限定人群与实验条件"], conclusionCn: "Y 与该队列预后相关，并在所测细胞系参与增殖；作为临床靶点仍属候选。" },
    misconceptionCn: ["有 DOI 即主张被支持；跨模态一致等于外部验证。"], boundaryCn: ["证据等级不是固定排行榜，要相对具体 claim 判断。"], connectForwardCn: "因果 claim 需要比 association 更多结构条件。", evidenceSourceIds: ["src-strobe", "src-strong-inference"]
  },
  {
    titleEn: "Association versus Causation", tier: "tier1",
    whyItMattersCn: "把关联当因果会把标志物误当干预靶点，把选择或共同原因造成的差异误作治疗效果。",
    intuitionCn: "雨伞与湿路同行，不代表收起雨伞能让路变干；共同原因、反向方向和选择机制必须进入图中。",
    preciseExplanationCn: ["Association 是联合分布的特征；因果效应比较同一目标总体在不同干预策略下的反事实结局。识别通常要求一致性、可交换性、positivity、正确时间顺序与测量，并通过随机化或结构假设处理混杂。", "回归调整只在变量角色和模型正确时有帮助；机械加入中介或 collider 反而可能制造偏倚。"],
    biomedicalExample: { setupCn: "观察性 ICU 数据显示接受激素者死亡率更高。", dataCn: ["激素组病情更重", "治疗发生于入院后", "记录 600 人"], wrongPathCn: "调整若干显著变量后称激素导致死亡。", reasoningStepsCn: ["定义启动激素与不启动的目标策略", "对齐资格、分配与 time zero", "严重度是治疗和死亡的共同原因", "处理时间变化治疗与混杂", "检查未测量混杂和 positivity"], conclusionCn: "朴素关联不能识别激素效应；经明确目标试验与假设后才可报告因果估计。" },
    misconceptionCn: ["时间先后自动证明因果；多变量模型能消除全部混杂。"], boundaryCn: ["因果语言强度取决于设计与假设透明度，不只取决于研究标签。"], connectForwardCn: "预测任务可不要求因果，但回答的是另一类问题。", evidenceSourceIds: ["src-dag", "src-strobe"]
  },
  {
    titleEn: "Prediction versus Explanation", tier: "tier1",
    whyItMattersCn: "混淆目标会把高 AUC 特征误称病因，或因系数难解释而丢弃有用预测信息。",
    intuitionCn: "气压计能预报风暴却不制造风暴；预测问‘将发生什么’，解释问‘改变什么会怎样’。",
    preciseExplanationCn: ["预测关注对未见单位的校准、区分和效用，允许代理特征但要求部署时可得；解释关注参数对应的关系或机制，需要结构、函数形式和偏倚论证。", "同一变量可在两任务中出现，但患者分割、缺失处理、协变量选择和结论语言不同。"],
    biomedicalExample: { setupCn: "胸片模型预测 48 小时 ICU 转入。", dataCn: ["医院标记与设备型号高度相关", "内部 AUC .91", "外院 AUC .63"], wrongPathCn: "用 saliency 图称设备相关区域揭示肺损伤机制。", reasoningStepsCn: ["定义预测时点可用信息", "按医院外部验证", "检查设备代理与漂移", "报告校准与阈值效用", "机制另需生理测量"], conclusionCn: "模型在本院可排序风险但外部泛化不足；高性能不证明影像特征具有因果机制。" },
    misconceptionCn: ["可解释模型就是因果模型；高 AUC 的变量是最佳治疗靶点。"], boundaryCn: ["预测模型可服务决策，但干预净效用需单独评价。"], connectForwardCn: "价值判断还需区分 novelty 与 importance。", evidenceSourceIds: ["src-tripod", "src-probaST"]
  },
  {
    titleEn: "Why Unstudied Does Not Mean Important", tier: "tier2",
    whyItMattersCn: "‘尚无人做’只描述文献状态，不说明答案会改变知识或决策，也不保证问题可行。",
    intuitionCn: "地图上的空白可能是新大陆，也可能是无人需要测量的停车位。",
    preciseExplanationCn: ["重要缺口需同时连接有后果的未知、可区分的答案和可行动的后续。无人研究可能源于低价值、不可测量或已有更一般结论。", "论证应回答谁因未知而做错决定、哪种结果会改变路线、为何当前设计能可靠减少不确定性。"],
    biomedicalExample: { setupCn: "拟研究一种罕见染色组合与某癌症预后。", dataCn: ["本院仅 14 例", "组合由 8 个阈值搜索得到", "无机制先验"], wrongPathCn: "以 PubMed 无同题论文作为创新与重要性的充分理由。", reasoningStepsCn: ["明确临床决策缺口", "估计可获得事件数", "检查组合是否可重复测量", "比较更简单现有标志物", "先作为探索候选"], conclusionCn: "文献空白可生成候选，但当前不足以证明重要或支持确证性预后主张。" },
    misconceptionCn: ["零检索结果等于原创；稀有必然重要。"], boundaryCn: ["罕见病问题可因高疾病负担而重要，但仍需多中心或合适设计。"], connectForwardCn: "接着分别审查 novelty 和 importance。", evidenceSourceIds: ["src-paper-reading", "src-paper-structure"]
  },
  {
    titleEn: "Novelty versus Importance", tier: "tier1",
    whyItMattersCn: "只追求不同会制造方法堆砌；只说重要而无新增证据又无法推进领域。两条轴要分别论证。",
    intuitionCn: "新颖是路线以前没人走，重要是走通后能到值得去的地方。",
    preciseExplanationCn: ["Novelty 可来自新问题、总体、设计、测量或整合；importance 来自对机制、决策、普适性或资源配置的预期改变。方法首次用于某疾病通常是弱 novelty，除非产生此前不可得的判别证据。", "评价时写出相对哪项既有工作不同，以及答案为正、负或不确定时分别改变什么。"],
    biomedicalExample: { setupCn: "把新聚类算法用于公开肺癌 RNA 数据。", dataCn: ["算法可分 7 群", "旧方法分 4 群", "无外部结局或稳定性"], wrongPathCn: "以算法首次用于肺癌称发现新亚型。", reasoningStepsCn: ["检验重采样稳定性", "与既有分类增量比较", "用独立队列复现", "连接可干预生物或临床任务"], conclusionCn: "目前仅展示不同聚类方案；其新颖性有限，重要性尚未由稳定、外部或决策证据建立。" },
    misconceptionCn: ["新工具自动产生新知识；显著差异自动代表临床重要。"], boundaryCn: ["基础机制研究的重要性可体现为改变解释而非即时临床效用。"], connectForwardCn: "证据路线还取决于探索或确证定位。", evidenceSourceIds: ["src-paper-structure", "src-paper-reading"]
  },
  {
    titleEn: "Exploratory versus Confirmatory Research", tier: "tier1",
    whyItMattersCn: "探索自由度若用确证语言报告，会把选择后的极端结果当作预先检验的证据。",
    intuitionCn: "探索是在森林中找路，确证是带着事先画好的路线验证能否重复到达。",
    preciseExplanationCn: ["探索允许多视角、模型和阈值以发现模式，但需完整披露搜索空间并把结果标为假设生成；确证需要预定义主要问题、分析族、误差控制和偏离处理。", "两者不是质量等级，可在同一项目分阶段存在；关键是独立数据和冻结流程隔离发现与验证。"],
    biomedicalExample: { setupCn: "蛋白组比较 12 名应答者与 12 名非应答者。", dataCn: ["测 5000 蛋白", "尝试 4 种归一化", "筛得蛋白 Z P=.002"], wrongPathCn: "只报告最佳流程并称确证 Z。", reasoningStepsCn: ["记录全部流程与多重性", "报告效应和 FDR", "冻结标志物与方向", "在新患者按预定 assay 验证"], conclusionCn: "Z 是搜索产生的候选；只有独立、冻结的验证才能承担确证主张。" },
    misconceptionCn: ["探索无需严谨；注册过就自动确证。"], boundaryCn: ["预注册后大量偏离可合理但必须透明，并相应降低确证强度。"], connectForwardCn: "这种阶段隔离具体化为 discovery 与 validation。", evidenceSourceIds: ["src-strong-inference", "src-asa-pvalue"]
  },
  {
    titleEn: "Discovery versus Validation", tier: "tier1",
    whyItMattersCn: "在同一数据反复挑选和评价会产生乐观偏倚；简单随机留出也可能共享中心、批次和患者生态。",
    intuitionCn: "发现是出题时看过答案，验证是把封存题目交给未参与出题的人。",
    preciseExplanationCn: ["Discovery 包括任何特征选择、阈值、模型结构或叙事选择；validation 必须评价整个冻结流程，并在目标单位上隔离数据。内部重采样估计开发乐观，外部验证检验新场景。", "另一模态、另一切片或同队列 holdout 未必独立，需审查共享来源与选择过程。"],
    biomedicalExample: { setupCn: "从 180 例 MRI 开发复发模型。", dataCn: ["70/30 随机划分", "同一医院和扫描仪", "先用全体数据选特征"], wrongPathCn: "称 30% 子集为严格外部验证。", reasoningStepsCn: ["特征学习移入训练流程", "患者级嵌套重采样", "冻结模型", "在另一医院连续队列评价校准与 AUC"], conclusionCn: "随机留出只能作内部评价且当前有泄漏；外部泛化尚未验证。" },
    misconceptionCn: ["测试集标签足以保证独立；不同 omics 模态就是独立验证。"], boundaryCn: ["极小样本下分割可能浪费信息，应优先重采样并明确不确定性。"], connectForwardCn: "更强发现还要在 competing hypotheses 间制造区分。", evidenceSourceIds: ["src-internal-validation", "src-tripod-ai"]
  },
  {
    titleEn: "Competing Hypotheses", tier: "tier1",
    whyItMattersCn: "只为偏好机制找支持，几乎任何结果都能被吸收。竞争假设迫使实验产生不同预测。",
    intuitionCn: "不是问嫌疑人是否可能在场，而是找一项让不同嫌疑人给出不同答案的证据。",
    preciseExplanationCn: ["对同一现象列出至少两个能生成数据的机制，比较它们在时间、剂量、细胞类型、干预或负对照上的分歧。信息价值来自排除能力，而非支持性观察数量。", "竞争假设应含技术和设计解释，如批次、组成与选择，而不只含多个生物故事。"],
    biomedicalExample: { setupCn: "耐药肿瘤中干扰素程序升高。", dataCn: ["bulk RNA 上调", "耐药样本肿瘤纯度更低", "治疗后取样"], wrongPathCn: "直接认定肿瘤细胞激活干扰素导致耐药。", reasoningStepsCn: ["H1 肿瘤细胞内在激活", "H2 免疫细胞比例升高", "H3 治疗诱导而非耐药原因", "用配对单细胞定位、治疗前样本与扰动产生分歧"], conclusionCn: "bulk 信号兼容三种解释，需细胞来源、时间与扰动证据区分。" },
    misconceptionCn: ["列更多可能性就是严谨；所有替代解释都同样可信。"], boundaryCn: ["应优先可检验且会改变结论的竞争解释。"], connectForwardCn: "Alternative Explanation 将竞争模型转为具体审计。", evidenceSourceIds: ["src-strong-inference"]
  },
  {
    titleEn: "Alternative Explanation", tier: "tier2",
    whyItMattersCn: "把替代解释仅列在 Discussion 不会改善推断；它应改变设计、对照或敏感性分析。",
    intuitionCn: "备用路线不是地图边角的备注，而是决定下一座路标放在哪里。",
    preciseExplanationCn: ["替代解释需说明产生观察的具体路径、预期附带现象及可区分证据。优先审查选择、混杂、测量、组成、批次、模型自由度和反向因果。", "无法排除时应降低最大结论，而不是用‘不能完全排除’后继续原主张。"],
    biomedicalExample: { setupCn: "血液 miRNA 与早期胰癌相关。", dataCn: ["病例在手术前采血", "对照为健康体检者", "溶血指标组间不同"], wrongPathCn: "称 miRNA 是肿瘤特异早筛信号。", reasoningStepsCn: ["炎症与就诊选择可区分病例对照", "溶血可改变 miRNA", "加入症状性良性胰病对照", "按溶血质量分层并做组织来源验证"], conclusionCn: "现数据支持病例与健康对照差异，肿瘤特异性尚未建立。" },
    misconceptionCn: ["调整年龄性别即可排除替代解释。"], boundaryCn: ["负对照只能针对其代表的路径，不能证明无偏。"], connectForwardCn: "把关键替代解释写入 change-my-mind 规则。", evidenceSourceIds: ["src-strong-inference", "src-strobe"]
  },
  {
    titleEn: "What Would Change My Mind?", tier: "tier1",
    whyItMattersCn: "事前更新规则能暴露不可证伪信念，减少看到结果后改变阈值、亚组和解释。",
    intuitionCn: "在比赛前写下比分怎样才算输，否则终场后总能改规则宣布胜利。",
    preciseExplanationCn: ["分别写出提高、降低和基本不改变信念的证据，包括效应方向、实际重要阈值、独立复制、负对照和机制分歧。规则应考虑区间而非单一 P 值。", "不改变信念的结果同样重要：低精度阴性结果可能不能区分零效应与重要效应。"],
    biomedicalExample: { setupCn: "认为蛋白 A 可预测免疫治疗应答。", dataCn: ["探索 OR 2.1", "95% CI 1.1–4.2", "计划外部 200 人"], wrongPathCn: "只规定 P<.05 算成功。", reasoningStepsCn: ["预定最小有用增量 AUC .03", "要求校准斜率 .8–1.2", "冻结阈值与模型", "若 CI 排除有用增量则降低信念", "若区间宽则保持不确定"], conclusionCn: "外部数据只有同时支持增量、校准和方向时才提高临床预测信念。" },
    misconceptionCn: ["改变想法等于只看显著性；负结果必然推翻假设。"], boundaryCn: ["规则可按新知识修订，但应在看本次结果前记录。"], connectForwardCn: "更新后从剩余最大不确定性导出下一问题。", evidenceSourceIds: ["src-strong-inference", "src-confidence-interval"]
  },
  {
    titleEn: "Deriving the Next Question from Current Results", tier: "tier2",
    whyItMattersCn: "下一步若只是追加一种方法，会增加输出而不缩短证据链；应瞄准当前结论最脆弱的连接。",
    intuitionCn: "桥梁检测先修最薄的桥墩，而不是给最坚固的桥面再刷一层漆。",
    preciseExplanationCn: ["先写当前最大结论，再列其依赖的关键假设与竞争解释，按‘若解决会改变多少判断’和可行性排序。下一问题应产生区分性或外部证据。", "正、负和不确定结果会导向不同分支：机制定位、测量改进、扩大信息量或停止。"],
    biomedicalExample: { setupCn: "单中心发现代谢签名预测脓毒症死亡。", dataCn: ["内部 AUC .84", "校准未报告", "样本在入 ICU 后不同时间采集"], wrongPathCn: "下一步再做随机森林和通路富集。", reasoningStepsCn: ["最大主张是入院时预测", "最薄弱处是采样时间不统一与外部泛化", "下一问固定入院两小时采样", "在另一中心冻结验证校准"], conclusionCn: "优先问题是标准时点外部验证，而非增加开发算法。" },
    misconceptionCn: ["更多组学层总是最佳下一步。"], boundaryCn: ["若测量本身不可靠，应先做技术验证。"], connectForwardCn: "当新分析不再改变判断时进入停止规则。", evidenceSourceIds: ["src-strong-inference"]
  },
  {
    titleEn: "When to Stop Analyzing a Question", tier: "tier1",
    whyItMattersCn: "无边界分析消耗时间并扩大选择空间；当限制来自数据生成过程，换模型只制造虚假确定性。",
    intuitionCn: "若照片没拍到车牌，反复更换滤镜不会恢复不存在的像素。",
    preciseExplanationCn: ["停止条件包括：目标量不能由现有设计识别；额外分析不会跨越预定决策阈值；主要结论对合理选择已稳定；或关键验证需要新数据。停止应记录已排除方案、剩余不确定性和触发重启的证据。", "停止不是宣告真相，而是承认当前数据的信息上限，并把资源转向测量、复制或更有价值的问题。"],
    biomedicalExample: { setupCn: "8 位患者的空间组学提示细胞邻近。", dataCn: ["每人上万 spots", "只有一张切片", "无蛋白或扰动"], wrongPathCn: "继续尝试十种邻域半径直至得到机制通路。", reasoningStepsCn: ["患者层方向已稳定", "半径选择改变显著性但不补方向性", "一个切片不能验证时间或信号传递", "冻结描述性结果", "申请独立组织与功能实验"], conclusionCn: "应停止用现有切片追逐机制；当前最大结论是患者层空间共现。" },
    misconceptionCn: ["停止意味着失败；只要还有算法就应继续。"], boundaryCn: ["安全性信号或数据错误可触发重新分析，即使原计划已停止。"], connectBackCn: "以预先的 change-my-mind 与最大结论判断边际价值。", connectForwardCn: "下一模块将用设计和推断单位决定哪些信息真正独立。", evidenceSourceIds: ["src-strong-inference", "src-strobe"]
  },
];
