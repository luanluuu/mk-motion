import './dropdown.css'

export interface DropdownItem {
  label: string
  value: string
  disabled?: boolean
  divided?: boolean
}

export interface DropdownOptions {
  items: DropdownItem[]
  trigger?: 'click' | 'hover'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  onSelect?: (value: string) => void
}

export class MkDropdown {
  el: HTMLDivElement
  private options: DropdownOptions
  private trigger: HTMLButtonElement
  private menu: HTMLDivElement
  private isOpen = false
  private cleanupFns: Array<() => void> = []
  private showTimer: ReturnType<typeof setTimeout> | null = null
  private hideTimer: ReturnType<typeof setTimeout> | null = null

  constructor(container: HTMLElement | string, options: DropdownOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = { trigger: 'click', placement: 'bottom', ...options }

    this.el = document.createElement('div')
    this.el.className = 'mk-dropdown'

    this.trigger = document.createElement('button')
    this.trigger.type = 'button'
    this.trigger.className = 'mk-dropdown__trigger'
    this.trigger.textContent = 'Dropdown'
    this.trigger.setAttribute('aria-haspopup', 'true')
    this.trigger.setAttribute('aria-expanded', 'false')

    this.menu = document.createElement('div')
    this.menu.className = 'mk-dropdown__menu'
    this.menu.style.position = 'absolute'
    this.menu.style.zIndex = 'var(--mk-z-popover, 1000)'

    this.renderItems()

    this.el.appendChild(this.trigger)
    this.el.appendChild(this.menu)

    this.setupEvents()

    parent.appendChild(this.el)
  }

  show(): void {
    if (this.isOpen) return
    this.isOpen = true
    this.trigger.setAttribute('aria-expanded', 'true')
    this.menu.style.display = 'block'
    requestAnimationFrame(() => {
      if (!this.isOpen) return
      this.position()
      this.menu.classList.add('is-open')
    })
  }

  hide(): void {
    if (!this.isOpen) return
    this.isOpen = false
    this.trigger.setAttribute('aria-expanded', 'false')
    this.menu.classList.remove('is-open')
    setTimeout(() => {
      if (!this.isOpen) this.menu.style.display = 'none'
    }, 150)
  }

  toggle(): void {
    this.isOpen ? this.hide() : this.show()
  }

  setItems(items: DropdownItem[]): void {
    this.options.items = items
    this.renderItems()
  }

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns = []
    if (this.showTimer) clearTimeout(this.showTimer)
    if (this.hideTimer) clearTimeout(this.hideTimer)
    this.el.remove()
  }

  private renderItems(): void {
    this.menu.innerHTML = ''
    this.options.items.forEach((item) => {
      const el = document.createElement('div')
      el.className = 'mk-dropdown__item'
      el.textContent = item.label
      el.setAttribute('role', 'menuitem')
      if (item.disabled) {
        el.classList.add('is-disabled')
        el.setAttribute('aria-disabled', 'true')
      }
      if (item.divided) {
        el.classList.add('is-divided')
      }
      if (!item.disabled) {
        el.addEventListener('click', () => {
          this.options.onSelect?.(item.value)
          this.hide()
        })
      }
      this.menu.appendChild(el)
    })
  }

  private setupEvents(): void {
    if (this.options.trigger === 'click') {
      const onClick = (e: MouseEvent) => {
        e.stopPropagation()
        this.toggle()
      }
      this.trigger.addEventListener('click', onClick)
      this.cleanupFns.push(() => this.trigger.removeEventListener('click', onClick))

      const onDocClick = (e: MouseEvent) => {
        if (this.isOpen && !this.el.contains(e.target as Node)) {
          this.hide()
        }
      }
      document.addEventListener('click', onDocClick)
      this.cleanupFns.push(() => document.removeEventListener('click', onDocClick))
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
      this.trigger.addEventListener('mouseenter', onEnter)
      this.trigger.addEventListener('mouseleave', onLeave)
      this.cleanupFns.push(() => this.trigger.removeEventListener('mouseenter', onEnter))
      this.cleanupFns.push(() => this.trigger.removeEventListener('mouseleave', onLeave))

      const onMenuEnter = () => {
        if (this.hideTimer) {
          clearTimeout(this.hideTimer)
          this.hideTimer = null
        }
      }
      const onMenuLeave = () => {
        this.hideTimer = setTimeout(() => this.hide(), 150)
      }
      this.menu.addEventListener('mouseenter', onMenuEnter)
      this.menu.addEventListener('mouseleave', onMenuLeave)
      this.cleanupFns.push(() => this.menu.removeEventListener('mouseenter', onMenuEnter))
      this.cleanupFns.push(() => this.menu.removeEventListener('mouseleave', onMenuLeave))
    }
  }

  private position(): void {
    const triggerRect = this.trigger.getBoundingClientRect()
    const menuRect = this.menu.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    let top = 0
    let left = 0

    switch (this.options.placement) {
      case 'top':
        top = triggerRect.top + scrollY - menuRect.height - 4
        left = triggerRect.left + scrollX
        break
      case 'bottom':
        top = triggerRect.bottom + scrollY + 4
        left = triggerRect.left + scrollX
        break
      case 'left':
        top = triggerRect.top + scrollY
        left = triggerRect.left + scrollX - menuRect.width - 4
        break
      case 'right':
        top = triggerRect.top + scrollY
        left = triggerRect.right + scrollX + 4
        break
    }

    const padding = 8
    if (left < padding) left = padding
    if (left + menuRect.width > window.innerWidth - padding) {
      left = window.innerWidth - menuRect.width - padding
    }
    if (top < padding) top = padding

    this.menu.style.top = `${top}px`
    this.menu.style.left = `${left}px`
  }
}

export function createDropdown(
  container: HTMLElement | string,
  options: DropdownOptions
): MkDropdown {
  return new MkDropdown(container, options)
}
