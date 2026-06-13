<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { springHover } from '../motion/component-spring.ts'
import type { SpringOptions } from '../core/spring-engine.ts'
import { withMotion, type MotionOptions } from '../motion/component-motion.ts'

const props = withDefaults(
  defineProps<{
    title?: string
    shadow?: 'always' | 'hover' | 'never'
    loading?: boolean
    motion?: MotionOptions
    spring?: boolean | SpringOptions
  }>(),
  {
    shadow: 'never',
  }
)

const cardRef = ref<HTMLDivElement | null>(null)
let motionCtrl: { destroy: () => void } | null = null

const cardClass = computed(() => {
  const classes = ['mk-card']
  if (props.shadow === 'always') classes.push('is-always-shadow')
  if (props.shadow === 'hover') classes.push('is-hover-shadow')
  if (props.loading) classes.push('is-loading')
  return classes
})

onMounted(() => {
  if (!cardRef.value) return
  if (props.spring !== undefined && props.spring !== false) {
    const springOpts = props.spring === true ? undefined : props.spring
    motionCtrl = springHover(cardRef.value, {
      scale: 1.01,
      y: -4,
      shadow: true,
      spring: springOpts,
    })
  } else if (props.motion !== undefined) {
    motionCtrl = withMotion(cardRef.value, props.motion)
  } else {
    motionCtrl = springHover(cardRef.value, {
      scale: 1.01,
      y: -4,
      shadow: true,
    })
  }
})

onBeforeUnmount(() => {
  motionCtrl?.destroy()
})
</script>

<template>
  <div ref="cardRef" :class="cardClass">
    <div v-if="$slots.image" class="mk-card__image-wrap">
      <slot name="image" />
    </div>
    <div v-if="title || $slots.header" class="mk-card__header">
      <span v-if="title" class="mk-card__title">{{ title }}</span>
      <slot name="header" />
    </div>
    <div class="mk-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="mk-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
.mk-card {
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-lg);
  overflow: hidden;
  transition: var(--mk-transition);
}

.mk-card:hover {
  border-color: var(--mk-border-hover);
}

.mk-card__header {
  padding: 16px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mk-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--mk-text);
}

.mk-card__body {
  padding: 0 20px 16px;
  color: var(--mk-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.mk-card__footer {
  padding: 10px 20px;
  border-top: 1px solid var(--mk-border);
  color: var(--mk-text-tertiary);
  font-size: 12px;
}

.mk-card__image-wrap img,
.mk-card__image-wrap {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid var(--mk-border);
}

.mk-card.is-loading .mk-card__body {
  opacity: 0.4;
  pointer-events: none;
}
</style>
