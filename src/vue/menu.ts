import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import { createMenu } from '../components/menu/menu.js'
import type { MenuItem, MenuOptions } from '../components/menu/menu.js'

export const MkMenu = defineComponent({
  name: 'MkMenu',
  props: {
    mode: { type: String as () => MenuOptions['mode'], default: 'vertical' },
    items: { type: Array as () => MenuItem[], default: () => [] },
    defaultActive: { type: String, default: '' },
    defaultOpeneds: { type: Array as () => string[], default: () => [] },
    collapse: { type: Boolean, default: false },
  },
  emits: ['select', 'open', 'close'],
  setup(props, { emit }) {
    const container = ref<HTMLElement>()
    let instance: ReturnType<typeof createMenu> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createMenu(container.value, {
        mode: props.mode,
        items: props.items,
        defaultActive: props.defaultActive,
        defaultOpeneds: props.defaultOpeneds,
        collapse: props.collapse,
        onSelect: (index: string) => emit('select', index),
        onOpen: (index: string) => emit('open', index),
        onClose: (index: string) => emit('close', index),
      })
    }

    onMounted(() => nextTick(create))
    watch(
      () => [
        props.mode,
        props.items,
        props.defaultActive,
        props.defaultOpeneds,
        props.collapse,
      ],
      () => nextTick(create),
      { deep: true }
    )
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
