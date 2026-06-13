<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderDevTools } from '../pages/devtools.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  if (pageContainer.value) {
    renderDevTools(pageContainer.value)
  }
})
</script>
