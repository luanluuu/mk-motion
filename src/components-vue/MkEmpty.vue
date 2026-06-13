<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    description?: string
    image?: string | 'default'
    imageStyle?: Record<string, string>
  }>(),
  {
    image: 'default',
  }
)

const defaultSvg = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="30" width="80" height="60" rx="8" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
  <circle cx="45" cy="55" r="8" fill="currentColor" opacity="0.2"/>
  <rect x="60" y="48" width="28" height="4" rx="2" fill="currentColor" opacity="0.2"/>
  <rect x="60" y="58" width="20" height="4" rx="2" fill="currentColor" opacity="0.15"/>
  <line x1="35" y1="82" x2="85" y2="82" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.15"/>
  <line x1="45" y1="90" x2="75" y2="90" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.1"/>
</svg>`

const isDefault = computed(() => props.image === 'default')
const imageSrc = computed(() =>
  props.image !== 'default' ? props.image : undefined
)
</script>

<template>
  <div class="mk-empty">
    <div class="mk-empty__image" :style="imageStyle">
      <template v-if="isDefault">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="defaultSvg" />
      </template>
      <img v-else-if="imageSrc" :src="imageSrc" alt="" />
      <slot name="image" />
    </div>
    <p v-if="description" class="mk-empty__description">{{ description }}</p>
    <slot />
  </div>
</template>

<style>
.mk-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--mk-space-8) var(--mk-space-4);
  text-align: center;
  color: var(--mk-text-tertiary);
}

.mk-empty__image {
  width: 120px;
  height: 120px;
  margin-bottom: var(--mk-space-4);
  color: var(--mk-text-tertiary);
  opacity: 0.8;
}

.mk-empty__image svg {
  width: 100%;
  height: 100%;
}

.mk-empty__image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mk-empty__description {
  margin: 0;
  font-size: var(--mk-text-sm);
  font-weight: var(--mk-font-medium);
  line-height: var(--mk-leading-normal);
  color: var(--mk-text-secondary);
}
</style>
