import type { AnimationName, AnimationOptions } from './utils.ts'
import { toCssTime, setCSSVariables, removeCSSVariables } from './utils.ts'

const DEFAULT_OPTIONS: Required<AnimationOptions> = {
  duration: 500,
  easing: 'ease',
  delay: 0,
  iterations: 1,
  direction: 'normal',
  fill: 'both',
}

export class Animator {
  private element: HTMLElement
  private currentAnimation: Animation | null = null

  constructor(element: HTMLElement | string) {
    this.element =
      typeof element === 'string'
        ? document.querySelector(element)!
        : element

    if (!this.element) {
      throw new Error(`Animator: element not found`)
    }
  }

  /**
   * 播放 CSS 类动画
   */
  animate(
    name: AnimationName,
    options: AnimationOptions = {}
  ): Promise<Animator> {
    return new Promise((resolve) => {
      const opts = { ...DEFAULT_OPTIONS, ...options }

      setCSSVariables(this.element, {
        duration: toCssTime(opts.duration),
        easing: opts.easing,
      })

      const className = `mk-animated mk-${name}`
      this.element.classList.add(...className.split(' '))

      const cleanup = () => {
        this.element.classList.remove(...className.split(' '))
        removeCSSVariables(this.element, ['duration', 'easing'])
        resolve(this)
      }

      const onEnd = (e: AnimationEvent) => {
        if (e.animationName.startsWith('mk-')) {
          this.element.removeEventListener('animationend', onEnd)
          cleanup()
        }
      }

      if (opts.iterations === Infinity || opts.iterations <= 0) {
        this.element.classList.add('mk-infinite')
        resolve(this)
        return
      }

      this.element.addEventListener('animationend', onEnd)
    })
  }

  /**
   * 使用 Web Animations API 播放动画
   */
  waa(
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: AnimationOptions & { duration?: number } = {}
  ): Promise<Animator> {
    return new Promise((resolve) => {
      const opts = { ...DEFAULT_OPTIONS, ...options }

      this.currentAnimation = this.element.animate(keyframes, {
        duration: opts.duration,
        easing: opts.easing,
        delay: opts.delay,
        iterations: opts.iterations === Infinity ? Infinity : opts.iterations,
        direction: opts.direction,
        fill: opts.fill,
      })

      this.currentAnimation.onfinish = () => resolve(this)

      if (opts.iterations === Infinity || opts.iterations <= 0) {
        resolve(this)
      }
    })
  }

  /**
   * 停止当前动画
   */
  stop(): this {
    if (this.currentAnimation) {
      this.currentAnimation.cancel()
      this.currentAnimation = null
    }
    return this
  }

  /**
   * 移除所有动效类
   */
  reset(): this {
    const classes = Array.from(this.element.classList)
    const toRemove = classes.filter((c) => c.startsWith('mk-'))
    this.element.classList.remove(...toRemove)
    return this
  }

  /**
   * 设置元素样式变量
   */
  vars(variables: Record<string, string | number>): this {
    setCSSVariables(this.element, variables)
    return this
  }
}