import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import { createButton } from '../components/button/button.js'
import type { ButtonOptions } from '../components/button/button.js'

export const MkButton = defineComponent({
  name: 'MkButton',
  props: {
    type: { type: String as () => ButtonOptions['type'], default: 'default' },
    size: { type: String as () => ButtonOptions['size'], default: 'default' },
    plain: { type: Boolean, default: false },
    round: { type: Boolean, default: false },
    circle: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    icon: { type: String, default: '' },
    motion: {
      type: Object as () => ButtonOptions['motion'],
      default: undefined,
    },
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createButton> | null = null

    const getText = () => {
      const slotContent = slots.default?.()[0]?.children
      return (typeof slotContent === 'string' ? slotContent : '') || ''
    }

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createButton(container.value, {
        type: props.type,
        size: props.size,
        plain: props.plain,
        round: props.round,
        circle: props.circle,
        disabled: props.disabled,
        loading: props.loading,
        text: getText(),
        icon: props.icon || undefined,
        motion: props.motion,
        onClick: (e) => emit('click', e),
      })
    }

    onMounted(() => nextTick(create))
    watch(
      () => [
        props.type,
        props.size,
        props.plain,
        props.round,
        props.circle,
        props.icon,
        props.motion,
      ],
      () => nextTick(create),
      { deep: true }
    )
    watch(
      () => props.loading,
      (v) => instance?.setLoading(v)
    )
    watch(
      () => props.disabled,
      (v) => instance?.setDisabled(v)
    )
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container, style: 'display:inline-block' })
  },
})
