export interface ListStaggerOptions {
  stagger?: number         // 每项间隔毫秒
  duration?: number        // 单个动画时长
  animation?: 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'zoom'
}

const DEFAULT_LIST: Required<ListStaggerOptions> = {
  stagger: 60,
  duration: 400,
  animation: 'fadeUp',
}

const PRESETS: Record<string, { from: string; to: string }> = {
  fadeUp: {
    from: 'opacity:0;transform:translate3d(0,16px,0)',
    to: 'opacity:1;transform:translate3d(0,0,0)',
  },
  fadeDown: {
    from: 'opacity:0;transform:translate3d(0,-16px,0)',
    to: 'opacity:1;transform:translate3d(0,0,0)',
  },
  fadeLeft: {
    from: 'opacity:0;transform:translate3d(16px,0,0)',
    to: 'opacity:1;transform:translate3d(0,0,0)',
  },
  fadeRight: {
    from: 'opacity:0;transform:translate3d(-16px,0,0)',
    to: 'opacity:1;transform:translate3d(0,0,0)',
  },
  zoom: {
    from: 'opacity:0;transform:scale3d(0.9,0.9,0.9)',
    to: 'opacity:1;transform:scale3d(1,1,1)',
  },
}

/**
 * 列表项依次入场动画（类似 Element Plus Table 行入场）
 */
export function listStagger(
  container: HTMLElement | string,
  options: ListStaggerOptions = {}
): Promise<void> {
  const el =
    typeof container === 'string'
      ? document.querySelector<HTMLElement>(container)!
      : container

  if (!el) throw new Error('listStagger: container not found')

  const opts = { ...DEFAULT_LIST, ...options }
  const preset = PRESETS[opts.animation]
  const items = Array.from(el.children) as HTMLElement[]

  items.forEach((item) => {
    item.style.cssText += preset.from
  })

  el.offsetHeight // 强制重排

  return new Promise((resolve) => {
    let done = 0
    items.forEach((item, i) => {
      setTimeout(() => {
        item.style.transition = `all ${opts.duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
        item.style.cssText += preset.to

        setTimeout(() => {
          item.style.transition = ''
          done++
          if (done >= items.length) resolve()
        }, opts.duration)
      }, i * opts.stagger)
    })
  })
}