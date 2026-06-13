<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderNuxt } from '../pages/nuxt.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  if (pageContainer.value) {
    renderNuxt(pageContainer.value)
  }
})
</script>
