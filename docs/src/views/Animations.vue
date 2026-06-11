<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderAnimations } from '../pages/animations.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  document.getElementById('toc')!.style.display = 'none'
  if (pageContainer.value) {
    renderAnimations(pageContainer.value)
  }
})
</script>
