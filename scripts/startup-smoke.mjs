import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM('<div id="root"><div>Opening ResearchOS…</div></div>', {
  url: "http://localhost",
  runScripts: "outside-only",
});

for (const key of [
  "window", "document", "navigator", "localStorage", "HTMLElement", "HTMLScriptElement",
  "HTMLLinkElement", "Element", "Node", "MutationObserver", "CustomEvent",
]) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
}
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);

const nodeProcess = globalThis.process;
Object.defineProperty(globalThis, "process", { value: undefined, configurable: true, writable: true });
await import(new URL(`../dist/assets/index.js?startup-smoke=${Date.now()}`, import.meta.url));
await new Promise((resolve) => setTimeout(resolve, 500));

const root = document.getElementById("root");
assert.ok(root?.querySelector(".onboarding-overlay"), "production bundle did not render onboarding");
assert.match(root.textContent, /Practice judgment, not chat prompts/);
assert.ok(localStorage.getItem("researchos-browser-state-v1"), "frontend hydration did not persist initial state");

Object.defineProperty(globalThis, "process", { value: nodeProcess, configurable: true, writable: true });
console.log("Startup smoke PASSED: production bundle rendered and hydrated without Node process or matchMedia globals.");
