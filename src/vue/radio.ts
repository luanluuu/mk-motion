import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { MkRadio as MkRadioClass } from '../components/form/radio.js'
import type { RadioOptions } from '../components/form/radio.js'

export const MkRadio = defineComponent({
  name: 'MkRadio',
  props: {
    label: { type: String, default: '' },
    value: { type: [String, Number], required: true },
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: InstanceType<typeof MkRadioClass> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = new MkRadioClass(container.value, {
        label: props.label,
        value: props.value,
        checked: props.checked,
        disabled: props.disabled,
        onChange: (v) => emit('change', v),
      })
    }

    onMounted(() => nextTick(create))
    watch(() => props.checked, (v) => instance?.setChecked(v))
    watch(() => [props.label, props.value, props.disabled], () => nextTick(create), { deep: true })
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
