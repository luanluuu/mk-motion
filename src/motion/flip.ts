import { springFromTo, type SpringOptions } from '../core/spring-engine.js'

export interface FlipOptions {
  /** Spring physics options */
  spring?: SpringOptions
  /** Duration in ms (fallback if spring not used) */
  duration?: number
  /** Easing (fallback if spring not used) */
  easing?: string
  /** Selector for children to animate */
  selector?: string
  /** Callback after animation completes */
  onComplete?: () => void
  /** Enable spring physics (default true) */
  useSpring?: boolean
}

interface ElementState {
  el: HTMLElement
  first: DOMRect
}

/**
 * Get layout snapshot of matching children
 */
function getSnapshot(container: HTMLElement, selector?: string): ElementState[] {
  const children = selector
    ? Array.from(container.querySelectorAll(selector))
    : Array.from(container.children)
  return children.map((el) => ({
    el: el as HTMLElement,
    first: el.getBoundingClientRect(),
  }))
}

/**
 * Core FLIP animation engine.
 * Record initial positions → apply changes → animate from old to new positions.
 */
export function flip(
  container: HTMLElement | string,
  changeFn: () => void,
  options: FlipOptions = {}
): Promise<void> {
  const el = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)!
    : container

  if (!el) throw new Error('flip: container not found')

  const {
    spring = { stiffness: 180, damping: 28 },
    selector,
    onComplete,
    useSpring = true,
  } = options

  // F - First: record initial positions
  const snapshot = getSnapshot(el, selector)
  if (snapshot.length === 0) {
    changeFn()
    onComplete?.()
    return Promise.resolve()
  }

  // Apply changes
  changeFn()

  // Force layout recalculation
  el.offsetHeight

  // L - Last: read new positions
  const promises: Promise<void>[] = []

  snapshot.forEach(({ el: child, first }) => {
    const last = child.getBoundingClientRect()
    const dx = first.left - last.left
    const dy = first.top - last.top
    const dw = first.width / last.width
    const dh = first.height / last.height

    // If element was hidden or became hidden, use opacity fade instead of scale FLIP
    // to avoid content distortion (emoji/text flying to corner) during scale(0)->scale(1).
    const wasHidden = first.width === 0 || first.height === 0
    const isHidden = last.width === 0 || last.height === 0
    if (wasHidden || isHidden) {
      const duration = options.duration ?? 240
      const easing = options.easing ?? 'ease'
      // Start from visible/invisible based on previous state
      child.style.opacity = wasHidden ? '0' : '1'
      promises.push(
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            child.style.transition = `opacity ${duration}ms ${easing}`
            child.style.opacity = isHidden ? '0' : '1'
          })
          setTimeout(() => {
            child.style.transition = ''
            if (isHidden) {
              child.style.opacity = '0'
              child.style.display = 'none'
            } else {
              child.style.opacity = ''
            }
            resolve()
          }, duration)
        })
      )
      return
    }

    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(dw - 1) < 0.01 && Math.abs(dh - 1) < 0.01) {
      return
    }

    // I - Invert: apply transform to old position
    child.style.transform = `translate(${dx}px, ${dy}px) scale(${dw}, ${dh})`
    child.style.transformOrigin = 'top left'

    if (useSpring) {
      promises.push(
        springFromTo(child, { x: dx, y: dy, scale: dw, scaleX: dw, scaleY: dh }, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }, spring).then(() => {
          child.style.transform = ''
          child.style.transformOrigin = ''
        })
      )
    } else {
      child.style.transition = `transform ${options.duration ?? 300}ms ${options.easing ?? 'ease'}`
      requestAnimationFrame(() => {
        child.style.transform = ''
      })
      promises.push(
        new Promise<void>((resolve) => {
          setTimeout(() => {
            child.style.transition = ''
            child.style.transformOrigin = ''
            resolve()
          }, options.duration ?? 300)
        })
      )
    }
  })

  return Promise.all(promises).then(() => {
    onComplete?.()
  })
}

/**
 * Staggered FLIP: animate children one after another
 */
export function staggerFlip(
  container: HTMLElement | string,
  changeFn: () => void,
  options: FlipOptions & { stagger?: number } = {}
): Promise<void> {
  const { stagger = 40, spring = { stiffness: 180, damping: 28 }, selector } = options
  const el = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)!
    : container

  if (!el) throw new Error('staggerFlip: container not found')

  const snapshot = getSnapshot(el, selector)
  if (snapshot.length === 0) {
    changeFn()
    options.onComplete?.()
    return Promise.resolve()
  }

  changeFn()
  el.offsetHeight

  const promises = snapshot.map(({ el: child, first }, index) => {
    const last = child.getBoundingClientRect()
    const dx = first.left - last.left
    const dy = first.top - last.top
    const dw = first.width / last.width
    const dh = first.height / last.height

    const wasHidden = first.width === 0 || first.height === 0
    const isHidden = last.width === 0 || last.height === 0
    if (wasHidden || isHidden) {
      const duration = options.duration ?? 240
      const easing = options.easing ?? 'ease'
      child.style.opacity = wasHidden ? '0' : '1'
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          requestAnimationFrame(() => {
            child.style.transition = `opacity ${duration}ms ${easing}`
            child.style.opacity = isHidden ? '0' : '1'
          })
          setTimeout(() => {
            child.style.transition = ''
            if (isHidden) {
              child.style.opacity = '0'
              child.style.display = 'none'
            } else {
              child.style.opacity = ''
            }
            resolve()
          }, duration + index * stagger)
        }, index * stagger)
      })
    }

    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(dw - 1) < 0.01 && Math.abs(dh - 1) < 0.01) {
      return Promise.resolve()
    }

    child.style.transform = `translate(${dx}px, ${dy}px) scale(${dw}, ${dh})`
    child.style.transformOrigin = 'top left'

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        springFromTo(child, { x: dx, y: dy, scale: dw, scaleX: dw, scaleY: dh }, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }, spring).then(() => {
          child.style.transform = ''
          child.style.transformOrigin = ''
          resolve()
        })
      }, index * stagger)
    })
  })

  return Promise.all(promises).then(() => {
    options.onComplete?.()
  })
}
