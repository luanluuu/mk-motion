<script setup lang="ts">
import { computed } from 'vue'

export interface TeleportProps {
  /**
   * Teleport target. Use `false` to disable teleport and render inline.
   * @default 'body'
   */
  to?: string | HTMLElement | false
  /**
   * Disable teleport even when `to` is provided.
   * @default false
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<TeleportProps>(), {
  to: 'body',
  disabled: false,
})

const target = computed(() => (props.to === false ? undefined : props.to))
const isDisabled = computed(() => props.disabled || !target.value)
</script>

<template>
  <Teleport :to="target" :disabled="isDisabled">
    <slot />
  </Teleport>
</template>
