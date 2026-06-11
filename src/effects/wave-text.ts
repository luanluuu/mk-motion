export interface WaveTextOptions {
  amplitude?: number       // 波浪幅度像素
  frequency?: number       // 波浪频率
  speed?: number           // 波动速度
  stagger?: number         // 字符间隔
}

const DEFAULT_WAVE: Required<WaveTextOptions> = {
  amplitude: 15,
  frequency: 0.3,
  speed: 0.08,
  stagger: 0.15,
}

export class WaveText {
  private element: HTMLElement
  private spans: HTMLSpanElement[] = []
  private rafId: number | null = null
  private originalHTML: string

  constructor(element: HTMLElement | string) {
    this.element =
      typeof element === 'string'
        ? document.querySelector(element)!
        : element

    if (!this.element) {
      throw new Error('WaveText: element not found')
    }

    this.originalHTML = this.element.innerHTML
  }

  start(options: WaveTextOptions = {}): void {
    this.stop()
    const opts = { ...DEFAULT_WAVE, ...options }
    const text = this.element.textContent ?? ''

    this.element.innerHTML = ''
    this.element.style.display = 'inline-block'

    const chars = text.split('')
    this.spans = chars.map((char) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.display = 'inline-block'
      span.style.transition = 'transform 0.1s linear'
      this.element.appendChild(span)
      return span
    })

    let time = 0

    const tick = () => {
      time += opts.speed
      this.spans.forEach((span, i) => {
        const offset = i * opts.stagger
        const y = Math.sin(time + offset) * opts.amplitude
        span.style.transform = `translateY(${y}px)`
      })
      this.rafId = requestAnimationFrame(tick)
    }

    this.rafId = requestAnimationFrame(tick)
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  reset(): void {
    this.stop()
    this.element.innerHTML = this.originalHTML
    this.element.style.display = ''
  }
}

export function waveText(
  element: HTMLElement | string,
  options?: WaveTextOptions
): () => void {
  const wt = new WaveText(element)
  wt.start(options)
  return () => wt.stop()
}