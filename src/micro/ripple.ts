export interface RippleOptions {
  color?: string // 波纹颜色
  duration?: number // 动画时长毫秒
  maxScale?: number // 最大缩放倍数
}

const DEFAULT_RIPPLE: Required<RippleOptions> = {
  color: 'rgba(255, 255, 255, 0.35)',
  duration: 600,
  maxScale: 2.5,
}

/**
 * 给元素添加 Material Design 风格的水波纹点击效果
 */
export function addRipple(
  element: HTMLElement | string,
  options: RippleOptions = {}
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('addRipple: element not found')

  el.style.position = 'relative'
  el.style.overflow = 'hidden'

  const opts = { ...DEFAULT_RIPPLE, ...options }

  const handler = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${opts.color};
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      transform: scale(0);
      opacity: 1;
    `

    el.appendChild(ripple)

    const anim = ripple.animate(
      [
        { transform: 'scale(0)', opacity: 1 },
        { transform: `scale(${opts.maxScale})`, opacity: 0 },
      ],
      {
        duration: opts.duration,
        easing: 'ease-out',
      }
    )

    anim.onfinish = () => {
      ripple.remove()
    }
  }

  el.addEventListener('click', handler)

  return () => {
    el.removeEventListener('click', handler)
  }
}

/**
 * 一次性水波纹（不绑定事件，立即播放）
 */
export function rippleEffect(
  element: HTMLElement | string,
  options: RippleOptions = {}
): Promise<void> {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('rippleEffect: element not found')

  const opts = { ...DEFAULT_RIPPLE, ...options }
  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)

  const ripple = document.createElement('span')
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${opts.color};
    width: ${size}px;
    height: ${size}px;
    left: ${rect.width / 2 - size / 2}px;
    top: ${rect.height / 2 - size / 2}px;
    pointer-events: none;
    transform: scale(0);
    opacity: 1;
  `

  el.style.position = 'relative'
  el.style.overflow = 'hidden'
  el.appendChild(ripple)

  return new Promise((resolve) => {
    const anim = ripple.animate(
      [
        { transform: 'scale(0)', opacity: 1 },
        { transform: `scale(${opts.maxScale})`, opacity: 0 },
      ],
      {
        duration: opts.duration,
        easing: 'ease-out',
      }
    )

    anim.onfinish = () => {
      ripple.remove()
      resolve()
    }
  })
}
