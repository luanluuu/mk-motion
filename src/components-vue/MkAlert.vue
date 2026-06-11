<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  description?: string
  closable?: boolean
  showIcon?: boolean
}>(), {
  type: 'info',
  showIcon: true,
})

const emit = defineEmits<{
  close: []
}>()

const closed = ref(false)
const closing = ref(false)

const typeIcons: Record<string, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✕',
}

const alertClass = computed(() => {
  return [
    'mk-alert',
    `mk-alert--${props.type}`,
    props.closable ? 'is-closable' : '',
    closing.value ? 'is-closing' : '',
  ]
})

function close() {
  closing.value = true
  setTimeout(() => {
    closed.value = true
    emit('close')
  }, 300)
}
</script>

<template>
  <div v-if="!closed" :class="alertClass" role="alert">
    <slot name="icon">
      <span v-if="showIcon" class="mk-alert__icon">{{ typeIcons[type] }}</span>
    </slot>
    <div class="mk-alert__content">
      <slot name="title">
        <div v-if="title" class="mk-alert__title">{{ title }}</div>
      </slot>
      <slot name="description">
        <div v-if="description" class="mk-alert__description">{{ description }}</div>
      </slot>
      <slot />
    </div>
    <button
      v-if="closable"
      class="mk-alert__close"
      aria-label="Close"
      @click="close"
    >×</button>
  </div>
</template>

<style>
.mk-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--mk-space-3);
  padding: var(--mk-space-3) var(--mk-space-4);
  font-size: var(--mk-text-sm);
  line-height: var(--mk-leading-snug);
  color: var(--mk-text);
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-left-width: 4px;
  border-radius: var(--mk-radius);
  transition: var(--mk-transition-all);
  overflow: hidden;
}

.mk-alert__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: var(--mk-font-bold);
  margin-top: 1px;
}

.mk-alert__content {
  flex: 1;
  min-width: 0;
}

.mk-alert__title {
  font-weight: var(--mk-font-semibold);
  margin-bottom: 2px;
}

.mk-alert__description {
  color: var(--mk-text-secondary);
  font-size: var(--mk-text-sm);
}

.mk-alert__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  margin: 0;
  font-size: 18px;
  line-height: 1;
  color: var(--mk-text-tertiary);
  background: transparent;
  border: none;
  border-radius: var(--mk-radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  transition: var(--mk-transition-colors);
}
.mk-alert__close:hover {
  color: var(--mk-text);
  background: var(--mk-surface-alpha-weak);
}

.mk-alert--info {
  border-left-color: var(--mk-info);
  background: var(--mk-info-soft);
}
.mk-alert--info .mk-alert__icon {
  color: var(--mk-info);
}

.mk-alert--success {
  border-left-color: var(--mk-success);
  background: var(--mk-success-soft);
}
.mk-alert--success .mk-alert__icon {
  color: var(--mk-success);
}

.mk-alert--warning {
  border-left-color: var(--mk-warning);
  background: var(--mk-warning-soft);
}
.mk-alert--warning .mk-alert__icon {
  color: var(--mk-warning);
}

.mk-alert--danger {
  border-left-color: var(--mk-danger);
  background: var(--mk-danger-soft);
}
.mk-alert--danger .mk-alert__icon {
  color: var(--mk-danger);
}

.mk-alert.is-closing {
  transform: scale(0.98);
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  border-width: 0;
}
</style>
