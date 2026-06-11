<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderDesignTokens } from '../pages/design-tokens.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  document.getElementById('toc')!.style.display = 'none'
  if (pageContainer.value) {
    renderDesignTokens(pageContainer.value)
  }
})
</script>
