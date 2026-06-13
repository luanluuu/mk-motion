<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useFloating, type Placement } from './composables/useFloating.js'
import { useClickOutside } from './composables/useClickOutside.js'

export interface DropdownItem {
  label: string
  value: string
  disabled?: boolean
  divided?: boolean
}

export type DropdownTrigger = 'click' | 'hover'

export interface DropdownProps {
  items: DropdownItem[]
  trigger?: DropdownTrigger
  placement?: Placement
  disabled?: boolean
}

const props = withDefaults(defineProps<DropdownProps>(), {
  trigger: 'click',
  placement: 'bottom',
  disabled: false,
})

const emit = defineEmits<{
  select: [value: string, item: DropdownItem]
  visibleChange: [visible: boolean]
}>()

const targetRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const showTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const placementRef = computed(() => props.placement)
const { position, update } = useFloating(targetRef, menuRef, placementRef, 4)

const setVisible = (val: boolean) => {
  visible.value = val
  emit('visibleChange', val)
}

const doShow = async () => {
  if (props.disabled) return
  setVisible(true)
  await nextTick()
  update()
}

const doHide = () => {
  setVisible(false)
}

const toggle = () => {
  visible.value ? doHide() : doShow()
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

const onMenuEnter = () => {
  if (props.trigger !== 'hover') return
  clearTimers()
}

const onMenuLeave = () => {
  if (props.trigger !== 'hover') return
  clearTimers()
  hideTimer.value = setTimeout(doHide, 150)
}

const onTriggerClick = (e: MouseEvent) => {
  if (props.trigger !== 'click' || props.disabled) return
  e.stopPropagation()
  toggle()
}

const onSelect = (item: DropdownItem) => {
  if (item.disabled) return
  emit('select', item.value, item)
  doHide()
}

useClickOutside(
  menuRef,
  () => {
    if (props.trigger === 'click' && visible.value) doHide()
  },
  { ignore: [targetRef] }
)

watch(visible, (val) => {
  if (!val) clearTimers()
})
</script>

<template>
  <div class="mk-dropdown">
    <span
      ref="targetRef"
      class="mk-dropdown__trigger-wrap"
      :aria-expanded="visible"
      aria-haspopup="true"
      @mouseenter="onTriggerEnter"
      @mouseleave="onTriggerLeave"
      @click="onTriggerClick"
    >
      <slot />
    </span>

    <Teleport to="body">
      <Transition name="mk-dropdown-menu">
        <div
          v-show="visible"
          ref="menuRef"
          class="mk-dropdown__menu"
          :style="{ top: `${position.top}px`, left: `${position.left}px` }"
          @mouseenter="onMenuEnter"
          @mouseleave="onMenuLeave"
        >
          <div
            v-for="item in items"
            :key="item.value"
            class="mk-dropdown__item"
            :class="{
              'is-disabled': item.disabled,
              'is-divided': item.divided,
            }"
            role="menuitem"
            :aria-disabled="item.disabled ? 'true' : undefined"
            @click="onSelect(item)"
          >
            <slot name="item" :item="item">{{ item.label }}</slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mk-dropdown {
  position: relative;
  display: inline-block;
}

.mk-dropdown__trigger-wrap {
  display: inline-block;
}

.mk-dropdown__menu {
  position: absolute;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  box-shadow: var(--mk-shadow-lg);
  min-width: 160px;
  padding: 4px 0;
  opacity: 0;
  transform: scale(0.96) translateY(-2px);
  transition:
    opacity var(--mk-duration-fast) var(--mk-ease-default),
    transform var(--mk-duration-fast) var(--mk-ease-out);
  z-index: var(--mk-z-dropdown);
}

.mk-dropdown__menu.mk-dropdown-menu-enter-to,
.mk-dropdown__menu.mk-dropdown-menu-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.mk-dropdown__item {
  padding: 8px 16px;
  font-size: 13px;
  color: var(--mk-text);
  cursor: pointer;
  transition: var(--mk-transition);
  white-space: nowrap;
}

.mk-dropdown__item:hover {
  background: var(--mk-surface-hover);
  color: var(--mk-primary);
}

.mk-dropdown__item.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.mk-dropdown__item.is-divided {
  border-top: 1px solid var(--mk-border);
  margin-top: 4px;
  padding-top: 8px;
}
</style>
