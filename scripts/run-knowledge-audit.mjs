import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".audit-build", "knowledge");
await mkdir(output, { recursive: true });
const bundle = await rollup({
  input: path.join(root, "scripts", "knowledge-audit.mjs"),
  external: (id) => id.startsWith("node:"),
  plugins: [nodeResolve({ browser: false }), commonjs(), json()],
});
const file = path.join(output, "audit.mjs");
await bundle.write({ file, format: "es", inlineDynamicImports: true });
await bundle.close();
await import(pathToFileURL(file).href);
