export interface SpringOptions {
  stiffness?: number    // 刚度，默认 170
  damping?: number      // 阻尼，默认 26
  mass?: number         // 质量，默认 1
  precision?: number    // 停止精度，默认 0.01
}

const DEFAULT_SPRING: Required<SpringOptions> = {
  stiffness: 170,
  damping: 26,
  mass: 1,
  precision: 0.01,
}

export interface SpringTarget {
  from: number
  to: number
  onUpdate: (value: number) => void
  onComplete?: () => void
}

/**
 * 物理弹簧动画，基于胡克定律
 */
export function spring(
  target: SpringTarget,
  options: SpringOptions = {}
): () => void {
  const opts = { ...DEFAULT_SPRING, ...options }

  let velocity = 0
  let current = target.from
  let rafId: number
  let running = true

  const tick = () => {
    if (!running) return

    const displacement = current - target.to
    const springForce = -opts.stiffness * displacement
    const dampingForce = -opts.damping * velocity
    const acceleration = (springForce + dampingForce) / opts.mass

    velocity += acceleration * (1 / 60)
    current += velocity * (1 / 60)

    target.onUpdate(current)

    if (
      Math.abs(displacement) < opts.precision &&
      Math.abs(velocity) < opts.precision
    ) {
      target.onUpdate(target.to)
      target.onComplete?.()
      running = false
      return
    }

    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)

  return () => {
    running = false
    cancelAnimationFrame(rafId)
  }
}

/**
 * 弹性缩放：元素像弹簧一样弹到目标大小
 */
export function elasticScale(
  element: HTMLElement | string,
  toScale: number = 1,
  options?: SpringOptions
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('elasticScale: element not found')

  // 获取当前 scale
  const computed = getComputedStyle(el).transform
  let fromScale = 1
  if (computed !== 'none') {
    const matrix = new DOMMatrix(computed)
    fromScale = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b)
  }

  return spring(
    {
      from: fromScale,
      to: toScale,
      onUpdate: (value) => {
        el.style.transform = `scale(${value})`
      },
    },
    options
  )
}

/**
 * 弹性移动
 */
export function elasticMove(
  element: HTMLElement | string,
  toX: number,
  toY: number,
  options?: SpringOptions
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('elasticMove: element not found')

  let currentX = 0
  let currentY = 0

  const stopX = spring(
    {
      from: 0,
      to: toX,
      onUpdate: (x) => {
        currentX = x
        el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
      },
    },
    options
  )

  const stopY = spring(
    {
      from: 0,
      to: toY,
      onUpdate: (y) => {
        currentY = y
        el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
      },
    },
    options
  )

  return () => {
    stopX()
    stopY()
  }
}