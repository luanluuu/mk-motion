<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  width?: number | string
}>()

const asideStyle = computed(() => {
  if (props.width !== undefined) {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    }
  }
  return undefined
})
</script>

<template>
  <aside class="mk-aside" :style="asideStyle">
    <slot />
  </aside>
</template>

<style>
.mk-aside {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 240px;
  overflow: auto;
  background: var(--mk-surface);
  border-right: 1px solid var(--mk-border);
}
</style>
