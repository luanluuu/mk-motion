<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { withMotion, type MotionOptions } from '../motion/component-motion.ts'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    type?: string
    disabled?: boolean
    clearable?: boolean
    showPassword?: boolean
    validate?: (value: string) => string | null
    motion?: MotionOptions
  }>(),
  {
    modelValue: '',
    type: 'text',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [value: string]
  enter: [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const errorMsg = ref('')
const isSuccess = ref(false)
const showPwd = ref(false)
const inputId = `mk-input-${Math.random().toString(36).slice(2)}`
let motionCtrl: { destroy: () => void } | null = null

const inputType = computed(() => {
  if (props.showPassword && props.type === 'password') {
    return showPwd.value ? 'text' : 'password'
  }
  return props.type
})

const wrapperClass = computed(() => {
  return [
    'mk-input-wrapper',
    errorMsg.value ? 'is-error' : '',
    isSuccess.value && !errorMsg.value ? 'is-success' : '',
  ]
})

function onInput() {
  const value = inputRef.value?.value ?? ''
  emit('update:modelValue', value)
  emit('input', value)
  clearError()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    emit('enter', inputRef.value?.value ?? '')
  }
}

function onBlur() {
  validate()
}

function clear() {
  if (inputRef.value) {
    inputRef.value.value = ''
    inputRef.value.focus()
  }
  emit('update:modelValue', '')
  emit('input', '')
  clearError()
}

function validate(): boolean {
  const value = inputRef.value?.value ?? ''
  if (!props.validate) return true
  const error = props.validate(value)
  if (error) {
    showError(error)
    return false
  }
  clearError()
  return true
}

function showError(msg: string) {
  errorMsg.value = msg
  isSuccess.value = false
}

function showSuccess() {
  isSuccess.value = true
  errorMsg.value = ''
}

function clearError() {
  errorMsg.value = ''
}

function focus() {
  inputRef.value?.focus()
}

watch(
  () => props.modelValue,
  (v) => {
    if (inputRef.value && inputRef.value.value !== v) {
      inputRef.value.value = v ?? ''
    }
  }
)

onMounted(() => {
  if (inputRef.value) {
    motionCtrl = withMotion(
      inputRef.value,
      props.motion || { focus: 'ring', enter: 'fadeIn', duration: 200 }
    )
  }
})

onBeforeUnmount(() => {
  motionCtrl?.destroy()
})

defineExpose({ focus, validate, showError, showSuccess, clearError })
</script>

<template>
  <div :class="wrapperClass">
    <input
      :id="inputId"
      ref="inputRef"
      :type="inputType"
      class="mk-input"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      :aria-invalid="errorMsg ? 'true' : undefined"
      :aria-describedby="errorMsg ? `${inputId}-error` : undefined"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
    />
    <span class="mk-input__suffix">
      <span
        v-if="clearable && modelValue"
        class="mk-input__suffix-item mk-input__clear"
        @click="clear"
        >✕</span
      >
      <span
        v-if="showPassword && type === 'password'"
        class="mk-input__suffix-item"
        :title="showPwd ? '隐藏密码' : '显示密码'"
        @click="showPwd = !showPwd"
        >{{ showPwd ? '🙈' : '👁' }}</span
      >
    </span>
    <span
      :id="`${inputId}-error`"
      class="mk-input__errormsg"
      :class="{ show: errorMsg }"
      >{{ errorMsg }}</span
    >
  </div>
</template>

<style>
.mk-input-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
  max-width: 320px;
  align-items: center;
}

.mk-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--mk-text);
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  outline: none;
  transition: var(--mk-transition);
}

.mk-input::placeholder {
  color: var(--mk-text-tertiary);
}

.mk-input:hover {
  border-color: var(--mk-border-hover);
}

.mk-input:focus {
  border-color: var(--mk-primary);
}

.mk-input-wrapper.is-error .mk-input {
  border-color: var(--mk-danger);
  animation: mk-input-shake 0.3s ease;
}

.mk-input-wrapper.is-success .mk-input {
  border-color: var(--mk-success);
}

.mk-input__suffix {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--mk-text-tertiary);
}

.mk-input__suffix-item {
  cursor: pointer;
  font-size: 13px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: var(--mk-transition);
}
.mk-input__suffix-item:hover {
  color: var(--mk-text);
  background: var(--mk-surface-hover);
}

.mk-input__clear {
  opacity: 0;
  transition: opacity 0.2s;
}
.mk-input-wrapper:hover .mk-input__clear,
.mk-input:focus ~ .mk-input__suffix .mk-input__clear {
  opacity: 1;
}

.mk-input__errormsg {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 12px;
  color: var(--mk-danger);
  opacity: 0;
  transform: translateY(-2px);
  transition: var(--mk-transition);
}
.mk-input__errormsg.show {
  opacity: 1;
  transform: translateY(0);
}

@keyframes mk-input-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}
</style>
