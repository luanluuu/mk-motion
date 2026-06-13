export interface DraggableOptions {
  axis?: 'x' | 'y' | 'both'
  bounds?: HTMLElement | string | null // 限制拖拽范围
  onStart?: (e: PointerEvent) => void
  onDrag?: (x: number, y: number) => void
  onEnd?: (x: number, y: number) => void
}

export class Draggable {
  private element: HTMLElement
  private options: Required<
    Omit<DraggableOptions, 'bounds' | 'onStart' | 'onDrag' | 'onEnd'>
  > &
    Pick<DraggableOptions, 'bounds' | 'onStart' | 'onDrag' | 'onEnd'>
  private startX = 0
  private startY = 0
  private currentX = 0
  private currentY = 0
  private initialTransformX = 0
  private initialTransformY = 0
  private pointerId: number | null = null

  constructor(element: HTMLElement | string, options: DraggableOptions = {}) {
    this.element =
      typeof element === 'string'
        ? document.querySelector<HTMLElement>(element)!
        : element

    if (!this.element) {
      throw new Error('Draggable: element not found')
    }

    this.options = {
      axis: options.axis ?? 'both',
      bounds: options.bounds ?? null,
      onStart: options.onStart,
      onDrag: options.onDrag,
      onEnd: options.onEnd,
    }

    this.element.style.touchAction = 'none'
    this.element.addEventListener('pointerdown', this.onPointerDown)
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.pointerId !== null) return

    this.pointerId = e.pointerId
    this.element.setPointerCapture(e.pointerId)

    this.startX = e.clientX
    this.startY = e.clientY

    // 读取当前 transform 偏移
    const computed = getComputedStyle(this.element).transform
    if (computed !== 'none') {
      const matrix = new DOMMatrix(computed)
      this.initialTransformX = matrix.m41
      this.initialTransformY = matrix.m42
    } else {
      this.initialTransformX = 0
      this.initialTransformY = 0
    }

    this.currentX = this.initialTransformX
    this.currentY = this.initialTransformY

    this.options.onStart?.(e)

    this.element.addEventListener('pointermove', this.onPointerMove)
    this.element.addEventListener('pointerup', this.onPointerUp)
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return

    const deltaX = e.clientX - this.startX
    const deltaY = e.clientY - this.startY

    let newX = this.initialTransformX + deltaX
    let newY = this.initialTransformY + deltaY

    // 限制范围
    if (this.options.bounds) {
      const boundsEl =
        typeof this.options.bounds === 'string'
          ? document.querySelector<HTMLElement>(this.options.bounds)!
          : this.options.bounds

      if (boundsEl) {
        const bRect = boundsEl.getBoundingClientRect()
        const eRect = this.element.getBoundingClientRect()

        const minX = bRect.left - eRect.left + newX
        const maxX = bRect.right - eRect.right + newX
        const minY = bRect.top - eRect.top + newY
        const maxY = bRect.bottom - eRect.bottom + newY

        newX = Math.max(minX, Math.min(maxX, newX))
        newY = Math.max(minY, Math.min(maxY, newY))
      }
    }

    if (this.options.axis === 'x') newY = this.initialTransformY
    if (this.options.axis === 'y') newX = this.initialTransformX

    this.currentX = newX
    this.currentY = newY

    this.element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`
    this.options.onDrag?.(newX, newY)
  }

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return

    this.pointerId = null
    this.element.releasePointerCapture(e.pointerId)
    this.element.removeEventListener('pointermove', this.onPointerMove)
    this.element.removeEventListener('pointerup', this.onPointerUp)

    this.options.onEnd?.(this.currentX, this.currentY)
  }

  destroy(): void {
    this.element.removeEventListener('pointerdown', this.onPointerDown)
    if (this.pointerId !== null) {
      this.element.releasePointerCapture(this.pointerId)
      this.pointerId = null
    }
  }
}
