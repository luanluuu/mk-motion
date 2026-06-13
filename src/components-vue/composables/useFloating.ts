import { ref, type Ref } from 'vue'

export type Placement = 'top' | 'bottom' | 'left' | 'right'

export interface FloatingPosition {
  top: number
  left: number
  arrowClass: string
}

export function computePosition(
  targetRect: DOMRect,
  floatingRect: DOMRect,
  placement: Placement,
  offset = 8
): FloatingPosition {
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  let top = 0
  let left = 0
  let arrowClass = ''

  switch (placement) {
    case 'top':
      top = targetRect.top + scrollY - floatingRect.height - offset
      left =
        targetRect.left +
        scrollX +
        targetRect.width / 2 -
        floatingRect.width / 2
      arrowClass = 'is-bottom'
      break
    case 'bottom':
      top = targetRect.bottom + scrollY + offset
      left =
        targetRect.left +
        scrollX +
        targetRect.width / 2 -
        floatingRect.width / 2
      arrowClass = 'is-top'
      break
    case 'left':
      top =
        targetRect.top +
        scrollY +
        targetRect.height / 2 -
        floatingRect.height / 2
      left = targetRect.left + scrollX - floatingRect.width - offset
      arrowClass = 'is-right'
      break
    case 'right':
      top =
        targetRect.top +
        scrollY +
        targetRect.height / 2 -
        floatingRect.height / 2
      left = targetRect.right + scrollX + offset
      arrowClass = 'is-left'
      break
  }

  const padding = 8
  if (left < padding) left = padding
  if (left + floatingRect.width > window.innerWidth - padding) {
    left = window.innerWidth - floatingRect.width - padding
  }
  if (top < padding) top = padding

  return { top, left, arrowClass }
}

export function useFloating(
  targetRef: Ref<HTMLElement | null | undefined>,
  floatingRef: Ref<HTMLElement | null | undefined>,
  placement: Ref<Placement> | Placement,
  offset = 8
) {
  const position = ref({ top: 0, left: 0 })
  const arrowClass = ref('is-bottom')

  const update = () => {
    const target = targetRef.value
    const floating = floatingRef.value
    if (!target || !floating) return
    const targetRect = target.getBoundingClientRect()
    // Force display to measure
    const prevDisplay = floating.style.display
    floating.style.display = 'block'
    const floatingRect = floating.getBoundingClientRect()
    floating.style.display = prevDisplay
    const p = typeof placement === 'string' ? placement : placement.value
    const result = computePosition(targetRect, floatingRect, p, offset)
    position.value = { top: result.top, left: result.left }
    arrowClass.value = result.arrowClass
  }

  return { position, arrowClass, update }
}
