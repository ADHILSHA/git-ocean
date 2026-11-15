// Reduced motion + keyboard-only + axe: node e2e/a11y.mjs <outdir>
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const [out = '.'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
const r = {}
await page.goto('http://localhost:5173/')
await page.waitForTimeout(1500)
const d1 = await page.$eval('.compass-num', (e) => e.textContent)
await page.waitForTimeout(1500)
r.reducedMotionHoldsStill = d1 === (await page.$eval('.compass-num', (e) => e.textContent))

// Flow 1 by keyboard: "/" focuses search, type, Enter. Reduced motion cuts straight to the creature.
await page.keyboard.press('/')
await page.keyboard.type('rails')
await page.keyboard.press('Enter')
await page.waitForTimeout(600)
r.flow1 = await page.evaluate(() => ({ mode: window.__ocean.getState().camera.mode, sel: window.__ocean.getState().selectionId, url: location.pathname }))
r.flow1.card = await page.$eval('.card-title', (e) => e.textContent).catch(() => null)
await page.screenshot({ path: `${out}/rm-flow1.png` })
await page.keyboard.press('Escape')

// Flow 2/3 by keyboard via the Logbook list.
await page.goto('http://localhost:5173/?depth=600')
await page.waitForTimeout(1200)
await page.focus('.logbook-toggle')
await page.keyboard.press('Enter')
await page.waitForTimeout(300)
const buttons = await page.$$eval('.nearby button', (bs) => bs.map((b) => b.getAttribute('aria-label')))
r.listCount = buttons.length
const netIdx = buttons.findIndex((b) => b.includes('caught in a net'))
await page.keyboard.press('Tab') // first nearby item
for (let i = 0; i < netIdx; i++) await page.keyboard.press('Tab')
await page.keyboard.press('Enter')
await page.waitForTimeout(400)
r.flow3 = {
  focused: await page.evaluate(() => document.activeElement?.id),
  banner: await page.$eval('.net-banner', (e) => e.textContent).catch(() => null),
  link: await page.$eval('.card .card-btn.primary', (e) => e.getAttribute('href')).catch(() => null),
}
await page.screenshot({ path: `${out}/rm-flow3.png` })
const axe = await new AxeBuilder({ page }).exclude('canvas').analyze()
r.axe = axe.violations.map((v) => `${v.impact} ${v.id}: ${v.nodes.length} (${v.nodes[0]?.target})`)
console.log(JSON.stringify({ ...r, errors }, null, 1))
await browser.close()
