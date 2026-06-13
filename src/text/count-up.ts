export interface CountUpOptions {
  duration?: number // 动画总时长毫秒
  easing?: 'linear' | 'easeOut' | 'easeInOut'
  decimals?: number // 小数位
  prefix?: string // 前缀
  suffix?: string // 后缀
  separator?: string // 千分位分隔符
  onUpdate?: (value: number) => void
  onComplete?: () => void
}

const DEFAULT_COUNT_OPTS: Required<
  Omit<CountUpOptions, 'onUpdate' | 'onComplete'>
> = {
  duration: 2000,
  easing: 'easeOut',
  decimals: 0,
  prefix: '',
  suffix: '',
  separator: ',',
}

export class CountUp {
  private element: HTMLElement
  private rafId: number | null = null

  constructor(element: HTMLElement | string) {
    this.element =
      typeof element === 'string' ? document.querySelector(element)! : element

    if (!this.element) {
      throw new Error('CountUp: element not found')
    }
  }

  animateTo(
    endValue: number,
    startValue: number = 0,
    options: CountUpOptions = {}
  ): Promise<void> {
    const opts = { ...DEFAULT_COUNT_OPTS, ...options }
    const startTime = performance.now()

    return new Promise((resolve) => {
      const tick = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / opts.duration, 1)
        const eased = this.applyEasing(progress, opts.easing)
        const current = startValue + (endValue - startValue) * eased

        this.render(current, opts)
        opts.onUpdate?.(current)

        if (progress < 1) {
          this.rafId = requestAnimationFrame(tick)
        } else {
          this.render(endValue, opts)
          opts.onComplete?.()
          resolve()
        }
      }

      this.rafId = requestAnimationFrame(tick)
    })
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private render(value: number, opts: CountUpOptions): void {
    let formatted = value.toFixed(opts.decimals!)

    // 千分位
    if (opts.separator) {
      const parts = formatted.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, opts.separator!)
      formatted = parts.join('.')
    }

    this.element.textContent = `${opts.prefix}${formatted}${opts.suffix}`
  }

  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'easeOut':
        return 1 - Math.pow(1 - t, 3)
      case 'easeInOut':
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      default:
        return t
    }
  }
}

/**
 * 快捷方法
 */
export function countUp(
  element: HTMLElement | string,
  endValue: number,
  options?: CountUpOptions
): Promise<void> {
  return new CountUp(element).animateTo(endValue, 0, options)
}
