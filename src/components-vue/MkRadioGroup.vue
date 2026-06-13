<script setup lang="ts">
import { provide, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
  }>(),
  {
    modelValue: undefined,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const modelValueRef = ref(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    modelValueRef.value = v
  }
)

function change(value: string | number) {
  modelValueRef.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

provide('mk-radio-group', {
  modelValue: modelValueRef,
  change,
  name: `mk-radio-group-${Math.random().toString(36).slice(2)}`,
})

function onKeydown(e: KeyboardEvent) {
  const labels = Array.from(
    (e.currentTarget as HTMLElement).querySelectorAll(
      '.mk-radio:not(.is-disabled)'
    )
  ) as HTMLElement[]
  const currentIndex = labels.findIndex(
    (el) => el.getAttribute('tabindex') === '0' || document.activeElement === el
  )
  let nextIndex = currentIndex
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault()
    nextIndex = (currentIndex - 1 + labels.length) % labels.length
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault()
    nextIndex = (currentIndex + 1) % labels.length
  }
  if (nextIndex !== currentIndex && labels[nextIndex]) {
    labels.forEach((el, i) =>
      el.setAttribute('tabindex', i === nextIndex ? '0' : '-1')
    )
    labels[nextIndex].focus()
    labels[nextIndex].click()
  }
}
</script>

<template>
  <div class="mk-radio-group" role="radiogroup" @keydown="onKeydown">
    <slot />
  </div>
</template>

<style>
.mk-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
