<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted, type VNode, Fragment } from 'vue'
import MkOption from './MkOption.vue'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | string[] | number[]
  options?: SelectOption[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  options: () => [],
  disabled: false,
  multiple: false,
  clearable: false,
  filterable: false,
  size: 'default',
})

if (
  (import.meta as { env?: { MODE?: string } }).env?.MODE === 'development' &&
  !Array.isArray(props.options)
) {
  console.warn(
    '[mk-motion] <MkSelect> expects `options` to be an array. ' +
      'Child <MkOption> components are also supported.'
  )
}

type ModelValue = string | number | (string | number)[] | undefined

const emit = defineEmits<{
  change: [value: ModelValue]
  focus: []
  blur: []
}>()

const modelValue = defineModel<ModelValue>('modelValue')

const slots = defineSlots<{
  default?: (props: { option: SelectOption; selected: boolean }) => unknown
  empty?: () => unknown
  prefix?: () => unknown
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const triggerRef = ref<HTMLDivElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

function isMkOption(vnode: VNode): boolean {
  const type = vnode.type
  return (
    typeof type === 'object' &&
    type !== null &&
    '__name' in type &&
    (type as Record<string, unknown>).__name === 'MkOption'
  )
}

function extractSlotOptions(vnodes: VNode[]): SelectOption[] {
  const result: SelectOption[] = []
  for (const vnode of vnodes) {
    if (!vnode) continue
    if (isMkOption(vnode)) {
      const p = (vnode.props ?? {}) as Record<string, unknown>
      result.push({
        label: String(p.label ?? ''),
        value: p.value as string | number,
        disabled: Boolean(p.disabled),
      })
    } else if (vnode.type === Fragment && Array.isArray(vnode.children)) {
      result.push(...extractSlotOptions(vnode.children as VNode[]))
    } else if (Array.isArray(vnode.children)) {
      result.push(...extractSlotOptions(vnode.children as VNode[]))
    }
  }
  return result
}

const slotOptions = computed(() => extractSlotOptions(slots.default?.() ?? []))

const allOptions = computed(() => [
  ...(props.options ?? []),
  ...slotOptions.value,
])

const filteredOptions = computed(() => {
  if (!props.filterable || !searchQuery.value) return allOptions.value
  const q = searchQuery.value.toLowerCase()
  return allOptions.value.filter((opt) => opt.label.toLowerCase().includes(q))
})

function isSelected(opt: SelectOption): boolean {
  if (props.multiple && Array.isArray(modelValue.value)) {
    return (modelValue.value as (string | number)[]).includes(opt.value)
  }
  return modelValue.value === opt.value
}

const displayLabel = computed(() => {
  if (
    props.multiple &&
    Array.isArray(modelValue.value) &&
    modelValue.value.length
  ) {
    const labels = modelValue.value
      .map((v) => allOptions.value.find((o) => o.value === v)?.label)
      .filter(Boolean)
    return labels.join(', ') || props.placeholder
  }
  const selected = allOptions.value.find((o) => o.value === modelValue.value)
  return selected?.label ?? props.placeholder
})

function open() {
  if (props.disabled) return
  isOpen.value = true
  if (props.filterable) {
    nextTick(() => searchInputRef.value?.focus())
  }
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
  emit('blur')
}

function toggle() {
  isOpen.value ? close() : open()
}

function onTriggerClick() {
  if (props.disabled) return
  if (props.filterable) open()
  else toggle()
}

function selectOption(opt: SelectOption) {
  if (opt.disabled || props.disabled) return
  let value: ModelValue
  if (props.multiple) {
    const current = Array.isArray(modelValue.value) ? [...modelValue.value] : []
    const idx = current.indexOf(opt.value)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(opt.value)
    value = current
  } else {
    value = opt.value
    close()
  }
  modelValue.value = value
  emit('change', value)
}

function clear(e: Event) {
  e.stopPropagation()
  const value = props.multiple ? [] : undefined
  modelValue.value = value
  emit('change', value)
}

function onClickOutside(e: MouseEvent) {
  if (!triggerRef.value?.contains(e.target as Node)) {
    close()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    toggle()
  } else if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!isOpen.value) open()
  }
}

watch(isOpen, (openValue) => {
  if (openValue) {
    document.addEventListener('click', onClickOutside, { capture: true })
    emit('focus')
  } else {
    document.removeEventListener('click', onClickOutside, { capture: true })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside, { capture: true })
})
</script>

<template>
  <div
    ref="triggerRef"
    class="mk-select"
    :class="{
      'is-filterable': filterable,
      'is-open': isOpen,
      'is-disabled': disabled,
      [`mk-select--${size}`]: true,
    }"
  >
    <div
      class="mk-select__trigger"
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :tabindex="disabled ? -1 : 0"
      @click="onTriggerClick"
      @keydown="onKeydown"
    >
      <slot name="prefix" />
      <span
        v-if="!filterable || !isOpen"
        class="mk-select__label"
        :class="{
          'mk-select__placeholder':
            !modelValue || (Array.isArray(modelValue) && !modelValue.length),
        }"
      >
        {{ displayLabel }}
      </span>
      <input
        v-if="filterable"
        ref="searchInputRef"
        v-model="searchQuery"
        type="text"
        class="mk-select__search-input"
        :placeholder="displayLabel"
        :style="{ display: isOpen ? 'block' : 'none' }"
        @click.stop
        @keydown.esc="close"
      />
      <span class="mk-select__arrow">▼</span>
      <span
        v-if="
          clearable &&
          modelValue !== undefined &&
          modelValue !== '' &&
          (!Array.isArray(modelValue) || modelValue.length)
        "
        class="mk-select__clear"
        @click.stop="clear"
      >
        ✕
      </span>
    </div>

    <Transition name="mk-select-fade">
      <div v-show="isOpen" class="mk-select__dropdown" role="listbox">
        <div
          v-for="opt in filteredOptions"
          :key="opt.value"
          class="mk-select__option"
          role="option"
          :aria-selected="isSelected(opt)"
          :class="{
            'is-selected': isSelected(opt),
            'is-disabled': opt.disabled,
          }"
          @click="selectOption(opt)"
        >
          <slot :option="opt" :selected="isSelected(opt)">
            <span class="mk-select__check" v-if="multiple && isSelected(opt)"
              >✓</span
            >
            {{ opt.label }}
          </slot>
        </div>
        <div v-if="!filteredOptions.length" class="mk-select__empty">
          <slot name="empty">无匹配数据</slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mk-select {
  position: relative;
  display: inline-flex;
  width: 100%;
  max-width: 320px;
}

.mk-select__trigger {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 12px;
  font-size: 13px;
  color: var(--mk-text);
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
  transition: var(--mk-transition);
  user-select: none;
  position: relative;
}

.mk-select__trigger:hover {
  border-color: var(--mk-border-hover);
}

.mk-select__trigger.is-open {
  border-color: var(--mk-primary);
}

.mk-select__trigger.is-disabled {
  background: var(--mk-bg-disabled);
  color: var(--mk-text-tertiary);
  cursor: not-allowed;
  border-color: var(--mk-border);
}

.mk-select__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mk-select__placeholder {
  color: var(--mk-text-tertiary);
}

.mk-select__arrow {
  position: absolute;
  right: 10px;
  color: var(--mk-text-tertiary);
  font-size: 10px;
  transition: transform 0.2s;
}

.mk-select__trigger.is-open .mk-select__arrow {
  transform: rotate(180deg);
}

.mk-select__clear {
  position: absolute;
  right: 24px;
  color: var(--mk-text-tertiary);
  font-size: 10px;
  cursor: pointer;
  padding: 2px;
}

.mk-select__clear:hover {
  color: var(--mk-text);
}

.mk-select__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: var(--mk-shadow-lg);
}

.mk-select__option {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--mk-text);
  cursor: pointer;
  transition: var(--mk-transition);
  display: flex;
  align-items: center;
  gap: 8px;
}

.mk-select__option:hover {
  background: var(--mk-surface-hover);
}

.mk-select__option.is-selected {
  background: var(--mk-primary-soft);
  color: var(--mk-primary);
}

.mk-select__option.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.mk-select__check {
  font-size: 11px;
  color: var(--mk-primary);
}

.mk-select__search-input {
  position: absolute;
  top: 0;
  left: 0;
  right: 32px;
  bottom: 0;
  width: calc(100% - 32px);
  height: 100%;
  padding: 0 12px;
  font-size: 13px;
  color: var(--mk-text);
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
}

.mk-select__search-input::placeholder {
  color: var(--mk-text-tertiary);
}

.mk-select__empty {
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: var(--mk-text-tertiary);
}

.mk-select-fade-enter-active,
.mk-select-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.mk-select-fade-enter-from,
.mk-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.mk-select--small .mk-select__trigger {
  height: 28px;
  padding: 0 28px 0 10px;
  font-size: 12px;
}

.mk-select--small .mk-select__search-input {
  right: 28px;
  padding: 0 10px;
  font-size: 12px;
}

.mk-select--small .mk-select__arrow {
  right: 8px;
}

.mk-select--small .mk-select__clear {
  right: 20px;
}

.mk-select--large .mk-select__trigger {
  height: 44px;
  padding: 0 40px 0 14px;
  font-size: 14px;
}

.mk-select--large .mk-select__search-input {
  right: 40px;
  padding: 0 14px;
  font-size: 14px;
}

.mk-select--large .mk-select__arrow {
  right: 12px;
}

.mk-select--large .mk-select__clear {
  right: 28px;
}
</style>
