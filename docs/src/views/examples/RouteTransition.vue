<template>
  <div class="example-page">
    <div class="example-hero">
      <h1 class="example-title">🔀 RouteTransition</h1>
      <p class="example-desc">
        Vue Router 页面切换动画 — FLIP 布局过渡 + 淡入淡出。
      </p>
    </div>

    <div class="example-body">
      <div class="example-hint">
        <MkTag type="info" size="small"
          >💡 点击导航切换"页面"，观察 FLIP + 淡入淡出过渡</MkTag
        >
      </div>

      <!-- Simulated page navigation -->
      <div class="nav-bar">
        <button
          v-for="page in pages"
          :key="page.id"
          class="nav-btn"
          :class="{ active: currentPage === page.id }"
          @click="switchPage(page.id)"
        >
          {{ page.label }}
        </button>
      </div>

      <div ref="pageContainer" class="page-container">
        <Transition name="page-fade" mode="out-in">
          <div :key="currentPage" class="page-content">
            <MkCard :title="currentPageData?.label || ''" shadow="hover">
              <p
                style="
                  margin: 0 0 16px;
                  color: var(--mk-text-secondary);
                  line-height: 1.7;
                "
              >
                {{ currentPageData?.content }}
              </p>
              <MkRow :gutter="12" v-if="currentPageData?.items">
                <MkCol
                  :span="8"
                  :xs="24"
                  v-for="item in currentPageData.items"
                  :key="item"
                >
                  <MkCard class="page-card" shadow="hover">
                    <div style="text-align: center; padding: 12px 0">
                      {{ item }}
                    </div>
                  </MkCard>
                </MkCol>
              </MkRow>
            </MkCard>
          </div>
        </Transition>
      </div>

      <div class="transition-hint">
        <div class="dot" :class="{ active: isAnimating }" />
        <span>动画状态：{{ isAnimating ? '过渡中…' : '就绪' }}</span>
      </div>

      <div class="example-code-hint">
        <p>
          核心 API：<code>pageTransition</code> / <code>flip</code> + Vue
          <code>&lt;Transition&gt;</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { flip } from '@luanlu/mk-motion'

interface PageData {
  id: string
  label: string
  content: string
  items?: string[]
}

const pages: PageData[] = [
  {
    id: 'overview',
    label: '总览',
    content:
      'MotionKit 提供 50+ 动画驱动组件，覆盖通用、布局、导航、数据、反馈、表单六类。所有组件深度绑定物理弹簧引擎。',
    items: [
      '弹簧动画',
      'FLIP 布局',
      '手势交互',
      '滚动驱动',
      '粒子特效',
      '主题系统',
    ],
  },
  {
    id: 'components',
    label: '组件',
    content:
      'MkButton、MkCard、MkTable、MkDialog、MkTabs 等核心组件都内置了弹簧交互动画，无需额外配置即可获得流畅体验。',
    items: [
      'MkButton',
      'MkCard',
      'MkTable',
      'MkDialog',
      'MkTabs',
      'MkDatePicker',
    ],
  },
  {
    id: 'animations',
    label: '动画引擎',
    content:
      '基于胡克定律的 Spring 引擎 + FLIP 布局动画 + ScrollTrigger 滚动驱动 + 30+ 动画预设。',
    items: ['Spring', 'FLIP', 'Scroll', 'CountUp', 'Parallax', 'Stagger'],
  },
]

const pageContainer = ref<HTMLElement | null>(null)
const currentPage = ref('overview')
const isAnimating = ref(false)

const currentPageData = computed(() =>
  pages.find((p) => p.id === currentPage.value)
)

async function switchPage(id: string) {
  if (id === currentPage.value || isAnimating.value) return
  const container = pageContainer.value
  if (!container) {
    currentPage.value = id
    return
  }

  isAnimating.value = true
  await flip(container, () => {
    currentPage.value = id
  })
  isAnimating.value = false
}
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
.example-hint {
  margin-bottom: 20px;
}

.nav-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.nav-btn {
  padding: 8px 20px;
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius);
  background: var(--mk-bg);
  color: var(--mk-text);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.nav-btn:hover {
  border-color: var(--mk-primary);
}
.nav-btn.active {
  background: var(--mk-primary);
  color: #fff;
  border-color: var(--mk-primary);
}

.page-container {
  overflow: hidden;
}
.page-content {
  /* ensures FLIP can measure layout changes */
}
.page-card {
  margin-bottom: 12px;
}

/* Vue Transition classes */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.transition-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 0.85rem;
  color: var(--mk-text-secondary);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mk-border);
  transition: background 0.3s;
}
.dot.active {
  background: var(--mk-primary);
  animation: pulse 0.8s ease infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
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
