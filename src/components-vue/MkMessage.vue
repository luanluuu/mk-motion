<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export type MessageType = 'success' | 'warning' | 'error' | 'info'

export interface MessageProps {
  type?: MessageType
  message?: string
  duration?: number
  showClose?: boolean
}

const props = withDefaults(defineProps<MessageProps>(), {
  type: 'info',
  message: '',
  duration: 3000,
  showClose: true,
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const ICONS: Record<MessageType, string> = {
  success: '✓',
  warning: '!',
  error: '✕',
  info: 'i',
}

const doClose = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  setTimeout(() => emit('close'), 300)
}

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true
  })
  if (props.duration > 0) {
    timer = setTimeout(doClose, props.duration)
  }
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<template>
  <Transition name="mk-message">
    <div v-show="visible" class="mk-message" :class="`mk-message--${type}`">
      <span class="mk-message__icon">{{ ICONS[type] }}</span>
      <span class="mk-message__content">{{ message }}</span>
      <span
        v-if="showClose"
        class="mk-message__close"
        role="button"
        tabindex="0"
        aria-label="Close"
        @click="doClose"
        @keydown.enter.prevent="doClose"
        >✕</span
      >
    </div>
  </Transition>
</template>

<style scoped>
.mk-message {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--mk-radius);
  font-size: 13px;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  pointer-events: auto;
  min-width: 260px;
  opacity: 0;
  transform: translateY(-12px);
  transition: all 0.2s ease;
}

.mk-message.mk-message-enter-to,
.mk-message.mk-message-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.mk-message__icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
  border-radius: 50%;
}

.mk-message__content {
  flex: 1;
  color: var(--mk-text);
}

.mk-message__close {
  cursor: pointer;
  color: var(--mk-text-tertiary);
  font-size: 11px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: var(--mk-transition);
}
.mk-message__close:hover {
  color: var(--mk-text);
  background: var(--mk-surface-hover);
}

.mk-message--success .mk-message__icon {
  color: var(--mk-success);
}
.mk-message--warning .mk-message__icon {
  color: var(--mk-warning);
}
.mk-message--error .mk-message__icon {
  color: var(--mk-danger);
}
.mk-message--info .mk-message__icon {
  color: var(--mk-primary);
}
</style>
