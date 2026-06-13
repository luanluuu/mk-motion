import './footer.css'

export interface FooterOptions {
  height?: number | string
}

export class MkFooter {
  el: HTMLElement

  constructor(container: HTMLElement | string, options: FooterOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('footer')
    this.el.className = 'mk-footer'

    if (options.height !== undefined) {
      this.el.style.height =
        typeof options.height === 'number'
          ? `${options.height}px`
          : options.height
    }

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createFooter(
  container: HTMLElement | string,
  options?: FooterOptions
): MkFooter {
  return new MkFooter(container, options)
}
