<template>
  <div class="example-page">
    <div class="example-hero">
      <h1 class="example-title">📝 SortableTodoList</h1>
      <p class="example-desc">
        拖拽排序待办列表 — DraggableList + Spring 释放动画 + 撤销提示。
      </p>
    </div>

    <div class="example-body">
      <div class="example-toolbar">
        <MkInput
          v-model="newTodoText"
          placeholder="添加新任务…"
          @keyup.enter="addTodo"
          style="flex: 1"
        />
        <MkButton
          type="primary"
          @click="addTodo"
          :disabled="!newTodoText.trim()"
          >添加</MkButton
        >
      </div>

      <div class="example-hint">
        <MkTag type="info" size="small">💡 拖拽列表项进行排序</MkTag>
        <MkTag v-if="showUndo" type="warning" size="small">
          已删除 "{{ lastDeleted?.text }}" —
          <span class="undo-link" @click="undo">撤销</span>
        </MkTag>
      </div>

      <div ref="listRef" class="todo-list">
        <div
          v-for="item in todos"
          :key="item.id"
          class="todo-item"
          :class="{ completed: item.done }"
        >
          <div class="todo-drag-handle" data-drag-handle>⠿</div>
          <MkCheckbox v-model="item.done" class="todo-checkbox" />
          <span class="todo-text">{{ item.text }}</span>
          <button class="todo-delete" @click="removeTodo(item)">✕</button>
        </div>
        <div v-if="todos.length === 0" class="todo-empty">
          暂无任务，添加一个试试
        </div>
      </div>

      <div class="example-code-hint">
        <p>
          核心 API：<code>createDraggableList</code> +
          <code>spring</code> 释放动画
        </p>
        <MkSpace style="margin-top: 12px">
          <MkButton size="small" plain @click="resetTodos"
            >重置示例数据</MkButton
          >
        </MkSpace>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { createDraggableList, spring } from '@luanlu/mk-motion'
import type { DraggableListOptions } from '@luanlu/mk-motion'

interface Todo {
  id: number
  text: string
  done: boolean
}

let nextId = 101
const listRef = ref<HTMLElement | null>(null)
const newTodoText = ref('')
const todos = ref<Todo[]>([
  { id: 1, text: '完成 MotionKit 文档首页重写', done: true },
  { id: 2, text: '实现拖拽排序业务示例', done: false },
  { id: 3, text: '添加单元测试核心模块', done: false },
  { id: 4, text: '优化 FLIP Grid 筛选动画', done: false },
  { id: 5, text: '补充手势交互示例', done: false },
])

const showUndo = ref(false)
const lastDeleted = ref<Todo | null>(null)
let undoTimer: ReturnType<typeof setTimeout> | null = null

let draggableList: ReturnType<typeof createDraggableList> | null = null

function addTodo() {
  const text = newTodoText.value.trim()
  if (!text) return
  todos.value.push({ id: nextId++, text, done: false })
  newTodoText.value = ''
}

function removeTodo(item: Todo) {
  lastDeleted.value = { ...item }
  todos.value = todos.value.filter((t) => t.id !== item.id)
  showUndo.value = true
  if (undoTimer) clearTimeout(undoTimer)
  undoTimer = setTimeout(() => {
    showUndo.value = false
    lastDeleted.value = null
  }, 5000)
}

function undo() {
  if (lastDeleted.value) {
    todos.value.splice(
      todos.value.findIndex((t) => t.id === lastDeleted.value!.id - 1) + 1,
      0,
      lastDeleted.value
    )
  }
  showUndo.value = false
  lastDeleted.value = null
  if (undoTimer) clearTimeout(undoTimer)
}

function resetTodos() {
  todos.value = [
    { id: 1, text: '完成 MotionKit 文档首页重写', done: true },
    { id: 2, text: '实现拖拽排序业务示例', done: false },
    { id: 3, text: '添加单元测试核心模块', done: false },
    { id: 4, text: '优化 FLIP Grid 筛选动画', done: false },
    { id: 5, text: '补充手势交互示例', done: false },
  ]
  nextId = 101
}

onMounted(() => {
  if (!listRef.value) return
  draggableList = createDraggableList(listRef.value, {
    handle: '[data-drag-handle]',
    placeholderClass: 'todo-placeholder',
    onDragEnd(_item, _fromIndex, toIndex) {
      // Item was already reordered by the library, but we sync our reactive data
      const children = Array.from(listRef.value!.children) as HTMLElement[]
      const reordered = children
        .filter((el) => el.dataset.id)
        .map((el) => todos.value.find((t) => t.id === Number(el.dataset.id))!)
        .filter(Boolean)
      todos.value = reordered
    },
  } as DraggableListOptions)
})

onUnmounted(() => {
  draggableList?.destroy()
  if (undoTimer) clearTimeout(undoTimer)
})
</script>

<style scoped>
.example-page {
  max-width: 760px;
  margin: 0 auto;
  padding-bottom: 80px;
}
.example-hero {
  text-align: center;
  padding: 56px 24px 32px;
}
.example-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.example-desc {
  font-size: 0.95rem;
  color: var(--mk-text-secondary);
  margin: 0;
}

.example-body {
  padding: 0 24px;
}
.example-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.example-hint {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.undo-link {
  cursor: pointer;
  text-decoration: underline;
}

.todo-list {
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-lg);
  overflow: hidden;
}
.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--mk-bg);
  border-bottom: 1px solid var(--mk-border);
  transition: background 0.2s;
  cursor: default;
}
.todo-item:last-child {
  border-bottom: none;
}
.todo-item.completed {
  opacity: 0.6;
}
.todo-item.completed .todo-text {
  text-decoration: line-through;
}
.todo-drag-handle {
  cursor: grab;
  color: var(--mk-text-tertiary);
  font-size: 1.1rem;
  user-select: none;
  padding: 2px;
}
.todo-drag-handle:active {
  cursor: grabbing;
}
.todo-text {
  flex: 1;
  font-size: 0.93rem;
}
.todo-delete {
  background: none;
  border: none;
  color: var(--mk-text-tertiary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 2px 6px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}
.todo-item:hover .todo-delete {
  opacity: 1;
}
.todo-delete:hover {
  color: var(--mk-danger, #f56c6c);
  background: var(--mk-surface);
}

.todo-empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--mk-text-tertiary);
  font-size: 0.93rem;
}

.todo-placeholder {
  background: var(--mk-primary-muted, rgba(99, 102, 241, 0.08));
  border: 2px dashed var(--mk-primary);
  border-radius: 0;
}

.example-code-hint {
  margin-top: 24px;
  padding: 16px;
  background: var(--mk-surface);
  border-radius: var(--mk-radius-lg);
  font-size: 0.85rem;
  color: var(--mk-text-secondary);
}
.example-code-hint code {
  background: var(--mk-bg-elevated);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  font-size: 0.82rem;
}
</style>
