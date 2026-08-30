import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, ".audit-build");
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
const outputFile = path.join(outputDir, "curriculum-audit.mjs");
const bundle = await rollup({ input: path.join(root, "scripts", "curriculum-audit.mjs"), external: (id) => id.startsWith("node:"), plugins: [nodeResolve({ browser: false }), commonjs(), json()] });
await bundle.write({ file: outputFile, format: "es", sourcemap: false, inlineDynamicImports: true });
await bundle.close();
await import(pathToFileURL(outputFile).href);
