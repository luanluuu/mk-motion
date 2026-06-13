import type { SpringOptions } from '../core/spring-engine.js'

export interface DraggableListOptions {
  /** Reserved for future physics tuning */
  spring?: SpringOptions
  /** Stagger delay between items (ms) */
  stagger?: number
  /** Callback when order changes: receives (fromIndex, toIndex) */
  onReorder?: (fromIndex: number, toIndex: number) => void
  /** Fired when drag starts */
  onDragStart?: (info: { index: number; item: HTMLElement }) => void
  /** Fired on every pointer move during drag */
  onDragMove?: (info: {
    index: number
    fromIndex: number
    deltaX: number
    deltaY: number
    item: HTMLElement
  }) => void
  /** Fired when drag ends (before release animation completes) */
  onDragEnd?: (info: {
    fromIndex: number
    toIndex: number
    item: HTMLElement
  }) => void
  /** Custom drag handle selector (default: whole item) */
  handle?: string
  /** Direction: vertical or horizontal */
  direction?: 'vertical' | 'horizontal'
  /** Dragging item opacity */
  ghostOpacity?: number
  /** Dragging item scale */
  dragScale?: number
  /** FLIP/release animation duration in ms */
  duration?: number
  /** FLIP/release animation easing */
  easing?: string
  /** Additional CSS class for the placeholder element */
  placeholderClass?: string
  /** Custom inline styles for the placeholder element */
  placeholderStyle?: Partial<CSSStyleDeclaration>
  /** When true, skip FLIP/release animations (respects prefers-reduced-motion automatically) */
  reducedMotion?: boolean
}

interface DragState {
  index: number
  startIndex: number
  el: HTMLElement
  mirror: HTMLElement
  originalStyle: string
  originalParent: Node
  originalNextSibling: ChildNode | null
  startY: number
  startX: number
  currentY: number
  currentX: number
  placeholder: HTMLElement
  rect: DOMRect
}

// ---------------------------------------------------------------------------
// 索引计算（独立导出便于测试）
// ---------------------------------------------------------------------------

/**
 * 根据指针位置计算拖拽排序的目标索引
 * @param items - 当前可排序元素列表（不含 placeholder 和被拖拽元素）
 * @param pointer - 指针在主轴上的坐标（垂直方向用 clientY，水平方向用 clientX）
 * @param direction - 排列方向
 * @returns 目标索引（0 到 items.length）
 */
export function calcDragIndex(
  items: HTMLElement[],
  pointer: number,
  direction: 'vertical' | 'horizontal'
): number {
  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect()
    const mid =
      direction === 'vertical'
        ? rect.top + rect.height / 2
        : rect.left + rect.width / 2
    if (pointer < mid) return i
  }
  return items.length
}

export class DraggableList {
  private container: HTMLElement
  private options: Required<
    Pick<
      DraggableListOptions,
      'direction' | 'ghostOpacity' | 'dragScale' | 'duration' | 'easing'
    >
  > &
    DraggableListOptions
  private state: DragState | null = null
  private handlers: {
    event: string
    fn: EventListener
    target: EventTarget
  }[] = []
  private destroyed = false
  private releaseAnim: Animation | null = null
  private shiftAnimations = new Map<HTMLElement, Animation>()
  private dragLayer: HTMLElement | null = null
  private prefersReducedMotion = false

  constructor(
    container: HTMLElement | string,
    options: DraggableListOptions = {}
  ) {
    this.container =
      typeof container === 'string'
        ? document.querySelector<HTMLElement>(container)!
        : container
    if (!this.container) throw new Error('DraggableList: container not found')

    this.options = {
      direction: 'vertical',
      ghostOpacity: 0.98,
      dragScale: 1.01,
      duration: 180,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      ...options,
    }

    this.prefersReducedMotion =
      this.options.reducedMotion ??
      (typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false)

    this.attachListeners()
  }

  private attachListeners(): void {
    const onMouseDown = (e: MouseEvent) => this.onPointerDown(e)
    const onTouchStart = (e: TouchEvent) => this.onPointerDown(e)

    this.container.addEventListener('mousedown', onMouseDown)
    this.container.addEventListener('touchstart', onTouchStart, {
      passive: false,
    })

    this.handlers.push(
      {
        event: 'mousedown',
        fn: onMouseDown as EventListener,
        target: this.container,
      },
      {
        event: 'touchstart',
        fn: onTouchStart as EventListener,
        target: this.container,
      }
    )
  }

  private onPointerDown(e: MouseEvent | TouchEvent): void {
    if (this.destroyed) return

    this.releaseAnim?.cancel()
    this.releaseAnim = null
    if (this.state) this.restoreState(this.state)
    this.cancelShiftAnimations()

    const touch = 'touches' in e ? e.touches[0] : e
    const target = e.target as HTMLElement
    const item = this.findItem(target)
    if (!item) return
    if (this.options.handle && !target.closest(this.options.handle)) return
    if ('button' in e && e.button !== 0) return

    e.preventDefault()

    const index = Array.from(this.container.children).indexOf(item)
    const rect = item.getBoundingClientRect()
    const originalStyle = item.getAttribute('style') ?? ''
    const originalParent = item.parentNode!
    const originalNextSibling = item.nextSibling

    const placeholder = item.cloneNode(false) as HTMLElement
    placeholder.innerHTML = ''
    const plcClass =
      `${item.className || ''} mk-draggable-placeholder${this.options.placeholderClass ? ` ${this.options.placeholderClass}` : ''}`.trim()
    placeholder.className = plcClass
    Object.assign(placeholder.style, {
      minHeight: `${rect.height}px`,
      height: `${rect.height}px`,
      opacity: '1',
      background: 'var(--mk-primary-muted, rgba(64, 158, 255, 0.1))',
      border: '1px dashed var(--mk-primary, #409eff)',
      boxShadow:
        'inset 0 0 0 1px var(--mk-primary-muted, rgba(64, 158, 255, 0.16))',
      pointerEvents: 'none',
      transform: '',
      transition: '',
      animation: '',
      ...this.options.placeholderStyle,
    })
    placeholder.setAttribute('aria-hidden', 'true')

    const mirror = item.cloneNode(true) as HTMLElement

    originalParent.insertBefore(placeholder, item)
    item.style.display = 'none'
    this.getDragLayer().appendChild(mirror)
    mirror.classList.add('mk-draggable-dragging')

    Object.assign(mirror.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      zIndex: '1',
      cursor: 'grabbing',
      pointerEvents: 'none',
      opacity: `${this.options.ghostOpacity}`,
      transform: `translate3d(0, 0, 0) scale(${this.options.dragScale})`,
      transformOrigin: 'center',
      willChange: 'transform',
      contain: 'layout paint style',
      backfaceVisibility: 'hidden',
      boxShadow: '0 18px 50px rgba(15, 23, 42, 0.26)',
      userSelect: 'none',
    })

    Array.from(this.container.children).forEach((child) => {
      if (
        !(child instanceof HTMLElement) ||
        child === placeholder ||
        child === item
      )
        return
      child.style.willChange = 'transform'
    })

    this.state = {
      index,
      startIndex: index,
      el: item,
      mirror,
      originalStyle,
      originalParent,
      originalNextSibling,
      startY: touch.clientY,
      startX: touch.clientX,
      currentY: touch.clientY,
      currentX: touch.clientX,
      placeholder,
      rect,
    }

    this.options.onDragStart?.({ index, item })

    const onMove = (ev: MouseEvent | TouchEvent) => this.onPointerMove(ev)
    const onUp = (ev: MouseEvent | TouchEvent) => this.onPointerUp(ev)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)

    this.handlers.push(
      { event: 'mousemove', fn: onMove as EventListener, target: document },
      { event: 'mouseup', fn: onUp as EventListener, target: document },
      { event: 'touchmove', fn: onMove as EventListener, target: document },
      { event: 'touchend', fn: onUp as EventListener, target: document }
    )
  }

  private onPointerMove(e: MouseEvent | TouchEvent): void {
    if (!this.state) return
    e.preventDefault()

    const touch = 'touches' in e ? e.touches[0] : e
    this.state.currentY = touch.clientY
    this.state.currentX = touch.clientX

    this.applyDragTransform(this.state)
    this.updatePlaceholderPosition()

    this.options.onDragMove?.({
      index: this.state.index,
      fromIndex: this.state.startIndex,
      deltaX: this.state.currentX - this.state.startX,
      deltaY: this.state.currentY - this.state.startY,
      item: this.state.el,
    })
  }

  private onPointerUp(e: MouseEvent | TouchEvent): void {
    if (!this.state) return
    e.preventDefault()

    const touch = 'changedTouches' in e ? e.changedTouches[0] : e
    this.state.currentY = touch.clientY
    this.state.currentX = touch.clientX
    this.applyDragTransform(this.state)
    this.updatePlaceholderPosition()

    const { state } = this

    this.cleanupDragListeners()
    this.releaseToPlaceholder(state)
  }

  private applyDragTransform(state: DragState): void {
    const dx = state.currentX - state.startX
    const dy = state.currentY - state.startY
    state.mirror.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${this.options.dragScale})`
  }

  private releaseToPlaceholder(state: DragState): void {
    const item = state.el
    const mirror = state.mirror
    const targetRect = state.placeholder.getBoundingClientRect()
    const currentX = state.currentX - state.startX
    const currentY = state.currentY - state.startY
    const targetX = targetRect.left - state.rect.left
    const targetY = targetRect.top - state.rect.top

    this.cancelShiftAnimations()
    this.clearSiblingMotionHints(state)

    const finish = () => {
      this.releaseAnim?.cancel()
      this.releaseAnim = null
      if (state.placeholder.parentNode) {
        state.placeholder.replaceWith(item)
      } else {
        this.container.appendChild(item)
      }
      this.restoreItemStyle(item, state.originalStyle)
      mirror.remove()
      this.cleanupDragLayer()
      const fromIndex = state.startIndex
      const toIndex = state.index
      this.state = null
      this.options.onDragEnd?.({ fromIndex, toIndex, item })
      if (toIndex !== fromIndex) {
        this.options.onReorder?.(fromIndex, toIndex)
      }
    }

    if (this.prefersReducedMotion) {
      finish()
      return
    }

    if (
      Math.abs(currentX - targetX) < 0.5 &&
      Math.abs(currentY - targetY) < 0.5
    ) {
      finish()
      return
    }

    this.releaseAnim = mirror.animate(
      [
        {
          transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${this.options.dragScale})`,
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.26)',
        },
        {
          transform: `translate3d(${targetX}px, ${targetY}px, 0) scale(1)`,
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.12)',
        },
      ],
      {
        duration: this.options.duration,
        easing: this.options.easing,
        fill: 'both',
      }
    )

    this.releaseAnim.finished.then(finish).catch(() => {
      this.restoreState(state)
      this.releaseAnim = null
      this.state = null
    })
  }

  private restoreState(state: DragState): void {
    this.releaseAnim?.cancel()
    this.releaseAnim = null
    if (state.placeholder.parentNode) {
      state.placeholder.replaceWith(state.el)
    } else if (
      state.originalNextSibling &&
      state.originalNextSibling.parentNode === state.originalParent
    ) {
      state.originalParent.insertBefore(state.el, state.originalNextSibling)
    } else {
      state.originalParent.appendChild(state.el)
    }
    this.restoreItemStyle(state.el, state.originalStyle)
    state.mirror.remove()
    this.clearSiblingMotionHints(state)
    this.cleanupDragLayer()
  }

  private restoreItemStyle(item: HTMLElement, originalStyle: string): void {
    item.classList.remove('mk-draggable-dragging')
    item.setAttribute('style', originalStyle)
    if (!originalStyle && item.getAttribute('style') === '') {
      item.removeAttribute('style')
    }
  }

  private getDragLayer(): HTMLElement {
    if (this.dragLayer && this.dragLayer.isConnected) return this.dragLayer

    const layer = document.createElement('div')
    layer.setAttribute('data-mk-drag-layer', '')
    Object.assign(layer.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      pointerEvents: 'none',
      isolation: 'isolate',
      overflow: 'visible',
      contain: 'layout paint style',
    })
    document.body.appendChild(layer)
    this.dragLayer = layer
    return layer
  }

  private cleanupDragLayer(): void {
    if (this.dragLayer?.parentNode && this.dragLayer.children.length === 0) {
      this.dragLayer.remove()
      this.dragLayer = null
    }
  }

  private clearSiblingMotionHints(state: DragState): void {
    Array.from(this.container.children).forEach((child) => {
      if (
        !(child instanceof HTMLElement) ||
        child === state.placeholder ||
        child === state.el
      )
        return
      child.style.transition = ''
      child.style.transform = ''
      child.style.willChange = ''
    })
  }

  private findItem(target: HTMLElement): HTMLElement | null {
    const item =
      (target.closest('[data-flip-item]') as HTMLElement) ||
      (target.closest('[data-draggable]') as HTMLElement) ||
      this.findDirectChild(target)
    if (
      item &&
      (item.hasAttribute('data-drag-disabled') ||
        item.closest('[data-drag-disabled]'))
    ) {
      return null
    }
    return item
  }

  private findDirectChild(target: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = target
    while (node && node.parentElement !== this.container) {
      node = node.parentElement
    }
    return node?.parentElement === this.container ? node : null
  }

  private updatePlaceholderPosition(): void {
    if (!this.state) return

    const newIndex = this.findNewIndex()
    if (newIndex !== this.state.index && newIndex >= 0) {
      this.movePlaceholder(newIndex)
      this.state.index = newIndex
    }
  }

  private findNewIndex(): number {
    if (!this.state) return -1

    const pointer =
      this.options.direction === 'vertical'
        ? this.state.currentY
        : this.state.currentX
    const items = Array.from(this.container.children).filter(
      (c): c is HTMLElement =>
        c instanceof HTMLElement &&
        c !== this.state!.placeholder &&
        c !== this.state!.el
    )

    return calcDragIndex(items, pointer, this.options.direction)
  }

  private movePlaceholder(newIndex: number): void {
    if (!this.state) return

    const items = Array.from(this.container.children).filter(
      (c): c is HTMLElement =>
        c instanceof HTMLElement &&
        c !== this.state!.placeholder &&
        c !== this.state!.el
    )

    if (newIndex >= items.length) {
      if (this.state.placeholder === this.container.lastElementChild) return
    } else if (this.state.placeholder.nextElementSibling === items[newIndex]) {
      return
    }

    const before = items.map((el) => ({ el, rect: el.getBoundingClientRect() }))

    if (newIndex >= items.length) {
      this.container.appendChild(this.state.placeholder)
    } else {
      this.container.insertBefore(this.state.placeholder, items[newIndex])
    }

    this.container.offsetHeight
    const afterMap = new Map<HTMLElement, DOMRect>()
    Array.from(this.container.children).forEach((child) => {
      if (
        !(child instanceof HTMLElement) ||
        child === this.state!.placeholder ||
        child === this.state!.el
      )
        return
      afterMap.set(child, child.getBoundingClientRect())
    })

    if (this.prefersReducedMotion) return

    before.forEach(({ el, rect: first }) => {
      const last = afterMap.get(el)
      if (!last) return
      const dx = first.left - last.left
      const dy = first.top - last.top
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return

      this.shiftAnimations.get(el)?.cancel()
      const anim = el.animate(
        [
          { transform: `translate3d(${dx}px, ${dy}px, 0)` },
          { transform: 'translate3d(0, 0, 0)' },
        ],
        {
          duration: Math.max(130, this.options.duration - 20),
          easing: this.options.easing,
          fill: 'both',
        }
      )
      this.shiftAnimations.set(el, anim)
      anim.finished
        .then(() => {
          if (this.shiftAnimations.get(el) === anim) {
            this.shiftAnimations.delete(el)
            el.style.transform = ''
          }
        })
        .catch(() => {})
    })
  }

  private cancelShiftAnimations(): void {
    this.shiftAnimations.forEach((anim) => anim.cancel())
    this.shiftAnimations.clear()
  }

  private cleanupDragListeners(): void {
    const dragHandlers = this.handlers.splice(-4)
    dragHandlers.forEach(({ event, fn, target }) => {
      target.removeEventListener(event, fn)
    })
  }

  destroy(): void {
    this.destroyed = true
    this.releaseAnim?.cancel()
    this.releaseAnim = null
    this.cancelShiftAnimations()
    if (this.state) {
      this.restoreState(this.state)
      this.cleanupDragListeners()
      this.state = null
    }
    this.handlers.forEach(({ event, fn, target }) => {
      target.removeEventListener(event, fn)
    })
    this.handlers = []
    this.cleanupDragLayer()
  }
}

export function createDraggableList(
  container: HTMLElement | string,
  options?: DraggableListOptions
): DraggableList {
  return new DraggableList(container, options)
}
