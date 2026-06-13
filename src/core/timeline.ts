import type { AnimationName, AnimationOptions } from './utils.ts'

interface TimelineItem {
  name: AnimationName
  target: HTMLElement | string
  options?: AnimationOptions
  at?: number // 相对时间线起点的毫秒数
}

export class Timeline {
  private items: TimelineItem[] = []
  private running = false
  private abortController: AbortController | null = null

  add(
    name: AnimationName,
    target: HTMLElement | string,
    options?: AnimationOptions & { at?: number }
  ): this {
    this.items.push({
      name,
      target,
      options,
      at: options?.at ?? this.estimateEndTime(),
    })
    return this
  }

  private estimateEndTime(): number {
    if (this.items.length === 0) return 0
    const last = this.items[this.items.length - 1]
    const duration = last.options?.duration ?? 500
    return (last.at ?? 0) + duration
  }

  async play(): Promise<void> {
    if (this.running) return
    this.running = true
    this.abortController = new AbortController()
    const signal = this.abortController.signal

    const promises = this.items.map((item) => {
      return new Promise<void>((resolve) => {
        const el: HTMLElement | null =
          typeof item.target === 'string'
            ? document.querySelector<HTMLElement>(item.target)
            : item.target

        if (!el || signal.aborted) {
          resolve()
          return
        }

        const delay = item.at ?? 0
        const duration = item.options?.duration ?? 500
        const easing = item.options?.easing ?? 'ease'

        const timer = setTimeout(() => {
          if (signal.aborted) {
            resolve()
            return
          }

          const className = `mk-animated mk-${item.name}`
          el.classList.add(...className.split(' '))
          el.style.setProperty('--mk-duration', `${duration}ms`)
          el.style.setProperty('--mk-easing', easing)

          const onEnd = (e: AnimationEvent) => {
            if (e.animationName.startsWith('mk-')) {
              el.removeEventListener('animationend', onEnd)
              el.classList.remove(...className.split(' '))
              el.style.removeProperty('--mk-duration')
              el.style.removeProperty('--mk-easing')
              resolve()
            }
          }

          el.addEventListener('animationend', onEnd)

          // 安全兜底：如果动画没触发，超时 resolve
          setTimeout(() => {
            el.removeEventListener('animationend', onEnd)
            el.classList.remove(...className.split(' '))
            el.style.removeProperty('--mk-duration')
            el.style.removeProperty('--mk-easing')
            resolve()
          }, duration + 100)
        }, delay)

        signal.addEventListener('abort', () => {
          clearTimeout(timer)
          resolve()
        })
      })
    })

    await Promise.all(promises)
    this.running = false
  }

  stop(): void {
    this.abortController?.abort()
    this.running = false

    // 清理所有残留的动画类
    this.items.forEach((item) => {
      const el: HTMLElement | null =
        typeof item.target === 'string'
          ? document.querySelector<HTMLElement>(item.target)
          : item.target
      if (el) {
        const className = `mk-animated mk-${item.name}`
        el.classList.remove(...className.split(' '))
        el.style.removeProperty('--mk-duration')
        el.style.removeProperty('--mk-easing')
      }
    })
  }

  clear(): this {
    this.stop()
    this.items = []
    return this
  }
}
