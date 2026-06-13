import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { Animator } from '../../core/animator.js'
import type { AnimationName, AnimationOptions } from '../../core/utils.js'
import type { MotionOptions } from '../../motion/component-motion.js'

export function useMkMotion(
  elRef: Ref<HTMLElement | undefined>,
  _options?: MotionOptions
) {
  let animator: Animator | null = null
  onMounted(() => {
    if (!elRef.value) return
    animator = new Animator(elRef.value)
  })
  onUnmounted(() => {
    animator?.reset()
  })
  return {
    animate: (name: AnimationName, opts?: AnimationOptions) =>
      animator?.animate(name, opts),
    reset: () => animator?.reset(),
  }
}
