<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    direction?: 'horizontal' | 'vertical'
    dashed?: boolean
  }>(),
  {
    direction: 'horizontal',
  }
)

const dividerClass = computed(() => {
  return [
    'mk-divider',
    `mk-divider--${props.direction}`,
    props.dashed ? 'mk-divider--dashed' : '',
  ]
})
</script>

<template>
  <div :class="dividerClass">
    {{ text }}
  </div>
</template>

<style>
.mk-divider {
  display: flex;
  align-items: center;
  color: var(--mk-text-tertiary);
  font-size: 13px;
  margin: 16px 0;
}

.mk-divider::before,
.mk-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--mk-border);
}

.mk-divider--horizontal::before {
  margin-right: 12px;
}
.mk-divider--horizontal::after {
  margin-left: 12px;
}

.mk-divider--vertical {
  display: inline-block;
  width: 1px;
  height: 1em;
  background: var(--mk-border);
  margin: 0 8px;
  vertical-align: middle;
}

.mk-divider--dashed::before,
.mk-divider--dashed::after {
  background: repeating-linear-gradient(
    90deg,
    var(--mk-border),
    var(--mk-border) 4px,
    transparent 4px,
    transparent 8px
  );
}
</style>
