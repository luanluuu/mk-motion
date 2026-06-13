<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    direction?: 'horizontal' | 'vertical'
    size?: 'small' | 'default' | 'large'
    wrap?: boolean
  }>(),
  {
    direction: 'horizontal',
    size: 'default',
    wrap: true,
  }
)

const spaceClass = computed(() => {
  return [
    'mk-space',
    props.direction === 'vertical' ? 'mk-space--vertical' : '',
    `mk-space--${props.size}`,
    props.wrap ? 'mk-space--wrap' : 'mk-space--nowrap',
  ]
})
</script>

<template>
  <div :class="spaceClass">
    <slot />
  </div>
</template>

<style>
.mk-space {
  display: inline-flex;
  align-items: center;
}

.mk-space--vertical {
  flex-direction: column;
}

.mk-space--small {
  gap: 4px;
}
.mk-space--default {
  gap: 8px;
}
.mk-space--large {
  gap: 16px;
}

.mk-space--wrap {
  flex-wrap: wrap;
}
.mk-space--nowrap {
  flex-wrap: nowrap;
}
</style>
