<script setup lang="ts">
import { watch, nextTick, ref } from 'vue'

export interface DialogProps {
  modelValue?: boolean
  title?: string
  width?: string | number
  showClose?: boolean
  beforeClose?: (done: () => void) => void
}

const props = withDefaults(defineProps<DialogProps>(), {
  modelValue: false,
  title: '',
  width: 400,
  showClose: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
  confirm: []
}>()

const model = defineModel<boolean>({ default: false })
const overlayRef = ref<HTMLDivElement | null>(null)
const visible = ref(false)

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusable(): HTMLElement[] {
  if (!overlayRef.value) return []
  return Array.from(
    overlayRef.value.querySelectorAll(focusableSelector)
  ).filter((el) => {
    const htmlEl = el as HTMLElement
    return (
      !htmlEl.hasAttribute('disabled') &&
      htmlEl.getAttribute('aria-hidden') !== 'true'
    )
  }) as HTMLElement[]
}

function focusFirst() {
  nextTick(() => {
    const list = getFocusable()
    if (list.length) {
      list[0].focus()
    } else {
      overlayRef.value?.focus()
    }
  })
}

watch(
  model,
  async (val) => {
    if (val) {
      visible.value = true
      await nextTick()
      emit('open')
      focusFirst()
    } else {
      visible.value = false
      emit('close')
    }
  },
  { immediate: true }
)

const doClose = () => {
  const finish = () => {
    model.value = false
    emit('update:modelValue', false)
    emit('close')
  }
  if (props.beforeClose) {
    props.beforeClose(finish)
  } else {
    finish()
  }
}

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === overlayRef.value) doClose()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    doClose()
    return
  }
  if (e.key !== 'Tab') return

  const list = getFocusable()
  if (list.length === 0) {
    e.preventDefault()
    return
  }

  const first = list[0]
  const last = list[list.length - 1]
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

const onConfirm = () => {
  emit('confirm')
  doClose()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="mk-dialog-fade">
      <div
        v-show="visible"
        ref="overlayRef"
        class="mk-dialog-overlay"
        tabindex="-1"
        @click="onOverlayClick"
        @keydown="onKeydown"
      >
        <div
          class="mk-dialog"
          role="dialog"
          aria-modal="true"
          :style="{ width: typeof width === 'number' ? `${width}px` : width }"
        >
          <div class="mk-dialog__header">
            <div class="mk-dialog__title">
              <slot name="title">{{ title }}</slot>
            </div>
            <span
              v-if="showClose"
              class="mk-dialog__close"
              role="button"
              tabindex="0"
              aria-label="Close"
              @click="doClose"
              @keydown.enter.prevent="doClose"
              @keydown.space.prevent="doClose"
              >✕</span
            >
          </div>
          <div class="mk-dialog__body">
            <slot />
          </div>
          <div class="mk-dialog__footer">
            <slot name="footer">
              <button class="mk-button" @click="doClose">取消</button>
              <button class="mk-button mk-button--primary" @click="onConfirm">
                确定
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mk-dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--mk-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.mk-dialog {
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-lg);
  min-width: 320px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  transform-origin: center;
}

.mk-dialog__header {
  padding: 18px 20px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mk-dialog__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--mk-text);
}

.mk-dialog__close {
  cursor: pointer;
  color: var(--mk-text-tertiary);
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: var(--mk-transition);
}
.mk-dialog__close:hover {
  color: var(--mk-text);
  background: var(--mk-surface-hover);
}

.mk-dialog__body {
  padding: 6px 20px 18px;
  overflow-y: auto;
  flex: 1;
  color: var(--mk-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.mk-dialog__footer {
  padding: 12px 20px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--mk-border);
}

.mk-dialog-fade-enter-active {
  transition: opacity var(--mk-duration-normal) var(--mk-ease-out);
}
.mk-dialog-fade-leave-active {
  transition: opacity var(--mk-duration-fast) var(--mk-ease-in);
}
.mk-dialog-fade-enter-from,
.mk-dialog-fade-leave-to {
  opacity: 0;
}

.mk-dialog-fade-enter-active .mk-dialog {
  transition:
    transform var(--mk-duration-slow) var(--mk-ease-spring),
    opacity var(--mk-duration-normal) var(--mk-ease-out);
}
.mk-dialog-fade-leave-active .mk-dialog {
  transition:
    transform var(--mk-duration-fast) var(--mk-ease-in),
    opacity var(--mk-duration-fast) var(--mk-ease-in);
}
.mk-dialog-fade-enter-from .mk-dialog,
.mk-dialog-fade-leave-to .mk-dialog {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
}
</style>
