import type { AuthoredGuideContent } from "../types";

export const module08StrategyContent: AuthoredGuideContent[] = [
  {
    titleEn: "Evidence Gap versus What Else Can I Run", tier: "tier3",
    whyItMattersCn: "软件菜单能无限增加产物，却不保证减少决定主张的那项不确定性；以证据缺口起步可避免分析漂移。",
    intuitionCn: "工具箱里有很多扳手，不代表眼前问题是每颗螺丝都拧一遍。",
    preciseExplanationCn: ["先写当前最大可支持主张、最弱推理环节和会改变判断的竞争解释，再把候选分析映射到缺口。只有能识别现有数据中的目标量、检查关键假设或区分解释的分析才有信息价值；若缺的是时间、独立总体或干预，换算法不能补齐。决策记录应说明结果为阳性、阴性或不确定时分别如何更新。"],
    biomedicalExample: { setupCn: "乳腺癌 bulk RNA 得到一个与复发相关的免疫分数。", dataCn: ["关联经调整仍在", "尚不知是细胞比例、批次还是细胞内状态"], wrongPathCn: "继续跑网络、聚类和十种富集图。", reasoningStepsCn: ["把最大缺口定为信号来源", "比较去卷积、组织学绝对计数和分选验证对三种解释的区分力"], conclusionCn: "下一步应优先回答来源，不是增加同一表达矩阵的图形数量。" },
    misconceptionCn: ["“还能跑”描述可执行性，不描述分析对主张的边际价值。"], boundaryCn: ["探索可用于生成新问题，但不得冒充修复既有证据缺口。"],
    connectBackCn: "回接替代解释与主张边界。", connectForwardCn: "连接最小充分分析和时间分配。", evidenceSourceIds: ["src-strong-inference", "src-strobe"]
  },
  {
    titleEn: "From Result to New Question", tier: "tier2",
    whyItMattersCn: "若新问题只是在结果名词后加“机制是什么”，项目会跳过最关键的不确定性；结构化更新才能形成可检验分支。",
    intuitionCn: "结果不是终点，也不是任意岔路口；它排除了一些路线，并暴露最需要辨别的下一处路标。",
    preciseExplanationCn: ["把结果分成观察事实、当前解释、未决假设和边界；为每个可行解释写一项不同预测，再把预测改写成含总体、单位、测量和判别标准的问题。新问题应说明答案如何改变主张或行动。若无论答案为何都不改变判断，它通常不是优先问题。"],
    biomedicalExample: { setupCn: "空间转录组显示巨噬细胞标记与侵袭边缘共定位。", dataCn: ["spot 含多细胞", "共定位在三个患者重复"], wrongPathCn: "下一问直接写“巨噬细胞如何驱动侵袭”。", reasoningStepsCn: ["保留来源误分、共同趋化和真实互作三个解释", "先问单细胞分辨定位与配体扰动能否区分它们"], conclusionCn: "下一问应检验共定位的细胞来源和方向，而非预设驱动机制。" },
    misconceptionCn: ["新问题不应把尚未成立的解释写进前提。"], boundaryCn: ["同一结果可导出多问；优先级由信息增益与重要性决定。"],
    connectBackCn: "承接意外结果和竞争解释。", connectForwardCn: "进入假设区分与分支设计。", evidenceSourceIds: ["src-strong-inference", "src-spatial"]
  },
  {
    titleEn: "Minimal Sufficient Analysis", tier: "tier3",
    whyItMattersCn: "复杂流程会扩大自由度、验证负担与解释接口；最小充分分析把工作集中在能改变判断的证据上。",
    intuitionCn: "诊断先做能区分最危险原因的检查，而不是把医院所有检查都开一遍。",
    preciseExplanationCn: ["“最小”指没有不承担证据任务的步骤，“充分”指仍能估计目标量、表达不确定性并检查会改变结论的关键假设。先定义决策阈值和停止规则，再选择一个基准分析及少数针对性敏感性分析。复杂模型只有在改善识别、预测或决策且验证成本可承担时才进入。"],
    biomedicalExample: { setupCn: "研究者想验证一个预定义 12 基因复发分数。", dataCn: ["有独立队列与锁定公式", "事件数有限"], wrongPathCn: "重做全转录组特征选择并比较十个机器学习模型。", reasoningStepsCn: ["直接计算锁定分数，评价效应、校准与区分", "只增加检查缺失、非线性和中心运输性的分析"], conclusionCn: "验证问题所需的是锁定模型的透明评价，不是重新开发。" },
    misconceptionCn: ["最小充分不等于只报一个 P 值；区间、诊断与关键敏感性属于充分性。"], boundaryCn: ["若主问题改变，原最小集合也应重定，而非僵化沿用。"],
    connectBackCn: "回接证据缺口。", connectForwardCn: "连接停止分析与 panel 证据任务。", evidenceSourceIds: ["src-strong-inference", "src-tripod"]
  },
  {
    titleEn: "Positive-Result Branch", tier: "tier2",
    whyItMattersCn: "阳性结果最容易触发因果升级和选择性扩展；事前分支可把兴奋转换成验证、偏倚审查与边界更新。",
    intuitionCn: "报警器响后应按协议确认火源和范围，而不是立即宣布整栋楼失火。",
    preciseExplanationCn: ["预先规定达到何种效应与精度算阳性，并区分主要、次要和探索结局。阳性后先复核数据与模型，再检查最有威胁的替代解释，锁定估计对象并安排独立或正交验证。只有新证据补足缺失环节时才升级动词；重复同一数据的显著分析不能充当确认。"],
    biomedicalExample: { setupCn: "发现候选蛋白与药物应答 AUC=0.82。", dataCn: ["cut-point 在同一 70 人队列选择", "无校准或外部样本"], wrongPathCn: "立即申请临床检测并称可指导用药。", reasoningStepsCn: ["锁定 assay、阈值和模型", "在目标场景连续入组的独立患者评价校准、区分及决策后果"], conclusionCn: "结果是开发队列中的阳性候选，临床 utility 尚未建立。" },
    misconceptionCn: ["阳性分支不是追加更多支持图，而是主动寻找会推翻结果的证据。"], boundaryCn: ["阈值应基于效应与决策意义，不只依据 P<0.05。"],
    connectBackCn: "回接主张边界和自由度。", connectForwardCn: "连接验证集与转化随访。", evidenceSourceIds: ["src-tripod", "src-remark"]
  },
  {
    titleEn: "Negative-Result Branch", tier: "tier2",
    whyItMattersCn: "阴性结果后的“再换模型试试”容易制造选择性阳性；结构化分支先判断数据是否有能力回答问题。",
    intuitionCn: "钥匙打不开门时，先查钥匙、锁和门是否匹配，而不是无止境摇动。",
    preciseExplanationCn: ["先读效应区间是否排除预定义重要范围，再检查样本信息、事件数、测量操纵、依从、缺失与模型可辨识性。若信息充分且排除重要效应，可停止或转问更窄问题；若信息不足，应改善数据或设计；只有存在事前合理的函数形式或边界错误时，另一分析才有正当性。"],
    biomedicalExample: { setupCn: "药物对类器官增殖差异 P=0.22。", dataCn: ["95% CI 容许降低 35% 至增加 12%", "药物暴露浓度低于靶点 IC50"], wrongPathCn: "改用多个终点直到出现显著结果。", reasoningStepsCn: ["把结果标记为不精确且操纵不足", "先确认暴露与靶点占有，再按重要效应设计新实验"], conclusionCn: "当前阴性不能排除有意义抑制，也不能支持无效。" },
    misconceptionCn: ["非显著不自动触发更多模型；它首先触发信息量审计。"], boundaryCn: ["若主要结果明确排除重要效应，继续寻找小亚组需另立探索问题。"],
    connectBackCn: "回接阴性与零结果。", connectForwardCn: "连接停止规则和新实验。", evidenceSourceIds: ["src-confidence-interval", "src-power"]
  },
  {
    titleEn: "Testing Competing Hypotheses", tier: "tier3",
    whyItMattersCn: "分别为每个故事寻找相容证据不会区分它们；强检验要让候选假设面对同一个可能失败的结果。",
    intuitionCn: "问两个嫌疑人都能回答的问题没有辨别力；关键问题应让他们给出不同答案。",
    preciseExplanationCn: ["把 H1、H2 写成过程模型，为同一条件推导方向、时间、剂量、定位或干预响应上的差异预测。选择能最大化预测分离、又控制共同偏倚的实验；事前规定结果如何削弱或保留各假设。若两者对当前数据预测相同，就承认可辨识性不足，不以拟合优度微差伪装机制判决。"],
    biomedicalExample: { setupCn: "肿瘤耐药可能由预存克隆选择或治疗诱导可逆状态造成。", dataCn: ["治疗后耐药标记升高", "只有单个治疗后时间点"], wrongPathCn: "以治疗后升高证明诱导机制。", reasoningStepsCn: ["预存克隆预测治疗前低频谱系已存在且持续扩增", "可逆状态预测谱系多样但撤药后表达回落；用条形码、连续采样与撤药区分"], conclusionCn: "现有终点数据兼容两者，谱系—时间联合实验才有判别力。" },
    misconceptionCn: ["拒绝 H1 不自动证明 H2；可能还有共同未建模的 H3。"], boundaryCn: ["实验可优先排除高价值候选，不必声称穷尽所有可能。"],
    connectBackCn: "承接替代解释。", connectForwardCn: "连接正交验证和新实验门槛。", evidenceSourceIds: ["src-strong-inference"]
  },
  {
    titleEn: "Redundant Analysis", tier: "tier2",
    whyItMattersCn: "冗余分析增加审阅和错误接口，却不增加可区分信息，还容易以方法数量夸大证据。",
    intuitionCn: "同一张照片换三种滤镜不会产生三个独立现场。",
    preciseExplanationCn: ["为候选分析列输入、estimand、假设、误差结构和对决策的可能影响。若与既有分析全部相同，且任何结果都不会改变主张，它是冗余。可保留少量诊断或展示用途，但要标注其工作；真正新增证据需要独立样本、不同测量原理或对关键假设的针对性扰动。"],
    biomedicalExample: { setupCn: "同一单细胞矩阵用 UMAP、t-SNE 和 PCA 展示病例分离。", dataCn: ["三图共享归一化和患者", "分离也与建库批次一致"], wrongPathCn: "称三种降维一致证明疾病亚型。", reasoningStepsCn: ["把三图归为同一描述任务", "用平衡批次复现、患者级分类和独立队列检验亚型"], conclusionCn: "多个嵌入图是视图冗余，未解决批次解释。" },
    misconceptionCn: ["结果一致不意味着独立佐证，尤其当输入和偏倚完全共享。"], boundaryCn: ["冗余可帮助教学或诊断，但不应计入证据票数。"],
    connectBackCn: "回接 corroboration 与自由度。", connectForwardCn: "连接 panel 取舍和停止分析。", evidenceSourceIds: ["src-strong-inference", "src-batch"]
  },
  {
    titleEn: "Orthogonal Validation", tier: "tier3",
    whyItMattersCn: "验证若沿用同一测量错误或开发选择，只会复制原偏倚；正交验证针对具体失败模式改变证据来源。",
    intuitionCn: "用另一把同厂失准的尺子不算独立核验，换成不同原理的测量才可能发现偏差。",
    preciseExplanationCn: ["先陈述待验证构念和开发证据的主要脆弱点，再选不同平台、不同病例谱或不同设计。分析性验证检验 assay，临床验证检验目标场景中的性能，功能验证检验过程，三者不可互换。验证方案应冻结阈值、方向和成功标准，避免在验证集更新后仍称原对象被验证。"],
    biomedicalExample: { setupCn: "RNA 签名预测移植排斥。", dataCn: ["在单中心冷冻样本开发", "信号可能由免疫细胞比例驱动"], wrongPathCn: "同一中心用另一批 RNA 测序重复相关。", reasoningStepsCn: ["跨中心按锁定签名评价运输性", "以组织学细胞计数或蛋白定位检验来源，而非重新选基因"], conclusionCn: "需要分别验证锁定预测表现和生物来源；二者回答不同问题。" },
    misconceptionCn: ["在验证数据上重调模型后得到好性能，是模型更新，不是原模型未经修改的验证。"], boundaryCn: ["正交并不保证无偏；目标总体和独立性仍需匹配。"],
    connectBackCn: "回接正交证据。", connectForwardCn: "连接验证集设计和临床 utility。", evidenceSourceIds: ["src-tripod-ai", "src-strong-inference"]
  },
  {
    titleEn: "When a New Experiment Is Needed", tier: "tier3",
    whyItMattersCn: "有些缺口在现有数据中不可辨识；继续计算会制造精密幻觉，并延误真正能回答方向、时间或来源的新测量。",
    intuitionCn: "录像没有拍到事故前一分钟，再增强画质也不能恢复未记录的事件。",
    preciseExplanationCn: ["当候选解释对所有现有观测给出相同预测，或关键变量、时间点、独立单位和干预从未测量时，需要新实验。设计应以区分性为核心：加入阳性/阴性对照、时间序列、剂量、随机干预、rescue 或正交测量，并预设每种结果的解释更新。新实验不等于更大规模；小而能判别往往优先。"],
    biomedicalExample: { setupCn: "横断面患者样本显示代谢物 M 与 T 细胞耗竭相关。", dataCn: ["同一时间采样", "疾病严重度同时影响二者"], wrongPathCn: "用更复杂回归宣称 M 诱导耗竭。", reasoningStepsCn: ["承认时间方向和未测混杂不可由横断面计算恢复", "在控制条件下进行 M 剂量—时间干预、洗脱与 rescue，并保留患者关联边界"], conclusionCn: "新实验可检验细胞模型中的功能，患者因果效应仍需相应设计。" },
    misconceptionCn: ["新实验成功也不能自动把所有旧队列关联升级为同一机制。"], boundaryCn: ["若缺口只是现有数据的编码或稳健性，先做计算审计更经济。"],
    connectBackCn: "回接可辨识性与机制边界。", connectForwardCn: "连接转化门槛。", evidenceSourceIds: ["src-strong-inference", "src-strobe"]
  },
  {
    titleEn: "When Another Computational Analysis Is Enough", tier: "tier2",
    whyItMattersCn: "不是每个疑问都要采新数据；若缺口是现有数据可识别的编码、模型假设或稳健性，针对性计算能快速改变判断。",
    intuitionCn: "信息已经在记录中，只是尚未按正确问题读取，此时重做读取比重新采集更合适。",
    preciseExplanationCn: ["判断标准是目标量和区分信息是否已存在。可由现有数据回答的例子包括检查单位错误、重新定义预设 contrast、非线性、影响点、泄漏、缺失方案或模型校准。分析应在看到结果前写明目的、决策阈值和停止点；它不能创造未测时间、未记录混杂或独立外部总体。"],
    biomedicalExample: { setupCn: "预后模型开发集报告训练 AUC，没有内部验证。", dataCn: ["原始患者级数据和完整流水线可用", "不存在外部队列"], wrongPathCn: "立即收集新队列前忽略明显乐观偏倚。", reasoningStepsCn: ["在患者层 bootstrap 重复全部特征选择，估计乐观校正表现", "明确这只回答内部乐观度，外部运输性仍未知"], conclusionCn: "另一计算分析足以修正内部评价，但不能替代外部验证。" },
    misconceptionCn: ["交叉验证不会把开发数据变成外部目标总体。"], boundaryCn: ["若流水线或原始数据缺失，计算复核本身也可能不可执行。"],
    connectBackCn: "回接最小充分分析。", connectForwardCn: "连接停止分析和验证集设计。", evidenceSourceIds: ["src-internal-validation", "src-tripod"]
  },
  {
    titleEn: "When to Stop Analyzing", tier: "tier3",
    whyItMattersCn: "无停止规则的分析会消耗时间、扩大多重性，并让结果反馈不断重写问题；停止是科学判断而非放弃。",
    intuitionCn: "当剩余钥匙都打不开所需的门，继续试钥匙不如去获取门锁信息。",
    preciseExplanationCn: ["事前定义停止条件：主要估计达到所需精度；合理规格不再改变主张；新增分析不会区分关键解释；或关键缺口明确需要新数据。也可因效应小于决策阈值、可行性不足或机会成本过高而停止。停止记录应列已回答、未回答、边界和重启所需触发证据，避免把“暂时没显著”误作终止依据。"],
    biomedicalExample: { setupCn: "团队已用同一 80 人队列测试五类分类器。", dataCn: ["嵌套验证性能均约 AUC 0.62", "主要限制是病例谱窄且事件少"], wrongPathCn: "继续调参直到某折 AUC 超过 0.8。", reasoningStepsCn: ["确认模型差异不改变临床判断且区间重叠", "停止算法搜索，记录需要更广病例谱和更多事件才重启"], conclusionCn: "当前数据不足以支持有用预测，下一增益来自新样本而非第六个算法。" },
    misconceptionCn: ["停止不等于证明无信号；它说明当前路径的边际信息价值已低。"], boundaryCn: ["安全或伦理信号可触发更早停止，并需独立治理程序。"],
    connectBackCn: "综合稳健性、精度和机会成本。", connectForwardCn: "连接 mentor 建议与资源排序。", evidenceSourceIds: ["src-strong-inference", "src-tripod"]
  },
  {
    titleEn: "What a Figure Panel Must Answer", tier: "tier2",
    whyItMattersCn: "没有证据问题的 panel 只增加视觉负担；明确任务能决定比较、对照、不确定性和图形类型。",
    intuitionCn: "panel 是一句论证，不是一格装饰。",
    preciseExplanationCn: ["为每个 panel 写一个可回答问题：描述谁、比较什么、验证哪项、区分哪个解释或评价何种决策价值。随后列独立单位、必要对照、效应尺度和区间。若图不能让读者检查答案，补充标签、风险表或原始分布；若与另一 panel 回答同一问题且不改变偏倚结构，应合并或删除。"],
    biomedicalExample: { setupCn: "单细胞主图已有 UMAP、marker 热图和细胞比例柱图。", dataCn: ["研究问题是治疗是否改变某细胞状态", "现图无患者级比较"], wrongPathCn: "继续添加更美观的嵌入图。", reasoningStepsCn: ["将 panel 任务改为患者级状态差异", "展示每位患者估计、效应区间和组成敏感性"], conclusionCn: "回答状态变化需要患者级证据，而不是更多细胞级地图。" },
    misconceptionCn: ["图能展示数据不等于图回答了研究问题。"], boundaryCn: ["诊断 panel 可不承载主结论，但其质控任务仍应明确。"],
    connectBackCn: "回接最小充分分析。", connectForwardCn: "连接 panel 设计与主图。", evidenceSourceIds: ["src-better-figures", "src-paper-structure"]
  },
  {
    titleEn: "What a Main Figure Must Accomplish", tier: "tier2",
    whyItMattersCn: "主图是读者判断核心主张的主要界面；若只展现最漂亮结果，必要对照和不确定性会消失。",
    intuitionCn: "主图要完成一段完整证据工作，而不是把最响亮的句子剪贴在一起。",
    preciseExplanationCn: ["一张主图应围绕单一中心问题组织若干互补 panel：建立样本和现象、给主要比较、展示关键验证或边界。图题陈述有限结论，图例提供独立解读所需信息。共享数据的 panel 不应冒充多重独立支持；关键反例或校准若会改变判断，应与阳性结果同处主图。"],
    biomedicalExample: { setupCn: "生物标志物主图放热图、KM 和 ROC。", dataCn: ["三图来自同一开发队列", "无校准和锁定验证"], wrongPathCn: "用三图数量证明临床价值。", reasoningStepsCn: ["把热图作为描述，KM 作为关联，ROC 作为表观区分", "加入内部验证校正和校准，标题限定为开发证据"], conclusionCn: "主图应让读者看到候选性能及乐观度，而非制造三次验证的错觉。" },
    misconceptionCn: ["主图不是显著结果排行榜。"], boundaryCn: ["完整证据链可跨图完成，但单图内部仍需问题一致。"],
    connectBackCn: "承接 panel 证据任务。", connectForwardCn: "连接 Figure 1–N 和论文证据链。", evidenceSourceIds: ["src-better-figures", "src-paper-structure"]
  },
  {
    titleEn: "Paper-Level Evidence Chain", tier: "tier3",
    whyItMattersCn: "论文若按软件完成顺序堆结果，读者看不出每一步为何必要，也容易把同源证据误计为递进验证。",
    intuitionCn: "证据链像推理阶梯：每一级回答前一级留下的问题，并明确还缺哪一级。",
    preciseExplanationCn: ["先写一句有限主张，再反推它需要的链条：目标总体与测量、主要现象或效应、关键偏倚检查、竞争解释、独立/正交验证及边界。每个结果必须标明证据工作和它触发的下一问。链条强度由最弱的必要环节限制，不由图数相加；冲突结果应作为分支展示而非从故事中删除。"],
    biomedicalExample: { setupCn: "论文声称发现并验证免疫耐药亚型。", dataCn: ["发现、聚类稳定性和生存都来自同一队列", "外部数据只复现部分基因方向"], wrongPathCn: "按分析日期排列 12 张图并称层层验证。", reasoningStepsCn: ["重排为亚型定义、患者级稳定性、结局关联和外部锁定检验", "把部分不一致用于限定亚型运输性"], conclusionCn: "链条支持队列内候选亚型及有限外部相容，不支持普适临床亚型。" },
    misconceptionCn: ["逻辑顺序不是隐藏阴性，而是让阴性明确改变后续判断。"], boundaryCn: ["探索论文也可有证据链，只需把生成假设与确认分开。"],
    connectBackCn: "整合主结论和正交验证。", connectForwardCn: "连接 Figure 1–N 与叙事顺序。", evidenceSourceIds: ["src-paper-structure", "src-paper-reading"]
  },
  {
    titleEn: "Figure 1-to-N Logic", tier: "tier2",
    whyItMattersCn: "按完成日期排图会让读者先看到细节、后看到问题；Figure 1–N 应逐步减少核心不确定性。",
    intuitionCn: "先交代人物和冲突，再给证据与反证，不能从结局倒放监控片段。",
    preciseExplanationCn: ["Figure 1 建立总体、设计、数据质量和待解释现象；后续图依次回答主要比较、稳健性、竞争解释、验证与边界。每张图开头承接上一图未决问题，结尾明确新限制。不是所有论文都要相同图数或模板，顺序应由证据依赖而非方法类别决定。"],
    biomedicalExample: { setupCn: "多组学研究先放机制网络，最后才交代样本批次。", dataCn: ["病例与批次高度相关", "网络依赖病例差异"], wrongPathCn: "把网络当 Figure 1 强化冲击力。", reasoningStepsCn: ["先用 Figure 1 展示队列、批次与可辨识性", "只有通过桥接与稳健性后才推进网络解释"], conclusionCn: "批次是链条前置条件，不能在机制故事之后才披露。" },
    misconceptionCn: ["Figure 1 不必总是流程图，但必须让后续推理可定位。"], boundaryCn: ["短报告可压缩图数，依赖关系仍应保留。"],
    connectBackCn: "回接论文证据链。", connectForwardCn: "连接叙事顺序和主图选择。", evidenceSourceIds: ["src-paper-structure", "src-better-figures"]
  },
  {
    titleEn: "Mechanistic Depth versus Evidence Boundary", tier: "tier3",
    whyItMattersCn: "机制深度常被多组学数量、网络复杂度或术语丰富度替代；真正深度来自对方向与过程的区分性证据。",
    intuitionCn: "地图画得更复杂不等于真的走过道路；干预与时间证据才确认路线。",
    preciseExplanationCn: ["机制主张应逐级列实体身份、细胞来源、时序、方向、必要性/充分性、救援和人体适用域。每级只由直接覆盖它的证据支持：共定位支持邻近，扰动支持特定条件下功能，rescue 加强特异性，临床获益另需临床设计。多层相关收敛可提高候选可信度，但不能跨越未测环节。"],
    biomedicalExample: { setupCn: "患者 RNA、蛋白和空间数据都指向 TGFβ。", dataCn: ["三模态共享同一肿瘤", "体外抑制降低成纤维细胞标记"], wrongPathCn: "声称证明 TGFβ 驱动患者转移并可治疗。", reasoningStepsCn: ["患者数据支持层间相容与定位", "体外结果支持特定细胞模型功能；转移方向、体内安全和患者效用仍缺证据"], conclusionCn: "可主张 TGFβ 与基质程序相容并在体外参与表型，不可越界到临床疗效。" },
    misconceptionCn: ["机制图中的箭头是模型陈述，不是自动生成的证据。"], boundaryCn: ["深度可以局部很强；应明确最强功能证据限定在哪个系统。"],
    connectBackCn: "回接结果不等于机制和 Claim Boundary。", connectForwardCn: "连接转化随访。", evidenceSourceIds: ["src-strong-inference", "src-strobe"]
  },
  {
    titleEn: "Clinical Relevance versus Clinical Utility", tier: "tier3",
    whyItMattersCn: "与结局相关或具有生物意义，不等于能改善患者决策；混淆会把候选标志物过早推向临床。",
    intuitionCn: "天气与出行相关，但只有能比现有预报更好地改变带伞决策，才有实际用途。",
    preciseExplanationCn: ["临床 relevance 表示与患者、结局或疾病过程有关；utility 要定义使用者、时点、可选行动和阈值，并证明相对现有策略的增量信息、校准、净获益、可实施性和后果。高 AUC、显著 HR 或机制合理均不能单独证明 utility。评价必须在目标病例谱、冻结模型和真实工作流中进行。"],
    biomedicalExample: { setupCn: "新基因评分与乳腺癌复发 HR=2.1。", dataCn: ["与现有临床分期高度相关", "未报告校准或治疗阈值"], wrongPathCn: "称评分可指导辅助治疗。", reasoningStepsCn: ["比较在现有模型上的增量校准与决策曲线", "定义阈值下增加治疗的获益、伤害和 assay 可行性"], conclusionCn: "评分有预后 relevance；是否改变治疗并改善结局尚未证明。" },
    misconceptionCn: ["统计独立关联不等于临床增量价值。"], boundaryCn: ["utility 依赖具体决策环境，同一模型在不同患病率和代价下可不同。"],
    connectBackCn: "回接预测、校准与主张边界。", connectForwardCn: "连接验证集和转化路径。", evidenceSourceIds: ["src-tripod", "src-remark"]
  },
  {
    titleEn: "Validation Set Design", tier: "tier2",
    whyItMattersCn: "验证集若与开发共享选择、时间或病例谱，表面独立仍可乐观；设计决定它能回答何种运输问题。",
    intuitionCn: "在同一套练习题中留几题测试，只能测记忆附近的表现，不能证明去新环境也会。",
    preciseExplanationCn: ["先定义目标使用总体、地点、时间、测量流程和结局，再选择与该场景匹配且未参与开发的数据。验证前锁定所有预处理、特征、系数和阈值，报告样本流、事件、缺失、病例谱及校准。时间、地理或系统外验证各测试不同变化；验证集上更新应与未经修改的性能分开。"],
    biomedicalExample: { setupCn: "影像模型在医院 A 2019–2021 年开发。", dataCn: ["拟用同院随机留出的扫描验证", "目标是医院 B 新设备上的急诊患者"], wrongPathCn: "称随机留出足以证明跨院泛化。", reasoningStepsCn: ["内部留出只评价同分布表现", "在医院 B 连续患者上冻结评价，并报告设备、病例谱和校准差异"], conclusionCn: "跨院使用主张需要外部场景匹配验证。" },
    misconceptionCn: ["验证样本更大不能抵消与目标场景不匹配。"], boundaryCn: ["一次外部验证只覆盖其场景，不证明普遍运输性。"],
    connectBackCn: "回接正交验证和临床 utility。", connectForwardCn: "连接转化随访与报告透明度。", evidenceSourceIds: ["src-tripod-ai", "src-pm-external"]
  },
  {
    titleEn: "Panel Design", tier: "tier2",
    whyItMattersCn: "panel 设计影响读者能否比较独立单位、看见不确定性并分清主次；布局不只是美工。",
    intuitionCn: "把证据放在同一视线可比较的位置，推理关系才会显现。",
    preciseExplanationCn: ["每个 panel 分配唯一证据任务，优先展示独立单位和效应区间，再决定图形、尺度、颜色与注释。必要对照应邻近，跨 panel 使用一致编码；机制示意与实测结果在视觉上区分。避免把细胞数当患者数、截断坐标放大差异或用星号替代效应。"],
    biomedicalExample: { setupCn: "动物实验每只鼠取十个视野。", dataCn: ["柱图把 100 个视野当 n", "组间只有 5 只鼠"], wrongPathCn: "以密集散点显示很精确。", reasoningStepsCn: ["panel 展示每鼠汇总点并可淡化呈现鼠内视野", "标注模型的聚类处理、效应和区间"], conclusionCn: "视觉层级应让动物而非视野成为推断单位。" },
    misconceptionCn: ["更密集的数据点不代表更多独立信息。"], boundaryCn: ["原始下层数据可展示，但必须与分析单位和模型对应。"],
    connectBackCn: "回接 panel 必答问题与统计单位。", connectForwardCn: "连接图题和图例。", evidenceSourceIds: ["src-better-figures", "src-pseudorep"]
  },
  {
    titleEn: "Translational Follow-Up", tier: "tier2",
    whyItMattersCn: "从生物发现到临床应用存在分析效度、临床效度和 utility 多道门槛；跳级会把候选误写为产品。",
    intuitionCn: "发现一把钥匙形状像锁，只是起点；还要验证能稳定制造、能开目标门且不会伤人。",
    preciseExplanationCn: ["把转化路径拆为构念与 assay、独立人群效应、增量决策价值、可实施流程、安全性和临床后果。每一步给成功标准、失败分支和所需证据。功能候选可先做正交测量与特异性扰动，预测候选可先锁定 assay 并外部校准；不要用机制证据替代临床 performance。"],
    biomedicalExample: { setupCn: "组织蛋白 X 与免疫治疗应答相关。", dataCn: ["回顾性单中心", "抗体批间一致性未知"], wrongPathCn: "直接设计按 X 用药的随机试验。", reasoningStepsCn: ["先验证抗体特异性、重复性和预分析稳定性", "再在目标患者独立评价增量预测，之后才评估检测指导策略"], conclusionCn: "当前最合理下一步是 assay 与临床效度验证，不是直接宣称伴随诊断。" },
    misconceptionCn: ["更多机制细节不能替代检测可靠性和目标场景验证。"], boundaryCn: ["不同用途门槛不同；探索分层与改变治疗的证据要求不可混用。"],
    connectBackCn: "回接机制边界和 utility。", connectForwardCn: "连接资源排序和 mentor 沟通。", evidenceSourceIds: ["src-remark", "src-tripod"]
  },
  {
    titleEn: "Proposing Next Steps to a Mentor", tier: "tier2",
    whyItMattersCn: "只汇报“我还能做什么”会把决策负担留给导师；结构化建议能显露证据缺口、权衡和停止规则。",
    intuitionCn: "好的建议不是菜单，而是带理由、分支和成本的选择题。",
    preciseExplanationCn: ["用六项组织：当前最大可支持主张；最大不确定性；两到三个备选方案；每项能区分什么；阳性/阴性/不确定结果如何行动；时间、样本和机会成本。给出首选及理由，同时指出什么新信息会改变排序。把不能由现有数据解决的限制说清，避免以复杂术语掩盖不可辨识。"],
    biomedicalExample: { setupCn: "标志物关联在一个中心复现不稳。", dataCn: ["可能是 assay 漂移或病例谱差异", "预算只够做一项工作"], wrongPathCn: "问导师要不要再做机器学习。", reasoningStepsCn: ["方案 A 做桥接样本复测，低成本区分 assay；方案 B 收新队列，成本高但测运输性", "首选 A，并设若漂移不足解释差异再启动 B"], conclusionCn: "建议以区分力、成本和分支清晰度为依据，而非方法新颖度。" },
    misconceptionCn: ["给出首选不等于隐藏不确定性；应同时说明改变意见的条件。"], boundaryCn: ["导师可能有未公开资源约束，建议应允许更新。"],
    connectBackCn: "整合证据缺口和停止规则。", connectForwardCn: "连接时间价值判断。", evidenceSourceIds: ["src-strong-inference"]
  },
  {
    titleEn: "Deciding What Is Worth Time", tier: "tier2",
    whyItMattersCn: "研究时间有限；把精力给易跑、漂亮或新潮的分析，可能挤掉真正决定主张可信度的工作。",
    intuitionCn: "优先修承重裂缝，而不是继续粉刷已经好看的墙。",
    preciseExplanationCn: ["按五维排序：问题对患者或知识的重要性；预期信息增益；可行性与成本；失败后仍能学到什么；相对其他任务的机会成本。高风险关键结论的偏倚检查通常优先于次要探索。为任务设时间盒和停止输出，记录为何延期或放弃，使选择可审计而非由最近一次显著结果驱动。"],
    biomedicalExample: { setupCn: "团队可选择优化富集图或复核患者 ID join。", dataCn: ["富集结论只是探索", "join 错误会改变全部组别和生存时间"], wrongPathCn: "因图接近投稿先优化配色。", reasoningStepsCn: ["按对主结论的潜在破坏性给 join 审计最高优先", "冻结图形工作，核对抽样病例与全流程行数"], conclusionCn: "数据身份审计的信息价值与风险控制远高于图形润色。" },
    misconceptionCn: ["已投入很多时间不是继续投入的科学理由。"], boundaryCn: ["紧急沟通或伦理义务可覆盖一般信息增益排序。"],
    connectBackCn: "回接研究者自由度和证据链。", connectForwardCn: "进入科学沟通中的取舍说明。", evidenceSourceIds: ["src-strong-inference", "src-good-enough-computing"]
  }
];
