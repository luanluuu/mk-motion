<script setup lang="ts">
import { computed, watch, nextTick, ref } from 'vue'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps {
  modelValue?: boolean
  title?: string
  placement?: DrawerPlacement
  size?: string | number
}

const props = withDefaults(defineProps<DrawerProps>(), {
  modelValue: false,
  title: '',
  placement: 'right',
  size: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
}>()

const model = defineModel<boolean>({ default: false })
const visible = ref(false)
const overlayRef = ref<HTMLDivElement | null>(null)

watch(model, async (val) => {
  if (val) {
    visible.value = true
    await nextTick()
    emit('open')
  } else {
    visible.value = false
    emit('close')
  }
}, { immediate: true })

const doClose = () => {
  model.value = false
  emit('update:modelValue', false)
  emit('close')
}

const onOverlayClick = (e: MouseEvent) => {
  if (e.target === overlayRef.value) doClose()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') doClose()
}

const sizeStyle = computed(() => {
  if (props.size === undefined) return {}
  const val = typeof props.size === 'number' ? `${props.size}px` : props.size
  if (props.placement === 'left' || props.placement === 'right') {
    return { width: val }
  }
  return { height: val }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="mk-drawer">
      <div
        v-show="visible"
        ref="overlayRef"
        class="mk-drawer-overlay"
        tabindex="-1"
        @click="onOverlayClick"
        @keydown="onKeydown"
      >
        <div
          class="mk-drawer"
          :class="`mk-drawer--${placement}`"
          role="dialog"
          aria-modal="true"
          :style="sizeStyle"
        >
          <div class="mk-drawer__header">
            <div class="mk-drawer__title">
              <slot name="title">{{ title }}</slot>
            </div>
            <span
              class="mk-drawer__close"
              role="button"
              tabindex="0"
              aria-label="Close"
              @click="doClose"
              @keydown.enter.prevent="doClose"
              @keydown.space.prevent="doClose"
            >✕</span>
          </div>
          <div class="mk-drawer__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="mk-drawer__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mk-drawer-overlay {
  position: fixed;
  inset: 0;
  background: var(--mk-overlay);
  z-index: 2000;
}

.mk-drawer {
  position: fixed;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  display: flex;
  flex-direction: column;
}

.mk-drawer--right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  border-left: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-lg) 0 0 var(--mk-radius-lg);
}

.mk-drawer--left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 340px;
  border-right: 1px solid var(--mk-border);
  border-radius: 0 var(--mk-radius-lg) var(--mk-radius-lg) 0;
}

.mk-drawer--top {
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  border-bottom: 1px solid var(--mk-border);
  border-radius: 0 0 var(--mk-radius-lg) var(--mk-radius-lg);
}

.mk-drawer--bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  border-top: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-lg) var(--mk-radius-lg) 0 0;
}

.mk-drawer__header {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--mk-border);
}

.mk-drawer__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--mk-text);
}

.mk-drawer__close {
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
.mk-drawer__close:hover {
  color: var(--mk-text);
  background: var(--mk-surface-hover);
}

.mk-drawer__body {
  padding: 16px 20px;
  flex: 1;
  overflow-y: auto;
  color: var(--mk-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.mk-drawer__footer {
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--mk-border);
}

.mk-drawer-enter-active,
.mk-drawer-leave-active {
  transition: opacity var(--mk-duration-normal) var(--mk-ease-default);
}
.mk-drawer-enter-from,
.mk-drawer-leave-to {
  opacity: 0;
}

.mk-drawer-enter-active .mk-drawer {
  transition: transform var(--mk-duration-slow) var(--mk-ease-spring);
}
.mk-drawer-leave-active .mk-drawer {
  transition: transform var(--mk-duration-normal) var(--mk-ease-in);
}

.mk-drawer-enter-from .mk-drawer--right,
.mk-drawer-leave-to .mk-drawer--right { transform: translateX(100%); }
.mk-drawer-enter-from .mk-drawer--left,
.mk-drawer-leave-to .mk-drawer--left { transform: translateX(-100%); }
.mk-drawer-enter-from .mk-drawer--top,
.mk-drawer-leave-to .mk-drawer--top { transform: translateY(-100%); }
.mk-drawer-enter-from .mk-drawer--bottom,
.mk-drawer-leave-to .mk-drawer--bottom { transform: translateY(100%); }
</style>
