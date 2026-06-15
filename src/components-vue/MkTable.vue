<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import MkPagination from './MkPagination.vue'

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: keyof T & string
  title: string
  width?: string
  sortable?: boolean
  editable?: boolean
  render?: (
    value: T[keyof T],
    row: T,
    index: number
  ) => HTMLElement | string
}

interface Props {
  columns: TableColumn[]
  data: Record<string, unknown>[]
  pageSize?: number
  virtual?: boolean
  selection?: 'single' | 'multiple'
  currentPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  virtual: false,
  currentPage: 1,
})

const emit = defineEmits<{
  sortChange: [key: string, order: 'asc' | 'desc' | null]
  selectChange: [selected: Record<string, unknown>[]]
  rowClick: [row: Record<string, unknown>, index: number]
  edit: [row: Record<string, unknown>, index: number]
  delete: [row: Record<string, unknown>, index: number]
}>()

defineSlots<
  {
    empty?: () => unknown
  } & Record<
      `column-${string}`,
      (props: {
        value: unknown
        row: Record<string, unknown>
        index: number
      }) => unknown
    >
>()

const currentPageModel = defineModel<number>('currentPage', { default: 1 })
const pageSizeModel = defineModel<number>('pageSize', { default: 10 })

const sortState = ref<{ key: string; order: 'asc' | 'desc' } | null>(null)
const selectedRows = ref<Set<Record<string, unknown>>>(new Set())
const editingRow = ref<number | null>(null)
const editCache = ref<Record<string, unknown> | null>(null)

const DEFAULT_ITEM_HEIGHT = 44
const DEFAULT_VIRTUAL_HEIGHT = 400
const BUFFER_COUNT = 5

const scrollContainer = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(DEFAULT_VIRTUAL_HEIGHT)

const sortedData = computed(() => {
  if (!sortState.value) return props.data
  const { key, order } = sortState.value
  return [...props.data].sort((a, b) => {
    const av = a[key] as string | number
    const bv = b[key] as string | number
    if (av < bv) return order === 'asc' ? -1 : 1
    if (av > bv) return order === 'asc' ? 1 : -1
    return 0
  })
})

const total = computed(() => sortedData.value.length)

const paginatedData = computed(() => {
  if (props.virtual) return sortedData.value
  const start = (currentPageModel.value - 1) * pageSizeModel.value
  return sortedData.value.slice(start, start + pageSizeModel.value)
})

const virtualState = computed(() => {
  if (!props.virtual)
    return {
      startIndex: 0,
      endIndex: paginatedData.value.length,
      topHeight: 0,
      bottomHeight: 0,
    }
  const totalCount = sortedData.value.length
  const itemHeight = DEFAULT_ITEM_HEIGHT
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop.value / itemHeight) - BUFFER_COUNT
  )
  const visibleCount = Math.ceil(containerHeight.value / itemHeight)
  const endIndex = Math.min(
    totalCount,
    startIndex + visibleCount + BUFFER_COUNT * 2
  )
  return {
    startIndex,
    endIndex,
    topHeight: startIndex * itemHeight,
    bottomHeight: (totalCount - endIndex) * itemHeight,
  }
})

const visibleData = computed(() => {
  if (!props.virtual) return paginatedData.value
  return sortedData.value.slice(
    virtualState.value.startIndex,
    virtualState.value.endIndex
  )
})

function handleSort(key: string) {
  if (!sortState.value || sortState.value.key !== key) {
    sortState.value = { key, order: 'asc' }
  } else if (sortState.value.order === 'asc') {
    sortState.value = { key, order: 'desc' }
  } else {
    sortState.value = null
  }
  emit('sortChange', key, sortState.value?.order ?? null)
  currentPageModel.value = 1
}

function onScroll() {
  if (!scrollContainer.value || !props.virtual) return
  scrollTop.value = scrollContainer.value.scrollTop
  containerHeight.value =
    scrollContainer.value.clientHeight || DEFAULT_VIRTUAL_HEIGHT
}

function onPageChange(page: number) {
  currentPageModel.value = page
}

function onSizeChange(size: number) {
  pageSizeModel.value = size
  currentPageModel.value = 1
}

const allSelected = computed(() => {
  return (
    paginatedData.value.length > 0 &&
    paginatedData.value.every((r) => selectedRows.value.has(r))
  )
})

function toggleHeaderSelection() {
  if (props.selection !== 'multiple') return
  if (allSelected.value) {
    paginatedData.value.forEach((r) => selectedRows.value.delete(r))
  } else {
    paginatedData.value.forEach((r) => selectedRows.value.add(r))
  }
  emit('selectChange', Array.from(selectedRows.value))
}

function toggleRowSelection(row: Record<string, unknown>) {
  if (props.selection === 'single') {
    selectedRows.value.clear()
    selectedRows.value.add(row)
  } else {
    if (selectedRows.value.has(row)) selectedRows.value.delete(row)
    else selectedRows.value.add(row)
  }
  emit('selectChange', Array.from(selectedRows.value))
}

function isSelected(row: Record<string, unknown>) {
  return selectedRows.value.has(row)
}

function onRowClick(row: Record<string, unknown>, index: number) {
  emit('rowClick', row, index)
}

function startEdit(rowIndex: number) {
  editingRow.value = rowIndex
  editCache.value = { ...paginatedData.value[rowIndex] }
  nextTick(() => {
    const input = document.querySelector(
      '.mk-table__edit-input'
    ) as HTMLInputElement | null
    input?.focus()
  })
}

function saveEdit() {
  if (editingRow.value !== null && editCache.value) {
    const row = editCache.value
    const origIndex =
      (currentPageModel.value - 1) * pageSizeModel.value + editingRow.value
    emit('edit', row, origIndex)
  }
  editingRow.value = null
  editCache.value = null
}

function cancelEdit() {
  editingRow.value = null
  editCache.value = null
}

function deleteRow(row: Record<string, unknown>, index: number) {
  const origIndex = (currentPageModel.value - 1) * pageSizeModel.value + index
  emit('delete', row, origIndex)
}

function getCellValue(
  row: Record<string, unknown>,
  col: TableColumn,
  pageIndex: number
) {
  if (editingRow.value === pageIndex && col.editable && col.key !== 'actions') {
    return editCache.value?.[col.key] ?? row[col.key] ?? ''
  }
  return row[col.key] !== undefined ? String(row[col.key]) : ''
}

function onEditInput(col: TableColumn, value: string) {
  if (editCache.value) editCache.value[col.key] = value
}

watch(
  () => props.data,
  () => {
    currentPageModel.value = 1
    selectedRows.value.clear()
  },
  { deep: true }
)

defineExpose({ startEdit, saveEdit, cancelEdit, deleteRow })
</script>

<template>
  <div class="mk-table-wrapper">
    <div
      v-if="virtual"
      ref="scrollContainer"
      class="mk-table-scroll-container"
      :style="{ maxHeight: `${DEFAULT_VIRTUAL_HEIGHT}px` }"
      @scroll="onScroll"
    >
      <table class="mk-table" role="table">
        <thead role="rowgroup">
          <tr role="row">
            <th v-if="selection" role="columnheader">
              <label
                class="mk-checkbox"
                role="checkbox"
                :aria-checked="allSelected"
                :class="{ 'is-checked': allSelected }"
                @click.stop="toggleHeaderSelection"
              >
                <span class="mk-checkbox__input">
                  <span class="mk-checkbox__check">✓</span>
                </span>
              </label>
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              role="columnheader"
              :style="col.width ? { width: col.width } : undefined"
              :class="{ 'is-sortable': col.sortable }"
              :aria-sort="
                sortState?.key === col.key
                  ? sortState.order === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              "
              @click="col.sortable && handleSort(col.key)"
            >
              {{ col.title }}
              <span
                v-if="col.sortable"
                class="mk-table__sort-icon"
                :class="{ 'is-active': sortState?.key === col.key }"
              >
                {{
                  sortState?.key === col.key
                    ? sortState.order === 'asc'
                      ? '↑'
                      : '↓'
                    : '⇅'
                }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <tr v-if="sortedData.length === 0" role="row">
            <td
              :colspan="columns.length + (selection ? 1 : 0)"
              class="mk-table__empty"
              role="cell"
            >
              <slot name="empty">暂无数据</slot>
            </td>
          </tr>
          <template v-else>
            <tr class="mk-table__virtual-spacer-top">
              <td
                :colspan="columns.length + (selection ? 1 : 0)"
                :style="{
                  padding: 0,
                  border: 'none',
                  height: `${virtualState.topHeight}px`,
                }"
              ></td>
            </tr>
            <tr
              v-for="(row, i) in visibleData"
              :key="i + virtualState.startIndex"
              role="row"
              class="mk-table__virtual-row"
              :style="{ height: `${DEFAULT_ITEM_HEIGHT}px` }"
              @click="onRowClick(row, i + virtualState.startIndex)"
            >
              <td v-if="selection" role="cell">
                <label
                  class="mk-checkbox"
                  role="checkbox"
                  :aria-checked="isSelected(row)"
                  :class="{ 'is-checked': isSelected(row) }"
                  @click.stop="toggleRowSelection(row)"
                >
                  <span class="mk-checkbox__input">
                    <span class="mk-checkbox__check">✓</span>
                  </span>
                </label>
              </td>
              <td v-for="col in columns" :key="col.key" role="cell">
                <input
                  v-if="
                    editingRow === i + virtualState.startIndex &&
                    col.editable &&
                    col.key !== 'actions'
                  "
                  class="mk-table__edit-input"
                  :value="getCellValue(row, col, i + virtualState.startIndex)"
                  @input="
                    onEditInput(col, ($event.target as HTMLInputElement).value)
                  "
                  @keydown.enter="saveEdit"
                  @keydown.esc="cancelEdit"
                />
                <slot
                  v-else-if="$slots[`column-${col.key}`]"
                  :name="`column-${col.key}`"
                  :value="row[col.key]"
                  :row="row"
                  :index="i + virtualState.startIndex"
                />
                <template v-else>{{
                  row[col.key] !== undefined ? String(row[col.key]) : ''
                }}</template>
              </td>
            </tr>
            <tr class="mk-table__virtual-spacer-bottom">
              <td
                :colspan="columns.length + (selection ? 1 : 0)"
                :style="{
                  padding: 0,
                  border: 'none',
                  height: `${virtualState.bottomHeight}px`,
                }"
              ></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <template v-else>
      <table class="mk-table" role="table">
        <thead role="rowgroup">
          <tr role="row">
            <th v-if="selection" role="columnheader">
              <label
                class="mk-checkbox"
                role="checkbox"
                :aria-checked="allSelected"
                :class="{ 'is-checked': allSelected }"
                @click.stop="toggleHeaderSelection"
              >
                <span class="mk-checkbox__input">
                  <span class="mk-checkbox__check">✓</span>
                </span>
              </label>
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              role="columnheader"
              :style="col.width ? { width: col.width } : undefined"
              :class="{ 'is-sortable': col.sortable }"
              :aria-sort="
                sortState?.key === col.key
                  ? sortState.order === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              "
              @click="col.sortable && handleSort(col.key)"
            >
              {{ col.title }}
              <span
                v-if="col.sortable"
                class="mk-table__sort-icon"
                :class="{ 'is-active': sortState?.key === col.key }"
              >
                {{
                  sortState?.key === col.key
                    ? sortState.order === 'asc'
                      ? '↑'
                      : '↓'
                    : '⇅'
                }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <tr v-if="paginatedData.length === 0" role="row">
            <td
              :colspan="columns.length + (selection ? 1 : 0)"
              class="mk-table__empty"
              role="cell"
            >
              <slot name="empty">暂无数据</slot>
            </td>
          </tr>
          <tr
            v-for="(row, i) in paginatedData"
            :key="i"
            role="row"
            :class="{
              'is-editing':
                editingRow === (currentPageModel - 1) * pageSizeModel + i,
            }"
            @click="onRowClick(row, (currentPageModel - 1) * pageSizeModel + i)"
          >
            <td v-if="selection" role="cell">
              <label
                class="mk-checkbox"
                role="checkbox"
                :aria-checked="isSelected(row)"
                :class="{ 'is-checked': isSelected(row) }"
                @click.stop="toggleRowSelection(row)"
              >
                <span class="mk-checkbox__input">
                  <span class="mk-checkbox__check">✓</span>
                </span>
              </label>
            </td>
            <td v-for="col in columns" :key="col.key" role="cell">
              <input
                v-if="
                  editingRow === (currentPageModel - 1) * pageSizeModel + i &&
                  col.editable &&
                  col.key !== 'actions'
                "
                class="mk-table__edit-input"
                :value="
                  getCellValue(
                    row,
                    col,
                    (currentPageModel - 1) * pageSizeModel + i
                  )
                "
                @input="
                  onEditInput(col, ($event.target as HTMLInputElement).value)
                "
                @keydown.enter="saveEdit"
                @keydown.esc="cancelEdit"
              />
              <slot
                v-else-if="$slots[`column-${col.key}`]"
                :name="`column-${col.key}`"
                :value="row[col.key]"
                :row="row"
                :index="(currentPageModel - 1) * pageSizeModel + i"
              />
              <template v-else>{{
                row[col.key] !== undefined ? String(row[col.key]) : ''
              }}</template>
            </td>
          </tr>
        </tbody>
      </table>

      <MkPagination
        v-if="total > 0"
        v-model:current-page="currentPageModel"
        v-model:page-size="pageSizeModel"
        :total="total"
        @change="onPageChange"
        @size-change="onSizeChange"
      />
    </template>
  </div>
</template>

<style scoped>
.mk-table-wrapper {
  width: 100%;
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  overflow: hidden;
  background: var(--mk-surface);
}

.mk-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.mk-table thead {
  background: var(--mk-surface-alpha-weak);
}

.mk-table th {
  padding: 10px 16px;
  text-align: left;
  font-weight: 500;
  color: var(--mk-text-secondary);
  border-bottom: 1px solid var(--mk-border);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}

.mk-table th.is-sortable {
  cursor: pointer;
}

.mk-table th.is-sortable:hover {
  color: var(--mk-text);
  background: var(--mk-surface-alpha-weak);
}

.mk-table__sort-icon {
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.4;
  display: inline-block;
  width: 12px;
  text-align: center;
}

.mk-table__sort-icon.is-active {
  opacity: 1;
  color: var(--mk-primary);
}

.mk-table td {
  padding: 10px 16px;
  color: var(--mk-text);
  border-bottom: 1px solid var(--mk-border);
  vertical-align: middle;
}

.mk-table tbody tr:last-child td {
  border-bottom: none;
}

.mk-table tbody tr:hover {
  background: var(--mk-primary-muted);
}

.mk-table tbody tr.is-editing td {
  background: rgba(99, 102, 241, 0.05);
}

.mk-table__edit-input {
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--mk-text);
  background: var(--mk-bg);
  border: 1px solid var(--mk-border);
  border-radius: 6px;
  outline: none;
  transition: var(--mk-transition);
  box-sizing: border-box;
}

.mk-table__edit-input:focus {
  border-color: var(--mk-primary);
}

.mk-table__empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--mk-text-tertiary);
  font-size: 14px;
}

.mk-table-scroll-container {
  overflow-y: auto;
  position: relative;
}

.mk-table__virtual-spacer-top td,
.mk-table__virtual-spacer-bottom td {
  padding: 0 !important;
  border: none !important;
}

.mk-table__virtual-row {
  height: 44px;
}

.mk-table__virtual-row td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mk-table th:first-child .mk-checkbox,
.mk-table td:first-child .mk-checkbox {
  margin: 0;
}

.mk-table th:first-child {
  width: 48px;
  text-align: center;
  padding-left: 16px;
  padding-right: 0;
}

.mk-table td:first-child {
  text-align: center;
  padding-left: 16px;
  padding-right: 0;
}

.mk-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  margin: 0;
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
  background: var(--mk-surface);
}

.mk-checkbox.is-checked .mk-checkbox__input {
  background: var(--mk-primary);
  border-color: var(--mk-primary);
}

.mk-checkbox__check {
  color: var(--mk-text-inverse);
  font-size: 11px;
  opacity: 0;
}

.mk-checkbox.is-checked .mk-checkbox__check {
  opacity: 1;
}
</style>
