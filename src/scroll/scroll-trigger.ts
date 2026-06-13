import type { AnimationName } from '../core/utils.ts'

export interface ScrollTriggerOptions {
  threshold?: number // 0~1，元素进入视口多少比例时触发
  rootMargin?: string // 类似 CSS margin，扩大/缩小视口判定范围
  once?: boolean // 是否只触发一次
  duration?: number
  easing?: string
}

const DEFAULT_SCROLL_OPTS: Required<ScrollTriggerOptions> = {
  threshold: 0.2,
  rootMargin: '0px',
  once: true,
  duration: 500,
  easing: 'ease',
}

export class ScrollTrigger {
  private observer: IntersectionObserver | null = null
  private elements = new Map<
    Element,
    { name: AnimationName; opts: ScrollTriggerOptions }
  >()

  watch(
    selector: string | Element | Element[],
    animationName: AnimationName,
    options: ScrollTriggerOptions = {}
  ): this {
    const opts = { ...DEFAULT_SCROLL_OPTS, ...options }
    let targets: Element[]
    if (typeof selector === 'string') {
      targets = Array.from(document.querySelectorAll(selector))
    } else if (Array.isArray(selector)) {
      targets = selector
    } else {
      targets = [selector as Element]
    }

    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => this.handleEntries(entries),
        {
          threshold: opts.threshold,
          rootMargin: opts.rootMargin,
        }
      )
    }

    targets.forEach((el) => {
      this.elements.set(el, { name: animationName, opts })
      this.observer!.observe(el)
    })

    return this
  }

  private handleEntries(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const config = this.elements.get(entry.target)
        if (!config) return

        const htmlEl = entry.target as HTMLElement
        const className = `mk-animated mk-${config.name}`

        htmlEl.classList.add(...className.split(' '))
        htmlEl.style.setProperty('--mk-duration', `${config.opts.duration}ms`)
        htmlEl.style.setProperty('--mk-easing', config.opts.easing!)

        const onEnd = (e: AnimationEvent) => {
          if (e.animationName.startsWith('mk-')) {
            htmlEl.removeEventListener('animationend', onEnd)
            if (config.opts.once) {
              htmlEl.classList.remove(...className.split(' '))
            }
          }
        }

        htmlEl.addEventListener('animationend', onEnd)

        if (config.opts.once) {
          this.observer?.unobserve(entry.target)
          this.elements.delete(entry.target)
        }
      }
    })
  }

  destroy(): void {
    this.observer?.disconnect()
    this.observer = null
    this.elements.clear()
  }
}

/**
 * 快捷方法：为选择器下的所有元素添加滚动触发动画
 */
export function scrollAnimate(
  selector: string | Element | Element[],
  animationName: AnimationName,
  options?: ScrollTriggerOptions
): ScrollTrigger {
  return new ScrollTrigger().watch(selector, animationName, options)
}
