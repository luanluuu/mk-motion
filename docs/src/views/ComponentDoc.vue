<template>
  <div class="component-doc">
    <h1 class="doc-h1">{{ doc?.title || name }}</h1>
    <p class="doc-p">{{ doc?.desc || '文档建设中...' }}</p>

    <template v-if="doc">
      <h2 class="doc-h2" id="examples">示例</h2>
      <div v-for="(demo, i) in doc.demos" :key="i" class="demo-section">
        <h3 class="doc-h3" :id="`demo-${i}`">{{ demo.title }}</h3>
        <div class="doc-demo">
          <div class="doc-demo-stage">
            <div :ref="(el) => setStageRef(el, i)" style="width: 100%"></div>
          </div>
          <div class="doc-demo-code">
            <button
              class="doc-demo-copy"
              :class="{ copied: copiedIndex === i }"
              @click="copyCode(demo.code, i)"
            >
              {{ copiedIndex === i ? '已复制 ✓' : '复制' }}
            </button>
            <pre><code class="language-typescript">{{ demo.code }}</code></pre>
          </div>
        </div>
      </div>

      <h2 class="doc-h2" id="api">API</h2>
      <MkTable :columns="apiColumns" :data="apiData" :page-size="100" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { MkTable } from '@luanlu/mk-motion/vue'
import {
  componentDocs,
  type ComponentDoc,
} from '../data/component-docs.js'

const props = defineProps<{ name: string }>()

const doc = computed(() => componentDocs[props.name])
const stageRefs = ref<Record<number, HTMLElement | null>>({})
const copiedIndex = ref<number | null>(null)

const apiColumns = [
  {
    key: 'prop',
    title: '属性',
    render: (v: string) =>
      `<code style="color:var(--mk-indigo-400);font-family:var(--mk-font-mono);font-size:0.85em;">${v}</code>`,
  },
  {
    key: 'type',
    title: '类型',
    render: (v: string) =>
      `<span style="color:var(--mk-green-400);">${v}</span>`,
  },
  { key: 'default', title: '默认值' },
  { key: 'desc', title: '说明' },
]
const apiData = computed(() => doc.value?.api || [])

function setStageRef(el: HTMLElement | null, i: number) {
  if (el) stageRefs.value[i] = el
}

function copyCode(code: string, index: number) {
  navigator.clipboard.writeText(code)
  copiedIndex.value = index
  setTimeout(() => {
    if (copiedIndex.value === index) copiedIndex.value = null
  }, 1500)
}

function renderDemos() {
  if (!doc.value) return
  nextTick(() => {
    doc.value.demos.forEach((demo: ComponentDoc['demos'][number], i: number) => {
      const el = stageRefs.value[i]
      if (el) {
        el.innerHTML = ''
        demo.init(el)
      }
    })
    if (window.Prism) Prism.highlightAll()
    renderToc()
  })
}

function renderToc() {
  const toc = document.getElementById('toc')
  if (!toc || !doc.value) {
    if (toc) toc.style.display = 'none'
    return
  }
  toc.style.display = 'block'
  const ids = [
    'examples',
    ...doc.value.demos.map((_, i: number) => `demo-${i}`),
    'api',
  ]
  toc.innerHTML =
    '<div class="doc-toc-title">目录</div>' +
    ids
      .map((id) => {
        const el = document.getElementById(id)
        const text = el
          ? el.tagName.match(/^H/i)
            ? el.textContent
            : el.previousElementSibling?.textContent || id
          : id
        return `<a href="#${id}" onclick="event.preventDefault();document.getElementById('${id}').scrollIntoView({behavior:'smooth'})">${text}</a>`
      })
      .join('')
}

onMounted(renderDemos)
watch(
  () => props.name,
  () => {
    stageRefs.value = {}
    renderDemos()
  }
)
</script>

<style scoped>
.component-doc {
  padding-bottom: 80px;
}

.demo-section {
  margin-bottom: 8px;
}
</style>
