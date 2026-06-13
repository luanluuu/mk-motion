export interface SpringOptions {
  stiffness?: number // 刚度，默认 170
  damping?: number // 阻尼，默认 26
  mass?: number // 质量，默认 1
  precision?: number // 停止精度，默认 0.01
}

const DEFAULT_SPRING: Required<SpringOptions> = {
  stiffness: 150,
  damping: 24,
  mass: 1,
  precision: 0.01,
}

// DevTools registry
declare global {
  interface Window {
    __MK_MOTION__?: MkMotionGlobal
  }
}

interface MkMotionGlobal {
  activeSpringAnimations: Set<SpringAnimation>
}

function getMkMotionGlobal(): MkMotionGlobal {
  if (!window.__MK_MOTION__) {
    window.__MK_MOTION__ = {
      activeSpringAnimations: new Set<SpringAnimation>(),
    }
  }
  return window.__MK_MOTION__
}

export interface SpringValueState {
  current: number
  velocity: number
  target: number
  done: boolean
}

/**
 * 单个数值的弹簧物理模拟器
 * 使用 timestamp-based delta 保证不同帧率下的一致性
 */
export class SpringValue {
  private opts: Required<SpringOptions>
  private state: SpringValueState

  constructor(from: number, to: number, options: SpringOptions = {}) {
    this.opts = { ...DEFAULT_SPRING, ...options }
    this.state = {
      current: from,
      velocity: 0,
      target: to,
      done: false,
    }
  }

  /** 推进一帧物理模拟，dt 单位为秒 */
  tick(dt: number): SpringValueState {
    if (this.state.done) return this.state

    const displacement = this.state.current - this.state.target
    const springForce = -this.opts.stiffness * displacement
    const dampingForce = -this.opts.damping * this.state.velocity
    const acceleration = (springForce + dampingForce) / this.opts.mass

    this.state.velocity += acceleration * dt
    this.state.current += this.state.velocity * dt

    if (
      Math.abs(displacement) < this.opts.precision &&
      Math.abs(this.state.velocity) < this.opts.precision
    ) {
      this.state.current = this.state.target
      this.state.velocity = 0
      this.state.done = true
    }

    return this.state
  }

  setTarget(to: number): void {
    this.state.target = to
    this.state.done = false
  }

  setValue(value: number): void {
    this.state.current = value
    this.state.velocity = 0
  }

  getState(): SpringValueState {
    return { ...this.state }
  }
}

// ---------------------------------------------------------------------------
// 颜色解析与插值
// ---------------------------------------------------------------------------

export function parseColor(
  input: string | [number, number, number] | [number, number, number, number]
): [number, number, number, number] {
  if (Array.isArray(input)) {
    return input.length === 4 ? input : [...input, 1]
  }

  const s = input.trim()

  // hex
  if (s.startsWith('#')) {
    const hex = s.slice(1)
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      return [r, g, b, 1]
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return [r, g, b, 1]
    }
  }

  // rgb / rgba
  const rgbMatch = s.match(/rgba?\(([^)]+)\)/)
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((p) => parseFloat(p.trim()))
    if (parts.length >= 3) {
      return [parts[0], parts[1], parts[2], parts[3] ?? 1]
    }
  }

  // CSS variables fall back to currentColor parsing via a dummy element
  if (s.startsWith('var(')) {
    const el = document.createElement('div')
    el.style.color = s
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    return parseColor(computed)
  }

  // named colors — very basic fallback
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = s
    const computed = ctx.fillStyle
    if (computed && computed !== s) return parseColor(computed)
  }

  return [0, 0, 0, 1]
}

export function formatColor(
  r: number,
  g: number,
  b: number,
  a: number
): string {
  if (a >= 0.999) {
    const ri = Math.round(r)
    const gi = Math.round(g)
    const bi = Math.round(b)
    return `rgb(${ri}, ${gi}, ${bi})`
  }
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`
}

// ---------------------------------------------------------------------------
// 属性定义
// ---------------------------------------------------------------------------

type PropType = 'number' | 'transform' | 'color'

interface PropDef {
  type: PropType
  cssName?: string
  unit?: string
  toCss: (value: number | [number, number, number, number]) => string
}

export function parseTransformValue(transform: string, key: string): number {
  const defaults: Record<string, number> = {
    x: 0,
    y: 0,
    z: 0,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
  }
  if (!transform) return defaults[key] ?? 0

  const patterns: Record<string, RegExp> = {
    x: /translateX\(([-\d.]+)(?:px)?\)/,
    y: /translateY\(([-\d.]+)(?:px)?\)/,
    z: /translateZ\(([-\d.]+)(?:px)?\)/,
    translateX: /translateX\(([-\d.]+)(?:px)?\)/,
    translateY: /translateY\(([-\d.]+)(?:px)?\)/,
    translateZ: /translateZ\(([-\d.]+)(?:px)?\)/,
    scale: /scale\(([-\d.]+)\)/,
    scaleX: /scaleX\(([-\d.]+)\)/,
    scaleY: /scaleY\(([-\d.]+)\)/,
    rotate: /rotate\(([-\d.]+)(?:deg)?\)/,
    rotateX: /rotateX\(([-\d.]+)(?:deg)?\)/,
    rotateY: /rotateY\(([-\d.]+)(?:deg)?\)/,
  }

  // Handle shorthand translate(x, y) / translate3d(x, y, z)
  const translateMatch = transform.match(
    /translate\(\s*([-\d.]+)(?:px)?\s*,\s*([-\d.]+)(?:px)?\s*\)/
  )
  const translate3dMatch = transform.match(
    /translate3d\(\s*([-\d.]+)(?:px)?\s*,\s*([-\d.]+)(?:px)?\s*,\s*([-\d.]+)(?:px)?\s*\)/
  )

  if (translate3dMatch && (key === 'x' || key === 'translateX'))
    return parseFloat(translate3dMatch[1])
  if (translate3dMatch && (key === 'y' || key === 'translateY'))
    return parseFloat(translate3dMatch[2])
  if (translate3dMatch && (key === 'z' || key === 'translateZ'))
    return parseFloat(translate3dMatch[3])

  if (translateMatch && (key === 'x' || key === 'translateX'))
    return parseFloat(translateMatch[1])
  if (translateMatch && (key === 'y' || key === 'translateY'))
    return parseFloat(translateMatch[2])

  const match = transform.match(patterns[key])
  if (match) return parseFloat(match[1])
  return defaults[key] ?? 0
}

const PROP_MAP: Record<string, PropDef> = {
  x: {
    type: 'transform',
    unit: 'px',
    toCss: (v) => `translateX(${v}${typeof v === 'number' ? 'px' : ''})`,
  },
  y: {
    type: 'transform',
    unit: 'px',
    toCss: (v) => `translateY(${v}${typeof v === 'number' ? 'px' : ''})`,
  },
  translateX: {
    type: 'transform',
    unit: 'px',
    toCss: (v) => `translateX(${v}${typeof v === 'number' ? 'px' : ''})`,
  },
  translateY: {
    type: 'transform',
    unit: 'px',
    toCss: (v) => `translateY(${v}${typeof v === 'number' ? 'px' : ''})`,
  },
  translateZ: {
    type: 'transform',
    unit: 'px',
    toCss: (v) => `translateZ(${v}${typeof v === 'number' ? 'px' : ''})`,
  },
  scale: { type: 'transform', toCss: (v) => `scale(${v})` },
  scaleX: { type: 'transform', toCss: (v) => `scaleX(${v})` },
  scaleY: { type: 'transform', toCss: (v) => `scaleY(${v})` },
  rotate: {
    type: 'transform',
    unit: 'deg',
    toCss: (v) => `rotate(${v}${typeof v === 'number' ? 'deg' : ''})`,
  },
  rotateX: {
    type: 'transform',
    unit: 'deg',
    toCss: (v) => `rotateX(${v}${typeof v === 'number' ? 'deg' : ''})`,
  },
  rotateY: {
    type: 'transform',
    unit: 'deg',
    toCss: (v) => `rotateY(${v}${typeof v === 'number' ? 'deg' : ''})`,
  },
  opacity: { type: 'number', cssName: 'opacity', toCss: (v) => `${v}` },
  width: {
    type: 'number',
    cssName: 'width',
    unit: 'px',
    toCss: (v) => `${v}px`,
  },
  height: {
    type: 'number',
    cssName: 'height',
    unit: 'px',
    toCss: (v) => `${v}px`,
  },
  borderRadius: {
    type: 'number',
    cssName: 'border-radius',
    unit: 'px',
    toCss: (v) => `${v}px`,
  },
  backgroundColor: {
    type: 'color',
    cssName: 'background-color',
    toCss: (v) => {
      const [r, g, b, a] = v as [number, number, number, number]
      return formatColor(r, g, b, a)
    },
  },
  color: {
    type: 'color',
    cssName: 'color',
    toCss: (v) => {
      const [r, g, b, a] = v as [number, number, number, number]
      return formatColor(r, g, b, a)
    },
  },
}

export interface SpringProperties {
  x?: number
  y?: number
  translateX?: number
  translateY?: number
  translateZ?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  rotate?: number
  rotateX?: number
  rotateY?: number
  opacity?: number
  width?: number
  height?: number
  borderRadius?: number
  backgroundColor?:
    | string
    | [number, number, number]
    | [number, number, number, number]
  color?: string | [number, number, number] | [number, number, number, number]
}

// ---------------------------------------------------------------------------
// SpringAnimation — 核心弹簧动画控制器
// ---------------------------------------------------------------------------

interface ActiveProp {
  name: string
  def: PropDef
  spring: SpringValue
  isColor: boolean
}

export class SpringAnimation {
  private target: HTMLElement
  private props: Map<string, ActiveProp> = new Map()
  private options: Required<SpringOptions>
  private rafId: number = 0
  private running = false
  private lastTime = 0
  private _onComplete?: () => void
  private _onUpdate?: (props: SpringProperties) => void
  private _promiseResolve?: () => void
  private _colorFrom?: [number, number, number, number]
  private _colorTo?: [number, number, number, number]
  private _colorRangeInv: number = 0
  private _reusableProps: SpringProperties = {}

  constructor(
    target: HTMLElement | string,
    from: SpringProperties,
    to: SpringProperties,
    options: SpringOptions = {}
  ) {
    this.target =
      typeof target === 'string'
        ? document.querySelector<HTMLElement>(target)!
        : target
    if (!this.target)
      throw new Error('SpringAnimation: target element not found')

    this.options = { ...DEFAULT_SPRING, ...options }
    this.initProps(from, to)
  }

  private initProps(from: SpringProperties, to: SpringProperties): void {
    for (const [key, toVal] of Object.entries(to)) {
      const def = PROP_MAP[key]
      if (!def) continue

      const fromVal =
        from[key as keyof SpringProperties] ?? this.getCurrentValue(key, def)
      const isColor = def.type === 'color'

      let fromNum: number
      let toNum: number

      if (isColor) {
        const fromParsed = parseColor(
          fromVal as
            | string
            | [number, number, number]
            | [number, number, number, number]
        )
        const toParsed = parseColor(
          toVal as
            | string
            | [number, number, number]
            | [number, number, number, number]
        )
        // 用 R 通道作为弹簧值，G/B/A 在 onUpdate 中按比例插值
        fromNum = fromParsed[0]
        toNum = toParsed[0]
        this._colorFrom = fromParsed
        this._colorTo = toParsed
        this._colorRangeInv = 1 / (toParsed[0] - fromParsed[0] || 1)
      } else {
        fromNum = Number(fromVal)
        toNum = Number(toVal)
      }

      const spring = new SpringValue(fromNum, toNum, this.options)
      this.props.set(key, { name: key, def, spring, isColor })
    }
  }

  private getCurrentValue(key: string, def: PropDef): number | string {
    if (def.type === 'transform') {
      const transform = this.target.style.transform
      return parseTransformValue(transform, key)
    }
    if (def.type === 'color') {
      const computed = def.cssName
        ? getComputedStyle(this.target).getPropertyValue(def.cssName)
        : ''
      return computed || '#000000'
    }
    const computed = def.cssName
      ? getComputedStyle(this.target).getPropertyValue(def.cssName)
      : '0'
    return parseFloat(computed) || 0
  }

  play(): Promise<void> {
    if (this.running) return this._promise!
    this.running = true
    this.lastTime = performance.now()

    this._promise = new Promise<void>((resolve) => {
      this._promiseResolve = resolve
    })

    getMkMotionGlobal().activeSpringAnimations.add(this)
    this.rafId = requestAnimationFrame((t) => this.tick(t))
    return this._promise
  }

  private _promise?: Promise<void>

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.rafId)
    getMkMotionGlobal().activeSpringAnimations.delete(this)
    this._promiseResolve?.()
  }

  pause(): void {
    this.running = false
    cancelAnimationFrame(this.rafId)
  }

  resume(): Promise<void> {
    if (this.running) return this._promise!
    this.running = true
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame((t) => this.tick(t))
    return this._promise!
  }

  /** seek 到指定进度（0-1），立即应用 */
  seek(progress: number): void {
    this.pause()
    for (const { spring } of this.props.values()) {
      const from = spring.getState().current // 这里简化处理，实际应该存储原始 from
      const to = spring.getState().target
      spring.setValue(from + (to - from) * progress)
    }
    this.applyStyles()
  }

  /** 动态改变目标值，弹簧会自然过渡到新目标 */
  setTo(newTo: SpringProperties): void {
    for (const [key, toVal] of Object.entries(newTo)) {
      const active = this.props.get(key)
      if (active) {
        if (active.isColor) {
          const toParsed = parseColor(
            toVal as
              | string
              | [number, number, number]
              | [number, number, number, number]
          )
          active.spring.setTarget(toParsed[0])
          this._colorTo = toParsed
        } else {
          active.spring.setTarget(Number(toVal))
        }
      }
    }
    if (!this.running) {
      this.play()
    }
  }

  private tick(now: number): void {
    if (!this.running) return

    const dt = Math.min((now - this.lastTime) / 1000, 0.05) // 最大 50ms 防止跳变
    this.lastTime = now

    let allDone = true
    for (const active of this.props.values()) {
      const state = active.spring.tick(dt)
      if (!state.done) allDone = false
    }

    this.applyStyles()

    const currentProps = this.getCurrentProperties()
    this._onUpdate?.(currentProps)

    if (allDone) {
      this.running = false
      getMkMotionGlobal().activeSpringAnimations.delete(this)
      this._onUpdate?.(currentProps)
      this._onComplete?.()
      this._promiseResolve?.()
      return
    }

    this.rafId = requestAnimationFrame((t) => this.tick(t))
  }

  private applyStyles(): void {
    const transformParts: string[] = []
    const cssProps: Record<string, string> = {}

    for (const active of this.props.values()) {
      const state = active.spring.getState()

      if (active.def.type === 'transform') {
        transformParts.push(active.def.toCss(state.current))
      } else if (active.isColor) {
        if (this._colorFrom && this._colorTo) {
          const t = (state.current - this._colorFrom[0]) * this._colorRangeInv
          const clampedT = Math.max(0, Math.min(1, t))
          const r =
            this._colorFrom[0] +
            (this._colorTo[0] - this._colorFrom[0]) * clampedT
          const g =
            this._colorFrom[1] +
            (this._colorTo[1] - this._colorFrom[1]) * clampedT
          const b =
            this._colorFrom[2] +
            (this._colorTo[2] - this._colorFrom[2]) * clampedT
          const a =
            this._colorFrom[3] +
            (this._colorTo[3] - this._colorFrom[3]) * clampedT
          cssProps[active.def.cssName!] = formatColor(r, g, b, a)
        }
      } else {
        cssProps[active.def.cssName!] = active.def.toCss(state.current)
      }
    }

    if (transformParts.length > 0) {
      this.target.style.transform = transformParts.join(' ')
    }

    for (const [prop, val] of Object.entries(cssProps)) {
      this.target.style.setProperty(prop, val)
    }
  }

  private getCurrentProperties(): SpringProperties {
    for (const [propKey, active] of this.props) {
      const state = active.spring.getState()
      ;(this._reusableProps as Record<string, number>)[propKey] = state.current
    }
    return this._reusableProps
  }

  onUpdate(cb: (props: SpringProperties) => void): this {
    this._onUpdate = cb
    return this
  }

  onComplete(cb: () => void): this {
    this._onComplete = cb
    return this
  }

  destroy(): void {
    getMkMotionGlobal().activeSpringAnimations.delete(this)
    this.stop()
    this.props.clear()
  }
}

// ---------------------------------------------------------------------------
// 便捷函数
// ---------------------------------------------------------------------------

export function springTo(
  target: HTMLElement | string,
  to: SpringProperties,
  options?: SpringOptions
): Promise<void> {
  const from: SpringProperties = {}
  // 从当前值开始
  const anim = new SpringAnimation(target, from, to, options)
  return anim.play()
}

export function springFromTo(
  target: HTMLElement | string,
  from: SpringProperties,
  to: SpringProperties,
  options?: SpringOptions
): Promise<void> {
  const anim = new SpringAnimation(target, from, to, options)
  return anim.play()
}

// ---------------------------------------------------------------------------
// 编排
// ---------------------------------------------------------------------------

export interface StaggerOptions extends SpringOptions {
  delay?: number // 每个元素之间的延迟（ms）
  from?: 'first' | 'last' | 'center'
}

export async function springStagger(
  targets: (HTMLElement | string)[],
  to: SpringProperties,
  options: StaggerOptions = {}
): Promise<void> {
  const { delay = 50, from = 'first', ...springOpts } = options
  const elements = targets.map((t) =>
    typeof t === 'string' ? document.querySelector<HTMLElement>(t)! : t
  )

  const order =
    from === 'last'
      ? elements.map((_, i) => elements.length - 1 - i)
      : from === 'center'
        ? elements
            .map((_, i) => i)
            .sort(
              (a, b) =>
                Math.abs(a - elements.length / 2) -
                Math.abs(b - elements.length / 2)
            )
        : elements.map((_, i) => i)

  const promises = elements.map((_, idx) => {
    const actualIndex = order[idx]
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        springTo(elements[actualIndex], to, springOpts).then(resolve)
      }, idx * delay)
    })
  })

  await Promise.all(promises)
}

export interface SpringSequenceStep {
  target: HTMLElement | string
  from?: SpringProperties
  to: SpringProperties
  options?: SpringOptions
}

export async function springSequence(
  steps: SpringSequenceStep[]
): Promise<void> {
  for (const step of steps) {
    await springFromTo(step.target, step.from || {}, step.to, step.options)
  }
}

export async function springParallel(
  steps: SpringSequenceStep[]
): Promise<void> {
  await Promise.all(
    steps.map((step) =>
      springFromTo(step.target, step.from || {}, step.to, step.options)
    )
  )
}
