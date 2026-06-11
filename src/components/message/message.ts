import './message.css'

export interface MessageOptions {
  type?: 'success' | 'warning' | 'error' | 'info'
  duration?: number
  closable?: boolean
}

const ICONS: Record<string, string> = {
  success: '✓',
  warning: '!',
  error: '✕',
  info: 'i',
}

const COLORS: Record<string, string> = {
  success: '#67c23a',
  warning: '#e6a23c',
  error: '#f56c6c',
  info: '#409eff',
}

let container: HTMLDivElement | null = null

function getContainer(): HTMLDivElement {
  if (!container) {
    container = document.createElement('div')
    container.className = 'mk-message-container'
    document.body.appendChild(container)
  }
  return container
}

export function message(
  msg: string,
  options: MessageOptions = {}
): () => void {
  const opts = { type: 'info', duration: 3000, closable: true, ...options }
  const el = document.createElement('div')
  el.className = `mk-message mk-message--${opts.type}`

  const iconWrap = document.createElement('span')
  iconWrap.className = 'mk-message__icon'
  iconWrap.style.color = COLORS[opts.type!]
  iconWrap.textContent = ICONS[opts.type!]
  el.appendChild(iconWrap)

  const content = document.createElement('span')
  content.className = 'mk-message__content'
  content.textContent = msg
  el.appendChild(content)

  if (opts.closable) {
    const close = document.createElement('span')
    close.className = 'mk-message__close'
    close.innerHTML = '✕'
    close.addEventListener('click', () => removeMessage(el))
    el.appendChild(close)
  }

  getContainer().appendChild(el)

  requestAnimationFrame(() => el.classList.add('is-show'))

  const timer = setTimeout(() => removeMessage(el), opts.duration)

  return () => {
    clearTimeout(timer)
    removeMessage(el)
  }
}

function removeMessage(el: HTMLDivElement): void {
  el.classList.remove('is-show')
  el.style.opacity = '0'
  el.style.transform = 'translateY(-20px) scale(0.95)'
  setTimeout(() => {
    el.remove()
    if (container && container.children.length === 0) {
      container.remove()
      container = null
    }
  }, 300)
}

export function messageSuccess(msg: string, options?: Omit<MessageOptions, 'type'>): () => void {
  return message(msg, { ...options, type: 'success' })
}

export function messageError(msg: string, options?: Omit<MessageOptions, 'type'>): () => void {
  return message(msg, { ...options, type: 'error' })
}

export function messageWarning(msg: string, options?: Omit<MessageOptions, 'type'>): () => void {
  return message(msg, { ...options, type: 'warning' })
}