<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'line' | 'circle' | 'dashboard'
  percent?: number
  strokeWidth?: number
  color?: string
  status?: 'success' | 'exception' | 'active'
  showInfo?: boolean
}>(), {
  type: 'line',
  percent: 0,
  showInfo: true,
})

const progressClass = computed(() => {
  return [
    'mk-progress',
    `mk-progress--${props.type}`,
    props.status ? `is-${props.status}` : '',
    !props.showInfo ? 'is-hide-info' : '',
  ]
})

const clampedPercent = computed(() => Math.max(0, Math.min(100, props.percent ?? 0)))

const size = 120
const stroke = computed(() => props.strokeWidth || 6)
const radius = computed(() => (size - stroke.value) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const isDashboard = computed(() => props.type === 'dashboard')
const dashArray = computed(() => isDashboard.value ? circumference.value * 0.75 : circumference.value)
const dashOffset = computed(() => dashArray.value - (clampedPercent.value / 100) * dashArray.value)
const circleTransform = computed(() => isDashboard.value ? 'rotate(135deg)' : 'rotate(-90deg)')
</script>

<template>
  <div :class="progressClass">
    <template v-if="type === 'line'">
      <div class="mk-progress__track" :style="strokeWidth ? { height: `${strokeWidth}px` } : undefined">
        <div
          class="mk-progress__bar"
          :style="{ width: `${clampedPercent}%`, ...(color ? { background: color } : {}) }"
        />
      </div>
      <span v-if="showInfo" class="mk-progress__text">{{ Math.round(clampedPercent) }}%</span>
    </template>

    <template v-else>
      <svg
        class="mk-progress__svg"
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
      >
        <circle
          class="mk-progress__track-circle"
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :stroke-width="stroke"
          :style="{ transform: circleTransform, transformOrigin: '50% 50%' }"
        />
        <circle
          class="mk-progress__path-circle"
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :stroke-width="stroke"
          stroke-linecap="round"
          :stroke-dasharray="`${dashArray} ${circumference}`"
          :stroke-dashoffset="dashOffset"
          :style="{ transform: circleTransform, transformOrigin: '50% 50%', ...(color ? { stroke: color } : {}) }"
        />
      </svg>
      <span v-if="showInfo" class="mk-progress__text">{{ Math.round(clampedPercent) }}%</span>
    </template>
  </div>
</template>

<style>
.mk-progress {
  display: flex;
  align-items: center;
  gap: var(--mk-space-3);
  font-size: var(--mk-text-sm);
  color: var(--mk-text-secondary);
}
.mk-progress.is-hide-info {
  gap: 0;
}

.mk-progress--line {
  width: 100%;
}

.mk-progress__track {
  flex: 1;
  height: 8px;
  background: var(--mk-surface-hover);
  border-radius: var(--mk-radius-full);
  overflow: hidden;
}

.mk-progress__bar {
  height: 100%;
  background: var(--mk-primary);
  border-radius: var(--mk-radius-full);
  transition: width var(--mk-duration-slow) var(--mk-ease-out);
}

.mk-progress__text {
  min-width: 36px;
  text-align: right;
  font-size: var(--mk-text-sm);
  font-weight: var(--mk-font-medium);
  color: var(--mk-text-secondary);
  flex-shrink: 0;
}

.mk-progress.is-success .mk-progress__bar,
.mk-progress.is-success .mk-progress__path-circle {
  background: var(--mk-success);
  stroke: var(--mk-success);
}

.mk-progress.is-exception .mk-progress__bar,
.mk-progress.is-exception .mk-progress__path-circle {
  background: var(--mk-danger);
  stroke: var(--mk-danger);
}

.mk-progress.is-active .mk-progress__bar {
  background: var(--mk-primary);
  position: relative;
  overflow: hidden;
}

.mk-progress.is-active .mk-progress__bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.25) 50%,
    transparent 100%
  );
  animation: mk-progress-active 1.5s ease-in-out infinite;
}

@keyframes mk-progress-active {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.mk-progress--circle,
.mk-progress--dashboard {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
}

.mk-progress__svg {
  position: absolute;
  inset: 0;
}

.mk-progress__track-circle {
  stroke: var(--mk-surface-hover);
}

.mk-progress__path-circle {
  stroke: var(--mk-primary);
  transition: stroke-dashoffset var(--mk-duration-slow) var(--mk-ease-out);
}

.mk-progress--circle .mk-progress__text,
.mk-progress--dashboard .mk-progress__text {
  position: relative;
  z-index: 1;
  text-align: center;
  min-width: auto;
  font-size: var(--mk-text-md);
  font-weight: var(--mk-font-semibold);
  color: var(--mk-text);
}
</style>
