export interface TypewriterOptions {
  speed?: number        // 每个字间隔毫秒
  cursor?: boolean      // 是否显示闪烁光标
  cursorChar?: string   // 光标字符
  onComplete?: () => void
}

const DEFAULT_TYPE_OPTS: Required<Omit<TypewriterOptions, 'onComplete'>> = {
  speed: 80,
  cursor: true,
  cursorChar: '|',
}

export class Typewriter {
  private element: HTMLElement
  private originalText: string = ''
  private timer: ReturnType<typeof setTimeout> | null = null
  private running = false

  constructor(element: HTMLElement | string) {
    this.element =
      typeof element === 'string'
        ? document.querySelector(element)!
        : element

    if (!this.element) {
      throw new Error('Typewriter: element not found')
    }

    this.originalText = this.element.textContent ?? ''
  }

  async start(options: TypewriterOptions = {}): Promise<void> {
    if (this.running) return
    this.running = true

    const opts = { ...DEFAULT_TYPE_OPTS, ...options }
    const text = this.originalText || this.element.textContent || ''
    this.element.textContent = ''

    if (opts.cursor) {
      this.element.style.borderRight = `2px solid currentColor`
      this.element.style.paddingRight = '2px'
      this.startCursorBlink()
    }

    return new Promise((resolve) => {
      let i = 0
      const typeNext = () => {
        if (!this.running) {
          resolve()
          return
        }

        if (i < text.length) {
          this.element.textContent += text.charAt(i)
          i++
          this.timer = setTimeout(typeNext, opts.speed)
        } else {
          this.running = false
          opts.onComplete?.()
          resolve()
        }
      }
      typeNext()
    })
  }

  stop(): void {
    this.running = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  reset(): void {
    this.stop()
    this.element.textContent = this.originalText
    this.element.style.borderRight = 'none'
    this.element.style.paddingRight = '0'
  }

  private startCursorBlink(): void {
    let visible = true
    const blink = () => {
      if (!this.running) {
        this.element.style.borderRightColor = 'transparent'
        return
      }
      this.element.style.borderRightColor = visible ? 'currentColor' : 'transparent'
      visible = !visible
      setTimeout(blink, 530)
    }
    blink()
  }
}

/**
 * 快捷方法
 */
export function typewrite(
  element: HTMLElement | string,
  options?: TypewriterOptions
): Promise<void> {
  const tw = new Typewriter(element)
  tw.reset()
  return tw.start(options)
}