import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createBreadcrumb } from '../components/breadcrumb/breadcrumb.js'
import type { BreadcrumbOptions } from '../components/breadcrumb/breadcrumb.js'

export const MkBreadcrumb = defineComponent({
  name: 'MkBreadcrumb',
  props: {
    items: { type: Array as () => BreadcrumbOptions['items'], required: true },
    separator: { type: String, default: '/' },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const container = ref<HTMLElement>()
    let instance: ReturnType<typeof createBreadcrumb> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createBreadcrumb(container.value, {
        items: props.items.map((item, i) => ({
          ...item,
          onClick: item.onClick || (() => emit('click', i)),
        })),
        separator: props.separator,
      })
    }

    onMounted(() => nextTick(create))
    watch(() => [props.items, props.separator], () => nextTick(create), { deep: true })
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
