<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderGesture } from '../pages/gesture.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  if (pageContainer.value) {
    renderGesture(pageContainer.value)
  }
})
</script>
