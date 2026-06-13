import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import { createTree } from '../components/tree/tree.js'
import type { TreeOptions, TreeNode } from '../components/tree/tree.js'

export const MkTree = defineComponent({
  name: 'MkTree',
  props: {
    data: { type: Array as () => TreeNode[], default: () => [] },
    showCheckbox: { type: Boolean, default: false },
    checkStrictly: { type: Boolean, default: false },
    lazy: { type: Boolean, default: false },
    filter: { type: String, default: '' },
    loadData: {
      type: Function as () => TreeOptions['loadData'],
      default: undefined,
    },
  },
  emits: ['select', 'check', 'expand'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createTree> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createTree(container.value, {
        data: props.data,
        showCheckbox: props.showCheckbox,
        checkStrictly: props.checkStrictly,
        lazy: props.lazy,
        filter: props.filter,
        loadData: props.loadData,
        onSelect: (node) => emit('select', node),
        onCheck: (nodes) => emit('check', nodes),
        onExpand: (node) => emit('expand', node),
      })
    }

    onMounted(() => nextTick(create))
    watch(
      () => [
        props.data,
        props.showCheckbox,
        props.checkStrictly,
        props.lazy,
        props.filter,
      ],
      () => nextTick(create),
      { deep: true }
    )
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
