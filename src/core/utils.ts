export type AnimationName =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideOutUp'
  | 'slideOutDown'
  | 'zoomIn'
  | 'zoomOut'
  | 'bounceIn'
  | 'bounceOut'
  | 'flipInX'
  | 'flipInY'
  | 'shake'
  | 'pulse'
  | 'rotateIn'

export interface AnimationOptions {
  duration?: number
  easing?: string
  delay?: number
  iterations?: number
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fill?: 'none' | 'forwards' | 'backwards' | 'both'
}

export function parseTime(value: number | string): number {
  if (typeof value === 'number') return value
  const trimmed = value.trim().toLowerCase()
  if (trimmed.endsWith('ms')) return parseFloat(trimmed)
  if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000
  return parseFloat(trimmed)
}

export function toCssTime(ms: number): string {
  return ms < 1000
    ? `${ms}ms`
    : `${(ms / 1000).toFixed(2).replace(/\.?0+$/, '')}s`
}

export function setCSSVariables(
  el: HTMLElement,
  vars: Record<string, string | number>
): void {
  Object.entries(vars).forEach(([key, value]) => {
    el.style.setProperty(`--mk-${key}`, String(value))
  })
}

export function removeCSSVariables(el: HTMLElement, keys: string[]): void {
  keys.forEach((key) => {
    el.style.removeProperty(`--mk-${key}`)
  })
}
