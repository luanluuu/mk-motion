export interface MagneticOptions {
  strength?: number // 磁力强度 0~1
  radius?: number // 作用半径像素
}

const DEFAULT_MAGNETIC: Required<MagneticOptions> = {
  strength: 0.4,
  radius: 150,
}

/**
 * 磁性按钮：鼠标靠近时被吸引
 */
export function magnetic(
  element: HTMLElement | string,
  options: MagneticOptions = {}
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('magnetic: element not found')

  const opts = { ...DEFAULT_MAGNETIC, ...options }
  el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'

  const onMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distX = e.clientX - centerX
    const distY = e.clientY - centerY
    const distance = Math.sqrt(distX * distX + distY * distY)

    if (distance < opts.radius) {
      const force = 1 - distance / opts.radius
      const moveX = distX * opts.strength * force
      const moveY = distY * opts.strength * force
      el.style.transform = `translate(${moveX}px, ${moveY}px)`
    } else {
      el.style.transform = ''
    }
  }

  const onLeave = () => {
    el.style.transform = ''
  }

  document.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)

  return () => {
    document.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
    el.style.transform = ''
    el.style.transition = ''
  }
}

/**
 * 磁性文字：每个字符独立被吸引
 */
export function magneticText(
  element: HTMLElement | string,
  options: MagneticOptions = {}
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('magneticText: element not found')

  const text = el.textContent ?? ''
  el.innerHTML = ''
  el.style.display = 'inline-block'

  const chars: HTMLElement[] = []
  text.split('').forEach((char) => {
    const span = document.createElement('span')
    span.textContent = char === ' ' ? '\u00A0' : char
    span.style.display = 'inline-block'
    span.style.transition = 'transform 0.3s ease'
    el.appendChild(span)
    chars.push(span)
  })

  const opts = { ...DEFAULT_MAGNETIC, ...options }

  const onMove = (e: MouseEvent) => {
    chars.forEach((span) => {
      const rect = span.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < opts.radius) {
        const force = 1 - dist / opts.radius
        span.style.transform = `translate(${dx * opts.strength * force}px, ${dy * opts.strength * force}px)`
      } else {
        span.style.transform = ''
      }
    })
  }

  const onLeave = () => {
    chars.forEach((span) => (span.style.transform = ''))
  }

  document.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)

  return () => {
    document.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  }
}
