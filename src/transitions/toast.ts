export interface ToastOptions {
  duration?: number // 显示时长
  type?: 'info' | 'success' | 'warning' | 'error'
  position?:
    | 'top'
    | 'top-right'
    | 'top-left'
    | 'bottom'
    | 'bottom-right'
    | 'bottom-left'
}

const DEFAULT_TOAST: Required<ToastOptions> = {
  duration: 3000,
  type: 'info',
  position: 'top',
}

const TYPE_COLORS: Record<string, { bg: string; icon: string }> = {
  info: { bg: '#38bdf8', icon: 'ℹ️' },
  success: { bg: '#34d399', icon: '✅' },
  warning: { bg: '#fbbf24', icon: '⚠️' },
  error: { bg: '#f87171', icon: '❌' },
}

const POSITION_STYLES: Record<string, string> = {
  top: 'top:20px;left:50%;transform:translateX(-50%)',
  'top-right': 'top:20px;right:20px',
  'top-left': 'top:20px;left:20px',
  bottom: 'bottom:20px;left:50%;transform:translateX(-50%)',
  'bottom-right': 'bottom:20px;right:20px',
  'bottom-left': 'bottom:20px;left:20px',
}

/**
 * 显示一条 Toast 消息（类似 Element Plus Message）
 */
export function toast(message: string, options: ToastOptions = {}): () => void {
  const opts = { ...DEFAULT_TOAST, ...options }
  const color = TYPE_COLORS[opts.type]
  const pos = POSITION_STYLES[opts.position]

  const el = document.createElement('div')
  el.style.cssText = `
    position: fixed;
    ${pos};
    background: ${color.bg};
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s ease;
    pointer-events: none;
  `
  el.innerHTML = `<span>${color.icon}</span><span>${message}</span>`
  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = opts.position.startsWith('bottom')
      ? 'translateY(0)'
      : 'translateY(0)'
  })

  const timer = setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = opts.position.startsWith('bottom')
      ? 'translateY(20px)'
      : 'translateY(-20px)'
    setTimeout(() => el.remove(), 300)
  }, opts.duration)

  return () => {
    clearTimeout(timer)
    el.remove()
  }
}

/**
 * 显示成功消息
 */
export function toastSuccess(
  message: string,
  options?: Omit<ToastOptions, 'type'>
): () => void {
  return toast(message, { ...options, type: 'success' })
}

/**
 * 显示错误消息
 */
export function toastError(
  message: string,
  options?: Omit<ToastOptions, 'type'>
): () => void {
  return toast(message, { ...options, type: 'error' })
}

/**
 * 显示警告消息
 */
export function toastWarning(
  message: string,
  options?: Omit<ToastOptions, 'type'>
): () => void {
  return toast(message, { ...options, type: 'warning' })
}

/**
 * 显示通知（类似 Element Plus Notification，带标题）
 */
export function notify(
  title: string,
  message: string,
  options: ToastOptions = {}
): () => void {
  const opts = { ...DEFAULT_TOAST, ...options }
  const color = TYPE_COLORS[opts.type]
  const pos = POSITION_STYLES[opts.position]

  const el = document.createElement('div')
  el.style.cssText = `
    position: fixed;
    ${pos};
    background: #1e293b;
    border-left: 4px solid ${color.bg};
    color: #e2e8f0;
    padding: 16px 20px;
    border-radius: 8px;
    font-size: 0.9rem;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    min-width: 280px;
    opacity: 0;
    transform: translateX(30px);
    transition: all 0.3s ease;
  `
  el.innerHTML = `
    <div style="font-weight:600;margin-bottom:4px;color:${color.bg};">${color.icon} ${title}</div>
    <div style="color:#94a3b8;font-size:0.85rem;">${message}</div>
  `
  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateX(0)'
  })

  const timer = setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateX(30px)'
    setTimeout(() => el.remove(), 300)
  }, opts.duration)

  return () => {
    clearTimeout(timer)
    el.remove()
  }
}
