import { defineComponent, h } from 'vue'

export const MkSpace = defineComponent({
  name: 'MkSpace',
  props: {
    direction: { type: String as () => 'horizontal' | 'vertical', default: 'horizontal' },
    size: { type: String as () => 'small' | 'default' | 'large', default: 'default' },
    wrap: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          class: [
            'mk-space',
            {
              'mk-space--vertical': props.direction === 'vertical',
              [`mk-space--${props.size}`]: props.size,
              'mk-space--wrap': props.wrap,
              'mk-space--nowrap': !props.wrap,
            },
          ],
        },
        slots.default?.()
      )
  },
})
