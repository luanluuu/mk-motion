<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

interface Props {
  modelValue?: Date | string
  placeholder?: string
  format?: string
  disabled?: boolean
  teleport?: string | HTMLElement | false
}

const props = withDefaults(defineProps<Props>(), {
  format: 'YYYY-MM-DD',
  disabled: false,
  teleport: 'body',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function formatDate(date: Date, fmt: string): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return fmt
    .replace('YYYY', String(year))
    .replace('MM', pad(month))
    .replace('DD', pad(day))
}

function parseDate(str: string, fmt: string): Date | null {
  const yIndex = fmt.indexOf('YYYY')
  const mIndex = fmt.indexOf('MM')
  const dIndex = fmt.indexOf('DD')
  if (yIndex === -1 || mIndex === -1 || dIndex === -1) return null
  const year = parseInt(str.slice(yIndex, yIndex + 4), 10)
  const month = parseInt(str.slice(mIndex, mIndex + 2), 10)
  const day = parseInt(str.slice(dIndex, dIndex + 2), 10)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  const d = new Date(year, month - 1, day)
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  )
    return null
  return d
}

function getMonthData(
  year: number,
  month: number
): { date: Date; isCurrentMonth: boolean }[] {
  const firstDay = new Date(year, month, 1)
  const start = new Date(year, month, 1 - firstDay.getDay())
  const days: { date: Date; isCurrentMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({ date: d, isCurrentMonth: d.getMonth() === month })
  }
  return days
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const parsedValue = computed(() => {
  if (!props.modelValue) return null
  return props.modelValue instanceof Date
    ? props.modelValue
    : parseDate(props.modelValue, props.format)
})

const currentMonth = ref<Date>(
  parsedValue.value
    ? new Date(parsedValue.value.getFullYear(), parsedValue.value.getMonth(), 1)
    : new Date()
)

const isOpen = ref(false)
const pickerRef = ref<HTMLDivElement | null>(null)

const displayValue = computed(() => {
  return parsedValue.value ? formatDate(parsedValue.value, props.format) : ''
})

const calendarDays = computed(() =>
  getMonthData(currentMonth.value.getFullYear(), currentMonth.value.getMonth())
)

const calendarStyle = computed(() => {
  if (!pickerRef.value || typeof window === 'undefined') return {}
  const rect = pickerRef.value.getBoundingClientRect()
  return {
    position: 'absolute' as const,
    top: `${rect.bottom + window.scrollY + 4}px`,
    left: `${rect.left + window.scrollX}px`,
  }
})

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const today = new Date()

function open() {
  if (props.disabled) return
  isOpen.value = true
  if (parsedValue.value) {
    currentMonth.value = new Date(
      parsedValue.value.getFullYear(),
      parsedValue.value.getMonth(),
      1
    )
  }
}

function close() {
  isOpen.value = false
}

function changeMonth(delta: number) {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + delta)
  currentMonth.value = d
}

function selectDate(date: Date) {
  const str = formatDate(date, props.format)
  emit('update:modelValue', str)
  emit('change', str)
  close()
}

function onClickOutside(e: MouseEvent) {
  if (!pickerRef.value?.contains(e.target as Node)) {
    close()
  }
}

watch(isOpen, (openValue) => {
  if (typeof document === 'undefined') return
  if (openValue)
    document.addEventListener('click', onClickOutside, { capture: true })
  else document.removeEventListener('click', onClickOutside, { capture: true })
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('click', onClickOutside, { capture: true })
})
</script>

<template>
  <div
    ref="pickerRef"
    class="mk-datepicker"
    :class="{ 'is-disabled': disabled }"
  >
    <input
      type="text"
      class="mk-datepicker__input"
      :placeholder="placeholder || ''"
      :value="displayValue"
      readonly
      :disabled="disabled"
      @click="open"
    />

    <Teleport :to="teleport" :disabled="!teleport">
      <Transition name="mk-datepicker-fade">
        <div
          v-if="isOpen"
          class="mk-datepicker__calendar"
          :style="calendarStyle"
        >
          <div class="mk-datepicker__header">
            <button
              type="button"
              class="mk-datepicker__nav"
              @click.stop="changeMonth(-1)"
            >
              ‹
            </button>
            <span class="mk-datepicker__title">
              {{ currentMonth.getFullYear() }}年
              {{ currentMonth.getMonth() + 1 }}月
            </span>
            <button
              type="button"
              class="mk-datepicker__nav"
              @click.stop="changeMonth(1)"
            >
              ›
            </button>
          </div>

          <div class="mk-datepicker__weekdays">
            <span v-for="w in weekDays" :key="w">{{ w }}</span>
          </div>

          <div class="mk-datepicker__days">
            <span
              v-for="({ date, isCurrentMonth }, idx) in calendarDays"
              :key="idx"
              class="mk-datepicker__day"
              :class="{
                'is-other-month': !isCurrentMonth,
                'is-today': isSameDay(date, today),
                'is-selected': parsedValue
                  ? isSameDay(date, parsedValue)
                  : false,
              }"
              @click.stop="selectDate(date)"
            >
              {{ date.getDate() }}
            </span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mk-datepicker {
  position: relative;
  display: inline-flex;
  width: 100%;
}

.mk-datepicker__input {
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

.mk-datepicker__input:hover {
  border-color: var(--mk-border-hover);
}

.mk-datepicker__input:focus {
  border-color: var(--mk-primary);
}

.mk-datepicker.is-disabled .mk-datepicker__input {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--mk-bg);
}

.mk-datepicker__calendar {
  width: 280px;
  background: var(--mk-surface);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  box-shadow: var(--mk-shadow-lg);
  z-index: var(--mk-z-dropdown, 1000);
  padding: 12px;
}

.mk-datepicker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mk-datepicker__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--mk-text);
}

.mk-datepicker__nav {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--mk-text-secondary);
  font-size: 16px;
  cursor: pointer;
  border-radius: var(--mk-radius-sm);
  transition: var(--mk-transition);
}

.mk-datepicker__nav:hover {
  background: var(--mk-surface-hover);
  color: var(--mk-text);
}

.mk-datepicker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.mk-datepicker__weekdays span {
  text-align: center;
  font-size: 12px;
  color: var(--mk-text-tertiary);
  padding: 4px 0;
}

.mk-datepicker__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.mk-datepicker__day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 13px;
  color: var(--mk-text);
  cursor: pointer;
  border-radius: var(--mk-radius-sm);
  transition: var(--mk-transition);
}

.mk-datepicker__day:hover {
  background: var(--mk-surface-hover);
}

.mk-datepicker__day.is-today {
  color: var(--mk-primary);
  font-weight: 600;
}

.mk-datepicker__day.is-selected {
  background: var(--mk-primary);
  color: #fff;
}

.mk-datepicker__day.is-other-month {
  color: var(--mk-text-tertiary);
  opacity: 0.5;
}

.mk-datepicker-fade-enter-active,
.mk-datepicker-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.mk-datepicker-fade-enter-from,
.mk-datepicker-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
