export function renderNuxt(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'none'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">Nuxt 3 集成</h1>
    <p class="doc-p">MotionKit 提供官方 Nuxt 3 模块，实现组件、composables 与 CSS 的零配置自动导入。</p>

    <h2 class="doc-h2">📦 安装</h2>
    <pre class="doc-code-block"><code>npm install @luanlu/mk-motion
</code></pre>

    <h2 class="doc-h2">⚙️ 配置 nuxt.config.ts</h2>
    <pre class="doc-code-block"><code>export default defineNuxtConfig({
  modules: ['@luanlu/mk-motion/nuxt'],
  mkMotion: {
    // 可选：按需导入组件，默认导入全部
    components: ['Button', 'Input', 'Card'],
    // 自动导入 composables
    composables: true,
    // 自动导入 CSS
    importStyle: true,
  },
})
</code></pre>

    <h2 class="doc-h2">🧩 使用组件</h2>
    <p class="doc-p">配置完成后，可直接在模板中使用 <code class="doc-code-inline">MkButton</code>、<code class="doc-code-inline">MkInput</code> 等组件，无需手动 import。</p>
    <pre class="doc-code-block"><code>&lt;template&gt;
  &lt;MkButton type="primary"&gt;主要按钮&lt;/MkButton&gt;
  &lt;MkInput v-model="name" placeholder="请输入" /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
const name = ref('')
&lt;/script&gt;
</code></pre>

    <h2 class="doc-h2">🔌 使用 Composables</h2>
    <pre class="doc-code-block"><code>&lt;script setup lang="ts"&gt;
const { isDark, toggle } = useMkTheme()
const motion = useMkMotion(refEl, { hover: 'lift', enter: 'fadeIn' })
&lt;/script&gt;
</code></pre>

    <h2 class="doc-h2">SSR 安全</h2>
    <p class="doc-p">模块内部会对仅浏览器可用的 API（如 <code class="doc-code-inline">window</code>、<code class="doc-code-inline">document</code>）做保护，确保服务端渲染不会报错。</p>
  `
}
