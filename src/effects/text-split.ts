export interface TextSplitOptions {
  type?: 'char' | 'word'       // 按字符拆分还是按词
  stagger?: number             // 每个元素间隔毫秒
  duration?: number            // 单个动画时长
  animation?: 'fadeUp' | 'fadeDown' | 'zoomIn' | 'rotateIn' | 'slideLeft'
}

const DEFAULT_SPLIT: Required<Omit<TextSplitOptions, 'type'>> & { type: 'char' } = {
  type: 'char',
  stagger: 40,
  duration: 500,
  animation: 'fadeUp',
}

const ANIMATION_PRESETS: Record<string, { from: string; to: string }> = {
  fadeUp:    { from: 'opacity:0;transform:translateY(20px)',   to: 'opacity:1;transform:translateY(0)' },
  fadeDown:  { from: 'opacity:0;transform:translateY(-20px)',  to: 'opacity:1;transform:translateY(0)' },
  zoomIn:    { from: 'opacity:0;transform:scale(0.5)',         to: 'opacity:1;transform:scale(1)' },
  rotateIn:  { from: 'opacity:0;transform:rotate(-180deg)',    to: 'opacity:1;transform:rotate(0)' },
  slideLeft: { from: 'opacity:0;transform:translateX(-30px)',  to: 'opacity:1;transform:translateX(0)' },
}

export class TextSplit {
  private element: HTMLElement
  private originalHTML: string

  constructor(element: HTMLElement | string) {
    this.element =
      typeof element === 'string'
        ? document.querySelector(element)!
        : element

    if (!this.element) {
      throw new Error('TextSplit: element not found')
    }

    this.originalHTML = this.element.innerHTML
  }

  async animate(options: TextSplitOptions = {}): Promise<void> {
    const opts = { ...DEFAULT_SPLIT, ...options }
    const preset = ANIMATION_PRESETS[opts.animation!]
    const text = this.element.textContent ?? ''

    // 清空并拆分
    this.element.innerHTML = ''
    this.element.style.display = 'inline-block'

    const parts = opts.type === 'char' ? text.split('') : text.split(/(\s+)/)
    const spans: HTMLSpanElement[] = []

    parts.forEach((part) => {
      const span = document.createElement('span')
      span.textContent = part
      span.style.display = 'inline-block'
      span.style.cssText += preset.from
      span.style.transition = `all ${opts.duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
      this.element.appendChild(span)
      spans.push(span)
    })

    // 强制重排
    this.element.offsetHeight

    return new Promise((resolve) => {
      let completed = 0
      const total = spans.length

      spans.forEach((span, i) => {
        setTimeout(() => {
          span.style.cssText += preset.to

          setTimeout(() => {
            completed++
            if (completed >= total) resolve()
          }, opts.duration)
        }, i * opts.stagger)
      })
    })
  }

  reset(): void {
    this.element.innerHTML = this.originalHTML
    this.element.style.display = ''
  }
}

export function splitText(
  element: HTMLElement | string,
  options?: TextSplitOptions
): Promise<void> {
  const ts = new TextSplit(element)
  ts.reset()
  return ts.animate(options)
}