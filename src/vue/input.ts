import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import { createInput } from '../components/input/input.js'
import type { InputOptions, InputSize } from '../components/input/input.js'

export const MkInput = defineComponent({
  name: 'MkInput',
  props: {
    modelValue: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    showPassword: { type: Boolean, default: false },
    size: { type: [String, Object] as () => InputSize, default: 'default' },
    maxlength: { type: Number, default: undefined },
    rows: { type: Number, default: undefined },
    motion: {
      type: Object as () => InputOptions['motion'],
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'enter', 'focus', 'blur'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createInput> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createInput(container.value, {
        type: props.type as InputOptions['type'],
        placeholder: props.placeholder,
        value: props.modelValue,
        disabled: props.disabled,
        clearable: props.clearable,
        showPassword: props.showPassword,
        size: props.size,
        maxlength: props.maxlength,
        rows: props.rows,
        motion: props.motion,
        onInput: (v) => emit('update:modelValue', v),
        onEnter: (v) => emit('enter', v),
        onFocus: () => emit('focus'),
        onBlur: () => emit('blur'),
      })
    }

    onMounted(() => nextTick(create))

    watch(
      () => props.modelValue,
      (v) => {
        if (instance && instance.input.value !== v) {
          instance.input.value = v
        }
      }
    )

    watch(
      () => props.disabled,
      (v) => {
        if (instance) instance.input.disabled = v
      }
    )

    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
