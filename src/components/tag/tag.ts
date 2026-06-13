import '../../styles/element-plus.css'
import './tag.css'
import {
  withMotion,
  type MotionOptions,
} from '../../motion/component-motion.ts'
import { onKey, Keys } from '../../a11y/keyboard.ts'

export interface TagOptions {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'default' | 'large'
  closable?: boolean
  round?: boolean
  plain?: boolean
  text?: string
  onClose?: () => void
  motion?: MotionOptions
}

export class MkTag {
  el: HTMLSpanElement
  private options: TagOptions
  private motion: ReturnType<typeof withMotion> | null = null
  private _cleanupCloseKey?: () => void

  constructor(container: HTMLElement | string, options: TagOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      type: 'default',
      size: 'default',
      ...options,
    }

    this.el = document.createElement('span')
    this.el.className = this.buildClass()

    if (this.options.text) {
      this.el.textContent = this.options.text
    }

    if (this.options.closable) {
      const closeBtn = document.createElement('span')
      closeBtn.className = 'mk-tag__close'
      closeBtn.innerHTML = '×'
      closeBtn.setAttribute('role', 'button')
      closeBtn.setAttribute('tabindex', '0')
      closeBtn.setAttribute('aria-label', 'Close')
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.close()
      })
      this._cleanupCloseKey = onKey(closeBtn, [
        { key: Keys.Enter, handler: () => this.close() },
        { key: Keys.Space, handler: () => this.close() },
      ])
      this.el.appendChild(closeBtn)
    }

    parent.appendChild(this.el)

    this.motion = withMotion(
      this.el,
      options.motion || { hover: 'scale', enter: 'zoomIn', duration: 200 }
    )
  }

  private buildClass(): string {
    const classes = ['mk-tag']
    if (this.options.type && this.options.type !== 'default') {
      classes.push(`mk-tag--${this.options.type}`)
    }
    if (this.options.size && this.options.size !== 'default') {
      classes.push(`mk-tag--${this.options.size}`)
    }
    if (this.options.plain) classes.push('is-plain')
    if (this.options.round) classes.push('is-round')
    if (this.options.closable) classes.push('is-closable')
    return classes.join(' ')
  }

  setText(text: string): void {
    this.options.text = text
    if (this.options.closable) {
      const closeBtn = this.el.querySelector('.mk-tag__close')
      this.el.childNodes.forEach((node) => {
        if (node !== closeBtn) node.remove()
      })
      this.el.insertBefore(document.createTextNode(text), closeBtn)
    } else {
      this.el.textContent = text
    }
  }

  private close(): void {
    this.el.style.pointerEvents = 'none'
    this.motion?.playExit().then(() => {
      this.destroy()
    })
    this.options.onClose?.()
  }

  destroy(): void {
    this._cleanupCloseKey?.()
    this.motion?.destroy()
    this.el.remove()
  }
}

export function createTag(
  container: HTMLElement | string,
  options?: TagOptions
): MkTag {
  return new MkTag(container, options)
}
