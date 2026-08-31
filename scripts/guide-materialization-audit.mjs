import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { authoredGuideContent } from "../.build/data/self-rescue-guide/content/index.js";
import { selfRescueGuideModules, selfRescueGuideSections } from "../.build/data/self-rescue-guide/index.js";

const errors = [];
const warnings = [];
const topicKeySet = new Set(authoredGuideContent.map((item) => `${item.moduleId}::${item.titleEn}`));
const bounds = { tier1: [800, 1500], tier2: [500, 900], tier3: [250, 600] };
const concreteBiomedical = /患者|供体|肿瘤|队列|动物|小鼠|细胞|组织|样本|病例|临床|蛋白|转录|基因|影像|病理|生存|结局|治疗|诊断|筛查|中心/;
const specificFailure = /误|偏倚|泄漏|低估|高估|混淆|伪|错|失真|无法|不能|夸大|遗漏|越界|不稳定|混杂|重复/;
const boundedConclusion = /最多|只能|不能|不足以|限于|支持|不支持|仍需|尚未|不得/;

if (authoredGuideContent.length !== 288) errors.push(`expected 288 authored Guide records, got ${authoredGuideContent.length}`);
if (topicKeySet.size !== authoredGuideContent.length) errors.push("authored Guide module-topic keys are not unique");
for (const module of selfRescueGuideModules) for (const topic of module.topics) if (!topicKeySet.has(`${module.id}::${topic.titleEn}`)) errors.push(`missing authored content: ${module.id}::${topic.titleEn}`);

for (const item of authoredGuideContent) {
  const body = selfRescueGuideSections.find((section) => section.chapterId === item.moduleId && section.titleEn === item.titleEn)?.bodyCn.join("") ?? "";
  const [minimum, maximum] = bounds[item.tier];
  if (body.length < minimum || body.length > maximum) errors.push(`${item.titleEn} ${item.tier} length ${body.length}, expected ${minimum}-${maximum}`);
  if (item.preciseExplanationCn.length < (item.tier === "tier1" ? 2 : 1)) errors.push(`${item.titleEn} lacks precise explanation depth`);
  if (item.biomedicalExample.dataCn.length < 1 || item.biomedicalExample.reasoningStepsCn.length < (item.tier === "tier1" ? 3 : 1)) errors.push(`${item.titleEn} has an incomplete worked example`);
  if (!item.misconceptionCn.length || !item.boundaryCn.length) errors.push(`${item.titleEn} lacks misconception or boundary`);
  if (!concreteBiomedical.test(JSON.stringify(item.biomedicalExample))) errors.push(`${item.titleEn} lacks a concrete biomedical noun`);
  if (!specificFailure.test(`${item.whyItMattersCn}${item.biomedicalExample.wrongPathCn}${item.misconceptionCn.join("")}`)) errors.push(`${item.titleEn} lacks a specific failure mode`);
  if (!boundedConclusion.test(`${item.biomedicalExample.conclusionCn}${item.boundaryCn.join("")}`)) errors.push(`${item.titleEn} lacks a bounded maximum conclusion`);
  if (!item.evidenceSourceIds?.length) warnings.push(`${item.titleEn} inherits source linkage from the catalog`);
}

const tierCounts = Object.fromEntries(["tier1", "tier2", "tier3"].map((tier) => [tier, authoredGuideContent.filter((item) => item.tier === tier).length]));
if (tierCounts.tier1 < 70 || tierCounts.tier1 > 90) errors.push(`tier1 count ${tierCounts.tier1}, expected 70-90`);
if (tierCounts.tier2 < 120 || tierCounts.tier2 > 150) errors.push(`tier2 count ${tierCounts.tier2}, expected 120-150`);
if (tierCounts.tier3 < 45 || tierCounts.tier3 > 90) errors.push(`tier3 count ${tierCounts.tier3}, expected remaining reference depth`);

const buildSource = await readFile(path.resolve("src/data/self-rescue-guide/build.ts"), "utf8");
if (/function\s+buildBody|buildBody\s*\(/.test(buildSource)) errors.push("generic buildBody remains in the Guide build path");
if (/misconceptionFor|boundaryFor|const\s+transitions\s*=/.test(buildSource)) errors.push("generic misconception/boundary transition generators remain");

const report = { schemaVersion: 1, status: errors.length ? "FAIL" : "PASS", counts: { authored: authoredGuideContent.length, ...tierCounts }, genericTemplateRemaining: errors.filter((item) => /generic|buildBody/.test(item)).length, errors, warnings };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/guide-materialization-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Guide materialization audit: ${report.status} (${tierCounts.tier1}/${tierCounts.tier2}/${tierCounts.tier3})`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
