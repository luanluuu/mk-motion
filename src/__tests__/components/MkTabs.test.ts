import { describe, it, expect } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import MkTabs from '../../components-vue/MkTabs.vue'
import MkTabPane from '../../components-vue/MkTabPane.vue'

describe('MkTabs', () => {
  it('renders items from :items prop', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkTabs, {
          modelValue: 'b',
          items: [
            { key: 'a', label: 'Tab A' },
            { key: 'b', label: 'Tab B' },
          ],
        })
      },
    }).mount(el)

    expect(el.textContent).toContain('Tab A')
    expect(el.textContent).toContain('Tab B')
  })

  it('renders panes from MkTabPane slot children', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(
          MkTabs,
          { modelValue: 'b' },
          {
            default: () => [
              h(MkTabPane, { label: 'Tab A', name: 'a' }, () => 'Content A'),
              h(MkTabPane, { label: 'Tab B', name: 'b' }, () => 'Content B'),
            ],
          }
        )
      },
    }).mount(el)

    await nextTick()
    expect(el.textContent).toContain('Tab A')
    expect(el.textContent).toContain('Tab B')
    expect(el.textContent).toContain('Content B')
  })

  it('does not throw when items is omitted', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    expect(() => {
      createApp({
        render() {
          return h(MkTabs, { modelValue: undefined })
        },
      }).mount(el)
    }).not.toThrow()
  })

  it('supports keyboard arrow navigation and aria attributes', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    let active = 'a'
    createApp({
      render() {
        return h(
          MkTabs,
          {
            modelValue: active,
            items: [
              { key: 'a', label: 'Tab A', content: 'Content A' },
              { key: 'b', label: 'Tab B', content: 'Content B' },
            ],
            'onUpdate:modelValue': (v: string) => {
              active = v
            },
          }
        )
      },
    }).mount(el)

    await nextTick()
    const tabs = el.querySelectorAll('[role="tab"]')
    expect(tabs.length).toBe(2)
    expect(tabs[0].getAttribute('aria-controls')).toMatch(
      /mk-tab-.*-panel-a$/
    )

    const first = tabs[0] as HTMLElement
    first.focus()
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await nextTick()

    expect(active).toBe('b')
    expect(el.textContent).toContain('Content B')
  })
})
