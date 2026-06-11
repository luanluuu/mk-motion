<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderMotionSpec } from '../pages/motion-spec.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  document.getElementById('toc')!.style.display = 'none'
  if (pageContainer.value) {
    renderMotionSpec(pageContainer.value)
  }
})
</script>
