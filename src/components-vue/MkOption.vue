<script setup lang="ts">
export interface OptionProps {
  label: string
  value: string | number
  disabled?: boolean
}

defineProps<OptionProps>()
</script>

<template>
  <!--
    MkOption is a marker component. It does not render anything by itself.
    MkSelect reads its props from the default slot and renders the options.
  -->
  <slot />
</template>
