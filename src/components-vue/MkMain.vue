<script setup lang="ts">
</script>

<template>
  <main class="mk-main">
    <slot />
  </main>
</template>

<style>
.mk-main {
  flex: 1;
  box-sizing: border-box;
  padding: 24px;
  overflow: auto;
  min-width: 0;
  min-height: 0;
}
</style>
