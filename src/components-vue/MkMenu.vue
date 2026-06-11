<script setup lang="ts">
import { ref, watch } from 'vue'
import MkMenuItem from './MkMenuItem.vue'

export interface MenuItem {
  index: string
  label: string
  icon?: string
  disabled?: boolean
  children?: MenuItem[]
}

export type MenuMode = 'vertical' | 'horizontal'

export interface MenuProps {
  items: MenuItem[]
  mode?: MenuMode
  defaultActive?: string
  collapse?: boolean
  defaultOpeneds?: string[]
}

const props = withDefaults(defineProps<MenuProps>(), {
  mode: 'vertical',
  defaultActive: '',
  collapse: false,
  defaultOpeneds: () => [],
})

const emit = defineEmits<{
  select: [index: string]
  open: [index: string]
  close: [index: string]
}>()

const activeIndex = ref(props.defaultActive)
const openeds = ref<Set<string>>(new Set(props.defaultOpeneds))

watch(
  () => props.defaultActive,
  (v) => {
    activeIndex.value = v
  }
)

watch(
  () => props.defaultOpeneds,
  (v) => {
    openeds.value = new Set(v)
  },
  { deep: true }
)

const toggleSubmenu = (item: MenuItem) => {
  if (item.disabled) return
  const isOpen = openeds.value.has(item.index)
  if (isOpen) {
    openeds.value.delete(item.index)
    emit('close', item.index)
  } else {
    openeds.value.add(item.index)
    emit('open', item.index)
  }
}

const selectItem = (item: MenuItem) => {
  if (item.disabled) return
  activeIndex.value = item.index
  emit('select', item.index)
}

const isOpen = (item: MenuItem) => openeds.value.has(item.index)
const isActive = (item: MenuItem) => activeIndex.value === item.index
</script>

<template>
  <ul
    class="mk-menu"
    :class="[`mk-menu--${mode}`, { 'is-collapse': collapse }]"
    role="menu"
  >
    <MkMenuItem
      v-for="item in items"
      :key="item.index"
      :item="item"
      :mode="mode"
      :collapse="collapse"
      :level="0"
      :is-open-fn="isOpen"
      :is-active-fn="isActive"
      @toggle="toggleSubmenu"
      @select="selectItem"
    />
  </ul>
</template>

<style scoped>
.mk-menu {
  list-style: none;
  padding: 8px 0;
  margin: 0;
  font-size: var(--mk-text-sm);
}

.mk-menu--horizontal {
  display: flex;
  padding: 0;
  border-bottom: 1px solid var(--mk-border);
}

.mk-menu.is-collapse .mk-menu-item__text,
.mk-menu.is-collapse .mk-menu-item__arrow {
  display: none;
}

.mk-menu.is-collapse .mk-menu-item__title {
  justify-content: center;
  padding: 12px 0;
  margin: 2px 8px;
}
</style>
