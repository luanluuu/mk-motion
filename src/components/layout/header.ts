import './header.css'

export interface HeaderOptions {
  height?: number | string
}

export class MkHeader {
  el: HTMLElement

  constructor(container: HTMLElement | string, options: HeaderOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('header')
    this.el.className = 'mk-header'

    if (options.height !== undefined) {
      this.el.style.height =
        typeof options.height === 'number' ? `${options.height}px` : options.height
    }

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createHeader(
  container: HTMLElement | string,
  options?: HeaderOptions
): MkHeader {
  return new MkHeader(container, options)
}
