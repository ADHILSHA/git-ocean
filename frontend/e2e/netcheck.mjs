import { chromium } from '@playwright/test'
const out = process.argv[2]
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5173/')
await page.waitForTimeout(1500)
const d = await page.evaluate(() => { const c = window.__ocean.getState().creatures.filter((c) => c.netted).sort((a, b) => b.size - a.size)[3]; return { depth: c.depthM, id: c.id, size: c.size } })
console.log(d)
await page.goto('http://localhost:5173/?depth=' + Math.round(d.depth))
await page.waitForTimeout(2500)
await page.screenshot({ path: out })
await browser.close()
