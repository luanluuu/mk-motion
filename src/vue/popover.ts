import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createPopover } from '../components/popover/popover.js'
import type { PopoverOptions } from '../components/popover/popover.js'

export const MkPopover = defineComponent({
  name: 'MkPopover',
  props: {
    content: { type: String, default: '' },
    title: { type: String, default: '' },
    placement: { type: String as () => PopoverOptions['placement'], default: 'top' },
    trigger: { type: String as () => PopoverOptions['trigger'], default: 'hover' },
    width: { type: Number, default: undefined },
  },
  setup(props, { slots }) {
    const targetRef = ref<HTMLElement>()
    let instance: ReturnType<typeof createPopover> | null = null

    onMounted(() => {
      nextTick(() => {
        if (!targetRef.value) return
        instance = createPopover(targetRef.value, {
          content: props.content,
          title: props.title,
          placement: props.placement,
          trigger: props.trigger,
          width: props.width,
        })
      })
    })

    watch(() => [props.content, props.title, props.placement, props.trigger, props.width], () => {
      nextTick(() => instance?.setContent(props.content))
    })

    onUnmounted(() => instance?.destroy())

    return () => h('span', { ref: targetRef, style: 'display:inline-block' }, slots.default?.())
  },
})
