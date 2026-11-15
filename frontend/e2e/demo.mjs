// Records the README demo as timed frames via Chrome's screencast (no Playwright ffmpeg needed).
// node e2e/demo.mjs <framesDir>   then encode with ffmpeg (see docs/TESTING.md)
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
const [out = './frames'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const size = { width: 1200, height: 750 }
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: size })
await page.goto('http://localhost:5173/')
await page.waitForTimeout(1200)

const cdp = await page.context().newCDPSession(page)
const frames = []
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  frames.push({ data, t: metadata.timestamp })
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
})
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: size.width, maxHeight: size.height, everyNthFrame: 1 })

await page.waitForTimeout(2400) // drift in the shallows
for (let i = 0; i <= 30; i++) await page.mouse.move(200 + i * 27, 300 + Math.sin(i / 4) * 120, { steps: 2 })
await page.waitForTimeout(500)
await page.click('#repo-search')
await page.keyboard.type('react', { delay: 140 })
await page.waitForTimeout(400)
await page.keyboard.press('Enter')
await page.waitForTimeout(5200) // plunge, arrival, card

await cdp.send('Page.stopScreencast')
// ffconcat list with real frame durations, so the GIF plays at true speed.
let list = 'ffconcat version 1.0\n'
frames.forEach((f, i) => {
  const name = `f${String(i).padStart(5, '0')}.jpg`
  writeFileSync(`${out}/${name}`, Buffer.from(f.data, 'base64'))
  const dur = i + 1 < frames.length ? frames[i + 1].t - f.t : 0.5
  list += `file ${name}\nduration ${dur.toFixed(4)}\n`
})
writeFileSync(`${out}/list.ffconcat`, list)
console.log(JSON.stringify({ frames: frames.length, seconds: frames.length ? +(frames.at(-1).t - frames[0].t).toFixed(1) : 0 }))
await browser.close()
