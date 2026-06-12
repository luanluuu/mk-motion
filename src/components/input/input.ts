import './input.css'
import { withMotion, type MotionOptions } from '../../motion/component-motion.ts'

export type InputSize = 'small' | 'default' | 'large' | {
  height?: string
  width?: string
  padding?: string
  fontSize?: string
}

export interface InputOptions {
  placeholder?: string
  type?: string
  value?: string
  disabled?: boolean
  clearable?: boolean
  showPassword?: boolean
  size?: InputSize
  validate?: (value: string) => string | null
  onInput?: (value: string) => void
  onEnter?: (value: string) => void
  motion?: MotionOptions
}

export class MkInput {
  el: HTMLDivElement
  input: HTMLInputElement
  private options: InputOptions
  private errorMsg: HTMLSpanElement
  private motion: ReturnType<typeof withMotion> | null = null

  constructor(container: HTMLElement | string, options: InputOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = { ...options }

    this.el = document.createElement('div')
    this.el.className = 'mk-input-wrapper'

    const inputId = `mk-input-${Math.random().toString(36).slice(2)}`

    this.input = document.createElement('input')
    this.input.className = 'mk-input'
    this.input.id = inputId
    this.input.type = this.options.type || 'text'
    this.input.placeholder = this.options.placeholder || ''
    this.input.value = this.options.value || ''
    this.input.disabled = !!this.options.disabled

    // Apply size
    if (this.options.size) {
      this.applySize(this.options.size)
    }

    this.el.appendChild(this.input)

    const suffix = document.createElement('span')
    suffix.className = 'mk-input__suffix'

    if (this.options.clearable) {
      const clear = document.createElement('span')
      clear.className = 'mk-input__suffix-item mk-input__clear'
      clear.innerHTML = '✕'
      clear.addEventListener('click', () => {
        this.input.value = ''
        this.input.focus()
        this.options.onInput?.('')
        this.clearError()
      })
      suffix.appendChild(clear)
    }

    if (this.options.showPassword && this.input.type === 'password') {
      const eye = document.createElement('span')
      eye.className = 'mk-input__suffix-item'
      eye.innerHTML = '👁'
      eye.title = '显示密码'
      let showing = false
      eye.addEventListener('click', () => {
        showing = !showing
        this.input.type = showing ? 'text' : 'password'
        eye.innerHTML = showing ? '🙈' : '👁'
      })
      suffix.appendChild(eye)
    }

    if (suffix.children.length > 0) {
      this.el.appendChild(suffix)
    }

    this.errorMsg = document.createElement('span')
    this.errorMsg.className = 'mk-input__errormsg'
    this.errorMsg.id = `${inputId}-error`
    this.el.appendChild(this.errorMsg)

    this.input.addEventListener('input', () => {
      this.options.onInput?.(this.input.value)
      this.clearError()
    })

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.options.onEnter?.(this.input.value)
      }
    })

    this.input.addEventListener('blur', () => {
      this.validate()
    })

    parent.appendChild(this.el)

    this.motion = withMotion(this.input, options.motion || { focus: 'ring', enter: 'fadeIn', duration: 200 })
  }

  get value(): string {
    return this.input.value
  }

  set value(v: string) {
    this.input.value = v
  }

  validate(): boolean {
    if (!this.options.validate) return true
    const error = this.options.validate(this.input.value)
    if (error) {
      this.showError(error)
      return false
    }
    this.clearError()
    return true
  }

  showError(msg: string): void {
    this.el.classList.add('is-error')
    this.el.classList.remove('is-success')
    this.errorMsg.textContent = msg
    this.errorMsg.classList.add('show')
    this.input.setAttribute('aria-invalid', 'true')
    this.input.setAttribute('aria-describedby', this.errorMsg.id)
  }

  showSuccess(): void {
    this.el.classList.remove('is-error')
    this.el.classList.add('is-success')
    this.errorMsg.classList.remove('show')
  }

  clearError(): void {
    this.el.classList.remove('is-error')
    this.errorMsg.classList.remove('show')
    this.input.removeAttribute('aria-invalid')
    this.input.removeAttribute('aria-describedby')
  }

  private applySize(size: InputSize): void {
    if (typeof size === 'string') {
      this.el.classList.add(`mk-input-wrapper--${size}`)
    } else {
      if (size.height) this.input.style.height = size.height
      if (size.width) this.el.style.width = size.width
      if (size.padding) this.input.style.padding = size.padding
      if (size.fontSize) this.input.style.fontSize = size.fontSize
    }
  }

  focus(): void {
    this.input.focus()
  }

  destroy(): void {
    this.motion?.destroy()
    this.el.remove()
  }
}

export function createInput(
  container: HTMLElement | string,
  options?: InputOptions
): MkInput {
  return new MkInput(container, options)
}