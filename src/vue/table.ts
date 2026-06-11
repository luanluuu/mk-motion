import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { MkTable as MkTableClass } from '../components/table/table.js'
import type { TableColumn, TableOptions } from '../components/table/table.js'

export const MkTable = defineComponent({
  name: 'MkTable',
  props: {
    columns: { type: Array as () => TableColumn[], required: true },
    data: { type: Array as () => Record<string, any>[], default: () => [] },
    pageSize: { type: Number, default: 10 },
    virtual: { type: Boolean, default: false },
    itemHeight: { type: Number, default: 44 },
    virtualHeight: { type: Number, default: 400 },
    selection: { type: String as () => TableOptions['selection'], default: undefined },
  },
  emits: ['edit', 'delete', 'rowClick', 'selectChange'],
  setup(props, { emit }) {
    const container = ref<HTMLElement>()
    let instance: MkTableClass | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = new MkTableClass(container.value, {
        columns: props.columns,
        data: props.data,
        pageSize: props.pageSize,
        virtual: props.virtual,
        itemHeight: props.itemHeight,
        virtualHeight: props.virtualHeight,
        selection: props.selection,
        onEdit: (row, index) => emit('edit', row, index),
        onDelete: (row, index) => emit('delete', row, index),
        onRowClick: (row, index) => emit('rowClick', row, index),
        onSelectChange: (selected) => emit('selectChange', selected),
      })
    }

    onMounted(() => nextTick(create))
    watch(() => [props.columns, props.data, props.pageSize, props.virtual, props.itemHeight, props.virtualHeight, props.selection], () => nextTick(create), { deep: true })
    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
