<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: number
    min?: number
    max?: number
    step?: number
    showValue?: boolean
  }>(),
  {
    modelValue: 0,
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const attrs = useAttrs()
const trackRef = ref<HTMLDivElement | null>(null)
const thumbRef = ref<HTMLDivElement | null>(null)
const dragging = ref(false)

const clampedValue = computed(() => {
  return Math.max(props.min, Math.min(props.max, props.modelValue ?? 0))
})

const percent = computed(() => {
  return (clampedValue.value - props.min) / (props.max - props.min)
})

function updateFromPosition(clientX: number) {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  const raw = props.min + p * (props.max - props.min)
  const stepped = Math.round(raw / props.step) * props.step
  const next = Math.max(props.min, Math.min(props.max, stepped))
  if (next !== props.modelValue) {
    emit('update:modelValue', next)
    emit('change', next)
  }
}

function onStart(clientX: number) {
  dragging.value = true
  updateFromPosition(clientX)
}

function onMove(clientX: number) {
  if (!dragging.value) return
  updateFromPosition(clientX)
}

function onEnd() {
  dragging.value = false
}

function adjustValue(delta: number) {
  const next = Math.max(
    props.min,
    Math.min(props.max, clampedValue.value + delta)
  )
  if (next !== props.modelValue) {
    emit('update:modelValue', next)
    emit('change', next)
  }
}

function onTrackClick(e: MouseEvent) {
  onStart(e.clientX)
}

function onThumbMouseDown(e: MouseEvent) {
  e.stopPropagation()
  onStart(e.clientX)
}

function onMouseMove(e: MouseEvent) {
  onMove(e.clientX)
}

function onTouchStart(e: TouchEvent) {
  onStart(e.touches[0].clientX)
}

function onTouchMove(e: TouchEvent) {
  onMove(e.touches[0].clientX)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    adjustValue(-props.step)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    adjustValue(props.step)
  } else if (e.key === 'Home') {
    e.preventDefault()
    emit('update:modelValue', props.min)
    emit('change', props.min)
  } else if (e.key === 'End') {
    e.preventDefault()
    emit('update:modelValue', props.max)
    emit('change', props.max)
  }
}
</script>

<template>
  <div class="mk-slider" :class="attrs.class" :style="attrs.style">
    <div
      ref="trackRef"
      class="mk-slider__track"
      @mousedown="onTrackClick"
      @touchstart="onTouchStart"
    >
      <div class="mk-slider__fill" :style="{ width: `${percent * 100}%` }" />
      <div
        ref="thumbRef"
        class="mk-slider__thumb"
        role="slider"
        tabindex="0"
        :aria-valuenow="clampedValue"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :style="{ left: `${percent * 100}%` }"
        @mousedown="onThumbMouseDown"
        @touchstart="onTouchStart"
        @keydown="onKeydown"
      />
    </div>
    <div v-if="showValue" class="mk-slider__value">{{ clampedValue }}</div>
  </div>
  <teleport to="body">
    <div
      v-if="dragging"
      style="
        position: fixed;
        inset: 0;
        z-index: 9999;
        user-select: none;
        background: transparent;
      "
      @mousemove="onMouseMove"
      @mouseup="onEnd"
      @touchend="onEnd"
      @touchmove="onTouchMove"
    />
  </teleport>
</template>

<style>
.mk-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.mk-slider__track {
  position: relative;
  flex: 1;
  height: 4px;
  background: var(--mk-border);
  border-radius: 2px;
  cursor: pointer;
}

.mk-slider__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--mk-primary);
  border-radius: 2px;
  pointer-events: none;
}

.mk-slider__thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: var(--mk-primary);
  border: 2px solid var(--mk-surface);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
  box-shadow: var(--mk-shadow-sm);
}

.mk-slider__thumb:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.mk-slider__thumb:active {
  cursor: grabbing;
}

.mk-slider__value {
  font-size: 13px;
  color: var(--mk-text-secondary);
  min-width: 32px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
