<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    disabled?: boolean
    activeText?: string
    inactiveText?: string
  }>(),
  {
    modelValue: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const switchRef = ref<HTMLLabelElement | null>(null)

const switchClass = computed(() => {
  return [
    'mk-switch',
    props.modelValue ? 'is-checked' : '',
    props.disabled ? 'is-disabled' : '',
  ]
})

function toggle() {
  if (props.disabled) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle()
  }
}
</script>

<template>
  <label
    ref="switchRef"
    :class="switchClass"
    role="switch"
    :aria-checked="modelValue"
    :tabindex="disabled ? undefined : 0"
    @click="toggle"
    @keydown="onKeydown"
  >
    <span
      v-if="inactiveText"
      class="mk-switch__label"
      :class="{ 'mk-switch__label--active': !modelValue }"
      >{{ inactiveText }}</span
    >
    <span class="mk-switch__core" />
    <span
      v-if="activeText"
      class="mk-switch__label"
      :class="{ 'mk-switch__label--active': modelValue }"
      >{{ activeText }}</span
    >
  </label>
</template>

<style>
.mk-switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.mk-switch__core {
  position: relative;
  width: 40px;
  height: 22px;
  background: var(--mk-surface-hover);
  border: 1px solid var(--mk-border);
  border-radius: 11px;
  transition: var(--mk-transition);
  flex-shrink: 0;
}

.mk-switch__core::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: var(--mk-text-secondary);
  border-radius: 50%;
  transition: var(--mk-transition);
}

.mk-switch.is-checked .mk-switch__core {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
}
.mk-switch.is-checked .mk-switch__core::after {
  transform: translateX(18px);
  background: #fff;
}

.mk-switch__label {
  font-size: 13px;
  color: var(--mk-text-secondary);
  transition: color 0.2s;
}
.mk-switch.is-checked .mk-switch__label--active {
  color: var(--mk-text);
}

.mk-switch.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
