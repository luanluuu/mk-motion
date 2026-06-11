<script setup lang="ts">
import { provide, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: (string | number)[]
}>(), {
  modelValue: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  change: [value: (string | number)[]]
}>()

const modelValueRef = ref<(string | number)[]>([...props.modelValue])

watch(() => props.modelValue, (v) => {
  modelValueRef.value = [...(v || [])]
}, { deep: true })

function change(value: string | number, checked: boolean) {
  const set = new Set(modelValueRef.value)
  if (checked) set.add(value)
  else set.delete(value)
  const next = Array.from(set)
  modelValueRef.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

provide('mk-checkbox-group', {
  modelValue: modelValueRef,
  change,
})
</script>

<template>
  <div class="mk-checkbox-group" role="group">
    <slot />
  </div>
</template>

<style>
.mk-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
