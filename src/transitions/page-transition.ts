export interface PageTransitionOptions {
  name?: 'slide' | 'fade' | 'zoom' | 'flip'
  direction?: 'forward' | 'back'
  duration?: number
}

const DEFAULT_OPTIONS: Required<PageTransitionOptions> = {
  name: 'slide',
  direction: 'forward',
  duration: 300,
}

const KEYFRAMES: Record<string, Record<string, Keyframe[]>> = {
  slide: {
    forwardEnter: [
      { transform: 'translateX(100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    forwardLeave: [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(-30%)', opacity: 0 },
    ],
    backEnter: [
      { transform: 'translateX(-100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    backLeave: [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(30%)', opacity: 0 },
    ],
  },
  fade: {
    forwardEnter: [
      { opacity: 0 },
      { opacity: 1 },
    ],
    forwardLeave: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    backEnter: [
      { opacity: 0 },
      { opacity: 1 },
    ],
    backLeave: [
      { opacity: 1 },
      { opacity: 0 },
    ],
  },
  zoom: {
    forwardEnter: [
      { transform: 'scale(0.9)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    forwardLeave: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.1)', opacity: 0 },
    ],
    backEnter: [
      { transform: 'scale(1.1)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    backLeave: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(0.9)', opacity: 0 },
    ],
  },
  flip: {
    forwardEnter: [
      { transform: 'rotateY(90deg)', opacity: 0 },
      { transform: 'rotateY(0deg)', opacity: 1 },
    ],
    forwardLeave: [
      { transform: 'rotateY(0deg)', opacity: 1 },
      { transform: 'rotateY(-90deg)', opacity: 0 },
    ],
    backEnter: [
      { transform: 'rotateY(-90deg)', opacity: 0 },
      { transform: 'rotateY(0deg)', opacity: 1 },
    ],
    backLeave: [
      { transform: 'rotateY(0deg)', opacity: 1 },
      { transform: 'rotateY(90deg)', opacity: 0 },
    ],
  },
}

function getKeyframes(
  name: string,
  direction: 'forward' | 'back',
  type: 'enter' | 'leave'
): Keyframe[] {
  const key = name as keyof typeof KEYFRAMES
  const dir = direction === 'forward' ? 'forward' : 'back'
  const t = type === 'enter' ? 'Enter' : 'Leave'
  return KEYFRAMES[key]?.[`${dir}${t}`] || KEYFRAMES.slide.forwardEnter
}

function getClassName(
  name: string,
  direction: 'forward' | 'back',
  type: 'enter' | 'leave'
): string {
  return `mk-page-transition-${name}-${direction}-${type}`
}

export function pageTransition(
  enterEl: HTMLElement,
  leaveEl: HTMLElement,
  options?: PageTransitionOptions
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const enterClass = getClassName(opts.name, opts.direction, 'enter')
  const leaveClass = getClassName(opts.name, opts.direction, 'leave')

  // Inject CSS keyframes if not already present
  const styleId = `mk-page-transition-${opts.name}-${opts.direction}`
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style')
    styleEl.id = styleId
    const enterKf = getKeyframes(opts.name, opts.direction, 'enter')
    const leaveKf = getKeyframes(opts.name, opts.direction, 'leave')

    styleEl.textContent = `
      @keyframes ${enterClass}-anim {
        from { ${Object.entries(enterKf[0]).map(([k, v]) => `${k}:${v}`).join(';')} }
        to   { ${Object.entries(enterKf[1]).map(([k, v]) => `${k}:${v}`).join(';')} }
      }
      @keyframes ${leaveClass}-anim {
        from { ${Object.entries(leaveKf[0]).map(([k, v]) => `${k}:${v}`).join(';')} }
        to   { ${Object.entries(leaveKf[1]).map(([k, v]) => `${k}:${v}`).join(';')} }
      }
    `
    document.head.appendChild(styleEl)
  }

  enterEl.style.display = ''
  leaveEl.style.display = ''

  const enterAnim = enterEl.animate(getKeyframes(opts.name, opts.direction, 'enter'), {
    duration: opts.duration,
    easing: 'ease',
    fill: 'both',
  })

  const leaveAnim = leaveEl.animate(getKeyframes(opts.name, opts.direction, 'leave'), {
    duration: opts.duration,
    easing: 'ease',
    fill: 'both',
  })

  return new Promise((resolve) => {
    const checkDone = () => {
      if (enterAnim.playState === 'finished' && leaveAnim.playState === 'finished') {
        enterAnim.commitStyles?.()
        leaveAnim.commitStyles?.()
        enterAnim.cancel()
        leaveAnim.cancel()
        resolve()
      }
    }
    enterAnim.addEventListener('finish', checkDone)
    leaveAnim.addEventListener('finish', checkDone)
  })
}

export function createPageTransitionRouter(
  routes: Record<string, () => HTMLElement>
): { navigate: (path: string) => Promise<void>; currentPath: () => string } {
  const container = document.createElement('div')
  container.style.position = 'relative'
  container.style.overflow = 'hidden'
  container.style.width = '100%'
  container.style.height = '100%'

  let currentPath = ''
  let currentEl: HTMLElement | null = null
  let isNavigating = false

  async function navigate(path: string, options?: PageTransitionOptions): Promise<void> {
    if (isNavigating) return
    const factory = routes[path]
    if (!factory) return

    isNavigating = true
    const direction: 'forward' | 'back' =
      options?.direction ?? (path > currentPath ? 'forward' : 'back')

    const enterEl = factory()
    enterEl.style.position = 'absolute'
    enterEl.style.top = '0'
    enterEl.style.left = '0'
    enterEl.style.width = '100%'
    enterEl.style.height = '100%'
    enterEl.style.display = 'none'
    container.appendChild(enterEl)

    if (currentEl) {
      await pageTransition(enterEl, currentEl, {
        ...options,
        direction,
      })
      currentEl.remove()
    } else {
      enterEl.style.display = ''
    }

    currentEl = enterEl
    currentPath = path
    isNavigating = false
  }

  return {
    navigate,
    currentPath: () => currentPath,
  }
}
