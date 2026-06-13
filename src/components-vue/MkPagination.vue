<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  total: number
  pageSize?: number
  currentPage?: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  currentPage: 1,
  pageSizes: () => [10, 20, 50],
})

const emit = defineEmits<{
  change: [page: number]
  sizeChange: [size: number]
}>()

const currentPageModel = defineModel<number>('currentPage', { default: 1 })
const pageSizeModel = defineModel<number>('pageSize', { default: 10 })

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / pageSizeModel.value))
)

const pageRange = computed(() => {
  const maxVisible = 5
  let start = Math.max(1, currentPageModel.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  return { start, end }
})

function setPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPageModel.value)
    return
  currentPageModel.value = page
  emit('change', page)
}

function prev() {
  setPage(currentPageModel.value - 1)
}

function next() {
  setPage(currentPageModel.value + 1)
}

function onSizeChange(e: Event) {
  const size = Number((e.target as HTMLSelectElement).value)
  pageSizeModel.value = size
  currentPageModel.value = 1
  emit('sizeChange', size)
}
</script>

<template>
  <div class="mk-pagination">
    <span class="mk-pagination__total">共 {{ total }} 条</span>

    <button
      type="button"
      class="mk-pagination__btn"
      :disabled="currentPageModel <= 1"
      @click="prev"
    >
      ‹
    </button>

    <template v-if="pageRange.start > 1">
      <button type="button" class="mk-pagination__btn" @click="setPage(1)">
        1
      </button>
      <span
        v-if="pageRange.start > 2"
        class="mk-pagination__btn"
        style="cursor: default"
        >...</span
      >
    </template>

    <button
      v-for="p in pageRange.end - pageRange.start + 1"
      :key="p + pageRange.start - 1"
      type="button"
      class="mk-pagination__btn"
      :class="{ 'is-active': p + pageRange.start - 1 === currentPageModel }"
      @click="setPage(p + pageRange.start - 1)"
    >
      {{ p + pageRange.start - 1 }}
    </button>

    <template v-if="pageRange.end < totalPages">
      <span
        v-if="pageRange.end < totalPages - 1"
        class="mk-pagination__btn"
        style="cursor: default"
        >...</span
      >
      <button
        type="button"
        class="mk-pagination__btn"
        @click="setPage(totalPages)"
      >
        {{ totalPages }}
      </button>
    </template>

    <button
      type="button"
      class="mk-pagination__btn"
      :disabled="currentPageModel >= totalPages"
      @click="next"
    >
      ›
    </button>

    <span class="mk-pagination__size">
      每页
      <select :value="pageSizeModel" @change="onSizeChange">
        <option v-for="s in pageSizes" :key="s" :value="s">{{ s }}</option>
      </select>
      条
    </span>
  </div>
</template>

<style scoped>
.mk-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 16px;
  border-top: 1px solid var(--mk-border);
}

.mk-pagination__btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--mk-text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--mk-transition);
}

.mk-pagination__btn:hover:not(:disabled) {
  background: var(--mk-surface-alpha-medium);
  color: var(--mk-text);
}

.mk-pagination__btn.is-active {
  background: var(--mk-primary);
  color: var(--mk-text-inverse);
  border-color: var(--mk-primary);
}

.mk-pagination__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.mk-pagination__total {
  font-size: 12px;
  color: var(--mk-text-tertiary);
  margin-right: auto;
}

.mk-pagination__size {
  margin-left: auto;
  font-size: 12px;
  color: var(--mk-text-secondary);
}

.mk-pagination__size select {
  margin-left: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--mk-text);
  background: var(--mk-bg);
  border: 1px solid var(--mk-border);
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}
</style>
