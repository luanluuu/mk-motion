import '../../styles/element-plus.css'
import './tabs.css'
import { Keys } from '../../a11y/keyboard'

export interface TabItem {
  label: string
  content?: string | HTMLElement
  disabled?: boolean
}

export interface TabsOptions {
  type?: 'line' | 'card' | 'pill'
  items?: TabItem[]
  activeIndex?: number
  onChange?: (index: number) => void
}

let tabsIdCounter = 0

export class MkTabs {
  el: HTMLDivElement
  private options: TabsOptions
  private headerEl: HTMLDivElement
  private contentEl: HTMLDivElement
  private indicatorEl: HTMLDivElement | null = null
  private tabItems: HTMLButtonElement[] = []
  private panels: HTMLDivElement[] = []
  private currentIndex: number
  private tabIdPrefix: string

  constructor(container: HTMLElement | string, options: TabsOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      type: 'line',
      items: [],
      activeIndex: 0,
      ...options,
    }
    this.currentIndex = this.options.activeIndex!
    this.tabIdPrefix = `mk-tabs-${++tabsIdCounter}`

    this.el = document.createElement('div')
    this.el.className = `mk-tabs mk-tabs--${this.options.type}`

    this.headerEl = document.createElement('div')
    this.headerEl.className = 'mk-tabs__header'
    this.headerEl.setAttribute('role', 'tablist')
    this.el.appendChild(this.headerEl)

    this.contentEl = document.createElement('div')
    this.contentEl.className = 'mk-tabs__content'
    this.el.appendChild(this.contentEl)

    if (this.options.type === 'line') {
      this.indicatorEl = document.createElement('div')
      this.indicatorEl.className = 'mk-tabs__indicator'
      this.headerEl.appendChild(this.indicatorEl)
    }

    this.renderTabs()
    this.setActive(this.currentIndex, false)

    parent.appendChild(this.el)
  }

  private renderTabs(): void {
    this.options.items?.forEach((item, index) => {
      const panelId = `${this.tabIdPrefix}-panel-${index}`
      const tabId = `${this.tabIdPrefix}-tab-${index}`

      const tabBtn = document.createElement('button')
      tabBtn.className = 'mk-tabs__item'
      tabBtn.type = 'button'
      tabBtn.textContent = item.label
      tabBtn.id = tabId
      tabBtn.setAttribute('role', 'tab')
      tabBtn.setAttribute('aria-controls', panelId)
      if (item.disabled) {
        tabBtn.disabled = true
        tabBtn.classList.add('is-disabled')
      }
      tabBtn.addEventListener('click', () => {
        if (item.disabled) return
        this.setActive(index)
      })
      this.headerEl.appendChild(tabBtn)
      this.tabItems.push(tabBtn)

      const panel = document.createElement('div')
      panel.className = 'mk-tabs__panel'
      panel.id = panelId
      panel.setAttribute('role', 'tabpanel')
      panel.setAttribute('aria-labelledby', tabId)
      if (item.content) {
        if (typeof item.content === 'string') {
          panel.textContent = item.content
        } else {
          panel.appendChild(item.content)
        }
      }
      this.contentEl.appendChild(panel)
      this.panels.push(panel)
    })

    this.headerEl.addEventListener('keydown', (e) => {
      const navKeys: string[] = [
        Keys.ArrowLeft,
        Keys.ArrowRight,
        Keys.Home,
        Keys.End,
      ]
      if (!navKeys.includes(e.key)) return
      const tabs = this.tabItems.filter(
        (_, i) => !this.options.items?.[i]?.disabled
      )
      const activeTab = this.tabItems[this.currentIndex]
      let currentIdx = tabs.indexOf(activeTab)
      if (currentIdx === -1) currentIdx = 0

      let nextIdx = currentIdx
      switch (e.key) {
        case Keys.ArrowLeft:
          e.preventDefault()
          nextIdx = currentIdx > 0 ? currentIdx - 1 : tabs.length - 1
          break
        case Keys.ArrowRight:
          e.preventDefault()
          nextIdx = currentIdx < tabs.length - 1 ? currentIdx + 1 : 0
          break
        case Keys.Home:
          e.preventDefault()
          nextIdx = 0
          break
        case Keys.End:
          e.preventDefault()
          nextIdx = tabs.length - 1
          break
      }
      const nextTab = tabs[nextIdx]
      if (nextTab) {
        const realIndex = this.tabItems.indexOf(nextTab)
        this.setActive(realIndex)
        nextTab.focus()
      }
    })
  }

  setActive(index: number, animate = true): void {
    if (index < 0 || index >= this.tabItems.length) return
    if (this.options.items?.[index]?.disabled) return

    const prevIndex = this.currentIndex
    this.currentIndex = index

    this.tabItems.forEach((tab, i) => {
      const isActive = i === index
      tab.classList.toggle('is-active', isActive)
      tab.setAttribute('aria-selected', String(isActive))
      tab.setAttribute('tabindex', isActive ? '0' : '-1')
    })

    this.panels.forEach((panel, i) => {
      const isActive = i === index
      panel.classList.toggle('is-active', isActive)

      if (isActive) {
        panel.style.display = 'block'
        if (animate) {
          requestAnimationFrame(() => {
            panel.classList.add('is-entering')
            requestAnimationFrame(() => {
              panel.classList.remove('is-entering')
            })
          })
        }
      } else {
        panel.style.display = 'none'
        panel.classList.remove('is-entering')
      }
    })

    if (this.indicatorEl) {
      this.updateIndicator()
    }

    if (prevIndex !== index) {
      this.options.onChange?.(index)
    }
  }

  private updateIndicator(): void {
    if (!this.indicatorEl) return
    const activeTab = this.tabItems[this.currentIndex]
    if (!activeTab) return
    const headerRect = this.headerEl.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()
    this.indicatorEl.style.left = `${tabRect.left - headerRect.left + this.headerEl.scrollLeft}px`
    this.indicatorEl.style.width = `${tabRect.width}px`
  }

  getActive(): number {
    return this.currentIndex
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createTabs(
  container: HTMLElement | string,
  options?: TabsOptions
): MkTabs {
  return new MkTabs(container, options)
}
