<script setup lang="ts">
import { ref, computed } from 'vue'

export interface CollapseItem {
  key?: string | number
  title: string
  content?: string
  disabled?: boolean
}

export interface CollapseProps {
  modelValue?: (string | number)[]
  accordion?: boolean
  items: CollapseItem[]
}

const props = withDefaults(defineProps<CollapseProps>(), {
  modelValue: () => [],
  accordion: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  change: [value: (string | number)[]]
}>()

const model = defineModel<(string | number)[]>({ default: () => [] })

const resolvedItems = computed(() =>
  props.items.map((item, index) => ({
    ...item,
    key: item.key ?? index,
  }))
)

const contentRefs = ref<Record<string | number, HTMLDivElement | null>>({})
const innerRefs = ref<Record<string | number, HTMLDivElement | null>>({})

const isActive = (key: string | number) => model.value.includes(key)

const toggle = (key: string | number, disabled?: boolean) => {
  if (disabled) return
  const active = isActive(key)
  let next: (string | number)[]
  if (props.accordion) {
    next = active ? [] : [key]
  } else {
    next = active ? model.value.filter((k) => k !== key) : [...model.value, key]
  }
  model.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

const maxHeight = (key: string | number) => {
  if (!isActive(key)) return '0px'
  const inner = innerRefs.value[key]
  return inner ? `${inner.scrollHeight}px` : '0px'
}
</script>

<template>
  <div class="mk-collapse">
    <div
      v-for="item in resolvedItems"
      :key="item.key"
      class="mk-collapse__item"
      :class="{ 'is-active': isActive(item.key), 'is-disabled': item.disabled }"
    >
      <div
        class="mk-collapse__header"
        role="button"
        :tabindex="item.disabled ? -1 : 0"
        :aria-expanded="isActive(item.key)"
        @click="toggle(item.key, item.disabled)"
        @keydown.enter.prevent="toggle(item.key, item.disabled)"
        @keydown.space.prevent="toggle(item.key, item.disabled)"
      >
        <span class="mk-collapse__title">
          <slot name="title" :item="item">{{ item.title }}</slot>
        </span>
        <span
          class="mk-collapse__arrow"
          :class="{ 'is-expanded': isActive(item.key) }"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 2l4 4-4 4" />
          </svg>
        </span>
      </div>
      <div
        ref="(el) => { contentRefs[item.key] = el as HTMLDivElement }"
        class="mk-collapse__content"
        :style="{ maxHeight: maxHeight(item.key) }"
      >
        <div
          ref="(el) => { innerRefs[item.key] = el as HTMLDivElement }"
          class="mk-collapse__inner"
        >
          <slot name="content" :item="item">{{ item.content }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
