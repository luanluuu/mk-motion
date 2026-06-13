import './breadcrumb.css'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface BreadcrumbOptions {
  items: BreadcrumbItem[]
  separator?: string | HTMLElement
}

export class MkBreadcrumb {
  el: HTMLElement

  constructor(container: HTMLElement | string, options: BreadcrumbOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('nav')
    this.el.className = 'mk-breadcrumb'
    this.el.setAttribute('aria-label', 'breadcrumb')

    const sep = options.separator ?? '/'

    options.items.forEach((item, index) => {
      const isLast = index === options.items.length - 1

      if (index > 0) {
        const separatorEl = document.createElement('span')
        separatorEl.className = 'mk-breadcrumb__separator'
        if (typeof sep === 'string') {
          separatorEl.textContent = sep
        } else if (sep instanceof HTMLElement) {
          separatorEl.appendChild(sep)
        }
        this.el.appendChild(separatorEl)
      }

      if (isLast) {
        const span = document.createElement('span')
        span.className = 'mk-breadcrumb__item is-current'
        span.setAttribute('aria-current', 'page')
        span.textContent = item.label
        this.el.appendChild(span)
      } else {
        const link = document.createElement(item.href ? 'a' : 'span')
        link.className = 'mk-breadcrumb__item is-link'
        if (item.href) {
          ;(link as HTMLAnchorElement).href = item.href
        }
        link.textContent = item.label
        link.style.cursor = item.onClick || item.href ? 'pointer' : 'default'
        if (item.onClick) {
          link.addEventListener('click', item.onClick)
        }
        this.el.appendChild(link)
      }
    })

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createBreadcrumb(
  container: HTMLElement | string,
  options: BreadcrumbOptions
): MkBreadcrumb {
  return new MkBreadcrumb(container, options)
}
