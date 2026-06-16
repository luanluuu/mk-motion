<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useFloating, type Placement } from './composables/useFloating.js'
import { useClickOutside } from './composables/useClickOutside.js'

export type PopoverTrigger = 'click' | 'hover'

export interface PopoverProps {
  content?: string
  title?: string
  placement?: Placement
  trigger?: PopoverTrigger
  width?: string | number
  disabled?: boolean
  teleport?: string | HTMLElement | false
}

const props = withDefaults(defineProps<PopoverProps>(), {
  content: '',
  title: '',
  placement: 'top',
  trigger: 'hover',
  disabled: false,
  teleport: 'body',
})

const emit = defineEmits<{
  show: []
  hide: []
}>()

const targetRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const showTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const placementRef = computed(() => props.placement)
const { position, arrowClass, update } = useFloating(
  targetRef,
  popoverRef,
  placementRef,
  8
)

const widthStyle = computed(() => {
  if (props.width === undefined) return undefined
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

const doShow = async () => {
  if (props.disabled) return
  visible.value = true
  await nextTick()
  update()
  emit('show')
}

const doHide = () => {
  visible.value = false
  emit('hide')
}

const clearTimers = () => {
  if (showTimer.value) {
    clearTimeout(showTimer.value)
    showTimer.value = null
  }
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
}

const onTriggerEnter = () => {
  if (props.trigger !== 'hover' || props.disabled) return
  clearTimers()
  showTimer.value = setTimeout(doShow, 150)
}

const onTriggerLeave = () => {
  if (props.trigger !== 'hover' || props.disabled) return
  clearTimers()
  hideTimer.value = setTimeout(doHide, 150)
}

const onPopoverEnter = () => {
  if (props.trigger !== 'hover') return
  clearTimers()
}

const onPopoverLeave = () => {
  if (props.trigger !== 'hover') return
  clearTimers()
  hideTimer.value = setTimeout(doHide, 150)
}

const onTriggerClick = (e: MouseEvent) => {
  if (props.trigger !== 'click' || props.disabled) return
  e.stopPropagation()
  visible.value ? doHide() : doShow()
}

const onClickOutside = () => {
  if (props.trigger === 'click' && visible.value) doHide()
}

useClickOutside(popoverRef, onClickOutside, { ignore: [targetRef] })

watch(visible, (val) => {
  if (!val) clearTimers()
})
</script>

<template>
  <span
    ref="targetRef"
    style="display: inline-block"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
    @click="onTriggerClick"
  >
    <slot />
  </span>

  <Teleport :to="teleport" :disabled="!teleport">
    <Transition name="mk-popover">
      <div
        v-show="visible"
        ref="popoverRef"
        class="mk-popover"
        :class="`mk-popover--${placement}`"
        :style="[
          { top: `${position.top}px`, left: `${position.left}px` },
          { width: widthStyle },
        ]"
        :role="trigger === 'click' ? 'dialog' : 'tooltip'"
        :tabindex="trigger === 'click' ? -1 : undefined"
        @mouseenter="onPopoverEnter"
        @mouseleave="onPopoverLeave"
      >
        <div class="mk-popover__arrow" :class="arrowClass" />
        <div v-if="title || $slots.title" class="mk-popover__title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div class="mk-popover__content">
          <slot name="content">{{ content }}</slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mk-popover {
  position: absolute;
  opacity: 0;
  transform: scale(0.96) translateY(2px);
  transition:
    opacity var(--mk-duration-fast) var(--mk-ease-default),
    transform var(--mk-duration-fast) var(--mk-ease-out);
  filter: drop-shadow(var(--mk-shadow-lg));
  background: var(--mk-surface-raised);
  border: 1px solid var(--mk-border-hover);
  border-radius: var(--mk-radius-md);
  pointer-events: auto;
  z-index: var(--mk-z-popover);
}

.mk-popover.mk-popover-enter-to,
.mk-popover.mk-popover-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.mk-popover__title {
  padding: var(--mk-space-3) var(--mk-space-4) 0;
  font-size: var(--mk-text-sm);
  font-weight: var(--mk-font-semibold);
  line-height: var(--mk-leading-tight);
  color: var(--mk-text);
}

.mk-popover__content {
  padding: var(--mk-space-3) var(--mk-space-4);
  font-size: var(--mk-text-sm);
  line-height: var(--mk-leading-normal);
  color: var(--mk-text-secondary);
}

.mk-popover__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--mk-surface-raised);
  border: 1px solid var(--mk-border-hover);
}

.mk-popover__arrow.is-top {
  top: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-right: none;
  border-bottom: none;
}

.mk-popover__arrow.is-bottom {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-left: none;
  border-top: none;
}

.mk-popover__arrow.is-left {
  left: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-right: none;
  border-top: none;
}

.mk-popover__arrow.is-right {
  right: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-left: none;
  border-bottom: none;
}
</style>
