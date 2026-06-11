import './space.css'

export interface SpaceOptions {
  direction?: 'horizontal' | 'vertical'
  size?: 'small' | 'default' | 'large'
  wrap?: boolean
}

export class MkSpace {
  el: HTMLDivElement

  constructor(container: HTMLElement | string, options: SpaceOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('div')
    this.el.className = 'mk-space'

    if (options.direction === 'vertical') this.el.classList.add('mk-space--vertical')
    if (options.size) this.el.classList.add(`mk-space--${options.size}`)
    if (options.wrap !== false) this.el.classList.add('mk-space--wrap')

    parent.appendChild(this.el)
  }

  add(content: string | HTMLElement): void {
    if (typeof content === 'string') {
      const span = document.createElement('span')
      span.innerHTML = content
      this.el.appendChild(span)
    } else {
      this.el.appendChild(content)
    }
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createSpace(
  container: HTMLElement | string,
  options?: SpaceOptions
): MkSpace {
  return new MkSpace(container, options)
}