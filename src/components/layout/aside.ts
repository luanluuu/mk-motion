import './aside.css'

export interface AsideOptions {
  width?: number | string
}

export class MkAside {
  el: HTMLElement

  constructor(container: HTMLElement | string, options: AsideOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('aside')
    this.el.className = 'mk-aside'

    if (options.width !== undefined) {
      this.el.style.width =
        typeof options.width === 'number' ? `${options.width}px` : options.width
    }

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createAside(
  container: HTMLElement | string,
  options?: AsideOptions
): MkAside {
  return new MkAside(container, options)
}
