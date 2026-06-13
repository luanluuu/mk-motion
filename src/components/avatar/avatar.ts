import '../../styles/element-plus.css'
import './avatar.css'

export interface AvatarOptions {
  src?: string
  text?: string
  size?: 'small' | 'default' | 'large'
  shape?: 'circle' | 'square'
  icon?: string
}

export class MkAvatar {
  el: HTMLDivElement
  private options: AvatarOptions

  constructor(container: HTMLElement | string, options: AvatarOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      size: 'default',
      shape: 'circle',
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = this.buildClass()

    if (this.options.src) {
      const img = document.createElement('img')
      img.className = 'mk-avatar__image'
      img.src = this.options.src
      img.alt = this.options.text || ''
      img.addEventListener('error', () => this.showFallback())
      this.el.appendChild(img)
    } else {
      this.showFallback()
    }

    parent.appendChild(this.el)
  }

  private buildClass(): string {
    const classes = ['mk-avatar']
    if (this.options.size && this.options.size !== 'default') {
      classes.push(`mk-avatar--${this.options.size}`)
    }
    if (this.options.shape && this.options.shape !== 'circle') {
      classes.push(`mk-avatar--${this.options.shape}`)
    }
    return classes.join(' ')
  }

  private showFallback(): void {
    const existing = this.el.querySelector('.mk-avatar__image')
    if (existing) existing.remove()

    const fallback = document.createElement('span')
    fallback.className = 'mk-avatar__fallback'

    if (this.options.icon) {
      fallback.textContent = this.options.icon
    } else if (this.options.text) {
      fallback.textContent = this.options.text
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    } else {
      fallback.textContent = '?'
    }

    this.el.appendChild(fallback)
  }

  setSrc(src: string): void {
    this.options.src = src
    const existingFallback = this.el.querySelector('.mk-avatar__fallback')
    if (existingFallback) existingFallback.remove()

    let img = this.el.querySelector(
      '.mk-avatar__image'
    ) as HTMLImageElement | null
    if (!img) {
      img = document.createElement('img')
      img.className = 'mk-avatar__image'
      img.alt = this.options.text || ''
      img.addEventListener('error', () => this.showFallback())
      this.el.appendChild(img)
    }
    img.src = src
  }

  setText(text: string): void {
    this.options.text = text
    if (!this.options.src) {
      this.showFallback()
    }
  }

  destroy(): void {
    this.el.remove()
  }
}

export interface AvatarGroupOptions {
  avatars: AvatarOptions[]
  max?: number
  size?: 'small' | 'default' | 'large'
}

export class MkAvatarGroup {
  el: HTMLDivElement
  private options: AvatarGroupOptions

  constructor(container: HTMLElement | string, options: AvatarGroupOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      size: 'default',
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = 'mk-avatar-group'
    if (this.options.size && this.options.size !== 'default') {
      this.el.classList.add(`mk-avatar-group--${this.options.size}`)
    }

    const display = this.options.max
      ? this.options.avatars.slice(0, this.options.max)
      : this.options.avatars

    display.forEach((avatarOpts) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'mk-avatar-group__item'
      new MkAvatar(wrapper, { size: this.options.size, ...avatarOpts })
      this.el.appendChild(wrapper)
    })

    const remaining = this.options.max
      ? this.options.avatars.length - this.options.max
      : 0
    if (remaining > 0) {
      const counter = document.createElement('div')
      counter.className = 'mk-avatar-group__counter'
      counter.textContent = `+${remaining}`
      this.el.appendChild(counter)
    }

    parent.appendChild(this.el)
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createAvatar(
  container: HTMLElement | string,
  options?: AvatarOptions
): MkAvatar {
  return new MkAvatar(container, options)
}

export function createAvatarGroup(
  container: HTMLElement | string,
  options: AvatarGroupOptions
): MkAvatarGroup {
  return new MkAvatarGroup(container, options)
}
