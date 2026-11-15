// Flow 2 "The Drift" + Flow 3 "The Rescue": node e2e/flow23.mjs <outdir> [w] [h]
import { chromium } from '@playwright/test'
const [out = '.', w = '1440', h = '900'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: +w, height: +h }, hasTouch: +w < 700 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
const result = {}

async function clickCreature(filter) {
  await page.goto('http://localhost:5173/')
  await page.waitForTimeout(1200)
  const candidates = await page.evaluate((f) => {
    const cs = window.__ocean.getState().creatures.filter((c) => !c.fabricated && eval(f)).filter((c) => c.depthM > 250 && c.depthM < 3500)
    cs.sort((a, b) => Math.abs(a.depthM - 600) - Math.abs(b.depthM - 600))
    return cs.slice(0, 8).map((c) => ({ id: c.id, depth: c.depthM, activity: c.activity }))
  }, filter)
  // Try candidates until one is on screen at its depth (narrow screens show less of the shoal).
  for (const target of candidates) {
    await page.goto(`http://localhost:5173/?depth=${Math.round(target.depth)}`)
    await page.waitForTimeout(2500)
    const pos = await page.evaluate((id) => window.__screenOf(id), target.id)
    if (!pos || pos.x < 30 || pos.x > +w - 30 || pos.y < 100 || pos.y > +h - 120) continue
    if (+w < 700) await page.touchscreen.tap(pos.x, pos.y)
    else await page.mouse.click(pos.x, pos.y)
    await page.waitForTimeout(800)
    const sel = await page.evaluate(() => window.__ocean.getState().selectionId)
    return { target, pos, selected: sel }
  }
  return { selected: null, note: 'no candidate on screen' }
}

// Flow 2: a glowing (recently active) fish.
const drift = await clickCreature('c.activity > 0.7 && !c.netted')
result.flow2 = { ...drift, card: await page.$eval('.card .card-title', (e) => e.textContent).catch(() => null), github: await page.$eval('.card .card-btn.primary', (e) => e.getAttribute('href')).catch(() => null) }
await page.screenshot({ path: `${out}/f2-card.png` })

// Flow 3: a netted fish.
const rescue = await clickCreature('c.netted')
result.flow3 = {
  ...rescue,
  banner: await page.$eval('.net-banner', (e) => e.textContent).catch(() => null),
  github: await page.$eval('.card .card-btn.primary', (e) => e.getAttribute('href')).catch(() => null),
}
await page.screenshot({ path: `${out}/f3-card.png` })
await page.keyboard.press('Escape')
await page.waitForTimeout(200)
result.escCloses = (await page.$('.card')) === null
console.log(JSON.stringify({ ...result, errors }, null, 1))
await browser.close()
