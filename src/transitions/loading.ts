export interface LoadingOptions {
  size?: number
  color?: string
  thickness?: number
}

const DEFAULT_LOADING: Required<LoadingOptions> = {
  size: 40,
  color: '#38bdf8',
  thickness: 3,
}

/**
 * 在元素上显示 Element Plus 风格的加载旋转器
 */
export function showLoading(
  element: HTMLElement | string,
  options: LoadingOptions = {}
): () => void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)!
      : element

  if (!el) throw new Error('showLoading: element not found')

  const opts = { ...DEFAULT_LOADING, ...options }

  el.style.position = 'relative'

  const mask = document.createElement('div')
  mask.className = 'mk-loading-mask'
  mask.style.cssText = `
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    border-radius: inherit;
  `

  const spinner = document.createElement('div')
  spinner.className = 'mk-transition mk-spin'
  spinner.style.cssText = `
    width: ${opts.size}px;
    height: ${opts.size}px;
    border: ${opts.thickness}px solid rgba(255,255,255,0.1);
    border-top-color: ${opts.color};
    border-radius: 50%;
  `

  mask.appendChild(spinner)
  el.appendChild(mask)

  return () => {
    mask.remove()
  }
}

/**
 * 创建全屏加载
 */
export function fullscreenLoading(options: LoadingOptions = {}): () => void {
  const opts = { ...DEFAULT_LOADING, ...options }

  const mask = document.createElement('div')
  mask.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `

  const spinner = document.createElement('div')
  spinner.className = 'mk-transition mk-spin'
  spinner.style.cssText = `
    width: ${opts.size}px;
    height: ${opts.size}px;
    border: ${opts.thickness}px solid rgba(255,255,255,0.15);
    border-top-color: ${opts.color};
    border-radius: 50%;
  `

  mask.appendChild(spinner)
  document.body.appendChild(mask)

  return () => {
    mask.remove()
  }
}