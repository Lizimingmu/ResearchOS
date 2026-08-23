import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, ".test-build");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const bundle = await rollup({
  input: path.join(root, "tests-node", "suite.mjs"),
  external: (id) => id.startsWith("node:"),
  plugins: [nodeResolve({ browser: false }), commonjs(), json()],
});
await bundle.write({ file: path.join(output, "suite.mjs"), format: "es", sourcemap: true });
await bundle.close();

