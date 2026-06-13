import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import { createPagination } from '../components/pagination/pagination.js'
import type { PaginationOptions } from '../components/pagination/pagination.js'

export const MkPagination = defineComponent({
  name: 'MkPagination',
  props: {
    total: { type: Number, required: true },
    pageSize: { type: Number, default: 10 },
    currentPage: { type: Number, default: 1 },
    pageSizes: { type: Array as () => number[], default: () => [10, 20, 50] },
  },
  emits: ['update:currentPage', 'update:pageSize', 'change', 'sizeChange'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createPagination> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createPagination(container.value, {
        total: props.total,
        pageSize: props.pageSize,
        currentPage: props.currentPage,
        pageSizes: props.pageSizes,
        onChange: (page) => {
          emit('update:currentPage', page)
          emit('change', page)
        },
        onSizeChange: (size) => {
          emit('update:pageSize', size)
          emit('sizeChange', size)
        },
      })
    }

    onMounted(() => nextTick(create))
    watch(
      () => [props.total, props.pageSize, props.currentPage, props.pageSizes],
      () => nextTick(create),
      { deep: true }
    )
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
