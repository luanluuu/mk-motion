import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://localhost:5174/#/components', {
  waitUntil: 'networkidle',
  timeout: 15000,
})
await page.waitForTimeout(2000)

// Check for mk-card elements
const cardCount = await page.$$eval('.mk-card', (els) => els.length)
console.log(`mk-card elements found: ${cardCount}`)

// Check card-grid children
const gridContent = await page.$$eval('.card-grid', (grids) =>
  grids.map((g) => ({
    childCount: g.children.length,
    firstChildClass: g.children[0]?.className || 'none',
    hasMkCard: Array.from(g.children).some((c) =>
      c.classList.contains('mk-card')
    ),
  }))
)
console.log('Card grids:', JSON.stringify(gridContent, null, 2))

// Check for any mk-card--shadow-hover
const hoverCards = await page.$$eval(
  '.mk-card--shadow-hover',
  (els) => els.length
)
console.log(`Hover shadow cards: ${hoverCards}`)

// Check page title
const title = await page.title()
console.log('Page title:', title)

// Dump first card HTML
const firstCardHtml = await page
  .$eval('.mk-card', (el) => el.outerHTML.slice(0, 500))
  .catch(() => 'no card found')
console.log('First card HTML:', firstCardHtml)

await page.screenshot({ path: '/tmp/mk-components-full.png', fullPage: true })
console.log('Screenshot saved to /tmp/mk-components-full.png')

await browser.close()
