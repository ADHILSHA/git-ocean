// Permalink parity: node e2e/flow6.mjs <outdir> [path]
import { chromium } from '@playwright/test'
const [out = '.', path = '/dive/facebook/react'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5173' + path)
const samples = []
const t0 = Date.now()
let arrivedAt = null
while (Date.now() - t0 < 6000) {
  samples.push(`${Date.now() - t0}ms:${await page.$eval('.compass-num', (e) => e.textContent).catch(() => '?')}`)
  if (!arrivedAt && (await page.evaluate(() => window.__ocean?.getState().camera.mode)) === 'arrived') arrivedAt = Date.now() - t0
  await page.waitForTimeout(200)
}
await page.screenshot({ path: `${out}/f6-arrived.png` })
const s = await page.evaluate(() => { const s = window.__ocean.getState(); return { target: s.camera.targetId, selection: s.selectionId, title: document.title, card: document.querySelector('.card-title')?.textContent } })
console.log(JSON.stringify({ path, arrivedAt, ...s, samples: samples.filter((_, i) => i % 3 === 0), errors }, null, 1))
await browser.close()
