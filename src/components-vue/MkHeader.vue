<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  height?: number | string
}>()

const headerStyle = computed(() => {
  if (props.height !== undefined) {
    return { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
  }
  return undefined
})
</script>

<template>
  <header class="mk-header" :style="headerStyle">
    <slot />
  </header>
</template>

<style>
.mk-header {
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  background: var(--mk-surface);
  border-bottom: 1px solid var(--mk-border);
}
</style>
