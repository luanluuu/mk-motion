export interface LazyImageOptions {
  threshold?: number
  rootMargin?: string
  blur?: boolean // 加载前是否模糊
  placeholder?: string // 占位背景色
}

const DEFAULT_LAZY: Required<LazyImageOptions> = {
  threshold: 0.1,
  rootMargin: '50px',
  blur: true,
  placeholder: '#1e293b',
}

/**
 * 图片懒加载：进入视口时加载，并带渐入动画
 */
export function lazyImage(
  imgElement: HTMLImageElement | string,
  options: LazyImageOptions = {}
): () => void {
  const img =
    typeof imgElement === 'string'
      ? document.querySelector<HTMLImageElement>(imgElement)!
      : imgElement

  if (!img) throw new Error('lazyImage: image not found')

  const opts = { ...DEFAULT_LAZY, ...options }
  const realSrc = img.dataset.src

  if (!realSrc) {
    console.warn('lazyImage: img 缺少 data-src 属性')
    return () => {}
  }

  img.style.background = opts.placeholder
  img.style.transition = 'opacity 0.6s ease, filter 0.6s ease'

  if (opts.blur) {
    img.style.filter = 'blur(8px)'
    img.style.opacity = '0.5'
  } else {
    img.style.opacity = '0'
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement
          const src = image.dataset.src!

          const temp = new Image()
          temp.onload = () => {
            image.src = src
            image.style.opacity = '1'
            image.style.filter = 'blur(0px)'
            image.style.background = ''
          }
          temp.onerror = () => {
            image.style.opacity = '1'
            image.style.filter = 'blur(0px)'
          }
          temp.src = src

          observer.unobserve(image)
        }
      })
    },
    { threshold: opts.threshold, rootMargin: opts.rootMargin }
  )

  observer.observe(img)

  return () => observer.disconnect()
}

/**
 * 批量处理页面内所有懒加载图片
 */
export function lazyImages(selector: string = 'img[data-src]'): () => void {
  const images = document.querySelectorAll<HTMLImageElement>(selector)
  const cleaners = Array.from(images).map((img) => lazyImage(img))

  return () => cleaners.forEach((fn) => fn())
}
