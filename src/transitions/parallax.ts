export interface ParallaxOptions {
  speed?: number // 视差速度，0.1~1
  direction?: 'vertical' | 'horizontal'
}

const DEFAULT_PARALLAX: Required<ParallaxOptions> = {
  speed: 0.3,
  direction: 'vertical',
}

/**
 * 给元素添加视差滚动效果
 */
export function parallax(
  element: HTMLElement | string,
  options: ParallaxOptions = {}
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('parallax: element not found')

  const opts = { ...DEFAULT_PARALLAX, ...options }

  const onScroll = () => {
    const rect = el.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const centerOffset = rect.top + rect.height / 2 - windowHeight / 2
    const offset = centerOffset * opts.speed

    if (opts.direction === 'vertical') {
      el.style.transform = `translateY(${offset}px)`
    } else {
      el.style.transform = `translateX(${offset}px)`
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  return () => {
    window.removeEventListener('scroll', onScroll)
    el.style.transform = ''
  }
}

/**
 * 批量给多个元素添加视差，支持不同速度
 */
export function parallaxGroup(
  items: Array<{
    selector: string
    speed?: number
    direction?: 'vertical' | 'horizontal'
  }>
): () => void {
  const cleaners = items.map((item) =>
    parallax(item.selector, { speed: item.speed, direction: item.direction })
  )

  return () => cleaners.forEach((fn) => fn())
}
