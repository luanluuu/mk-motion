import './layout.css'

export interface LayoutOptions {
  direction?: 'vertical' | 'horizontal'
}

export class MkLayout {
  el: HTMLDivElement

  constructor(container: HTMLElement | string, options: LayoutOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('div')
    this.el.className = 'mk-layout'

    if (options.direction === 'horizontal') {
      this.el.classList.add('mk-layout--horizontal')
    } else {
      this.el.classList.add('mk-layout--vertical')
    }

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createLayout(
  container: HTMLElement | string,
  options?: LayoutOptions
): MkLayout {
  return new MkLayout(container, options)
}
