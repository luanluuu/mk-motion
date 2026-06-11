import './container.css'

export interface ContainerOptions {
  fluid?: boolean
  maxWidth?: number | string
  padding?: number | string
  centered?: boolean
}

export class MkContainer {
  el: HTMLDivElement

  constructor(container: HTMLElement | string, options: ContainerOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('div')
    this.el.className = 'mk-container'

    if (options.fluid) {
      this.el.classList.add('mk-container--fluid')
    }
    if (options.centered !== false) {
      this.el.classList.add('mk-container--centered')
    }
    if (options.maxWidth) {
      this.el.style.maxWidth =
        typeof options.maxWidth === 'number'
          ? `${options.maxWidth}px`
          : options.maxWidth
    }
    if (options.padding) {
      this.el.style.padding =
        typeof options.padding === 'number'
          ? `${options.padding}px`
          : options.padding
    }

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createContainer(
  container: HTMLElement | string,
  options?: ContainerOptions
): MkContainer {
  return new MkContainer(container, options)
}
