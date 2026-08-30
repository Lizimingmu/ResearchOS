import { spawn } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildFrontend } from "./bundle.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let building = false;
let pending = false;

async function compile() {
  if (building) { pending = true; return; }
  building = true;
  const tsc = spawn(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", path.join(root, "tsconfig.build.json")], { stdio: "inherit" });
  const code = await new Promise((resolve) => tsc.on("exit", resolve));
  if (code === 0) {
    await buildFrontend();
    process.stdout.write("ResearchOS rebuilt.\n");
  }
  building = false;
  if (pending) { pending = false; void compile(); }
}

await compile();
await import("./serve.mjs");
watch(path.join(root, "src"), { recursive: true }, () => void compile());

