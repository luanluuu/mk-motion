<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderApiStability } from '../pages/api-stability.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  document.getElementById('toc')!.style.display = 'none'
  if (pageContainer.value) {
    renderApiStability(pageContainer.value)
  }
})
</script>
