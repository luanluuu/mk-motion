import { describe, it, expect, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import MkSelect from '../../components-vue/MkSelect.vue'
import MkOption from '../../components-vue/MkOption.vue'

describe('MkSelect', () => {
  it('renders options from :options prop', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkSelect, {
          modelValue: 'a',
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        })
      },
    }).mount(el)

    const trigger = el.querySelector('.mk-select__trigger')
    expect(trigger?.textContent).toContain('A')
  })

  it('renders options from MkOption slot children', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(
          MkSelect,
          { modelValue: 'b' },
          {
            default: () => [
              h(MkOption, { label: 'A', value: 'a' }),
              h(MkOption, { label: 'B', value: 'b' }),
            ],
          }
        )
      },
    }).mount(el)

    const trigger = el.querySelector('.mk-select__trigger')
    expect(trigger?.textContent).toContain('B')
  })

  it('merges :options prop and MkOption slot children', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(
          MkSelect,
          {
            modelValue: 'c',
            options: [{ label: 'A', value: 'a' }],
          },
          {
            default: () => [
              h(MkOption, { label: 'B', value: 'b' }),
              h(MkOption, { label: 'C', value: 'c' }),
            ],
          }
        )
      },
    }).mount(el)

    const trigger = el.querySelector('.mk-select__trigger')
    expect(trigger?.textContent).toContain('C')
  })

  it('does not throw when options is omitted', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    expect(() => {
      createApp({
        render() {
          return h(MkSelect, { modelValue: undefined })
        },
      }).mount(el)
    }).not.toThrow()
  })

  it('adds is-open class to the teleported dropdown when opened', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkSelect, {
          modelValue: 'a',
          options: [{ label: 'A', value: 'a' }],
          teleport: false,
        })
      },
    }).mount(el)

    const trigger = el.querySelector('.mk-select__trigger') as HTMLElement
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))

    const dropdown = el.querySelector('.mk-select__dropdown')
    expect(dropdown?.classList.contains('is-open')).toBe(true)
  })
})
