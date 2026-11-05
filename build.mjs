import http from "node:http";
import { createRequire } from "node:module";
import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const OUT = "dist";

let gotServer;
const listening = new Promise((r) => (gotServer = r));
let started = false;
const origListen = http.Server.prototype.listen;
http.Server.prototype.listen = function (...args) {
  started = true;
  this.once("listening", () => gotServer(this));
  return origListen.apply(this, args);
};

process.env.PORT ||= "4321";
const mod = require("./server.js");

setTimeout(() => {
  if (started) return;
  const app = mod?.app ?? mod?.default ?? mod;
  if (typeof app?.listen === "function") app.listen(0);
}, 1000);

const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("server.js never started listening")), 10000)
);

try {
  const server = await Promise.race([listening, timeout]);
  const { address, port } = server.address();
  const host = address === "::1" ? "[::1]" : "127.0.0.1";
  const base = `http://${host}:${port}`;

  await rm(OUT, { recursive: true, force: true });
  await cp("public", OUT, { recursive: true });

  // Start at "/" and follow every internal page link
  const queue = ["/"];
  const seen = new Set();

  while (queue.length) {
    const route = queue.shift();
    if (seen.has(route)) continue;
    seen.add(route);

    const res = await fetch(base + route);
    if (!res.ok) {
      if (route === "/") throw new Error(`Home page returned ${res.status}`);
      console.warn(`Skipped ${route} (${res.status})`);
      continue;
    }
    if (!(res.headers.get("content-type") || "").includes("text/html")) continue;

    const html = await res.text();
    const file = route === "/" ? "index.html" : path.join(route.slice(1), "index.html");
    await mkdir(path.dirname(path.join(OUT, file)), { recursive: true });
    await writeFile(path.join(OUT, file), html);
    console.log("Rendered", route);

    // Find links like href="/projects" (ignore files like /style.css)
    for (const [, link] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const clean = link.length > 1 ? link.replace(/\/$/, "") : link;
      if (!path.extname(clean) && !seen.has(clean)) queue.push(clean);
    }
  }

  // Feeds are not linked as pages, so fetch them explicitly
  for (const route of ["/sitemap.xml", "/rss.xml"]) {
    const res = await fetch(base + route);
    if (!res.ok) throw new Error(`${route} returned ${res.status}`);
    await writeFile(path.join(OUT, route.slice(1)), await res.text());
    console.log("Rendered", route);
  }

  console.log(`Done: ${seen.size} page(s) checked`);
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}