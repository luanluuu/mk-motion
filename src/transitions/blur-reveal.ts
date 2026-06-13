export interface BlurRevealOptions {
  duration?: number
  blurStart?: number // 初始模糊像素
  stagger?: number // 子元素间隔
  childSelector?: string // 子元素选择器
}

const DEFAULT_BLUR: Required<Omit<BlurRevealOptions, 'childSelector'>> = {
  duration: 800,
  blurStart: 10,
  stagger: 100,
}

/**
 * 元素从模糊到清晰的渐入效果
 */
export function blurReveal(
  element: HTMLElement | string,
  options: BlurRevealOptions = {}
): Promise<void> {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('blurReveal: element not found')

  const opts = { ...DEFAULT_BLUR, ...options }

  el.style.filter = `blur(${opts.blurStart}px)`
  el.style.opacity = '0'
  el.style.transition = `filter ${opts.duration}ms ease, opacity ${opts.duration}ms ease`

  // 强制重排
  el.offsetHeight

  return new Promise((resolve) => {
    el.style.filter = 'blur(0px)'
    el.style.opacity = '1'

    setTimeout(() => {
      el.style.transition = ''
      resolve()
    }, opts.duration)
  })
}

/**
 * 子元素依次模糊渐入
 */
export function blurRevealChildren(
  element: HTMLElement | string,
  options: BlurRevealOptions = {}
): Promise<void> {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('blurRevealChildren: element not found')

  const opts = { ...DEFAULT_BLUR, ...options }
  const children: HTMLElement[] = opts.childSelector
    ? Array.from(el.querySelectorAll<HTMLElement>(opts.childSelector))
    : Array.from(el.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement
      )

  children.forEach((c) => {
    c.style.filter = `blur(${opts.blurStart}px)`
    c.style.opacity = '0'
    c.style.transition = `filter ${opts.duration}ms ease, opacity ${opts.duration}ms ease`
  })

  el.offsetHeight

  return new Promise((resolve) => {
    let done = 0
    children.forEach((c, i) => {
      setTimeout(() => {
        c.style.filter = 'blur(0px)'
        c.style.opacity = '1'

        setTimeout(() => {
          c.style.transition = ''
          done++
          if (done >= children.length) resolve()
        }, opts.duration)
      }, i * opts.stagger)
    })
  })
}
