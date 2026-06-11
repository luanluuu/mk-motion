import { defineComponent, h } from 'vue'

export const MkDivider = defineComponent({
  name: 'MkDivider',
  props: {
    text: { type: String, default: '' },
    direction: { type: String as () => 'horizontal' | 'vertical', default: 'horizontal' },
    dashed: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h(
        'div',
        {
          class: [
            'mk-divider',
            {
              'mk-divider--horizontal': props.direction === 'horizontal',
              'mk-divider--vertical': props.direction === 'vertical',
              'mk-divider--dashed': props.dashed,
            },
          ],
        },
        props.text
      )
  },
})
