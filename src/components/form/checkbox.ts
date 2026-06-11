import './checkbox.css'
import { onKey, Keys } from '../../a11y/keyboard.ts'

export interface CheckboxOptions {
  label?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export class MkCheckbox {
  el: HTMLLabelElement
  private options: CheckboxOptions
  private _checked: boolean
  private _cleanupKey?: () => void

  constructor(container: HTMLElement | string, options: CheckboxOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = { checked: false, ...options }
    this._checked = this.options.checked!

    this.el = document.createElement('label')
    this.el.className = 'mk-checkbox'
    if (this._checked) this.el.classList.add('is-checked')
    if (this.options.disabled) this.el.classList.add('is-disabled')
    this.el.setAttribute('role', 'checkbox')
    this.el.setAttribute('aria-checked', String(this._checked))
    if (!this.options.disabled) {
      this.el.setAttribute('tabindex', '0')
    }

    const box = document.createElement('span')
    box.className = 'mk-checkbox__input'
    const check = document.createElement('span')
    check.className = 'mk-checkbox__check'
    check.textContent = '✓'
    box.appendChild(check)
    this.el.appendChild(box)

    if (this.options.label) {
      const text = document.createElement('span')
      text.textContent = this.options.label
      this.el.appendChild(text)
    }

    this.el.addEventListener('click', () => {
      if (this.options.disabled) return
      this.toggle()
    })

    this._cleanupKey = onKey(this.el, [
      { key: Keys.Space, handler: () => this.toggle() },
    ])

    parent.appendChild(this.el)
  }

  get checked(): boolean {
    return this._checked
  }

  set checked(v: boolean) {
    this._checked = v
    this.el.classList.toggle('is-checked', v)
    this.el.setAttribute('aria-checked', String(v))
    this.options.onChange?.(v)
  }

  toggle(): void {
    this.checked = !this._checked
  }

  destroy(): void {
    this._cleanupKey?.()
    this.el.remove()
  }
}

export function createCheckbox(
  container: HTMLElement | string,
  options?: CheckboxOptions
): MkCheckbox {
  return new MkCheckbox(container, options)
}

/* ===== Checkbox Group ===== */
export class MkCheckboxGroup {
  el: HTMLDivElement
  private checkboxes: MkCheckbox[] = []

  constructor(container: HTMLElement | string) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('div')
    this.el.className = 'mk-checkbox-group'
    parent.appendChild(this.el)
  }

  add(options: CheckboxOptions): MkCheckbox {
    const cb = new MkCheckbox(this.el, options)
    this.checkboxes.push(cb)
    return cb
  }

  getValues(): boolean[] {
    return this.checkboxes.map((cb) => cb.checked)
  }

  destroy(): void {
    this.el.remove()
  }
}