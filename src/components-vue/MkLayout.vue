<script setup lang="ts">
import { computed, provide } from 'vue'

const props = withDefaults(defineProps<{
  direction?: 'vertical' | 'horizontal'
}>(), {
  direction: 'vertical',
})

const layoutClass = computed(() => {
  return [
    'mk-layout',
    props.direction === 'horizontal' ? 'mk-layout--horizontal' : 'mk-layout--vertical',
  ]
})

provide('mk-layout-direction', props.direction)
</script>

<template>
  <section :class="layoutClass">
    <slot />
  </section>
</template>

<style>
.mk-layout {
  display: flex;
  flex: 1;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
}

.mk-layout--vertical {
  flex-direction: column;
}

.mk-layout--horizontal {
  flex-direction: row;
}
</style>
