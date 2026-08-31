import type { MaterializedAssessmentRole, MaterializedLessonAssessments } from "../assessment-material-types";

const role = (
  stimulusFormat: MaterializedAssessmentRole["stimulusFormat"], diseaseAreaCn: string, studyDesignCn: string, dataModalityCn: string,
  scenarioCn: string, factsCn: MaterializedAssessmentRole["factsCn"], decisionCn: string, keyCheckCn: string,
  maximumBoundaryCn: string, changeMindCn: string, requiredActionKeys: MaterializedAssessmentRole["requiredActionKeys"],
  plausibleDistractorsCn: MaterializedAssessmentRole["plausibleDistractorsCn"], representationPurposeCn: string,
): MaterializedAssessmentRole => ({
  diseaseAreaCn, studyDesignCn, dataModalityCn, scenarioCn, stimulusFormat, factsCn, decisionCn, keyCheckCn, maximumBoundaryCn, changeMindCn,
  requiredActionKeys, evidenceFactIndexByAction: { decision: 0, key_check: 1, boundary: 2, change_mind: 3 }, plausibleDistractorsCn, representationPurposeCn,
});

export const methodAssessmentMaterial: Record<string, MaterializedLessonAssessments> = {
  "differential-analysis": {
    apply: {
      diseaseAreaCn: "类风湿关节炎", studyDesignCn: "8 位供体的平衡批次 bulk RNA-seq 组间研究", dataModalityCn: "基因原始计数与供体/批次元数据", scenarioCn: "审稿人需判断 GeneX 的预定义 treatment-control 差异能否成立。", stimulusFormat: "case_table",
      factsCn: ["8 位供体各贡献一个样本；control 与 treatment 各 4 人，B1/B2 在两组内均各 2 人。", "GeneX 的 treatment-control log2FC=0.88，95% CI 0.42–1.34，原始 P=0.0004。", "过滤后 500 个基因构成预定义检验族，BH q=0.018。", "若按供体标签置换后效应仍同向且 batch×group 敏感性模型给 log2FC=0.83，将支持稳健性；若方向反转则撤回。"],
      decisionCn: "将 GeneX 报告为供体层、批次调整后的上调关联", keyCheckCn: "核对独立单位、平衡批次、预定义 contrast 与完整检验族", maximumBoundaryCn: "最多主张类风湿供体样本中的表达差异，不能称治疗机制", changeMindCn: "若供体层敏感性分析方向反转或批次与组实际共线则撤回差异结论", requiredActionKeys: ["decision", "key_check", "boundary", "change_mind"], evidenceFactIndexByAction: { decision: 1, key_check: 0, boundary: 2, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "因 P<0.001，直接称 GeneX 为治疗靶点", whyWrongCn: "显著组间差异不识别机制或靶点效用", whenMayHoldCn: "有扰动、救援和独立功能验证" }, { labelCn: "只对显著的 12 个基因计算 FDR", whyWrongCn: "事后缩小检验族会低估多重性", whenMayHoldCn: "12 个基因在看结果前已注册为唯一家族" }], representationPurposeCn: "病例表把供体、效应、检验族与改变判断的敏感性证据分行，要求逐项引用。"
    },
    remediation: {
      diseaseAreaCn: "系统性红斑狼疮", studyDesignCn: "两供体双文库的混杂 RNA-seq 反例", dataModalityCn: "设计矩阵列与文库计数", scenarioCn: "从矩阵结构识别伪重复和不可估 contrast。", stimulusFormat: "evidence_matrix",
      factsCn: ["D1 的 L1a/L1b 与 D2 的 L2a/L2b 被错误编码成 4 个独立供体。", "全部 control 文库在 B1、全部 treatment 文库在 B2，design=~batch+group 的两列完全共线。", "错误行级模型给 log2FC=1.7、95% CI 1.2–2.2；按真实供体聚合后每组仅 1 位供体。", "只有新增跨批次平衡的独立供体，才能把 group 与 batch 分开估计。"],
      decisionCn: "停止当前 group 差异估计并按供体重建数据", keyCheckCn: "检查 design matrix 秩及文库到供体的映射", maximumBoundaryCn: "现有数据只能描述文库差异，不能估计疾病组效应", changeMindCn: "新增平衡供体使矩阵满秩后再重新估计", requiredActionKeys: ["decision", "key_check", "boundary"], evidenceFactIndexByAction: { decision: 2, key_check: 1, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "在模型中同时加入 batch 即可校正", whyWrongCn: "完全共线时没有数据支持分离两个效应", whenMayHoldCn: "每个批次内同时有两组且矩阵满秩" }, { labelCn: "技术重复增加到 20 个即可提高组间证据", whyWrongCn: "技术文库不增加独立生物复制", whenMayHoldCn: "目标仅是量化同一供体的技术测量误差" }], representationPurposeCn: "证据矩阵将错误编码、共线、虚假精度和可恢复条件并列，训练结构诊断。"
    },
    review: {
      diseaseAreaCn: "胰腺癌", studyDesignCn: "双中心独立患者血浆蛋白组比较", dataModalityCn: "DIA 蛋白强度、缺失率与多重校正结果", scenarioCn: "判断论文摘要能否把 ProteinY 写为病例标志物。", stimulusFormat: "decision_timeline",
      factsCn: ["C1/C2 各纳入病例 3 人和对照 3 人，每位患者只有一份血浆。", "ProteinY 差异=0.31 log2，95% CI -0.08–0.70，原始 P=0.04。", "预注册 500 个蛋白为同一检验族，BH q=0.41。", "病例缺失率 19%、对照 6%；若按预设左删失模型后 CI 排除 0 且 q<0.05，才更新为可重复候选。"],
      decisionCn: "不将 ProteinY 列为已验证差异蛋白", keyCheckCn: "核对缺失机制和 500 蛋白家族的 FDR", maximumBoundaryCn: "最多称原始 P 的探索性信号", changeMindCn: "预设缺失模型与多重校正均通过时再升级", requiredActionKeys: ["decision", "boundary"], evidenceFactIndexByAction: { decision: 2, key_check: 3, boundary: 1, change_mind: 0 },
      plausibleDistractorsCn: [{ labelCn: "P=0.04 已证明病例蛋白升高", whyWrongCn: "CI 跨零且家族 FDR 未通过", whenMayHoldCn: "单一预注册终点且区间支持有意义效应" }, { labelCn: "两个中心都有患者，因此自动属于外部验证", whyWrongCn: "这是同一分析中的中心分层而非冻结后独立验证", whenMayHoldCn: "模型先在一中心冻结、另一中心隔离评价" }], representationPurposeCn: "时间线呈现纳入、效应、FDR、缺失敏感性四个决策时点，防止只读摘要 P 值。"
    }
  },
  correlation: {
    apply: {
      diseaseAreaCn: "慢性肾病", studyDesignCn: "三中心横断面患者研究", dataModalityCn: "eGFR 与血清 FGF23 连续测量", scenarioCn: "总体散点呈正相关，但需判断中心分层后的含义。", stimulusFormat: "case_table",
      factsCn: ["三个中心各 30 名独立患者；中心均值同时从低 eGFR/低 FGF23 排到高 eGFR/高 FGF23。", "总体 Pearson r=0.62，95% CI 0.47–0.73；中心内 r 分别为 -0.31、-0.28、-0.34。", "中心内散点近似线性、无单点 Cook 距离>0.15，eGFR 范围重叠 35–70。", "若中心调整后的部分相关 CI 跨 0，则放弃统一正相关；若三中心负向效应均复现则改报分层负关联。"],
      decisionCn: "拒绝用总体 r 概括个体层关系并报告 Simpson 反转", keyCheckCn: "查看中心内散点、重叠范围与独立患者单位", maximumBoundaryCn: "只能描述条件关联，不能推断 FGF23 导致肾功能变化", changeMindCn: "以预设中心调整分析的方向和区间更新结论", requiredActionKeys: ["decision", "key_check", "boundary", "change_mind"], evidenceFactIndexByAction: { decision: 1, key_check: 2, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "样本量 90 足以优先采用总体 r", whyWrongCn: "更大 n 不消除中心聚合造成的反转", whenMayHoldCn: "中心不同时关联两变量且斜率同质" }, { labelCn: "改用 Spearman 即可消除中心混杂", whyWrongCn: "秩相关仍混合中心间与中心内变化", whenMayHoldCn: "问题仅为单总体单调非线性且无分层" }], representationPurposeCn: "病例表同时给总体、分层、形状和更新规则，使相关系数必须回到散点结构。"
    },
    remediation: {
      diseaseAreaCn: "偏头痛", studyDesignCn: "前瞻队列的影响点诊断", dataModalityCn: "每月发作次数与睡眠时长", scenarioCn: "一个极端患者使相关方向改变，需决定是否删除。", stimulusFormat: "evidence_matrix",
      factsCn: ["59 名患者睡眠 5–9 小时、发作 1–12 次，另 1 人记录 2 小时与 28 次。", "含全部患者 Pearson r=-0.71；删去该人 r=-0.26，95% CI -0.48–0.01。", "该人的原始日记完整、设备校准正常，但属于预先定义目标人群。", "稳健回归斜率为每多睡 1 小时 -0.8 次，95% CI -1.5–-0.1；若核查发现录入错误才可更正。"],
      decisionCn: "保留该患者并并列报告稳健与经典估计", keyCheckCn: "依据原始记录和预设排除规则判断影响点是否为错误", maximumBoundaryCn: "不能把删除后较弱相关当主要结果", changeMindCn: "仅在独立核查证实测量或录入错误时更正分析", requiredActionKeys: ["decision", "key_check", "change_mind"], evidenceFactIndexByAction: { decision: 1, key_check: 2, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "离群点降低正态性，应自动删除", whyWrongCn: "极端但真实的目标患者携带总体信息", whenMayHoldCn: "预设质量规则判定测量无效" }, { labelCn: "只报告更显著的稳健估计", whyWrongCn: "方法不能按显著性事后选择", whenMayHoldCn: "稳健模型是预注册主分析" }], representationPurposeCn: "矩阵把数值敏感性与数据真实性分开，矫正见到离群点就删除的反射。"
    },
    review: {
      diseaseAreaCn: "乳腺癌", studyDesignCn: "配对肿瘤单细胞观察研究", dataModalityCn: "scRNA-seq 细胞级 ESR1 与增殖分数", scenarioCn: "论文以 18,420 个细胞声称两个基因程序高度相关。", stimulusFormat: "decision_timeline",
      factsCn: ["12 位供体各有 400–2400 个肿瘤细胞，细胞嵌套在供体内。", "逐细胞 Spearman ρ=0.48、P<10^-50；供体 pseudobulk 后 ρ=0.12、95% CI -0.50–0.65。", "ESR1 与增殖分数都随上皮细胞比例升高，供体间比例为 22%–81%。", "若在独立 30 供体、固定细胞类型组成后供体层相关仍>0.4 且 CI 排除 0，才升级关联。"],
      decisionCn: "拒绝把细胞级显著性当供体层相关证据", keyCheckCn: "先聚合供体并审查组成共同原因", maximumBoundaryCn: "最多描述本数据内细胞状态共现", changeMindCn: "独立供体层、组成调整后的复现才改变判断", requiredActionKeys: ["decision", "boundary"], evidenceFactIndexByAction: { decision: 1, key_check: 2, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "细胞数超过一万，相关必然稳定", whyWrongCn: "细胞不是独立患者复制", whenMayHoldCn: "推断目标确为独立培养细胞且无聚类" }, { labelCn: "Spearman 已对组成差异稳健", whyWrongCn: "秩变换不控制共同原因", whenMayHoldCn: "组成与两变量均无关联" }], representationPurposeCn: "时间线从细胞结果推进到供体汇总、组成解释与独立复现门槛。"
    }
  },
  "linear-regression": {
    apply: {
      diseaseAreaCn: "高血压", studyDesignCn: "多中心横断面条件均值模型", dataModalityCn: "收缩压、年龄、治疗与中心表", scenarioCn: "解释年龄系数前发现编码和函数形式问题。", stimulusFormat: "case_table",
      factsCn: ["240 名患者独立入组；治疗编码表写 1=未治疗、0=治疗，但论文按相反参照解释。", "模型中年龄每 10 岁系数=6.2 mmHg，95% CI 3.8–8.6，调整治疗和中心。", "残差-拟合图呈 U 形；加入预设二次项后 40→60 岁边际差=4.1 mmHg，60→80 岁=10.7 mmHg。", "若修正治疗编码且样条模型的年龄曲线近线性，才恢复单一每 10 岁斜率表述。"],
      decisionCn: "修正参照并以边际预测呈现非线性年龄关联", keyCheckCn: "核对变量字典、函数形式与残差诊断", maximumBoundaryCn: "系数是调整后条件均值关联，不是年龄的可干预因果效应", changeMindCn: "修正编码后线性形式通过诊断才可报告统一斜率", requiredActionKeys: ["decision", "key_check", "boundary", "change_mind"], evidenceFactIndexByAction: { decision: 2, key_check: 0, boundary: 1, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "CI 排除 0，因此原线性模型足够", whyWrongCn: "显著斜率不证明均值函数形式正确", whenMayHoldCn: "预设线性模型且残差无系统曲率" }, { labelCn: "加入中心和治疗后年龄效应就是因果效应", whyWrongCn: "协变量调整不自动控制所有混杂和选择", whenMayHoldCn: "目标试验可识别条件与因果假设成立" }], representationPurposeCn: "病例表把字典、系数、诊断和可逆更新条件对应到四种判断。"
    },
    remediation: {
      diseaseAreaCn: "慢性阻塞性肺病", studyDesignCn: "队列中连续暴露的边际预测练习", dataModalityCn: "PM2.5 与 FEV1 连续测量", scenarioCn: "把每 1 单位系数改写为临床可读的每 10 单位预测差。", stimulusFormat: "evidence_matrix",
      factsCn: ["180 名独立患者的 PM2.5 范围 8–42 μg/m³，80% 位于 12–30。", "调整模型 β=-0.018 L/μg/m³，95% CI -0.029–-0.007。", "在协变量固定时，15 与 25 μg/m³ 的预测 FEV1 分别为 2.31 与 2.13 L。", "30 以上仅 14 人；若限制在 12–30 后曲线反向，则停止外推。"],
      decisionCn: "将效应表述为每 10 μg/m³ 对应 FEV1 低 0.18 L", keyCheckCn: "确认单位换算与数据支持范围", maximumBoundaryCn: "只在观察范围内解释条件均值差", changeMindCn: "受支持范围内的灵活曲线反向时更新线性结论", requiredActionKeys: ["decision", "key_check", "boundary"], evidenceFactIndexByAction: { decision: 2, key_check: 1, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "β=-0.018 表示 FEV1 降低 1.8%", whyWrongCn: "结局以 L 建模，系数不是百分比", whenMayHoldCn: "结局采用 log 链接且明确反变换" }, { labelCn: "可预测 60 μg/m³ 的 FEV1", whyWrongCn: "远超观测范围且无重叠支持", whenMayHoldCn: "外部数据覆盖该范围并验证函数形式" }], representationPurposeCn: "证据矩阵用系数、预测值与范围三种表达重建单位感。"
    },
    review: {
      diseaseAreaCn: "肌营养不良", studyDesignCn: "小鼠纵向重复测量实验", dataModalityCn: "每周握力连续结局", scenarioCn: "判断把每只动物 6 次测量当 72 行普通 OLS 是否可接受。", stimulusFormat: "decision_timeline",
      factsCn: ["12 只小鼠随机分两组，每只在 0–5 周测量 6 次。", "普通 OLS 按 72 行独立给治疗系数 9.4 g，95% CI 6.8–12.0。", "动物内相关 ICC=0.71；混合模型给 8.7 g，95% CI 1.2–16.2。", "若每只动物只保留预定义第 5 周且无缺失，独立单位分析可改为 12 行。"],
      decisionCn: "采用动物层相关结构的混合模型而非行级 OLS", keyCheckCn: "核对随机化单位、ICC 和时间×治疗项", maximumBoundaryCn: "最多支持本实验动物的平均轨迹差异", changeMindCn: "改为每动物单一预设终点时可使用独立样本模型", requiredActionKeys: ["decision", "boundary"], evidenceFactIndexByAction: { decision: 2, key_check: 0, boundary: 1, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "72 个观测使普通 OLS 精度更高", whyWrongCn: "重复测量相关导致标准误虚小", whenMayHoldCn: "72 行来自独立随机化动物" }, { labelCn: "两模型点估计接近即可保留 OLS", whyWrongCn: "推断依赖不确定性而不只点估计", whenMayHoldCn: "稳健聚类标准误与正确模型一致" }], representationPurposeCn: "时间线展示重复产生、错误精度、相关模型与单终点替代条件。"
    }
  },
  "logistic-regression": {
    apply: {
      diseaseAreaCn: "术后肺部感染", studyDesignCn: "前瞻性二元结局队列", dataModalityCn: "感染状态与预测概率", scenarioCn: "结局常见时判断 OR=2 能否写成风险翻倍。", stimulusFormat: "case_table",
      factsCn: ["400 人中 160 人感染，未暴露组基线风险为 30%。", "调整 OR=2.00，95% CI 1.35–2.96，每 1 个暴露单位。", "以基线 odds 0.30/0.70 计算，OR=2 对应概率 46.2%，绝对差 16.2 个百分点、RR=1.54。", "若目标人群基线风险改变，绝对概率必须重算；外部校准斜率<0.8 时停止阈值使用。"],
      decisionCn: "按 odds 尺度解释 OR，并给出 30% 基线下的绝对概率", keyCheckCn: "核对参照、单位、事件数和概率反变换", maximumBoundaryCn: "不能把 OR=2 写成风险增加 100%", changeMindCn: "随目标基线风险与外部校准更新绝对风险表述", requiredActionKeys: ["decision", "key_check", "boundary", "change_mind"], evidenceFactIndexByAction: { decision: 2, key_check: 1, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "OR=2 即感染概率从 30% 到 60%", whyWrongCn: "odds 倍增不等于概率倍增", whenMayHoldCn: "极罕见结局时 OR 近似 RR" }, { labelCn: "CI 排除 1 就能直接选择临床阈值", whyWrongCn: "关联估计不提供校准与决策效用", whenMayHoldCn: "独立验证校准和净获益均满足预设标准" }], representationPurposeCn: "病例表串联基线风险、OR、反变换和外部校准门槛。"
    },
    remediation: {
      diseaseAreaCn: "罕见遗传性心肌病", studyDesignCn: "小样本病例对照完全分离", dataModalityCn: "2×2 基因变异与病例状态表", scenarioCn: "所有变异携带者均为病例，普通极大似然失败。", stimulusFormat: "evidence_matrix",
      factsCn: ["30 病例中 6 人携带变异，30 对照中 0 人携带。", "普通 logistic 系数迭代至 18.4、SE=1450，OR 与 Wald CI 近乎无限。", "Firth 惩罚模型 OR=15.2，95% profile CI 1.7–>100。", "若新增独立对照中出现携带者，分离解除并可重新估计；否则保持极宽边界。"],
      decisionCn: "改用分离可处理的惩罚/精确方法并报告宽区间", keyCheckCn: "检查事件-参数信息和迭代警告", maximumBoundaryCn: "只能称强但高度不确定的病例关联", changeMindCn: "新增携带对照后重新估计普通模型适用性", requiredActionKeys: ["decision", "key_check", "change_mind"], evidenceFactIndexByAction: { decision: 2, key_check: 1, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "OR 很大说明效应已精确", whyWrongCn: "分离使极大似然发散而非提供精确证据", whenMayHoldCn: "有限估计且区间窄、独立复现" }, { labelCn: "删除变异变量即可解决", whyWrongCn: "会回避核心科学问题", whenMayHoldCn: "变量事后证实为测量伪影" }], representationPurposeCn: "矩阵从原始小表到算法警告再到可解释的惩罚估计。"
    },
    review: {
      diseaseAreaCn: "糖尿病视网膜病变", studyDesignCn: "外部中心预测模型验证", dataModalityCn: "眼底图像模型概率与二元结局", scenarioCn: "外部 AUC 尚可但校准差，判断阈值能否部署。", stimulusFormat: "decision_timeline",
      factsCn: ["模型在中心 A 的 1200 张开发图像冻结；中心 B 有 420 名新患者各一张图。", "中心 B AUC=0.81，95% CI 0.76–0.86。", "校准截距=-0.72、斜率=0.61；预测 20% 风险者实际约 9%。", "若在 B 仅重校准截距/斜率后独立时间队列净获益超过 treat-all，才启用 20% 阈值。"],
      decisionCn: "暂停原 20% 阈值部署并先重校准", keyCheckCn: "分开检查区分、校准与阈值净获益", maximumBoundaryCn: "只能称排序能力可接受，不能称概率可直接使用", changeMindCn: "重校准后在时间隔离验证中有净获益才部署", requiredActionKeys: ["decision", "boundary"], evidenceFactIndexByAction: { decision: 2, key_check: 1, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "AUC>0.8 足以直接部署", whyWrongCn: "AUC 不衡量概率校准或阈值后果", whenMayHoldCn: "只需排序且不输出概率决策" }, { labelCn: "外部验证失败，应从头重训所有参数", whyWrongCn: "区分保留时简单重校准可能足够", whenMayHoldCn: "特征关系和排序也显著漂移" }], representationPurposeCn: "时间线明确冻结、外部区分、校准失败和重新部署门槛。"
    }
  },
  "cox-regression": {
    apply: {
      diseaseAreaCn: "结直肠癌", studyDesignCn: "术后预后队列的 landmark Cox 分析", dataModalityCn: "复发时间、事件、风险集与 ctDNA", scenarioCn: "原论文错置 time zero 并用 31 个事件搜索 cut-point。", stimulusFormat: "case_table",
      factsCn: ["240 人以手术日为随访起点；ctDNA 只能在术后第 30 天测得，30 天前复发/死亡的 9 人被排除。", "其余 231 人仅 31 次复发，却在 18 个 cut-point 中选择最小 P，最终 HR=3.8，95% CI 1.6–9.1。", "第 30 天 landmark 风险集为 ctDNA 高 42/低 189；12 月仍在险 25/151，事件分别 12/19；Schoenfeld global P=0.03。", "若以第 30 天为共同 time zero、冻结连续 ctDNA 单位并允许时间变化效应后外部复现，才恢复预后主张。"],
      decisionCn: "重建第 30 天 landmark 风险集并撤销数据驱动二分 HR", keyCheckCn: "核对 time origin、31 个事件、风险表、HR 单位与 PH", maximumBoundaryCn: "当前 HR 仅是有 immortal-selection 与 cut-point 偏倚的探索结果", changeMindCn: "冻结起点/连续单位/时间变化模型并外部复现后更新", requiredActionKeys: ["decision", "key_check", "boundary", "change_mind"], evidenceFactIndexByAction: { decision: 0, key_check: 2, boundary: 1, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "总样本 240 足以支持 18 个阈值搜索", whyWrongCn: "Cox 信息主要由 31 个事件和风险集提供", whenMayHoldCn: "阈值预注册且事件量支持参数" }, { labelCn: "HR=3.8 表示 12 月复发风险高 3.8 倍", whyWrongCn: "HR 是瞬时 hazard 比且 PH 已可疑", whenMayHoldCn: "明确 PH 成立并仍不能等同累计风险比" }], representationPurposeCn: "病例表提供起点、事件、风险人数、HR 与 PH，使读者能独立重建失败链。"
    },
    remediation: {
      diseaseAreaCn: "急性髓系白血病", studyDesignCn: "移植后 MRD landmark 风险集练习", dataModalityCn: "进入时间、复发/删失与 MRD 状态", scenarioCn: "按第 60 天 landmark 重画谁能进入风险集。", stimulusFormat: "decision_timeline",
      factsCn: ["A 在移植后 35 天复发，B 在 50 天死亡，C/D/E/F 活到 60 天并在当天测 MRD。", "以第 60 天为 time zero 时仅 C/D/E/F 可进入；A/B 不能被编码为 MRD 阴性对照。", "C(MRD+)于 landmark 后 40 天复发，D(MRD+)随访 120 天删失，E/F(MRD-)分别 90 天复发、150 天删失。", "若研究问题改为移植日起动态 MRD，则需 time-dependent covariate 模型而非回填第 60 天状态。"],
      decisionCn: "landmark 分析只纳入活到第 60 天且无事件者", keyCheckCn: "逐事件时刻核对进入与离开风险集", maximumBoundaryCn: "landmark HR 只适用于第 60 天仍无事件者", changeMindCn: "若目标从 landmark 改为全过程则改用时间变化协变量", requiredActionKeys: ["decision", "key_check", "boundary"], evidenceFactIndexByAction: { decision: 1, key_check: 2, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "把 A/B 计为早期事件可增加事件数", whyWrongCn: "其暴露在事件后才定义，无法进入 landmark 风险集", whenMayHoldCn: "暴露在移植日已测且起点为移植日" }, { labelCn: "将 A/B MRD 记为缺失并多重插补", whyWrongCn: "这是结构性未定义而非普通缺失", whenMayHoldCn: "本应在险且随机漏测 MRD" }], representationPurposeCn: "决策时间线让进入资格先于暴露与事件比较，直观修复 time zero。"
    },
    review: {
      diseaseAreaCn: "肝移植", studyDesignCn: "跨中心冻结预后模型验证", dataModalityCn: "移植物失功生存数据与风险预测", scenarioCn: "论文只报未注明单位的 HR，缺绝对风险与验证。", stimulusFormat: "evidence_matrix",
      factsCn: ["开发中心 620 人、84 次失功；外部中心 310 人、39 次失功，time zero 均应为移植日。", "生物标志物 HR=1.45，95% CI 1.12–1.89，但 Methods 未说明每 1 ng/mL、每 SD 或二分。", "外部中心 Schoenfeld P=0.48；2 年风险表高/低组为 96/178，4 年为 51/121，却未给校准或绝对风险。", "若作者补齐冻结单位、基线生存并在外部中心给 4 年校准斜率 0.9–1.1，才支持个体预测。"],
      decisionCn: "要求补明 HR 单位与外部时间化绝对风险后再解释", keyCheckCn: "核对共同 time zero、事件量、PH、风险表和基线生存", maximumBoundaryCn: "现稿最多支持未定尺度的相对 hazard 关联", changeMindCn: "冻结尺度并外部校准合格后升级为预后预测证据", requiredActionKeys: ["decision", "boundary"], evidenceFactIndexByAction: { decision: 1, key_check: 2, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "HR 的单位不影响解释", whyWrongCn: "每单位与每 SD 的效应大小不可互换", whenMayHoldCn: "变量是明确二元且参照已写清" }, { labelCn: "外部 PH P>0.05 即完成验证", whyWrongCn: "PH 诊断不替代绝对风险校准", whenMayHoldCn: "目标仅为相对 hazard 且其他验证指标齐全" }], representationPurposeCn: "证据矩阵将论文 Methods 缺口和 Results 缺口对应到可审核数值。"
    }
  },
  "kaplan-logrank": {
    apply: {
      diseaseAreaCn: "卵巢癌", studyDesignCn: "随机试验的描述性生存比较", dataModalityCn: "KM 曲线、风险表与 log-rank", scenarioCn: "曲线交叉时判断整体检验和 24 月差异。", stimulusFormat: "case_table",
      factsCn: ["time zero 为随机化日；A/B 组各 20 人，事件/删失定义一致。", "风险人数 A/B 在 0、6、12、24 月为 20/20、15/17、10/11、4/3。", "KM 生存率 A 在 6/12/24 月为 0.84/0.66/0.52，B 为 0.90/0.63/0.50；曲线 10–14 月交叉。", "24 月差=2 个百分点，95% CI -18–22；log-rank P=0.78；若预设 RMST 显示有意义差异才更新。"],
      decisionCn: "报告无清晰整体或 24 月生存差异并展示交叉", keyCheckCn: "核对 time zero、风险人数、删失和曲线交叉", maximumBoundaryCn: "不能用早期视觉分离声称治疗获益", changeMindCn: "预设时间尺度效应如 RMST 有精确差异时再更新", requiredActionKeys: ["decision", "key_check", "boundary", "change_mind"], evidenceFactIndexByAction: { decision: 3, key_check: 1, boundary: 2, change_mind: 0 },
      plausibleDistractorsCn: [{ labelCn: "6 月 A/B 差异说明 A 更差", whyWrongCn: "未给时点区间且后续曲线交叉", whenMayHoldCn: "6 月是预设主要时点且区间支持差异" }, { labelCn: "log-rank 不显著证明两曲线相同", whyWrongCn: "不拒绝不等于等效，样本和尾部风险人数很少", whenMayHoldCn: "预设等效界值且区间完全位于界值内" }], representationPurposeCn: "病例表把风险表、逐时点估计、交叉与整体检验置于同一判断面板。"
    },
    remediation: {
      diseaseAreaCn: "儿童脑肿瘤", studyDesignCn: "五患者删失编码纠错", dataModalityCn: "个体事件时间表", scenarioCn: "逐人修正目标事件、竞争事件和行政截止编码。", stimulusFormat: "decision_timeline",
      factsCn: ["R1 在 8 月死于目标事件；R2 在 6 月死于竞争事件。", "R3 在 10 月失访；R4/R5 到 12 月行政截止仍无事件。", "原表把 R2 记为目标事件，并把 R4/R5 记成 12 月目标事件。", "若目标改为全因死亡，R2 才成为事件；R4/R5 仍只能行政删失。"],
      decisionCn: "将 R1 记目标事件，R2/R3/R4/R5 按目标估计正确退出", keyCheckCn: "逐人核对事件类型、最后已知无事件时间与行政截止", maximumBoundaryCn: "当前编码只适用于目标事件无复发生存", changeMindCn: "更换为全因死亡 estimand 时重新编码 R2", requiredActionKeys: ["decision", "key_check", "change_mind"], evidenceFactIndexByAction: { decision: 2, key_check: 1, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "所有死亡都在任何 KM 中记事件", whyWrongCn: "事件编码取决于预先定义 estimand", whenMayHoldCn: "结局确为全因死亡" }, { labelCn: "行政截止时仍存活者记 12 月事件", whyWrongCn: "截止只结束观察，不制造事件", whenMayHoldCn: "12 月确有目标事件记录" }], representationPurposeCn: "时间线按发生顺序区分事件类型和观察终止，替代抽象删失定义。"
    },
    review: {
      diseaseAreaCn: "特发性肺纤维化", studyDesignCn: "回顾性 biomarker cut-point 探索队列", dataModalityCn: "生存曲线与 bootstrap 阈值稳定性", scenarioCn: "同队列尝试 19 个阈值后出现显著 log-rank。", stimulusFormat: "evidence_matrix",
      factsCn: ["112 人从确诊日起随访，共 42 次死亡。", "在同一数据尝试 19 个 cut-point，选择 P 最小阈值后 log-rank P=0.01。", "500 次患者级 bootstrap 的阈值四分位范围 1.2–3.9，分组一致率 54%。", "尚无冻结外部队列；若外部按固定 2.1 阈值复现时点效应与 CI，才视为验证。"],
      decisionCn: "把阈值降级为不稳定的探索候选", keyCheckCn: "审查 cut-point 搜索、事件数、bootstrap 稳定性和外部冻结", maximumBoundaryCn: "不能报告已验证预后分层阈值", changeMindCn: "固定阈值在独立队列复现效应后更新", requiredActionKeys: ["decision", "boundary"], evidenceFactIndexByAction: { decision: 2, key_check: 0, boundary: 1, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "P=0.01 已补偿 19 次搜索", whyWrongCn: "名义 P 未纳入阈值选择过程", whenMayHoldCn: "阈值唯一预注册且无搜索" }, { labelCn: "bootstrap 500 次证明阈值可靠", whyWrongCn: "重复次数多不改变仅 54% 分组一致", whenMayHoldCn: "阈值分布窄且分配高度稳定" }], representationPurposeCn: "矩阵把最优 P、重采样不稳与外部冻结缺失放在不同证据角色。"
    }
  },
  "restricted-cubic-spline": {
    apply: {
      diseaseAreaCn: "缺血性卒中", studyDesignCn: "连续 LDL 与复发风险队列", dataModalityCn: "Cox 限制性立方样条曲线与 rug", scenarioCn: "曲线在仅 4% 样本的尾部急升，被称为阈值。", stimulusFormat: "case_table",
      factsCn: ["620 人、74 次复发；LDL 的 5/35/65/95 百分位结点为 1.4/2.3/3.1/4.8 mmol/L。", "以 2.3 为参照，LDL=4.8 的 HR=2.4，95% CI 0.8–7.3；4.8 以上仅 25 人。", "整体关联 P=0.03、非线性 P=0.19；3 结点与 5 结点曲线在尾部方向不同。", "若外部队列尾部样本充分且冻结曲线在 4.8 附近重复急升，才考虑阈值研究。"],
      decisionCn: "保留连续曲线并拒绝把尾部拐点命名为阈值", keyCheckCn: "核对结点、参照、rug、尾部 CI 和自由度敏感性", maximumBoundaryCn: "最多支持范围中段的平滑关联", changeMindCn: "冻结函数在尾部充足外部数据中复现才升级", requiredActionKeys: ["decision", "key_check", "boundary", "change_mind"], evidenceFactIndexByAction: { decision: 2, key_check: 0, boundary: 1, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "整体 P<0.05 证明存在阈值", whyWrongCn: "整体关联不检验特定拐点，非线性也不显著", whenMayHoldCn: "阈值在外部预设并通过分段模型验证" }, { labelCn: "选曲线最陡点二分可便于临床", whyWrongCn: "事后切点夸大效应并丢失连续信息", whenMayHoldCn: "决策效用确定且切点独立验证" }], representationPurposeCn: "病例表将数据支持、曲线估计、非线性检验和复现门槛逐行对应。"
    },
    remediation: {
      diseaseAreaCn: "非酒精性脂肪肝", studyDesignCn: "横断面 ALT-纤维化连续模型", dataModalityCn: "样条图叠加分箱点估计", scenarioCn: "用分箱点识别漂亮曲线哪一段缺少数据。", stimulusFormat: "evidence_matrix",
      factsCn: ["500 人 ALT 中位数 38 U/L，90% 位于 18–82，仅 11 人>120。", "4 结点样条在 120 后急弯；ALT=150 的比值比 3.1，95% CI 0.6–16.4。", "按预设五分位的点估计前四组单调缓升，第五组 OR=1.4，95% CI 0.8–2.5。", "限制至 18–82 后非线性 P=0.62；新增高 ALT 样本前不解释尾部。"],
      decisionCn: "用分箱点与 rug 标示尾部急弯缺乏支持", keyCheckCn: "比较曲线 CI、分箱估计和每段样本数", maximumBoundaryCn: "结论限于 18–82 U/L 的缓升关联", changeMindCn: "高 ALT 区新增足量样本并稳定复现弯曲时更新", requiredActionKeys: ["decision", "key_check", "boundary"], evidenceFactIndexByAction: { decision: 2, key_check: 1, boundary: 0, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "样条比分类高级，因此忽略分箱检查", whyWrongCn: "灵活曲线仍需数据支持诊断", whenMayHoldCn: "整个范围样本密集且多种参数化一致" }, { labelCn: "宽 CI 只影响精度，不影响曲线形状", whyWrongCn: "尾部形状可由少数点和结点选择驱动", whenMayHoldCn: "形状在重采样与外部数据均稳定" }], representationPurposeCn: "证据矩阵用样本分布、曲线、分箱和限制分析四种表征定位不稳尾部。"
    },
    review: {
      diseaseAreaCn: "妊娠期糖尿病", studyDesignCn: "跨队列冻结 spline 运输验证", dataModalityCn: "连续血糖预测曲线与队列范围", scenarioCn: "新队列测量范围更窄，判断可运输部分。", stimulusFormat: "decision_timeline",
      factsCn: ["开发队列孕妇 900 人，空腹血糖 3.6–8.2 mmol/L，结点和参照已冻结。", "验证队列 430 人仅覆盖 4.2–6.1，区间内预测误差 MAE=0.07，校准斜率 0.98。", "开发曲线声称 7.0 后风险陡升，但验证队列无人达到 7.0。", "若另一个前瞻队列覆盖 6.1–8.2 且冻结曲线校准良好，才验证高端形状。"],
      decisionCn: "仅确认 4.2–6.1 范围内的运输性", keyCheckCn: "对齐量尺、冻结结点并比较两队列支持范围", maximumBoundaryCn: "不能用窄范围验证支持 7.0 后陡升", changeMindCn: "覆盖高端的独立前瞻数据通过校准后再扩展", requiredActionKeys: ["decision", "boundary"], evidenceFactIndexByAction: { decision: 1, key_check: 0, boundary: 2, change_mind: 3 },
      plausibleDistractorsCn: [{ labelCn: "整体验证斜率 0.98 证明全曲线", whyWrongCn: "验证数据未覆盖高端，无法检验该段", whenMayHoldCn: "验证范围完整覆盖开发范围" }, { labelCn: "把高端患者外推到验证范围之外", whyWrongCn: "这是无数据支持的函数外推", whenMayHoldCn: "有可信机制模型及独立外部支持" }], representationPurposeCn: "时间线按开发冻结、局部验证、未覆盖主张和未来扩展条件组织运输判断。"
    }
  },
  bootstrap: {
    apply: role("case_table", "前列腺癌", "患者多切片诊断模型开发", "数字病理切片特征", "确定 bootstrap 的重采样单位和完整流程。",
      ["80 位患者各有 2–6 张切片，共 310 张；结局在患者层定义。", "切片级 bootstrap 给 AUC 0.89、95% CI 0.86–0.92；患者级 bootstrap 给 0.78、0.69–0.85。", "特征筛选、染色标准化和超参数选择均曾在全数据完成。", "若每轮按患者抽样并重做标准化、筛选、调参后校正 AUC 仍≥0.75，才保留性能主张。"],
      "按患者有放回抽样并在每轮重做完整开发流程", "核对独立抽样单位及所有数据驱动步骤是否嵌套", "当前切片级区间不能表示患者泛化误差", "以完整患者级 bootstrap 的乐观校正结果更新", ["decision","key_check","boundary","change_mind"],
      [{labelCn:"按 310 张切片重采样以利用更多数据",whyWrongCn:"同一患者切片相关且结局不独立",whenMayHoldCn:"目标单位是独立切片且无患者聚类"},{labelCn:"固定入选特征只 bootstrap 系数",whyWrongCn:"遗漏选择不稳定性与乐观偏倚",whenMayHoldCn:"模型及全部特征在外部预先冻结"}], "病例表对比两层 bootstrap 数值并标出必须重做的开发步骤。"),
    remediation: role("evidence_matrix", "炎症性肠病", "内部验证流程审计", "血清代谢组预测矩阵", "修复只重拟合最终模型的伪 bootstrap。",
      ["120 位患者、35 个事件，初始 900 个代谢物。", "原流程先在全数据选 18 个特征，再 1000 次只重拟合这 18 个系数。", "naive AUC=0.84，伪校正 AUC=0.82；每轮重做筛选后校正 AUC=0.69。", "若使用外部冻结 18 特征且本队列仅验证，才可不在重采样中重选。"],
      "采用每轮从原始 900 特征开始的完整 bootstrap", "检查筛选、缺失插补与调参均在重采样内", "伪校正不能声称已处理全部过拟合", "外部冻结特征时可改变嵌套要求", ["decision","key_check","boundary"],
      [{labelCn:"1000 次足以弥补流程遗漏",whyWrongCn:"增加重复不修复系统性泄漏",whenMayHoldCn:"每次确实重复完整流程"},{labelCn:"选特征是无监督步骤可固定",whyWrongCn:"这里按结局选择且明显改变 AUC",whenMayHoldCn:"变换在外部数据完全冻结"}], "矩阵将重复次数与每轮内容拆开，强调算法次数不等于有效验证。"),
    review: role("decision_timeline", "早产", "小型外部医院验证", "临床风险评分", "判断开发队列 bootstrap 能否替代真实外部验证。",
      ["开发医院 600 人、90 例早产，患者级 bootstrap 校正 AUC=0.76。", "新医院 85 人、11 例早产，冻结模型 AUC=0.64、95% CI 0.46–0.81。", "新医院校准斜率 0.55，预测 20% 者实际 9%。", "若扩大独立医院样本后校准和区分达到预设门槛，才称可运输。"],
      "保留 bootstrap 为内部验证并把新医院结果列为不确定外部验证", "核对模型冻结、站点隔离与事件数", "不能用开发 bootstrap 覆盖站点漂移或声称外部有效", "扩大外部样本并通过冻结验证后更新", ["decision","boundary"],
      [{labelCn:"bootstrap 结果更精确，应覆盖外部结果",whyWrongCn:"内部重采样不模拟新医院差异",whenMayHoldCn:"目标仅为同源总体内部乐观校正"},{labelCn:"11 个事件足以宣布模型无效",whyWrongCn:"区间很宽，失败程度仍不精确",whenMayHoldCn:"预设无效界值且区间整体低于界值"}], "时间线区分开发内部验证、首次外部证据与扩样后的运输判断。")
  },
  "cross-validation": {
    apply: role("case_table", "阿尔茨海默病", "五折嵌套影像预测开发", "MRI radiomics", "定位全数据归一化造成的首次泄漏。",
      ["300 名患者各一套 MRI，五折按患者划分。", "流程先用全部 300 人计算均值/SD，再在训练折做特征选择和调参。", "该流程折外 AUC=0.86；把缩放拟合移入训练折后 AUC=0.74。", "若外部预先给定固定物理标准化参数，才允许折前应用而不读取本数据。"],
      "重画流程并把缩放、选择和调参全部放入训练折", "从原始数据开始追踪测试折是否影响任何拟合参数", "0.86 是泄漏后的内部估计，不能称泛化性能", "仅外部冻结变换可改变折内拟合要求", ["decision","key_check","boundary","change_mind"],
      [{labelCn:"归一化不看结局所以无泄漏",whyWrongCn:"测试折分布仍影响训练变换",whenMayHoldCn:"参数来自完全外部标准"},{labelCn:"五折保证每人都被测试所以结果有效",whyWrongCn:"折结构不修复折前预处理",whenMayHoldCn:"所有拟合步骤均严格折内"}], "病例表展示泄漏位置前后性能落差与合法例外。"),
    remediation: role("evidence_matrix", "癫痫", "患者多次 EEG 的时间分折", "EEG 片段与发作标签", "修复同患者片段跨训练和测试。",
      ["50 位患者各 20–100 个片段，共 3100 段。", "随机片段五折使 49/50 位患者同时出现在训练和测试；AUC=0.93。", "按患者分折后 AUC=0.68；按未来月份留出后 AUC=0.61。", "若部署仅为同一患者后续片段，预先说明个体化目标时可使用患者内时间分折。"],
      "按目标新人泛化采用患者级分折", "核对聚类 ID 与目标部署的时间结构", "片段级 AUC 不能代表新患者性能", "目标改为个体化连续监测时重新选择分折", ["decision","key_check","change_mind"],
      [{labelCn:"片段很多可抵消患者重叠",whyWrongCn:"模型可识别患者特征造成乐观",whenMayHoldCn:"片段来自互不相关独立对象"},{labelCn:"选患者分折中 AUC 较高的一次",whyWrongCn:"按结果挑划分引入选择偏倚",whenMayHoldCn:"划分规则预注册且重复汇总"}], "矩阵并排片段、患者和时间分折，迫使先定义泛化对象。"),
    review: role("decision_timeline", "脓毒症", "多中心时间外部验证", "EHR 时序特征", "比较 leave-center-out 与最终时间隔离队列的角色。",
      ["6 家医院 2019–2022 年数据用于开发，所有特征工程按训练医院拟合。", "leave-one-center-out AUC 中位数 0.72，范围 0.60–0.81；折不是独立重复。", "第 7 家医院 2023 年冻结验证 AUC=0.66、95% CI 0.59–0.73，校准斜率 0.70。", "若预设重校准后在 2024 年前瞻队列通过，才进入临床阈值试验。"],
      "把留中心法视为内部场景压力测试，以第 7 医院作外部验证", "检查站点与时间隔离、折内流程及区间估计单位", "不能把折间 SD 当独立外部 CI 或宣称部署就绪", "前瞻时间验证通过后才升级", ["decision","boundary"],
      [{labelCn:"六个折等于六次外部验证",whyWrongCn:"模型开发过程共享全部多中心数据和决策",whenMayHoldCn:"六模型与站点完全预先独立"},{labelCn:"AUC 尚可即可忽略校准斜率",whyWrongCn:"概率和阈值会系统偏离",whenMayHoldCn:"任务只做排序且无概率决策"}], "时间线区分场景压力测试、真正冻结验证和未来前瞻门槛。")
  },
  "roc-auc": {
    apply: role("case_table", "肺结节恶性诊断", "同队列开发与阈值选择", "CT 模型连续分数", "判断 AUC=0.82 后还能声称什么。",
      ["500 例中病例 150，全部数据用于训练模型。", "同一数据 AUC=0.82、bootstrap naive CI 0.78–0.86。", "以 Youden 最大选择阈值 0.37，灵敏度 0.81、特异度 0.70；未报告校准。", "若锁定模型和阈值后在独立连续患者验证 AUC、校准和净获益，才谈临床使用。"],
      "将 AUC 与阈值指标标为开发内乐观结果", "核对评价集角色、ties convention、CI、校准与阈值选择", "AUC 只能描述排序，不能证明概率准确或临床效用", "独立冻结验证通过时更新", ["decision","key_check","boundary","change_mind"],
      [{labelCn:"AUC>0.8 即临床可用",whyWrongCn:"不含校准和误判代价",whenMayHoldCn:"预设使用只需排序且外部验证"},{labelCn:"Youden 阈值天然最优",whyWrongCn:"不编码患病率与临床代价且同数据选择",whenMayHoldCn:"代价对称、目标匹配并独立验证"}], "病例表把数据角色、面积、阈值和下一证据门槛分开。"),
    remediation: role("evidence_matrix", "肝纤维化", "独立验证中同 AUC 双模型比较", "血液预测概率", "从同 AUC、不同校准中选择可修复模型。",
      ["独立队列 300 人、90 例；模型 A/B 的 AUC 均为 0.79。", "A 校准截距 0.03、斜率 0.96；B 截距 -0.80、斜率 0.58。", "20% 阈值下 A 净获益 0.08，B 为 -0.01，treat-all 为 0.03。", "若 B 经独立重校准后净获益超过 A，才改选 B。"],
      "当前选择校准和净获益更好的模型 A", "分别读取区分、校准和阈值效用", "同 AUC 不表示两个概率模型同等可用", "B 经隔离重校准与再验证后可更新", ["decision","key_check","boundary"],
      [{labelCn:"AUC 相同则随机任选",whyWrongCn:"校准与净获益明显不同",whenMayHoldCn:"只关心排序且其他指标相同"},{labelCn:"选择预测概率更极端的 B",whyWrongCn:"极端不等于准确，且 B 过拟合",whenMayHoldCn:"极端概率经校准和效用验证"}], "矩阵将相同排序与不同概率质量并列，训练方法比较。"),
    review: role("decision_timeline", "宫颈癌筛查", "独立人群诊断验证", "甲基化分数与活检结局", "case mix 改变时审核 AUC、校准和阈值。",
      ["冻结模型在转诊队列 AUC=0.88；社区独立队列病例率由 35% 降至 6%。", "社区 AUC=0.76，95% CI 0.69–0.83，ties 按 0.5 计。", "10% 阈值灵敏度 0.91、特异度 0.42，阳性预测值 0.09。", "若社区重校准后预设阈值净获益为正且资源负担可接受，才推荐筛查。"],
      "报告社区性能下降并暂停原阈值推荐", "核对独立评价、case mix、ties、CI、校准和混淆矩阵", "不能把转诊队列 AUC 外推为社区效用", "社区重校准和决策分析通过后更新", ["decision","boundary"],
      [{labelCn:"AUC 不受患病率影响所以可直接迁移",whyWrongCn:"case mix、谱偏倚和阈值预测值仍改变",whenMayHoldCn:"条件分布相同且只比较纯排序"},{labelCn:"灵敏度 0.91 足以推荐",whyWrongCn:"特异度、PPV 和资源代价很差",whenMayHoldCn:"漏诊代价压倒性且后续检查无害"}], "时间线体现开发场景、社区迁移、阈值后果和部署门槛。")
  },
  "time-dependent-auc": {
    apply: role("case_table", "心力衰竭", "生存预测外部验证", "风险分数、删失与 AUC(t)", "比较 1 年和 5 年估计的可用性。",
      ["外部队列 500 人；time zero 为出院日，模型和 1/5 年时点均预先冻结。", "1 年前 62 事件、41 删失、397 动态对照，IPCW AUC(1)=0.74，95% CI 0.68–0.80。", "5 年仍在险仅 38 人，AUC(5)=0.86，95% CI 0.61–0.98；5 年校准误差 18 个百分点。", "若扩展随访使 5 年风险集充分且校准改善，才把 5 年作为可靠结果。"],
      "以 1 年 AUC 为可解释主结果并将 5 年标为不稳定", "核对病例/对照定义、IPCW、风险人数和同时间校准", "AUC(t) 只衡量指定定义下排序，不等于绝对风险准确", "风险集和校准均改善时更新 5 年判断", ["decision","key_check","boundary","change_mind"],
      [{labelCn:"选择更高的 AUC(5)=0.86",whyWrongCn:"尾部风险集小、CI 宽且校准差",whenMayHoldCn:"时点预设且有充分风险人数和精度"},{labelCn:"删失者全部当非病例",whyWrongCn:"其 5 年状态未知，会偏倚比较",whenMayHoldCn:"删失发生在目标时点后"}], "病例表同步展示时点定义、删失校正、风险人数与校准。"),
    remediation: role("decision_timeline", "霍奇金淋巴瘤", "两年无进展预测时间线", "事件/删失个体轨迹", "修复把两年前删失者当动态对照。",
      ["目标为 cumulative/dynamic AUC(2 年)：两年前进展者是病例，活过两年无进展者是对照。", "P1 1.2 年进展；P2 1.5 年失访；P3 2.4 年进展；P4 3 年无事件。", "原分析把 P2 当对照；正确做法需 IPCW，P1 为病例、P3/P4 为 2 年对照。", "若完整随访证实 P2 活过 2 年无进展，才可直接归为对照。"],
      "移除对 P2 的确定性对照编码并使用预设 IPCW", "按冻结 AUC 定义逐人标记病例、对照和时点前删失", "不能简单 complete-case 并声称无删失偏倚", "补全 P2 两年状态后可更新其类别", ["decision","key_check","change_mind"],
      [{labelCn:"P2 未观察到进展就是对照",whyWrongCn:"失访后到两年状态未知",whenMayHoldCn:"确认两年仍无事件"},{labelCn:"删除 P2 不会影响 AUC",whyWrongCn:"删失可能与风险分数相关",whenMayHoldCn:"独立删失且使用合适权重或敏感性"}], "时间线直接编码动态病例、对照和未知状态，替代公式记忆。"),
    review: role("evidence_matrix", "肾移植", "冻结模型跨国验证", "移植物失功风险与 AUC(t)", "审核是否复用了同一时点定义和删失模型。",
      ["开发研究冻结 3 年 cumulative/dynamic AUC，time zero 为移植日。", "验证论文改用 5 年 incident/dynamic AUC=0.80，未说明这是不同 estimand。", "验证队列 3 年 AUC=0.70、95% CI 0.62–0.78；3 年在险 214 人，校准斜率 0.88。", "若按冻结 3 年定义和预设删失权重重复后达到门槛，才称复现。"],
      "要求按相同 3 年定义重算后再比较", "核对 time origin、预测时点、病例/对照定义与删失估计", "5 年 incident AUC 不能验证 3 年 cumulative 模型主张", "冻结定义下复算达标时更新", ["decision","boundary"],
      [{labelCn:"两者都叫 AUC(t) 可直接比较",whyWrongCn:"时点与病例对照 estimand 均不同",whenMayHoldCn:"定义、时点和删失方法完全一致"},{labelCn:"5 年 AUC 更高说明模型改善",whyWrongCn:"评价目标变化而模型未变",whenMayHoldCn:"同一 estimand 的配对比较"}], "矩阵按协议字段审查 paper-reading 中最易隐藏的定义漂移。")
  },
  pca: {
    apply: role("case_table", "多发性硬化", "病例对照脑脊液蛋白组 QC", "样本×蛋白矩阵、scores/loadings/metadata", "PC1 完全分组但 batch 与疾病重合，判断能否命名疾病轴。",
      ["S1–S6 的 PC1 scores=-3.1,-2.4,-1.8,1.7,2.5,3.0；PC1 解释 71%，PC2 解释 12%。", "S1–S3 均为 B1/control，S4–S6 均为 B2/case，疾病与批次完全重合。", "PC1 最大 loadings 为板温度 0.61、总离子强度 0.54、补体 C3 0.22；中心化但未按蛋白缩放。", "只有新增每批次同时含病例/对照的样本且冻结预处理后 PC1-疾病关联复现，才更新。"],
      "把 PC1 解释为不可分离的批次/疾病变异轴并停止机制命名", "联合读取 explained variance、scores、loadings、缩放和完整 metadata", "PCA 无监督且设计共线，不能证明离散亚型或疾病机制", "平衡新增样本在冻结流程复现时改变判断", ["decision","key_check","boundary","change_mind"],
      [{labelCn:"PC1 解释 71% 所以是主要疾病机制",whyWrongCn:"最大方差可来自技术批次且 loadings 支持技术来源",whenMayHoldCn:"平衡设计和外部扰动证据支持机制"},{labelCn:"PCA 不使用标签所以不受批次混杂",whyWrongCn:"无监督方法仍捕获最大技术方差",whenMayHoldCn:"批次贡献经设计和 loadings 排除"}], "病例表在同一视图中绑定 scores、方差、loadings 和 metadata，达到盲解 QC。"),
    remediation: role("evidence_matrix", "骨质疏松", "代谢组尺度敏感性分析", "四特征 PCA 数值表", "用缩放前后 loading 变化重建 PCA 含义。",
      ["四特征 SD=100,8,1.2,0.9，均已中心化但初始未缩放。", "未缩放 PC1 loadings=0.99,0.08,0.01,0.00，解释 96% 方差。", "z-score 后 PC1 loadings=0.52,0.50,0.49,0.49，解释 54% 方差；样本排序有 3/8 对调。", "若物理单位本就代表应保留的总方差，预注册未缩放分析才可作为主结果。"],
      "报告尺度选择驱动 PC1 并按科学问题冻结缩放", "核对各特征 SD、中心化参数、loadings 与 score 排序", "96% 不表示生物结构更强，只反映大尺度特征主导", "有预设物理量理由时可选择未缩放表示", ["decision","key_check","boundary"],
      [{labelCn:"解释方差更高的未缩放 PCA 必然更好",whyWrongCn:"方差比例受单位支配",whenMayHoldCn:"共同量纲且方差大小本身是目标"},{labelCn:"z-score 后 loadings 接近证明四特征同机制",whyWrongCn:"相似权重不是机制证据",whenMayHoldCn:"独立功能证据支持共同过程"}], "矩阵提供可手算的 SD、loading、variance 与 score 变化，修复只看散点图。"),
    review: role("decision_timeline", "卵巢癌", "跨平台冻结 PCA 投影验证", "平台 A/B 蛋白强度与投影参数", "判断缺特征和量纲改变时能否直接投影。",
      ["平台 A 以 100 特征训练并冻结中心、尺度、loadings；PC1 解释 43%。", "平台 B 缺 14 特征，22 个由 raw intensity 改为 log2，9 个值超出训练范围。", "当前分析用 B 自身均值填补并重新中心化后声称复现同一 PC1。", "若预先定义跨平台映射、用 A 参数投影且缺失敏感性中 score 相关>0.9，才称可比。"],
      "停止把 B 的重算轴称为 A 的冻结 PC1", "核对特征交集、变换、填补、训练中心尺度和超范围值", "最多称平台 B 内部存在一条新方差轴", "通过冻结映射和敏感性门槛后更新可运输性", ["decision","boundary"],
      [{labelCn:"PCA 轴编号相同即可比较 PC1",whyWrongCn:"不同输入和中心化会产生不同坐标轴",whenMayHoldCn:"同一冻结 loadings 与变换投影"},{labelCn:"只要 PC1 解释方差接近就复现",whyWrongCn:"相似比例不保证 loading 或 score 对应",whenMayHoldCn:"loadings、scores 与元数据关系均复制"}], "时间线明确训练冻结、平台漂移、错误重算和合法投影验证顺序。")
  },
  nmf: {
    apply: role("case_table", "胶质母细胞瘤", "bulk RNA-seq 程序发现", "非负表达矩阵与 NMF 共识", "rank=4 结局最显著但稳定性差，选择可辩护 rank。",
      ["150 个肿瘤测试 rank 2–6，每个 rank 100 次初始化。", "rank 3 cophenetic=0.93、重构误差 0.18；rank 4=0.61、0.15。", "rank 4 生存 log-rank P=0.004，rank 3 P=0.12；该结局未参与预注册 rank 标准。", "外部队列若按冻结 rank3 basis 投影且程序相关>0.8，才称程序复现。"],
      "按稳定性与重构折中选择 rank 3，并把程序视为连续表示", "核对非负输入、初始化、共识、误差及结局是否参与选择", "不能按最小结局 P 选择 rank 或称机制亚型", "冻结 basis 在外部可投影复现时升级", ["decision","key_check","boundary","change_mind"],
      [{labelCn:"rank4 与生存最显著所以最佳",whyWrongCn:"用结局事后选秩且共识不稳",whenMayHoldCn:"结局标准预注册并独立验证"},{labelCn:"误差最低的最高 rank 总是更好",whyWrongCn:"复杂度增加会机械降低误差",whenMayHoldCn:"有惩罚和外部重构目标"}], "病例表同时给候选秩的稳定性、误差、结局诱惑与外部分配门槛。"),
    remediation: role("evidence_matrix", "银屑病", "皮肤转录组多初始化审计", "NMF basis、系数与共识矩阵", "修复单次初始化被当作稳定程序。",
      ["90 个样本、rank=3，原论文只运行 seed=7 一次。", "seed=7 的重构误差 0.12；50 个 seeds 误差 0.11–0.16。", "50 次中仅 28 次得到相同分配，共识轮廓均值 0.49；程序 2 loading 基因重叠 Jaccard=0.35。", "若增加初始化并得到共识轮廓>0.8、basis 稳定，才冻结程序。"],
      "采用多初始化共识并暂停固定标签", "检查误差分布、分配共识与 basis 重现", "单个低误差解最多是候选分解", "稳定性达预设门槛后冻结", ["decision","key_check","change_mind"],
      [{labelCn:"固定 seed 可保证可重复",whyWrongCn:"重复同一局部最优不代表解稳定",whenMayHoldCn:"全局解唯一且多 seed 已证实"},{labelCn:"误差差异小所以标签稳定",whyWrongCn:"相似重构可对应不同分解",whenMayHoldCn:"basis 与样本分配也高度一致"}], "矩阵从单解转到 seeds 分布、共识和升级门槛。"),
    review: role("decision_timeline", "急性淋巴细胞白血病", "独立队列冻结程序投影", "蛋白组 NMF coefficient", "外部只复现连续 program，更新离散 subtype 主张。",
      ["开发队列 120 人的 rank4 标签 silhouette=0.52，basis 已冻结。", "独立队列 200 人投影系数呈连续梯度，silhouette=0.11。", "最高系数标签一致率 58%，但四个 coefficient 与对应开发程序相关均为 0.72–0.84。", "若第三队列出现清晰共识块且冻结分配一致率>85%，才恢复离散 subtype。"],
      "保留连续 program 复现并撤回四离散亚型", "区分 basis/program 保存与硬标签保存", "连续投影相关不能证明离散类别存在", "第三队列达到冻结离散门槛才更新", ["decision","boundary"],
      [{labelCn:"四个程序存在就等于四亚型",whyWrongCn:"样本可混合多个程序且呈连续谱",whenMayHoldCn:"系数形成稳定互斥块"},{labelCn:"58% 高于随机所以亚型已复现",whyWrongCn:"未达预设一致性且 silhouette 极低",whenMayHoldCn:"统计门槛预设并外部精确达到"}], "时间线从冻结 basis 到连续复制、离散失败和未来恢复条件。")
  },
  clustering: {
    apply: role("case_table","结直肠癌","多中心肿瘤蛋白组探索","样本距离、热图与共识矩阵","三簇热图受批次主导，决定能否报告亚型。",["96 个肿瘤来自三批次；batch 与簇的 Cramér V=0.82。","k=3 silhouette=0.41，但 500 次患者重采样簇一致率仅 57%。","z-score 后 k=3 变为 k=2 连续梯度；结局差异最显著的是事后选择的 k=4。","若冻结缩放、距离和分配器在平衡外部队列一致率>80%，才称可重复分类。"],"报告探索性连续结构并撤回稳定三亚型","比较缩放、距离、替代算法、批次和重采样共识","热图分块不能证明离散生物亚型","冻结分配器外部稳定时更新",["decision","key_check","boundary","change_mind"],[{labelCn:"挑生存 P 最小的 k=4",whyWrongCn:"用结局调簇数夸大关联",whenMayHoldCn:"k 和结局检验预注册且外部验证"},{labelCn:"silhouette>0 即三簇成立",whyWrongCn:"0.41 较弱且重采样、批次诊断失败",whenMayHoldCn:"多指标和外部稳定性均达门槛"}],"病例表并列热图诱惑、稳定性、批次与外部规则。"),
    remediation: role("evidence_matrix","帕金森病","脑脊液代谢组表征比较","原始尺度、z-score 与软分配","把强制 k-means 标签改为连续轴。",["70 人在原始尺度 k=2，一种高方差脂质贡献距离的 78%。","z-score 后 24/70 人换簇，silhouette 从 0.36 降至 0.18。","PC1 连续解释 46% 方差，共识矩阵无清晰块，软成员概率多数为 0.4–0.6。","若新样本出现稳定双峰且替代距离一致，才恢复硬标签。"],"以连续轴和软成员概率替代硬簇","审查尺度贡献、成员不确定性和共识块","当前最多描述连续异质性","外部稳定双峰出现时更新",["decision","key_check","boundary"],[{labelCn:"原始尺度 silhouette 更高应保留",whyWrongCn:"由单个量纲特征机械主导",whenMayHoldCn:"该物理方差预先定义为目标"},{labelCn:"k-means 必须给每人一个亚型",whyWrongCn:"算法输出不等于真实离散结构",whenMayHoldCn:"外部边界清晰且可分配"}],"矩阵将尺度敏感、连续轴与软不确定性换成不同表征。"),
    review: role("decision_timeline","子宫内膜癌","独立转录组分类验证","冻结 centroid 与新样本距离","审核新队列是否真正验证聚类。",["开发队列冻结 3 个 centroid、5000 基因和相关距离。","独立队列换平台后只测到 4200 基因，作者在新数据重新聚类并重命名三簇。","按共同基因冻结 centroid 分配一致率 63%，其中 38% 样本最大相关<0.2。","若跨平台映射预设且拒判规则后高置信一致率>85%，才称分类复现。"],"拒绝把重新聚类命名视为外部验证","核对冻结特征、距离、分配器与拒判率","最多称新队列内部也可被分成三组","冻结分配达到门槛后更新",["decision","boundary"],[{labelCn:"簇数都为三说明复现",whyWrongCn:"标签和边界可完全不同",whenMayHoldCn:"冻结分配逐样本高度一致"},{labelCn:"删除低相关样本即可提高一致率",whyWrongCn:"事后删除隐藏不可分配性",whenMayHoldCn:"拒判阈值预先冻结"}],"时间线区分开发冻结、错误重聚类、真实分配与合格门槛。")
  },
  gsea: {
    apply: role("case_table","系统性红斑狼疮","8 供体单细胞病例对照","供体级排名与版本化基因集","大量细胞下选择可交换单位和完整排名。",["病例/对照各 4 位供体，每位 900–4000 个单核细胞。","逐细胞 Wald 排名给 IFN NES=2.6、FDR<0.001；供体 pseudobulk 排名给 NES=1.7、FDR=0.08。","预设 MSigDB v2025.1 IFN 集 180 基因，leading edge 31 个；置换必须保持供体标签。","若增加独立供体后供体级 NES 同向且 FDR<0.05，才升级富集证据。"],"以供体级有方向全排名和供体置换为主","核对排名统计量、可交换单位、基因集版本与 leading edge","最多称 IFN 表达程序候选，不能称通路已激活","独立供体复现后更新",["decision","key_check","boundary","change_mind"],[{labelCn:"细胞数多所以逐细胞置换更有力",whyWrongCn:"生物复制是供体而非细胞",whenMayHoldCn:"细胞为独立实验单位"},{labelCn:"只取显著 DEG 再做 GSEA",whyWrongCn:"GSEA 需要完整有方向排名",whenMayHoldCn:"另做明确的过度表示分析"}],"病例表把 donors/cells/NES/FDR/leading edge 的数据角色写全。"),
    remediation: role("evidence_matrix","非小细胞肺癌","配对治疗前后 bulk RNA-seq","阈值 DEG 列表与全基因排名","修复把 43 个 DEG 列表冒充 GSEA 输入。",["20 位患者配对前后取样，原始 16000 基因。","错误流程保留 P<0.05 的 43 基因且丢失方向，报告 DNA repair 富集 P=0.01。","配对模型 t 统计量全排名后 DNA repair NES=-1.5、FDR=0.17，leading edge 22 基因。","若冻结排名规则在独立配对队列 FDR<0.05，才称程序下调证据。"],"改用配对模型的完整有方向排名","核对配对设计、背景、方向和 FDR","当前不能称 DNA repair 显著下调","独立冻结复现时更新",["decision","key_check","change_mind"],[{labelCn:"43 个显著基因足够运行 GSEA",whyWrongCn:"阈值化破坏 running-sum 排名定义",whenMayHoldCn:"明确改做 ORA 且使用正确背景"},{labelCn:"名义 P=0.01 比 FDR 更应优先",whyWrongCn:"忽略基因集家族多重性",whenMayHoldCn:"唯一预注册基因集"}],"矩阵对照错误阈值列表与正确配对全排名。"),
    review: role("decision_timeline","克罗恩病","独立黏膜转录组验证","冻结排名、基因集与富集结果","审查方向、数据库版本和冗余。",["开发队列用 Hallmark v2025.1、供体级效应排名，TNF NES=1.9、FDR=0.03。","验证队列改用 KEGG 2023、按 P 值无方向排名，报告三个同义炎症集合。","按冻结 Hallmark 与 signed statistic 重算 TNF NES=1.2、FDR=0.22。","若第三队列按同版本规则复现 NES>1.5、FDR<0.05，才确认。"],"以冻结规则重算结果判为未复现","核对版本、方向、排名和冗余集合","不能用不同数据库的名词重叠冒充验证","第三队列同规则达标时更新",["decision","boundary"],[{labelCn:"都出现炎症词就算复现",whyWrongCn:"集合、方向和零模型不同",whenMayHoldCn:"预先建立集合映射且效应方向一致"},{labelCn:"多个同义集合是独立支持",whyWrongCn:"共享大量基因而证据相关",whenMayHoldCn:"去冗余后仍有独立 leading edges"}],"时间线追踪协议冻结到不兼容分析再到合法复现。")
  },
  "gsva-ssgsea": {
    apply: role("case_table","黑色素瘤","两队列免疫治疗转录组","GSVA/ssGSEA 样本分数","判断不同算法原始分数能否直接合并。",["队列 A 40 供体用 GSVA 1.50、log2 TPM；队列 B 55 供体用 ssGSEA、raw counts。","IFN 分数 A 范围 -0.6–0.8，B 为 1200–6400，数值不在同一量尺。","各队列内应答差 A=0.31、95% CI 0.08–0.54；B 标准化差=0.22、-0.05–0.49。","若冻结同一实现/输入并批次内标准化后方向复现，才合并效应而非原始分数。"],"停止拼接原始分数，统一实现或做队列内效应 meta 分析","核对算法、版本、输入尺度、归一化和独立供体","分数只能表示算法定义的相对表达程序，不能称直接活性","统一冻结流程复现后更新",["decision","key_check","boundary","change_mind"],[{labelCn:"都叫 enrichment score 可直接合并",whyWrongCn:"算法和量尺不同",whenMayHoldCn:"同一冻结实现与归一化"},{labelCn:"高分证明 IFN 通路活化",whyWrongCn:"表达代理不等于功能活性",whenMayHoldCn:"磷酸化和扰动功能证据一致"}],"病例表给算法版本、供体、效应/CI 与量尺角色。"),
    remediation: role("evidence_matrix","溃疡性结肠炎","单细胞逐细胞 program 比较","细胞 ssGSEA 与供体汇总","修复 30000 个细胞的伪重复。",["病例/对照各 6 位供体、每人 1000–4000 个 T 细胞。","逐细胞模型差=0.42、P<10^-30；供体中位数差=0.19、95% CI -0.07–0.45。","病例记忆 T 比例 62%、对照 31%，该亚群本身分数更高。","若细胞类型内供体级差异在更多供体复现且 CI 排除 0，才升级。"],"改为细胞类型内供体汇总/混合模型","检查供体复制和组成差异","当前最多是组成伴随的探索信号","独立供体内复现时更新",["decision","key_check","boundary"],[{labelCn:"P 极小证明稳定",whyWrongCn:"细胞行数夸大独立信息",whenMayHoldCn:"推断单位确为独立细胞"},{labelCn:"合并所有 T 细胞可增加功效",whyWrongCn:"组成变化混入 program 差异",whenMayHoldCn:"组成一致或模型明确调整"}],"矩阵从细胞显著性转为 donors/cells/组成/CI 的不同证据。"),
    review: role("decision_timeline","多发性骨髓瘤","冻结队列的蛋白组 program 验证","样本级 GSVA 与批次元数据","审核实现冻结后仍可能的队列组成影响。",["开发队列 80 人冻结 GSVA 版本、Gaussian kernel 与基因集 v3。","验证队列 100 人按同流程，但所有病例在 B2、对照在 B1。","program 差=0.44、95% CI 0.20–0.68；批次调整因完全共线不可估。","若新增批次内平衡样本仍同向，才称疾病 program 复现。"],"将结果标为疾病-批次不可分离","核对冻结实现之外的设计矩阵和批次平衡","不能因算法一致就归因疾病","平衡增样后更新",["decision","boundary"],[{labelCn:"同一 GSVA 版本消除批次",whyWrongCn:"实现冻结不校正设计共线",whenMayHoldCn:"批次平衡且预处理有效"},{labelCn:"CI 排除 0 即复现",whyWrongCn:"精确估计的是混合效应",whenMayHoldCn:"疾病效应可识别"}],"时间线显示冻结实现、验证设计失败和可恢复条件。")
  },
  wgcna: {
    apply: role("case_table","心肌病","心肌 bulk RNA 共表达网络","模块 eigengene、批次和细胞比例","模块同时关联结局和批次时决定主张。",["100 位患者；turquoise 模块 210 基因，eigengene 与射血分数 r=-0.48、FDR=0.02。","同一 eigengene 与测序批次 r=0.62、与成纤维细胞比例 r=0.57。","去除批次与组成后部分 r=-0.16、95% CI -0.35–0.04；模块保存 Zsummary=3.1。","若平衡外部队列 preservation>10 且调整关联复现，才升级疾病模块。"],"把模块降级为批次/组成敏感候选","核对样本 QC、软阈值、eigengene、组成和保存性","网络边和 hub 不能写成调控或因果靶点","外部保存及调整关联均通过后更新",["decision","key_check","boundary","change_mind"],[{labelCn:"FDR=0.02 证明疾病模块",whyWrongCn:"关联被批次/组成解释且保存弱",whenMayHoldCn:"调整和外部保存均成立"},{labelCn:"最高 connectivity 基因是上游因果基因",whyWrongCn:"共表达中心性无方向识别",whenMayHoldCn:"遗传/扰动证据验证因果"}],"病例表把模块效应、混杂、调整 CI 与 preservation 数字连成审核链。"),
    remediation: role("evidence_matrix","哮喘","鼻上皮网络参数审计","相关矩阵与模块保存","修复按性状 P 值调软阈值。",["60 个样本测试 power 2–18 和 mergeCut 0.1–0.5。","作者选择使模块-哮喘 P 最小的 power=14，r=0.52、P<0.001。","在 200 次样本重采样中该模块仅出现 43%，median preservation=2.0。","若参数只按网络诊断预设且独立网络 preservation>10，才冻结模块。"],"先独立于性状选择网络参数再关联","审查参数搜索、重采样出现率与保存统计","当前最小 P 模块仅属探索","预设参数外部保存后更新",["decision","key_check","change_mind"],[{labelCn:"scale-free fit 最高且 P 最小即最佳",whyWrongCn:"同时按性状选择造成过拟合",whenMayHoldCn:"参数标准完全预注册"},{labelCn:"模块出现 43% 仍可命名",whyWrongCn:"多数扰动中结构消失",whenMayHoldCn:"仅作不稳定候选且明确标注"}],"矩阵分离网络构建标准与事后性状诱导。"),
    review: role("decision_timeline","肾透明细胞癌","独立蛋白组模块保存验证","冻结模块成员与 eigengene","新队列应测 preservation 而非重命名。",["开发 RNA 队列冻结 8 模块及 eigengene loading。","验证蛋白组仅覆盖其中 65% 特征，作者重新建网得到颜色同名模块。","按可测成员计算 preservation Z=4.2，eigengene-分期 r=0.10、95% CI -0.12–0.31。","若同模态独立队列 Z>10 且性状关联复现，才确认。"],"判定原模块未充分保存且性状未复现","核对冻结成员、覆盖率、preservation 与关联 CI","颜色同名的新模块不是原模块验证","同模态冻结保存通过后更新",["decision","boundary"],[{labelCn:"颜色名称相同即模块相同",whyWrongCn:"颜色是任意标签",whenMayHoldCn:"成员映射和保存统计均一致"},{labelCn:"Z>2 就可称强保存",whyWrongCn:"4.2 仅中弱证据且关联不复现",whenMayHoldCn:"预设较低探索门槛"}],"时间线从冻结定义到跨模态缺口、定量保存与未来确认。")
  },
  pseudobulk: {
    apply: role("case_table","类风湿关节炎","8 供体配对治疗前后 scRNA-seq","单核细胞原始 counts 与 donor/time 标签","把逐细胞矩阵改成保留配对的 pseudobulk。",["8 位供体各有治疗前后样本，每样本单核细胞 300–1800 个，共 17600 个细胞。","逐细胞模型 GeneA logFC=-0.70、CI -0.78–-0.62；donor×time 聚合配对模型 logFC=-0.52、95% CI -0.91–-0.13。","预设 6000 基因检验族，GeneA FDR=0.04；两个样本仅 300/340 细胞但 counts 通过过滤。","若去除低覆盖样本后供体效应反向或 FDR>0.05，降级为不稳候选。"],"按 donor×time×cell type 聚合并拟合 donor 配对 contrast","核对 donors/cells、聚合键、原始计数、配对矩阵和 FDR","最多支持单核细胞供体层表达差异，不能把细胞数当 n","低覆盖敏感性反向时更新",["decision","key_check","boundary","change_mind"],[{labelCn:"17600 个细胞提供 17600 个重复",whyWrongCn:"治疗分配与复制在 8 位供体",whenMayHoldCn:"每细胞独立随机处理"},{labelCn:"每供体合成一个向量即可",whyWrongCn:"会抹掉配对时间条件",whenMayHoldCn:"每供体只有一个条件"}],"病例表完整给 donors/cells/effect/CI/FDR/低覆盖角色。"),
    remediation: role("evidence_matrix","银屑病","多时间点皮肤 scRNA-seq","donor×time×cell type 聚合键","修复聚合时抹掉时间条件。",["6 位供体在 0/2/8 周取样，每次有角质细胞 500–2500 个。","错误做法按 donor×cell type 合成 6 列，治疗前后 counts 混在一起。","正确 18 列配对模型给 KRT16 周8-周0 logFC=-1.1、95% CI -1.8–-0.4、FDR=0.02。","若问题改为跨时间总体平均且权重预设，才可先汇总时间。"],"重建 donor×time×cell type 的最小样本列","核对样本键与 donor 内重复结构","不能从 6 个混合列估计时间效应","estimand 改为时间平均时再改变聚合",["decision","key_check","change_mind"],[{labelCn:"聚合越彻底越能避免伪重复",whyWrongCn:"过度聚合会删除目标对比",whenMayHoldCn:"被合并维度不属于 estimand"},{labelCn:"把 18 列当独立样本",whyWrongCn:"同供体三次重复相关",whenMayHoldCn:"每列来自不同供体"}],"矩阵用错误 6 列与正确 18 列直接重建聚合键。"),
    review: role("decision_timeline","肝纤维化","同供体多组织病例对照 scRNA","肝/血单细胞 pseudobulk counts","审核多组织是否保留 donor 重复。",["病例/对照各 10 位供体，每人肝和血各一份样本。","按 tissue×group 分析但将 40 列独立，GeneB 交互 logFC=0.8、SE=0.18。","加入 donor 随机效应后交互=0.74、95% CI 0.05–1.43，6000 基因 FDR=0.18。","若交互是唯一预注册基因且独立队列同向，才升级。"],"保留组织样本并建模 donor 内相关，不宣称 FDR 显著","核对组织×条件键、donor 结构和检验族","最多称组织交互探索信号","预注册独立复现后更新",["decision","boundary"],[{labelCn:"同一供体两组织就是两个独立复制",whyWrongCn:"共享遗传与临床背景",whenMayHoldCn:"目标单位确为独立组织且相关为零"},{labelCn:"CI 排除 0 所以忽略 FDR",whyWrongCn:"高维家族仍需多重校正",whenMayHoldCn:"唯一预注册终点"}],"时间线区分采样列、相关模型、高维家族和确认条件。")
  },
  "differential-abundance": {
    apply: role("case_table","多发性硬化","12 供体脑脊液病例对照 scRNA","供体级细胞群 counts 与总捕获量","捕获总数不同下比较细胞群丰度。",["病例/对照各 6 供体，每人捕获细胞 800–5200，病例总数系统更高。","B 细胞每供体比例病例 8%–19%、对照 4%–12；合并细胞比例为 16% vs 6%。","供体级 beta-binomial 模型 log-odds=0.72、95% CI 0.10–1.34，50 群 FDR=0.09。","若预设 B 细胞为唯一终点或更大供体队列 FDR<0.05，才升级。"],"以供体级 count/compositional 模型报告探索性丰度效应","核对 donors/cells、分母、捕获深度、协变量和检验族","不能用合并比例或细胞行数证明疾病增殖机制","预设或外部 FDR 通过后更新",["decision","key_check","boundary","change_mind"],[{labelCn:"合并所有细胞做卡方检验",whyWrongCn:"忽略供体复制和捕获差异",whenMayHoldCn:"细胞为独立抽样单位且无供体层目标"},{labelCn:"比例升高证明 B 细胞增殖",whyWrongCn:"组成变化也可由其他群减少产生",whenMayHoldCn:"绝对计数和增殖实验支持"}],"病例表提供 donors/cells/effect/CI/FDR 与分母角色。"),
    remediation: role("evidence_matrix","COVID-19","住院样本免疫细胞计数","样本层 count、offset 与组成参照","把逐细胞二项检验改为样本层模型。",["重症/轻症各 8 位患者，共 42000 个细胞。","逐细胞检验单核细胞 OR=2.8、P<10^-100；患者比例范围两组高度重叠。","样本层负二项模型含 log(total cells) offset，效应=0.31、95% CI -0.22–0.84。","若流式绝对计数显示每 μL 同向增加且独立供体复现，才支持绝对扩增。"],"用患者层计数与明确 offset/组成参照重估","检查患者比例图、采样深度和独立单位","当前不能称单核细胞绝对扩增","绝对计数复现后更新",["decision","key_check","boundary"],[{labelCn:"极小 P 足以克服供体少",whyWrongCn:"细胞伪重复制造精度",whenMayHoldCn:"独立随机单位确为细胞"},{labelCn:"offset 后系数不显著证明无差异",whyWrongCn:"区间仍含有意义方向且样本小",whenMayHoldCn:"等效界值预设且区间在界内"}],"矩阵从逐细胞假精度转换到样本 effect/CI 与绝对计数门槛。"),
    review: role("decision_timeline","胰腺癌","多中心肿瘤邻域 DA","图邻域 counts 与供体设计","连续状态邻域仍需供体层检验和组成敏感性。",["两个中心各 10 位供体；构建 120 个重叠邻域。","邻域 N37 供体级 logFC=0.9、95% CI 0.3–1.5、空间 FDR=0.04。","N37 与髓系总比例 r=0.76；加入髓系分母后 logFC=0.25、CI -0.20–0.70。","若绝对计数或替代组成参照下效应稳定，才称特定状态富集。"],"将 N37 降级为髓系组成敏感候选","核对邻域重叠、多重性、供体与分母敏感性","不能把邻域 DA 写成细胞转化机制","绝对/替代参照稳健时更新",["decision","boundary"],[{labelCn:"空间 FDR 已处理所有偏倚",whyWrongCn:"多重校正不处理组成共同变化",whenMayHoldCn:"分母敏感性已通过"},{labelCn:"邻域连续就可按细胞独立",whyWrongCn:"条件比较仍复制于供体",whenMayHoldCn:"实验处理在独立细胞层随机"}],"时间线从邻域发现、组成解释到稳健性升级。")
  },
  "trajectory-pseudotime": {
    apply: role("case_table","骨髓纤维化","6 供体单时点 scRNA 轨迹探索","细胞 embedding、root 与 donor metadata","轨迹由一个供体驱动且根无外部依据。",["6 位供体共 12000 个细胞，末端分支的 78% 来自 D6。","以 cluster A 为根时 A→B→C；以 cluster C 为根方向完全反转。","两种算法细胞顺序 Spearman ρ=0.34；无真实时间或谱系标签。","若多供体一致且 lineage tracing/真实时间支持同一方向，才升级转化主张。"],"仅报告供体敏感的状态排列假设","检查 root、表征、算法、donor 贡献和方向依据","伪时间不是实际时钟，不能证明分化谱系","独立方向证据和供体复现后更新",["decision","key_check","boundary","change_mind"],[{labelCn:"UMAP 箭头连续所以已证明分化",whyWrongCn:"箭头来自根假设和快照相似性",whenMayHoldCn:"谱系追踪与时间实验一致"},{labelCn:"12000 个细胞提供巨大复制",whyWrongCn:"末端主要由一个供体驱动",whenMayHoldCn:"每细胞独立随机实验"}],"病例表写清 cells/donors/root/算法相关与外部方向证据。"),
    remediation: role("evidence_matrix","创伤愈合","空间转录组状态轨迹敏感性","root×embedding×算法结果","更换根与表征后记录分支稳定性。",["8 位患者各一个切片；默认 root R1 得两分支。","换 root R2 后 46% spot 顺序反转；PCA 与 scVI 表征分支一致率 58%。","患者级分支出现率分别为 2/8 和 7/8，原图只展示后者。","若预设 root 且 8/8 患者和替代算法一致，才冻结分支。"],"展示全部 root/表征敏感性并保留稳定分支为候选","核对患者级而非 spot 级重现","不能只留最好看的轨迹图","预设配置跨患者稳定时更新",["decision","key_check","change_mind"],[{labelCn:"选择与组织图最像的 root",whyWrongCn:"事后视觉选择会确认预期",whenMayHoldCn:"root 有独立标记物预先指定"},{labelCn:"7/8 分支足以忽略另一分支",whyWrongCn:"原报告选择性隐藏配置",whenMayHoldCn:"配置预注册且其余为敏感性"}],"矩阵枚举 root、表征、算法和患者重现，阻止挑图。"),
    review: role("decision_timeline","肠上皮损伤","动物空间+谱系验证","空间状态、真实时间与 lineage barcode","区分状态排列与真实转化证据。",["apply 研究只用人类单时点 scRNA 推断 A→B→C。","新小鼠实验在 0/24/72 小时采样，状态均值按 A→B→C 移动。","lineage barcode 显示仅 38% A 克隆在 C 中出现，95% CI 24%–53%；无功能阻断。","若独立谱系实验显示多数 A 克隆进入 C 且阻断 A→B 改变 C，才称路径机制。"],"把证据升级为部分支持方向但非确定谱系机制","核对跨物种、真实时间、barcode 比例和功能证据","最多主张可检验的 A→B→C 路径候选","多数克隆与功能阻断一致时更新",["decision","boundary"],[{labelCn:"时间顺序一致即证明单细胞转化",whyWrongCn:"群体均值变化不追踪同一细胞",whenMayHoldCn:"谱系追踪显示单克隆连续过渡"},{labelCn:"38% 已证明所有 A 都进入 C",whyWrongCn:"比例和区间远低于全体",whenMayHoldCn:"目标主张仅是部分克隆贡献"}],"时间线递进快照、真实时间、谱系比例与功能门槛。")
  },
  "cellchat-communication": {
    apply: role("case_table","肝细胞癌","治疗前后配对肿瘤 scRNA","配体受体表达、供体与细胞组成","网络更密但髓系比例更高，排序候选边。",["10 位供体配对前后，共 54000 个细胞；治疗后髓系比例从 18% 升至 41%。","CellChat 边数从 82 到 145；巨噬→T 的 CXCL9-CXCR3 供体级差=0.38、95% CI 0.05–0.71。","组成匹配下差降至 0.12、95% CI -0.09–0.33；数据库为 CellChatDB 2025.1。","若空间邻近复现且阻断 CXCL9 改变 T 迁移，才升级实际通信机制。"],"把 CXCL9-CXCR3 作为组成敏感候选边排序验证","核对 donors/cells、数据库、供体配对和组成敏感性","表达边最多是通信潜力，不能证明信号发生","空间和功能阻断一致时更新",["decision","key_check","boundary","change_mind"],[{labelCn:"网络边数增加证明通信增强",whyWrongCn:"细胞比例增加可机械产生更多边",whenMayHoldCn:"组成控制且空间/功能验证"},{labelCn:"逐细胞 P 值可证明患者一致",whyWrongCn:"复制在 10 位供体",whenMayHoldCn:"细胞为独立干预单位"}],"病例表提供 donors/cells/effect/CI/组成/验证阶梯。"),
    remediation: role("evidence_matrix","肺纤维化","供体层通信重现分析","逐细胞分数与供体汇总","把逐细胞显著边改为供体重现和组成敏感性。",["病例/对照各 5 供体，成纤维细胞数相差 8 倍。","逐细胞 TGFβ 边 P<10^-80；供体中位差=0.20、95% CI -0.18–0.58。","按每供体等量抽样后 3/5 病例方向为正，数据库命中不含蛋白证据。","若更多供体 80% 同向且空间蛋白共定位，才升级候选支持。"],"以供体效应和等量抽样报告不确定候选","核对供体方向、组成、表达阈值与数据库证据层级","当前不能称 TGFβ 信号已增强","供体重现及空间蛋白支持后更新",["decision","key_check","boundary"],[{labelCn:"P 极小足以确认",whyWrongCn:"细胞伪重复与组成差异主导",whenMayHoldCn:"供体层模型也精确显著"},{labelCn:"数据库有配体受体对就是机制",whyWrongCn:"知识库命中不证明本组织实际作用",whenMayHoldCn:"空间和功能扰动验证"}],"矩阵从假精度切换为供体方向、组成与证据阶梯。"),
    review: role("decision_timeline","克罗恩病","独立肠组织空间验证","空间共定位与功能实验状态","空间共定位但无功能实验时限定主张。",["原 scRNA 队列预测上皮 IL33→肥大细胞 IL1RL1。","独立 14 供体空间数据中 10/14 显示两类细胞 30 μm 内富集，置换 FDR=0.03。","配体/受体蛋白共现差=0.27、95% CI 0.04–0.50，但没有阻断或下游磷酸化。","若受体阻断降低预设下游反应且救援恢复，才称功能通信。"],"将独立空间/蛋白结果称为候选边的支持而非机制证明","核对站点独立、供体重现、距离定义与功能层级","最多主张空间相容的表达通信候选","阻断与救援满足时更新",["decision","boundary"],[{labelCn:"空间靠近即证明信号传递",whyWrongCn:"邻近不证明配体产生功能效应",whenMayHoldCn:"下游响应与阻断救援均成立"},{labelCn:"10/14 供体意味着普遍机制",whyWrongCn:"仍有异质性且无功能因果证据",whenMayHoldCn:"主张仅限多数供体共定位"}],"时间线按 RNA 候选、空间、蛋白与功能阻断逐级提升证据。")
  }
};
