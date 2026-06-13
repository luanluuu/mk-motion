<script setup lang="ts">
import { computed, provide } from 'vue'

const props = withDefaults(
  defineProps<{
    gutter?: number
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
    align?: 'top' | 'middle' | 'bottom'
    wrap?: boolean
  }>(),
  {
    wrap: true,
  }
)

const rowClass = computed(() => {
  return [
    'mk-row',
    props.justify ? `mk-row--justify-${props.justify}` : '',
    props.align ? `mk-row--align-${props.align}` : '',
    props.wrap === false ? 'mk-row--no-wrap' : '',
  ]
})

const rowStyle = computed(() => {
  if (props.gutter) {
    return { margin: `0 -${props.gutter / 2}px` }
  }
  return undefined
})

provide('mk-row-gutter', props.gutter || 0)
</script>

<template>
  <div :class="rowClass" :style="rowStyle">
    <slot />
  </div>
</template>

<style>
.mk-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;
}

.mk-row--no-wrap {
  flex-wrap: nowrap;
}
.mk-row--justify-start {
  justify-content: flex-start;
}
.mk-row--justify-center {
  justify-content: center;
}
.mk-row--justify-end {
  justify-content: flex-end;
}
.mk-row--justify-space-between {
  justify-content: space-between;
}
.mk-row--justify-space-around {
  justify-content: space-around;
}
.mk-row--align-top {
  align-items: flex-start;
}
.mk-row--align-middle {
  align-items: center;
}
.mk-row--align-bottom {
  align-items: flex-end;
}
</style>
