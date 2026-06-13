export interface TapOptions {
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  longPressDelay?: number
}

export class TapRecognizer {
  private element: HTMLElement
  private options: Required<
    Omit<TapOptions, 'onTap' | 'onDoubleTap' | 'onLongPress'>
  > &
    Pick<TapOptions, 'onTap' | 'onDoubleTap' | 'onLongPress'>
  private pointerId: number | null = null
  private startX = 0
  private startY = 0
  private startTime = 0
  private longPressTimer: ReturnType<typeof setTimeout> | null = null
  private lastTapTime = 0
  private moved = false
  private tapThreshold = 10
  private tapTimeThreshold = 300
  private doubleTapWindow = 300

  constructor(element: HTMLElement | string, options: TapOptions = {}) {
    this.element =
      typeof element === 'string'
        ? document.querySelector<HTMLElement>(element)!
        : element

    if (!this.element) {
      throw new Error('TapRecognizer: element not found')
    }

    this.options = {
      longPressDelay: options.longPressDelay ?? 500,
      onTap: options.onTap,
      onDoubleTap: options.onDoubleTap,
      onLongPress: options.onLongPress,
    }

    this.element.style.touchAction = 'manipulation'
    this.element.addEventListener('pointerdown', this.onPointerDown)
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.pointerId !== null) return
    this.pointerId = e.pointerId
    this.element.setPointerCapture(e.pointerId)

    this.startX = e.clientX
    this.startY = e.clientY
    this.startTime = performance.now()
    this.moved = false

    this.longPressTimer = setTimeout(() => {
      if (!this.moved && this.pointerId !== null) {
        this.options.onLongPress?.()
        this.cleanupPointer()
      }
    }, this.options.longPressDelay)

    this.element.addEventListener('pointermove', this.onPointerMove)
    this.element.addEventListener('pointerup', this.onPointerUp)
    this.element.addEventListener('pointercancel', this.onPointerUp)
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return
    const dx = Math.abs(e.clientX - this.startX)
    const dy = Math.abs(e.clientY - this.startY)
    if (dx > this.tapThreshold || dy > this.tapThreshold) {
      this.moved = true
      this.clearLongPress()
    }
  }

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return
    this.clearLongPress()

    const elapsed = performance.now() - this.startTime
    if (!this.moved && elapsed < this.tapTimeThreshold) {
      const now = performance.now()
      if (
        now - this.lastTapTime < this.doubleTapWindow &&
        this.options.onDoubleTap
      ) {
        this.lastTapTime = 0
        this.options.onDoubleTap()
      } else {
        this.lastTapTime = now
        // Delay single tap to allow double-tap detection
        if (this.options.onDoubleTap) {
          setTimeout(() => {
            if (this.lastTapTime === now) {
              this.options.onTap?.()
            }
          }, this.doubleTapWindow)
        } else {
          this.options.onTap?.()
        }
      }
    }

    this.cleanupPointer()
  }

  private clearLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  private cleanupPointer(): void {
    if (this.pointerId !== null) {
      this.element.releasePointerCapture(this.pointerId)
      this.pointerId = null
    }
    this.element.removeEventListener('pointermove', this.onPointerMove)
    this.element.removeEventListener('pointerup', this.onPointerUp)
    this.element.removeEventListener('pointercancel', this.onPointerUp)
  }

  destroy(): void {
    this.element.removeEventListener('pointerdown', this.onPointerDown)
    this.cleanupPointer()
    this.clearLongPress()
  }
}
