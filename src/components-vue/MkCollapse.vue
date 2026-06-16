<script setup lang="ts">
import { computed, provide, ref, useSlots, watch } from 'vue'
import { collapseContextKey } from './collapse-context.js'
import MkCollapseItem from './MkCollapseItem.vue'

export interface CollapseItem {
  key?: string | number
  title: string
  content?: string
  disabled?: boolean
}

export interface CollapseProps {
  accordion?: boolean
  items?: CollapseItem[]
}

const props = withDefaults(defineProps<CollapseProps>(), {
  accordion: false,
  items: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  change: [value: (string | number)[]]
}>()

const model = defineModel<(string | number)[]>({ default: () => [] })

const slots = useSlots()
const hasPropItems = computed(() => (props.items ?? []).length > 0)
const hasSlotItems = computed(() => !!slots.default)

const isDev = () =>
  (import.meta as { env?: { DEV?: boolean; MODE?: string } }).env?.DEV ??
  (import.meta as { env?: { MODE?: string } }).env?.MODE === 'development'

if (isDev() && hasPropItems.value) {
  console.warn(
    '[mk-motion] <MkCollapse> `items` prop is deprecated. ' +
      'Use <MkCollapseItem> child components instead.'
  )
}

if (isDev() && hasPropItems.value && hasSlotItems.value) {
  console.warn(
    '[mk-motion] <MkCollapse> `items` prop and <MkCollapseItem> slot children ' +
      'are both provided. The `items` prop takes precedence; slot children will be ignored.'
  )
}

const activeNames = computed({
  get: () => model.value ?? [],
  set: (value) => {
    model.value = value
    emit('update:modelValue', value)
    emit('change', value)
  },
})

function isActive(name: string | number) {
  return activeNames.value.includes(name)
}

function toggle(name: string | number, disabled?: boolean) {
  if (disabled) return
  const active = isActive(name)
  let next: (string | number)[]
  if (props.accordion) {
    next = active ? [] : [name]
  } else {
    next = active
      ? activeNames.value.filter((n) => n !== name)
      : [...activeNames.value, name]
  }
  activeNames.value = next
}

const registeredItems = ref<
  { name: string | number; title?: string; disabled?: boolean }[]
>(
  (props.items ?? []).map((item, index) => ({
    ...item,
    name: item.key ?? index,
  }))
)

watch(
  () => props.items,
  (items) => {
    registeredItems.value = (items ?? []).map((item, index) => ({
      ...item,
      name: item.key ?? index,
    }))
  },
  { deep: true }
)

function registerItem(item: {
  name: string | number
  title?: string
  disabled?: boolean
}) {
  if (!registeredItems.value.some((i) => i.name === item.name)) {
    registeredItems.value.push(item)
  }
}

function unregisterItem(name: string | number) {
  registeredItems.value = registeredItems.value.filter((i) => i.name !== name)
}

provide(collapseContextKey, {
  activeNames: computed(() => activeNames.value),
  accordion: computed(() => props.accordion),
  registerItem,
  unregisterItem,
  toggle,
  isActive,
})

const resolvedItems = computed(() =>
  (props.items ?? []).map((item, index) => ({
    ...item,
    name: item.key ?? index,
  }))
)
</script>

<template>
  <div class="mk-collapse">
    <template v-if="resolvedItems.length">
      <MkCollapseItem
        v-for="item in resolvedItems"
        :key="item.name"
        :name="item.name"
        :title="item.title"
        :disabled="item.disabled"
      >
        <template v-if="$slots.title" #title>
          <slot name="title" :item="item" />
        </template>
        <slot name="content" :item="item">{{ item.content }}</slot>
      </MkCollapseItem>
    </template>
    <slot v-else />
  </div>
</template>

<style>
.mk-collapse {
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  background: var(--mk-surface);
  overflow: hidden;
}

.mk-collapse__item {
  border-bottom: 1px solid var(--mk-border);
}

.mk-collapse__item:last-child {
  border-bottom: none;
}

.mk-collapse__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mk-space-3);
  padding: var(--mk-space-3) var(--mk-space-4);
  font-size: var(--mk-text-sm);
  font-weight: var(--mk-font-medium);
  color: var(--mk-text);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--mk-duration-fast) var(--mk-ease-default);
  outline: none;
}

.mk-collapse__header:hover {
  background: var(--mk-surface-hover);
}

.mk-collapse__header:focus-visible {
  box-shadow: inset 0 0 0 2px var(--mk-primary-soft);
}

.mk-collapse__item.is-disabled .mk-collapse__header {
  color: var(--mk-text-disabled);
  cursor: not-allowed;
  background: transparent;
}

.mk-collapse__title {
  flex: 1;
  min-width: 0;
}

.mk-collapse__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--mk-text-tertiary);
  transition: transform var(--mk-duration-normal) var(--mk-ease-out);
  flex-shrink: 0;
}

.mk-collapse__arrow.is-expanded {
  transform: rotate(90deg);
}

.mk-collapse__content {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--mk-duration-normal) var(--mk-ease-out);
}

.mk-collapse__inner {
  padding: 0 var(--mk-space-4) var(--mk-space-3);
  font-size: var(--mk-text-sm);
  line-height: var(--mk-leading-normal);
  color: var(--mk-text-secondary);
}
</style>
