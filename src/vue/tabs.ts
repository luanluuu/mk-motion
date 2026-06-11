import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createTabs } from '../components/tabs/tabs.js'
import type { TabItem, TabsOptions } from '../components/tabs/tabs.js'

export const MkTabs = defineComponent({
  name: 'MkTabs',
  props: {
    type: { type: String as () => TabsOptions['type'], default: 'line' },
    items: { type: Array as () => TabItem[], default: () => [] },
    modelValue: { type: Number, default: 0 },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const container = ref<HTMLElement>()
    let instance: ReturnType<typeof createTabs> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createTabs(container.value, {
        type: props.type,
        items: props.items,
        activeIndex: props.modelValue,
        onChange: (index: number) => {
          emit('update:modelValue', index)
          emit('change', index)
        },
      })
    }

    onMounted(() => nextTick(create))
    watch(() => [props.type, props.items, props.modelValue], () => nextTick(create), { deep: true })
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
