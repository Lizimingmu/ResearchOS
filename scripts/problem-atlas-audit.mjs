import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoSourcePack, diagnosticCauses, diagnosticPaths, problemCards, problemTrainingCases } from "../.build/data/problemAtlas.js";
import { methodConcepts } from "../.build/data/methods.js";
import { researchPatterns } from "../.build/data/patterns.js";
import { searchProblemCards } from "../.build/problem-atlas/search.js";
import { createDiagnosticSession, gradeSession, lockSessionStep } from "../.build/problem-atlas/diagnosticEngine.js";
import { applySourcePackImport, dryRunSourcePack, validateSourcePack } from "../.build/services/sourcePack.js";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];
const checks = [];
const check = (name, passed, detail) => { checks.push({ name, passed: Boolean(passed), detail }); if (!passed) errors.push(`${name}: ${detail}`); };
const hasChinese = (value) => /[\u3400-\u9fff]/u.test(value);

const emptyAtlas = {
  problemAtlasSources: [],
  problemAtlasClaims: [],
  problemCards: [],
  diagnosticCauses: [],
  diagnosticChecks: [],
  diagnosticPaths: [],
  diagnosticEvidence: [],
  problemTrainingCases: [],
  diagnosticSessions: [],
  sourcePackImports: [],
  problemSearchLog: [],
};
const seeded = applySourcePackImport(emptyAtlas, demoSourcePack, { allowUpdates: true });
const state = { ...emptyAtlas, ...seeded.collections, sourcePackImports: [seeded.importRecord] };
check("demo atlas seeds through the import pipeline", state.problemCards.length === 4 && state.problemAtlasSources.length >= 6, `${state.problemCards.length} cards / ${state.problemAtlasSources.length} sources`);
check("seed import records the demo pack", state.sourcePackImports[0].packId === "problem-atlas-demo-v1" && state.sourcePackImports[0].result === "applied", state.sourcePackImports[0].packId);

const methodIds = new Set(methodConcepts.map((item) => item.id));
const patternIds = new Set(researchPatterns.map((item) => item.id));
for (const card of problemCards) {
  if (!hasChinese(card.titleCn)) errors.push(`card ${card.id}: titleCn has no Chinese.`);
  if (!card.titleEn.trim()) errors.push(`card ${card.id}: missing titleEn.`);
  if (card.aliases.length < 3) errors.push(`card ${card.id}: too few aliases.`);
  if (card.keywords.length < 4) errors.push(`card ${card.id}: too few keywords.`);
  if (!hasChinese(card.observation)) errors.push(`card ${card.id}: observation not Chinese-first.`);
  if (!hasChinese(card.claimBoundary)) errors.push(`card ${card.id}: claimBoundary not Chinese-first.`);
  if (!hasChinese(card.reviewerImplication)) errors.push(`card ${card.id}: reviewerImplication not Chinese-first.`);
  for (const methodId of card.relatedMethodIds) {
    if (!methodIds.has(methodId)) errors.push(`card ${card.id}: relatedMethodIds references missing method ${methodId}.`);
  }
  for (const patternId of card.relatedPatternIds) {
    if (!patternIds.has(patternId)) errors.push(`card ${card.id}: relatedPatternIds references missing pattern ${patternId}.`);
  }
}
check("cards are Chinese-first with valid cross-links", errors.filter((item) => item.includes("card ")).length === 0, `${problemCards.length} cards checked`);

const searchExact = searchProblemCards("伪重复", problemCards);
check("search: Chinese exact alias", searchExact.hits.length > 0 && searchExact.hits[0].card.id === "pa-pseudorep", searchExact.hits.map((hit) => `${hit.card.id}@${hit.score}`).join(", "));
const searchEnglish = searchProblemCards("pseudoreplication", problemCards);
check("search: English title match", searchEnglish.hits.length > 0 && searchEnglish.hits[0].card.id === "pa-pseudorep", searchEnglish.hits.map((hit) => `${hit.card.id}@${hit.score}`).join(", "));
const searchAbbr = searchProblemCards("DEG", problemCards);
check("search: abbreviation/alias expansion", searchAbbr.hits.some((hit) => hit.card.id === "pa-pseudorep"), searchAbbr.hits.map((hit) => hit.card.id).join(", "));
const searchKeyword = searchProblemCards("交叉验证", problemCards);
check("search: keyword match", searchKeyword.hits.some((hit) => hit.card.id === "pa-data-leakage"), searchKeyword.hits.map((hit) => hit.card.id).join(", "));
const searchFuzzy = searchProblemCards("pseudorepliction", problemCards);
check("search: deterministic fuzzy fallback", searchFuzzy.hits.length > 0 && searchFuzzy.hits[0].card.id === "pa-pseudorep", searchFuzzy.hits.map((hit) => `${hit.card.id}@${hit.score}`).join(", "));
const searchDeterministic = JSON.stringify(searchProblemCards("验证", problemCards).hits.map((hit) => hit.card.id)) === JSON.stringify(searchProblemCards("验证", problemCards).hits.map((hit) => hit.card.id));
check("search: deterministic ordering", searchDeterministic, "stable across repeated calls");
const searchNone = searchProblemCards("zzzz-not-a-real-problem", problemCards);
check("search: no match returns empty", searchNone.hits.length === 0, `${searchNone.hits.length} hits`);
check("search: unmatched query offers suggestions", searchNone.suggestions.length > 0, searchNone.suggestions.join(", "));
const filtered = searchProblemCards("验证", problemCards, { knowledgeStatus: "current", verificationStatus: "pending" });
check("search: filters apply", filtered.hits.every((hit) => hit.card.knowledgeStatus === "current" && hit.card.verificationStatus === "pending"), `${filtered.hits.length} filtered hits`);

const modeList = ["quick", "differential", "sequential", "missing-info", "error-localization", "claim-boundary", "reviewer", "ai-verdict"];
const cardModes = new Map(problemCards.map((card) => [card.id, new Set(problemTrainingCases.filter((entry) => entry.problemId === card.id).map((entry) => entry.mode))]));
const missingModes = problemCards.flatMap((card) => modeList.filter((mode) => !cardModes.get(card.id)?.has(mode)).map((mode) => `${card.id}:${mode}`));
check("eight modes covered per card", missingModes.length === 0, missingModes.join(", ") || `${problemCards.length * 8} training cases`);

const quickCase = problemTrainingCases.find((entry) => entry.problemId === "pa-pseudorep" && entry.mode === "quick");
const quickSession = createDiagnosticSession("t", "pa-pseudorep", "quick", new Date("2026-08-24T00:00:00Z"));
const lockedQuick = lockSessionStep(quickSession, { stepId: "quick-layer", kind: "layer", mode: "quick", payload: { layer: "statistics", rationale: "统计单位错误" } }, new Date("2026-08-24T00:00:00Z"));
const quickPath = diagnosticPaths.find((entry) => entry.id === "pa-pseudorep-path");
const quickGrade = gradeSession(lockedQuick.session, problemCards.find((item) => item.id === "pa-pseudorep"), quickPath, quickCase, state.diagnosticEvidence);
check("engine: correct quick diagnosis scores 1", quickGrade.score === 1 && quickGrade.completed, `score=${quickGrade.score}`);
const relock = lockSessionStep(lockedQuick.session, { stepId: "quick-layer", kind: "layer", mode: "quick", payload: { layer: "interpretation", rationale: "换个答案" } }, new Date("2026-08-24T00:00:00Z"));
check("engine: judgments lock once", Boolean(relock.error) && relock.session.steps.length === 1, relock.error ?? "no error");

const seqCase = problemTrainingCases.find((entry) => entry.problemId === "pa-pseudorep" && entry.mode === "sequential");
const seqSession = createDiagnosticSession("s", "pa-pseudorep", "sequential", new Date("2026-08-24T00:00:00Z"));
const baselineRanking = lockSessionStep(seqSession, { stepId: "baseline-ranking", kind: "ranking", mode: "sequential", payload: { baseline: true, rankedCauseIds: ["pa-pseudorep-cause-cells", "pa-pseudorep-cause-batch", "pa-pseudorep-cause-nesting", "pa-pseudorep-cause-tool"] } }, new Date("2026-08-24T00:00:00Z"), quickPath);
check("engine: sequential baseline ranking locked first", Boolean(!baselineRanking.error) && baselineRanking.session.steps[0]?.kind === "ranking" && baselineRanking.session.steps[0]?.payload.baseline === true, baselineRanking.error ?? "baseline locked");
let seq = baselineRanking.session;
for (const node of quickPath.nodes) {
  seq = lockSessionStep(seq, { stepId: `reveal-${node.id}`, kind: "reveal", mode: "sequential", payload: { nodeId: node.id, evidenceIds: node.availableEvidenceIds } }, new Date("2026-08-24T00:00:00Z"), quickPath).session;
  seq = lockSessionStep(seq, { stepId: node.id, kind: "ranking", mode: "sequential", payload: { nodeId: node.id, revealedEvidenceIds: node.availableEvidenceIds, rankedCauseIds: ["pa-pseudorep-cause-cells", "pa-pseudorep-cause-batch", "pa-pseudorep-cause-nesting", "pa-pseudorep-cause-tool"] } }, new Date("2026-08-24T00:00:00Z"), quickPath).session;
}
const seqGrade = gradeSession(seq, problemCards.find((item) => item.id === "pa-pseudorep"), quickPath, seqCase, state.diagnosticEvidence);
check("engine: sequential history preserves baseline and every update", seq.steps.filter((step) => step.kind === "ranking").length === quickPath.nodes.length + 1 && seq.steps.filter((step) => step.kind === "reveal").length === quickPath.nodes.length, `${seq.steps.length} steps`);
check("engine: sequential completes with ranking score", seqGrade.completed && seqGrade.score > 0, `score=${seqGrade.score}`);

const wrongSeqSession = createDiagnosticSession("w", "pa-pseudorep", "sequential", new Date("2026-08-24T00:00:00Z"));
let wrongSeq = lockSessionStep(wrongSeqSession, { stepId: "baseline-ranking", kind: "ranking", mode: "sequential", payload: { baseline: true, rankedCauseIds: ["pa-pseudorep-cause-cells", "pa-pseudorep-cause-batch", "pa-pseudorep-cause-nesting", "pa-pseudorep-cause-tool"] } }, new Date("2026-08-24T00:00:00Z"), quickPath).session;
for (const node of quickPath.nodes) {
  wrongSeq = lockSessionStep(wrongSeq, { stepId: `reveal-${node.id}`, kind: "reveal", mode: "sequential", payload: { nodeId: node.id, evidenceIds: node.availableEvidenceIds } }, new Date("2026-08-24T00:00:00Z"), quickPath).session;
  wrongSeq = lockSessionStep(wrongSeq, { stepId: node.id, kind: "ranking", mode: "sequential", payload: { nodeId: node.id, revealedEvidenceIds: node.availableEvidenceIds, rankedCauseIds: ["pa-pseudorep-cause-tool", "pa-pseudorep-cause-nesting", "pa-pseudorep-cause-batch", "pa-pseudorep-cause-cells"] } }, new Date("2026-08-24T00:00:00Z"), quickPath).session;
}
const wrongGrade = gradeSession(wrongSeq, problemCards.find((item) => item.id === "pa-pseudorep"), quickPath, seqCase, state.diagnosticEvidence);
check("engine: inverted ranking scores lower", wrongGrade.score < seqGrade.score, `correct=${seqGrade.score}; inverted=${wrongGrade.score}`);

const strictSeq = createDiagnosticSession("strict", "pa-pseudorep", "sequential", new Date("2026-08-24T00:00:00Z"));
const strictLock = (session, input) => lockSessionStep(session, input, new Date("2026-08-24T00:00:00Z"), quickPath);
const strictBaseline = strictLock(strictSeq, { stepId: "baseline-ranking", kind: "ranking", mode: "sequential", payload: { baseline: true, rankedCauseIds: ["a", "b", "c", "d"] } });
check("engine: strict path baseline accepted", !strictBaseline.error, strictBaseline.error ?? "ok");
const fakeNode = strictLock(strictBaseline.session, { stepId: "reveal-fake", kind: "reveal", mode: "sequential", payload: { nodeId: "not-a-real-node", evidenceIds: [] } });
check("engine: fake path node rejected", Boolean(fakeNode.error), fakeNode.error ?? "no error");
const reorderedNode = strictLock(strictBaseline.session, { stepId: "reveal-n2", kind: "reveal", mode: "sequential", payload: { nodeId: quickPath.nodes[1].id, evidenceIds: quickPath.nodes[1].availableEvidenceIds } });
check("engine: out-of-order path node rejected", Boolean(reorderedNode.error), reorderedNode.error ?? "no error");
const fabricatedEvidence = strictLock(strictBaseline.session, { stepId: "reveal-fab", kind: "reveal", mode: "sequential", payload: { nodeId: quickPath.nodes[0].id, evidenceIds: ["fabricated-evidence"] } });
check("engine: fabricated evidence rejected", Boolean(fabricatedEvidence.error), fabricatedEvidence.error ?? "no error");
const revealN1 = strictLock(strictBaseline.session, { stepId: "reveal-n1", kind: "reveal", mode: "sequential", payload: { nodeId: quickPath.nodes[0].id, evidenceIds: quickPath.nodes[0].availableEvidenceIds } });
check("engine: first path node reveal accepted", !revealN1.error, revealN1.error ?? "ok");
const mismatchRank = strictLock(revealN1.session, { stepId: "rank-wrong-node", kind: "ranking", mode: "sequential", payload: { nodeId: quickPath.nodes[1].id, revealedEvidenceIds: quickPath.nodes[0].availableEvidenceIds, rankedCauseIds: ["a", "b", "c", "d"] } });
check("engine: mismatched reveal/ranking node rejected", Boolean(mismatchRank.error), mismatchRank.error ?? "no error");
const rankN1 = strictLock(revealN1.session, { stepId: quickPath.nodes[0].id, kind: "ranking", mode: "sequential", payload: { nodeId: quickPath.nodes[0].id, revealedEvidenceIds: quickPath.nodes[0].availableEvidenceIds, rankedCauseIds: ["a", "b", "c", "d"] } });
check("engine: matching ranking accepted", !rankN1.error, rankN1.error ?? "ok");
const repeatNode = strictLock(rankN1.session, { stepId: "reveal-n1-again", kind: "reveal", mode: "sequential", payload: { nodeId: quickPath.nodes[0].id, evidenceIds: quickPath.nodes[0].availableEvidenceIds } });
check("engine: repeated path node rejected", Boolean(repeatNode.error), repeatNode.error ?? "no error");
const partialCoverage = gradeSession(rankN1.session, problemCards.find((item) => item.id === "pa-pseudorep"), quickPath, seqCase, state.diagnosticEvidence);
check("engine: completion requires every path node ranked", partialCoverage.completed === false, `completed=${partialCoverage.completed}`);

const crossMode = lockSessionStep(quickSession, { stepId: "cross-mode", kind: "layer", mode: "differential", payload: { layer: "statistics" } }, new Date("2026-08-24T00:00:00Z"));
check("engine: cross-mode submission rejected", Boolean(crossMode.error) && quickSession.steps.length === 0, crossMode.error ?? "no error");
const wrongKind = lockSessionStep(quickSession, { stepId: "wrong-kind", kind: "boundary", mode: "quick", payload: {} }, new Date("2026-08-24T00:00:00Z"));
check("engine: illegal step kind for mode rejected", Boolean(wrongKind.error), wrongKind.error ?? "no error");
const revealFirst = lockSessionStep(seqSession, { stepId: "reveal-first", kind: "reveal", mode: "sequential", payload: { nodeId: "n1" } }, new Date("2026-08-24T00:00:00Z"));
check("engine: reveal before baseline rejected", Boolean(revealFirst.error), revealFirst.error ?? "no error");
const probeSession = createDiagnosticSession("p", "pa-pseudorep", "sequential", new Date("2026-08-24T00:00:00Z"));
let probe = lockSessionStep(probeSession, { stepId: "baseline-ranking", kind: "ranking", mode: "sequential", payload: { baseline: true, rankedCauseIds: ["a", "b", "c", "d"] } }, new Date("2026-08-24T00:00:00Z")).session;
probe = lockSessionStep(probe, { stepId: "reveal-1", kind: "reveal", mode: "sequential", payload: { nodeId: "n1", evidenceIds: [] } }, new Date("2026-08-24T00:00:00Z")).session;
const consecutiveReveal = lockSessionStep(probe, { stepId: "reveal-2", kind: "reveal", mode: "sequential", payload: { nodeId: "n2" } }, new Date("2026-08-24T00:00:00Z"));
check("engine: consecutive reveals rejected", Boolean(consecutiveReveal.error), consecutiveReveal.error ?? "no error");

const aiCase = problemTrainingCases.find((entry) => entry.problemId === "pa-pseudorep" && entry.mode === "ai-verdict");
const aiPartialSession = createDiagnosticSession("ai-partial", "pa-pseudorep", "ai-verdict", new Date("2026-08-24T00:00:00Z"));
const aiPartial = lockSessionStep(aiPartialSession, { stepId: "ai-verdicts", kind: "ai-verdict", mode: "ai-verdict", payload: { verdicts: { st1: "wrong" } } }, new Date("2026-08-24T00:00:00Z"));
const aiPartialGrade = gradeSession(aiPartial.session, problemCards.find((item) => item.id === "pa-pseudorep"), quickPath, aiCase, state.diagnosticEvidence);
check("engine: partial AI verdicts score incomplete", aiPartialGrade.completed === false && aiPartialGrade.score === 0, `completed=${aiPartialGrade.completed}; score=${aiPartialGrade.score}`);
const aiExtraSession = createDiagnosticSession("ai-extra", "pa-pseudorep", "ai-verdict", new Date("2026-08-24T00:00:00Z"));
const aiExtra = lockSessionStep(aiExtraSession, { stepId: "ai-verdicts", kind: "ai-verdict", mode: "ai-verdict", payload: { verdicts: { st1: "wrong", st2: "reasonable", st3: "needs-check", stX: "wrong" } } }, new Date("2026-08-24T00:00:00Z"));
const aiExtraGrade = gradeSession(aiExtra.session, problemCards.find((item) => item.id === "pa-pseudorep"), quickPath, aiCase, state.diagnosticEvidence);
check("engine: unknown AI verdict IDs rejected", aiExtraGrade.completed === false && aiExtraGrade.score === 0, `completed=${aiExtraGrade.completed}; score=${aiExtraGrade.score}`);

const dupRankSession = createDiagnosticSession("dup-rank", "pa-pseudorep", "error-localization", new Date("2026-08-24T00:00:00Z"));
const dupRank = lockSessionStep(dupRankSession, { stepId: "localization-order", kind: "layer", mode: "error-localization", payload: { order: ["statistics", "statistics", "quantification", "sample", "interpretation"] } }, new Date("2026-08-24T00:00:00Z"));
check("engine: duplicate layer ranks rejected", Boolean(dupRank.error), dupRank.error ?? "no error");
const dupRankPartial = lockSessionStep(dupRankSession, { stepId: "localization-order", kind: "layer", mode: "error-localization", payload: { order: ["statistics", "experiment", "quantification"] } }, new Date("2026-08-24T00:00:00Z"));
check("engine: incomplete layer rank list rejected", Boolean(dupRankPartial.error), dupRankPartial.error ?? "no error");

const missingCase = problemTrainingCases.find((entry) => entry.problemId === "pa-pseudorep" && entry.mode === "missing-info");
const missingSession = createDiagnosticSession("m", "pa-pseudorep", "missing-info", new Date("2026-08-24T00:00:00Z"));
let missing = missingSession;
for (const node of quickPath.nodes) {
  missing = lockSessionStep(missing, { stepId: node.id, kind: "missing-info", mode: "missing-info", payload: { nodeId: node.id, checkId: node.expectedCheckId, rationale: "区分力最强的检查" } }, new Date("2026-08-24T00:00:00Z")).session;
}
const missingGrade = gradeSession(missing, problemCards.find((item) => item.id === "pa-pseudorep"), quickPath, missingCase, state.diagnosticEvidence);
check("engine: missing-info expected checks score full", missingGrade.completed && missingGrade.score === 1, `score=${missingGrade.score}`);

const dryRun = dryRunSourcePack(demoSourcePack, emptyAtlas);
check("demo pack imports cleanly into empty registry", dryRun.inserts > 0 && dryRun.errors.length === 0, `inserts=${dryRun.inserts}; conflicts=${dryRun.conflicts.length}`);
const applied = applySourcePackImport(emptyAtlas, demoSourcePack, { allowUpdates: true });
check("demo pack applies transactionally", applied.collections.problemCards.length === 4 && applied.importRecord.result === "applied", `${applied.collections.problemCards.length} cards`);
const reDryRun = dryRunSourcePack(demoSourcePack, { ...emptyAtlas, ...applied.collections, sourcePackImports: [applied.importRecord] });
check("re-import is idempotent", reDryRun.noop === true, `noop=${reDryRun.noop}`);

const brokenPack = structuredClone(demoSourcePack);
brokenPack.packId = "broken-import-pack";
brokenPack.problemCards[0].candidateCauseIds.push("missing-cause-id");
const brokenValidation = validateSourcePack(brokenPack);
const brokenState = { ...emptyAtlas, ...applied.collections, sourcePackImports: [applied.importRecord] };
let rollbackError = null;
try {
  applySourcePackImport(brokenState, brokenPack, { allowUpdates: true });
} catch (error) {
  rollbackError = error;
}
check("broken pack rolls back without mutation", Boolean(rollbackError) && brokenState.problemCards.length === 4, rollbackError ? "threw; state unchanged" : "did not throw");

const report = {
  generatedAt: new Date().toISOString(),
  passed: errors.length === 0,
  errors,
  warnings,
  checks,
  counts: {
    cards: problemCards.length,
    trainingCases: problemTrainingCases.length,
    paths: diagnosticPaths.length,
    causes: diagnosticCauses.length,
  },
};

const markdown = `# Problem Atlas Audit

*M013 deterministic search, diagnostic engine, eight training modes and state-transition gate.*

**Result: ${report.passed ? "PASSED" : "FAILED"}** — ${errors.length} error(s), ${warnings.length} warning(s).

## Checks

| Status | Check | Detail |
|---|---|---|
${checks.map((entry) => `| ${entry.passed ? "PASS" : "FAIL"} | ${entry.name} | ${entry.detail} |`).join("\n")}

## Counts

| Entity | Count |
|---|---:|
${Object.entries(report.counts).map(([key, value]) => `| ${key} | ${value} |`).join("\n")}

## Rules enforced

- Search: Chinese/English/abbreviation/alias/keyword matching with deterministic fuzzy fallback; no LLM fallback on no match.
- Engine: step mode must match the session; allowed step kinds and legal orders per mode; sequential locks a baseline cause ranking before the first reveal and an updated ranking after every reveal (evidence-before/evidence-after history preserved); AI-verdict grading requires exactly every expected statement ID and rejects unknown IDs; error-localization requires five unique ranks; judgments lock once.
- All demo ProblemCards, paths and rubrics remain pending; registry sources stay metadata_verified.
- Import is transactional with rollback on any invalid row; idempotent per pack ID + hash.
`;

await mkdir(path.join(root, "artifacts"), { recursive: true });
await writeFile(path.join(root, "artifacts", "problem-atlas-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(root, "docs", "PROBLEM_ATLAS_AUDIT.md"), markdown);
console.log(`Problem Atlas audit ${report.passed ? "PASSED" : "FAILED"}: ${errors.length} error(s), ${warnings.length} warning(s).`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);
if (!report.passed) process.exit(1);
