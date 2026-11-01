import http from "node:http";
import { createRequire } from "node:module";
import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const OUT = "dist";
// 👇 List every page of your site here
const ROUTES = ["/", "/about", "/projects", "/contact"];

// Catch the server as soon as it starts listening, on any port
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

// If server.js didn't call listen itself, try starting its exported app
setTimeout(() => {
  if (started) return;
  const app = mod?.app ?? mod?.default ?? mod;
  if (typeof app?.listen === "function") app.listen(0);
}, 1000);

const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error(
    "server.js never started listening and doesn't export the Express app. " +
    "Add `module.exports = app;` at the end of server.js."
  )), 10000)
);

try {
  const server = await Promise.race([listening, timeout]);
  const { address, port } = server.address();
  const host = address === "::1" ? "[::1]" : "127.0.0.1";
  const base = `http://${host}:${port}`;
  console.log("Server found at", base);

  await rm(OUT, { recursive: true, force: true });
  await cp("public", OUT, { recursive: true }); // your css/js/images folder

  for (const route of ROUTES) {
    const res = await fetch(base + route);
    if (!res.ok) throw new Error(`${route} returned ${res.status}`);
    const file = route === "/" ? "index.html" : path.join(route.slice(1), "index.html");
    await mkdir(path.dirname(path.join(OUT, file)), { recursive: true });
    await writeFile(path.join(OUT, file), await res.text());
    console.log("Rendered", route);
  }
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}