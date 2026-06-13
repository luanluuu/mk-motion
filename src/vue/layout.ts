import { defineComponent, h } from 'vue'

export const MkLayout = defineComponent({
  name: 'MkLayout',
  props: {
    direction: {
      type: String as () => 'vertical' | 'horizontal',
      default: 'vertical',
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          class: [
            'mk-layout',
            props.direction === 'horizontal'
              ? 'mk-layout--horizontal'
              : 'mk-layout--vertical',
          ],
        },
        slots.default?.()
      )
  },
})

export const MkHeader = defineComponent({
  name: 'MkHeader',
  props: {
    height: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'header',
        {
          class: 'mk-header',
          style:
            props.height !== undefined
              ? {
                  height:
                    typeof props.height === 'number'
                      ? `${props.height}px`
                      : props.height,
                }
              : undefined,
        },
        slots.default?.()
      )
  },
})

export const MkAside = defineComponent({
  name: 'MkAside',
  props: {
    width: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'aside',
        {
          class: 'mk-aside',
          style:
            props.width !== undefined
              ? {
                  width:
                    typeof props.width === 'number'
                      ? `${props.width}px`
                      : props.width,
                }
              : undefined,
        },
        slots.default?.()
      )
  },
})

export const MkMain = defineComponent({
  name: 'MkMain',
  setup(props, { slots }) {
    return () => h('main', { class: 'mk-main' }, slots.default?.())
  },
})

export const MkFooter = defineComponent({
  name: 'MkFooter',
  props: {
    height: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'footer',
        {
          class: 'mk-footer',
          style:
            props.height !== undefined
              ? {
                  height:
                    typeof props.height === 'number'
                      ? `${props.height}px`
                      : props.height,
                }
              : undefined,
        },
        slots.default?.()
      )
  },
})
