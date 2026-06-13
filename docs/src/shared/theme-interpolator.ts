/**
 * 主题色彩插值工具 — 在暗色和亮色之间平滑过渡
 *
 * 策略：
 * - 非文字 Token：HSL 色彩空间线性插值
 * - 文字 Token：HSL 插值 + 亮度夹持，确保文字始终与背景保持最小对比度
 *   文字不会掉到背景亮度附近，从根本上杜绝"看不清"
 */

type TokenMap = Record<string, string>

// 暗色主题 Token 值
const darkTokens: TokenMap = {
  '--mk-bg': '#09090b',
  '--mk-bg-elevated': '#0c0c14',
  '--mk-surface': '#12121a',
  '--mk-surface-hover': '#1a1a25',
  '--mk-surface-active': '#22222e',
  '--mk-surface-raised': '#1e1e2a',
  '--mk-border': '#1e1e2e',
  '--mk-border-hover': '#27273a',
  '--mk-border-active': '#3a3a55',
  '--mk-divider': 'rgba(255,255,255,0.06)',
  '--mk-text': '#f8fafc',
  '--mk-text-primary': '#f1f5f9',
  '--mk-text-secondary': '#94a3b8',
  '--mk-text-tertiary': '#64748b',
  '--mk-text-disabled': '#475569',
  '--mk-text-inverse': '#0f172a',
  '--mk-shadow-sm': '0 1px 2px rgba(0,0,0,0.3)',
  '--mk-shadow': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
  '--mk-shadow-md':
    '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.2)',
  '--mk-shadow-lg':
    '0 10px 15px -3px rgba(0,0,0,0.35), 0 4px 6px -4px rgba(0,0,0,0.2)',
  '--mk-shadow-xl':
    '0 20px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.2)',
  '--mk-shadow-glow': '0 0 20px rgba(99,102,241,0.15)',
}

// 亮色主题 Token 值
const lightTokens: TokenMap = {
  '--mk-bg': '#ffffff',
  '--mk-bg-elevated': '#f8fafc',
  '--mk-surface': '#f1f5f9',
  '--mk-surface-hover': '#e2e8f0',
  '--mk-surface-active': '#cbd5e1',
  '--mk-surface-raised': '#ffffff',
  '--mk-border': '#e2e8f0',
  '--mk-border-hover': '#cbd5e1',
  '--mk-border-active': '#94a3b8',
  '--mk-divider': 'rgba(0,0,0,0.06)',
  '--mk-text': '#0f172a',
  '--mk-text-primary': '#1e293b',
  '--mk-text-secondary': '#475569',
  '--mk-text-tertiary': '#94a3b8',
  '--mk-text-disabled': '#cbd5e1',
  '--mk-text-inverse': '#f8fafc',
  '--mk-shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
  '--mk-shadow': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  '--mk-shadow-md':
    '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
  '--mk-shadow-lg':
    '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.03)',
  '--mk-shadow-xl':
    '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.02)',
  '--mk-shadow-glow': '0 0 20px rgba(99,102,241,0.12)',
}

// ---- HSL 转换 ----

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ]
  }
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  const l = (max + min) / 2
  const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min)

  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
  }

  return [h * 360, s * 100, l * 100]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360,
    sn = s / 100,
    ln = l / 100
  let r: number, g: number, b: number

  if (sn === 0) {
    r = g = b = ln
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
    const p = 2 * ln - q
    r = hue2rgb(p, q, hn + 1 / 3)
    g = hue2rgb(p, q, hn)
    b = hue2rgb(p, q, hn - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function hexToHsl(hex: string): [number, number, number] {
  return rgbToHsl(...parseHex(hex))
}

function hslToHex([h, s, l]: [number, number, number]): string {
  const [r, g, b] = hslToRgb(h, s, l)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// ---- 插值工具 ----

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpHue(a: number, b: number, t: number): number {
  let d = b - a
  if (d > 180) d -= 360
  if (d < -180) d += 360
  const result = a + d * t
  return result < 0 ? result + 360 : result >= 360 ? result - 360 : result
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

// ---- 背景亮度（用于文字对比度夹持）----

// 预计算两端背景的 HSL 亮度
const darkBgL = hexToHsl(darkTokens['--mk-bg'])[2] // ~3.9
const lightBgL = hexToHsl(lightTokens['--mk-bg'])[2] // ~100

/** 当前 t 对应的背景亮度 */
function bgLightness(t: number): number {
  return lerp(darkBgL, lightBgL, t)
}

// 各文字级别的对比度底线（HSL 亮度差，单位：百分点）
const TEXT_MIN_GAP: Record<string, number> = {
  '--mk-text': 50,
  '--mk-text-primary': 45,
  '--mk-text-secondary': 28,
  '--mk-text-tertiary': 18,
  '--mk-text-disabled': 10,
}

/**
 * 文字亮度延迟 + 夹持：
 * - 前半段（暗色背景）文字保持高亮度，不随背景变亮而立刻变暗
 * - 文字亮度 floor = 当前背景亮度 + 各层级的最小对比度
 * - --mk-text-inverse 反过来：ceiling = 背景亮度 - 40
 */
function textLightness(
  darkL: number,
  lightL: number,
  t: number,
  name: string
): number {
  const bgL = bgLightness(t)

  if (name === '--mk-text-inverse') {
    // inverse：暗色主题下是深色文字（用在亮色表面上），亮色主题下是浅色文字（用在暗色表面上）
    // 所以要保证它始终和背景反相：当背景偏暗时亮，当背景偏亮时暗
    // 这里简单地用幂曲线但方向相反：前半段保持深色，后半段快速变白
    const delayT = Math.pow(1 - t, 3)
    const raw = lerp(lightL, darkL, delayT)
    return clamp(raw, 0, 100)
  }

  // 普通文字：暗色主题下亮，亮色主题下暗
  // 用幂曲线延迟变化 + 亮度夹持，确保始终与背景保持对比度
  const delayT = Math.pow(t, 3)
  const raw = lerp(darkL, lightL, delayT)
  const gap = TEXT_MIN_GAP[name] ?? 10

  if (bgL < 50) {
    // 暗色背景：文字要足够亮（不低于背景 + gap）
    return Math.max(raw, bgL + gap)
  } else {
    // 亮色背景：文字要足够暗（不高于背景 - gap）
    return Math.min(raw, bgL - gap)
  }
}

// ---- RGBA 处理 ----

function parseRgba(rgba: string): [number, number, number, number] {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!m) throw new Error(`Cannot parse rgba: ${rgba}`)
  return [
    parseInt(m[1]),
    parseInt(m[2]),
    parseInt(m[3]),
    m[4] ? parseFloat(m[4]) : 1,
  ]
}

function toRgba([r, g, b, a]: [number, number, number, number]): string {
  return `rgba(${r},${g},${b},${a})`
}

// ---- 颜色插值 ----

function interpolateHex(
  dark: string,
  light: string,
  t: number,
  name: string
): string {
  const [dh, ds, dl] = hexToHsl(dark)
  const [lh, ls, ll] = hexToHsl(light)

  let outL: number
  if (name.startsWith('--mk-text')) {
    outL = textLightness(dl, ll, t, name)
  } else {
    outL = lerp(dl, ll, t)
  }

  return hslToHex([lerpHue(dh, lh, t), lerp(ds, ls, t), clamp(outL, 0, 100)])
}

function interpolateColor(
  dark: string,
  light: string,
  t: number,
  name: string
): string {
  if (dark.startsWith('#') && light.startsWith('#')) {
    return interpolateHex(dark, light, t, name)
  }
  if (dark.startsWith('rgba') && light.startsWith('rgba')) {
    const dr = parseRgba(dark)
    const lr = parseRgba(light)
    return toRgba([
      Math.round(lerp(dr[0], lr[0], t)),
      Math.round(lerp(dr[1], lr[1], t)),
      Math.round(lerp(dr[2], lr[2], t)),
      +(dr[3] + (lr[3] - dr[3]) * t).toFixed(4),
    ])
  }
  return t < 0.5 ? dark : light
}

// ---- 阴影插值 ----

function interpolateShadow(dark: string, light: string, t: number): string {
  const rgbaRegex = /rgba?\([^)]+\)/g
  const darkRgbas = dark.match(rgbaRegex) || []
  const lightRgbas = light.match(rgbaRegex) || []

  let result = t < 0.5 ? dark : light
  for (let i = 0; i < Math.max(darkRgbas.length, lightRgbas.length); i++) {
    if (darkRgbas[i] && lightRgbas[i]) {
      const dr = parseRgba(darkRgbas[i])
      const lr = parseRgba(lightRgbas[i])
      result = result.replace(
        darkRgbas[i],
        toRgba([
          Math.round(lerp(dr[0], lr[0], t)),
          Math.round(lerp(dr[1], lr[1], t)),
          Math.round(lerp(dr[2], lr[2], t)),
          +(dr[3] + (lr[3] - dr[3]) * t).toFixed(4),
        ])
      )
    }
  }
  return result
}

// ---- 入口 ----

function interpolateToken(name: string, t: number): string {
  const dark = darkTokens[name]
  const light = lightTokens[name]
  if (!dark || !light) return ''

  if (name.startsWith('--mk-shadow')) {
    return interpolateShadow(dark, light, t)
  }
  return interpolateColor(dark, light, t, name)
}

/**
 * 设置主题色温
 * @param t 0 = 纯暗色, 1 = 纯亮色
 */
export function setColorTemp(t: number): void {
  const root = document.documentElement
  for (const name of Object.keys(darkTokens)) {
    root.style.setProperty(name, interpolateToken(name, t))
  }
}
