<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted } from 'vue'
import { tabsContextKey } from './tabs-context.js'

export interface TabPaneProps {
  label: string
  name?: string | number
  disabled?: boolean
}

const props = withDefaults(defineProps<TabPaneProps>(), {
  disabled: false,
})

const context = inject(tabsContextKey, null)

const paneKey = computed(() => props.name ?? props.label)
const isActive = computed(() => context?.activeKey.value === paneKey.value)

onMounted(() => {
  context?.registerPane({
    key: paneKey.value,
    label: props.label,
    disabled: props.disabled,
  })
})

onUnmounted(() => {
  context?.unregisterPane(paneKey.value)
})
</script>

<template>
  <div v-show="isActive" class="mk-tabs__panel" role="tabpanel">
    <slot />
  </div>
</template>
