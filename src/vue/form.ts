import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createForm } from '../components/form/form.js'
import type { FormOptions, FormField } from '../components/form/form.js'

export const MkForm = defineComponent({
  name: 'MkForm',
  props: {
    fields: { type: Array as () => FormField[], required: true },
    layout: { type: String as () => FormOptions['layout'], default: 'vertical' },
    labelWidth: { type: String, default: '' },
    modelValue: { type: Object as () => Record<string, any>, default: () => ({}) },
  },
  emits: ['submit', 'validate', 'update:modelValue'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createForm> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createForm(container.value, {
        fields: props.fields,
        layout: props.layout,
        labelWidth: props.labelWidth || undefined,
        onSubmit: (values) => {
          emit('update:modelValue', values)
          emit('submit', values)
        },
        onValidate: (errors) => emit('validate', errors),
      })
    }

    onMounted(() => nextTick(create))

    watch(() => props.fields, () => nextTick(create), { deep: true })
    watch(() => props.layout, () => nextTick(create))
    watch(() => props.labelWidth, () => nextTick(create))

    watch(() => props.modelValue, (v) => {
      if (instance) {
        instance.setValues(v)
      }
    }, { deep: true })

    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
