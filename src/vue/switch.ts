import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createSwitch } from '../components/switch/switch.js'
import type { SwitchOptions } from '../components/switch/switch.js'

export const MkSwitch = defineComponent({
  name: 'MkSwitch',
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    activeText: { type: String, default: '' },
    inactiveText: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createSwitch> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createSwitch(container.value, {
        value: props.modelValue,
        disabled: props.disabled,
        activeText: props.activeText,
        inactiveText: props.inactiveText,
        onChange: (v) => {
          emit('update:modelValue', v)
          emit('change', v)
        },
      })
    }

    onMounted(() => nextTick(create))
    watch(() => [props.modelValue, props.disabled, props.activeText, props.inactiveText], () => nextTick(create), { deep: true })
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container, style: 'display:inline-block' })
  },
})
