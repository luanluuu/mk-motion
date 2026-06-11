import '../button/button.css'
import './dialog.css'
import { FocusTrap } from '../../a11y/focus-trap'
import { onKey, Keys } from '../../a11y/keyboard'
import { springOverlay } from '../../motion/component-spring.js'
import type { ComponentSpringOptions } from '../../motion/component-spring.js'

export interface DialogOptions {
  title?: string
  content?: string | HTMLElement
  showClose?: boolean
  showCancel?: boolean
  center?: boolean
  cancelText?: string
  confirmText?: string
  motion?: ComponentSpringOptions
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
}

let dialogIdCounter = 0

export class MkDialog {
  el: HTMLDivElement
  private dialog: HTMLDivElement
  private options: DialogOptions
  private focusTrap: FocusTrap
  private escapeCleanup: (() => void) | null = null
  private confirmBtn: HTMLButtonElement
  private titleId: string
  private springCtrl?: ReturnType<typeof springOverlay>
  private _isOpen = false

  constructor(options: DialogOptions = {}) {
    this.options = {
      showClose: true,
      showCancel: true,
      motion: { enabled: true },
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = 'mk-dialog-overlay'
    this.el.style.display = 'none'

    this.dialog = document.createElement('div')
    this.dialog.className = 'mk-dialog'
    if (this.options.center) this.dialog.classList.add('is-center')
    this.dialog.setAttribute('role', 'dialog')
    this.dialog.setAttribute('aria-modal', 'true')

    // Header
    const header = document.createElement('div')
    header.className = 'mk-dialog__header'

    const title = document.createElement('span')
    title.className = 'mk-dialog__title'
    title.textContent = this.options.title || ''
    this.titleId = `mk-dialog-title-${++dialogIdCounter}`
    title.id = this.titleId
    this.dialog.setAttribute('aria-labelledby', this.titleId)
    header.appendChild(title)

    if (this.options.showClose) {
      const close = document.createElement('span')
      close.className = 'mk-dialog__close'
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

    this.dialog.appendChild(header)

    // Body
    const body = document.createElement('div')
    body.className = 'mk-dialog__body'
    if (typeof this.options.content === 'string') {
      body.innerHTML = this.options.content
    } else if (this.options.content) {
      body.appendChild(this.options.content)
    }
    this.dialog.appendChild(body)

    // Footer
    const footer = document.createElement('div')
    footer.className = 'mk-dialog__footer'

    if (this.options.showCancel) {
      const cancelBtn = document.createElement('button')
      cancelBtn.className = 'mk-button'
      cancelBtn.textContent = this.options.cancelText || '取消'
      cancelBtn.addEventListener('click', () => {
        this.options.onCancel?.()
        this.close()
      })
      footer.appendChild(cancelBtn)
    }

    this.confirmBtn = document.createElement('button')
    this.confirmBtn.className = 'mk-button mk-button--primary'
    this.confirmBtn.textContent = this.options.confirmText || '确定'
    this.confirmBtn.addEventListener('click', () => {
      this.options.onConfirm?.()
      this.close()
    })
    footer.appendChild(this.confirmBtn)

    this.dialog.appendChild(footer)

    this.el.appendChild(this.dialog)

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) {
        this.options.onClose?.()
        this.close()
      }
    })

    document.body.appendChild(this.el)

    this.focusTrap = new FocusTrap(this.dialog)
    this.springCtrl = springOverlay(this.el, this.dialog, this.options.motion)
  }

  open(): void {
    if (this._isOpen) return
    this._isOpen = true
    this.el.style.display = 'flex'
    this.springCtrl?.open().then(() => {
      this.focusTrap.activate(this.confirmBtn)
      this.escapeCleanup = onKey(this.dialog, [
        { key: Keys.Escape, handler: () => this.close() },
      ])
    })
  }

  close(): void {
    if (!this._isOpen) return
    this._isOpen = false
    if (this.escapeCleanup) {
      this.escapeCleanup()
      this.escapeCleanup = null
    }
    this.focusTrap.deactivate()
    this.springCtrl?.close().then(() => {
      this.el.style.display = 'none'
      this.options.onClose?.()
    })
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

export function createDialog(options?: DialogOptions): MkDialog {
  return new MkDialog(options)
}
