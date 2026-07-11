// Headless browser verification of /preview — shift 9.
// Drives Chromium at a phone viewport, walks every showcase view in light+dark,
// screenshots each, and reports console errors + failed network requests (broken
// sprites, 404s). This is the real browser-verification the DoD has been gated on.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.BASE || 'http://localhost:3200';
const OUT = 'scripts/shots';
mkdirSync(OUT, { recursive: true });

const VIEWS = [
  '🐉 Dragon art',
  '🥚 Onboarding',
  '🧘 Wellness',
  '✨ Wrapped',
  '👤 You screen',
  '🌬 Breathe',
  '📱 Bottom nav',
];
const SLUG = { '🐉 Dragon art':'gallery','🥚 Onboarding':'onboarding','🧘 Wellness':'wellness','✨ Wrapped':'wrapped','👤 You screen':'you','🌬 Breathe':'breathe','📱 Bottom nav':'nav' };

const failures = [];
const consoleErrs = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },      // iPhone 14-ish
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') consoleErrs.push(m.text()); });
page.on('requestfailed', (r) => failures.push(`${r.failure()?.errorText} ${r.url()}`));
page.on('response', (r) => { if (r.status() >= 400) failures.push(`HTTP ${r.status()} ${r.url()}`); });

async function shoot(theme) {
  // theme toggle: default is light; click to go dark
  for (const label of VIEWS) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await page.waitForTimeout(700); // let animations/sprites settle
    const slug = SLUG[label];
    await page.screenshot({ path: `${OUT}/${theme}-${slug}.png`, fullPage: true });
    process.stdout.write(`  shot ${theme}-${slug}\n`);
  }
}

console.log('load /preview …');
await page.goto(`${BASE}/preview`, { waitUntil: 'networkidle' });

console.log('LIGHT theme:');
await shoot('light');

console.log('DARK theme:');
await page.getByRole('button', { name: /Dark|Light/ }).first().click(); // top-bar toggle → dark
await page.waitForTimeout(300);
await shoot('dark');

await browser.close();

console.log('\n=== CONSOLE ERRORS ===');
console.log(consoleErrs.length ? [...new Set(consoleErrs)].join('\n') : '(none)');
console.log('\n=== FAILED REQUESTS ===');
console.log(failures.length ? [...new Set(failures)].join('\n') : '(none)');
console.log(`\nshots in ${OUT}/`);
