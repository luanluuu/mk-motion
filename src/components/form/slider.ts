import './slider.css'
import { onKey, Keys } from '../../a11y/keyboard.ts'

export interface SliderOptions {
  min?: number
  max?: number
  step?: number
  value?: number
  showValue?: boolean
  onChange?: (value: number) => void
}

export class MkSlider {
  el: HTMLDivElement
  private track: HTMLDivElement
  private fill: HTMLDivElement
  private thumb: HTMLDivElement
  private valueEl?: HTMLDivElement
  private options: Required<Omit<SliderOptions, 'onChange'>> &
    Pick<SliderOptions, 'onChange'>
  private _value: number
  private dragging = false
  private _cleanupKey?: () => void

  constructor(container: HTMLElement | string, options: SliderOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      min: 0,
      max: 100,
      step: 1,
      value: 0,
      showValue: true,
      ...options,
    }
    this._value = this.options.value

    this.el = document.createElement('div')
    this.el.className = 'mk-slider'

    this.track = document.createElement('div')
    this.track.className = 'mk-slider__track'

    this.fill = document.createElement('div')
    this.fill.className = 'mk-slider__fill'
    this.track.appendChild(this.fill)

    this.thumb = document.createElement('div')
    this.thumb.className = 'mk-slider__thumb'
    this.thumb.setAttribute('role', 'slider')
    this.thumb.setAttribute('tabindex', '0')
    this.track.appendChild(this.thumb)

    this.el.appendChild(this.track)

    if (this.options.showValue) {
      this.valueEl = document.createElement('div')
      this.valueEl.className = 'mk-slider__value'
      this.el.appendChild(this.valueEl)
    }

    this.updateUI()

    this._cleanupKey = onKey(this.thumb, [
      {
        key: Keys.ArrowLeft,
        handler: () => this.adjustValue(-this.options.step),
      },
      {
        key: Keys.ArrowRight,
        handler: () => this.adjustValue(this.options.step),
      },
      {
        key: Keys.Home,
        handler: () => {
          this.value = this.options.min
        },
      },
      {
        key: Keys.End,
        handler: () => {
          this.value = this.options.max
        },
      },
    ])

    this.track.addEventListener('mousedown', (e) => this.onStart(e.clientX))
    this.thumb.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      this.onStart(e.clientX)
    })

    document.addEventListener('mousemove', (e) => this.onMove(e.clientX))
    document.addEventListener('mouseup', () => this.onEnd())

    // Touch
    this.track.addEventListener(
      'touchstart',
      (e) => this.onStart(e.touches[0].clientX),
      { passive: true }
    )
    document.addEventListener(
      'touchmove',
      (e) => this.onMove(e.touches[0].clientX),
      { passive: true }
    )
    document.addEventListener('touchend', () => this.onEnd())

    parent.appendChild(this.el)
  }

  private onStart(clientX: number): void {
    this.dragging = true
    this.updateFromPosition(clientX)
  }

  private onMove(clientX: number): void {
    if (!this.dragging) return
    this.updateFromPosition(clientX)
  }

  private onEnd(): void {
    this.dragging = false
  }

  private updateFromPosition(clientX: number): void {
    const rect = this.track.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw =
      this.options.min + percent * (this.options.max - this.options.min)
    const stepped = Math.round(raw / this.options.step) * this.options.step
    this.value = Math.max(this.options.min, Math.min(this.options.max, stepped))
  }

  get value(): number {
    return this._value
  }

  set value(v: number) {
    if (this._value !== v) {
      this._value = v
      this.updateUI()
      this.options.onChange?.(v)
    }
  }

  private updateUI(): void {
    const percent =
      (this._value - this.options.min) / (this.options.max - this.options.min)
    this.fill.style.width = `${percent * 100}%`
    this.thumb.style.left = `${percent * 100}%`
    if (this.valueEl) {
      this.valueEl.textContent = String(this._value)
    }
    this.updateAria()
  }

  private updateAria(): void {
    this.thumb.setAttribute('aria-valuenow', String(this._value))
    this.thumb.setAttribute('aria-valuemin', String(this.options.min))
    this.thumb.setAttribute('aria-valuemax', String(this.options.max))
  }

  private adjustValue(delta: number): void {
    this.value = Math.max(
      this.options.min,
      Math.min(this.options.max, this._value + delta)
    )
  }

  destroy(): void {
    this._cleanupKey?.()
    this.el.remove()
  }
}
