import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createDatePicker } from '../components/datepicker/datepicker.js'
import type { DatePickerOptions } from '../components/datepicker/datepicker.js'

export const MkDatePicker = defineComponent({
  name: 'MkDatePicker',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    format: { type: String, default: 'YYYY-MM-DD' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createDatePicker> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createDatePicker(container.value, {
        value: props.modelValue,
        placeholder: props.placeholder,
        format: props.format,
        disabled: props.disabled,
        onChange: (v) => {
          emit('update:modelValue', v)
          emit('change', v)
        },
      })
    }

    onMounted(() => nextTick(create))

    watch(() => props.modelValue, (v) => {
      if (instance && instance.value !== v) {
        instance.value = v
      }
    })

    watch(() => props.disabled, (v) => {
      if (instance) instance.setDisabled(v)
    })

    watch(() => [props.placeholder, props.format], () => nextTick(create))

    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
