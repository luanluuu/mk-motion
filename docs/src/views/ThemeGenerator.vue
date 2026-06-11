<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderThemeGenerator } from '../pages/theme-generator.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  document.getElementById('toc')!.style.display = 'none'
  if (pageContainer.value) {
    renderThemeGenerator(pageContainer.value)
  }
})
</script>
