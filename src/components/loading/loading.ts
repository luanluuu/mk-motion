import './loading.css'

export interface LoadingOptions {
  text?: string
  fullscreen?: boolean
  target?: HTMLElement | string
}

export function showLoading(options: LoadingOptions = {}): () => void {
  const mask = document.createElement('div')
  mask.className = 'mk-loading-mask'

  if (options.fullscreen) {
    mask.classList.add('is-fullscreen')
    document.body.appendChild(mask)
  } else {
    const target =
      typeof options.target === 'string'
        ? document.querySelector<HTMLElement>(options.target)!
        : options.target || document.body

    if (target && target !== document.body) {
      target.style.position = 'relative'
    }
    ;(target || document.body).appendChild(mask)
  }

  const spinner = document.createElement('div')
  spinner.className = 'mk-loading__spinner'
  mask.appendChild(spinner)

  if (options.text) {
    const text = document.createElement('div')
    text.className = 'mk-loading__text'
    text.textContent = options.text
    mask.appendChild(text)
  }

  return () => {
    mask.remove()
  }
}

export function showFullscreenLoading(text?: string): () => void {
  return showLoading({ fullscreen: true, text })
}