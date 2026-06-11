export interface CoverFlowOptions {
  perspective?: number     // 透视距离
  rotateY?: number         // 两侧卡片旋转角度
  spacing?: number         // 卡片间距
  scale?: number           // 中心卡片缩放
}

const DEFAULT_COVERFLOW: Required<CoverFlowOptions> = {
  perspective: 800,
  rotateY: 45,
  spacing: 60,
  scale: 1.15,
}

/**
 * 3D 封面流轮播
 */
export class CoverFlow {
  private container: HTMLElement
  private cards: HTMLElement[]
  private currentIndex = 0
  private options: Required<CoverFlowOptions>

  constructor(
    container: HTMLElement | string,
    cardSelector: string,
    options: CoverFlowOptions = {}
  ) {
    this.container =
      typeof container === 'string'
        ? document.querySelector<HTMLElement>(container)!
        : container

    if (!this.container) {
      throw new Error('CoverFlow: container not found')
    }

    this.cards = Array.from(this.container.querySelectorAll(cardSelector))
    this.options = { ...DEFAULT_COVERFLOW, ...options }

    this.container.style.perspective = `${this.options.perspective}px`
    this.container.style.transformStyle = 'preserve-3d'

    this.update()
  }

  goTo(index: number): this {
    this.currentIndex = Math.max(0, Math.min(index, this.cards.length - 1))
    this.update()
    return this
  }

  next(): this {
    return this.goTo(this.currentIndex + 1)
  }

  prev(): this {
    return this.goTo(this.currentIndex - 1)
  }

  private update(): void {
    this.cards.forEach((card, i) => {
      const offset = i - this.currentIndex
      const absOffset = Math.abs(offset)

      let translateX = offset * this.options.spacing
      let rotateY = offset > 0 ? -this.options.rotateY : this.options.rotateY
      let scale = 1
      let zIndex = this.cards.length - absOffset
      let opacity = 1

      if (offset === 0) {
        rotateY = 0
        scale = this.options.scale
        zIndex = this.cards.length + 1
      } else if (absOffset > 2) {
        opacity = 0
        zIndex = 0
      } else {
        opacity = 1 - absOffset * 0.3
      }

      card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
      card.style.transform = `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`
      card.style.zIndex = String(zIndex)
      card.style.opacity = String(opacity)
    })
  }
}

/**
 * 快捷方法创建 CoverFlow
 */
export function createCoverFlow(
  container: HTMLElement | string,
  cardSelector: string,
  options?: CoverFlowOptions
): CoverFlow {
  return new CoverFlow(container, cardSelector, options)
}