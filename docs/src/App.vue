<template>
  <DocLayout>
    <router-view v-slot="{ Component, route }">
      <Transition name="page-transition" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </router-view>
  </DocLayout>
</template>

<script setup lang="ts">
import DocLayout from './components/DocLayout.vue'
</script>

<style>
.page-transition-enter-from {
  opacity: 0;
  transform: translate3d(0, 14px, 0) scale(0.992);
  filter: blur(4px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translate3d(0, -8px, 0) scale(0.996);
  filter: blur(2px);
}

.page-transition-enter-active {
  transition:
    opacity 260ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform, filter;
}

.page-transition-leave-active {
  transition:
    opacity 170ms cubic-bezier(0.4, 0, 1, 1),
    transform 170ms cubic-bezier(0.4, 0, 1, 1),
    filter 170ms cubic-bezier(0.4, 0, 1, 1);
  will-change: opacity, transform, filter;
}

.page-transition-enter-to,
.page-transition-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  filter: blur(0);
}

@media (prefers-reduced-motion: reduce) {
  .page-transition-enter-active,
  .page-transition-leave-active {
    transition: none;
  }

  .page-transition-enter-from,
  .page-transition-leave-to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
