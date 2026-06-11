<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useFloating, type Placement } from './composables/useFloating.js'

export interface TooltipProps {
  content?: string
  placement?: Placement
  disabled?: boolean
}

const props = withDefaults(defineProps<TooltipProps>(), {
  content: '',
  placement: 'top',
  disabled: false,
})

const targetRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const showTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const placementRef = computed(() => props.placement)
const { position, arrowClass, update } = useFloating(targetRef, tooltipRef, placementRef, 8)

const doShow = async () => {
  if (props.disabled) return
  visible.value = true
  await nextTick()
  update()
}

const doHide = () => {
  visible.value = false
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

const onEnter = () => {
  if (props.disabled) return
  clearTimers()
  showTimer.value = setTimeout(doShow, 150)
}

const onLeave = () => {
  if (props.disabled) return
  clearTimers()
  hideTimer.value = setTimeout(doHide, 150)
}

watch(visible, (val) => {
  if (!val) clearTimers()
})
</script>

<template>
  <span
    ref="targetRef"
    style="display: inline-block"
    :aria-describedby="visible ? 'mk-tooltip' : undefined"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focus="onEnter"
    @blur="onLeave"
  >
    <slot />
  </span>

  <Teleport to="body">
    <Transition name="mk-tooltip">
      <div
        v-show="visible"
        id="mk-tooltip"
        ref="tooltipRef"
        class="mk-tooltip"
        :style="{ top: `${position.top}px`, left: `${position.left}px` }"
        role="tooltip"
      >
        <div class="mk-tooltip__arrow" :class="arrowClass" />
        <div class="mk-tooltip__content">{{ content }}</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mk-tooltip {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.96) translateY(2px);
  transition: opacity var(--mk-duration-fast) var(--mk-ease-default),
              transform var(--mk-duration-fast) var(--mk-ease-out);
  filter: drop-shadow(var(--mk-shadow-md));
  max-width: 280px;
  z-index: var(--mk-z-tooltip);
}

.mk-tooltip.mk-tooltip-enter-to,
.mk-tooltip.mk-tooltip-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.mk-tooltip__content {
  padding: 6px 10px;
  font-size: var(--mk-text-xs);
  font-weight: var(--mk-font-medium);
  line-height: var(--mk-leading-snug);
  color: var(--mk-text);
  background: var(--mk-surface-raised);
  border: 1px solid var(--mk-border-hover);
  border-radius: var(--mk-radius-md);
}

.mk-tooltip__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--mk-surface-raised);
  border: 1px solid var(--mk-border-hover);
}

.mk-tooltip__arrow.is-top {
  top: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-right: none;
  border-bottom: none;
}

.mk-tooltip__arrow.is-bottom {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-left: none;
  border-top: none;
}

.mk-tooltip__arrow.is-left {
  left: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-right: none;
  border-top: none;
}

.mk-tooltip__arrow.is-right {
  right: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-left: none;
  border-bottom: none;
}
</style>
