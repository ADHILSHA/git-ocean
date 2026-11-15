// Headless visual check: node e2e/shot.mjs <url> <out.png> [waitMs] [width] [height]
import { chromium } from '@playwright/test'
const [url = 'http://localhost:5173/', out = 'shot.png', wait = '3000', w = '1440', h = '900'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu'] })
const page = await browser.newPage({ viewport: { width: +w, height: +h } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`) })
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
await page.goto(url)
await page.waitForTimeout(+wait)
const fps = await page.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else r(n) }; requestAnimationFrame(f) }))
await page.screenshot({ path: out })
console.log(JSON.stringify({ fps, errors: errors.slice(0, 15) }, null, 1))
await browser.close()
