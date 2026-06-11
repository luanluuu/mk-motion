export interface PinchOptions {
  onPinchStart?: () => void
  onPinch?: (scale: number) => void
  onPinchEnd?: (scale: number) => void
}

interface TouchPoint {
  x: number
  y: number
}

export class PinchRecognizer {
  private element: HTMLElement
  private options: PinchOptions
  private active = false
  private startDistance = 0
  private startScale = 1
  private currentScale = 1

  constructor(element: HTMLElement | string, options: PinchOptions = {}) {
    this.element =
      typeof element === 'string'
        ? document.querySelector<HTMLElement>(element)!
        : element

    if (!this.element) {
      throw new Error('PinchRecognizer: element not found')
    }

    this.options = options
    this.element.addEventListener('touchstart', this.onTouchStart, { passive: true })
    this.element.addEventListener('touchmove', this.onTouchMove, { passive: true })
    this.element.addEventListener('touchend', this.onTouchEnd)
    this.element.addEventListener('touchcancel', this.onTouchEnd)
  }

  private getTouches(e: TouchEvent): TouchPoint[] {
    return Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }))
  }

  private getDistance(a: TouchPoint, b: TouchPoint): number {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  private onTouchStart = (e: TouchEvent) => {
    const touches = this.getTouches(e)
    if (touches.length !== 2) return

    this.active = true
    this.startDistance = this.getDistance(touches[0], touches[1])
    this.startScale = this.currentScale
    this.options.onPinchStart?.()
  }

  private onTouchMove = (e: TouchEvent) => {
    if (!this.active) return
    const touches = this.getTouches(e)
    if (touches.length !== 2) {
      this.active = false
      return
    }

    const distance = this.getDistance(touches[0], touches[1])
    if (this.startDistance > 0) {
      this.currentScale = this.startScale * (distance / this.startDistance)
      this.options.onPinch?.(this.currentScale)
    }
  }

  private onTouchEnd = (_e: TouchEvent) => {
    if (!this.active) return
    this.active = false
    this.options.onPinchEnd?.(this.currentScale)
  }

  destroy(): void {
    this.element.removeEventListener('touchstart', this.onTouchStart)
    this.element.removeEventListener('touchmove', this.onTouchMove)
    this.element.removeEventListener('touchend', this.onTouchEnd)
    this.element.removeEventListener('touchcancel', this.onTouchEnd)
  }
}
