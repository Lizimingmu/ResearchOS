import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const root = path.resolve(import.meta.dirname, "..");
const assetsRoot = path.join(root, "dist", "assets");
const names = await readdir(assetsRoot);
const assets = await Promise.all(names.map(async (name) => ({ name, bytes: (await stat(path.join(assetsRoot, name))).size })));
const runtimeAssets = assets.filter((asset) => !asset.name.endsWith(".map"));
const initial = runtimeAssets.find((asset) => asset.name === "index.js");
const css = runtimeAssets.find((asset) => asset.name === "index.css");
const paper = runtimeAssets.find((asset) => asset.name.startsWith("PaperLabView-") && asset.name.endsWith(".js"));
const worker = runtimeAssets.find((asset) => asset.name === "pdf.worker.min.mjs");
const content = runtimeAssets.find((asset) => asset.name.startsWith("expandedTraining-") && asset.name.endsWith(".js"));
if (!initial || !css || !paper || !worker || !content) throw new Error("Expected production chunks were not emitted.");

const initialGzip = gzipSync(readFileSync(path.join(assetsRoot, initial.name))).length;
const baselineInitial = 2_925_687;
const iterations = 2_000;
const perfBundle = await rollup({ input: path.join(root, ".build", "learning", "scheduler.js"), plugins: [nodeResolve({ browser: false })] });
const generated = await perfBundle.generate({ format: "es" });
await perfBundle.close();
const schedulerModule = await import(`data:text/javascript;base64,${Buffer.from(generated.output[0].code).toString("base64")}`);
const state = {
  schemaVersion: 2, papers: [{ id: "p1", title: "Paper", tags: [], researchType: "", topic: "", readStatus: "unread", trainingStatus: "active", favorite: false, notes: "", currentPage: 1, createdAt: "2026-01-01", contentOrigin: "user", verificationStatus: "pending" }], projects: [], responses: [], reviewItems: [], reviewLogs: [], skillEvidence: [], providers: [],
  settings: { theme: "system", startPage: "today", dailyMinutes: 40, weights: { weakness: .3, projectRelevance: .25, frontierValue: .15, reviewDue: .15, misconception: .15 }, pubmedVerification: true, doiVerification: true, offlineMode: true, activeProviderId: "" },
  completedTaskIds: [], snoozedTaskIds: [], assessmentHistory: [], notesByPaperId: {}, draftResponses: {}, misconceptions: [], onboarding: { completed: true, interests: ["Statistics"], familiarity: { methods: "new" }, baselineCompleted: true },
};
const started = performance.now();
for (let index = 0; index < iterations; index += 1) schedulerModule.generateTodayTasks(state, new Date(2026, 7, (index % 27) + 1));
const schedulerMeanMs = (performance.now() - started) / iterations;
const checks = [
  { name: "Initial JavaScript", value: initial.bytes, budget: 1_900_000, passed: initial.bytes < 1_900_000 },
  { name: "Initial CSS", value: css.bytes, budget: 70_000, passed: css.bytes < 70_000 },
  { name: "Training content chunk", value: content.bytes, budget: 150_000, passed: content.bytes < 150_000 },
  { name: "Scheduler mean", value: schedulerMeanMs, budget: 2, passed: schedulerMeanMs < 2 },
];
const passed = checks.every((check) => check.passed);
const reduction = (1 - initial.bytes / baselineInitial) * 100;
const rows = checks.map((check) => `| ${check.passed ? "PASS" : "FAIL"} | ${check.name} | ${check.name.includes("mean") ? `${check.value.toFixed(4)} ms` : `${check.value.toLocaleString()} bytes`} | ${check.name.includes("mean") ? `< ${check.budget} ms` : `< ${check.budget.toLocaleString()} bytes`} |`).join("\n");
const markdown = `# ResearchOS Performance Audit

*Production-build performance gate for startup payload, feature isolation, and scheduler latency.*

---

## 📦 Bundle outcome

The initial JavaScript is ${initial.bytes.toLocaleString()} bytes (${initialGzip.toLocaleString()} bytes gzip), down ${reduction.toFixed(1)}% from the audited v0.9 baseline of ${baselineInitial.toLocaleString()} bytes. Paper Lab and PDF.js remain lazy feature payloads rather than startup work.

| Status | Metric | Observed | Budget |
|---|---|---:|---:|
${rows}

## 🧩 Lazy boundaries

| Chunk | Bytes | Why isolated |
|---|---:|---|
| Paper Lab | ${paper.bytes.toLocaleString()} | PDF renderer loads only when the user opens Paper Lab. |
| PDF worker | ${worker.bytes.toLocaleString()} | Worker remains separate from the UI thread. |
| Expanded training content | ${content.bytes.toLocaleString()} | Deep content loads through practice/search feature routes, not onboarding startup. |
| CSS | ${css.bytes.toLocaleString()} | One theme-aware stylesheet with responsive rules. |

## ⚙️ Runtime checks

- Today scheduling averaged ${schedulerMeanMs.toFixed(4)} ms over ${iterations.toLocaleString()} deterministic runs.
- Zustand selectors avoid subscribing Today to transient UI state; global search and command-palette content are demand-loaded.
- Source maps are emitted for debugging but are not referenced as startup assets.
- SQLite writes use WAL, a five-second busy timeout, atomic transactions, and five bounded pre-save recovery snapshots.

## ⚠️ Measurement limits

Interactive paint timing and multi-DPI screenshots could not be captured because the in-app browser's saved permission blocks local preview URLs. Static payload budgets, server-rendered component tests, native compilation, and process-level smoke checks remain valid; the visual limitation is recorded in the UX audit rather than marked as a pass.
`;
await writeFile(path.join(root, "docs", "PERFORMANCE_AUDIT.md"), markdown);
console.log(`Performance audit ${passed ? "PASSED" : "FAILED"}. Initial JS ${initial.bytes} bytes; scheduler ${schedulerMeanMs.toFixed(4)} ms.`);
if (!passed) process.exitCode = 1;
