<script lang="ts">
let collapseIdCounter = 0
export default { name: 'MkCollapseItem' }
</script>

<script setup lang="ts">
import { computed, inject, nextTick, onUnmounted, ref, watch } from 'vue'
import { collapseContextKey } from './collapse-context.js'

export interface CollapseItemProps {
  name: string | number
  title?: string
  disabled?: boolean
}

const props = defineProps<CollapseItemProps>()

const isDev = () =>
  (import.meta as { env?: { DEV?: boolean; MODE?: string } }).env?.DEV ??
  (import.meta as { env?: { MODE?: string } }).env?.MODE === 'development'

if (isDev() && props.name === undefined) {
  console.warn('[mk-motion] <MkCollapseItem> requires a `name` prop.')
}

const ctx = inject(collapseContextKey, null)
if (ctx) {
  ctx.registerItem({
    name: props.name,
    title: props.title,
    disabled: props.disabled,
  })
}

onUnmounted(() => {
  ctx?.unregisterItem(props.name)
})

const isActive = computed(() => ctx?.isActive(props.name) ?? false)

const contentRef = ref<HTMLDivElement | null>(null)
const innerRef = ref<HTMLDivElement | null>(null)
const maxHeight = ref('0px')

async function updateMaxHeight() {
  await nextTick()
  if (isActive.value && innerRef.value) {
    maxHeight.value = `${innerRef.value.scrollHeight}px`
  } else {
    maxHeight.value = '0px'
  }
}

watch(isActive, updateMaxHeight, { immediate: true })

const instanceId = `mk-collapse-${++collapseIdCounter}`
const headerId = `${instanceId}-header`
const contentId = `${instanceId}-content`

function toggle() {
  ctx?.toggle(props.name, props.disabled)
}
</script>

<template>
  <div
    class="mk-collapse__item"
    :class="{ 'is-active': isActive, 'is-disabled': disabled }"
  >
    <div
      :id="headerId"
      class="mk-collapse__header"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-expanded="isActive"
      :aria-controls="contentId"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <span class="mk-collapse__title">
        <slot name="title">{{ title }}</slot>
      </span>
      <span
        class="mk-collapse__arrow"
        :class="{ 'is-expanded': isActive }"
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
      :id="contentId"
      ref="contentRef"
      class="mk-collapse__content"
      role="region"
      :aria-labelledby="headerId"
      :style="{ maxHeight }"
    >
      <div ref="innerRef" class="mk-collapse__inner">
        <slot />
      </div>
    </div>
  </div>
</template>
