import { describe, it, expect, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import MkSelect from '../../components-vue/MkSelect.vue'
import MkOption from '../../components-vue/MkOption.vue'

function mountSelect(component: ReturnType<typeof h>) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  createApp({ render: () => component }).mount(el)
  return el
}

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

  it('supports keyboard navigation to select an option', async () => {
    const el = mountSelect(
      h(MkSelect, {
        modelValue: undefined,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ],
        teleport: false,
      })
    )

    const trigger = el.querySelector('.mk-select__trigger') as HTMLElement
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    await nextTick()

    const options = el.querySelectorAll('.mk-select__option')
    expect(options.length).toBe(3)
    expect(options[0].classList.contains('is-active')).toBe(true)

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    expect(options[1].classList.contains('is-active')).toBe(true)

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()

    expect(el.querySelector('.mk-select__label')?.textContent).toContain('B')
    expect(el.querySelector('.mk-select__dropdown')?.classList.contains('is-open')).toBe(false)
  })

  it('closes the dropdown with Escape', async () => {
    const el = mountSelect(
      h(MkSelect, {
        modelValue: 'a',
        options: [{ label: 'A', value: 'a' }],
        teleport: false,
      })
    )

    const trigger = el.querySelector('.mk-select__trigger') as HTMLElement
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    await nextTick()

    expect(el.querySelector('.mk-select__dropdown')?.classList.contains('is-open')).toBe(true)

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(el.querySelector('.mk-select__dropdown')?.classList.contains('is-open')).toBe(false)
  })

  it('warns when options prop and MkOption slot children are both provided', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createApp({
      render: () =>
        h(
          MkSelect,
          {
            options: [{ label: 'A', value: 'a' }],
          },
          {
            default: () => [h(MkOption, { label: 'B', value: 'b' })],
          }
        ),
    }).mount(el)

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`options` prop and <MkOption> slot children')
    )
    warn.mockRestore()
  })
})
