<template>
  <div class="components-overview">
    <div class="section-header" style="text-align: center">
      <h1 class="section-title">组件总览</h1>
      <p class="section-desc">
        MotionKit 提供 35+
        个精心设计的组件，分为通用、布局、导航、数据展示、反馈、表单六大类。
      </p>
    </div>

    <div v-for="cat in categories" :key="cat.title" class="category-section">
      <h2 class="doc-h2">{{ cat.title }}</h2>
      <TransitionGroup name="card-fade" tag="div" class="card-grid">
        <MkCard
          v-for="name in cat.comps"
          :key="name"
          :title="getDocTitle(name)"
          :body="getDocDesc(name)"
          shadow="hover"
          class="overview-card"
          @click="goTo('component-' + name)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  componentDocs,
  type ComponentDoc,
} from '../data/component-docs.js'
import { goTo } from '../router.js'
import { onMounted } from 'vue'

onMounted(() => {
  document.getElementById('toc')!.style.display = 'none'
})

const categories = [
  {
    title: '通用',
    comps: ['button', 'input', 'card', 'tag', 'avatar', 'empty'],
  },
  { title: '布局', comps: ['row', 'space', 'divider', 'container', 'layout'] },
  { title: '导航', comps: ['tabs', 'menu', 'breadcrumb', 'steps'] },
  { title: '数据展示', comps: ['table', 'progress'] },
  { title: '反馈', comps: ['dialog', 'alert', 'switch'] },
  { title: '表单', comps: ['select', 'checkbox', 'radio', 'slider'] },
  { title: '其他', comps: ['popover', 'tooltip'] },
]

function getDocTitle(name: string) {
  return (componentDocs as Record<string, ComponentDoc>)[name]?.title || name
}

function getDocDesc(name: string) {
  return (componentDocs as Record<string, ComponentDoc>)[name]?.desc || ''
}
</script>

<style scoped>
.components-overview {
  padding-bottom: 80px;
}

.section-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--mk-border);
}

.section-title {
  font-size: 1.6rem;
  color: var(--mk-text);
  margin-bottom: 6px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.section-desc {
  color: var(--mk-text-tertiary);
  font-size: 0.85rem;
}

.category-section {
  margin-bottom: 8px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.overview-card {
  cursor: pointer;
  width: 100%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
}

/* Transition */
.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.card-fade-enter-active,
.card-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
