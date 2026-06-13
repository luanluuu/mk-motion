import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import { createCard } from '../components/card/card.js'
import type { CardOptions } from '../components/card/card.js'

export const MkCard = defineComponent({
  name: 'MkCard',
  props: {
    title: { type: String, default: '' },
    body: { type: String, default: '' },
    footer: { type: String, default: '' },
    shadow: { type: String as () => CardOptions['shadow'], default: undefined },
    loading: { type: Boolean, default: false },
    image: { type: String, default: '' },
    motion: { type: Object as () => CardOptions['motion'], default: undefined },
  },
  setup(props, { slots }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createCard> | null = null

    const getTitle = () => {
      if (props.title) return props.title
      const slot = slots.header?.()[0]?.children
      return typeof slot === 'string' ? slot : ''
    }

    const getBody = () => {
      if (props.body) return props.body
      const slot = slots.default?.()[0]?.children
      return typeof slot === 'string' ? slot : ''
    }

    const getFooter = () => {
      if (props.footer) return props.footer
      const slot = slots.footer?.()[0]?.children
      return typeof slot === 'string' ? slot : ''
    }

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createCard(container.value, {
        title: getTitle(),
        body: getBody(),
        footer: getFooter(),
        image: props.image || undefined,
        shadow: props.shadow,
        loading: props.loading,
        motion: props.motion,
      })
    }

    onMounted(() => nextTick(create))
    watch(
      () => [
        props.title,
        props.body,
        props.footer,
        props.shadow,
        props.image,
        props.loading,
        props.motion,
      ],
      () => nextTick(create),
      { deep: true }
    )
    watch(
      () => props.loading,
      (v) => instance?.setLoading(v)
    )
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
