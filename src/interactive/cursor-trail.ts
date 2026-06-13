export interface CursorTrailOptions {
  count?: number // 粒子数量
  color?: string
  size?: number
  fadeSpeed?: number // 淡出速度
  smoothing?: number // 平滑度 0~1
}

const DEFAULT_TRAIL: Required<CursorTrailOptions> = {
  count: 15,
  color: '#38bdf8',
  size: 8,
  fadeSpeed: 0.92,
  smoothing: 0.15,
}

interface TrailDot {
  el: HTMLElement
  x: number
  y: number
  targetX: number
  targetY: number
  opacity: number
}

/**
 * 鼠标跟随粒子拖尾
 */
export function cursorTrail(options: CursorTrailOptions = {}): () => void {
  const opts = { ...DEFAULT_TRAIL, ...options }

  const dots: TrailDot[] = []
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9998;
    overflow: hidden;
  `
  document.body.appendChild(container)

  for (let i = 0; i < opts.count; i++) {
    const el = document.createElement('div')
    el.style.cssText = `
      position: absolute;
      width: ${opts.size}px;
      height: ${opts.size}px;
      border-radius: 50%;
      background: ${opts.color};
      opacity: 0;
      pointer-events: none;
    `
    container.appendChild(el)
    dots.push({
      el,
      x: -100,
      y: -100,
      targetX: -100,
      targetY: -100,
      opacity: 0,
    })
  }

  let mouseX = -100
  let mouseY = -100
  let running = true

  const onMove = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY
  }

  document.addEventListener('mousemove', onMove)

  const tick = () => {
    if (!running) return

    dots.forEach((dot, i) => {
      if (i === 0) {
        dot.targetX = mouseX
        dot.targetY = mouseY
      } else {
        dot.targetX = dots[i - 1].x
        dot.targetY = dots[i - 1].y
      }

      dot.x += (dot.targetX - dot.x) * opts.smoothing
      dot.y += (dot.targetY - dot.y) * opts.smoothing

      if (mouseX > 0) {
        dot.opacity = Math.min(1, dot.opacity + 0.1)
      }
      dot.opacity *= opts.fadeSpeed

      const size = opts.size * (1 - (i / opts.count) * 0.6)
      dot.el.style.transform = `translate(${dot.x - size / 2}px, ${dot.y - size / 2}px)`
      dot.el.style.width = `${size}px`
      dot.el.style.height = `${size}px`
      dot.el.style.opacity = String(dot.opacity)
    })

    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)

  return () => {
    running = false
    document.removeEventListener('mousemove', onMove)
    container.remove()
  }
}
