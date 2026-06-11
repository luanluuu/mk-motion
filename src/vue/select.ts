import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createSelect } from '../components/form/select.js'
import type { SelectOptions, SelectOption } from '../components/form/select.js'

export const MkSelect = defineComponent({
  name: 'MkSelect',
  props: {
    modelValue: { type: [String, Number] as () => string | number | undefined, default: undefined },
    options: { type: Array as () => SelectOption[], default: () => [] },
    placeholder: { type: String, default: '请选择' },
    disabled: { type: Boolean, default: false },
    virtualThreshold: { type: Number, default: 50 },
    itemHeight: { type: Number, default: 36 },
    filterable: { type: Boolean, default: false },
    remote: { type: Boolean, default: false },
    remoteMethod: { type: Function as () => (query: string) => Promise<SelectOption[]> | SelectOption[], default: undefined },
    debounce: { type: Number, default: 300 },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createSelect> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createSelect(container.value, {
        options: props.options,
        placeholder: props.placeholder,
        value: props.modelValue,
        disabled: props.disabled,
        virtualThreshold: props.virtualThreshold,
        itemHeight: props.itemHeight,
        filterable: props.filterable,
        remote: props.remote,
        remoteMethod: props.remoteMethod,
        debounce: props.debounce,
        onChange: (v) => {
          emit('update:modelValue', v)
          emit('change', v)
        },
      })
    }

    onMounted(() => nextTick(create))

    watch(() => props.modelValue, (v) => {
      if (instance && instance.value !== v) {
        instance.setValue(v as string | number)
      }
    })

    watch(() => props.disabled, (v) => {
      if (instance) instance.setDisabled(v)
    })

    watch(() => [props.options, props.placeholder], () => {
      if (instance) {
        instance.setOptions(props.options)
      } else {
        nextTick(create)
      }
    }, { deep: true })

    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
