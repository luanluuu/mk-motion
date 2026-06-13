import './steps.css'

export interface StepItem {
  title: string
  description?: string
  icon?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
}

export interface StepsOptions {
  direction?: 'horizontal' | 'vertical'
  current?: number
  items: StepItem[]
  size?: 'small' | 'default'
}

export class MkSteps {
  el: HTMLElement
  private options: StepsOptions

  constructor(container: HTMLElement | string, options: StepsOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container
    this.options = {
      direction: 'horizontal',
      current: 0,
      size: 'default',
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = `mk-steps mk-steps--${this.options.direction}`
    if (this.options.size === 'small') this.el.classList.add('mk-steps--small')

    this.render()
    parent.appendChild(this.el)
  }

  private render(): void {
    this.el.innerHTML = ''
    const { items, current = 0, direction } = this.options

    items.forEach((item, index) => {
      const step = document.createElement('div')
      step.className = 'mk-step'

      const status =
        item.status ??
        (index < current ? 'finish' : index === current ? 'process' : 'wait')
      step.classList.add(`is-${status}`)
      if (index === items.length - 1) step.classList.add('is-last')

      const head = document.createElement('div')
      head.className = 'mk-step__head'

      const line = document.createElement('div')
      line.className = 'mk-step__line'
      if (direction === 'vertical') {
        line.style.width = '1px'
        line.style.height = '100%'
        line.style.left = '15px'
        line.style.top = '30px'
      }
      head.appendChild(line)

      const icon = document.createElement('div')
      icon.className = 'mk-step__icon'
      if (status === 'finish') {
        icon.textContent = item.icon || '✓'
      } else if (status === 'error') {
        icon.textContent = item.icon || '✕'
      } else {
        icon.textContent = item.icon || String(index + 1)
      }
      head.appendChild(icon)

      const main = document.createElement('div')
      main.className = 'mk-step__main'

      const title = document.createElement('div')
      title.className = 'mk-step__title'
      title.textContent = item.title
      main.appendChild(title)

      if (item.description) {
        const desc = document.createElement('div')
        desc.className = 'mk-step__description'
        desc.textContent = item.description
        main.appendChild(desc)
      }

      step.appendChild(head)
      step.appendChild(main)
      this.el.appendChild(step)
    })
  }

  setCurrent(current: number): void {
    this.options.current = current
    this.render()
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createSteps(
  container: HTMLElement | string,
  options: StepsOptions
): MkSteps {
  return new MkSteps(container, options)
}
