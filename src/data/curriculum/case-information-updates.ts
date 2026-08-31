import type { StagedCaseLabV1 } from "../../domain/curriculum";

type Update = NonNullable<StagedCaseLabV1["stages"][number]["informationUpdate"]>;

export const caseInformationUpdates: Record<string, [Update, Update, Update, Update]> = {
  "topic-to-question": [
    { strengthenedCn: ["需把宽泛研究兴趣改成可观察问题"], weakenedCn: ["仅凭题目名称即可决定分析"], unresolvedCn: ["目标总体、time zero 与 estimand"], forcingEvidenceCn: "入组流程尚未揭示，任何目标总体判断都只是 v0。" },
    { strengthenedCn: ["现存者横断面样本可回答采样时点的特征分布"], weakenedCn: ["样本可代表全部初诊患者"], unresolvedCn: ["诊断后死亡造成的选择强度"], forcingEvidenceCn: "纳入条件要求在诊断后仍存活到采样，直接收窄可回答总体。" },
    { strengthenedCn: ["把问题限制在存活到采样者可减少不可识别外推"], weakenedCn: ["用协变量调整可恢复已死亡患者的信息"], unresolvedCn: ["选择机制相关的敏感性范围"], forcingEvidenceCn: "未入样者没有组学测量，模型无法凭空重建其反事实数据。" },
    { strengthenedCn: ["冻结一个主要问题和一个选择敏感性分析"], weakenedCn: ["在同一有限样本并行回答多个机制与预后问题"], unresolvedCn: ["对全部初诊患者的运输性"], forcingEvidenceCn: "资源约束迫使删除现有数据不能回答的 PICO/estimand 字段。" },
  ],
  "evidence-to-claim": [
    { strengthenedCn: ["ECM program 与队列内结局关联值得解释"], weakenedCn: ["蛋白关联已经证明驱动机制"], unresolvedCn: ["细胞来源、独立验证与因果方向"], forcingEvidenceCn: "起始材料只有同一队列的 bulk 蛋白关联。" },
    { strengthenedCn: ["调整后关联在当前模型中保留"], weakenedCn: ["表面关联完全由已调协变量解释"], unresolvedCn: ["模型乐观、未测混杂与外部可重复性"], forcingEvidenceCn: "模型仍在同一队列开发，没有冻结外部评价。" },
    { strengthenedCn: ["RNA 与蛋白可能测量不同生物层或时间"], weakenedCn: ["CAF 数量增加是唯一来源解释"], unresolvedCn: ["蛋白产生、沉积与细胞来源"], forcingEvidenceCn: "RNA 仅部分同向且 scRNA 未见 CAF 数量同步增加。" },
    { strengthenedCn: ["局部空间沉积与 bulk 蛋白观察相容"], weakenedCn: ["跨模态一致已经确认产生信号的细胞"], unresolvedCn: ["产生者与沉积位置是否相同"], forcingEvidenceCn: "空间染色定位沉积区域，却不识别蛋白由哪类细胞产生。" },
  ],
  "confounding-observational": [
    { strengthenedCn: ["基线严重度是治疗选择与结局的共同原因候选"], weakenedCn: ["未调整治疗关联可直接解释为伤害"], unresolvedCn: ["目标是总效应还是直接效应"], forcingEvidenceCn: "治疗并非随机，严重患者更常接受治疗 A。" },
    { strengthenedCn: ["未调整较差结局可由指征混杂产生"], weakenedCn: ["治疗 A 必然导致更差结局"], unresolvedCn: ["共同原因测量是否充分"], forcingEvidenceCn: "结果方向与基线严重度造成的非可比性一致。" },
    { strengthenedCn: ["基线严重度解释了部分粗关联"], weakenedCn: ["把治疗后炎症当普通基线协变量"], unresolvedCn: ["治疗后混杂与中介路径"], forcingEvidenceCn: "调整基线后效应减弱，而炎症变化发生在治疗之后。" },
    { strengthenedCn: ["未测就医行为仍可能影响结果"], weakenedCn: ["当前调整集已经消除全部混杂"], unresolvedCn: ["负对照异常的具体来源"], forcingEvidenceCn: "负对照结局也出现关联，违反‘只通过目标结局起作用’的预期。" },
  ],
  "statistical-unit": [
    { strengthenedCn: ["供体是组间推断的独立来源"], weakenedCn: ["三万细胞意味着 n=30000"], unresolvedCn: ["患者间效应异质性"], forcingEvidenceCn: "细胞嵌套在每组三位患者中。" },
    { strengthenedCn: ["逐细胞检验会产生伪精确"], weakenedCn: ["极小 P value 证明跨患者稳定"], unresolvedCn: ["差异由多少供体支持"], forcingEvidenceCn: "检验自由度来自细胞行而不是六个供体。" },
    { strengthenedCn: ["一个供体可能驱动 pooled 结果"], weakenedCn: ["每位患者效应方向一致"], unresolvedCn: ["真实供体级区间"], forcingEvidenceCn: "按供体绘图后显示大部分组差来自单一供体。" },
    { strengthenedCn: ["方向相容但供体级证据不精确"], weakenedCn: ["细胞级 FDR 可作为标准结论"], unresolvedCn: ["更大供体样本中的效应"], forcingEvidenceCn: "pseudobulk 保留方向，却给出宽区间且 FDR 不再显著。" },
  ],
  "overfitting-validation": [
    { strengthenedCn: ["事件数相对候选特征很稀疏"], weakenedCn: ["开发 AUC 代表泛化性能"], unresolvedCn: ["完整开发流程的乐观偏倚"], forcingEvidenceCn: "42 个事件面对 120 个候选特征。" },
    { strengthenedCn: ["泄漏可解释过高开发表现"], weakenedCn: ["AUC=0.91 是无偏估计"], unresolvedCn: ["正确嵌套后内部性能"], forcingEvidenceCn: "填补、筛选和调参都在全数据完成。" },
    { strengthenedCn: ["随机分割不足以修复分割前泄漏"], weakenedCn: ["出现测试集文件就等于独立验证"], unresolvedCn: ["冻结流程的外部表现"], forcingEvidenceCn: "预处理仍在分割前拟合且分割结果波动很大。" },
    { strengthenedCn: ["模型外部区分和校准明显弱于开发报告"], weakenedCn: ["模型已达到稳定临床性能"], unresolvedCn: ["不同场景下是否可再校准"], forcingEvidenceCn: "独立队列 AUC=0.63，校准斜率 0.58，区间宽且与 0.91 不一致。" },
  ],
  "negative-result": [
    { strengthenedCn: ["主要终点应按预设问题解释"], weakenedCn: ["P=0.12 直接证明无效"], unresolvedCn: ["效应大小、精度与失访"], forcingEvidenceCn: "起始只给阈值结果，没有兼容效应范围。" },
    { strengthenedCn: ["数据仍兼容临床重要获益和小幅伤害"], weakenedCn: ["两组等效"], unresolvedCn: ["偏倚是否进一步扩大不确定性"], forcingEvidenceCn: "95% CI 同时跨过零和临床重要界值。" },
    { strengthenedCn: ["次要终点 P=0.04 可能是选择性发现"], weakenedCn: ["可把次要终点改成研究主要发现"], unresolvedCn: ["完整检验族的多重性"], forcingEvidenceCn: "主要结果出现后才挑选次要终点。" },
    { strengthenedCn: ["样本不足和差异失访降低结论可信度"], weakenedCn: ["未显著足以支持无差异"], unresolvedCn: ["失访机制下的效应范围"], forcingEvidenceCn: "实际样本低于方案且失访不平衡，新增方向性偏倚风险。" },
  ],
  "omics-subtype-mechanism": [
    { strengthenedCn: ["NMF 可提出候选低维程序"], weakenedCn: ["四簇天然存在"], unresolvedCn: ["rank、初始化与外部分配稳定性"], forcingEvidenceCn: "单次开发队列的清晰热图不能决定离散结构。" },
    { strengthenedCn: ["至少两个程序在扰动下较稳定"], weakenedCn: ["四个簇具有同等可复现性"], unresolvedCn: ["不稳定簇的结局差异是否选择偏倚"], forcingEvidenceCn: "rank/初始化改变时两个簇频繁重分配。" },
    { strengthenedCn: ["最大结局差异可能来自按结果挑结构"], weakenedCn: ["不稳定簇可称侵袭机制亚型"], unresolvedCn: ["连续程序与结局关系"], forcingEvidenceCn: "结局差异最大者恰是分配最不稳定的簇。" },
    { strengthenedCn: ["一个连续 program 可跨队列复现"], weakenedCn: ["冻结四分类可在新样本重现"], unresolvedCn: ["program 的生物来源和机制"], forcingEvidenceCn: "外部队列不能按原规则形成四类，只保留连续轴。" },
  ],
  "bulk-single-cell-discordance": [
    { strengthenedCn: ["bulk 层存在 ECM 蛋白增加"], weakenedCn: ["该结果已定位到 CAF 转录激活"], unresolvedCn: ["组成、状态、产生与积累"], forcingEvidenceCn: "bulk 蛋白混合了细胞来源和组织沉积。" },
    { strengthenedCn: ["RNA 与蛋白可能只有弱跨层相容"], weakenedCn: ["转录与蛋白完全一致"], unresolvedCn: ["时间差与测量覆盖"], forcingEvidenceCn: "匹配 bulk RNA 基因集仅弱同向。" },
    { strengthenedCn: ["取样区域差异可解释部分不一致"], weakenedCn: ["CAF 比例或类内 RNA 必然驱动蛋白变化"], unresolvedCn: ["沉积位置与产生来源"], forcingEvidenceCn: "scRNA 未见同向变化，且捕获组织区域不同。" },
    { strengthenedCn: ["局部蛋白沉积增加与 bulk 结果相容"], weakenedCn: ["scRNA 阴性即可否定蛋白观察"], unresolvedCn: ["增强来自产生增加还是清除下降"], forcingEvidenceCn: "空间蛋白显示局部沉积，但没有产生/降解测量。" },
  ],
  "composition-state": [
    { strengthenedCn: ["bulk 炎症 signature 存在组间差异"], weakenedCn: ["signature 自动代表每个髓系细胞激活"], unresolvedCn: ["组成与类内状态贡献"], forcingEvidenceCn: "bulk 是细胞比例与类内表达的混合。" },
    { strengthenedCn: ["髓系比例增加可能贡献 bulk 差异"], weakenedCn: ["全部差异只能来自类内状态"], unresolvedCn: ["捕获效率造成的比例偏倚"], forcingEvidenceCn: "供体级比例差 +8%，但组间捕获效率不同。" },
    { strengthenedCn: ["组成结论依赖注释方案"], weakenedCn: ["比例效应对分类完全稳定"], unresolvedCn: ["类内效应是否小于有意义界值"], forcingEvidenceCn: "替代注释使比例效应减弱，类内估计接近零但 CI 仍宽。" },
    { strengthenedCn: ["现有数据不足以确认 within-state 改变"], weakenedCn: ["未显著即可证明类内等效"], unresolvedCn: ["更精确供体级状态效应"], forcingEvidenceCn: "pseudobulk 区间仍包含预设有意义差异。" },
  ],
  "main-figure-chain": [
    { strengthenedCn: ["主图需要围绕预定义问题组织"], weakenedCn: ["34 张图都应进入主文"], unresolvedCn: ["每张图的独立证据任务"], forcingEvidenceCn: "结果仓库按分析数量而非问题结构形成。" },
    { strengthenedCn: ["少数图直接回答主问题"], weakenedCn: ["显著图都贡献独立证据"], unresolvedCn: ["共享数据导致的依赖"], forcingEvidenceCn: "多张热图、网络和富集重复同一 signal。" },
    { strengthenedCn: ["四 panel 限额迫使区分必要与冗余"], weakenedCn: ["保留全部显著结果最透明"], unresolvedCn: ["验证证据应替换哪项描述图"], forcingEvidenceCn: "共享数据的重复图不能增加独立支持。" },
    { strengthenedCn: ["独立队列校准图承担新证据任务"], weakenedCn: ["内部相关图比外部校准更适合作主证据"], unresolvedCn: ["外部区间宽度下的适用域"], forcingEvidenceCn: "新图提供独立队列校准及 CI，改变证据链而非只换外观。" },
  ],
  "alternative-next-step": [
    { strengthenedCn: ["下一步应区分竞争解释"], weakenedCn: ["复杂模型天然最有价值"], unresolvedCn: ["各行动的成本与区分力"], forcingEvidenceCn: "同一关联可由四种机制产生。" },
    { strengthenedCn: ["中心分层复核以成本 1 区分三个解释"], weakenedCn: ["成本最高实验必然优先"], unresolvedCn: ["真实预测信息是否跨中心"], forcingEvidenceCn: "成本×区分力矩阵给出可比较后果。" },
    { strengthenedCn: ["冻结选择可防止看到结果后重写理由"], weakenedCn: ["可按最有利结果事后换分析"], unresolvedCn: ["中心差异来自测量还是结局定义"], forcingEvidenceCn: "学习者必须在分层结果揭示前记录选择。" },
    { strengthenedCn: ["结局定义差异解释了单中心效应"], weakenedCn: ["biomarker 有稳定跨中心预测作用"], unresolvedCn: ["统一结局定义后的剩余效应"], forcingEvidenceCn: "效应只出现在采用不同结局定义的一个中心，迫使改选下一步。" },
  ],
  "ai-plan-audit": [
    { strengthenedCn: ["AI 计划必须先经过独立问题与风险审查"], weakenedCn: ["流畅计划可直接执行"], unresolvedCn: ["time zero、事件、删失与验证"], forcingEvidenceCn: "初始计划按最优 cut-point 和 stepwise 自动选择。" },
    { strengthenedCn: ["关键设计字段缺失使输出不可解释"], weakenedCn: ["代码能运行就说明计划完整"], unresolvedCn: ["事件信息与模型复杂度"], forcingEvidenceCn: "计划未定义起点、事件、删失、事件数或验证集。" },
    { strengthenedCn: ["漂亮图不会修复 cut-point 与选择偏倚"], weakenedCn: ["自动输出 KM/HR/P 值即可形成结论"], unresolvedCn: ["冻结修订流程后的表现"], forcingEvidenceCn: "界面产物丰富但核心数据角色仍未定义。" },
    { strengthenedCn: ["数据驱动 cut-point 不稳且 PH 违反"], weakenedCn: ["AI 原计划可保持不变"], unresolvedCn: ["连续建模与时间变化效应的验证"], forcingEvidenceCn: "按冻结复核揭示两个明确预测违例，要求记录拒绝理由与更新。" },
  ],
};
