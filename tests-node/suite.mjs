import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { auditCases } from "../.build/data/auditCases.js";
import { evidenceSources } from "../.build/data/evidence.js";
import { judgmentCards } from "../.build/data/judgmentCards.js";
import { methodConcepts, usableMethodConcepts } from "../.build/data/methods.js";
import { researchPatterns } from "../.build/data/patterns.js";
import { starterTrack } from "../.build/data/starterTrack.js";
import { TodayView } from "../.build/features/today/TodayView.js";
import { LibraryView, paperFromPath } from "../.build/features/library/LibraryView.js";
import { calculatePriority, generateTodayTasks } from "../.build/learning/scheduler.js";
import { createReviewItem, scheduleReview } from "../.build/learning/review.js";
import { summarizeSkills } from "../.build/learning/scoring.js";
import { createInitialState, useAppStore } from "../.build/state/store.js";

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.get(key) ?? null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}
globalThis.localStorage = new MemoryStorage();
globalThis.window = { localStorage: globalThis.localStorage };

test("unit: starter content meets required counts and provenance fields", () => {
  assert.equal(researchPatterns.length, 18);
  assert.ok(usableMethodConcepts.length >= 30);
  assert.ok(methodConcepts.length >= 40);
  assert.equal(judgmentCards.length, 30);
  assert.equal(auditCases.length, 15);
  assert.equal(starterTrack.length, 7);
  for (const source of evidenceSources) {
    assert.ok(source.title && source.sourceName && source.sourceType && source.coreEvidence);
    assert.ok(source.doi || source.pmid || source.url);
    assert.ok(["verified", "pending", "rejected", "not_required"].includes(source.verificationStatus));
  }
});

test("unit: scheduler implements the specified weighted priority", () => {
  assert.equal(calculatePriority({ weakness: 1, projectRelevance: 0, frontierValue: 0, reviewDue: 0 }), 0.35);
  assert.equal(calculatePriority({ weakness: 0, projectRelevance: 1, frontierValue: 0, reviewDue: 0 }), 0.30);
  assert.equal(calculatePriority({ weakness: 0, projectRelevance: 0, frontierValue: 1, reviewDue: 0 }), 0.20);
  assert.equal(calculatePriority({ weakness: 0, projectRelevance: 0, frontierValue: 0, reviewDue: 1 }), 0.15);
});

test("unit: wrong plus high confidence becomes a dangerous next-day review", () => {
  const now = new Date("2026-08-24T00:00:00Z");
  const item = createReviewItem("r1", "statistical-unit", "method", "Identify the unit", now);
  item.stability = 6;
  const result = scheduleReview(item, 0, 4, now);
  assert.equal(result.quality, "wrong-high");
  assert.equal(result.intervalDays, 1);
  assert.equal(result.item.dangerousMisconception, true);
  assert.ok(result.item.difficulty > item.difficulty);
  assert.equal(result.item.lapses, 1);
});

test("unit: correct delayed retrieval expands stability", () => {
  const now = new Date("2026-08-24T00:00:00Z");
  const item = createReviewItem("r2", "cox-ph", "method", "Interpret an HR", now);
  item.stability = 3;
  const result = scheduleReview(item, 1, 3, now);
  assert.ok(result.item.stability > 3);
  assert.ok(result.intervalDays >= 2);
  assert.equal(result.item.dangerousMisconception, false);
});

test("unit: skill score is withheld when evidence is insufficient", () => {
  const summaries = summarizeSkills([{ id: "e1", skillId: "methods", taskId: "cox", score: 1, delayed: false, blindTransfer: false, confidence: 4, createdAt: "2026-08-24T00:00:00Z" }]);
  const methods = summaries.find((row) => row.id === "methods");
  assert.equal(methods.score, null);
  assert.equal(methods.band, "insufficient evidence");
});

test("integration: Today generates one 30–45 minute deliberate-practice queue", () => {
  const state = createInitialState();
  const tasks = generateTodayTasks(state, new Date("2026-08-24T08:00:00Z"));
  assert.equal(tasks.length, 5);
  assert.deepEqual(tasks.map((task) => task.type), ["retrieval", "paper", "method", "audit", "transfer"]);
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  assert.ok(minutes >= 30 && minutes <= 45, `queue was ${minutes} minutes`);
});

test("integration: submitted responses are immutable snapshots and create review items", () => {
  useAppStore.getState().resetDemo();
  const before = useAppStore.getState().responses.length;
  const response = useAppStore.getState().submitResponse({ taskId: "integration-task", userText: "Patient is the independent unit; cells are nested measurements.", confidence: 4 });
  useAppStore.getState().ensureReview("integration-concept", "method", "Identify the independent unit");
  assert.equal(useAppStore.getState().responses.length, before + 1);
  assert.equal(response.locked, true);
  assert.equal(useAppStore.getState().responses[0].userText, "Patient is the independent unit; cells are nested measurements.");
  assert.ok(useAppStore.getState().reviewItems.some((item) => item.conceptId === "integration-concept"));
});

test("integration: project creation and settings survive browser persistence gateway", async () => {
  useAppStore.getState().resetDemo();
  useAppStore.getState().addProject({ id: "p-integration", name: "MTC cohort", disease: "MTC", studyType: "retrospective", cohort: "n=200", omics: "RNA-seq", outcome: "OS", currentStage: "Analysis", scientificQuestion: "Which factors predict survival?", bottleneck: "validation", activeMethods: "Cox", targetJournal: "JCO", notes: "", createdAt: new Date().toISOString() });
  useAppStore.getState().updateSettings({ dailyMinutes: 35 });
  await useAppStore.getState().persistNow();
  const raw = JSON.parse(globalThis.localStorage.getItem("researchos-browser-state-v1"));
  assert.equal(raw.projects[0].name, "MTC cohort");
  assert.equal(raw.settings.dailyMinutes, 35);
});

test("integration: Today component is a desktop queue and contains no chat-first prompt", () => {
  useAppStore.setState({ ...createInitialState(), hydrated: true });
  const html = renderToStaticMarkup(createElement(TodayView));
  assert.match(html, /Deliberate practice queue/);
  assert.match(html, /RETRIEVAL/);
  assert.doesNotMatch(html, /Ask ResearchOS anything/i);
  assert.doesNotMatch(html, /welcome back/i);
});

test("integration: generated content cannot masquerade as verified seed content", () => {
  const generated = { contentOrigin: "ai_generated", verificationStatus: "pending" };
  assert.equal(generated.verificationStatus, "pending");
  assert.ok(evidenceSources.every((source) => source.contentOrigin !== "ai_generated" || source.verificationStatus !== "verified"));
});

test("integration: PDF import creates a pending local paper visible in Library", async () => {
  useAppStore.getState().resetDemo();
  const paper = paperFromPath("D:\\papers\\imported_local_methods-paper.pdf", new Date("2026-08-24T00:00:00Z"));
  paper.id = "paper-import-test";
  useAppStore.getState().addPaper(paper);
  await useAppStore.getState().persistNow();
  const imported = useAppStore.getState().papers.find((paper) => paper.id === "paper-import-test");
  assert.equal(imported?.pdfPath, "D:\\papers\\imported_local_methods-paper.pdf");
  assert.equal(imported?.title, "imported local methods paper");
  assert.equal(imported?.verificationStatus, "pending");
  const html = renderToStaticMarkup(createElement(LibraryView));
  assert.match(html, /Import PDF/);
});

test("integration: provider configuration persists without an API key field", async () => {
  useAppStore.getState().resetDemo();
  useAppStore.getState().updateProvider("custom", { baseUrl: "https://provider.example/v1", model: "review-model", temperature: 0.1, maxTokens: 900 });
  useAppStore.getState().updateSettings({ activeProviderId: "custom", offlineMode: true });
  await useAppStore.getState().persistNow();
  const raw = JSON.parse(globalThis.localStorage.getItem("researchos-browser-state-v1"));
  const provider = raw.providers.find((entry) => entry.id === "custom");
  assert.equal(provider.baseUrl, "https://provider.example/v1");
  assert.equal(provider.model, "review-model");
  assert.equal(raw.settings.offlineMode, true);
  assert.equal(Object.hasOwn(provider, "apiKey"), false);
});
