export interface CollapseOptions {
  duration?: number
  easing?: string
}

const DEFAULT_COLLAPSE: Required<CollapseOptions> = {
  duration: 300,
  easing: 'ease-in-out',
}

/**
 * 高度展开动画（模拟 Vue 的 collapse-transition）
 */
export function expand(
  element: HTMLElement | string,
  options: CollapseOptions = {}
): Promise<void> {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('expand: element not found')

  const opts = { ...DEFAULT_COLLAPSE, ...options }

  el.style.overflow = 'hidden'
  el.style.display = ''
  const fullHeight = el.scrollHeight

  el.style.height = '0px'
  el.style.opacity = '0'
  el.style.transition = `height ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      el.style.height = `${fullHeight}px`
      el.style.opacity = '1'

      setTimeout(() => {
        el.style.height = ''
        el.style.overflow = ''
        el.style.transition = ''
        el.style.opacity = ''
        resolve()
      }, opts.duration)
    })
  })
}

/**
 * 高度折叠动画
 */
export function collapse(
  element: HTMLElement | string,
  options: CollapseOptions = {}
): Promise<void> {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('collapse: element not found')

  const opts = { ...DEFAULT_COLLAPSE, ...options }
  const fullHeight = el.scrollHeight

  el.style.overflow = 'hidden'
  el.style.height = `${fullHeight}px`
  el.style.transition = `height ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      el.style.height = '0px'
      el.style.opacity = '0'

      setTimeout(() => {
        el.style.display = 'none'
        el.style.height = ''
        el.style.overflow = ''
        el.style.transition = ''
        el.style.opacity = ''
        resolve()
      }, opts.duration)
    })
  })
}

/**
 * 切换展开/折叠
 */
export async function toggleCollapse(
  element: HTMLElement | string,
  options?: CollapseOptions
): Promise<boolean> {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('toggleCollapse: element not found')

  const isHidden =
    getComputedStyle(el).display === 'none' || el.offsetHeight === 0

  if (isHidden) {
    await expand(el, options)
    return true
  } else {
    await collapse(el, options)
    return false
  }
}
