import path from "node:path";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const allowed = new Set([
  "assessment-materialization-audit.mjs",
  "assessment-ambiguity-audit.mjs",
  "blind-solvability-audit.mjs",
  "content-fill-checkpoint-audit.mjs",
  "freeze-blind-assessment-packet.mjs",
  "freeze-strict-blind-assessment-packet.mjs",
  "freeze-m019-1-content.mjs",
  "generated-lifecycle-audit.mjs",
  "guide-materialization-audit.mjs",
  "guide-template-audit.mjs",
  "guide-source-linkage-audit.mjs",
  "m019-1-readiness-audit.mjs",
  "strict-blind-packet-audit.mjs",
]);
const scriptName = process.argv[2];
if (!allowed.has(scriptName)) throw new Error(`Unsupported M019.1 script: ${scriptName ?? "<missing>"}`);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, ".audit-build", "m019-1");
const outputFile = path.join(outputDir, scriptName);
await mkdir(outputDir, { recursive: true });
const bundle = await rollup({
  input: path.join(root, "scripts", scriptName),
  external: (id) => id.startsWith("node:"),
  plugins: [nodeResolve({ browser: false }), commonjs(), json()],
});
await bundle.write({ file: outputFile, format: "es", sourcemap: false, inlineDynamicImports: true });
await bundle.close();
await import(`${pathToFileURL(outputFile).href}?run=${Date.now()}`);
