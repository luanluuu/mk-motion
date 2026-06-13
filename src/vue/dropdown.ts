import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import { createDropdown } from '../components/dropdown/dropdown.js'
import type {
  DropdownOptions,
  DropdownItem,
} from '../components/dropdown/dropdown.js'

export const MkDropdown = defineComponent({
  name: 'MkDropdown',
  props: {
    items: { type: Array as () => DropdownItem[], default: () => [] },
    trigger: {
      type: String as () => DropdownOptions['trigger'],
      default: 'click',
    },
    placement: {
      type: String as () => DropdownOptions['placement'],
      default: 'bottom',
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createDropdown> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createDropdown(container.value, {
        items: props.items,
        trigger: props.trigger,
        placement: props.placement,
        onSelect: (value) => emit('select', value),
      })
    }

    onMounted(() => nextTick(create))
    watch(
      () => [props.items, props.trigger, props.placement],
      () => nextTick(create),
      { deep: true }
    )
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container, style: 'display:inline-block' })
  },
})
