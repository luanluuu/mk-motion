<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { withMotion, type MotionOptions } from '../motion/component-motion.ts'

const props = withDefaults(
  defineProps<{
    type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'small' | 'default' | 'large'
    closable?: boolean
    round?: boolean
    plain?: boolean
    motion?: MotionOptions
  }>(),
  {
    type: 'default',
    size: 'default',
  }
)

const emit = defineEmits<{
  close: []
}>()

const tagRef = ref<HTMLSpanElement | null>(null)
const closing = ref(false)
let motionCtrl: { destroy: () => void } | null = null

const tagClass = computed(() => {
  return [
    'mk-tag',
    props.type !== 'default' ? `mk-tag--${props.type}` : '',
    props.size !== 'default' ? `mk-tag--${props.size}` : '',
    props.plain ? 'is-plain' : '',
    props.round ? 'is-round' : '',
    props.closable ? 'is-closable' : '',
    closing.value ? 'is-closing' : '',
  ]
})

function close(e: MouseEvent) {
  e.stopPropagation()
  closing.value = true
  setTimeout(() => {
    emit('close')
  }, 200)
}

function onCloseKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    close(e as unknown as MouseEvent)
  }
}

onMounted(() => {
  if (tagRef.value) {
    motionCtrl = withMotion(
      tagRef.value,
      props.motion || { hover: 'scale', enter: 'zoomIn', duration: 200 }
    )
  }
})

onBeforeUnmount(() => {
  motionCtrl?.destroy()
})
</script>

<template>
  <span ref="tagRef" :class="tagClass">
    <slot />
    <span
      v-if="closable"
      class="mk-tag__close"
      role="button"
      tabindex="0"
      aria-label="Close"
      @click="close"
      @keydown="onCloseKeydown"
      >×</span
    >
  </span>
</template>

<style>
.mk-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  height: 24px;
  font-size: var(--mk-text-xs);
  font-weight: var(--mk-font-medium);
  line-height: 1;
  color: var(--mk-text);
  background: var(--mk-surface-raised);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-sm);
  white-space: nowrap;
  user-select: none;
  transition: var(--mk-transition-all);
  vertical-align: middle;
}
.mk-tag.is-round {
  border-radius: var(--mk-radius-full);
}
.mk-tag.is-closable {
  padding-right: 4px;
}

.mk-tag--small {
  padding: 0 6px;
  height: 20px;
  font-size: 11px;
}
.mk-tag--small.is-closable {
  padding-right: 2px;
}

.mk-tag--large {
  padding: 0 12px;
  height: 32px;
  font-size: var(--mk-text-sm);
}
.mk-tag--large.is-closable {
  padding-right: 6px;
}

.mk-tag--primary {
  background: var(--mk-primary-soft);
  border-color: var(--mk-primary);
  color: var(--mk-primary-hover);
}
.mk-tag--success {
  background: var(--mk-success-soft);
  border-color: var(--mk-success);
  color: var(--mk-green-400);
}
.mk-tag--warning {
  background: var(--mk-warning-soft);
  border-color: var(--mk-warning);
  color: var(--mk-amber-400);
}
.mk-tag--danger {
  background: var(--mk-danger-soft);
  border-color: var(--mk-danger);
  color: var(--mk-red-400);
}
.mk-tag--info {
  background: var(--mk-info-soft);
  border-color: var(--mk-info);
  color: var(--mk-sky-400);
}

.mk-tag.is-plain {
  background: transparent;
}

.mk-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 14px;
  line-height: 1;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  border-radius: var(--mk-radius-sm);
  transition: var(--mk-transition-all);
}
.mk-tag__close:hover {
  opacity: 1;
  background: var(--mk-surface-alpha-strong);
}

.mk-tag.is-closing {
  transform: scale(0.85);
  opacity: 0;
}
</style>
