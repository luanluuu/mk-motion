import './card.css'
import { withMotion, type MotionOptions } from '../../motion/component-motion.ts'
import { springHover } from '../../motion/component-spring.ts'
import type { SpringOptions } from '../../core/spring-engine.ts'

export interface CardOptions {
  title?: string
  body?: string
  footer?: string
  image?: string
  shadow?: 'always' | 'hover' | 'never'
  loading?: boolean
  motion?: MotionOptions
  /** Enable spring physics hover instead of CSS transitions */
  spring?: boolean | SpringOptions
}

export class MkCard {
  el: HTMLDivElement
  private motion: ReturnType<typeof withMotion> | null = null
  private springHoverCtrl?: ReturnType<typeof springHover>

  constructor(container: HTMLElement | string, options: CardOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.el = document.createElement('div')
    this.el.className = 'mk-card'

    if (options.shadow) {
      if (options.shadow === 'always') this.el.classList.add('is-always-shadow')
      else if (options.shadow === 'hover') this.el.classList.add('is-hover-shadow')
    }
    if (options.loading) {
      this.el.classList.add('is-loading')
    }

    if (options.image) {
      const img = document.createElement('img')
      img.className = 'mk-card__image'
      img.src = options.image
      img.alt = ''
      this.el.appendChild(img)
    }

    if (options.title) {
      const header = document.createElement('div')
      header.className = 'mk-card__header'
      const title = document.createElement('span')
      title.className = 'mk-card__title'
      title.textContent = options.title
      header.appendChild(title)
      this.el.appendChild(header)
    }

    const body = document.createElement('div')
    body.className = 'mk-card__body'
    if (options.body) {
      body.innerHTML = options.body
    }
    this.el.appendChild(body)

    if (options.footer) {
      const footer = document.createElement('div')
      footer.className = 'mk-card__footer'
      footer.textContent = options.footer
      this.el.appendChild(footer)
    }

    parent.appendChild(this.el)

    // Apply spring or traditional motion
    if (options.spring !== undefined && options.spring !== false) {
      const springOpts = options.spring === true ? undefined : options.spring
      this.springHoverCtrl = springHover(this.el, { scale: 1.01, y: -4, shadow: true, spring: springOpts })
    } else if (options.motion !== undefined) {
      this.motion = withMotion(this.el, options.motion)
    } else {
      // Default: spring hover for better feel
      this.springHoverCtrl = springHover(this.el, { scale: 1.01, y: -4, shadow: true })
    }
  }

  setLoading(loading: boolean): void {
    this.el.classList.toggle('is-loading', loading)
  }

  destroy(): void {
    this.motion?.destroy()
    this.springHoverCtrl?.destroy()
    this.el.remove()
  }
}

export function createCard(
  container: HTMLElement | string,
  options?: CardOptions
): MkCard {
  return new MkCard(container, options)
}
