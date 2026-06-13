import './drawer.css'
import { FocusTrap } from '../../a11y/focus-trap'
import { onKey, Keys } from '../../a11y/keyboard'
import { springTo } from '../../core/spring-engine.js'
import type { SpringOptions } from '../../core/spring-engine.js'

export interface DrawerOptions {
  title?: string
  content?: string | HTMLElement
  direction?: 'right' | 'left' | 'top' | 'bottom'
  size?: number
  showClose?: boolean
  motion?: boolean | SpringOptions
  onClose?: () => void
}

export class MkDrawer {
  el: HTMLDivElement
  private drawer: HTMLDivElement
  private options: DrawerOptions
  private focusTrap: FocusTrap
  private escapeCleanup: (() => void) | null = null
  private _isOpen = false

  constructor(options: DrawerOptions = {}) {
    this.options = {
      direction: 'right',
      showClose: true,
      motion: true,
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = 'mk-drawer-overlay'
    this.el.style.display = 'none'

    this.drawer = document.createElement('div')
    this.drawer.className = `mk-drawer mk-drawer--${this.options.direction}`
    this.drawer.setAttribute('role', 'dialog')
    this.drawer.setAttribute('aria-modal', 'true')
    if (this.options.size) {
      if (
        this.options.direction === 'right' ||
        this.options.direction === 'left'
      ) {
        this.drawer.style.width = `${this.options.size}px`
      } else {
        this.drawer.style.height = `${this.options.size}px`
      }
    }

    // Header
    const header = document.createElement('div')
    header.className = 'mk-drawer__header'

    const title = document.createElement('span')
    title.className = 'mk-drawer__title'
    title.textContent = this.options.title || ''
    header.appendChild(title)

    if (this.options.showClose) {
      const close = document.createElement('span')
      close.className = 'mk-drawer__close'
      close.innerHTML = '✕'
      close.setAttribute('role', 'button')
      close.setAttribute('tabindex', '0')
      close.setAttribute('aria-label', 'Close')
      close.addEventListener('click', () => this.close())
      close.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.close()
        }
      })
      header.appendChild(close)
    }

    this.drawer.appendChild(header)

    // Body
    const body = document.createElement('div')
    body.className = 'mk-drawer__body'
    if (typeof this.options.content === 'string') {
      body.innerHTML = this.options.content
    } else if (this.options.content) {
      body.appendChild(this.options.content)
    }
    this.drawer.appendChild(body)

    this.el.appendChild(this.drawer)

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) {
        this.close()
      }
    })

    document.body.appendChild(this.el)

    this.focusTrap = new FocusTrap(this.drawer)
  }

  private getSpringOpts(): SpringOptions | undefined {
    if (this.options.motion === false) return undefined
    if (this.options.motion === true) return { stiffness: 300, damping: 28 }
    return this.options.motion as SpringOptions
  }

  private getClosedTransform(): string {
    const d = this.options.direction
    if (d === 'right') return 'translateX(100%)'
    if (d === 'left') return 'translateX(-100%)'
    if (d === 'top') return 'translateY(-100%)'
    return 'translateY(100%)'
  }

  open(): void {
    if (this._isOpen) return
    this._isOpen = true
    this.el.style.display = 'block'

    const springOpts = this.getSpringOpts()
    if (springOpts) {
      this.el.style.opacity = '0'
      this.drawer.style.transition = 'none'
      this.drawer.style.transform = this.getClosedTransform()

      Promise.all([
        springTo(this.el, { opacity: 1 }, springOpts),
        springTo(this.drawer, { x: 0, y: 0 }, springOpts),
      ]).then(() => {
        this.focusTrap.activate()
        this.escapeCleanup = onKey(this.drawer, [
          { key: Keys.Escape, handler: () => this.close() },
        ])
      })
    } else {
      this.el.classList.add('is-open')
      this.focusTrap.activate()
      this.escapeCleanup = onKey(this.drawer, [
        { key: Keys.Escape, handler: () => this.close() },
      ])
    }
  }

  close(): void {
    if (!this._isOpen) return
    this._isOpen = false
    if (this.escapeCleanup) {
      this.escapeCleanup()
      this.escapeCleanup = null
    }
    this.focusTrap.deactivate()

    const springOpts = this.getSpringOpts()
    if (springOpts) {
      const d = this.options.direction
      const to: Record<string, number> = { opacity: 0 }
      if (d === 'right' || d === 'left') to.x = d === 'right' ? 100 : -100
      else to.y = d === 'top' ? -100 : 100

      Promise.all([
        springTo(
          this.el,
          { opacity: 0 },
          { ...springOpts, stiffness: (springOpts.stiffness ?? 300) * 1.5 }
        ),
        springTo(this.drawer, to, {
          ...springOpts,
          stiffness: (springOpts.stiffness ?? 300) * 1.5,
        }),
      ]).then(() => {
        this.el.style.display = 'none'
        this.options.onClose?.()
      })
    } else {
      this.el.classList.remove('is-open')
      setTimeout(() => {
        this.el.style.display = 'none'
        this.options.onClose?.()
      }, 300)
    }
  }

  destroy(): void {
    if (this.escapeCleanup) {
      this.escapeCleanup()
      this.escapeCleanup = null
    }
    this.focusTrap.deactivate()
    this.el.remove()
  }
}

export function createDrawer(options?: DrawerOptions): MkDrawer {
  return new MkDrawer(options)
}
