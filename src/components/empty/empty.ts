import '../../styles/element-plus.css'
import './empty.css'

export interface EmptyOptions {
  description?: string
  image?: string | 'default'
  imageStyle?: Partial<CSSStyleDeclaration>
}

const defaultSvg = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="30" width="80" height="60" rx="8" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
  <circle cx="45" cy="55" r="8" fill="currentColor" opacity="0.2"/>
  <rect x="60" y="48" width="28" height="4" rx="2" fill="currentColor" opacity="0.2"/>
  <rect x="60" y="58" width="20" height="4" rx="2" fill="currentColor" opacity="0.15"/>
  <line x1="35" y1="82" x2="85" y2="82" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.15"/>
  <line x1="45" y1="90" x2="75" y2="90" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.1"/>
</svg>`

export class MkEmpty {
  el: HTMLDivElement
  private options: EmptyOptions

  constructor(container: HTMLElement | string, options: EmptyOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      image: 'default',
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = 'mk-empty'

    const imageWrap = document.createElement('div')
    imageWrap.className = 'mk-empty__image'
    if (this.options.imageStyle) {
      Object.assign(imageWrap.style, this.options.imageStyle)
    }

    if (this.options.image === 'default') {
      imageWrap.innerHTML = defaultSvg
    } else if (this.options.image) {
      const img = document.createElement('img')
      img.src = this.options.image
      img.alt = ''
      imageWrap.appendChild(img)
    }

    this.el.appendChild(imageWrap)

    if (this.options.description) {
      const desc = document.createElement('p')
      desc.className = 'mk-empty__description'
      desc.textContent = this.options.description
      this.el.appendChild(desc)
    }

    parent.appendChild(this.el)
  }

  setDescription(text: string): void {
    this.options.description = text
    let desc = this.el.querySelector('.mk-empty__description') as HTMLParagraphElement | null
    if (!desc) {
      desc = document.createElement('p')
      desc.className = 'mk-empty__description'
      this.el.appendChild(desc)
    }
    desc.textContent = text
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createEmpty(
  container: HTMLElement | string,
  options?: EmptyOptions
): MkEmpty {
  return new MkEmpty(container, options)
}
