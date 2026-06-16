import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export type MkTheme = 'auto' | 'light' | 'dark'

const storedTheme = ref<MkTheme>('auto')
let mediaQuery: MediaQueryList | null = null

function getSystemIsDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getResolvedTheme(theme: MkTheme): 'light' | 'dark' {
  if (theme === 'auto') return getSystemIsDark() ? 'dark' : 'light'
  return theme
}

function setDOMTheme(theme: MkTheme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute(
    'data-mk-theme',
    getResolvedTheme(theme)
  )
}

function readStoredTheme(): MkTheme {
  if (typeof localStorage === 'undefined') return 'auto'
  const raw = localStorage.getItem('mk-theme') as MkTheme | null
  return raw && ['auto', 'light', 'dark'].includes(raw) ? raw : 'auto'
}

function writeStoredTheme(theme: MkTheme) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('mk-theme', theme)
}

export interface UseMkThemeOptions {
  defaultTheme?: MkTheme
  storageKey?: string
}

export function useMkTheme(options: UseMkThemeOptions = {}): {
  theme: Ref<MkTheme>
  resolvedTheme: Ref<'light' | 'dark'>
  setTheme: (theme: MkTheme) => void
  toggle: () => void
} {
  const { defaultTheme = 'auto' } = options

  const theme = ref<MkTheme>(storedTheme.value === 'auto' ? defaultTheme : storedTheme.value)
  const resolvedTheme = ref<'light' | 'dark'>(getResolvedTheme(theme.value))

  const update = () => {
    resolvedTheme.value = getResolvedTheme(theme.value)
    setDOMTheme(theme.value)
  }

  const setTheme = (value: MkTheme) => {
    storedTheme.value = value
    writeStoredTheme(value)
    theme.value = value
    update()
  }

  const toggle = () => {
    setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const initial = readStoredTheme()
    if (initial !== 'auto') {
      theme.value = initial
      storedTheme.value = initial
    }
    update()

    if (!mediaQuery) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => {
        if (storedTheme.value === 'auto') {
          update()
        }
      }
      mediaQuery.addEventListener('change', handler)
      onUnmounted(() => {
        mediaQuery?.removeEventListener('change', handler)
      })
    }
  })

  return { theme, resolvedTheme, setTheme, toggle }
}
