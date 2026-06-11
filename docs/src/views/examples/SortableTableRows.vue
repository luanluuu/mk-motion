<template>
  <div class="example-page">
    <div class="example-hero">
      <h1 class="example-title">📊 SortableTableRows</h1>
      <p class="example-desc">
        表格行拖拽排序 — DraggableList + Table 组件 + 数据持久化。
      </p>
    </div>

    <div class="example-body">
      <div class="example-hint">
        <MkTag type="info" size="small">💡 拖拽 ⠿ 手柄对表格行排序</MkTag>
        <MkTag type="success" size="small">修改顺序后自动保存到 LocalStorage</MkTag>
      </div>

      <div ref="tableRef" class="sortable-table">
        <div class="table-header">
          <span class="col-order">#</span>
          <span class="col-name">名称</span>
          <span class="col-category">分类</span>
          <span class="col-status">状态</span>
          <span class="col-drag"></span>
        </div>
        <div
          v-for="(row, index) in rows"
          :key="row.id"
          class="table-row"
          :data-id="row.id"
        >
          <span class="col-order">{{ index + 1 }}</span>
          <span class="col-name">{{ row.name }}</span>
          <span class="col-category">
            <MkTag size="small" type="info">{{ row.category }}</MkTag>
          </span>
          <span class="col-status">
            <MkTag size="small" :type="row.status === '稳定' ? 'success' : 'warning'">
              {{ row.status }}
            </MkTag>
          </span>
          <span class="col-drag" data-drag-handle>⠿</span>
        </div>
      </div>

      <MkSpace style="margin-top: 20px;">
        <MkButton size="small" plain @click="resetRows">重置顺序</MkButton>
        <MkButton size="small" type="primary" @click="saveOrder">保存到 Storage</MkButton>
        <span v-if="saved" class="save-hint">✓ 已保存</span>
      </MkSpace>

      <div class="example-code-hint">
        <p>核心 API：<code>createDraggableList</code> 绑定表格行，通过 <code>onDragEnd</code> 回调同步数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createDraggableList } from 'mk-motion'
import type { DraggableListOptions } from 'mk-motion'

interface TableRow {
  id: number
  name: string
  category: string
  status: string
}

const DEFAULT_ROWS: TableRow[] = [
  { id: 1, name: 'MkButton', category: '通用', status: '稳定' },
  { id: 2, name: 'MkCard', category: '通用', status: '稳定' },
  { id: 3, name: 'MkTable', category: '数据', status: '稳定' },
  { id: 4, name: 'MkTabs', category: '导航', status: '稳定' },
  { id: 5, name: 'MkDatePicker', category: '表单', status: '实验' },
  { id: 6, name: 'MkDialog', category: '反馈', status: '稳定' },
]

function loadRows(): TableRow[] {
  try {
    const saved = localStorage.getItem('mk-example-table-rows')
    if (saved) return JSON.parse(saved)
  } catch {}
  return [...DEFAULT_ROWS]
}

const tableRef = ref<HTMLElement | null>(null)
const rows = ref<TableRow[]>(loadRows())
const saved = ref(false)
let draggableList: ReturnType<typeof createDraggableList> | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null

function reorderRows(ids: number[]) {
  const map = new Map(rows.value.map((r) => [r.id, r]))
  rows.value = ids.map((id) => map.get(id)!)
}

onMounted(() => {
  if (!tableRef.value) return
  draggableList = createDraggableList(tableRef.value, {
    handle: '[data-drag-handle]',
    placeholderClass: 'table-placeholder',
    itemSelector: '.table-row',
    onDragEnd(_item, _fromIndex, _toIndex) {
      const children = Array.from(tableRef.value!.querySelectorAll('.table-row')) as HTMLElement[]
      const ids = children.map((el) => Number(el.dataset.id)).filter(Boolean)
      reorderRows(ids)
    },
  } as DraggableListOptions)
})

onUnmounted(() => {
  draggableList?.destroy()
  if (saveTimer) clearTimeout(saveTimer)
})

function saveOrder() {
  localStorage.setItem('mk-example-table-rows', JSON.stringify(rows.value))
  saved.value = true
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => (saved.value = false), 2000)
}

function resetRows() {
  rows.value = [...DEFAULT_ROWS]
  localStorage.removeItem('mk-example-table-rows')
}
</script>

<style scoped>
.example-page { max-width: 760px; margin: 0 auto; padding-bottom: 80px; }
.example-hero { text-align: center; padding: 56px 24px 32px; }
.example-title { font-size: 1.8rem; font-weight: 700; margin: 0 0 8px; }
.example-desc { font-size: 0.95rem; color: var(--mk-text-secondary); margin: 0; }

.example-body { padding: 0 24px; }
.example-hint { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }

.sortable-table {
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-lg);
  overflow: hidden;
}
.table-header {
  display: flex;
  padding: 10px 16px;
  background: var(--mk-surface);
  border-bottom: 2px solid var(--mk-border);
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--mk-text-secondary);
}
.table-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--mk-border);
  background: var(--mk-bg);
  font-size: 0.9rem;
  transition: background 0.15s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--mk-bg-secondary); }

.col-order { width: 40px; color: var(--mk-text-tertiary); }
.col-name { flex: 1; }
.col-category { width: 70px; }
.col-status { width: 60px; }
.col-drag {
  width: 36px;
  cursor: grab;
  color: var(--mk-text-tertiary);
  font-size: 1rem;
  text-align: center;
  user-select: none;
}
.col-drag:active { cursor: grabbing; }

.table-placeholder {
  background: var(--mk-primary-muted, rgba(99,102,241,0.08)) !important;
  border: 2px dashed var(--mk-primary) !important;
  border-radius: 0 !important;
}

.save-hint { font-size: 0.85rem; color: var(--mk-success, #67c23a); }
.example-code-hint {
  margin-top: 24px; padding: 16px;
  background: var(--mk-surface); border-radius: var(--mk-radius-lg);
  font-size: 0.85rem; color: var(--mk-text-secondary);
}
.example-code-hint code {
  background: var(--mk-bg-elevated); padding: 2px 6px;
  border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.82rem;
}
</style>
