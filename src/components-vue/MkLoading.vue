<script setup lang="ts">
export interface LoadingProps {
  loading?: boolean
  text?: string
  fullscreen?: boolean
}

withDefaults(defineProps<LoadingProps>(), {
  loading: false,
  text: '',
  fullscreen: false,
})
</script>

<template>
  <div class="mk-loading" :class="{ 'is-fullscreen': fullscreen }">
    <slot />
    <Transition name="mk-loading-fade">
      <div
        v-if="loading"
        class="mk-loading-mask"
        :class="{ 'is-fullscreen': fullscreen }"
      >
        <div class="mk-loading__spinner" />
        <div v-if="text" class="mk-loading__text">{{ text }}</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mk-loading {
  position: relative;
}

.mk-loading-mask {
  position: absolute;
  inset: 0;
  background: var(--mk-overlay-heavy);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: inherit;
  flex-direction: column;
  gap: 10px;
}

.mk-loading-mask.is-fullscreen {
  position: fixed;
  background: var(--mk-overlay-heavy);
  z-index: 9999;
  border-radius: 0;
}

.mk-loading__spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--mk-border);
  border-top-color: var(--mk-primary);
  border-radius: 50%;
  animation: mk-spin 0.7s linear infinite;
}

.mk-loading__text {
  font-size: 13px;
  color: var(--mk-text-secondary);
}

@keyframes mk-spin {
  to {
    transform: rotate(360deg);
  }
}

.mk-loading-fade-enter-active,
.mk-loading-fade-leave-active {
  transition: opacity var(--mk-duration-fast) var(--mk-ease-default);
}
.mk-loading-fade-enter-from,
.mk-loading-fade-leave-to {
  opacity: 0;
}
</style>
