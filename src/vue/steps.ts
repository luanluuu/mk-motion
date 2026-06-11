import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createSteps } from '../components/steps/steps.js'
import type { StepsOptions } from '../components/steps/steps.js'

export const MkSteps = defineComponent({
  name: 'MkSteps',
  props: {
    items: { type: Array as () => StepsOptions['items'], required: true },
    direction: { type: String as () => StepsOptions['direction'], default: 'horizontal' },
    current: { type: Number, default: 0 },
    size: { type: String as () => StepsOptions['size'], default: 'default' },
  },
  setup(props) {
    const container = ref<HTMLElement>()
    let instance: ReturnType<typeof createSteps> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createSteps(container.value, {
        items: props.items,
        direction: props.direction,
        current: props.current,
        size: props.size,
      })
    }

    onMounted(() => nextTick(create))
    watch(() => [props.items, props.direction, props.current, props.size], () => nextTick(create), { deep: true })
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
