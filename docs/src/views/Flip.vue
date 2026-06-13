<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderFlip } from '../pages/flip.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  if (pageContainer.value) {
    renderFlip(pageContainer.value)
  }
})
</script>
