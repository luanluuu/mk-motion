<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { springHover, springPress } from '../motion/component-spring.ts'
import type { SpringOptions } from '../core/spring-engine.ts'

const props = withDefaults(
  defineProps<{
    type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'text'
    size?: 'default' | 'small' | 'large'
    plain?: boolean
    round?: boolean
    circle?: boolean
    disabled?: boolean
    loading?: boolean
    icon?: string
    spring?: boolean | SpringOptions
  }>(),
  {
    type: 'default',
    size: 'default',
  }
)

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const btnRef = ref<HTMLButtonElement | null>(null)
let motionCtrl: { destroy: () => void } | null = null

const btnClass = computed(() => {
  const classes = ['mk-button']
  if (props.type !== 'default') classes.push(`mk-button--${props.type}`)
  if (props.size !== 'default') classes.push(`mk-button--${props.size}`)
  if (props.plain) classes.push('is-plain')
  if (props.round) classes.push('is-round')
  if (props.circle) classes.push('is-circle')
  if (props.loading) classes.push('is-loading')
  if (props.disabled) classes.push('is-disabled')
  return classes
})

function handleClick(e: MouseEvent) {
  if (props.disabled || props.loading) return
  createRipple(e)
  emit('click', e)
}

function createRipple(e: MouseEvent) {
  if (!btnRef.value) return
  const rect = btnRef.value.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const ripple = document.createElement('span')
  ripple.className = 'mk-button__ripple'
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`
  btnRef.value.appendChild(ripple)
  setTimeout(() => ripple.remove(), 600)
}

onMounted(() => {
  if (!btnRef.value) return
  const springOpts =
    props.spring === true ? undefined : props.spring || undefined
  const hoverCtrl = springHover(btnRef.value, {
    scale: 1.03,
    y: -1,
    shadow: true,
    spring: springOpts,
  })
  const pressCtrl = springPress(btnRef.value, {
    scale: 0.97,
    spring: springOpts,
  })
  motionCtrl = {
    destroy: () => {
      hoverCtrl.destroy()
      pressCtrl.destroy()
    },
  }
})

onBeforeUnmount(() => {
  motionCtrl?.destroy()
})
</script>

<template>
  <button
    ref="btnRef"
    :class="btnClass"
    type="button"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="mk-button__spinner" />
    <span v-if="icon && !loading">{{ icon }}</span>
    <span v-if="$slots.default" class="mk-button__content"><slot /></span>
  </button>
</template>

<style>
.mk-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 16px;
  height: 36px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  color: var(--mk-text);
  outline: none;
  transition: var(--mk-transition);
  user-select: none;
  margin-right: 8px;
  margin-bottom: 4px;
}
.mk-button:last-child {
  margin-right: 0;
}

.mk-button:hover {
  background: var(--mk-surface-hover);
  border-color: var(--mk-border-hover);
}

.mk-button:active {
  transform: translateY(0.5px);
}

.mk-button.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mk-button--primary {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
  color: #fff;
}
.mk-button--primary:hover {
  background: var(--mk-primary-hover);
  border-color: var(--mk-primary-hover);
}
.mk-button--primary:active {
  background: var(--mk-primary-active);
  border-color: var(--mk-primary-active);
}

.mk-button--success {
  background: var(--mk-success);
  border-color: var(--mk-success);
  color: #fff;
}
.mk-button--success:hover {
  opacity: 0.9;
}

.mk-button--warning {
  background: var(--mk-warning);
  border-color: var(--mk-warning);
  color: #000;
}
.mk-button--warning:hover {
  opacity: 0.9;
}

.mk-button--danger {
  background: var(--mk-danger);
  border-color: var(--mk-danger);
  color: #fff;
}
.mk-button--danger:hover {
  opacity: 0.9;
}

.mk-button--text {
  background: transparent;
  border-color: transparent;
  color: var(--mk-primary);
  padding: 0 8px;
}
.mk-button--text:hover {
  background: var(--mk-primary-muted);
}

.mk-button--small {
  padding: 0 12px;
  height: 28px;
  font-size: 12px;
  border-radius: 6px;
}
.mk-button--large {
  padding: 0 20px;
  height: 44px;
  font-size: 14px;
}

.mk-button.is-round {
  border-radius: var(--mk-radius-full);
}
.mk-button.is-circle {
  border-radius: 50%;
  padding: 0;
  width: 36px;
  height: 36px;
}
.mk-button--small.is-circle {
  width: 28px;
  height: 28px;
}
.mk-button--large.is-circle {
  width: 44px;
  height: 44px;
}

.mk-button.is-loading {
  pointer-events: none;
}
.mk-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--mk-white-alpha-weak);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: mk-spin 0.6s linear infinite;
}
@keyframes mk-spin {
  to {
    transform: rotate(360deg);
  }
}

.mk-button__ripple {
  position: absolute;
  border-radius: 50%;
  background: var(--mk-white-alpha-weak);
  pointer-events: none;
  transform: scale(0);
  animation: mk-ripple 0.4s ease-out forwards;
}
@keyframes mk-ripple {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>
