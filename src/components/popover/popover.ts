import '../../styles/element-plus.css'
import './popover.css'
import { FocusTrap } from '../../a11y/focus-trap'
import { onKey, Keys } from '../../a11y/keyboard'

export interface PopoverOptions {
  content?: string | HTMLElement
  title?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'click' | 'hover'
  width?: number
  offset?: number
}

export class MkPopover {
  el: HTMLDivElement
  private options: PopoverOptions
  private popoverEl: HTMLDivElement | null = null
  private arrowEl: HTMLDivElement | null = null
  private contentEl: HTMLDivElement | null = null
  private showTimer: ReturnType<typeof setTimeout> | null = null
  private hideTimer: ReturnType<typeof setTimeout> | null = null
  private isVisible = false
  private cleanupFns: Array<() => void> = []
  private focusTrap: FocusTrap | null = null
  private escapeCleanup: (() => void) | null = null
  constructor(target: HTMLElement, options: PopoverOptions = {}) {
    this.options = {
      placement: 'top',
      trigger: 'hover',
      offset: 8,
      ...options,
    }

    this.el = document.createElement('div')
    this.el.style.display = 'contents'

    this.buildPopover()

    if (this.options.trigger === 'click') {
      const onClick = (e: MouseEvent) => {
        e.stopPropagation()
        this.toggle()
      }
      target.addEventListener('click', onClick)
      this.cleanupFns.push(() => target.removeEventListener('click', onClick))

      const onDocClick = (e: MouseEvent) => {
        if (
          this.isVisible &&
          this.popoverEl &&
          !this.popoverEl.contains(e.target as Node) &&
          e.target !== target
        ) {
          this.hide()
        }
      }
      document.addEventListener('click', onDocClick)
      this.cleanupFns.push(() =>
        document.removeEventListener('click', onDocClick)
      )
    } else {
      const onEnter = () => {
        if (this.hideTimer) {
          clearTimeout(this.hideTimer)
          this.hideTimer = null
        }
        this.showTimer = setTimeout(() => this.show(), 150)
      }
      const onLeave = () => {
        if (this.showTimer) {
          clearTimeout(this.showTimer)
          this.showTimer = null
        }
        this.hideTimer = setTimeout(() => this.hide(), 150)
      }

      target.addEventListener('mouseenter', onEnter)
      target.addEventListener('mouseleave', onLeave)
      target.addEventListener('focus', onEnter)
      target.addEventListener('blur', onLeave)

      this.cleanupFns.push(() =>
        target.removeEventListener('mouseenter', onEnter)
      )
      this.cleanupFns.push(() =>
        target.removeEventListener('mouseleave', onLeave)
      )
      this.cleanupFns.push(() => target.removeEventListener('focus', onEnter))
      this.cleanupFns.push(() => target.removeEventListener('blur', onLeave))

      if (this.popoverEl) {
        const onPopoverEnter = () => {
          if (this.hideTimer) {
            clearTimeout(this.hideTimer)
            this.hideTimer = null
          }
        }
        const onPopoverLeave = () => {
          this.hideTimer = setTimeout(() => this.hide(), 150)
        }
        this.popoverEl.addEventListener('mouseenter', onPopoverEnter)
        this.popoverEl.addEventListener('mouseleave', onPopoverLeave)
        this.cleanupFns.push(() =>
          this.popoverEl!.removeEventListener('mouseenter', onPopoverEnter)
        )
        this.cleanupFns.push(() =>
          this.popoverEl!.removeEventListener('mouseleave', onPopoverLeave)
        )
      }
    }

    target.appendChild(this.el)
  }

  private buildPopover(): void {
    this.popoverEl = document.createElement('div')
    this.popoverEl.className = 'mk-popover'
    this.popoverEl.style.position = 'absolute'
    this.popoverEl.style.zIndex = 'var(--mk-z-popover)'
    this.popoverEl.setAttribute(
      'role',
      this.options.trigger === 'click' ? 'dialog' : 'tooltip'
    )
    if (this.options.trigger === 'click') {
      this.popoverEl.setAttribute('tabindex', '-1')
    }
    if (this.options.width) {
      this.popoverEl.style.width = `${this.options.width}px`
    }

    this.arrowEl = document.createElement('div')
    this.arrowEl.className = 'mk-popover__arrow'
    this.popoverEl.appendChild(this.arrowEl)

    if (this.options.title) {
      const title = document.createElement('div')
      title.className = 'mk-popover__title'
      title.textContent = this.options.title
      this.popoverEl.appendChild(title)
    }

    this.contentEl = document.createElement('div')
    this.contentEl.className = 'mk-popover__content'
    if (typeof this.options.content === 'string') {
      this.contentEl.textContent = this.options.content
    } else if (this.options.content) {
      this.contentEl.appendChild(this.options.content)
    }
    this.popoverEl.appendChild(this.contentEl)

    document.body.appendChild(this.popoverEl)
  }

  private position(): void {
    if (!this.popoverEl || !this.arrowEl) return

    const target = this.el.parentElement as HTMLElement
    const rect = target.getBoundingClientRect()
    const popRect = this.popoverEl.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const offset = this.options.offset!

    let top = 0
    let left = 0
    let arrowClass = ''

    switch (this.options.placement) {
      case 'top':
        top = rect.top + scrollY - popRect.height - offset
        left = rect.left + scrollX + rect.width / 2 - popRect.width / 2
        arrowClass = 'is-bottom'
        break
      case 'bottom':
        top = rect.bottom + scrollY + offset
        left = rect.left + scrollX + rect.width / 2 - popRect.width / 2
        arrowClass = 'is-top'
        break
      case 'left':
        top = rect.top + scrollY + rect.height / 2 - popRect.height / 2
        left = rect.left + scrollX - popRect.width - offset
        arrowClass = 'is-right'
        break
      case 'right':
        top = rect.top + scrollY + rect.height / 2 - popRect.height / 2
        left = rect.right + scrollX + offset
        arrowClass = 'is-left'
        break
      default:
        top = rect.top + scrollY - popRect.height - offset
        left = rect.left + scrollX + rect.width / 2 - popRect.width / 2
        arrowClass = 'is-bottom'
    }

    const padding = 8
    if (left < padding) left = padding
    if (left + popRect.width > window.innerWidth - padding) {
      left = window.innerWidth - popRect.width - padding
    }
    if (top < padding) top = padding

    this.popoverEl.style.top = `${top}px`
    this.popoverEl.style.left = `${left}px`
    this.arrowEl.className = `mk-popover__arrow ${arrowClass}`
  }

  show(): void {
    if (!this.popoverEl) return
    this.isVisible = true

    this.popoverEl.classList.remove('is-visible')
    this.popoverEl.style.visibility = 'hidden'
    this.popoverEl.style.display = 'block'

    requestAnimationFrame(() => {
      if (!this.isVisible) return
      this.position()
      this.popoverEl!.style.visibility = 'visible'
      this.popoverEl!.classList.add('is-visible')

      if (this.options.trigger === 'click') {
        if (!this.focusTrap) {
          this.focusTrap = new FocusTrap(this.popoverEl!)
        }
        this.focusTrap.activate(this.popoverEl!)
        this.escapeCleanup = onKey(this.popoverEl!, [
          { key: Keys.Escape, handler: () => this.hide() },
        ])
      }
    })
  }

  hide(): void {
    if (!this.popoverEl) return
    this.isVisible = false
    this.popoverEl.classList.remove('is-visible')
    if (this.escapeCleanup) {
      this.escapeCleanup()
      this.escapeCleanup = null
    }
    if (this.focusTrap) {
      this.focusTrap.deactivate()
    }
    this.hideTimer = setTimeout(() => {
      if (!this.isVisible) {
        this.popoverEl!.style.display = 'none'
      }
    }, 200)
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  setContent(content: string | HTMLElement): void {
    if (!this.contentEl) return
    this.contentEl.innerHTML = ''
    if (typeof content === 'string') {
      this.contentEl.textContent = content
    } else {
      this.contentEl.appendChild(content)
    }
  }

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns = []
    if (this.showTimer) clearTimeout(this.showTimer)
    if (this.hideTimer) clearTimeout(this.hideTimer)
    if (this.escapeCleanup) {
      this.escapeCleanup()
      this.escapeCleanup = null
    }
    if (this.focusTrap) {
      this.focusTrap.deactivate()
    }
    this.popoverEl?.remove()
    this.el.remove()
  }
}

export function createPopover(
  target: HTMLElement,
  options?: PopoverOptions
): MkPopover {
  return new MkPopover(target, options)
}
