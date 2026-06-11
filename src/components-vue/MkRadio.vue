<script setup lang="ts">
import { computed, inject } from 'vue'

export interface RadioProps {
  label?: string
  value: string | number
  disabled?: boolean
}

const props = defineProps<RadioProps>()

const group = inject<{
  modelValue: import('vue').Ref<string | number | undefined>
  change: (value: string | number) => void
  name: string
}>('mk-radio-group', undefined as any)

const checked = computed(() => group?.modelValue.value === props.value)

const radioClass = computed(() => {
  return [
    'mk-radio',
    checked.value ? 'is-checked' : '',
    props.disabled ? 'is-disabled' : '',
  ]
})

function handleClick() {
  if (props.disabled) return
  group?.change(props.value)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <label
    :class="radioClass"
    role="radio"
    :aria-checked="checked"
    :tabindex="disabled ? undefined : 0"
    @click="handleClick"
    @keydown="onKeydown"
  >
    <span class="mk-radio__input">
      <span class="mk-radio__dot" />
    </span>
    <span v-if="label">{{ label }}</span>
    <slot />
  </label>
</template>

<style>
.mk-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--mk-text);
}

.mk-radio__input {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--mk-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--mk-transition);
  flex-shrink: 0;
  background: var(--mk-surface);
}

.mk-radio:hover .mk-radio__input {
  border-color: var(--mk-border-hover);
}

.mk-radio.is-checked .mk-radio__input {
  border-color: var(--mk-primary);
}

.mk-radio__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mk-primary);
  opacity: 0;
  transform: scale(0);
  transition: all 0.15s ease;
}

.mk-radio.is-checked .mk-radio__dot {
  opacity: 1;
  transform: scale(1);
}

.mk-radio.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
