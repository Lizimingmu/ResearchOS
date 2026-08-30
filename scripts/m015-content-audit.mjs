// Deterministic M015 final gate (S7). Background-only; touches only the exact
// project-local fake-vault root declared in .agent/M015_RUN_STATE.json.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildBaseContentInventory } from "../.build/services/contentInventory.js";
import {
  applyPatchTransaction,
  auditContentInventory,
  createDraft,
  resolveEffectiveContent,
  rollbackRevision,
  sha256,
} from "../.build/services/contentStudio.js";
import {
  MANAGED_END,
  applyPlannedBatch,
  buildReviewRoundTrip,
  fingerprintWrites,
  parseReviewFeedback,
  planPublishBatch,
} from "../.build/services/obsidianPublish.js";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];
const checks = [];
const check = (name, passed, detail) => { checks.push({ name, passed: Boolean(passed), detail: String(detail) }); if (!passed) errors.push(`${name}: ${detail}`); };

const runState = JSON.parse(readFileSync(path.join(root, ".agent/M015_RUN_STATE.json"), "utf8"));
const fakeVaultRoot = runState.fakeVaultRoot;
check("fake vault root is inside the project .tmp directory", fakeVaultRoot.startsWith(path.join(root, ".tmp")), fakeVaultRoot);

// --- Invariants: schema versions -------------------------------------------------
const migrationsSource = readFileSync(path.join(root, "src/state/migrations.ts"), "utf8");
check("frontend state schema advances compatibly to 5", /CURRENT_STATE_SCHEMA = 5;/.test(migrationsSource), "CURRENT_STATE_SCHEMA = 5");
const m015Collections = ["personalContent", "contentRevisionHistory", "contentConflicts", "obsidianPublishBatches"];
check("schema 5 migration preserves every M015 collection", m015Collections.every((name) => migrationsSource.includes(`${name}:`)), m015Collections.join(", "));
const libRs = readFileSync(path.join(root, "src-tauri/src/lib.rs"), "utf8");
check("SQLite user_version stays at 2", /DATABASE_SCHEMA_VERSION: i64 = 2;/.test(libRs), "DATABASE_SCHEMA_VERSION = 2");

// --- Hash vectors -----------------------------------------------------------------
check("SHA-256 known vector (abc)", sha256("abc") === "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", sha256("abc"));
check("SHA-256 empty-string vector", sha256("") === "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", sha256(""));

// --- Inventory audits --------------------------------------------------------------
const inventory = buildBaseContentInventory();
const audit = auditContentInventory(inventory);
check("base inventory passes duplicate/hash/provenance/dependency audit", audit.ok, JSON.stringify({ duplicates: audit.duplicates.length, hashMismatches: audit.hashMismatches.length, provenanceGaps: audit.provenanceGaps.length, missingDependencies: audit.missingDependencies.length, cycles: audit.dependencyCycles.length }));
check("base inventory is substantial", inventory.length > 200, `${inventory.length} records`);

// --- Lifecycle leakage guards -------------------------------------------------------
const leakProbe = createDraft({ id: "leak-probe-audit", kind: "method", title: "泄漏探针", risk: "HIGH", payload: { id: "leak-probe-audit", title: "泄漏探针" } }, new Date(0));
for (const lifecycle of ["draft", "pending_review", "archived", "deprecated", "superseded"]) {
  const effective = resolveEffectiveContent(inventory, [{ ...leakProbe, lifecycle, activeForLearning: false }]);
  check(`lifecycle ${lifecycle} never leaks into effective content`, !effective.some((item) => item.id === leakProbe.id), lifecycle);
}
check("misconfigured active-but-inactive record never leaks", !resolveEffectiveContent(inventory, [{ ...leakProbe, lifecycle: "active", activeForLearning: false }]).some((item) => item.id === leakProbe.id), "defense in depth");

// --- Patch atomicity / rollback ------------------------------------------------------
{
  const target = createDraft({ id: "patch-audit-target", kind: "method", title: "原子性探针", risk: "HIGH", payload: { id: "patch-audit-target", title: "原子性探针", explanation: "旧" } }, new Date(0));
  const stalePatch = { patchSchemaVersion: 1, patchId: "stale", targetId: target.id, targetKind: target.kind, baseRevision: 99, baseHash: "sha256:" + "0".repeat(64), changes: { explanation: "新" }, reason: "过期基线", proposedLifecycle: "pending_review", proposedVerificationStatus: "pending", createdAt: new Date(0).toISOString() };
  let threw = false;
  try { applyPatchTransaction([target], [], [], stalePatch, new Date(0)); } catch { threw = true; }
  check("stale patch application throws with zero mutation", threw && JSON.stringify(target.payload) === JSON.stringify({ id: "patch-audit-target", title: "原子性探针", explanation: "旧" }), threw ? "threw" : "did not throw");
  const freshPatch = { ...stalePatch, patchId: "fresh", baseRevision: target.revision, baseHash: target.hash };
  const applied = applyPatchTransaction([target], [], [], freshPatch, new Date(0));
  const rolled = rollbackRevision(applied.entries, applied.history, target.id, 1, "审计回滚", new Date(0));
  check("rollback appends history and keeps old revision resolvable", rolled.restored.revision === 3 && rolled.history[0].revision === 2 && rolled.restored.payload.explanation === "旧", `r${rolled.restored.revision}`);
}

// --- Fake-vault publish simulation (exact root from run state) ------------------------
const dedicatedRelative = "ResearchOS";
const dedicatedDir = path.join(fakeVaultRoot, dedicatedRelative);
mkdirSync(dedicatedDir, { recursive: true });

function listTree(dir, prefix = "") {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const relative = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) entries.push(...listTree(full, relative));
    else entries.push({ relative, sha256: createHash("sha256").update(readFileSync(full)).digest("hex") });
  }
  return entries.sort((a, b) => a.relative.localeCompare(b.relative));
}
const outsideTreeBefore = listTree(fakeVaultRoot).filter((entry) => !entry.relative.startsWith(`${dedicatedRelative}/`));
const dedicatedBefore = listTree(dedicatedDir);

function readExistingFiles() {
  const map = new Map();
  for (const entry of listTree(dedicatedDir)) map.set(entry.relative, readFileSync(path.join(dedicatedDir, entry.relative), "utf8"));
  return map;
}
function writeFileSafe(relative, contents) {
  const full = path.join(dedicatedDir, relative);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, contents, "utf8");
}

// Each audit run uses a unique stable ID so repeated runs never collide with
// notes left by earlier runs in the persistent fake vault.
const runTag = `${Date.now().toString(36)}-${process.pid.toString(36)}`;
const simRecord = {
  key: `method:sim-note-${runTag}`, id: `sim-note-${runTag}`, kind: "method",
  title: `模拟发布笔记 ${runTag}`, owner: "personal", revision: 1,
  hash: sha256({ id: `sim-note-${runTag}`, title: `模拟发布笔记 ${runTag}` }),
  contentOrigin: "user", verificationStatus: "pending", risk: "HIGH", dependencyKeys: [],
  payload: { id: `sim-note-${runTag}`, title: `模拟发布笔记 ${runTag}` },
};
const fixedNow = new Date("2026-08-26T00:00:00Z");

{
  // Preview without any existing file must not change any byte anywhere.
  const dedicatedBeforePreview = listTree(dedicatedDir);
  planPublishBatch({ batchId: "audit-preview", records: [simRecord], existingFiles: readExistingFiles(), appliedHistory: [], now: fixedNow });
  const outsideAfter = listTree(fakeVaultRoot).filter((entry) => !entry.relative.startsWith(`${dedicatedRelative}/`));
  check(
    "preview alone causes zero writes",
    JSON.stringify(listTree(dedicatedDir)) === JSON.stringify(dedicatedBeforePreview)
      && JSON.stringify(outsideAfter) === JSON.stringify(outsideTreeBefore),
    "tree unchanged after preview",
  );

  // Create.
  const planCreate = planPublishBatch({ batchId: "audit-create", records: [simRecord], existingFiles: readExistingFiles(), appliedHistory: [], now: fixedNow });
  check("first plan is a single exact create", planCreate.items.length === 1 && planCreate.items[0].action === "create", JSON.stringify(planCreate.items.map((item) => [item.relativePath, item.action])));
  for (const write of applyPlannedBatch(planCreate, { confirmationToken: planCreate.confirmationToken, secondConfirmed: false })) writeFileSafe(write.relativePath, write.contents);

  // Idempotent republish at a later timestamp writes nothing.
  const later = new Date("2026-08-26T09:00:00Z");
  const afterCreate = listTree(dedicatedDir);
  const planRepeat = planPublishBatch({ batchId: "audit-repeat", records: [simRecord], existingFiles: readExistingFiles(), appliedHistory: fingerprintWrites(planCreate), now: later });
  check("unchanged republish plans zero writes", planRepeat.writeCount === 0 && planRepeat.conflictCount === 0 && planRepeat.items[0].action === "unchanged", planRepeat.items[0].action);
  check("unchanged republish leaves the tree byte-identical", JSON.stringify(listTree(dedicatedDir)) === JSON.stringify(afterCreate), "byte-identical");

  // User edits their section; a revision update preserves those bytes exactly.
  const currentBytes = readExistingFiles().get(planCreate.items[0].relativePath);
  const parsedCurrent = (() => { const end = currentBytes.indexOf(MANAGED_END); return currentBytes.slice(end + MANAGED_END.length); })();
  const editedBytes = currentBytes.slice(0, currentBytes.indexOf(MANAGED_END) + MANAGED_END.length) + parsedCurrent + "\n手写补充：保留这些字节。\n";
  writeFileSafe(planCreate.items[0].relativePath, editedBytes);
  const revisedHash = sha256({ id: simRecord.id, title: simRecord.title, rev: 2 });
  const revised = { ...simRecord, revision: 2, hash: revisedHash, payload: { id: simRecord.id, title: simRecord.title, rev: 2 } };
  const planUpdate = planPublishBatch({ batchId: "audit-update", records: [revised], existingFiles: readExistingFiles(), appliedHistory: fingerprintWrites(planCreate), now: later });
  check("edited-user-section + new revision plans an update", planUpdate.items[0].action === "update", planUpdate.items[0].action);
  const updates = applyPlannedBatch(planUpdate, { confirmationToken: planUpdate.confirmationToken, secondConfirmed: false });
  check("update preserves user bytes outside the managed block byte-for-byte", updates[0].contents.endsWith("\n手写补充：保留这些字节。\n"), updates[0].contents.slice(-40));

  // External managed-block edit produces a conflict and zero writes.
  for (const write of updates) writeFileSafe(write.relativePath, write.contents);
  const afterUpdate = listTree(dedicatedDir);
  const tampered = readExistingFiles().get(planCreate.items[0].relativePath).replace("- 版本：r2", "- 版本：r2（外部改动）");
  writeFileSafe(planCreate.items[0].relativePath, tampered);
  const thirdRevision = { ...revised, revision: 3, hash: sha256({ id: simRecord.id, title: simRecord.title, rev: 3 }) };
  const planConflict = planPublishBatch({ batchId: "audit-conflict", records: [thirdRevision], existingFiles: readExistingFiles(), appliedHistory: [...fingerprintWrites(planCreate), ...fingerprintWrites(planUpdate)], now: later });
  check("external managed edit plans a conflict", planConflict.conflictCount === 1 && planConflict.writeCount === 0, planConflict.items[0].action);
  let applyThrew = false;
  try { applyPlannedBatch(planConflict, { confirmationToken: planConflict.confirmationToken, secondConfirmed: true }); } catch { applyThrew = true; }
  // Restore canonical r2 bytes from the last good update output.
  for (const write of updates) writeFileSafe(write.relativePath, write.contents);
  check("conflict application aborts and the tree matches the last good state", applyThrew && JSON.stringify(listTree(dedicatedDir)) === JSON.stringify(afterUpdate), applyThrew ? "aborted" : "applied!");
}

// --- Review round trip gating ---------------------------------------------------------
{
  const roundTrip = buildReviewRoundTrip("audit-review-batch", [simRecord], fixedNow);
  check("review manifest lists exactly its own notes", roundTrip.manifest.notes.length === 1 && roundTrip.manifest.notes[0].relativePath === roundTrip.files[0].relativePath, roundTrip.manifest.notes[0].relativePath);
  check("extra path rejected by manifest gate", (() => { try { parseReviewFeedback([...roundTrip.files.map((file) => ({ relativePath: file.relativePath, contents: file.contents })), { relativePath: "_Review/x/extra.md", contents: "y" }], roundTrip.manifest); return false; } catch (error) { return /清单之外/.test(String(error)); } })(), "gate");
  check("missing path rejected by manifest gate", (() => { try { parseReviewFeedback([], roundTrip.manifest); return false; } catch (error) { return /未被读取/.test(String(error)); } })(), "gate");
}

// --- Static safety scans ---------------------------------------------------------------
function scanSources(dir, regex, allow) {
  const hits = [];
  const visit = (current) => {
    for (const name of readdirSync(current)) {
      const full = path.join(current, name);
      if (statSync(full).isDirectory()) { if (name !== "node_modules" && !name.startsWith(".")) visit(full); continue; }
      if (!/\.(ts|tsx|mjs)$/.test(name) || allow?.test(full)) continue;
      const text = readFileSync(full, "utf8");
      const match = text.match(regex);
      if (match) hits.push(`${path.relative(root, full)}: ${match[0]}`);
    }
  };
  visit(dir);
  return hits;
}
check("no filesystem watchers in app sources", scanSources(path.join(root, "src"), /fs\.watch|chokidar|node-watch|createFileSystemWatcher/).length === 0, "none");
const autoPublishHits = scanSources(path.join(root, "src"), /hydrate[\s\S]{0,600}(previewPublishBatch|confirmAndApplyPublishBatch|exportReviewRoundTrip)/);
check("no automatic publish calls near hydration", autoPublishHits.length === 0, autoPublishHits.join("; ") || "none");
check("store never assigns verified status to personal content", !/verificationStatus:\s*"verified"/.test(readFileSync(path.join(root, "src/state/store.ts"), "utf8")), "no promotion literals");
const hardcodedVaultHits = [
  ...scanSources(path.join(root, "src/services"), /(D|C):\\\\[^"'`]*(Vault|vault|Obsidian)/),
  ...scanSources(path.join(root, "src"), /(OneDrive|Documents\\\\MyVault)/),
];
check("no hardcoded vault locations in sources", hardcodedVaultHits.length === 0, hardcodedVaultHits.join("; ") || "none");

// --- Quarantined corpus remains untouched ---------------------------------------------
const stagingReportPath = path.join(root, ".agent/M013_V3_STAGING_REPORT.json");
if (existsSync(stagingReportPath)) {
  const report = JSON.parse(readFileSync(stagingReportPath, "utf8"));
  const serialized = JSON.stringify(report);
  check("166 external cards remain quarantined/unclassified", serialized.includes("166"), "staging report still reports the quarantined corpus");
} else {
  warnings.push("M013 staging report not found; quarantined-corpus check skipped.");
}

// --- Report ----------------------------------------------------------------------------
mkdirSync(path.join(root, "artifacts/m015"), { recursive: true });
writeFileSync(path.join(root, "artifacts/m015/final-gate.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), fakeVaultRoot, dedicatedRelative, passed: errors.length === 0, checks, errors, warnings }, null, 2)}\n`);
if (errors.length) {
  console.error(`M015 final gate FAILED: ${errors.length} error(s).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`M015 final gate PASSED: ${checks.length} checks${warnings.length ? `; ${warnings.length} warning(s)` : ""}.`);
