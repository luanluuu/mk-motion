export interface ParticleOptions {
  count?: number // 粒子数量
  color?: string | string[] // 颜色
  speed?: number // 扩散速度
  size?: number // 粒子大小
  gravity?: number // 重力
  fadeOut?: boolean // 是否淡出
  duration?: number // 动画总时长
}

const DEFAULT_PARTICLE: Required<Omit<ParticleOptions, 'color'>> = {
  count: 30,
  speed: 6,
  size: 6,
  gravity: 0.3,
  fadeOut: true,
  duration: 1000,
}

interface Particle {
  el: HTMLElement
  vx: number
  vy: number
  x: number
  y: number
  life: number
  maxLife: number
}

/**
 * 在元素位置触发粒子爆炸效果
 */
export function particleBurst(
  element: HTMLElement | string,
  options: ParticleOptions = {}
): Promise<void> {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('particleBurst: element not found')

  const opts = { ...DEFAULT_PARTICLE, ...options }
  const colors = Array.isArray(opts.color)
    ? opts.color
    : [opts.color ?? '#38bdf8']

  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const particles: Particle[] = []

  for (let i = 0; i < opts.count; i++) {
    const angle = (Math.PI * 2 * i) / opts.count + Math.random() * 0.5
    const velocity = opts.speed * (0.5 + Math.random() * 0.8)

    const pEl = document.createElement('div')
    pEl.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      width: ${opts.size}px;
      height: ${opts.size}px;
      border-radius: 50%;
      background: ${colors[i % colors.length]};
      pointer-events: none;
      z-index: 9999;
    `
    document.body.appendChild(pEl)

    particles.push({
      el: pEl,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      x: centerX,
      y: centerY,
      life: 0,
      maxLife: opts.duration!,
    })
  }

  return new Promise((resolve) => {
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      let alive = 0

      particles.forEach((p) => {
        p.life = elapsed
        p.vy += opts.gravity!
        p.x += p.vx
        p.y += p.vy

        const progress = p.life / p.maxLife
        const opacity = opts.fadeOut ? 1 - progress : 1

        if (progress < 1) {
          alive++
          p.el.style.transform = `translate(${p.x - centerX}px, ${p.y - centerY}px)`
          p.el.style.opacity = String(Math.max(0, opacity))
        }
      })

      if (alive > 0) {
        requestAnimationFrame(tick)
      } else {
        particles.forEach((p) => p.el.remove())
        resolve()
      }
    }

    requestAnimationFrame(tick)
  })
}

/**
 * 在点击位置触发粒子（不绑定元素）
 */
export function particleAt(
  x: number,
  y: number,
  options: ParticleOptions = {}
): Promise<void> {
  const dummy = document.createElement('div')
  dummy.style.position = 'fixed'
  dummy.style.left = x + 'px'
  dummy.style.top = y + 'px'
  document.body.appendChild(dummy)

  return particleBurst(dummy, options).finally(() => dummy.remove())
}
