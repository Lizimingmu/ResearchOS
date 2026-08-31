import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalSourceLinksFor, selfRescueGuideModules, selfRescueGuideSections } from "../.build/data/self-rescue-guide/build.js";
import { authoredGuideContent } from "../.build/data/self-rescue-guide/content/index.js";
import { evidenceById } from "../.build/data/evidence.js";
import { curriculumManifest, stagedCaseLabs, stagedConceptLessons, stagedMethodLessons, studioTemplates } from "../.build/data/curriculum/index.js";

const validRoles = new Set(["direct", "methodology", "curriculum_synthesis", "supplemental"]);
const targetTitles = [
  "RNA Is Not Protein",
  "Feature Selection",
  "Pathway and Program Interpretation",
  "Pseudoreplication in Single-Cell RNA-seq",
  "Pseudobulk",
  "External Validity",
  "Orthogonal Validation",
  "Technical versus Biological Validation",
  "Cognitive Outsourcing",
  "Think, AI Critique, Decide",
];
const authoredByKey = new Map(authoredGuideContent.map((item) => [`${item.moduleId}::${item.titleEn}`, item]));
const sectionsByKey = new Map(selfRescueGuideSections.map((item) => [`${item.chapterId}::${item.titleEn}`, item]));
const errors = [];
const mappings = [];

for (const module of selfRescueGuideModules) {
  for (const topic of module.topics) {
    const key = `${module.id}::${topic.titleEn}`;
    const section = sectionsByKey.get(key);
    const authored = authoredByKey.get(key);
    const canonical = canonicalSourceLinksFor(module, topic);
    const links = section?.evidenceSourceLinks ?? [];
    const linksById = new Map(links.map((link) => [link.sourceId, link]));
    if (!section || !authored) { errors.push(`${key} is missing authored or rendered content`); continue; }
    for (const link of canonical) {
      const rendered = linksById.get(link.sourceId);
      if (!rendered) errors.push(`${key} removed canonical ${link.role} source ${link.sourceId}`);
      else if (rendered.role !== link.role) errors.push(`${key} changed canonical source ${link.sourceId} from ${link.role} to ${rendered.role}`);
    }
    for (const sourceId of authored.evidenceSourceIds ?? []) {
      const rendered = linksById.get(sourceId);
      if (!rendered) errors.push(`${key} dropped authored supplemental source ${sourceId}`);
      else if (!canonical.some((link) => link.sourceId === sourceId) && rendered.role !== "supplemental") errors.push(`${key} did not mark authored-only source ${sourceId} supplemental`);
    }
    if (section.evidenceSourceIds.join("|") !== links.map((link) => link.sourceId).join("|")) errors.push(`${key} flattened source IDs do not match structured links`);
    for (const link of links) {
      if (!validRoles.has(link.role)) errors.push(`${key} has invalid source role ${link.role}`);
      if (!evidenceById[link.sourceId]) errors.push(`${key} references unknown source ${link.sourceId}`);
    }
    if (targetTitles.includes(topic.titleEn)) mappings.push({ key, canonical, authoredSourceIds: authored.evidenceSourceIds ?? [], resolved: links });
  }
}

for (const title of targetTitles) if (!mappings.some((mapping) => mapping.key.endsWith(`::${title}`))) errors.push(`target source mapping not found: ${title}`);
const aiRecords = authoredGuideContent.filter((item) => ["Cognitive Outsourcing", "Think, AI Critique, Decide", "Pre-AI Research Note"].includes(item.titleEn));
for (const item of aiRecords) {
  const text = JSON.stringify(item);
  if (!/(?:不声称|不把|不对).{0,30}(?:锚定|认知损害|心理效应|量化)/.test(text)) errors.push(`${item.titleEn} does not explicitly narrow unsupported empirical cognitive-effect claims`);
}

const roleCounts = Object.fromEntries([...validRoles].map((role) => [role, selfRescueGuideSections.flatMap((section) => section.evidenceSourceLinks ?? []).filter((link) => link.role === role).length]));
const canonicalLinkCount = selfRescueGuideModules.reduce((sum, module) => sum + module.topics.reduce((topicSum, topic) => topicSum + canonicalSourceLinksFor(module, topic).length, 0), 0);
const generatedRecords = [...selfRescueGuideSections, ...curriculumManifest, ...stagedConceptLessons, ...stagedMethodLessons, ...stagedCaseLabs, ...studioTemplates];
const activeGenerated = generatedRecords.filter((item) => item.contentOrigin === "ai_generated" && (item.lifecycle === "active" || item.verificationStatus === "verified"));
const nonPendingGenerated = generatedRecords.filter((item) => item.contentOrigin === "ai_generated" && (item.lifecycle !== "pending_review" || item.verificationStatus !== "pending"));
if (activeGenerated.length) errors.push(`${activeGenerated.length} generated records are active or verified`);
if (nonPendingGenerated.length) errors.push(`${nonPendingGenerated.length} generated records do not remain pending/pending_review`);
const report = {
  schemaVersion: 1,
  status: errors.length ? "FAIL" : "PASS",
  counts: { sections: selfRescueGuideSections.length, canonicalLinks: canonicalLinkCount, targetMappings: mappings.length, generatedRecords: generatedRecords.length, activeGenerated: activeGenerated.length, nonPendingGenerated: nonPendingGenerated.length, ...roleCounts },
  mappings,
  errors,
};
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/m019-1-guide-source-linkage-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Guide source linkage audit: ${report.status} (${canonicalLinkCount} canonical links, ${errors.length} errors)`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
