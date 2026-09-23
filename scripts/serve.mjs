import { createReadStream, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.RESEARCHOS_PORT || 1420);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json" };

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", `http://${request.headers.host}`).pathname);
  let file = path.join(root, pathname === "/" ? "index.html" : pathname);
  try {
    if (statSync(file).isDirectory()) file = path.join(file, "index.html");
  } catch { file = path.join(root, "index.html"); }
  response.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
  response.setHeader("Cache-Control", "no-store");
  createReadStream(file).on("error", () => { response.statusCode = 404; response.end("Not found"); }).pipe(response);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    process.stderr.write(`\n[ResearchOS] 端口 ${port} 已被占用 (Port ${port} is in use).\n`);
    process.stderr.write(`如果已有正在运行的实例，请直接在浏览器中访问 http://127.0.0.1:${port}\n`);
    process.stderr.write(`如需更换端口，可设置环境变量 RESEARCHOS_PORT 后重试。\n\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

server.listen(port, "127.0.0.1", () => process.stdout.write(`ResearchOS preview listening on http://127.0.0.1:${port}\n`));

