<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  formContextKey,
  type FormRule,
  validateValue,
} from './formInjection.js'

interface Props {
  prop?: string
  label?: string
  rules?: FormRule[]
}

const props = defineProps<Props>()

defineSlots<{
  default?: () => unknown
  label?: () => unknown
}>()

const form = inject(formContextKey, null)
const error = ref('')

const resolvedRules = computed(() => {
  const list: FormRule[] = []
  if (props.rules) list.push(...props.rules)
  if (props.prop && form?.rules?.[props.prop])
    list.push(...form.rules[props.prop])
  return list
})

const fieldValue = computed(() => {
  if (!props.prop || !form) return undefined
  return form.model[props.prop]
})

function validate(): string | undefined {
  if (!props.prop) return undefined
  const msg = validateValue(
    fieldValue.value,
    resolvedRules.value,
    props.label || props.prop
  )
  error.value = msg || ''
  return msg
}

function onInput(value: unknown) {
  if (props.prop && form) {
    form.updateFieldValue(props.prop, value)
  }
  if (error.value) validate()
}

function onBlur() {
  validate()
}

onMounted(() => {
  if (props.prop) form?.registerField(props.prop, validate)
})

onUnmounted(() => {
  if (props.prop) form?.unregisterField(props.prop)
})

watch(fieldValue, () => {
  if (error.value) validate()
})

const labelStyle = computed(() => {
  if (!form?.labelWidth) return undefined
  return { width: form.labelWidth, flexShrink: 0 }
})

const isHorizontal = computed(() => form?.layout === 'horizontal')
const labelAlign = computed(() => {
  const pos = form?.labelPosition
  if (pos === 'right') return 'right'
  if (pos === 'left') return 'left'
  return undefined
})
</script>

<template>
  <div
    class="mk-form-item"
    :class="{ 'is-error': error, 'mk-form-item--horizontal': isHorizontal }"
  >
    <label
      v-if="label || $slots.label"
      class="mk-form__label"
      :style="[labelStyle, labelAlign ? { textAlign: labelAlign } : {}]"
    >
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="mk-form__content">
      <slot
        :on-input="onInput"
        :on-blur="onBlur"
        :value="fieldValue"
        :error="error"
      />
      <span class="mk-form__error" :class="{ 'is-visible': error }">{{
        error
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.mk-form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 0;
}

.mk-form-item--horizontal {
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.mk-form-item--horizontal .mk-form__label {
  padding-top: 8px;
}

.mk-form-item.is-error :deep(.mk-input),
.mk-form-item.is-error :deep(textarea) {
  border-color: var(--mk-danger);
}

.mk-form__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--mk-text-secondary);
}

.mk-form__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.mk-form__error {
  font-size: 12px;
  color: var(--mk-danger);
  min-height: 16px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.mk-form__error.is-visible {
  opacity: 1;
}
</style>
