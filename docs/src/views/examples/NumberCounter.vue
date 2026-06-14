<template>
  <div class="example-page">
    <div class="example-hero">
      <h1 class="example-title">🔢 NumberCounter</h1>
      <p class="example-desc">
        数字滚动计数器 — CountUp/Down + Spring 缓动 + 格式化。
      </p>
    </div>

    <div class="example-body">
      <div class="counter-showcase">
        <!-- Main counter -->
        <div class="counter-main">
          <div ref="mainCounter" class="counter-main__value">0</div>
          <div class="counter-main__label">主计数器</div>
        </div>

        <!-- Multi counters -->
        <MkRow :gutter="16" style="margin-top: 32px">
          <MkCol :span="6" :xs="12" v-for="stat in stats" :key="stat.label">
            <MkCard class="stat-card" shadow="hover">
              <div :ref="(el) => setStatRef(stat.label, el)" class="stat-value">
                0
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </MkCard>
          </MkCol>
        </MkRow>

        <!-- Controls -->
        <div class="counter-controls">
          <p class="control-label">设置目标值并启动动画</p>
          <MkSpace style="flex-wrap: wrap">
            <MkInput
              v-model.number="targetValue"
              type="number"
              placeholder="输入数值"
              style="width: 140px"
            />
            <MkButton type="primary" @click="runMainCounter">CountUp</MkButton>
            <MkButton type="warning" @click="runMainCounterDown"
              >CountDown</MkButton
            >
            <MkButton plain @click="runAllCounters">全部滚动</MkButton>
          </MkSpace>
        </div>

        <!-- Presets -->
        <div class="counter-presets">
          <MkTag size="small" style="cursor: pointer" @click="quickSet(1280)"
            >1280</MkTag
          >
          <MkTag size="small" style="cursor: pointer" @click="quickSet(9999)"
            >9999</MkTag
          >
          <MkTag size="small" style="cursor: pointer" @click="quickSet(24000)"
            >24,000</MkTag
          >
          <MkTag size="small" style="cursor: pointer" @click="quickSet(3.14159)"
            >π</MkTag
          >
        </div>
      </div>

      <div class="example-code-hint">
        <p>
          核心 API：<code>countUp</code> / <code>CountUp</code> 类，支持
          duration、easing、格式化
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { countUp } from '@luanlu/mk-motion'

interface StatItem {
  label: string
  value: number
  suffix: string
  decimals: number
}

const mainCounter = ref<HTMLElement | null>(null)
const targetValue = ref(2024)

const stats: StatItem[] = [
  { label: '用户数', value: 58720, suffix: '', decimals: 0 },
  { label: '好评率', value: 98.6, suffix: '%', decimals: 1 },
  { label: '延迟 (ms)', value: 12.4, suffix: '', decimals: 1 },
  { label: '运行天数', value: 365, suffix: '', decimals: 0 },
]

const statRefs: Record<string, HTMLElement | null> = {}
function setStatRef(label: string, el: HTMLElement | null) {
  if (el) statRefs[label] = el
}

onMounted(() => {
  setTimeout(() => runAllCounters(), 400)
})

async function runMainCounter() {
  if (!mainCounter.value) return
  await countUp(mainCounter.value, targetValue.value, {
    duration: 1500,
    decimals: Number.isInteger(targetValue.value) ? 0 : 2,
  })
}

async function runMainCounterDown() {
  if (!mainCounter.value) return
  // First count up to a high value, then down
  await countUp(mainCounter.value, Math.max(targetValue.value + 500, 500), {
    duration: 300,
    decimals: 0,
  })
  await countUp(mainCounter.value, targetValue.value, {
    duration: 1200,
    decimals: 0,
  })
}

async function runAllCounters() {
  const promises = [
    mainCounter.value
      ? countUp(mainCounter.value, targetValue.value, {
          duration: 1500,
          decimals: Number.isInteger(targetValue.value) ? 0 : 2,
        })
      : Promise.resolve(),
    ...stats.map((stat) => {
      const el = statRefs[stat.label]
      return el
        ? countUp(el, stat.value, {
            duration: 1800,
            decimals: stat.decimals,
            suffix: stat.suffix,
          })
        : Promise.resolve()
    }),
  ]
  await Promise.all(promises)
}

function quickSet(val: number) {
  targetValue.value = val
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

.counter-showcase {
  text-align: center;
}
.counter-main {
  margin-bottom: 16px;
}
.counter-main__value {
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--mk-primary), #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}
.counter-main__label {
  font-size: 0.9rem;
  color: var(--mk-text-secondary);
  margin-top: 4px;
}

.stat-card {
  text-align: center;
  padding: 8px 0;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--mk-primary);
}
.stat-label {
  font-size: 0.8rem;
  color: var(--mk-text-secondary);
  margin-top: 4px;
}

.counter-controls {
  margin-top: 32px;
}
.control-label {
  font-size: 0.9rem;
  color: var(--mk-text-secondary);
  margin: 0 0 12px;
}

.counter-presets {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.example-code-hint {
  margin-top: 32px;
  padding: 16px;
  background: var(--mk-surface);
  border-radius: var(--mk-radius-lg);
  font-size: 0.85rem;
  color: var(--mk-text-secondary);
  text-align: left;
}
.example-code-hint code {
  background: var(--mk-bg-elevated);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  font-size: 0.82rem;
}
</style>
