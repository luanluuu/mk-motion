import '../../styles/element-plus.css'
import './button.css'
import { withMotion, type MotionOptions } from '../../motion/component-motion.ts'
import { springHover, springPress } from '../../motion/component-spring.ts'
import type { SpringOptions } from '../../core/spring-engine.ts'

export interface ButtonOptions {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'text'
  size?: 'default' | 'small' | 'large'
  plain?: boolean
  round?: boolean
  circle?: boolean
  disabled?: boolean
  loading?: boolean
  text?: string
  icon?: string
  onClick?: (e: MouseEvent) => void
  motion?: MotionOptions
  /** Enable spring physics hover/press instead of CSS transitions */
  spring?: boolean | SpringOptions
}

export class MkButton {
  el: HTMLButtonElement
  private options: ButtonOptions
  private motion: ReturnType<typeof withMotion> | null = null
  private springHoverCtrl?: ReturnType<typeof springHover>
  private springPressCtrl?: ReturnType<typeof springPress>

  constructor(container: HTMLElement | string, options: ButtonOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      type: 'default',
      size: 'default',
      ...options,
    }

    this.el = document.createElement('button')
    this.el.type = 'button'
    this.el.className = this.buildClass()
    this.el.disabled = !!this.options.disabled || !!this.options.loading
    if (this.options.icon && !this.options.text) {
      this.el.setAttribute('aria-label', 'Button')
    }
    this.updateAriaDisabled()

    if (this.options.loading) {
      this.el.classList.add('is-loading')
      const spinner = document.createElement('span')
      spinner.className = 'mk-button__spinner'
      this.el.appendChild(spinner)
    }

    if (this.options.icon && !this.options.loading) {
      const icon = document.createElement('span')
      icon.textContent = this.options.icon
      this.el.appendChild(icon)
    }

    if (this.options.text) {
      const span = document.createElement('span')
      span.textContent = this.options.text
      this.el.appendChild(span)
    }

    this.el.addEventListener('click', (e) => {
      this.createRipple(e)
      this.options.onClick?.(e)
    })

    parent.appendChild(this.el)

    // Apply spring or traditional motion
    if (this.options.spring !== undefined && this.options.spring !== false) {
      const springOpts = this.options.spring === true ? undefined : this.options.spring
      this.springHoverCtrl = springHover(this.el, { scale: 1.03, y: -1, shadow: true, spring: springOpts })
      this.springPressCtrl = springPress(this.el, { scale: 0.97, spring: springOpts })
    } else if (this.options.motion !== undefined) {
      this.motion = withMotion(this.el, this.options.motion)
    } else {
      // Default: spring hover for better feel
      this.springHoverCtrl = springHover(this.el, { scale: 1.03, y: -1, shadow: true })
      this.springPressCtrl = springPress(this.el, { scale: 0.97 })
    }
  }

  private buildClass(): string {
    const classes = ['mk-button']
    if (this.options.type && this.options.type !== 'default') {
      classes.push(`mk-button--${this.options.type}`)
    }
    if (this.options.size && this.options.size !== 'default') {
      classes.push(`mk-button--${this.options.size}`)
    }
    if (this.options.plain) classes.push('is-plain')
    if (this.options.round) classes.push('is-round')
    if (this.options.circle) classes.push('is-circle')
    if (this.options.loading) classes.push('is-loading')
    if (this.options.disabled) classes.push('is-disabled')
    return classes.join(' ')
  }

  private createRipple(e: MouseEvent): void {
    const rect = this.el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const ripple = document.createElement('span')
    ripple.className = 'mk-button__ripple'
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`
    this.el.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  setLoading(loading: boolean): void {
    this.options.loading = loading
    this.el.classList.toggle('is-loading', loading)
    this.el.disabled = loading || !!this.options.disabled
    this.updateAriaDisabled()

    const spinner = this.el.querySelector('.mk-button__spinner')
    if (loading && !spinner) {
      const s = document.createElement('span')
      s.className = 'mk-button__spinner'
      this.el.insertBefore(s, this.el.firstChild)
    } else if (!loading && spinner) {
      spinner.remove()
    }
  }

  setDisabled(disabled: boolean): void {
    this.options.disabled = disabled
    this.el.classList.toggle('is-disabled', disabled)
    this.el.disabled = disabled || !!this.options.loading
    this.updateAriaDisabled()
  }

  private updateAriaDisabled(): void {
    this.el.setAttribute('aria-disabled', String(this.el.disabled))
  }

  destroy(): void {
    this.motion?.destroy()
    this.springHoverCtrl?.destroy()
    this.springPressCtrl?.destroy()
    this.el.remove()
  }
}

export function createButton(
  container: HTMLElement | string,
  options?: ButtonOptions
): MkButton {
  return new MkButton(container, options)
}
