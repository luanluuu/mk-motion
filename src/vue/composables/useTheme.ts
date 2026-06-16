import { ref, onMounted, onUnmounted, type Ref, computed } from 'vue'

export type MkTheme = 'auto' | 'light' | 'dark'

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
}

export function useMkTheme(options: UseMkThemeOptions = {}): {
  theme: Ref<MkTheme>
  resolvedTheme: Ref<'light' | 'dark'>
  setTheme: (theme: MkTheme) => void
  toggle: () => void
} {
  const { defaultTheme = 'auto' } = options

  const theme = ref<MkTheme>(defaultTheme)
  const resolvedTheme = computed<'light' | 'dark'>(() =>
    getResolvedTheme(theme.value)
  )

  const update = () => {
    setDOMTheme(theme.value)
  }

  const setTheme = (value: MkTheme) => {
    writeStoredTheme(value)
    theme.value = value
    update()
  }

  const toggle = () => {
    setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const stored = readStoredTheme()
    if (stored !== 'auto') {
      theme.value = stored
    }
    update()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const systemChangeHandler = () => {
      if (theme.value === 'auto') {
        update()
      }
    }
    mediaQuery.addEventListener('change', systemChangeHandler)

    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'mk-theme' && e.newValue) {
        const value = e.newValue as MkTheme
        if (['auto', 'light', 'dark'].includes(value)) {
          theme.value = value
          update()
        }
      }
    }
    window.addEventListener('storage', storageHandler)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', systemChangeHandler)
      window.removeEventListener('storage', storageHandler)
    })
  })

  return { theme, resolvedTheme, setTheme, toggle }
}
