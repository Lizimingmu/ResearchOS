import path from "node:path";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, ".test-build");
const outputFile = path.join(outputDirectory, "pilot-viewport.mjs");
await mkdir(outputDirectory, { recursive: true });
const runtimeExternals = new Set(["jsdom", "react", "react-dom/client", "react/jsx-runtime"]);
const bundle = await rollup({
  input: path.join(root, "tests-node", "pilot-viewport.mjs"),
  external: (id) => id.startsWith("node:") || runtimeExternals.has(id),
  plugins: [nodeResolve({ browser: false }), commonjs(), json()],
});
try {
  await bundle.write({ file: outputFile, format: "es", inlineDynamicImports: true });
} finally {
  await bundle.close();
}

const result = spawnSync(process.execPath, [outputFile], { cwd: root, stdio: "inherit", windowsHide: true });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
