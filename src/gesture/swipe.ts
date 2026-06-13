export interface SwipeOptions {
  threshold?: number
  velocity?: number
  direction?: 'horizontal' | 'vertical' | 'both'
  onSwipe?: (
    direction: 'left' | 'right' | 'up' | 'down',
    distance: number
  ) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface Point {
  x: number
  y: number
  t: number
}

export class SwipeRecognizer {
  private element: HTMLElement
  private options: Required<
    Omit<
      SwipeOptions,
      'onSwipe' | 'onSwipeLeft' | 'onSwipeRight' | 'onSwipeUp' | 'onSwipeDown'
    >
  > &
    Pick<
      SwipeOptions,
      'onSwipe' | 'onSwipeLeft' | 'onSwipeRight' | 'onSwipeUp' | 'onSwipeDown'
    >
  private pointerId: number | null = null
  private startPoint: Point | null = null
  private lastPoint: Point | null = null
  constructor(element: HTMLElement | string, options: SwipeOptions = {}) {
    this.element =
      typeof element === 'string'
        ? document.querySelector<HTMLElement>(element)!
        : element

    if (!this.element) {
      throw new Error('SwipeRecognizer: element not found')
    }

    this.options = {
      threshold: options.threshold ?? 50,
      velocity: options.velocity ?? 0.3,
      direction: options.direction ?? 'both',
      onSwipe: options.onSwipe,
      onSwipeLeft: options.onSwipeLeft,
      onSwipeRight: options.onSwipeRight,
      onSwipeUp: options.onSwipeUp,
      onSwipeDown: options.onSwipeDown,
    }

    this.element.style.touchAction = 'pan-y pan-x'
    this.element.addEventListener('pointerdown', this.onPointerDown)
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.pointerId !== null) return
    this.pointerId = e.pointerId
    this.element.setPointerCapture(e.pointerId)

    this.startPoint = { x: e.clientX, y: e.clientY, t: performance.now() }
    this.lastPoint = { ...this.startPoint }

    this.element.addEventListener('pointermove', this.onPointerMove)
    this.element.addEventListener('pointerup', this.onPointerUp)
    this.element.addEventListener('pointercancel', this.onPointerUp)
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return
    this.lastPoint = { x: e.clientX, y: e.clientY, t: performance.now() }
  }

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return
    this.pointerId = null
    this.element.releasePointerCapture(e.pointerId)
    this.element.removeEventListener('pointermove', this.onPointerMove)
    this.element.removeEventListener('pointerup', this.onPointerUp)
    this.element.removeEventListener('pointercancel', this.onPointerUp)

    if (!this.startPoint || !this.lastPoint) return

    const dx = this.lastPoint.x - this.startPoint.x
    const dy = this.lastPoint.y - this.startPoint.y
    const dt = (this.lastPoint.t - this.startPoint.t) / 1000

    if (dt <= 0) return

    const vx = Math.abs(dx / dt)
    const vy = Math.abs(dy / dt)
    const distance = Math.sqrt(dx * dx + dy * dy)

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    let dir: 'left' | 'right' | 'up' | 'down' | null = null

    if (
      this.options.direction === 'horizontal' ||
      this.options.direction === 'both'
    ) {
      if (
        absDx > absDy &&
        absDx >= this.options.threshold &&
        vx >= this.options.velocity * 1000
      ) {
        dir = dx > 0 ? 'right' : 'left'
      }
    }

    if (
      !dir &&
      (this.options.direction === 'vertical' ||
        this.options.direction === 'both')
    ) {
      if (
        absDy >= absDx &&
        absDy >= this.options.threshold &&
        vy >= this.options.velocity * 1000
      ) {
        dir = dy > 0 ? 'down' : 'up'
      }
    }

    if (dir) {
      this.options.onSwipe?.(dir, distance)
      switch (dir) {
        case 'left':
          this.options.onSwipeLeft?.()
          break
        case 'right':
          this.options.onSwipeRight?.()
          break
        case 'up':
          this.options.onSwipeUp?.()
          break
        case 'down':
          this.options.onSwipeDown?.()
          break
      }
    }
  }

  destroy(): void {
    this.element.removeEventListener('pointerdown', this.onPointerDown)
    if (this.pointerId !== null) {
      this.element.releasePointerCapture(this.pointerId)
      this.pointerId = null
    }
    this.element.removeEventListener('pointermove', this.onPointerMove)
    this.element.removeEventListener('pointerup', this.onPointerUp)
    this.element.removeEventListener('pointercancel', this.onPointerUp)
  }
}
