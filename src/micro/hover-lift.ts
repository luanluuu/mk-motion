export interface HoverLiftOptions {
  y?: number            // 悬浮时向上移动像素
  scale?: number        // 悬浮时放大比例
  shadow?: string       // 悬浮时阴影
  duration?: number     // 过渡时长毫秒
  easing?: string       // 缓动
}

const DEFAULT_HOVER: Required<HoverLiftOptions> = {
  y: -6,
  scale: 1.02,
  shadow: '0 12px 24px rgba(0,0,0,0.15)',
  duration: 250,
  easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
}

/**
 * 给元素添加悬浮抬升效果
 */
export function hoverLift(
  element: HTMLElement | string,
  options: HoverLiftOptions = {}
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('hoverLift: element not found')

  const opts = { ...DEFAULT_HOVER, ...options }

  el.style.transition = `transform ${opts.duration}ms ${opts.easing}, box-shadow ${opts.duration}ms ${opts.easing}`

  const onEnter = () => {
    el.style.transform = `translateY(${opts.y}px) scale(${opts.scale})`
    el.style.boxShadow = opts.shadow
  }

  const onLeave = () => {
    el.style.transform = ''
    el.style.boxShadow = ''
  }

  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)

  return () => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
    el.style.transition = ''
    el.style.transform = ''
    el.style.boxShadow = ''
  }
}

/**
 * 给元素添加悬浮发光效果
 */
export function hoverGlow(
  element: HTMLElement | string,
  color: string = 'rgba(56, 189, 248, 0.4)',
  options?: Pick<HoverLiftOptions, 'duration' | 'easing'>
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('hoverGlow: element not found')

  const duration = options?.duration ?? 250
  const easing = options?.easing ?? 'ease'

  el.style.transition = `box-shadow ${duration}ms ${easing}`

  const onEnter = () => {
    el.style.boxShadow = `0 0 20px ${color}`
  }

  const onLeave = () => {
    el.style.boxShadow = ''
  }

  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)

  return () => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
    el.style.transition = ''
    el.style.boxShadow = ''
  }
}