import type {
  LearningBlockV1,
  LearningUnitV1,
  PracticeAssetV1,
  PracticeAssetBindingV1,
  PrerequisiteEdgeV1,
} from "../domain/learningKernel";
import { learningUnitHash, practiceAssetHash } from "../domain/learningKernel";

const block = (
  id: string,
  kind: LearningBlockV1["kind"],
  layer: LearningBlockV1["layer"],
  titleCn: string,
  bodyCn: string,
  required = true,
  terms?: LearningBlockV1["terms"],
): LearningBlockV1 => ({ id, kind, layer, titleCn, bodyCn, required, terms, evidenceClaimIds: [] });

const unitSpecs: Array<Omit<LearningUnitV1, "contentHash" | "practiceBindingIds"> & { practiceBindingIds?: string[] }> = [
  {
    schemaVersion: 1,
    id: "lu-statistical-unit-v1",
    revision: 1,
    titleCn: "什么才算 n：统计单位",
    titleEn: "What Counts as n: Statistical Unit",
    domain: "statistics",
    estimatedMinutes: 10,
    curriculumOrder: 1,
    projectRelevanceTerms: ["统计", "单细胞", "病理", "空间", "患者", "小鼠", "样本量"],
    learningObjectives: ["区分观察、实验与统计单位", "根据研究问题和设计说明 n 所在层级", "识别嵌套测量中的相关性与结论边界"],
    blocks: [
      block("su-why", "why_important", "understand", "为什么这会改变结论", "3 位患者各测了数千个细胞。数据表有上万行，但患者组间结论并没有上万个彼此独立的患者。若把行数直接当 n，精度会被夸大。"),
      block("su-intuition", "intuition", "understand", "一句话直觉", "n 不是表里有多少行，而是研究设计提供了多少个能独立变化、支持当前目标推断的单位。"),
      block("su-definition", "precise_definition", "explain", "三个单位不要混在一起", "观察或测量单位是被记录的对象；实验单位是被独立分配干预的最小单位；统计或推断单位是不确定性与目标结论所对应的层级。它们可能相同，也可能不同。", true, [
        { zh: "观察单位", en: "observation unit", definitionCn: "数据中被观察或测量的对象。" },
        { zh: "实验单位", en: "experimental unit", definitionCn: "可被独立分配干预的最小单位。" },
        { zh: "统计单位", en: "statistical unit", definitionCn: "模型不确定性和目标推断所对应的单位层级。" },
      ]),
      block("su-mechanism", "mechanism", "explain", "为什么很多测量不等于很多独立信息", "患者 → 样本 → 细胞或视野是嵌套结构。同一患者内的测量共享遗传背景、疾病状态和处理过程，因此通常相关。增加细胞可提高患者内测量精度，却不能自动增加患者间独立重复。"),
      block("su-worked", "worked_example", "explain", "专家怎样一步步判断", "例：每组 3 位患者，每人 2,000 个细胞。先问目标是否为患者组间差异；再画出患者到细胞的层级；确认组别在患者层变化；最后报告患者层 n，并用聚合或层级模型处理患者内相关。不能把 12,000 个细胞写成 12,000 个患者层独立重复。"),
      block("su-misconception", "misconception", "explain", "为什么“细胞越多，n 越大”听起来合理", "更多细胞确实能让每位患者的平均测量更稳定，所以这个说法有一半直觉是对的；错误在于把患者内测量精度与患者间独立信息量混为一谈。"),
      block("su-selfcheck", "self_check", "judge", "先做一个低压力自检", "看到很多行时，先不要数行。依次问：研究问题指向谁？干预或分组在哪一层变化？哪些测量共享同一上层来源？"),
      block("su-boundary", "claim_boundary", "judge", "结论边界", "不能机械地说统计单位永远是患者。单位取决于研究问题、抽样或分配机制和 estimand；若目标位于其他层级，统计单位也可不同，但依赖结构仍必须得到与设计一致的处理。"),
      block("su-reviewer", "reviewer_view", "judge", "Reviewer 会追问什么", "作者应明确每层样本数、独立采样或分配单位、重复测量结构、相关性如何建模，以及最终结论指向哪一总体。"),
    ],
    prerequisiteEdgeIds: [],
    delayedReviewPlan: [{ afterDays: 3, role: "review" }, { afterDays: 14, role: "far_transfer" }],
    evidenceSourceIds: ["src-pseudorep", "src-pseudobulk"],
    contentOrigin: "verified_seed",
    verificationStatus: "verified",
    scientificRisk: "HIGH",
    lifecycle: "active",
  },
  {
    schemaVersion: 1,
    id: "lu-biological-technical-replicate-v1",
    revision: 1,
    titleCn: "生物学重复与技术重复",
    titleEn: "Biological vs Technical Replicates",
    domain: "experimental_design",
    estimatedMinutes: 10,
    curriculumOrder: 2,
    projectRelevanceTerms: ["重复", "类器官", "qPCR", "测序", "患者", "动物", "孔板"],
    learningObjectives: ["按独立生物来源区分生物学与技术重复", "解释技术重复改善的精度及其推断边界", "按层级报告样本数"],
    blocks: [
      block("br-why", "why_important", "understand", "18 个孔能代表 18 位患者吗", "一个患者来源的类器官铺了 18 个孔，药物差异很稳定。这能说明该材料在这些条件下反应稳定，却不能仅凭 18 个孔推广到患者群体。"),
      block("br-intuition", "intuition", "understand", "一句话直觉", "重复测同一个生物来源，能让这次测量更精确，但不会创造新的生物个体世界。"),
      block("br-definition", "precise_definition", "explain", "两类重复回答不同问题", "生物学重复是在设计下独立采样或独立生成、用于估计生物变异的单位；技术重复是同一生物材料的重复处理或测量，用于评估或降低测量误差。", true, [
        { zh: "生物学重复", en: "biological replicate", definitionCn: "独立生物来源或独立生成、用于估计生物差异的单位。" },
        { zh: "技术重复", en: "technical replicate", definitionCn: "同一生物材料的重复处理或测量。" },
      ]),
      block("br-mechanism", "mechanism", "explain", "沿层级寻找变异来源", "donor → organoid line → well → technical read 的每一层都有不同变异。物理容器分开并不自动意味着生物来源独立；要结合来源、分配方式和目标推断判断。"),
      block("br-worked", "worked_example", "explain", "3 位 donor、每位 3 个孔", "专家分别报告 donor n=3 与每位 donor 的孔数，再根据设计选择先聚合或使用能表达层级相关的模型。结论可讨论测试 donor 中的反应，而不能把 9 个孔写成 9 个独立 donor。"),
      block("br-misconception", "misconception", "explain", "孔分别培养，为什么还不一定独立", "不同孔确实可能出现差异，但它们共享 donor 或细胞系。独立性不是由孔板坐标决定，而由生物来源、分配机制和所要推广的总体决定。"),
      block("br-selfcheck", "self_check", "judge", "三问法", "先问独立生物来源有几个，再问每个来源被重复处理或测量几次，最后问模型是否保留了这些测量对上层来源的归属。"),
      block("br-boundary", "claim_boundary", "judge", "结论边界", "技术重复不是“没用”：它可发现测量不稳定并提高来源内精度。它只是不能单独估计生物个体间变异，也不能替代目标总体所需的独立生物重复。"),
      block("br-reviewer", "reviewer_view", "judge", "Reviewer 会追问什么", "报告每层单位数、独立制备或分配方式、技术重复如何汇总，以及推断对应 donor、样本、动物还是测量层。"),
    ],
    prerequisiteEdgeIds: ["pre-su-br"],
    delayedReviewPlan: [{ afterDays: 3, role: "review" }, { afterDays: 14, role: "far_transfer" }],
    evidenceSourceIds: ["src-pseudorep"],
    contentOrigin: "verified_seed",
    verificationStatus: "verified",
    scientificRisk: "HIGH",
    lifecycle: "active",
  },
  {
    schemaVersion: 1,
    id: "lu-pseudoreplication-v1",
    revision: 1,
    titleCn: "伪重复：很多行不等于很多 n",
    titleEn: "Pseudoreplication: Many Rows Are Not Many Independent Replicates",
    domain: "statistics",
    estimatedMinutes: 11,
    curriculumOrder: 3,
    projectRelevanceTerms: ["伪重复", "单细胞", "空间", "视野", "孔", "重复测量", "相关性"],
    learningObjectives: ["识别把相关测量当独立重复的伪重复", "解释其对不确定性与结论的影响", "提出与设计一致的修复方案"],
    blocks: [
      block("pr-why", "why_important", "understand", "为什么极小 P 值可能来自错误的 n", "每组只有 3 位患者，却把数千细胞当作彼此独立进行组间检验，模型会误以为获得了远多于实际的独立信息。"),
      block("pr-intuition", "intuition", "understand", "一句话直觉", "把同一个上层单位的许多相关测量当成许多个独立实验，就像把同一个人的多张照片当成许多个人。"),
      block("pr-definition", "precise_definition", "explain", "什么是伪重复", "伪重复是把并非独立重复的观测当作独立重复用于推断，导致分析中的独立信息量与研究设计不一致。", true, [{ zh: "伪重复", en: "pseudoreplication", definitionCn: "将相关或嵌套观测误当成独立重复进行推断。" }]),
      block("pr-mechanism", "mechanism", "explain", "错误如何传到 P 值和区间", "若模型忽略单位内相关，往往会低估标准误、缩窄置信区间并夸大显著性。影响大小取决于相关结构、单位数和模型，不能只凭行数机械计算。"),
      block("pr-worked", "worked_example", "explain", "从错误分析修到可辩护分析", "先确认组别在患者层变化；再保留细胞对患者的归属；随后可按患者×细胞类型聚合，或使用能表达患者层相关的合理模型；最后报告患者层效应与不确定性。伪批量是可辩护方案之一，不是所有设计的唯一答案。"),
      block("pr-misconception", "misconception", "explain", "加一个随机效应就一定修好了吗", "随机效应可以表达部分层级相关，但不会自动修复组别与批次完全混杂、独立单位过少或错误 estimand。修复必须对应真实设计缺陷。"),
      block("pr-selfcheck", "self_check", "judge", "快速诊断", "看到“每组少数样本、每样本大量细胞/孔/视野”时，检查分组层级、模型误差层级与报告的 n 是否一致。"),
      block("pr-boundary", "claim_boundary", "judge", "结论边界", "发现伪重复不表示数据毫无价值；这些测量仍可描述来源内结构或提高测量精度。需要收窄结论，并用与独立采样层级一致的分析表达不确定性。"),
      block("pr-reviewer", "reviewer_view", "judge", "Reviewer 会追问什么", "真正独立的实验或采样单位有多少？处理在哪一层分配？模型怎样处理嵌套相关？结论是否越过了独立重复所覆盖的总体？"),
    ],
    prerequisiteEdgeIds: ["pre-br-pr"],
    delayedReviewPlan: [{ afterDays: 4, role: "review" }, { afterDays: 14, role: "far_transfer" }],
    evidenceSourceIds: ["src-pseudorep", "src-pseudobulk"],
    contentOrigin: "verified_seed",
    verificationStatus: "verified",
    scientificRisk: "HIGH",
    lifecycle: "active",
  },
];

export const prerequisiteEdges: PrerequisiteEdgeV1[] = [
  { schemaVersion: 1, id: "pre-su-br", fromUnitId: "lu-statistical-unit-v1", toUnitId: "lu-biological-technical-replicate-v1", required: true, startGate: "instruction_complete_or_independent_evidence", independentGate: "independent_once", rationaleCn: "先理解统计单位，才能判断重复处于哪个层级。" },
  { schemaVersion: 1, id: "pre-br-pr", fromUnitId: "lu-biological-technical-replicate-v1", toUnitId: "lu-pseudoreplication-v1", required: true, startGate: "instruction_complete_or_independent_evidence", independentGate: "independent_once", rationaleCn: "先区分生物与技术重复，才能识别伪重复。" },
];

type AssetSeed = Omit<PracticeAssetV1, "schemaVersion" | "revision" | "contentHash" | "difficulty" | "provenance">;
const makeAsset = (seed: AssetSeed, sourceIds: string[]): PracticeAssetV1 => {
  const semantic: Omit<PracticeAssetV1, "contentHash"> = {
    schemaVersion: 1, revision: 1, difficulty: "foundation", ...seed,
    provenance: { contentOrigin: "verified_seed", verificationStatus: "verified", evidenceSourceIds: sourceIds },
  };
  return { ...semantic, contentHash: practiceAssetHash(semantic) };
};

const optionSet = (labels: string[]) => labels.map((labelCn, index) => ({ id: `o${index + 1}`, labelCn }));
const feedback = (maximalConclusionCn: string, reasoningChainCn: string[]): PracticeAssetV1["feedback"] => ({
  correctCn: ["先识别目标推断对应的独立层级。"],
  missedCn: ["检查下层测量是否共享同一上层来源。"],
  overreachCn: ["不能把测量次数直接改写成独立生物学 n。"],
  reasoningChainCn,
  maximalConclusionCn,
});

const seeds = [
  {
    unitId: "lu-statistical-unit-v1", concept: "statistical-unit", sources: ["src-pseudorep", "src-pseudobulk"],
    cases: {
      prediction: ["三位患者各测 2,000 个细胞", "患者组间推断时，最先应标记哪一层是 n？", ["细胞", "患者", "基因", "数据行"], "o2"],
      worked: ["专家拆解：小鼠 → 视野 → 细胞", "先判断处理分配层，再判断不确定性在哪一层表达。", ["先找 estimand", "画层级", "确认分配层", "限制结论"], "o1"],
      self_check: ["4 只小鼠/组，每只 10 个视野", "若目标是小鼠层处理效应，主要独立单位是什么？", ["80 个视野", "8 只小鼠", "全部细胞", "任意一层"], "o2"],
      guided: ["5 位患者各 3 张切片", "患者群体推断中，哪一层支持主要不确定性？", ["所有 ROI", "切片", "患者", "像素"], "o3"],
      independent: ["6 名 donor，各取两份组织并测多个 ROI", "选择主要统计单位，并解释为什么。", ["ROI", "组织块", "donor", "图像"], "o3"],
      review: ["两组各 7 只动物，每只重复测量四次", "延迟回忆：组间效应的独立信息主要来自哪里？", ["56 次测量", "14 只动物", "4 个时间点", "所有记录"], "o2"],
      far_transfer: ["你的当前项目包含嵌套或重复测量", "把统计单位原则迁移到项目：选择最高层独立来源，并写出结论边界。", ["数据行", "最低测量层", "独立采样或分配层", "显著性最大的一层"], "o3"],
    },
  },
  {
    unitId: "lu-biological-technical-replicate-v1", concept: "biological-replicate", sources: ["src-pseudorep"],
    cases: {
      prediction: ["同一患者 RNA 做三个 qPCR 孔", "三个孔最直接增加了什么？", ["患者数", "测量精度", "疾病亚型", "推广范围"], "o2"],
      worked: ["专家拆解：donor → sample → well", "先数独立来源，再说明技术重复的作用。", ["来源", "分装", "测量", "推广"], "o1"],
      self_check: ["4 位患者，每位同一样本做 3 个孔", "合理的生物学 n 是多少？", ["12", "4", "3", "无法报告"], "o2"],
      guided: ["3 个 donor，各建两个独立培养批次", "哪些单位帮助估计 donor 间变异？", ["孔", "读数", "donor", "显微照片"], "o3"],
      independent: ["一个患者来源类器官铺 18 个孔", "选择可辩护的推断并说明缺少什么。", ["代表 18 位患者", "n=1 生物来源", "孔必然独立", "P 值决定 n"], "o2"],
      review: ["6 位受试者，每份血样重复建库两次", "哪些是生物学重复？", ["12 个文库", "6 位受试者", "2 次建库", "测序 reads"], "o2"],
      far_transfer: ["外部 AI 把同一细胞系的 24 个孔写成 n=24 biological replicates", "审查这一步：选择核心错误并写出修复理由。", ["孔数不足", "技术单位冒充生物来源", "必须换检验", "只需更小 P 值"], "o2"],
    },
  },
  {
    unitId: "lu-pseudoreplication-v1", concept: "pseudoreplication", sources: ["src-pseudorep", "src-pseudobulk"],
    cases: {
      prediction: ["每组 3 位患者、数千细胞", "直接细胞级检验最可能低估什么？", ["均值", "标准误", "细胞数", "基因数"], "o2"],
      worked: ["专家修复：保留 cell → patient 归属", "修复要对齐设计，而不是只换一个检验名称。", ["找组别层", "保留归属", "选择层级分析", "收窄主张"], "o1"],
      self_check: ["3 位患者/组，共 20,000 细胞", "核心推断错误是什么？", ["细胞太少", "细胞冒充患者重复", "缺 UMAP", "必须非参数"], "o2"],
      guided: ["两组各 4 只小鼠，每只 30 个视野", "第一步修复是什么？", ["阈值改 0.01", "保留视野对小鼠归属", "增加视野", "删除异常视野"], "o2"],
      independent: ["5 个肿瘤样本，各有数百空间 spot", "选择可辩护分析层级并说明边界。", ["所有 spot 独立", "肿瘤样本层表达组间不确定性", "像素层", "任意随机效应都足够"], "o2"],
      review: ["8 位患者，每人三个时间点", "陌生表面下的伪重复风险是什么？", ["时间点共享患者来源", "时间点太少", "患者太多", "必须删除基线"], "o1"],
      far_transfer: ["陌生论文把 4 个肿瘤的 12,000 spots 当独立 n", "重建证据链：指出错误起点、修复和最大结论。", ["spot 相关性被忽略", "图例颜色错误", "基因太少", "期刊不匹配"], "o1"],
    },
  },
] as const;

const roleOrder: PracticeAssetV1["role"][] = ["prediction", "worked", "self_check", "guided", "independent", "review", "far_transfer"];
export const practiceAssets: PracticeAssetV1[] = seeds.flatMap((seed) => roleOrder.map((role) => {
  const [scenarioCn, promptCn, labels, expected] = seed.cases[role];
  const interaction = role === "far_transfer" && seed.concept === "statistical-unit" ? "project_transfer" : role === "far_transfer" && seed.concept === "pseudoreplication" ? "evidence_chain" : role === "worked" ? "evidence_chain" : role === "independent" ? "claim_boundary" : role === "far_transfer" ? "error_detection" : "single_choice";
  return makeAsset({
    id: `${seed.unitId}-${role}-v1`, role, conceptTarget: seed.concept, interaction,
    titleCn: { prediction: "先做预测", worked: "逐步拆解", self_check: "真实自检", guided: "带提示练习", independent: "独立判断", review: "延迟陌生变式", far_transfer: "真实迁移" }[role],
    scenarioCn, promptCn, options: optionSet([...labels]),
    hints: role === "guided" ? ["先问分组或处理在哪一层变化。", "再问哪些测量共享同一上层来源。", "最后把结论限制在独立来源覆盖的总体。"] : [],
    rubric: { expectedOptionIds: [expected], minReasoningChars: ["independent", "review", "far_transfer"].includes(role) ? 12 : 0 },
    feedback: feedback("只支持与独立采样、分配和测量层级一致的有限结论。", ["明确研究问题与 estimand", "画出嵌套或重复结构", "定位独立采样/分配层", "选择匹配的分析与结论边界"]),
  }, [...seed.sources]);
}));

const binding = (asset: PracticeAssetV1, unitId: string, order: number): PracticeAssetBindingV1 => ({
  schemaVersion: 1, id: `${unitId}-${asset.role}`, unitId, assetKind: "learning_practice", assetId: asset.id,
  assetRevision: asset.revision, assetHash: asset.contentHash, role: asset.role, order,
  hintPolicy: asset.role === "worked" ? "solution_visible" : asset.role === "guided" ? "tiered" : "none",
  feedbackPolicy: asset.role === "worked" ? "immediate" : "after_lock",
  lockRequired: !["worked"].includes(asset.role),
  confidenceRequired: ["independent", "review", "far_transfer"].includes(asset.role),
  competenceEligible: ["independent", "review", "far_transfer"].includes(asset.role),
  minStage: asset.role === "guided" ? "guided" : asset.role === "independent" ? "independent_ready" : asset.role === "review" ? "review_eligible" : asset.role === "far_transfer" ? "consolidating" : "learning",
});

export const practiceAssetBindings: PracticeAssetBindingV1[] = seeds.flatMap((seed) => {
  const assets = practiceAssets.filter((asset) => asset.id.startsWith(`${seed.unitId}-`));
  return roleOrder.map((role, index) => binding(assets.find((asset) => asset.role === role)!, seed.unitId, index + 1));
});

export const learningUnits: LearningUnitV1[] = unitSpecs.map((spec) => {
  const practiceBindingIds = practiceAssetBindings.filter((item) => item.unitId === spec.id).map((item) => item.id);
  const semantic = { ...spec, practiceBindingIds } as Omit<LearningUnitV1, "contentHash">;
  return { ...semantic, contentHash: learningUnitHash(semantic) };
});

export const learningUnitById = new Map(learningUnits.map((unit) => [unit.id, unit]));
export const practiceAssetById = new Map(practiceAssets.map((asset) => [asset.id, asset]));
export const bindingByUnitRole = new Map(practiceAssetBindings.map((binding) => [`${binding.unitId}:${binding.role}`, binding]));
