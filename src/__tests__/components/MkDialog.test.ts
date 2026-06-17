import { describe, it, expect, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import MkDialog from '../../components-vue/MkDialog.vue'

function findOverlay() {
  return document.body.querySelector('.mk-dialog-overlay') as HTMLElement | null
}

function clearBodyOverlays() {
  document.body.querySelectorAll('.mk-dialog-overlay').forEach((el) => el.remove())
}

describe('MkDialog', () => {
  afterEach(() => {
    clearBodyOverlays()
  })

  it('renders in body when modelValue is true', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkDialog, { modelValue: true, title: 'Title' }, () => 'Content')
      },
    }).mount(el)

    await nextTick()
    const overlay = findOverlay()
    expect(overlay).not.toBeNull()
    expect(overlay?.style.display).not.toBe('none')
    expect(document.body.textContent).toContain('Title')
    expect(document.body.textContent).toContain('Content')
  })

  it('hides overlay when modelValue is false', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkDialog, { modelValue: false, title: 'Title' })
      },
    }).mount(el)

    await nextTick()
    const overlay = findOverlay()
    expect(overlay).not.toBeNull()
    expect(overlay?.getAttribute('style') || '').toContain('display: none')
  })

  it('emits confirm and closes on confirm button click', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const onConfirm = vi.fn()
    let visible = true

    createApp({
      render() {
        return h(MkDialog, {
          modelValue: visible,
          'onUpdate:modelValue': (v: boolean) => {
            visible = v
          },
          onConfirm,
        })
      },
    }).mount(el)

    await nextTick()
    const confirmBtn = findOverlay()?.querySelector('.mk-button--primary') as HTMLButtonElement
    confirmBtn.click()
    await nextTick()

    expect(onConfirm).toHaveBeenCalled()
    expect(visible).toBe(false)
  })

  it('closes on Escape', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    let visible = true
    createApp({
      render() {
        return h(MkDialog, {
          modelValue: visible,
          'onUpdate:modelValue': (v: boolean) => {
            visible = v
          },
        })
      },
    }).mount(el)

    await nextTick()
    const overlay = findOverlay()
    overlay?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(visible).toBe(false)
  })

  it('traps Tab focus inside the dialog', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    createApp({
      render() {
        return h(MkDialog, { modelValue: true })
      },
    }).mount(el)

    await nextTick()
    const overlay = findOverlay()
    const focusable = overlay?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    expect(focusable.length).toBeGreaterThanOrEqual(2)

    focusable[focusable.length - 1].focus()
    overlay?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await nextTick()

    expect(document.activeElement).toBe(focusable[0])
  })
})
