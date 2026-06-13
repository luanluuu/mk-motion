import { defineComponent, h } from 'vue'

export const MkRow = defineComponent({
  name: 'MkRow',
  props: {
    gutter: { type: Number, default: undefined },
    justify: {
      type: String as () =>
        | 'start'
        | 'center'
        | 'end'
        | 'space-between'
        | 'space-around',
      default: undefined,
    },
    align: {
      type: String as () => 'top' | 'middle' | 'bottom',
      default: undefined,
    },
    wrap: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          class: [
            'mk-row',
            {
              [`mk-row--justify-${props.justify}`]: props.justify,
              [`mk-row--align-${props.align}`]: props.align,
              'mk-row--no-wrap': props.wrap === false,
            },
          ],
          style: props.gutter
            ? { margin: `0 -${props.gutter / 2}px` }
            : undefined,
        },
        slots.default?.()
      )
  },
})

export const MkCol = defineComponent({
  name: 'MkCol',
  props: {
    span: { type: [Number, String], default: 'flex' },
    offset: { type: Number, default: undefined },
    sm: { type: Number, default: undefined },
    md: { type: Number, default: undefined },
    lg: { type: Number, default: undefined },
    xl: { type: Number, default: undefined },
  },
  setup(props, { slots }) {
    const span = props.span === 'flex' ? 'flex' : props.span
    const classes = ['mk-col', `mk-col-${span}`]
    if (props.offset) classes.push(`mk-col-offset-${props.offset}`)
    if (props.sm) classes.push(`mk-col-sm-${props.sm}`)
    if (props.md) classes.push(`mk-col-md-${props.md}`)
    if (props.lg) classes.push(`mk-col-lg-${props.lg}`)
    if (props.xl) classes.push(`mk-col-xl-${props.xl}`)

    return () => h('div', { class: classes }, slots.default?.())
  },
})
