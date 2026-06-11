import './row.css'

export interface RowOptions {
  gutter?: number
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  align?: 'top' | 'middle' | 'bottom'
  wrap?: boolean
}

export class MkRow {
  el: HTMLDivElement

  constructor(container: HTMLElement | string, options: RowOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('div')
    this.el.className = 'mk-row'

    if (options.justify) this.el.classList.add(`mk-row--justify-${options.justify}`)
    if (options.align) this.el.classList.add(`mk-row--align-${options.align}`)
    if (options.wrap === false) this.el.classList.add('mk-row--no-wrap')
    if (options.gutter) {
      this.el.style.margin = `0 -${options.gutter / 2}px`
    }

    parent.appendChild(this.el)
  }

  addCol(
    span: number | 'flex',
    content?: string | HTMLElement,
    options?: { offset?: number; className?: string }
  ): HTMLDivElement {
    const col = document.createElement('div')
    col.className = `mk-col mk-col-${span === 'flex' ? 'flex' : span}`
    if (options?.offset) {
      col.classList.add(`mk-col-offset-${options.offset}`)
    }
    if (options?.className) {
      options.className.split(' ').forEach(c => col.classList.add(c))
    }

    if (typeof content === 'string') {
      col.innerHTML = content
    } else if (content) {
      col.appendChild(content)
    }

    this.el.appendChild(col)
    return col
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createRow(
  container: HTMLElement | string,
  options?: RowOptions
): MkRow {
  return new MkRow(container, options)
}