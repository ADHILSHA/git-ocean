// TTFR on the production build: node e2e/perf.mjs [url] [cpuThrottle]
import { chromium } from '@playwright/test'
const [url = 'http://localhost:4173/', rate = '4'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const runs = []
for (let i = 0; i < 3; i++) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: +rate })
  await page.goto(url)
  await page.waitForFunction(() => performance.getEntriesByName('ocean:first-creatures').length > 0, null, { timeout: 15000 })
  runs.push(await page.evaluate(() => ({
    fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1),
    firstFrame: Math.round(performance.getEntriesByName('ocean:first-frame')[0].startTime),
    firstCreatures: Math.round(performance.getEntriesByName('ocean:first-creatures')[0].startTime),
  })))
  await context.close()
}
console.log(JSON.stringify({ cpuThrottle: +rate, runs }))
await browser.close()
