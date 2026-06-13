export interface GlitchOptions {
  duration?: number // 单次故障时长
  intensity?: number // 1~10 故障强度
  color1?: string // 故障色 1
  color2?: string // 故障色 2
}

const DEFAULT_GLITCH: Required<GlitchOptions> = {
  duration: 300,
  intensity: 5,
  color1: '#ff0040',
  color2: '#00ffff',
}

/**
 * 给元素添加赛博朋克故障风效果
 */
export function glitch(
  element: HTMLElement | string,
  options: GlitchOptions = {}
): Promise<void> {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('glitch: element not found')

  const opts = { ...DEFAULT_GLITCH, ...options }
  const intensity = Math.min(Math.max(opts.intensity, 1), 10)

  const original = el.style.cssText
  const steps = Math.floor(intensity * 2)

  return new Promise((resolve) => {
    let current = 0
    const interval = opts.duration / steps

    const run = () => {
      if (current >= steps) {
        el.style.cssText = original
        el.style.textShadow = ''
        resolve()
        return
      }

      const x = (Math.random() - 0.5) * intensity * 4
      const clip = `inset(${Math.random() * 80}% 0 ${Math.random() * 80}% 0)`
      const shadow1 = `${opts.color1} ${x}px 0`
      const shadow2 = `${opts.color2} ${-x}px 0`

      el.style.transform = `translateX(${x}px)`
      el.style.clipPath = clip
      el.style.textShadow = `${shadow1}, ${shadow2}`

      current++
      setTimeout(run, interval)
    }

    run()
  })
}

/**
 * 持续故障效果（可停止）
 */
export function glitchLoop(
  element: HTMLElement | string,
  options: GlitchOptions = {}
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('glitchLoop: element not found')

  const opts = { ...DEFAULT_GLITCH, ...options }
  const original = el.style.cssText
  let running = true

  const loop = async () => {
    if (!running) return
    await glitch(el, { ...opts, duration: 100 + Math.random() * 200 })
    if (running) {
      setTimeout(loop, 200 + Math.random() * 800)
    }
  }

  loop()

  return () => {
    running = false
    el.style.cssText = original
    el.style.textShadow = ''
    el.style.clipPath = ''
    el.style.transform = ''
  }
}
