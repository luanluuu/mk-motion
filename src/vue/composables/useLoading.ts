import {
  showLoading,
  showFullscreenLoading,
} from '../../components/loading/loading.js'
import type { LoadingOptions } from '../../components/loading/loading.js'

export function useMkLoading() {
  return {
    showLoading: (options?: LoadingOptions) => showLoading(options),
    showFullscreenLoading: (text?: string) => showFullscreenLoading(text),
  }
}
