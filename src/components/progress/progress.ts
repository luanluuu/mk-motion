import '../../styles/element-plus.css'
import './progress.css'

export interface ProgressOptions {
  type?: 'line' | 'circle' | 'dashboard'
  percent?: number
  strokeWidth?: number
  color?: string
  status?: 'success' | 'exception' | 'active'
  showInfo?: boolean
}

export class MkProgress {
  el: HTMLDivElement
  private options: ProgressOptions
  private barEl: HTMLDivElement | null = null
  private textEl: HTMLSpanElement | null = null
  private circleSvg: SVGSVGElement | null = null
  private circleTrack: SVGCircleElement | null = null
  private circlePath: SVGCircleElement | null = null

  constructor(container: HTMLElement | string, options: ProgressOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      type: 'line',
      percent: 0,
      showInfo: true,
      ...options,
    }

    this.el = document.createElement('div')
    this.el.className = this.buildClass()

    if (this.options.type === 'line') {
      this.renderLine()
    } else {
      this.renderCircleOrDashboard()
    }

    parent.appendChild(this.el)

    requestAnimationFrame(() => {
      this.setPercent(this.options.percent!)
    })
  }

  private buildClass(): string {
    const classes = ['mk-progress', `mk-progress--${this.options.type}`]
    if (this.options.status) classes.push(`is-${this.options.status}`)
    if (!this.options.showInfo) classes.push('is-hide-info')
    return classes.join(' ')
  }

  private renderLine(): void {
    const track = document.createElement('div')
    track.className = 'mk-progress__track'
    if (this.options.strokeWidth) {
      track.style.height = `${this.options.strokeWidth}px`
    }

    this.barEl = document.createElement('div')
    this.barEl.className = 'mk-progress__bar'
    track.appendChild(this.barEl)
    this.el.appendChild(track)

    if (this.options.showInfo) {
      this.textEl = document.createElement('span')
      this.textEl.className = 'mk-progress__text'
      this.el.appendChild(this.textEl)
    }
  }

  private renderCircleOrDashboard(): void {
    const size = 120
    const strokeWidth = this.options.strokeWidth || 6
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const isDashboard = this.options.type === 'dashboard'
    const dashArray = isDashboard ? circumference * 0.75 : circumference

    this.circleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.circleSvg.setAttribute('width', `${size}`)
    this.circleSvg.setAttribute('height', `${size}`)
    this.circleSvg.setAttribute('viewBox', `0 0 ${size} ${size}`)
    this.circleSvg.classList.add('mk-progress__svg')

    this.circleTrack = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    this.circleTrack.setAttribute('cx', `${size / 2}`)
    this.circleTrack.setAttribute('cy', `${size / 2}`)
    this.circleTrack.setAttribute('r', `${radius}`)
    this.circleTrack.setAttribute('fill', 'none')
    this.circleTrack.setAttribute('stroke-width', `${strokeWidth}`)
    this.circleTrack.classList.add('mk-progress__track-circle')

    this.circlePath = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    this.circlePath.setAttribute('cx', `${size / 2}`)
    this.circlePath.setAttribute('cy', `${size / 2}`)
    this.circlePath.setAttribute('r', `${radius}`)
    this.circlePath.setAttribute('fill', 'none')
    this.circlePath.setAttribute('stroke-width', `${strokeWidth}`)
    this.circlePath.setAttribute('stroke-linecap', 'round')
    this.circlePath.style.strokeDasharray = `${dashArray} ${circumference}`
    this.circlePath.style.strokeDashoffset = `${dashArray}`
    this.circlePath.style.transformOrigin = '50% 50%'

    if (isDashboard) {
      this.circleTrack.style.transform = 'rotate(135deg)'
      this.circleTrack.style.transformOrigin = '50% 50%'
      this.circlePath.style.transform = 'rotate(135deg)'
    } else {
      this.circleTrack.style.transform = 'rotate(-90deg)'
      this.circleTrack.style.transformOrigin = '50% 50%'
      this.circlePath.style.transform = 'rotate(-90deg)'
    }

    this.circlePath.classList.add('mk-progress__path-circle')

    this.circleSvg.appendChild(this.circleTrack)
    this.circleSvg.appendChild(this.circlePath)
    this.el.appendChild(this.circleSvg)

    if (this.options.showInfo) {
      this.textEl = document.createElement('span')
      this.textEl.className = 'mk-progress__text'
      this.el.appendChild(this.textEl)
    }
  }

  setPercent(percent: number): void {
    const clamped = Math.max(0, Math.min(100, percent))
    this.options.percent = clamped

    if (this.options.type === 'line' && this.barEl) {
      this.barEl.style.width = `${clamped}%`
      if (this.options.color) {
        this.barEl.style.background = this.options.color
      }
    } else if (this.circlePath && this.circleSvg) {
      const size = 120
      const strokeWidth = this.options.strokeWidth || 6
      const radius = (size - strokeWidth) / 2
      const circumference = 2 * Math.PI * radius
      const isDashboard = this.options.type === 'dashboard'
      const totalLength = isDashboard ? circumference * 0.75 : circumference
      const offset = totalLength - (clamped / 100) * totalLength
      this.circlePath.style.strokeDashoffset = `${offset}`
      if (this.options.color) {
        this.circlePath.style.stroke = this.options.color
      }
    }

    if (this.textEl) {
      this.textEl.textContent = `${Math.round(clamped)}%`
    }
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createProgress(
  container: HTMLElement | string,
  options?: ProgressOptions
): MkProgress {
  return new MkProgress(container, options)
}
