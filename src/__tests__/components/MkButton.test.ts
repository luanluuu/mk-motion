import { describe, it, expect, vi } from 'vitest'
import { createApp, h } from 'vue'
import MkButton from '../../components-vue/MkButton.vue'

describe('MkButton', () => {
  it('renders default slot content', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkButton, null, () => 'Click me')
      },
    }).mount(el)

    expect(el.textContent).toContain('Click me')
  })

  it('applies type class', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkButton, { type: 'primary' }, () => 'Primary')
      },
    }).mount(el)

    expect(el.querySelector('.mk-button--primary')).not.toBeNull()
  })

  it('emits click event', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const onClick = vi.fn()
    createApp({
      render() {
        return h(MkButton, { onClick }, () => 'Button')
      },
    }).mount(el)

    const btn = el.querySelector('.mk-button') as HTMLButtonElement
    btn.click()
    expect(onClick).toHaveBeenCalled()
  })

  it('does not emit click when disabled', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const onClick = vi.fn()
    createApp({
      render() {
        return h(MkButton, { disabled: true, onClick }, () => 'Disabled')
      },
    }).mount(el)

    const btn = el.querySelector('.mk-button') as HTMLButtonElement
    btn.click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not emit click when loading', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const onClick = vi.fn()
    createApp({
      render() {
        return h(MkButton, { loading: true, onClick }, () => 'Loading')
      },
    }).mount(el)

    const btn = el.querySelector('.mk-button') as HTMLButtonElement
    btn.click()
    expect(onClick).not.toHaveBeenCalled()
    expect(el.querySelector('.mk-button__spinner')).not.toBeNull()
  })
})
