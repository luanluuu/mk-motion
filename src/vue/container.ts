import { defineComponent, h, computed } from 'vue'

export const MkContainer = defineComponent({
  name: 'MkContainer',
  props: {
    fluid: { type: Boolean, default: false },
    maxWidth: { type: [Number, String], default: undefined },
    padding: { type: [Number, String], default: undefined },
    centered: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    const style = computed(() => {
      const s: Record<string, string> = {}
      if (props.maxWidth !== undefined) {
        s.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
      }
      if (props.padding !== undefined) {
        s.padding = typeof props.padding === 'number' ? `${props.padding}px` : props.padding
      }
      return s
    })

    return () =>
      h(
        'div',
        {
          class: [
            'mk-container',
            { 'mk-container--fluid': props.fluid, 'mk-container--centered': props.centered },
          ],
          style: style.value,
        },
        slots.default?.()
      )
  },
})
