import { renderToc } from '../shared/utils.js'

export function renderThemeGenerator(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'block'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">主题生成器</h1>
    <p class="doc-p">在线调整 MotionKit 的主题色彩，实时预览组件效果，并导出 CSS 变量。</p>

    <h2 class="doc-h2" id="palette">色彩调整</h2>
    <div id="theme-palette"></div>

    <h2 class="doc-h2" id="preview">实时预览</h2>
    <div id="theme-preview"></div>

    <h2 class="doc-h2" id="export">导出 CSS</h2>
    <div id="theme-export"></div>
  `
  renderToc(['palette', 'preview', 'export'])
  setTimeout(() => {
    renderPalette()
    renderPreview()
    renderExport()
    applyColorsFromSliders()
  }, 0)
}

const DEFAULT_COLORS: Record<string, string> = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
}

const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  info: 'Info',
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const bigint = parseInt(h, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
      .join('')
  )
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function updateColorFromSliders(key: string): string {
  const h =
    parseFloat(
      (document.getElementById(`slider-h-${key}`) as HTMLInputElement).value
    ) / 360
  const s =
    parseFloat(
      (document.getElementById(`slider-s-${key}`) as HTMLInputElement).value
    ) / 100
  const l =
    parseFloat(
      (document.getElementById(`slider-l-${key}`) as HTMLInputElement).value
    ) / 100
  const [r, g, b] = hslToRgb(h, s, l)
  const hex = rgbToHex(r, g, b)
  const swatch = document.getElementById(`swatch-${key}`)
  if (swatch) swatch.style.background = hex
  const valueLabel = document.getElementById(`value-${key}`)
  if (valueLabel) valueLabel.textContent = hex
  return hex
}

function renderPalette() {
  const el = document.getElementById('theme-palette')!
  el.innerHTML = Object.keys(DEFAULT_COLORS)
    .map((key) => {
      const [r, g, b] = hexToRgb(DEFAULT_COLORS[key])
      const [h, s, l] = rgbToHsl(r, g, b)
      return `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;padding:16px;border:1px solid var(--mk-border);border-radius:var(--mk-radius);background:var(--mk-surface);">
        <div id="swatch-${key}" style="width:48px;height:48px;border-radius:var(--mk-radius);background:${DEFAULT_COLORS[key]};border:1px solid var(--mk-border);flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.85rem;font-weight:600;color:var(--mk-text);margin-bottom:8px;">${COLOR_LABELS[key]}</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
            <label style="font-size:0.75rem;color:var(--mk-text-secondary);display:flex;align-items:center;gap:6px;">
              H <input type="range" id="slider-h-${key}" min="0" max="360" value="${Math.round(h * 360)}" style="width:120px;" class="theme-slider">
            </label>
            <label style="font-size:0.75rem;color:var(--mk-text-secondary);display:flex;align-items:center;gap:6px;">
              S <input type="range" id="slider-s-${key}" min="0" max="100" value="${Math.round(s * 100)}" style="width:120px;" class="theme-slider">
            </label>
            <label style="font-size:0.75rem;color:var(--mk-text-secondary);display:flex;align-items:center;gap:6px;">
              L <input type="range" id="slider-l-${key}" min="0" max="100" value="${Math.round(l * 100)}" style="width:120px;" class="theme-slider">
            </label>
            <span id="value-${key}" style="font-family:var(--mk-font-mono);font-size:0.8rem;color:var(--mk-text-secondary);min-width:64px;">${DEFAULT_COLORS[key]}</span>
          </div>
        </div>
      </div>
    `
    })
    .join('')

  Object.keys(DEFAULT_COLORS).forEach((key) => {
    ;['h', 's', 'l'].forEach((channel) => {
      const slider = document.getElementById(
        `slider-${channel}-${key}`
      ) as HTMLInputElement
      if (slider) {
        slider.addEventListener('input', () => {
          updateColorFromSliders(key)
          applyColorsFromSliders()
        })
      }
    })
  })
}

function applyColorsFromSliders() {
  const root = document.documentElement
  Object.keys(DEFAULT_COLORS).forEach((key) => {
    const hex = updateColorFromSliders(key)
    root.style.setProperty(`--mk-${key}`, hex)
  })
}

function renderPreview() {
  const el = document.getElementById('theme-preview')!
  el.innerHTML = `
    <div style="display:grid;gap:16px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <button class="mk-button mk-button--primary">Primary</button>
        <button class="mk-button mk-button--success">Success</button>
        <button class="mk-button mk-button--warning">Warning</button>
        <button class="mk-button mk-button--danger">Danger</button>
        <button class="mk-button mk-button--info">Info</button>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <input class="mk-input" placeholder="Input" style="width:200px;">
        <div class="mk-card" style="padding:16px;width:240px;">
          <div style="font-weight:600;margin-bottom:4px;">Card Preview</div>
          <div style="font-size:0.85rem;color:var(--mk-text-secondary);">This card uses the live theme colors.</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <span class="mk-tag mk-tag--primary">Tag</span>
        <span class="mk-tag mk-tag--success">Success</span>
        <span class="mk-tag mk-tag--warning">Warning</span>
        <span class="mk-tag mk-tag--danger">Danger</span>
        <span class="mk-tag mk-tag--info">Info</span>
      </div>
    </div>
  `
}

function renderExport() {
  const el = document.getElementById('theme-export')!
  const pre = document.createElement('pre')
  pre.style.background = 'var(--mk-bg-elevated)'
  pre.style.border = '1px solid var(--mk-border)'
  pre.style.borderRadius = 'var(--mk-radius-md)'
  pre.style.padding = '16px'
  pre.style.fontFamily = 'var(--mk-font-mono)'
  pre.style.fontSize = '0.8rem'
  pre.style.color = 'var(--mk-text-secondary)'
  pre.style.overflow = 'auto'
  pre.id = 'theme-export-code'
  pre.textContent = generateCSS()

  const btn = document.createElement('button')
  btn.className = 'mk-button mk-button--primary'
  btn.textContent = '复制 CSS'
  btn.style.marginBottom = '12px'
  btn.addEventListener('click', () => {
    const code = document.getElementById('theme-export-code')!.textContent!
    navigator.clipboard.writeText(code)
    const old = btn.textContent
    btn.textContent = '已复制'
    setTimeout(() => (btn.textContent = old), 1500)
  })

  const wrap = document.createElement('div')
  wrap.appendChild(btn)
  wrap.appendChild(pre)
  el.appendChild(wrap)

  // Update export on any slider change
  Object.keys(DEFAULT_COLORS).forEach((key) => {
    ;['h', 's', 'l'].forEach((channel) => {
      const slider = document.getElementById(
        `slider-${channel}-${key}`
      ) as HTMLInputElement
      if (slider) {
        slider.addEventListener('input', () => {
          pre.textContent = generateCSS()
        })
      }
    })
  })
}

function generateCSS(): string {
  const lines: string[] = [':root {']
  Object.keys(DEFAULT_COLORS).forEach((key) => {
    const hex = updateColorFromSliders(key)
    lines.push(`  --mk-${key}: ${hex};`)
  })
  lines.push('}')
  return lines.join('\n')
}
