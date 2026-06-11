<template>
  <div class="mk-home">
    <!-- Hero: Answer "What is MotionKit?" -->
    <section class="mk-hero">
      <div class="mk-hero__glow" />
      <div class="mk-hero__content">
        <h1 class="mk-hero__title">
          MotionKit
          <span class="mk-hero__subtitle">面向现代 Web 的动画驱动 UI 系统</span>
        </h1>
        <p class="mk-hero__lead">
          50+ Vue 3 组件深度绑定物理弹簧引擎。
          FLIP 布局动画、手势交互、滚动驱动 — 全部开箱即用。
        </p>
        <MkSpace size="large" class="mk-hero__actions">
          <MkButton type="primary" size="large" @click="goTo('components')">开始使用</MkButton>
          <MkButton size="large" plain @click="scrollTo('playground')">在线体验</MkButton>
        </MkSpace>
      </div>
    </section>

    <!-- Capabilities: Answer "Why MotionKit?" -->
    <section class="mk-section" id="why">
      <h2 class="mk-section__title">四大核心能力</h2>
      <p class="mk-section__desc">30 秒了解 MotionKit 能做什么。</p>
      <MkRow :gutter="20">
        <MkCol :span="12" :sm="24" v-for="cap in capabilities" :key="cap.title">
          <MkCard class="mk-cap-card" shadow="hover">
            <div class="mk-cap-card__icon">{{ cap.icon }}</div>
            <h3>{{ cap.title }}</h3>
            <p class="mk-cap-card__desc">{{ cap.desc }}</p>
            <ul class="mk-cap-card__tags">
              <li v-for="tag in cap.tags" :key="tag">
                <MkTag size="small" type="info">{{ tag }}</MkTag>
              </li>
            </ul>
          </MkCard>
        </MkCol>
      </MkRow>
    </section>

    <!-- Quick Start: Answer "How do I start?" -->
    <section class="mk-section mk-section--dim" id="quickstart">
      <h2 class="mk-section__title">一分钟上手</h2>
      <p class="mk-section__desc">安装、导入、使用 — 三步开始。</p>
      <div class="mk-code-blocks">
        <div class="mk-code-block">
          <div class="mk-code-block__label">Step 1 安装</div>
          <pre><code>npm install @luanlu/mk-motion</code></pre>
        </div>
        <div class="mk-code-block">
          <div class="mk-code-block__label">Step 2 导入</div>
          <pre><code>import { createApp } from 'vue'
import MkMotion from '@luanlu/mk-motion/vue'
import '@luanlu/mk-motion/css'

const app = createApp(App)
app.use(MkMotion)</code></pre>
        </div>
        <div class="mk-code-block">
          <div class="mk-code-block__label">Step 3 使用</div>
          <pre><code>&lt;template&gt;
  &lt;MkButton type="primary"&gt;点击我&lt;/MkButton&gt;
  &lt;MkCard title="Hello" shadow="hover"&gt;
    每个组件都有弹簧动画反馈
  &lt;/MkCard&gt;
&lt;/template&gt;</code></pre>
        </div>
      </div>
      <MkSpace justify="center" style="margin-top: 28px;">
        <MkButton type="primary" @click="goTo('components')">浏览全部组件</MkButton>
        <MkButton plain @click="goTo('animations')">动画引擎文档</MkButton>
      </MkSpace>
    </section>

    <!-- Playground: Interactive demo -->
    <section class="mk-section" id="playground">
      <h2 class="mk-section__title">实时交互体验</h2>
      <p class="mk-section__desc">以下组件全部来自 MotionKit，点击、拖拽、输入 — 感受弹簧反馈。</p>

      <MkRow :gutter="24">
        <!-- Buttons -->
        <MkCol :span="12" :md="24">
          <MkCard title="弹簧按钮" class="mk-play-card">
            <MkSpace>
              <MkButton type="primary">主按钮</MkButton>
              <MkButton type="success" spring>成功</MkButton>
              <MkButton type="warning" round>圆角</MkButton>
              <MkButton type="danger" plain>危险</MkButton>
              <MkButton loading>加载中</MkButton>
            </MkSpace>
          </MkCard>
        </MkCol>

        <!-- Input + Switch -->
        <MkCol :span="12" :md="24">
          <MkCard title="输入与开关" class="mk-play-card">
            <MkSpace direction="vertical" size="large" style="width: 100%;">
              <MkInput v-model="demoText" placeholder="输入点什么，感受聚焦动画…" clearable style="width: 100%;" />
              <MkSpace>
                <MkSwitch v-model="demoSwitch" />
                <MkTag :type="demoSwitch ? 'success' : 'info'">
                  {{ demoSwitch ? '已开启' : '已关闭' }}
                </MkTag>
              </MkSpace>
            </MkSpace>
          </MkCard>
        </MkCol>

        <!-- Tabs -->
        <MkCol :span="12" :md="24">
          <MkCard title="动画标签页" class="mk-play-card">
            <MkTabs v-model="activeTab" :items="tabItems" />
            <div class="mk-tab-panel">
              {{ tabItems.find((t: TabItem) => t.key === activeTab)?.content }}
            </div>
          </MkCard>
        </MkCol>

        <!-- Progress + Alert -->
        <MkCol :span="12" :md="24">
          <MkCard title="进度与反馈" class="mk-play-card">
            <MkSpace direction="vertical" size="large" style="width: 100%;">
              <MkProgress :percentage="progress" status="active" />
              <MkSpace>
                <MkButton size="small" @click="progress = Math.max(0, progress - 20)">-</MkButton>
                <MkButton size="small" @click="progress = Math.min(100, progress + 20)">+</MkButton>
              </MkSpace>
              <MkAlert v-if="progress >= 100" type="success" title="完成" :closable="false">
                进度已达 100%，弹簧填充动画完成。
              </MkAlert>
            </MkSpace>
          </MkCard>
        </MkCol>

        <!-- Select -->
        <MkCol :span="12" :md="24">
          <MkCard title="选择器" class="mk-play-card">
            <MkSelect
              v-model="demoSelect"
              :options="selectOptions"
              placeholder="选择一个动画"
              clearable
              style="width: 240px;"
            />
            <p class="mk-play-card__hint">你选择了：{{ demoSelect || '无' }}</p>
          </MkCard>
        </MkCol>

        <!-- Table -->
        <MkCol :span="12" :md="24">
          <MkCard title="数据表格" class="mk-play-card">
            <MkTable
              :columns="tableColumns"
              :data="tableData"
              :page-size="4"
              style="width: 100%;"
            />
          </MkCard>
        </MkCol>
      </MkRow>
    </section>

    <!-- CTA -->
    <section class="mk-section mk-cta">
      <h2 class="mk-cta__title">准备好让界面动起来了？</h2>
      <p class="mk-cta__desc">MotionKit 完全开源，MIT 协议。</p>
      <MkSpace justify="center">
        <MkButton type="primary" size="large" @click="goTo('components')">浏览组件</MkButton>
        <MkButton size="large" plain @click="goTo('theme-generator')">主题生成器</MkButton>
      </MkSpace>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { goTo } from '../router.js'

interface Capability {
  icon: string
  title: string
  desc: string
  tags: string[]
}

interface TabItem {
  key: string
  label: string
  content: string
}

const capabilities: Capability[] = [
  {
    icon: '🌀',
    title: '动画引擎',
    desc: '基于胡克定律的物理弹簧引擎，stiffness / damping / mass 可调。内置 FLIP、ScrollTrigger、CountUp、Typewriter、Parallax 等 30+ 动画预设。',
    tags: ['Spring', 'FLIP', 'ScrollTrigger', 'CountUp'],
  },
  {
    icon: '👋',
    title: '手势与交互',
    desc: 'Pan / Swipe / Pinch / Tap / LongPress 全部内置，释放自动弹簧回弹。拖拽排序支持回调、占位样式、禁用节点、reduced-motion。',
    tags: ['Pan', 'Swipe', 'Pinch', 'DragSort'],
  },
  {
    icon: '🧩',
    title: 'Vue 3 组件',
    desc: '50+ 组件覆盖通用、布局、导航、数据、反馈、表单六大类别。全部深度绑定弹簧动画，无需额外配置。',
    tags: ['Button', 'Card', 'Table', 'Tabs'],
  },
  {
    icon: '🔧',
    title: '开发工具集成',
    desc: 'Vite 插件自动注入 CSS，Nuxt 模块开箱即用，CLI 工具脚手架项目。主题生成器在线实时预览 Design Token。',
    tags: ['Vite', 'Nuxt', 'CLI', 'Theme'],
  },
]

const demoText = ref('')
const demoSwitch = ref(true)
const activeTab = ref('spring')
const tabItems: TabItem[] = [
  { key: 'spring', label: '弹簧', content: 'MotionKit 的弹簧物理引擎让每一次交互都有真实的重量感。' },
  { key: 'flip', label: 'FLIP', content: '布局变化自动计算 First / Last / Invert / Play，元素平滑补位。' },
  { key: 'gesture', label: '手势', content: 'Pan、Swipe、Pinch、Tap、LongPress 全部内置，释放即弹簧回弹。' },
]
const progress = ref(40)
const demoSelect = ref('')
const selectOptions = [
  { label: '淡入淡出', value: 'fade' },
  { label: '弹簧缩放', value: 'spring' },
  { label: 'FLIP 重排', value: 'flip' },
  { label: '粒子爆炸', value: 'particle' },
]
const tableColumns = [
  { key: 'name', title: '组件' },
  { key: 'category', title: '分类' },
  { key: 'status', title: '状态' },
]
const tableData = [
  { name: 'MkButton', category: '通用', status: '稳定' },
  { name: 'MkTable', category: '数据', status: '稳定' },
  { name: 'MkDatePicker', category: '表单', status: '稳定' },
  { name: 'MkTree', category: '数据', status: '稳定' },
]

function scrollTo(id: string) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.mk-home {
  --mk-home-max: 1040px;
  color: var(--mk-text);
}

/* ── Hero ── */
.mk-hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  padding: 0 24px;
}
.mk-hero__glow {
  position: absolute;
  top: -20%;
  left: 50%;
  width: 800px;
  height: 800px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 60%);
  z-index: 0;
  pointer-events: none;
}
.mk-hero__content {
  position: relative;
  z-index: 1;
  max-width: 700px;
}
.mk-hero__title {
  font-size: clamp(2.2rem, 5.5vw, 3.4rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 8px;
  letter-spacing: -0.04em;
  color: var(--mk-primary);
}
.mk-hero__subtitle {
  display: block;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  font-weight: 500;
  color: var(--mk-text);
  letter-spacing: -0.01em;
  margin-top: 4px;
}
.mk-hero__lead {
  font-size: 1.05rem;
  color: var(--mk-text-secondary);
  line-height: 1.7;
  margin: 16px 0 32px;
}
.mk-hero__actions {
  justify-content: center;
}

/* ── Section shared ── */
.mk-section {
  padding: 88px 24px;
  max-width: var(--mk-home-max);
  margin: 0 auto;
}
.mk-section--dim {
  background: var(--mk-surface);
  max-width: 100%;
}
.mk-section__title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.mk-section__desc {
  text-align: center;
  color: var(--mk-text-secondary);
  font-size: 0.95rem;
  margin: 0 0 44px;
}

/* ── Capability cards ── */
.mk-cap-card {
  height: 100%;
  transition: transform 0.25s ease;
}
.mk-cap-card:hover {
  transform: translateY(-3px);
}
.mk-cap-card__icon {
  font-size: 1.8rem;
  margin-bottom: 8px;
}
.mk-cap-card h3 {
  margin: 0 0 8px;
  font-size: 1.05rem;
}
.mk-cap-card__desc {
  margin: 0 0 12px;
  color: var(--mk-text-secondary);
  font-size: 0.875rem;
  line-height: 1.65;
}
.mk-cap-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ── Code blocks ── */
.mk-code-blocks {
  max-width: 620px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mk-code-block {
  background: var(--mk-bg-elevated);
  border: 1px solid var(--mk-border);
  border-radius: var(--mk-radius-lg);
  padding: 0;
  overflow: hidden;
}
.mk-code-block__label {
  padding: 8px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mk-text-tertiary);
  background: var(--mk-surface);
  border-bottom: 1px solid var(--mk-border);
}
.mk-code-block pre {
  margin: 0;
  padding: 14px 20px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.82rem;
  color: var(--mk-text-secondary);
  overflow-x: auto;
  line-height: 1.6;
}

/* ── Playground ── */
.mk-play-card {
  margin-bottom: 24px;
}
.mk-play-card__hint {
  margin: 12px 0 0;
  font-size: 0.85rem;
  color: var(--mk-text-secondary);
}
.mk-tab-panel {
  padding: 16px 0 0;
  color: var(--mk-text-secondary);
  font-size: 0.95rem;
}

/* ── CTA ── */
.mk-cta {
  text-align: center;
  background: linear-gradient(180deg, transparent, rgba(99,102,241,0.05));
  max-width: 100%;
}
.mk-cta__title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.mk-cta__desc {
  color: var(--mk-text-secondary);
  margin: 0 0 24px;
}

@media (max-width: 768px) {
  .mk-section { padding: 56px 20px; }
  .mk-hero__title { font-size: 1.9rem; }
  .mk-hero { min-height: 60vh; }
}
</style>
