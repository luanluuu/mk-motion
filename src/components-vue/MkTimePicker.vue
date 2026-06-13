<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  format?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  format: 'HH:mm:ss',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function parseTime(value: string): { h: number; m: number; s: number } {
  const parts = value.split(':').map((v) => parseInt(v, 10))
  return {
    h: Math.max(0, Math.min(23, parts[0] || 0)),
    m: Math.max(0, Math.min(59, parts[1] || 0)),
    s: Math.max(0, Math.min(59, parts[2] || 0)),
  }
}

function formatTime(h: number, m: number, s: number, fmt: string): string {
  return fmt.replace('HH', pad(h)).replace('mm', pad(m)).replace('ss', pad(s))
}

const innerValue = computed(() => props.modelValue || '')
const parsed = computed(() =>
  innerValue.value ? parseTime(innerValue.value) : { h: 0, m: 0, s: 0 }
)

const isOpen = ref(false)
const pickerRef = ref<HTMLDivElement | null>(null)
const hourListRef = ref<HTMLDivElement | null>(null)
const minuteListRef = ref<HTMLDivElement | null>(null)
const secondListRef = ref<HTMLDivElement | null>(null)

const showSeconds = computed(() => props.format.includes('ss'))
const showMinutes = computed(() => props.format.includes('mm'))

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)
const seconds = Array.from({ length: 60 }, (_, i) => i)

function open() {
  if (props.disabled) return
  isOpen.value = true
  nextTick(() => scrollToSelected())
}

function close() {
  isOpen.value = false
}

function updateValue(h: number, m: number, s: number) {
  const str = formatTime(h, m, s, props.format)
  emit('update:modelValue', str)
  emit('change', str)
}

function onSelect(type: 'h' | 'm' | 's', val: number) {
  const { h, m, s } = parsed.value
  const next = { h, m, s }
  if (type === 'h') next.h = val
  if (type === 'm') next.m = val
  if (type === 's') next.s = val
  updateValue(next.h, next.m, next.s)
}

function scrollToSelected() {
  const scroll = (el: HTMLDivElement | null, val: number) => {
    if (!el) return
    const item = el.querySelector(`[data-value="${val}"]`) as HTMLElement | null
    if (item) item.scrollIntoView({ block: 'center' })
  }
  scroll(hourListRef.value, parsed.value.h)
  scroll(minuteListRef.value, parsed.value.m)
  scroll(secondListRef.value, parsed.value.s)
}

function onClickOutside(e: MouseEvent) {
  if (!pickerRef.value?.contains(e.target as Node)) {
    close()
  }
}

watch(isOpen, (openValue) => {
  if (openValue)
    document.addEventListener('click', onClickOutside, { capture: true })
  else document.removeEventListener('click', onClickOutside, { capture: true })
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside, { capture: true })
})

onMounted(() => {
  if (isOpen.value) scrollToSelected()
})
</script>

<template>
  <div
    ref="pickerRef"
    class="mk-timepicker"
    :class="{ 'is-disabled': disabled }"
  >
    <input
      type="text"
      class="mk-timepicker__input"
      :placeholder="placeholder || ''"
      :value="innerValue"
      readonly
      :disabled="disabled"
      @click="open"
    />

    <Transition name="mk-timepicker-fade">
      <div v-show="isOpen" class="mk-timepicker__panel">
        <div class="mk-timepicker__column">
          <div class="mk-timepicker__column-header">时</div>
          <div ref="hourListRef" class="mk-timepicker__column-list">
            <div
              v-for="h in hours"
              :key="h"
              class="mk-timepicker__item"
              :data-value="h"
              :class="{ 'is-selected': h === parsed.h }"
              @click.stop="onSelect('h', h)"
            >
              {{ pad(h) }}
            </div>
          </div>
        </div>

        <div v-if="showMinutes" class="mk-timepicker__column">
          <div class="mk-timepicker__column-header">分</div>
          <div ref="minuteListRef" class="mk-timepicker__column-list">
            <div
              v-for="m in minutes"
              :key="m"
              class="mk-timepicker__item"
              :data-value="m"
              :class="{ 'is-selected': m === parsed.m }"
              @click.stop="onSelect('m', m)"
            >
              {{ pad(m) }}
            </div>
          </div>
        </div>

        <div v-if="showSeconds" class="mk-timepicker__column">
          <div class="mk-timepicker__column-header">秒</div>
          <div ref="secondListRef" class="mk-timepicker__column-list">
            <div
              v-for="s in seconds"
              :key="s"
              class="mk-timepicker__item"
              :data-value="s"
              :class="{ 'is-selected': s === parsed.s }"
              @click.stop="onSelect('s', s)"
            >
              {{ pad(s) }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mk-timepicker {
  position: relative;
  display: inline-flex;
  width: 100%;
  max-width: 160px;
}

.mk-timepicker__input {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 12px;
  font-size: 13px;
  color: var(--mk-text);
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  outline: none;
  transition: var(--mk-transition);
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12 6 12 12 16 14'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

.mk-timepicker__input:hover {
  border-color: var(--mk-border-hover);
}

.mk-timepicker__input:focus {
  border-color: var(--mk-primary);
}

.mk-timepicker.is-disabled .mk-timepicker__input {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--mk-bg);
}

.mk-timepicker__panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 200px;
  height: 200px;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  box-shadow: var(--mk-shadow-lg);
  z-index: var(--mk-z-dropdown, 1000);
  display: flex;
  padding: 8px 0;
}

.mk-timepicker__column {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mk-timepicker__column + .mk-timepicker__column {
  border-left: 1px solid var(--mk-border);
}

.mk-timepicker__column-header {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--mk-text-tertiary);
  padding: 4px 0;
  border-bottom: 1px solid var(--mk-border);
  flex-shrink: 0;
}

.mk-timepicker__column-list {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.mk-timepicker__column-list::-webkit-scrollbar {
  width: 4px;
}

.mk-timepicker__column-list::-webkit-scrollbar-thumb {
  background: var(--mk-border-active);
  border-radius: var(--mk-radius-full);
}

.mk-timepicker__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  font-size: 13px;
  color: var(--mk-text);
  cursor: pointer;
  transition: var(--mk-transition);
}

.mk-timepicker__item:hover {
  background: var(--mk-surface-hover);
}

.mk-timepicker__item.is-selected {
  background: var(--mk-primary);
  color: #fff;
  font-weight: 500;
}

.mk-timepicker-fade-enter-active,
.mk-timepicker-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.mk-timepicker-fade-enter-from,
.mk-timepicker-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
