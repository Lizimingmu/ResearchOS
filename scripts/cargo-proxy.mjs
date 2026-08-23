import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = Number(process.env.RESEARCHOS_CARGO_PROXY_PORT || 18765);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".cargo-proxy-cache");
await mkdir(root, { recursive: true });

function cachePath(url) {
  return path.join(root, createHash("sha256").update(url).digest("hex"));
}

async function fetchCached(url) {
  const target = cachePath(url);
  if (existsSync(target)) return readFile(target);
  const response = await fetch(url, { headers: { "user-agent": "ResearchOS Cargo transport bridge/0.9" } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  await writeFile(target, data);
  return data;
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
    if (requestUrl.pathname === "/index/config.json") {
      const upstream = JSON.parse((await fetchCached("https://index.crates.io/config.json")).toString("utf8"));
      const body = Buffer.from(JSON.stringify({ ...upstream, dl: `http://${host}:${port}/api/v1/crates` }));
      response.writeHead(200, { "content-type": "application/json", "content-length": body.length, etag: `"${createHash("sha1").update(body).digest("hex")}"` });
      response.end(body);
      return;
    }
    if (requestUrl.pathname.startsWith("/index/")) {
      const relative = requestUrl.pathname.slice("/index/".length);
      const data = await fetchCached(`https://index.crates.io/${relative}`);
      response.writeHead(200, { "content-type": "text/plain", "content-length": data.length, etag: `"${createHash("sha1").update(data).digest("hex")}"` });
      response.end(data);
      return;
    }
    const match = requestUrl.pathname.match(/^\/api\/v1\/crates\/([^/]+)\/([^/]+)\/download$/);
    if (match) {
      const [, crate, version] = match;
      const url = `https://static.crates.io/crates/${crate}/${crate}-${version}.crate`;
      const target = cachePath(url);
      if (!existsSync(target)) await fetchCached(url);
      const size = (await import("node:fs/promises")).stat(target).then((value) => value.size);
      response.writeHead(200, { "content-type": "application/gzip", "content-length": await size });
      createReadStream(target).pipe(response);
      return;
    }
    response.writeHead(404).end("Not found");
  } catch (error) {
    response.writeHead(502, { "content-type": "text/plain" }).end(String(error));
  }
});

server.listen(port, host, () => process.stdout.write(`Cargo TLS bridge listening on http://${host}:${port}/index/\n`));

