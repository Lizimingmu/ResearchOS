import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const full = process.argv.includes("--full");
const commands = [
  [process.execPath, ["scripts/validate-agent-handoff.mjs"]],
  ["npm.cmd", ["run", "typecheck"]],
  ["npm.cmd", ["test"]],
];
if (full) commands.push(
  ["npm.cmd", ["run", "content:audit"]],
  ["npm.cmd", ["run", "performance:audit"]],
  ["cargo", ["test", "--manifest-path", "src-tauri/Cargo.toml"]],
);

const results = [];
for (const [command, args] of commands) {
  const label = `${command} ${args.join(" ")}`;
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: false });
  results.push({ command: label, exitCode: result.status ?? 1 });
  if (result.status !== 0) break;
}
console.log(JSON.stringify({ mode: full ? "full" : "quick", results }, null, 2));
if (results.some((result) => result.exitCode !== 0)) process.exit(1);
