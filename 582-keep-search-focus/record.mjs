// Records one keyboard session against a Storybook story, with an overlay
// that shows each key and where focus is. Usage:
//   node record.mjs <storybook iframe url> <out dir> <label>
import { mkdirSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const [url, out, label] = process.argv.slice(2);
const require = createRequire(process.env.PLAYWRIGHT_FROM + '/package.json');
const { chromium } = require('playwright');

mkdirSync(out, { recursive: true });
const viewport = { width: 440, height: 720 };
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: 2,
  recordVideo: { dir: out, size: viewport },
});

await context.addInitScript((label) => {
  const describe = (el) => {
    if (!el || el === document.body) return 'nothing';
    if (el.matches('input')) {
      return `search input · caret ${el.selectionStart} · "${el.value}"`;
    }
    const name = el.getAttribute('aria-label') || el.textContent.trim();
    if (el.getAttribute('role') === 'gridcell') return `grid cell "${name}"`;
    return `${el.tagName.toLowerCase()} "${name}"`;
  };
  window.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.style.cssText =
      'position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:8px 12px;' +
      'font:13px/1.45 ui-monospace,Menlo,monospace;background:#111827;color:#f9fafb;' +
      'border-top:3px solid #6366f1;pointer-events:none;white-space:pre';
    document.body.appendChild(bar);
    let lastKey = '—';
    window.addEventListener('keydown', (e) => (lastKey = e.key === ' ' ? 'Space' : e.key), true);
    const paint = () => {
      const active = document.activeElement;
      const highlighted = document.querySelector('[data-epr-highlighted]');
      bar.textContent =
        `${label}\n` +
        `key:        ${lastKey}\n` +
        `focus:      ${describe(active)}\n` +
        `highlight:  ${highlighted ? `"${highlighted.getAttribute('aria-label')}"` : 'none'}`;
      requestAnimationFrame(paint);
    };
    paint();
  });
}, label);

const page = await context.newPage();
await page.goto(url);
await page.getByRole('gridcell').first().waitFor();
const input = page.locator('[data-epr-part="search-input"]');
await input.click();
await page.waitForTimeout(600);

let shot = 0;
const snap = async (name) => {
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, `${String(++shot).padStart(2, '0')}-${name}.png`) });
};
const press = async (key, pause = 700) => {
  await page.keyboard.press(key);
  await page.waitForTimeout(pause);
};

// 1. Search, then the arrow toward the grid.
await page.keyboard.type('ca', { delay: 220 });
await page.waitForTimeout(700);
await press('ArrowDown');
await snap('arrow-down-from-search');
// 2. Move through the results.
await press('ArrowRight');
await press('ArrowRight');
await press('ArrowDown');
await snap('moved-through-results');
// 3. Keep typing.
await page.keyboard.type('t', { delay: 220 });
await snap('kept-typing');
// 4. One row down, then pick with the keyboard.
await press('ArrowDown');
await press('Enter', 1200);
await snap('enter-selects');

const video = page.video();
await context.close();
await browser.close();
renameSync(await video.path(), join(out, 'session.webm'));
console.log(readdirSync(out).join('\n'));
