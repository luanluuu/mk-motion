import '../../styles/element-plus.css'
import './tooltip.css'

export interface TooltipOptions {
  content?: string | HTMLElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  offset?: number
}

let tooltipEl: HTMLDivElement | null = null
let arrowEl: HTMLDivElement | null = null
let contentEl: HTMLDivElement | null = null
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let activeTarget: HTMLElement | null = null
const TOOLTIP_ID = 'mk-tooltip'

function getTooltip(): HTMLDivElement {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.className = 'mk-tooltip'
    tooltipEl.id = TOOLTIP_ID
    tooltipEl.setAttribute('role', 'tooltip')
    tooltipEl.style.position = 'absolute'
    tooltipEl.style.zIndex = 'var(--mk-z-tooltip)'

    arrowEl = document.createElement('div')
    arrowEl.className = 'mk-tooltip__arrow'
    tooltipEl.appendChild(arrowEl)

    contentEl = document.createElement('div')
    contentEl.className = 'mk-tooltip__content'
    tooltipEl.appendChild(contentEl)

    document.body.appendChild(tooltipEl)
  }
  return tooltipEl
}

function setTooltipContent(content: string | HTMLElement): void {
  const tip = getTooltip()
  const c = tip.querySelector('.mk-tooltip__content') as HTMLDivElement
  c.innerHTML = ''
  if (typeof content === 'string') {
    c.textContent = content
  } else {
    c.appendChild(content)
  }
}

function positionTooltip(target: HTMLElement, placement: string, offset: number): void {
  const tip = getTooltip()
  const arrow = tip.querySelector('.mk-tooltip__arrow') as HTMLDivElement
  const rect = target.getBoundingClientRect()
  const tipRect = tip.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY

  let top = 0
  let left = 0
  let arrowClass = ''

  switch (placement) {
    case 'top':
      top = rect.top + scrollY - tipRect.height - offset
      left = rect.left + scrollX + rect.width / 2 - tipRect.width / 2
      arrowClass = 'is-bottom'
      break
    case 'bottom':
      top = rect.bottom + scrollY + offset
      left = rect.left + scrollX + rect.width / 2 - tipRect.width / 2
      arrowClass = 'is-top'
      break
    case 'left':
      top = rect.top + scrollY + rect.height / 2 - tipRect.height / 2
      left = rect.left + scrollX - tipRect.width - offset
      arrowClass = 'is-right'
      break
    case 'right':
      top = rect.top + scrollY + rect.height / 2 - tipRect.height / 2
      left = rect.right + scrollX + offset
      arrowClass = 'is-left'
      break
    default:
      top = rect.top + scrollY - tipRect.height - offset
      left = rect.left + scrollX + rect.width / 2 - tipRect.width / 2
      arrowClass = 'is-bottom'
  }

  // Viewport boundary adjustments
  const padding = 8
  if (left < padding) left = padding
  if (left + tipRect.width > window.innerWidth - padding) {
    left = window.innerWidth - tipRect.width - padding
  }
  if (top < padding) top = padding

  tip.style.top = `${top}px`
  tip.style.left = `${left}px`

  arrow.className = `mk-tooltip__arrow ${arrowClass}`
}

function showTooltip(target: HTMLElement, options: Required<TooltipOptions>): void {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  activeTarget = target
  target.setAttribute('aria-describedby', TOOLTIP_ID)
  setTooltipContent(options.content)

  const tip = getTooltip()
  tip.classList.remove('is-visible')

  // Force layout to measure before positioning
  tip.style.visibility = 'hidden'
  tip.style.display = 'block'

  requestAnimationFrame(() => {
    if (activeTarget !== target) return
    positionTooltip(target, options.placement, options.offset)
    tip.style.visibility = 'visible'
    tip.classList.add('is-visible')
  })
}

function hideTooltip(): void {
  if (!tooltipEl) return
  tooltipEl.classList.remove('is-visible')
  hideTimer = setTimeout(() => {
    if (!tooltipEl?.classList.contains('is-visible')) {
      tooltipEl!.style.display = 'none'
    }
  }, 200)
  if (activeTarget) {
    activeTarget.removeAttribute('aria-describedby')
  }
  activeTarget = null
}

export function createTooltip(
  target: HTMLElement,
  options: TooltipOptions = {}
): () => void {
  const opts: Required<TooltipOptions> = {
    content: '',
    placement: 'top',
    delay: 150,
    offset: 8,
    ...options,
  }

  const onEnter = () => {
    if (showTimer) clearTimeout(showTimer)
    showTimer = setTimeout(() => {
      showTooltip(target, opts)
    }, opts.delay)
  }

  const onLeave = () => {
    if (showTimer) {
      clearTimeout(showTimer)
      showTimer = null
    }
    hideTooltip()
  }

  target.addEventListener('mouseenter', onEnter)
  target.addEventListener('mouseleave', onLeave)
  target.addEventListener('focus', onEnter)
  target.addEventListener('blur', onLeave)

  return () => {
    target.removeEventListener('mouseenter', onEnter)
    target.removeEventListener('mouseleave', onLeave)
    target.removeEventListener('focus', onEnter)
    target.removeEventListener('blur', onLeave)
    if (activeTarget === target) {
      hideTooltip()
    }
  }
}
