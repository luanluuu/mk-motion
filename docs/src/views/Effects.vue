<template>
  <div ref="pageContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { renderEffects } from '../pages/effects.js'

const pageContainer = ref<HTMLElement>()

onMounted(() => {
  if (pageContainer.value) {
    renderEffects(pageContainer.value)
  }
})
</script>
