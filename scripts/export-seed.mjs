import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildData = path.join(root, ".build", "data");

const modules = await Promise.all([
  import(pathToFileURL(path.join(buildData, "evidence.js"))),
  import(pathToFileURL(path.join(buildData, "methods.js"))),
  import(pathToFileURL(path.join(buildData, "patterns.js"))),
  import(pathToFileURL(path.join(buildData, "judgmentCards.js"))),
  import(pathToFileURL(path.join(buildData, "auditCases.js"))),
  import(pathToFileURL(path.join(buildData, "starterTrack.js"))),
  import(pathToFileURL(path.join(buildData, "examplePapers.js"))),
  import(pathToFileURL(path.join(buildData, "problemAtlas.js"))),
]);

const [evidence, methods, patterns, cards, audits, starter, papers, atlas] = modules;
const exports = [
  ["data/seed/evidence_sources.json", evidence.evidenceSources],
  ["data/seed/example_papers.json", papers.examplePapers],
  ["data/seed/starter_track.json", { days: starter.starterTrack, blindAssessmentPrompts: starter.blindAssessmentPrompts }],
  ["data/seed/frontier_nodes.json", papers.frontierNodes],
  ["data/methods/methods.json", methods.methodConcepts],
  ["data/patterns/patterns.json", patterns.researchPatterns],
  ["data/judgment_cards/judgment_cards.json", cards.judgmentCards],
  ["data/audit_cases/audit_cases.json", audits.auditCases],
  ["data/problem_atlas/source_pack.json", atlas.demoSourcePack],
];

for (const [relative, value] of exports) {
  const destination = path.join(root, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

console.log(`Exported ${exports.length} machine-readable seed artifacts.`);
