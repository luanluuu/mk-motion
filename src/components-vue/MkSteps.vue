<script setup lang="ts">
import { computed } from 'vue'

export type StepStatus = 'wait' | 'process' | 'finish' | 'error'
export type StepsDirection = 'horizontal' | 'vertical'
export type StepsSize = 'small' | 'default'

export interface StepItem {
  title: string
  description?: string
  icon?: string
  status?: StepStatus
}

export interface StepsProps {
  items: StepItem[]
  direction?: StepsDirection
  current?: number
  size?: StepsSize
}

const props = withDefaults(defineProps<StepsProps>(), {
  direction: 'horizontal',
  current: 0,
  size: 'default',
})

const emit = defineEmits<{
  change: [index: number]
}>()

const resolvedItems = computed(() =>
  props.items.map((item, index) => {
    const status = item.status ?? (index < props.current ? 'finish' : index === props.current ? 'process' : 'wait')
    return { ...item, status, index, isLast: index === props.items.length - 1 }
  })
)

const stepIcon = (item: StepItem, index: number) => {
  if (item.icon) return item.icon
  const status = item.status ?? (index < props.current ? 'finish' : index === props.current ? 'process' : 'wait')
  if (status === 'finish') return '✓'
  if (status === 'error') return '✕'
  return String(index + 1)
}

const onStepClick = (index: number) => {
  emit('change', index)
}
</script>

<template>
  <div class="mk-steps" :class="[`mk-steps--${direction}`, { 'mk-steps--small': size === 'small' }]">
    <div
      v-for="item in resolvedItems"
      :key="item.index"
      class="mk-step"
      :class="[`is-${item.status}`, { 'is-last': item.isLast }]"
      @click="onStepClick(item.index)"
    >
      <div class="mk-step__head">
        <div class="mk-step__line" />
        <div class="mk-step__icon">{{ stepIcon(item, item.index) }}</div>
      </div>
      <div class="mk-step__main">
        <div class="mk-step__title">{{ item.title }}</div>
        <div v-if="item.description" class="mk-step__description">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mk-steps {
  display: flex;
  width: 100%;
}

.mk-steps--horizontal {
  flex-direction: row;
}

.mk-steps--vertical {
  flex-direction: column;
}

.mk-step {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
}

.mk-steps--vertical .mk-step {
  flex-direction: row;
  align-items: flex-start;
  text-align: left;
  padding-bottom: 16px;
}

.mk-step__head {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mk-step__line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 1px;
  background: var(--mk-border);
  transform: translateY(-50%);
  z-index: 0;
}

.mk-steps--vertical .mk-step__line {
  top: 30px;
  left: 15px;
  width: 1px;
  height: 100%;
  transform: none;
}

.mk-step.is-last .mk-step__line {
  display: none;
}

.mk-step.is-finish .mk-step__line {
  background: var(--mk-primary);
}

.mk-step__icon {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: var(--mk-surface);
  border: 2px solid var(--mk-border);
  color: var(--mk-text-tertiary);
  transition: var(--mk-transition-colors);
}

.mk-step.is-process .mk-step__icon {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
  color: var(--mk-text-inverse);
  box-shadow: 0 0 0 4px var(--mk-primary-muted);
}

.mk-step.is-finish .mk-step__icon {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
  color: var(--mk-text-inverse);
}

.mk-step.is-error .mk-step__icon {
  background: var(--mk-danger);
  border-color: var(--mk-danger);
  color: var(--mk-text-inverse);
}

.mk-step__main {
  margin-top: 8px;
}

.mk-steps--vertical .mk-step__main {
  margin-top: 0;
  margin-left: 12px;
}

.mk-step__title {
  font-size: var(--mk-text-sm);
  font-weight: var(--mk-font-medium);
  color: var(--mk-text);
}

.mk-step.is-wait .mk-step__title {
  color: var(--mk-text-tertiary);
}

.mk-step__description {
  font-size: var(--mk-text-xs);
  color: var(--mk-text-tertiary);
  margin-top: 4px;
}

.mk-steps--small .mk-step__icon {
  width: 22px;
  height: 22px;
  font-size: 10px;
}

.mk-steps--small .mk-step__title {
  font-size: var(--mk-text-xs);
}
</style>
