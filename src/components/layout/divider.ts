import './divider.css'

export interface DividerOptions {
  text?: string
  direction?: 'horizontal' | 'vertical'
  dashed?: boolean
}

export class MkDivider {
  el: HTMLDivElement

  constructor(container: HTMLElement | string, options: DividerOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('div')
    this.el.className = 'mk-divider'

    if (options.direction === 'vertical') {
      this.el.classList.add('mk-divider--vertical')
    } else {
      this.el.classList.add('mk-divider--horizontal')
    }
    if (options.dashed) this.el.classList.add('mk-divider--dashed')
    if (options.text) this.el.textContent = options.text

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createDivider(
  container: HTMLElement | string,
  options?: DividerOptions
): MkDivider {
  return new MkDivider(container, options)
}