export interface FlipCardOptions {
  axis?: 'x' | 'y'         // 翻转轴
  duration?: number        // 翻转时长
  perspective?: number     // 透视距离
}

const DEFAULT_FLIP: Required<FlipCardOptions> = {
  axis: 'y',
  duration: 600,
  perspective: 1000,
}

export class FlipCard {
  private container: HTMLElement
  private inner: HTMLElement
  private front: HTMLElement
  private back: HTMLElement
  private flipped = false
  private options: Required<FlipCardOptions>

  constructor(
    container: HTMLElement | string,
    options: FlipCardOptions = {}
  ) {
    this.container =
      typeof container === 'string'
        ? document.querySelector<HTMLElement>(container)!
        : container

    if (!this.container) {
      throw new Error('FlipCard: container not found')
    }

    this.options = { ...DEFAULT_FLIP, ...options }

    // 自动创建内部结构
    this.container.style.perspective = `${this.options.perspective}px`
    this.container.style.cursor = 'pointer'

    this.inner = document.createElement('div')
    this.inner.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform ${this.options.duration}ms cubic-bezier(0.4, 0, 0.2, 1);
    `

    // 查找 front 和 back
    this.front = this.container.querySelector('[data-flip="front"]') as HTMLElement
    this.back = this.container.querySelector('[data-flip="back"]') as HTMLElement

    if (!this.front || !this.back) {
      throw new Error('FlipCard: 需要包含 data-flip="front" 和 data-flip="back" 的子元素')
    }

    const common = `
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    `
    this.front.style.cssText += common
    this.back.style.cssText += common

    if (this.options.axis === 'y') {
      this.back.style.transform = 'rotateY(180deg)'
    } else {
      this.back.style.transform = 'rotateX(180deg)'
    }

    this.inner.appendChild(this.front)
    this.inner.appendChild(this.back)
    this.container.innerHTML = ''
    this.container.appendChild(this.inner)

    this.container.addEventListener('click', () => this.toggle())
  }

  toggle(): this {
    this.flipped = !this.flipped
    const rotate = this.flipped ? 180 : 0
    if (this.options.axis === 'y') {
      this.inner.style.transform = `rotateY(${rotate}deg)`
    } else {
      this.inner.style.transform = `rotateX(${rotate}deg)`
    }
    return this
  }

  flipToFront(): this {
    this.flipped = false
    this.inner.style.transform = ''
    return this
  }

  flipToBack(): this {
    this.flipped = true
    const rotate = 180
    if (this.options.axis === 'y') {
      this.inner.style.transform = `rotateY(${rotate}deg)`
    } else {
      this.inner.style.transform = `rotateX(${rotate}deg)`
    }
    return this
  }
}

export function createFlipCard(
  container: HTMLElement | string,
  options?: FlipCardOptions
): FlipCard {
  return new FlipCard(container, options)
}