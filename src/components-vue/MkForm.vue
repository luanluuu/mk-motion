<script setup lang="ts">
import { provide, reactive } from 'vue'
import { formContextKey, type FormContext, type FormRule } from './formInjection.js'

interface Props {
  model: Record<string, any>
  rules?: Record<string, FormRule[]>
  layout?: 'vertical' | 'horizontal' | 'inline'
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
})

const emit = defineEmits<{
  submit: [values: Record<string, any>]
  validate: [errors: Record<string, string>]
}>()

const model = defineModel<Record<string, any>>('model', { required: true })

defineSlots<{
  default?: () => any
}>()

const fields = reactive<Map<string, () => string | undefined>>(new Map())
const errors = reactive<Record<string, string>>({})

function registerField(prop: string, validate: () => string | undefined) {
  fields.set(prop, validate)
}

function unregisterField(prop: string) {
  fields.delete(prop)
}

function updateFieldValue(prop: string, value: any) {
  const next = { ...model.value, [prop]: value }
  model.value = next
}

function validateField(prop: string): string | undefined {
  const validate = fields.get(prop)
  if (!validate) return undefined
  const msg = validate()
  if (msg) errors[prop] = msg
  else delete errors[prop]
  return msg
}

function validateAll(): Record<string, string> {
  const result: Record<string, string> = {}
  fields.forEach((validate, prop) => {
    const msg = validate()
    if (msg) result[prop] = msg
  })
  Object.assign(errors, result)
  // clean old resolved errors
  Object.keys(errors).forEach((key) => {
    if (!result[key]) delete errors[key]
  })
  return result
}

function onSubmit(e: Event) {
  e.preventDefault()
  const result = validateAll()
  emit('validate', { ...result })
  if (Object.keys(result).length === 0) {
    emit('submit', { ...model.value })
  }
}

const context = reactive<FormContext>({
  get model() { return model.value },
  get rules() { return props.rules },
  get labelWidth() { return props.labelWidth },
  get labelPosition() { return props.labelPosition },
  get layout() { return props.layout },
  registerField,
  unregisterField,
  updateFieldValue,
})

provide(formContextKey, context)

defineExpose({ validate: validateAll, validateField })
</script>

<template>
  <form
    class="mk-form"
    :class="layout !== 'vertical' ? `mk-form--${layout}` : undefined"
    novalidate
    @submit="onSubmit"
  >
    <slot />
  </form>
</template>

<style scoped>
.mk-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.mk-form--horizontal {
  flex-direction: column;
}

.mk-form--inline {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 16px 24px;
}

.mk-form--inline :deep(.mk-form-item) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
}
</style>
