import './menu.css'
import { Keys } from '../../a11y/keyboard'

export interface MenuItem {
  index: string
  label: string
  icon?: string
  disabled?: boolean
  children?: MenuItem[]
}

export interface MenuOptions {
  mode?: 'vertical' | 'horizontal'
  items: MenuItem[]
  defaultActive?: string
  defaultOpeneds?: string[]
  collapse?: boolean
  onSelect?: (index: string) => void
  onOpen?: (index: string) => void
  onClose?: (index: string) => void
}

export class MkMenu {
  el: HTMLElement
  private options: MenuOptions
  private openeds: Set<string>
  private activeIndex: string

  constructor(container: HTMLElement | string, options: MenuOptions) {
    const parent = typeof container === 'string' ? document.querySelector(container)! : container
    this.options = { mode: 'vertical', collapse: false, ...options }
    this.openeds = new Set(options.defaultOpeneds || [])
    this.activeIndex = options.defaultActive || ''

    this.el = document.createElement('ul')
    this.el.className = `mk-menu mk-menu--${this.options.mode}`
    if (this.options.collapse) this.el.classList.add('is-collapse')
    this.el.setAttribute('role', 'menu')

    this.render()
    parent.appendChild(this.el)

    this.setupKeyboard()
  }

  private render(): void {
    this.el.innerHTML = ''
    this.options.items.forEach(item => {
      this.el.appendChild(this.renderItem(item, 0))
    })
  }

  private renderItem(item: MenuItem, level: number): HTMLElement {
    const hasChildren = item.children && item.children.length > 0
    const isOpen = this.openeds.has(item.index)
    const isActive = this.activeIndex === item.index
    const isCollapsed = this.options.collapse && this.options.mode === 'vertical'

    const li = document.createElement('li')
    li.className = 'mk-menu-item'
    if (item.disabled) li.classList.add('is-disabled')
    if (isActive) li.classList.add('is-active')
    if (hasChildren) li.classList.add('has-children')
    if (isOpen) li.classList.add('is-open')
    li.style.paddingLeft = isCollapsed ? '0' : `${16 + level * 16}px`

    const title = document.createElement('div')
    title.className = 'mk-menu-item__title'
    title.style.cursor = item.disabled ? 'not-allowed' : 'pointer'
    title.setAttribute('role', 'menuitem')
    title.setAttribute('tabindex', item.disabled ? '-1' : '0')
    if (item.disabled) {
      title.setAttribute('aria-disabled', 'true')
    }
    if (hasChildren) {
      title.setAttribute('aria-haspopup', 'true')
      title.setAttribute('aria-expanded', String(isOpen))
    }

    if (item.icon) {
      const icon = document.createElement('span')
      icon.className = 'mk-menu-item__icon'
      icon.textContent = item.icon
      title.appendChild(icon)
    }

    const text = document.createElement('span')
    text.className = 'mk-menu-item__text'
    text.textContent = item.label
    title.appendChild(text)

    if (hasChildren && !isCollapsed) {
      const arrow = document.createElement('span')
      arrow.className = 'mk-menu-item__arrow'
      arrow.textContent = '›'
      title.appendChild(arrow)
    }

    title.addEventListener('click', () => {
      if (item.disabled) return
      if (hasChildren) {
        if (isOpen) {
          this.openeds.delete(item.index)
          this.options.onClose?.(item.index)
        } else {
          this.openeds.add(item.index)
          this.options.onOpen?.(item.index)
        }
        this.render()
      } else {
        this.activeIndex = item.index
        this.options.onSelect?.(item.index)
        this.render()
      }
    })

    li.appendChild(title)

    if (hasChildren && !isCollapsed) {
      const sub = document.createElement('ul')
      sub.className = 'mk-menu-submenu'
      if (isOpen) sub.classList.add('is-open')
      sub.setAttribute('role', 'menu')
      item.children!.forEach(child => {
        sub.appendChild(this.renderItem(child, level + 1))
      })
      li.appendChild(sub)
    }

    return li
  }

  private setupKeyboard(): void {
    this.el.addEventListener('keydown', (e) => {
      const active = document.activeElement as HTMLElement
      if (!active?.classList.contains('mk-menu-item__title')) return

      const li = active.parentElement as HTMLLIElement
      const ul = li.parentElement as HTMLUListElement
      const items = Array.from(ul.children)
        .filter((el): el is HTMLLIElement => el.classList.contains('mk-menu-item'))
        .map((li) => li.querySelector('.mk-menu-item__title') as HTMLElement)
        .filter(Boolean)

      const index = items.indexOf(active)

      switch (e.key) {
        case Keys.ArrowDown:
          e.preventDefault()
          items[index + 1]?.focus()
          break
        case Keys.ArrowUp:
          e.preventDefault()
          items[index - 1]?.focus()
          break
        case Keys.Enter:
        case Keys.Space:
          e.preventDefault()
          active.click()
          break
        case Keys.Escape:
          e.preventDefault()
          // Close parent submenu if inside one
          const parentLi = ul.closest('.mk-menu-item') as HTMLLIElement | null
          if (parentLi && ul !== this.el) {
            const parentTitle = parentLi.querySelector('.mk-menu-item__title') as HTMLElement | null
            if (parentTitle) {
              const isExpanded = parentTitle.getAttribute('aria-expanded') === 'true'
              if (isExpanded) {
                parentTitle.click()
                parentTitle.focus()
              }
            }
          }
          break
      }
    })
  }

  setActive(index: string): void {
    this.activeIndex = index
    this.render()
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createMenu(container: HTMLElement | string, options: MenuOptions): MkMenu {
  return new MkMenu(container, options)
}
