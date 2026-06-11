import { springTo, SpringAnimation } from '../core/spring-engine.js'
import type { SpringOptions } from '../core/spring-engine.js'

const activeSpringAnimations = new WeakMap<HTMLElement, SpringAnimation>()

function playSpring(el: HTMLElement, to: Record<string, any>, spring: SpringOptions): void {
  activeSpringAnimations.get(el)?.stop()
  const from: Record<string, any> = {}
  const anim = new SpringAnimation(el, from, to, spring)
  activeSpringAnimations.set(el, anim)
  anim.play()
    .then(() => {
      if (activeSpringAnimations.get(el) === anim) {
        activeSpringAnimations.delete(el)
      }
    })
    .catch(() => {})
}

export interface ComponentSpringOptions {
  /** Enable spring animation for open/close */
  enabled?: boolean
  /** Spring physics options */
  spring?: SpringOptions
  /** Transform origin for scale animation */
  transformOrigin?: string
}

const DEFAULT_COMPONENT_SPRING: ComponentSpringOptions = {
  enabled: true,
  spring: { stiffness: 180, damping: 26 },
  transformOrigin: 'center',
}

/**
 * Apply spring enter/exit animation to overlay + content pattern
 * Used by Dialog, Drawer, Popover, etc.
 */
export function springOverlay(
  overlay: HTMLElement,
  content: HTMLElement,
  options: ComponentSpringOptions = {}
): { open: () => Promise<void>; close: () => Promise<void> } {
  const opts = { ...DEFAULT_COMPONENT_SPRING, ...options }

  if (!opts.enabled) {
    return {
      open: async () => {
        overlay.style.opacity = '1'
        overlay.style.pointerEvents = 'auto'
        content.style.opacity = '1'
        content.style.transform = 'scale(1)'
      },
      close: async () => {
        overlay.style.opacity = '0'
        overlay.style.pointerEvents = 'none'
        content.style.opacity = '0'
        content.style.transform = 'scale(0.95)'
      },
    }
  }

  const springOpts = opts.spring

  return {
    open: async () => {
      overlay.style.opacity = '0'
      overlay.style.pointerEvents = 'auto'
      content.style.opacity = '0'
      content.style.transform = `scale(0.9)`
      content.style.transformOrigin = opts.transformOrigin!

      await Promise.all([
        springTo(overlay, { opacity: 1 }, springOpts),
        springTo(content, { opacity: 1, scale: 1 }, springOpts),
      ])
    },

    close: async () => {
      content.style.transformOrigin = opts.transformOrigin!
      await Promise.all([
        springTo(overlay, { opacity: 0 }, { ...springOpts, stiffness: (springOpts?.stiffness ?? 300) * 1.5 }),
        springTo(content, { opacity: 0, scale: 0.95 }, { ...springOpts, stiffness: (springOpts?.stiffness ?? 300) * 1.5 }),
      ])
      overlay.style.pointerEvents = 'none'
    },
  }
}

/**
 * Apply spring hover effect to an element.
 * Returns a controller to enable/disable the effect.
 */
export function springHover(
  el: HTMLElement,
  options: {
    scale?: number
    y?: number
    shadow?: boolean
    spring?: SpringOptions
  } = {}
): { enable: () => void; disable: () => void; destroy: () => void } {
  const { scale = 1.02, y = -2, shadow = true, spring = { stiffness: 180, damping: 26 } } = options

  let enabled = true

  const onEnter = () => {
    if (!enabled) return
    const to: Record<string, any> = { scale, y }
    if (shadow) {
      el.style.boxShadow = 'var(--mk-shadow-md)'
    }
    playSpring(el, to, spring)
  }

  const onLeave = () => {
    if (!enabled) return
    const to: Record<string, any> = { scale: 1, y: 0 }
    if (shadow) {
      el.style.boxShadow = ''
    }
    playSpring(el, to, spring)
  }

  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)

  return {
    enable: () => { enabled = true },
    disable: () => { enabled = false },
    destroy: () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.style.transform = ''
      el.style.boxShadow = ''
    },
  }
}

/**
 * Apply spring press effect to an element.
 */
export function springPress(
  el: HTMLElement,
  options: {
    scale?: number
    spring?: SpringOptions
  } = {}
): { destroy: () => void } {
  const { scale = 0.96, spring = { stiffness: 220, damping: 24 } } = options

  const onDown = () => {
    playSpring(el, { scale }, spring)
  }
  const onUp = () => {
    playSpring(el, { scale: 1 }, spring)
  }

  el.addEventListener('mousedown', onDown)
  el.addEventListener('mouseup', onUp)
  el.addEventListener('mouseleave', onUp)

  return {
    destroy: () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mouseleave', onUp)
    },
  }
}
