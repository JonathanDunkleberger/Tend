// render-shot.mjs — screenshot the file:// self-contained HTML built by build-static-html.
// See scripts/README.md. Runs a headless Chromium over LOCAL FILES ONLY (this sandbox
// blocks all browser HTTP egress — loopback and external — so live-server screenshots are
// impossible here; file:// is the only path that renders). Server components (the landing)
// render fully from their SSR HTML; client components render only their pre-hydration markup.
import { chromium } from "playwright";

const REPO = process.env.REPO || "G:/JonnyD/Tend";
const pages = process.argv.slice(2);
if (!pages.length) pages.push("landing", "preview");

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errs = [], fails = [];
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
p.on("requestfailed", (r) => { const u = r.url(); if (!u.startsWith("data:")) fails.push(`${r.failure()?.errorText} ${u}`); });

for (const name of pages) {
  await p.goto(`file:///${REPO}/scripts/rendered/${name}.html`, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  const h = await p.evaluate(() => document.body.scrollHeight);
  await p.screenshot({ path: `${REPO}/scripts/shots/${name}-full.png`, fullPage: true });
  await p.screenshot({ path: `${REPO}/scripts/shots/${name}-fold.png` });
  console.log(`${name}: height=${h}px`);
}
await b.close();
console.log("FAILS:", [...new Set(fails)].slice(0, 15).join(" | ") || "(none)");
console.log("ERRS:", [...new Set(errs)].slice(0, 8).join(" | ") || "(none)");
