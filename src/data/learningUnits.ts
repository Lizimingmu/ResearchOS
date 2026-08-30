import type {
  LearningBlockV1,
  LearningUnitV1,
  PracticeAssetBindingV1,
  PrerequisiteEdgeV1,
} from "../domain/learningKernel";
import { learningUnitHash } from "../domain/learningKernel";

export interface PrototypePractice {
  unitId: string;
  guided: {
    scenario: string;
    question: string;
    options: string[];
    correctOption: number;
    hints: string[];
    explanation: string;
  };
  independent: {
    scenario: string;
    question: string;
    options: string[];
    correctOption: number;
    boundaryPrompt: string;
    referenceBoundary: string;
  };
}

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

// Immutable references keep the initial Learning route from pulling the full
// method/card libraries into startup. The deterministic audit recomputes each
// value from the real asset and fails if a source revision changes.
const assetReferences: Record<string, { revision: number; hash: string }> = {
  "method_concept:statistical-unit": { revision: 1, hash: "sha256:7800b5991b9a950022ab8f7e2721028e6cde9acc699c18083688e7e277d5ec8b" },
  "judgment_card:jc-01": { revision: 1, hash: "sha256:5905328c4fa308e6f31fcb733c430561a2588f69d7e87dc1dbbb97b2c88812dc" },
  "method_concept:biological-replicate": { revision: 1, hash: "sha256:9fe8a33153def9a4235c65efafc378a78da101293c6d5c6601be328c08e9ce12" },
  "judgment_card:jc-19": { revision: 1, hash: "sha256:9d5f8a969139238469717ee2548f553f047476957bc94aaf3fe9c0788de1e926" },
  "method_concept:pseudoreplication": { revision: 1, hash: "sha256:a8e5ad03f4f427cfe1d274d67f0b2757d579508f806e96aa09a8fdcae957a956" },
};

const asset = (kind: "method_concept" | "judgment_card", id: string) => {
  const value = assetReferences[`${kind}:${id}`];
  if (!value) throw new Error(`Learning Kernel asset reference missing: ${kind}/${id}`);
  return value;
};

const binding = (id: string, unitId: string, assetKind: "method_concept" | "judgment_card", assetId: string, role: PracticeAssetBindingV1["role"], order: number): PracticeAssetBindingV1 => {
  const ref = asset(assetKind, assetId);
  const worked = role === "worked";
  const guided = role === "guided";
  return {
    schemaVersion: 1, id, unitId, assetKind, assetId, assetRevision: ref.revision, assetHash: ref.hash, role, order,
    hintPolicy: worked ? "solution_visible" : guided ? "tiered" : "none",
    feedbackPolicy: worked ? "immediate" : "after_lock",
    lockRequired: !worked,
    confidenceRequired: !worked && !guided,
    competenceEligible: !worked && !guided,
    minStage: worked ? "learning" : guided ? "guided" : role === "independent" ? "independent_ready" : role === "review" ? "review_eligible" : "transferable",
  };
};

const rolesFor = (unitId: string, methodId: string, judgmentId: string): PracticeAssetBindingV1[] => [
  binding(`${unitId}-worked`, unitId, "method_concept", methodId, "worked", 1),
  binding(`${unitId}-guided`, unitId, "judgment_card", judgmentId, "guided", 2),
  binding(`${unitId}-independent`, unitId, "judgment_card", judgmentId, "independent", 3),
  binding(`${unitId}-review`, unitId, "judgment_card", judgmentId, "review", 4),
  binding(`${unitId}-transfer`, unitId, "judgment_card", judgmentId, "far_transfer", 5),
];

export const practiceAssetBindings: PracticeAssetBindingV1[] = [
  ...rolesFor("lu-statistical-unit-v1", "statistical-unit", "jc-01"),
  ...rolesFor("lu-biological-technical-replicate-v1", "biological-replicate", "jc-19"),
  ...rolesFor("lu-pseudoreplication-v1", "pseudoreplication", "jc-01"),
];

export const learningUnits: LearningUnitV1[] = unitSpecs.map((spec) => {
  const practiceBindingIds = practiceAssetBindings.filter((item) => item.unitId === spec.id).map((item) => item.id);
  const semantic = { ...spec, practiceBindingIds } as Omit<LearningUnitV1, "contentHash">;
  return { ...semantic, contentHash: learningUnitHash(semantic) };
});

export const prototypePractices: PrototypePractice[] = [
  {
    unitId: "lu-statistical-unit-v1",
    guided: { scenario: "4 只小鼠/组，每只取 10 个视野。", question: "若目标是比较处理对小鼠的影响，最关键的独立单位是什么？", options: ["80 个视野", "8 只小鼠", "每张图片中的细胞", "视野和小鼠都可直接当独立 n"], correctOption: 1, hints: ["处理分配给谁？", "哪些视野共享同一只小鼠？", "结论最终指向视野还是小鼠？"], explanation: "视野是嵌套测量；若处理在小鼠层分配且目标是小鼠层效应，独立信息主要来自 8 只小鼠。" },
    independent: { scenario: "5 名患者各有 3 张切片，每张切片取 20 个 ROI。目标是推断患者群体中的组间差异。", question: "应把哪一层作为主要统计单位来表达组间不确定性？", options: ["300 个 ROI", "15 张切片", "5 名患者", "只要使用混合模型，任何层都等价"], correctOption: 2, boundaryPrompt: "一句话写出这个结论不能越过的边界。", referenceBoundary: "ROI 和切片可提高患者内测量精度，但 5 名患者所覆盖的患者间变异与可推广范围仍然有限。" },
  },
  {
    unitId: "lu-biological-technical-replicate-v1",
    guided: { scenario: "4 位患者，每位患者的同一 RNA 样本做 3 个 qPCR 孔。", question: "这里最合理的生物学 n 是多少？", options: ["12 个孔", "4 位患者", "3 次技术重复", "取决于显著性大小"], correctOption: 1, hints: ["独立生物来源有几个？", "3 个孔是否来自不同患者？", "技术重复主要描述哪一类误差？"], explanation: "4 位患者提供生物学重复；每位患者的 3 个孔是技术重复。" },
    independent: { scenario: "一个患者来源的类器官系在每个条件下铺 18 个孔。", question: "下列哪项结论最可辩护？", options: ["n=18 名患者，药物对患者群体有效", "n=1 个生物来源；18 个孔支持该来源内的测量重复性", "孔物理分开，因此必然是独立生物重复", "P 值足够小即可忽略生物重复"], correctOption: 1, boundaryPrompt: "说明还缺少哪类重复才能讨论患者间推广。", referenceBoundary: "需要来自独立患者或独立生物来源的类器官重复，并按层级设计分析。" },
  },
  {
    unitId: "lu-pseudoreplication-v1",
    guided: { scenario: "3 位患者/组，共 20,000 个细胞，直接做细胞级组间检验。", question: "最核心的推断问题是什么？", options: ["细胞数太少", "把嵌套细胞当成独立患者层重复", "必须使用非参数检验", "只缺少一张 UMAP"], correctOption: 1, hints: ["组别标签在哪一层？", "同一患者内细胞是否共享背景？", "标准误由多少独立患者支持？"], explanation: "患者是组间独立来源；将细胞作为独立重复会造成伪重复并夸大精度。" },
    independent: { scenario: "两组各 4 只小鼠，每只采集 30 个视野。分析把 240 个视野当作独立观测。", question: "最合适的第一步修复是什么？", options: ["把显著性阈值改为 0.01", "保留视野对小鼠的归属，并在小鼠层表达组间不确定性", "再增加每只小鼠的视野数", "删除方差最大的视野"], correctOption: 1, boundaryPrompt: "说明这些视野仍然能提供什么信息。", referenceBoundary: "视野可提高每只小鼠内表型估计的精度，但不能替代更多独立小鼠。" },
  },
];

export const learningUnitById = new Map(learningUnits.map((unit) => [unit.id, unit]));
export const prototypePracticeByUnitId = new Map(prototypePractices.map((practice) => [practice.unitId, practice]));
