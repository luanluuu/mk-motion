import { describe, it, expect, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import MkCollapse from '../../components-vue/MkCollapse.vue'
import MkCollapseItem from '../../components-vue/MkCollapseItem.vue'

function mount(el: HTMLElement, component: ReturnType<typeof h>) {
  createApp({ render: () => component }).mount(el)
}

describe('MkCollapse', () => {
  it('renders items from :items prop and toggles on click', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    mount(
      el,
      h(MkCollapse, {
        items: [
          { title: 'A', content: 'Content A' },
          { title: 'B', content: 'Content B' },
        ],
      })
    )

    const headers = el.querySelectorAll('.mk-collapse__header')
    expect(headers.length).toBe(2)
    expect(el.textContent).toContain('A')
    expect(el.textContent).toContain('Content B')

    // default collapsed
    expect(el.querySelectorAll('.mk-collapse__item.is-active').length).toBe(0)

    headers[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(el.querySelectorAll('.mk-collapse__item.is-active').length).toBe(1)
  })

  it('supports accordion mode', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    mount(
      el,
      h(MkCollapse, {
        accordion: true,
        items: [
          { key: 'a', title: 'A', content: 'A1' },
          { key: 'b', title: 'B', content: 'B1' },
        ],
      })
    )

    const headers = el.querySelectorAll('.mk-collapse__header')
    headers[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    headers[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    const active = el.querySelectorAll('.mk-collapse__item.is-active')
    expect(active.length).toBe(1)
    expect(active[0].textContent).toContain('B')
  })

  it('renders MkCollapseItem slot children and v-model', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const active = ref<string[]>(['b'])
    mount(
      el,
      h(
        MkCollapse,
        {
          modelValue: active.value,
          'onUpdate:modelValue': (v: string[]) => {
            active.value = v
          },
        },
        {
          default: () => [
            h(MkCollapseItem, { name: 'a', title: 'A' }, () => 'Content A'),
            h(MkCollapseItem, { name: 'b', title: 'B' }, () => 'Content B'),
          ],
        }
      )
    )

    await nextTick()
    expect(el.textContent).toContain('B')
    expect(el.querySelectorAll('.mk-collapse__item.is-active').length).toBe(1)

    const headers = el.querySelectorAll('.mk-collapse__header')
    headers[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(active.value).toContain('a')
    expect(active.value).toContain('b')
  })

  it('warns when MkCollapseItem misses name prop', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createApp({
      render: () =>
        h(MkCollapse, null, {
          default: () => [h(MkCollapseItem, { title: 'No Name' }, () => 'x')],
        }),
    }).mount(el)

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('<MkCollapseItem> requires a `name` prop')
    )
    warn.mockRestore()
  })

  it('warns when using deprecated items prop', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createApp({
      render: () =>
        h(MkCollapse, {
          items: [{ title: 'A', content: 'x' }],
        }),
    }).mount(el)

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`items` prop is deprecated')
    )
    warn.mockRestore()
  })

  it('supports keyboard Enter and Space on header', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    mount(
      el,
      h(MkCollapse, {
        items: [{ title: 'A', content: 'x' }],
      })
    )

    const header = el.querySelector('.mk-collapse__header') as HTMLElement
    header.focus()
    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(el.querySelector('.mk-collapse__item.is-active')).not.toBeNull()

    header.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    await nextTick()
    expect(el.querySelector('.mk-collapse__item.is-active')).toBeNull()
  })
})
