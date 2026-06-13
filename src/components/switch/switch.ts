import './switch.css'
import { onKey, Keys } from '../../a11y/keyboard.ts'

export interface SwitchOptions {
  value?: boolean
  disabled?: boolean
  activeText?: string
  inactiveText?: string
  onChange?: (value: boolean) => void
}

export class MkSwitch {
  el: HTMLLabelElement
  private core: HTMLDivElement
  private options: SwitchOptions
  private _value: boolean
  private activeLabel?: HTMLSpanElement
  private _cleanupKey?: () => void
  private inactiveLabel?: HTMLSpanElement

  constructor(container: HTMLElement | string, options: SwitchOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = { value: false, ...options }
    this._value = this.options.value!

    this.el = document.createElement('label')
    this.el.className = 'mk-switch'
    if (this._value) this.el.classList.add('is-checked')
    if (this.options.disabled) this.el.classList.add('is-disabled')
    this.el.setAttribute('role', 'switch')
    this.el.setAttribute('aria-checked', String(this._value))
    if (!this.options.disabled) {
      this.el.setAttribute('tabindex', '0')
    }

    if (this.options.inactiveText) {
      this.inactiveLabel = document.createElement('span')
      this.inactiveLabel.className = 'mk-switch__label'
      this.inactiveLabel.textContent = this.options.inactiveText
      if (!this._value)
        this.inactiveLabel.classList.add('mk-switch__label--active')
      this.el.appendChild(this.inactiveLabel)
    }

    this.core = document.createElement('div')
    this.core.className = 'mk-switch__core'
    this.el.appendChild(this.core)

    if (this.options.activeText) {
      this.activeLabel = document.createElement('span')
      this.activeLabel.className = 'mk-switch__label'
      this.activeLabel.textContent = this.options.activeText
      if (this._value)
        this.activeLabel.classList.add('mk-switch__label--active')
      this.el.appendChild(this.activeLabel)
    }

    this.el.addEventListener('click', () => {
      if (this.options.disabled) return
      this.toggle()
    })

    this._cleanupKey = onKey(this.el, [
      { key: Keys.Enter, handler: () => this.toggle() },
      { key: Keys.Space, handler: () => this.toggle() },
    ])

    parent.appendChild(this.el)
  }

  get value(): boolean {
    return this._value
  }

  set value(v: boolean) {
    if (this._value !== v) {
      this._value = v
      this.el.classList.toggle('is-checked', v)
      this.el.setAttribute('aria-checked', String(v))
      this.activeLabel?.classList.toggle('mk-switch__label--active', v)
      this.inactiveLabel?.classList.toggle('mk-switch__label--active', !v)
      this.options.onChange?.(v)
    }
  }

  toggle(): void {
    this.value = !this._value
  }

  destroy(): void {
    this._cleanupKey?.()
    this.el.remove()
  }
}

export function createSwitch(
  container: HTMLElement | string,
  options?: SwitchOptions
): MkSwitch {
  return new MkSwitch(container, options)
}
