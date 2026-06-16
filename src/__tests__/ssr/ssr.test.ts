import { describe, it, expect } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createApp, h } from 'vue'
import {
  MkButton,
  MkInput,
  MkSelect,
  MkDialog,
  MkTabs,
  MkTabPane,
  useMkTheme,
} from '../../vue/index.js'

describe('SSR', () => {
  it('renders MkButton without browser APIs', async () => {
    const app = createApp({
      render: () => h(MkButton, { type: 'primary' }, () => 'OK'),
    })
    const html = await renderToString(app)
    expect(html).toContain('OK')
  })

  it('renders MkInput without browser APIs', async () => {
    const app = createApp({
      render: () => h(MkInput, { modelValue: 'hello' }),
    })
    const html = await renderToString(app)
    expect(html).toContain('hello')
  })

  it('renders MkSelect without browser APIs', async () => {
    const app = createApp({
      render: () =>
        h(MkSelect, {
          modelValue: 'a',
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        }),
    })
    const html = await renderToString(app)
    expect(html).toContain('A')
  })

  it('renders MkDialog without browser APIs', async () => {
    const app = createApp({
      render: () => h(MkDialog, { modelValue: true, title: 'Title' }),
    })
    const html = await renderToString(app)
    // Teleport content is emitted as markers in the main string by default
    expect(html).toContain('teleport')
  })

  it('renders MkTabs + MkTabPane without browser APIs', async () => {
    const app = createApp({
      render: () =>
        h(
          MkTabs,
          { modelValue: 'a' },
          {
            default: () => [
              h(MkTabPane, { label: 'A', name: 'a' }, () => 'Content A'),
            ],
          }
        ),
    })
    const html = await renderToString(app)
    expect(html).toContain('A')
  })

  it('useMkTheme does not access browser globals during SSR', async () => {
    const app = createApp({
      setup() {
        const { resolvedTheme } = useMkTheme()
        return () => h('div', resolvedTheme.value)
      },
    })
    const html = await renderToString(app)
    expect(html).toContain('light')
  })
})
