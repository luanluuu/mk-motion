import '../../styles/element-plus.css'
import './collapse.css'

export interface CollapseItem {
  title: string
  content: string | HTMLElement
  disabled?: boolean
}

export interface CollapsePanelOptions {
  items: CollapseItem[]
  accordion?: boolean
  activeKeys?: number[]
}

let collapseIdCounter = 0

export class MkCollapse {
  el: HTMLDivElement
  private options: CollapsePanelOptions
  private activeKeys: Set<number>
  private itemEls: Array<{
    header: HTMLDivElement
    content: HTMLDivElement
    inner: HTMLDivElement
    arrow: HTMLSpanElement
    contentId: string
  }> = []

  constructor(container: HTMLElement | string, options: CollapsePanelOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      accordion: false,
      activeKeys: [],
      ...options,
    }

    this.activeKeys = new Set(this.options.activeKeys)

    this.el = document.createElement('div')
    this.el.className = 'mk-collapse'

    this.options.items.forEach((item, index) => {
      const contentId = `mk-collapse-content-${++collapseIdCounter}`

      const itemEl = document.createElement('div')
      itemEl.className = 'mk-collapse__item'
      if (item.disabled) itemEl.classList.add('is-disabled')

      const header = document.createElement('div')
      header.className = 'mk-collapse__header'
      header.setAttribute('role', 'button')
      header.setAttribute('tabindex', item.disabled ? '-1' : '0')
      header.setAttribute('aria-expanded', 'false')
      header.setAttribute('aria-controls', contentId)

      const title = document.createElement('span')
      title.className = 'mk-collapse__title'
      title.textContent = item.title

      const arrow = document.createElement('span')
      arrow.className = 'mk-collapse__arrow'
      arrow.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2l4 4-4 4"/></svg>'

      header.appendChild(title)
      header.appendChild(arrow)
      itemEl.appendChild(header)

      const content = document.createElement('div')
      content.className = 'mk-collapse__content'
      content.id = contentId

      const inner = document.createElement('div')
      inner.className = 'mk-collapse__inner'
      if (typeof item.content === 'string') {
        inner.innerHTML = item.content
      } else {
        inner.appendChild(item.content)
      }
      content.appendChild(inner)
      itemEl.appendChild(content)

      this.itemEls.push({ header, content, inner, arrow, contentId })

      this.el.appendChild(itemEl)

      if (!item.disabled) {
        header.addEventListener('click', () => this.toggle(index))
        header.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            this.toggle(index)
          }
        })
      }
    })

    parent.appendChild(this.el)

    requestAnimationFrame(() => {
      this.itemEls.forEach((_, index) => {
        this.updateItemState(index)
      })
    })
  }

  private toggle(index: number): void {
    const isActive = this.activeKeys.has(index)

    if (this.options.accordion) {
      const wasActive = Array.from(this.activeKeys)
      this.activeKeys.clear()
      if (!isActive) {
        this.activeKeys.add(index)
      }
      wasActive.forEach((key) => this.updateItemState(key))
      this.updateItemState(index)
    } else {
      if (isActive) {
        this.activeKeys.delete(index)
      } else {
        this.activeKeys.add(index)
      }
      this.updateItemState(index)
    }
  }

  private updateItemState(index: number): void {
    const item = this.itemEls[index]
    if (!item) return

    const isActive = this.activeKeys.has(index)
    const itemEl = item.header.parentElement as HTMLDivElement

    item.header.setAttribute('aria-expanded', String(isActive))
    item.arrow.classList.toggle('is-expanded', isActive)
    itemEl.classList.toggle('is-active', isActive)

    if (isActive) {
      item.content.style.maxHeight = `${item.inner.scrollHeight}px`
    } else {
      item.content.style.maxHeight = '0px'
    }
  }

  setActiveKeys(keys: number[]): void {
    const prev = new Set(this.activeKeys)
    this.activeKeys = new Set(keys)
    prev.forEach((key) => this.updateItemState(key))
    keys.forEach((key) => this.updateItemState(key))
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createCollapse(
  container: HTMLElement | string,
  options: CollapsePanelOptions
): MkCollapse {
  return new MkCollapse(container, options)
}
