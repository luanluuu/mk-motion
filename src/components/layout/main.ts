import './main.css'

export class MkMain {
  el: HTMLElement

  constructor(container: HTMLElement | string) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('main')
    this.el.className = 'mk-main'

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createMain(container: HTMLElement | string): MkMain {
  return new MkMain(container)
}
