import { defineComponent, h, ref, watch, onMounted, onUnmounted, Teleport, Transition } from 'vue'

export const MkDialog = defineComponent({
  name: 'MkDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    showClose: { type: Boolean, default: true },
    showCancel: { type: Boolean, default: true },
    center: { type: Boolean, default: false },
    cancelText: { type: String, default: '取消' },
    confirmText: { type: String, default: '确定' },
  },
  emits: ['update:modelValue', 'confirm', 'cancel', 'close'],
  setup(props, { emit, slots }) {
    const visible = ref(props.modelValue)
    const overlayRef = ref<HTMLDivElement>()

    watch(() => props.modelValue, (v) => {
      visible.value = v
    })

    const close = () => {
      visible.value = false
      emit('update:modelValue', false)
      emit('close')
    }

    const onConfirm = () => {
      emit('confirm')
      close()
    }

    const onCancel = () => {
      emit('cancel')
      close()
    }

    const onOverlayClick = (e: MouseEvent) => {
      if (e.target === overlayRef.value) close()
    }

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    onMounted(() => {
      if (props.modelValue) visible.value = true
    })

    return () => h(Teleport, { to: 'body' }, [
      h(Transition, { name: 'mk-dialog' }, {
        default: () => visible.value
          ? h('div', {
              ref: overlayRef,
              class: 'mk-dialog-overlay',
              tabindex: -1,
              onClick: onOverlayClick,
              onKeydown,
            }, [
              h('div', {
                class: ['mk-dialog', { 'is-center': props.center }],
                role: 'dialog',
                'aria-modal': 'true',
              }, [
                h('div', { class: 'mk-dialog__header' }, [
                  h('span', { class: 'mk-dialog__title' }, props.title),
                  props.showClose
                    ? h('span', { class: 'mk-dialog__close', onClick: close }, '✕')
                    : null,
                ]),
                h('div', { class: 'mk-dialog__body' }, slots.default?.()),
                h('div', { class: 'mk-dialog__footer' }, [
                  props.showCancel
                    ? h('button', { class: 'mk-button', onClick: onCancel }, props.cancelText)
                    : null,
                  h('button', { class: 'mk-button mk-button--primary', onClick: onConfirm }, props.confirmText),
                ]),
              ]),
            ])
          : null,
      }),
    ])
  },
})
