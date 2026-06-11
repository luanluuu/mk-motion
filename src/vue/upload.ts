import { defineComponent, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createUpload } from '../components/upload/upload.js'
import type { UploadOptions } from '../components/upload/upload.js'

export const MkUpload = defineComponent({
  name: 'MkUpload',
  props: {
    accept: { type: String, default: '' },
    multiple: { type: Boolean, default: false },
    drag: { type: Boolean, default: false },
    maxSize: { type: Number, default: undefined },
  },
  emits: ['change', 'preview', 'remove'],
  setup(props, { emit }) {
    const container = ref<HTMLDivElement>()
    let instance: ReturnType<typeof createUpload> | null = null

    const create = () => {
      if (!container.value) return
      instance?.destroy()
      instance = createUpload(container.value, {
        accept: props.accept || undefined,
        multiple: props.multiple,
        drag: props.drag,
        maxSize: props.maxSize,
        onChange: (files) => emit('change', files),
        onPreview: (file) => emit('preview', file),
        onRemove: (file) => emit('remove', file),
      })
    }

    onMounted(() => nextTick(create))

    watch(() => [props.accept, props.multiple, props.drag, props.maxSize], () => nextTick(create))

    onUnmounted(() => instance?.destroy())

    return () => h('div', { ref: container })
  },
})
