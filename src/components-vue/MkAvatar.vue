<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  src?: string
  text?: string
  size?: 'small' | 'default' | 'large'
  shape?: 'circle' | 'square'
  icon?: string
}>(), {
  size: 'default',
  shape: 'circle',
})

const error = ref(false)

const avatarClass = computed(() => {
  return [
    'mk-avatar',
    props.size !== 'default' ? `mk-avatar--${props.size}` : '',
    props.shape !== 'circle' ? `mk-avatar--${props.shape}` : '',
  ]
})

const fallbackText = computed(() => {
  if (props.icon) return props.icon
  if (props.text) {
    return props.text
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  return '?'
})

watch(() => props.src, () => {
  error.value = false
})

function onError() {
  error.value = true
}
</script>

<template>
  <div :class="avatarClass">
    <img
      v-if="src && !error"
      class="mk-avatar__image"
      :src="src"
      :alt="text || ''"
      @error="onError"
    >
    <span v-else class="mk-avatar__fallback">{{ fallbackText }}</span>
  </div>
</template>

<style>
.mk-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: var(--mk-text-sm);
  font-weight: var(--mk-font-medium);
  color: var(--mk-text);
  background: var(--mk-surface-raised);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-full);
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;
}

.mk-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mk-avatar__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: inherit;
  font-weight: var(--mk-font-semibold);
  color: var(--mk-text-secondary);
  background: var(--mk-surface-hover);
}

.mk-avatar--small {
  width: 28px;
  height: 28px;
  font-size: var(--mk-text-xs);
}

.mk-avatar--large {
  width: 56px;
  height: 56px;
  font-size: var(--mk-text-md);
}

.mk-avatar--square {
  border-radius: var(--mk-radius);
}
</style>
