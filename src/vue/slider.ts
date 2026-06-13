import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import { MkSlider as MkSliderClass } from '../components/form/slider.js'
import type { SliderOptions } from '../components/form/slider.js'

export const MkSlider = defineComponent({
  name: 'MkSlider',
  props: {
    modelValue: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    showValue: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: InstanceType<typeof MkSliderClass> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = new MkSliderClass(container.value, {
        min: props.min,
        max: props.max,
        step: props.step,
        value: props.modelValue,
        showValue: props.showValue,
        onChange: (v) => {
          emit('update:modelValue', v)
          emit('change', v)
        },
      })
    }

    onMounted(() => nextTick(create))

    watch(
      () => props.modelValue,
      (v) => {
        if (instance && instance.value !== v) {
          instance.value = v
        }
      }
    )

    watch(
      () => [props.min, props.max, props.step],
      () => nextTick(create),
      { deep: true }
    )

    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
