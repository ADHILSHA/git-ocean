// Flow 1 "The Dive": node e2e/flow1.mjs <outdir> [term] [width] [height]
import { chromium } from '@playwright/test'
const [out = '.', term = 'react', w = '1440', h = '900'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: +w, height: +h } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto('http://localhost:5173/')
await page.waitForTimeout(2000)
const depth = () => page.$eval('.compass-num', (e) => e.textContent)
const start = await depth()
await page.screenshot({ path: `${out}/f1-0-landing.png` })
await page.fill('#repo-search', term)
await page.keyboard.press('Enter')
const samples = []
const t0 = Date.now()
let arrivedAt = null
while (Date.now() - t0 < 6000) {
  samples.push(`${Date.now() - t0}ms:${await depth()}`)
  const mode = await page.evaluate(() => window.__ocean.getState().camera.mode)
  if (mode === 'arrived' && !arrivedAt) arrivedAt = Date.now() - t0
  await page.waitForTimeout(150)
}
await page.screenshot({ path: `${out}/f1-1-arrived.png` })
const state = await page.evaluate(() => { const s = window.__ocean.getState(); return { mode: s.camera.mode, target: s.camera.targetId, selection: s.selectionId, species: s.speciesDiscovered } })
console.log(JSON.stringify({ start, url: page.url(), arrivedAt, state, samples: samples.filter((_, i) => i % 3 === 0), errors }, null, 1))
await browser.close()
