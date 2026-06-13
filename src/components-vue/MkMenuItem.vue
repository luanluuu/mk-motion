<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem, MenuMode } from './types.js'

const props = defineProps<{
  item: MenuItem
  mode: MenuMode
  collapse: boolean
  level: number
  isOpenFn: (item: MenuItem) => boolean
  isActiveFn: (item: MenuItem) => boolean
}>()

const emit = defineEmits<{
  toggle: [item: MenuItem]
  select: [item: MenuItem]
}>()

const hasChildren = computed(
  () => !!props.item.children && props.item.children.length > 0
)
const isOpen = computed(() => props.isOpenFn(props.item))
const isActive = computed(() => props.isActiveFn(props.item))
const paddingLeft = computed(() =>
  props.collapse && props.mode === 'vertical' ? 0 : 16 + props.level * 16
)

const onClick = () => {
  if (props.item.disabled) return
  if (hasChildren.value) {
    emit('toggle', props.item)
  } else {
    emit('select', props.item)
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick()
  }
}
</script>

<template>
  <li
    class="mk-menu-item"
    :class="{
      'is-disabled': item.disabled,
      'is-active': isActive,
      'has-children': hasChildren,
      'is-open': isOpen,
    }"
    :style="{ paddingLeft: `${paddingLeft}px` }"
  >
    <div
      class="mk-menu-item__title"
      :style="{ cursor: item.disabled ? 'not-allowed' : 'pointer' }"
      role="menuitem"
      :tabindex="item.disabled ? -1 : 0"
      :aria-disabled="item.disabled ? 'true' : undefined"
      :aria-haspopup="hasChildren ? 'true' : undefined"
      :aria-expanded="hasChildren ? (isOpen ? 'true' : 'false') : undefined"
      @click="onClick"
      @keydown="onKeydown"
    >
      <span v-if="item.icon" class="mk-menu-item__icon">{{ item.icon }}</span>
      <span class="mk-menu-item__text">{{ item.label }}</span>
      <span v-if="hasChildren && !collapse" class="mk-menu-item__arrow">›</span>
    </div>

    <Transition
      v-if="hasChildren && !collapse && mode === 'vertical'"
      enter-active-class="mk-menu-submenu-enter-active"
      leave-active-class="mk-menu-submenu-leave-active"
      enter-from-class="mk-menu-submenu-enter-from"
      leave-to-class="mk-menu-submenu-leave-to"
    >
      <ul v-show="isOpen" class="mk-menu-submenu" role="menu">
        <MkMenuItem
          v-for="child in item.children"
          :key="child.index"
          :item="child"
          :mode="mode"
          :collapse="collapse"
          :level="level + 1"
          :is-open-fn="isOpenFn"
          :is-active-fn="isActiveFn"
          @toggle="emit('toggle', $event)"
          @select="emit('select', $event)"
        />
      </ul>
    </Transition>

    <ul
      v-else-if="hasChildren && !collapse && mode === 'horizontal'"
      v-show="isOpen"
      class="mk-menu-submenu mk-menu-submenu--horizontal"
      role="menu"
    >
      <MkMenuItem
        v-for="child in item.children"
        :key="child.index"
        :item="child"
        :mode="mode"
        :collapse="collapse"
        :level="level + 1"
        :is-open-fn="isOpenFn"
        :is-active-fn="isActiveFn"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.mk-menu-item {
  position: relative;
  transition: var(--mk-transition-colors);
}

.mk-menu-item__title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  color: var(--mk-text-secondary);
  transition: var(--mk-transition-colors);
  border-radius: 6px;
  margin: 2px 8px;
}

.mk-menu--horizontal .mk-menu-item__title {
  margin: 0;
  border-radius: 0;
  padding: 12px 16px;
}

.mk-menu-item__title:hover {
  color: var(--mk-text);
  background: var(--mk-surface-hover);
}

.mk-menu-item.is-active > .mk-menu-item__title {
  color: var(--mk-primary);
  background: var(--mk-primary-muted);
}

.mk-menu-item.is-disabled > .mk-menu-item__title {
  opacity: 0.4;
  cursor: not-allowed;
}

.mk-menu-item__icon {
  width: 18px;
  text-align: center;
  font-size: 14px;
  flex-shrink: 0;
}

.mk-menu-item__text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-menu-item__arrow {
  font-size: 14px;
  transition: transform 0.2s;
  color: var(--mk-text-tertiary);
}

.mk-menu-item.is-open > .mk-menu-item__title .mk-menu-item__arrow {
  transform: rotate(90deg);
}

.mk-menu-submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.mk-menu-submenu-enter-active,
.mk-menu-submenu-leave-active {
  transition:
    max-height 0.3s var(--mk-ease-default),
    opacity 0.3s var(--mk-ease-default);
}

.mk-menu-submenu-enter-from,
.mk-menu-submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

.mk-menu-submenu-enter-to,
.mk-menu-submenu-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.mk-menu-submenu--horizontal {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  box-shadow: var(--mk-shadow-lg);
  z-index: var(--mk-z-dropdown);
  padding: 4px 0;
}

.mk-menu--horizontal
  .mk-menu-item.has-children:hover
  > .mk-menu-submenu--horizontal {
  display: block;
}
</style>
