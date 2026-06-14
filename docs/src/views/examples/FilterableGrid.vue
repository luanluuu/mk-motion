<template>
  <div class="example-page">
    <div class="example-hero">
      <h1 class="example-title">🔲 FilterableGrid</h1>
      <p class="example-desc">
        筛选带动画的卡片网格 — FLIP Grid + 过滤 + 排序 + 搜索。
      </p>
    </div>

    <div class="example-body">
      <div class="controls">
        <MkInput
          v-model="searchText"
          placeholder="搜索卡片…"
          clearable
          style="flex: 1; max-width: 260px"
        />

        <MkSpace style="flex-wrap: wrap">
          <MkButton
            size="small"
            :type="activeFilter === 'all' ? 'primary' : undefined"
            @click="setFilter('all')"
            >全部</MkButton
          >
          <MkButton
            v-for="cat in categories"
            :key="cat"
            size="small"
            :type="activeFilter === cat ? 'primary' : undefined"
            @click="setFilter(cat)"
            >{{ cat }}</MkButton
          >
        </MkSpace>

        <MkSpace>
          <MkButton size="small" plain @click="shuffle">🔀 打乱</MkButton>
          <MkButton size="small" plain @click="sortByName">↓ 排序</MkButton>
        </MkSpace>
      </div>

      <div class="example-hint">
        <MkTag type="info" size="small">
          💡 筛选/排序/打乱时卡片会通过 FLIP 动画平滑过渡
        </MkTag>
      </div>

      <div ref="gridRef" class="card-grid">
        <TransitionGroup name="grid-item">
          <div
            v-for="card in filteredCards"
            :key="card.id"
            class="grid-card"
            :style="{ '--card-color': card.color }"
          >
            <div class="grid-card__icon">{{ card.icon }}</div>
            <div class="grid-card__name">{{ card.name }}</div>
            <MkTag size="small" type="info">{{ card.category }}</MkTag>
          </div>
        </TransitionGroup>
        <div v-if="filteredCards.length === 0" class="grid-empty">
          没有匹配的卡片
        </div>
      </div>

      <div class="example-code-hint">
        <p>
          核心 API：<code>filterGrid</code> / <code>shuffleGrid</code> /
          <code>sortGrid</code> + <code>&lt;TransitionGroup&gt;</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { shuffleGrid, sortGrid } from '@luanlu/mk-motion'

interface Card {
  id: number
  name: string
  category: string
  icon: string
  color: string
}

const cards = ref<Card[]>([
  { id: 1, name: 'MkButton', category: '通用', icon: '🔘', color: '#6366f1' },
  { id: 2, name: 'MkCard', category: '通用', icon: '🃏', color: '#8b5cf6' },
  { id: 3, name: 'MkTable', category: '数据', icon: '📋', color: '#06b6d4' },
  { id: 4, name: 'MkTabs', category: '导航', icon: '📑', color: '#f59e0b' },
  { id: 5, name: 'MkDialog', category: '反馈', icon: '💬', color: '#ef4444' },
  {
    id: 6,
    name: 'MkDatePicker',
    category: '表单',
    icon: '📅',
    color: '#10b981',
  },
  { id: 7, name: 'MkSelect', category: '表单', icon: '🔽', color: '#84cc16' },
  { id: 8, name: 'MkProgress', category: '反馈', icon: '📊', color: '#f97316' },
])

const categories = [...new Set(cards.value.map((c) => c.category))]

const gridRef = ref<HTMLElement | null>(null)
const searchText = ref('')
const activeFilter = ref('all')

const filteredCards = computed(() => {
  let result = cards.value
  if (activeFilter.value !== 'all') {
    result = result.filter((c) => c.category === activeFilter.value)
  }
  if (searchText.value.trim()) {
    const q = searchText.value.trim().toLowerCase()
    result = result.filter((c) => c.name.toLowerCase().includes(q))
  }
  return result
})

async function setFilter(cat: string) {
  if (cat === activeFilter.value) return
  const el = gridRef.value
  if (!el) {
    activeFilter.value = cat
    return
  }
  await shuffleGrid(el, () => {
    activeFilter.value = cat
  })
}

async function shuffle() {
  const el = gridRef.value
  if (!el) return
  await shuffleGrid(el, () => {
    cards.value.sort(() => Math.random() - 0.5)
  })
}

async function sortByName() {
  const el = gridRef.value
  if (!el) {
    cards.value.sort((a, b) => a.name.localeCompare(b.name))
    return
  }
  await sortGrid(el, () => {
    cards.value.sort((a, b) => a.name.localeCompare(b.name))
  })
}
</script>

<style scoped>
.example-page {
  max-width: 800px;
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
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.example-hint {
  margin-bottom: 20px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  min-height: 200px;
}
.grid-card {
  background: var(--mk-bg);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-lg);
  padding: 20px 16px;
  text-align: center;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.grid-card:hover {
  border-color: var(--mk-primary);
  box-shadow: 0 2px 16px var(--mk-shadow);
}
.grid-card__icon {
  font-size: 2rem;
  margin-bottom: 8px;
}
.grid-card__name {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.grid-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 0;
  color: var(--mk-text-tertiary);
}

/* TransitionGroup */
.grid-item-enter-active,
.grid-item-leave-active {
  transition: all 0.35s ease;
}
.grid-item-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.grid-item-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
.grid-item-move {
  transition: transform 0.35s ease;
}
.grid-item-leave-active {
  position: absolute;
}

.example-code-hint {
  margin-top: 32px;
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
