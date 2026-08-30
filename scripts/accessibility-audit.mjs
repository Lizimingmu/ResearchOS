import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";

const root = path.resolve(import.meta.dirname, "..");
const checks = [];
const record = (name, passed, detail) => checks.push({ name, passed: Boolean(passed), detail });
const html = await readFile(path.join(root, "index.html"), "utf8");
const css = await readFile(path.join(root, "src", "styles", "app.css"), "utf8");

record("Document language", /<html\s+lang="zh-CN"/.test(html), "The Chinese-first shell declares zh-CN.");
record("Viewport scaling", /width=device-width, initial-scale=1\.0/.test(html), "The viewport does not disable user zoom.");
record("Visible keyboard focus", css.lastIndexOf(":focus-visible") > Math.max(css.lastIndexOf("outline: 0"), css.lastIndexOf("outline:none")), "The final focus-visible rule overrides component reset rules.");
record("Reduced-motion support", css.includes("prefers-reduced-motion: reduce"), "Motion-sensitive users receive the reduced-motion override.");

const dom = new JSDOM('<div id="root"><div>正在打开 ResearchOS…</div></div>', { url: "http://localhost", runScripts: "outside-only" });
for (const key of ["window", "document", "navigator", "localStorage", "HTMLElement", "HTMLScriptElement", "HTMLLinkElement", "Element", "Node", "MutationObserver", "CustomEvent"]) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
}
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
const nodeProcess = globalThis.process;
Object.defineProperty(globalThis, "process", { value: undefined, configurable: true, writable: true });
await import(new URL(`../dist/assets/index.js?accessibility-audit=${Date.now()}`, import.meta.url));
await new Promise((resolve) => setTimeout(resolve, 500));
Object.defineProperty(globalThis, "process", { value: nodeProcess, configurable: true, writable: true });

const appRoot = document.getElementById("root");
const dialog = appRoot?.querySelector('[role="dialog"][aria-modal="true"]');
record("Onboarding dialog semantics", dialog, "The blocking onboarding surface identifies itself as a modal dialog.");
const labelledBy = dialog?.getAttribute("aria-labelledby");
record("Dialog accessible name", labelledBy && document.getElementById(labelledBy), "The modal heading is referenced by aria-labelledby.");
const progress = dialog?.querySelector('[role="progressbar"]');
record("Onboarding progress semantics", progress?.getAttribute("aria-valuenow") === "1" && progress?.getAttribute("aria-valuemax") === "5", "The five-step progress indicator exposes its current value.");
record("Single primary heading", dialog?.querySelectorAll("h1").length === 1, "The current onboarding step has one h1.");

const buttons = [...(appRoot?.querySelectorAll("button") ?? [])];
const unnamedButtons = buttons.filter((button) => !(button.getAttribute("aria-label") || button.textContent?.trim() || button.getAttribute("title")));
record("Named buttons", unnamedButtons.length === 0, `${buttons.length} rendered buttons checked; ${unnamedButtons.length} unnamed.`);
const choiceButtons = [...(dialog?.querySelectorAll(".choice-grid button") ?? [])];
record("Choice state announced", choiceButtons.length > 0 && choiceButtons.every((button) => button.hasAttribute("aria-pressed")), `${choiceButtons.length} selectable choices expose aria-pressed.`);
const brokenLabels = [...(appRoot?.querySelectorAll("[aria-labelledby]") ?? [])].filter((element) => !document.getElementById(element.getAttribute("aria-labelledby")));
record("ARIA references resolve", brokenLabels.length === 0, `${brokenLabels.length} unresolved aria-labelledby references.`);

const passed = checks.every((check) => check.passed);
const report = { schemaVersion: 1, auditedAt: "2026-08-31", scope: "production onboarding plus global keyboard and motion contracts", passed, checks };
await writeFile(path.join(root, "artifacts", "accessibility-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
const rows = checks.map((check) => `| ${check.passed ? "PASS" : "FAIL"} | ${check.name} | ${check.detail} |`).join("\n");
await writeFile(path.join(root, "docs", "ACCESSIBILITY_AUDIT.md"), `# ResearchOS Accessibility Audit\n\nThis deterministic gate covers the production onboarding DOM and global keyboard/motion contracts. Foreground keyboard traversal, zoom, multi-DPI and contrast inspection are recorded separately in the UX audit.\n\n| Status | Check | Evidence |\n|---|---|---|\n${rows}\n\nOverall: **${passed ? "PASS" : "FAIL"}**.\n`, "utf8");
console.log(`Accessibility audit ${passed ? "PASSED" : "FAILED"}: ${checks.filter((check) => check.passed).length}/${checks.length} checks.`);
if (!passed) process.exitCode = 1;
