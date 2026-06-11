import './radio.css'
import { onKey, Keys } from '../../a11y/keyboard.ts'

export interface RadioOptions {
  label?: string
  value: string | number
  checked?: boolean
  disabled?: boolean
  onChange?: (value: string | number) => void
}

export class MkRadio {
  el: HTMLLabelElement
  private options: RadioOptions
  private _checked: boolean

  constructor(container: HTMLElement | string, options: RadioOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = { checked: false, ...options }
    this._checked = this.options.checked!

    this.el = document.createElement('label')
    this.el.className = 'mk-radio'
    if (this._checked) this.el.classList.add('is-checked')
    if (this.options.disabled) this.el.classList.add('is-disabled')
    this.el.setAttribute('role', 'radio')
    this.el.setAttribute('aria-checked', String(this._checked))

    const box = document.createElement('span')
    box.className = 'mk-radio__input'
    const dot = document.createElement('span')
    dot.className = 'mk-radio__dot'
    box.appendChild(dot)
    this.el.appendChild(box)

    if (this.options.label) {
      const text = document.createElement('span')
      text.textContent = this.options.label
      this.el.appendChild(text)
    }

    this.el.addEventListener('click', () => {
      if (this.options.disabled) return
      this.options.onChange?.(this.options.value)
    })

    parent.appendChild(this.el)
  }

  setChecked(checked: boolean): void {
    this._checked = checked
    this.el.classList.toggle('is-checked', checked)
    this.el.setAttribute('aria-checked', String(checked))
  }

  getValue(): string | number {
    return this.options.value
  }

  destroy(): void {
    this.el.remove()
  }
}

/* ===== Radio Group ===== */
export class MkRadioGroup {
  el: HTMLDivElement
  private radios: MkRadio[] = []
  private _value: string | number | undefined
  private _cleanupKey?: () => void

  constructor(
    container: HTMLElement | string,
    options: { value?: string | number; onChange?: (value: string | number) => void } = {}
  ) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this._value = options.value

    this.el = document.createElement('div')
    this.el.className = 'mk-radio-group'
    this.el.setAttribute('role', 'radiogroup')
    parent.appendChild(this.el)

    this._cleanupKey = onKey(this.el, [
      { key: Keys.ArrowUp, handler: () => this.focusRadio(-1) },
      { key: Keys.ArrowLeft, handler: () => this.focusRadio(-1) },
      { key: Keys.ArrowDown, handler: () => this.focusRadio(1) },
      { key: Keys.ArrowRight, handler: () => this.focusRadio(1) },
    ])
  }

  add(radioOptions: Omit<RadioOptions, 'onChange'>): MkRadio {
    const radio = new MkRadio(this.el, {
      ...radioOptions,
      onChange: (value) => {
        this.setValue(value)
      },
    })
    const checked = radioOptions.value === this._value
    radio.setChecked(checked)
    if (this._value === undefined && this.radios.length === 0) {
      radio.el.setAttribute('tabindex', '0')
    } else {
      radio.el.setAttribute('tabindex', checked ? '0' : '-1')
    }
    this.radios.push(radio)
    return radio
  }

  setValue(value: string | number): void {
    this._value = value
    this.radios.forEach((r) => {
      const checked = r.getValue() === value
      r.setChecked(checked)
      r.el.setAttribute('tabindex', checked ? '0' : '-1')
    })
  }

  getValue(): string | number | undefined {
    return this._value
  }

  private focusRadio(dir: number): void {
    let current = this.radios.findIndex((r) => r.el.getAttribute('tabindex') === '0')
    if (current === -1) current = this.radios.findIndex((r) => r.el.classList.contains('is-checked'))
    if (current === -1) current = 0
    let next = current
    for (let i = 0; i < this.radios.length; i++) {
      next = (next + dir + this.radios.length) % this.radios.length
      if (!this.radios[next].el.classList.contains('is-disabled')) {
        break
      }
    }
    if (next !== current || this.radios.length === 1) {
      this.radios.forEach((r, i) => r.el.setAttribute('tabindex', i === next ? '0' : '-1'))
      this.radios[next].el.focus()
      this.setValue(this.radios[next].getValue())
    }
  }

  destroy(): void {
    this._cleanupKey?.()
    this.el.remove()
  }
}