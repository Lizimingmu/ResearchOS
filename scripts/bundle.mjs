import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

function productionEnvironment() {
  return {
    name: "researchos-production-environment",
    transform(code) {
      if (!code.includes("process.env.NODE_ENV")) return null;
      return { code: code.replaceAll("process.env.NODE_ENV", '"production"'), map: null };
    },
  };
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = path.join(projectRoot, ".build");
const distRoot = path.join(projectRoot, "dist");

function cssBundle() {
  const styles = new Map();
  return {
    name: "researchos-css",
    resolveId(source, importer) {
      if (!source.endsWith(".css") || !importer) return null;
      if (!source.startsWith(".")) return null;
      let candidate = path.resolve(path.dirname(importer), source);
      if (!existsSync(candidate) && candidate.startsWith(buildRoot)) {
        candidate = path.join(projectRoot, "src", path.relative(buildRoot, candidate));
      }
      return candidate;
    },
    async load(id) {
      if (!id.endsWith(".css")) return null;
      styles.set(id, await readFile(id, "utf8"));
      return "export default undefined;";
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "assets/index.css", source: [...styles.values()].join("\n") });
    },
  };
}

export async function buildFrontend({ clean = true } = {}) {
  if (clean) await rm(distRoot, { recursive: true, force: true });
  await mkdir(path.join(distRoot, "assets"), { recursive: true });
  const bundle = await rollup({
    input: path.join(buildRoot, "main.js"),
    plugins: [productionEnvironment(), cssBundle(), nodeResolve({ browser: true }), commonjs(), json()],
    onwarn(warning, warn) {
      if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
      warn(warning);
    },
  });
  await bundle.write({
    dir: distRoot,
    entryFileNames: "assets/index.js",
    chunkFileNames: "assets/[name]-[hash].js",
    assetFileNames: "assets/[name][extname]",
    format: "es",
    sourcemap: true,
  });
  await bundle.close();

  const html = (await readFile(path.join(projectRoot, "index.html"), "utf8"))
    .replace('src="/src/boot.js"', 'src="./assets/boot.js"')
    .replace('<script type="module" src="/src/main.tsx"></script>', '<link rel="stylesheet" href="./assets/index.css" />\n    <script type="module" src="./assets/index.js"></script>');
  await writeFile(path.join(distRoot, "index.html"), html, "utf8");
  await copyFile(path.join(projectRoot, "src", "boot.js"), path.join(distRoot, "assets", "boot.js"));
  await copyFile(path.join(projectRoot, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs"), path.join(distRoot, "assets", "pdf.worker.min.mjs"));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildFrontend();
}
