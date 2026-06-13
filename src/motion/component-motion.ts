import { Animator } from '../core/animator.ts'
import type { AnimationName } from '../core/utils.ts'

export type MicroAnimation = 'lift' | 'glow' | 'scale' | 'slideUp' | 'none'

export interface MotionOptions {
  /** Mount entrance animation */
  enter?:
    | 'fadeIn'
    | 'slideInUp'
    | 'slideInDown'
    | 'slideInLeft'
    | 'slideInRight'
    | 'zoomIn'
    | 'bounceIn'
    | 'none'
  /** Unmount exit animation */
  exit?: 'fadeOut' | 'slideOutUp' | 'slideOutDown' | 'zoomOut' | 'none'
  /** Hover micro-interaction */
  hover?: MicroAnimation
  /** Active/press micro-interaction */
  active?: 'press' | 'none'
  /** Focus ring animation */
  focus?: 'ring' | 'none'
  /** Duration in ms */
  duration?: number
  /** Delay in ms */
  delay?: number
  /** Easing */
  easing?: string
}

const defaultOptions: Required<MotionOptions> = {
  enter: 'fadeIn',
  exit: 'fadeOut',
  hover: 'none',
  active: 'none',
  focus: 'none',
  duration: 250,
  delay: 0,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
}

/**
 * Attach motion behaviors to a DOM element.
 * Returns controller to play enter/exit and manage state animations.
 */
export function withMotion(el: HTMLElement, options: MotionOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  const animator = opts.enter !== 'none' ? new Animator(el) : null
  const style = el.style
  const originalTransition = style.transition

  // Hover
  let hoverActive = false
  function onMouseEnter() {
    if (opts.hover === 'none') return
    hoverActive = true
    applyHover(true)
  }
  function onMouseLeave() {
    if (!hoverActive) return
    hoverActive = false
    applyHover(false)
  }

  function applyHover(active: boolean) {
    const t = `transform ${opts.duration}ms ${opts.easing}, box-shadow ${opts.duration}ms ${opts.easing}`
    switch (opts.hover) {
      case 'lift':
        style.transition = t
        style.transform = active ? 'translateY(-2px)' : ''
        style.boxShadow = active ? 'var(--mk-shadow-md)' : ''
        break
      case 'glow':
        style.transition = `box-shadow ${opts.duration}ms ${opts.easing}`
        style.boxShadow = active ? 'var(--mk-shadow-glow)' : ''
        break
      case 'scale':
        style.transition = `transform ${opts.duration}ms ${opts.easing}`
        style.transform = active ? 'scale(1.02)' : ''
        break
      case 'slideUp':
        style.transition = t
        style.transform = active ? 'translateY(-4px)' : ''
        break
    }
  }

  // Active / Press
  function onMouseDown() {
    if (opts.active === 'press') {
      style.transition = `transform ${opts.duration * 0.5}ms ${opts.easing}`
      style.transform = 'scale(0.97)'
    }
  }
  function onMouseUp() {
    if (opts.active === 'press') {
      style.transform = hoverActive
        ? opts.hover === 'lift'
          ? 'translateY(-2px)'
          : opts.hover === 'scale'
            ? 'scale(1.02)'
            : ''
        : ''
    }
  }

  // Focus ring
  function onFocus() {
    if (opts.focus === 'ring') {
      style.outline = 'none'
      style.boxShadow =
        '0 0 0 2px var(--mk-primary-muted), 0 0 0 4px var(--mk-primary)'
      style.transition = `box-shadow ${opts.duration}ms ${opts.easing}`
    }
  }
  function onBlur() {
    if (opts.focus === 'ring') {
      style.boxShadow = ''
    }
  }

  // Attach listeners
  el.addEventListener('mouseenter', onMouseEnter)
  el.addEventListener('mouseleave', onMouseLeave)
  el.addEventListener('mousedown', onMouseDown)
  el.addEventListener('mouseup', onMouseUp)
  el.addEventListener('focus', onFocus)
  el.addEventListener('blur', onBlur)

  return {
    /** Play entrance animation */
    async playEnter() {
      if (!animator || opts.enter === 'none') return
      await animator.animate(opts.enter, {
        duration: opts.duration,
        delay: opts.delay,
      })
    },

    /** Play exit animation. Returns a Promise that resolves when animation completes. */
    async playExit() {
      if (!animator || opts.exit === 'none') return
      await animator.animate(opts.exit, { duration: opts.duration })
    },

    /** Programmatically set hover state */
    setHover(active: boolean) {
      if (active) onMouseEnter()
      else onMouseLeave()
    },

    /** Clean up all listeners and styles */
    destroy() {
      el.removeEventListener('mouseenter', onMouseEnter)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('focus', onFocus)
      el.removeEventListener('blur', onBlur)
      style.transition = originalTransition
      style.transform = ''
      style.boxShadow = ''
      style.outline = ''
      animator?.stop()
    },
  }
}

/**
 * Stagger children entrance animation.
 */
export function staggerEnter(
  container: HTMLElement,
  selector: string,
  _animation?: AnimationName,
  options?: { duration?: number; stagger?: number; delay?: number }
) {
  const children = container.querySelectorAll<HTMLElement>(selector)
  if (children.length === 0) return

  const delay = options?.delay ?? 100
  const stagger = options?.stagger ?? 80
  const duration = options?.duration ?? 400

  children.forEach((htmlEl, i) => {
    htmlEl.style.opacity = '0'
    setTimeout(
      () => {
        htmlEl.style.transition = `opacity ${duration}ms ease`
        htmlEl.style.opacity = '1'
      },
      delay + i * stagger
    )
  })
}
