<script setup lang="ts">
import { computed, inject } from 'vue'

export interface CheckboxProps {
  label?: string
  value?: string | number
  disabled?: boolean
  indeterminate?: boolean
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  value: undefined,
  indeterminate: false,
})

const group = inject<{
  modelValue: import('vue').Ref<(string | number)[]>
  change: (value: string | number, checked: boolean) => void
}>('mk-checkbox-group', undefined as any)

const inGroup = !!group

const checked = computed(() => {
  if (inGroup && props.value !== undefined) {
    return group!.modelValue.value.includes(props.value)
  }
  return false
})

const checkboxClass = computed(() => {
  return [
    'mk-checkbox',
    checked.value ? 'is-checked' : '',
    props.indeterminate ? 'is-indeterminate' : '',
    props.disabled ? 'is-disabled' : '',
  ]
})

function toggle() {
  if (props.disabled) return
  if (inGroup && props.value !== undefined) {
    group!.change(props.value, !checked.value)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === ' ') {
    e.preventDefault()
    toggle()
  }
}
</script>

<template>
  <label
    :class="checkboxClass"
    role="checkbox"
    :aria-checked="indeterminate ? 'mixed' : checked"
    :tabindex="disabled ? undefined : 0"
    @click="toggle"
    @keydown="onKeydown"
  >
    <span class="mk-checkbox__input">
      <span class="mk-checkbox__check">✓</span>
    </span>
    <span v-if="label">{{ label }}</span>
    <slot />
  </label>
</template>

<style>
.mk-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--mk-text);
}

.mk-checkbox__input {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--mk-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--mk-transition);
  flex-shrink: 0;
  background: var(--mk-surface);
}

.mk-checkbox:hover .mk-checkbox__input {
  border-color: var(--mk-border-hover);
}

.mk-checkbox.is-checked .mk-checkbox__input {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
}

.mk-checkbox__check {
  color: var(--mk-text-inverse);
  font-size: 11px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.15s ease;
}

.mk-checkbox.is-checked .mk-checkbox__check {
  opacity: 1;
  transform: scale(1);
}

.mk-checkbox.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mk-checkbox.is-indeterminate .mk-checkbox__input {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
}

.mk-checkbox.is-indeterminate .mk-checkbox__check {
  opacity: 1;
  transform: scale(1);
  font-size: 0;
  width: 8px;
  height: 2px;
  background: var(--mk-text-inverse);
  border-radius: 1px;
  display: inline-block;
}
</style>
