export interface ThemeConfig {
  bg?: string
  surface?: string
  'surface-hover'?: string
  border?: string
  'border-hover'?: string
  primary?: string
  'primary-hover'?: string
  'primary-active'?: string
  success?: string
  warning?: string
  danger?: string
  text?: string
  'text-secondary'?: string
  'text-tertiary'?: string
}

export class ThemeManager {
  private currentTheme: 'light' | 'dark' = 'dark'
  private listeners = new Set<(theme: 'light' | 'dark') => void>()

  constructor() {
    this.applyThemeAttribute(this.currentTheme)
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme
    this.applyThemeAttribute(theme)
    this.listeners.forEach((fn) => fn(theme))
  }

  toggle(): void {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark')
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme
  }

  applyCustom(config: ThemeConfig): void {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    Object.entries(config).forEach(([key, value]) => {
      root.style.setProperty(`--mk-${key}`, value)
    })
  }

  resetCustom(): void {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const props = [
      'bg', 'surface', 'surface-hover', 'border', 'border-hover',
      'primary', 'primary-hover', 'primary-active',
      'success', 'warning', 'danger',
      'text', 'text-secondary', 'text-tertiary',
    ]
    props.forEach((p) => root.style.removeProperty(`--mk-${p}`))
  }

  onChange(fn: (theme: 'light' | 'dark') => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private applyThemeAttribute(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-mk-theme', theme)
  }
}

export const theme = new ThemeManager()
