export interface ShimmerOptions {
  duration?: number        //  shimmer 循环周期
  color?: string           //  shimmer 颜色
  angle?: number           //  角度 deg
}

const DEFAULT_SHIMMER: Required<ShimmerOptions> = {
  duration: 1500,
  color: 'rgba(255,255,255,0.25)',
  angle: 100,
}

/**
 * 给元素添加骨架屏 shimmer 效果
 */
export function shimmer(
  element: HTMLElement | string,
  options: ShimmerOptions = {}
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('shimmer: element not found')

  const opts = { ...DEFAULT_SHIMMER, ...options }

  el.style.background = '#1e293b'
  el.style.position = 'relative'
  el.style.overflow = 'hidden'

  const shimmerEl = document.createElement('div')
  shimmerEl.style.cssText = `
    position: absolute;
    inset: 0;
    background: linear-gradient(${opts.angle}deg, transparent 30%, ${opts.color} 50%, transparent 70%);
    background-size: 200% 100%;
    animation: mk-shimmer ${opts.duration}ms infinite linear;
    pointer-events: none;
  `

  // 检查是否已有 shimmer keyframes
  if (!document.getElementById('mk-shimmer-style')) {
    const style = document.createElement('style')
    style.id = 'mk-shimmer-style'
    style.textContent = `
      @keyframes mk-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `
    document.head.appendChild(style)
  }

  el.appendChild(shimmerEl)

  return () => {
    shimmerEl.remove()
    el.style.background = ''
    el.style.position = ''
    el.style.overflow = ''
  }
}

/**
 * 骨架屏预设：生成若干 shimmer 占位条
 */
export function skeleton(
  container: HTMLElement | string,
  lines: number = 3,
  options?: ShimmerOptions
): () => void {
  const el =
    typeof container === 'string'
      ? document.querySelector<HTMLElement>(container)!
      : container

  if (!el) throw new Error('skeleton: container not found')

  const original = el.innerHTML
  el.innerHTML = ''
  el.style.display = 'flex'
  el.style.flexDirection = 'column'
  el.style.gap = '12px'

  const cleaners: (() => void)[] = []

  for (let i = 0; i < lines; i++) {
    const line = document.createElement('div')
    line.style.height = i === 0 ? '24px' : '16px'
    line.style.width = i === lines - 1 ? '60%' : '100%'
    line.style.borderRadius = '4px'
    el.appendChild(line)
    cleaners.push(shimmer(line, options))
  }

  return () => {
    cleaners.forEach((fn) => fn())
    el.innerHTML = original
    el.style.display = ''
    el.style.flexDirection = ''
    el.style.gap = ''
  }
}