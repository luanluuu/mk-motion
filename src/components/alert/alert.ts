import '../../styles/element-plus.css'
import './alert.css'

export interface AlertOptions {
  type?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  description?: string
  closable?: boolean
  showIcon?: boolean
  onClose?: () => void
}

const typeIcons: Record<string, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✕',
}

export class MkAlert {
  el: HTMLDivElement
  private options: AlertOptions

  constructor(container: HTMLElement | string, options: AlertOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      type: 'info',
      showIcon: true,
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = this.buildClass()
    this.el.setAttribute('role', 'alert')

    if (this.options.showIcon) {
      const icon = document.createElement('span')
      icon.className = 'mk-alert__icon'
      icon.textContent = typeIcons[this.options.type!]
      this.el.appendChild(icon)
    }

    const content = document.createElement('div')
    content.className = 'mk-alert__content'

    if (this.options.title) {
      const title = document.createElement('div')
      title.className = 'mk-alert__title'
      title.textContent = this.options.title
      content.appendChild(title)
    }

    if (this.options.description) {
      const desc = document.createElement('div')
      desc.className = 'mk-alert__description'
      desc.textContent = this.options.description
      content.appendChild(desc)
    }

    this.el.appendChild(content)

    if (this.options.closable) {
      const closeBtn = document.createElement('button')
      closeBtn.className = 'mk-alert__close'
      closeBtn.setAttribute('aria-label', 'Close')
      closeBtn.innerHTML = '×'
      closeBtn.addEventListener('click', () => this.close())
      this.el.appendChild(closeBtn)
    }

    parent.appendChild(this.el)
  }

  private buildClass(): string {
    const classes = ['mk-alert', `mk-alert--${this.options.type}`]
    if (this.options.closable) classes.push('is-closable')
    return classes.join(' ')
  }

  close(): void {
    this.el.classList.add('is-closing')
    this.el.style.pointerEvents = 'none'
    this.el.addEventListener(
      'transitionend',
      () => {
        this.destroy()
        this.options.onClose?.()
      },
      { once: true }
    )
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createAlert(
  container: HTMLElement | string,
  options?: AlertOptions
): MkAlert {
  return new MkAlert(container, options)
}
