import { spawn } from "node:child_process";
import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import path from "node:path";

const PORT = 4321;
const OUT = "dist";
// 👇 List every page of your site here
const ROUTES = ["/", "/about", "/projects", "/contact"];

const server = spawn("node", ["server.js"], {
  env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
  stdio: "inherit",
});

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { await fetch(`http://localhost:${PORT}/`); return; }
    catch { await new Promise(r => setTimeout(r, 200)); }
  }
  throw new Error("server.js did not start");
}

try {
  await waitForServer();
  await rm(OUT, { recursive: true, force: true });
  await cp("public", OUT, { recursive: true }); // your css/js/images folder

  for (const route of ROUTES) {
    const res = await fetch(`http://localhost:${PORT}${route}`);
    if (!res.ok) throw new Error(`${route} returned ${res.status}`);
    const file = route === "/" ? "index.html" : path.join(route.slice(1), "index.html");
    await mkdir(path.dirname(path.join(OUT, file)), { recursive: true });
    await writeFile(path.join(OUT, file), await res.text());
    console.log("Rendered", route);
  }
} finally {
  server.kill();
}