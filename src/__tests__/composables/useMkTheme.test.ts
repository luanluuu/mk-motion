import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { useMkTheme, type MkTheme } from '../../vue/composables/useTheme.js'

describe('useMkTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-mk-theme')
    localStorage.clear()
  })

  it('defaults to light and sets data attribute on mount', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    let resolved = ''
    createApp({
      setup() {
        const { resolvedTheme } = useMkTheme()
        resolved = resolvedTheme.value
        return () => h('div')
      },
    }).mount(el)

    await nextTick()
    expect(resolved).toBe('light')
    expect(document.documentElement.getAttribute('data-mk-theme')).toBe('light')
  })

  it('can be set to dark', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    let theme!: ReturnType<typeof useMkTheme>
    createApp({
      setup() {
        theme = useMkTheme()
        return () => h('div')
      },
    }).mount(el)

    await nextTick()
    theme.setTheme('dark' as MkTheme)
    await nextTick()
    expect(theme.resolvedTheme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-mk-theme')).toBe('dark')
  })

  it('toggle switches between light and dark', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    let theme!: ReturnType<typeof useMkTheme>
    createApp({
      setup() {
        theme = useMkTheme()
        return () => h('div')
      },
    }).mount(el)

    await nextTick()
    theme.toggle()
    await nextTick()
    expect(theme.resolvedTheme.value).toBe('dark')

    theme.toggle()
    await nextTick()
    expect(theme.resolvedTheme.value).toBe('light')
  })

  it('persists theme to localStorage', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    let theme!: ReturnType<typeof useMkTheme>
    createApp({
      setup() {
        theme = useMkTheme()
        return () => h('div')
      },
    }).mount(el)

    await nextTick()
    theme.setTheme('dark' as MkTheme)
    expect(localStorage.getItem('mk-theme')).toBe('dark')
  })
})
