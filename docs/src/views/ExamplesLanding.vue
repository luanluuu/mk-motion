<template>
  <div class="examples-page">
    <div class="examples-hero">
      <h1 class="examples-title">业务示例</h1>
      <p class="examples-desc">
        从真实业务场景出发，展示 MotionKit 各能力的组合用法。
        每个示例都是独立可运行的完整代码。
      </p>
    </div>

    <div class="examples-grid">
      <div
        class="example-card"
        v-for="example in examples"
        :key="example.id"
        :class="{ clickable: example.status === 'ready' }"
        @click="navigate(example)"
      >
        <div class="example-icon">{{ example.icon }}</div>
        <div class="example-info">
          <h3 class="example-name">{{ example.name }}</h3>
          <p class="example-desc">{{ example.desc }}</p>
          <span class="example-badge" :class="example.status">
            {{ example.status === 'ready' ? '已完成' : '开发中' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const examples = [
  {
    id: 'sortable-todo',
    name: 'SortableTodoList',
    desc: '拖拽排序待办列表 —— DraggableList + Spring 释放动画 + 撤销提示',
    icon: '📝',
    status: 'ready',
  },
  {
    id: 'sortable-table',
    name: 'SortableTableRows',
    desc: '表格行拖拽排序 —— DraggableList + Table 组件 + 数据持久化',
    icon: '📊',
    status: 'ready',
  },
  {
    id: 'animated-dialog',
    name: 'AnimatedDialog',
    desc: 'Spring 驱动的对话框弹出/关闭 —— Spring 物理弹入 + 遮罩渐显',
    icon: '💬',
    status: 'ready',
  },
  {
    id: 'route-transition',
    name: 'RouteTransition',
    desc: 'Vue Router 页面切换动画 —— FLIP 布局过渡 + 淡入淡出',
    icon: '🔀',
    status: 'ready',
  },
  {
    id: 'filterable-grid',
    name: 'FilterableGrid',
    desc: '筛选带动画的卡片网格 —— FLIP Grid + 过滤 + 排序 + 搜索',
    icon: '🔲',
    status: 'ready',
  },
  {
    id: 'number-counter',
    name: 'NumberCounter',
    desc: '数字滚动计数器 —— CountUp/Down + Spring 缓动 + 格式化',
    icon: '🔢',
    status: 'ready',
  },
]

function navigate(example: (typeof examples)[number]) {
  if (example.status !== 'ready') return
  router.push(`/examples/${example.id}`)
}
</script>

<style scoped>
.examples-page {
  max-width: 100%;
  padding: 0;
}

.examples-hero {
  text-align: center;
  padding: 80px 24px 48px;
  background: linear-gradient(
    180deg,
    var(--mk-bg) 0%,
    var(--mk-bg-secondary) 100%
  );
  border-bottom: 1px solid var(--mk-border);
}

.examples-title {
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0 0 16px;
  color: var(--mk-text);
}

.examples-desc {
  font-size: 1.07rem;
  color: var(--mk-text-secondary);
  max-width: 580px;
  margin: 0 auto;
  line-height: 1.7;
}

.examples-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 48px 80px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.example-card {
  background: var(--mk-bg);
  border: 1px solid var(--mk-border);
  border-radius: 12px;
  padding: 28px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.example-card:hover {
  border-color: var(--mk-primary);
  box-shadow: 0 4px 24px var(--mk-shadow);
}

.example-card.clickable {
  cursor: pointer;
}

.example-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--mk-bg-secondary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.example-info {
  flex: 1;
  min-width: 0;
}

.example-name {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--mk-text);
}

.example-desc {
  font-size: 0.9rem;
  color: var(--mk-text-secondary);
  line-height: 1.6;
  margin: 0 0 12px;
}

.example-badge {
  display: inline-block;
  font-size: 0.78rem;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 500;
}

.example-badge.ready {
  background: var(--mk-primary-muted, rgba(64, 158, 255, 0.1));
  color: var(--mk-primary);
}

.example-badge.planned {
  background: var(--mk-warning-muted, rgba(230, 162, 60, 0.1));
  color: var(--mk-warning, #e6a23c);
}

@media (max-width: 900px) {
  .examples-grid {
    padding: 24px;
    grid-template-columns: 1fr;
  }

  .examples-hero {
    padding: 48px 24px 32px;
  }
}
</style>
