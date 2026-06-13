import {
  showLoading,
  showFullscreenLoading,
} from '../../components/loading/loading.js'
import type { LoadingOptions } from '../../components/loading/loading.js'

export function useMkLoading() {
  let cleanup: (() => void) | null = null

  const start = (options: LoadingOptions = {}) => {
    cleanup?.()
    cleanup = showLoading(options)
  }

  const startFullscreen = (text?: string) => {
    cleanup?.()
    cleanup = showFullscreenLoading(text)
  }

  const stop = () => {
    cleanup?.()
    cleanup = null
  }

  return { start, startFullscreen, stop }
}
