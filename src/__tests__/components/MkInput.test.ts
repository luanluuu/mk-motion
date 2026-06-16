import { describe, it, expect, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import MkInput from '../../components-vue/MkInput.vue'

describe('MkInput', () => {
  it('renders with modelValue', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkInput, { modelValue: 'hello' })
      },
    }).mount(el)

    const input = el.querySelector('.mk-input') as HTMLInputElement
    expect(input.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    let value = ''
    createApp({
      render() {
        return h(MkInput, {
          modelValue: value,
          'onUpdate:modelValue': (v: string) => {
            value = v
          },
        })
      },
    }).mount(el)

    const input = el.querySelector('.mk-input') as HTMLInputElement
    input.value = 'world'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    expect(value).toBe('world')
  })

  it('shows clear button when clearable and has value', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkInput, { modelValue: 'hello', clearable: true })
      },
    }).mount(el)

    expect(el.querySelector('.mk-input__clear')).not.toBeNull()
  })

  it('validates with custom validate function', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const validate = (v: string) => (v.length < 3 ? '至少 3 个字符' : null)

    const app = createApp({
      render() {
        return h(MkInput, { modelValue: 'ab', validate })
      },
    }).mount(el)

    const input = el.querySelector('.mk-input') as HTMLInputElement
    input.dispatchEvent(new Event('blur'))
    await nextTick()

    expect(el.querySelector('.mk-input-wrapper')?.classList.contains('is-error')).toBe(true)
    expect(el.textContent).toContain('至少 3 个字符')
  })
})
