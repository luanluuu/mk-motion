<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    fluid?: boolean
    maxWidth?: number | string
    padding?: number | string
    centered?: boolean
  }>(),
  {
    centered: true,
  }
)

const containerClass = computed(() => {
  return [
    'mk-container',
    props.fluid ? 'mk-container--fluid' : '',
    props.centered !== false ? 'mk-container--centered' : '',
  ]
})

const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.maxWidth) {
    style.maxWidth =
      typeof props.maxWidth === 'number'
        ? `${props.maxWidth}px`
        : props.maxWidth
  }
  if (props.padding !== undefined) {
    style.padding =
      typeof props.padding === 'number' ? `${props.padding}px` : props.padding
  }
  return Object.keys(style).length ? style : undefined
})
</script>

<template>
  <div :class="containerClass" :style="containerStyle">
    <slot />
  </div>
</template>

<style>
.mk-container {
  width: 100%;
  max-width: 1200px;
  padding: 0 24px;
  margin: 0 auto;
  box-sizing: border-box;
}

.mk-container--fluid {
  max-width: none;
}

.mk-container--centered {
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .mk-container {
    padding: 0 16px;
  }
}

@media (min-width: 1024px) {
  .mk-container {
    padding: 0 32px;
  }
}

@media (min-width: 1440px) {
  .mk-container {
    padding: 0 48px;
  }
}
</style>
