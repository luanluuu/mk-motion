import { setupMkMotionDevTools } from 'mk-motion'

export function renderDevTools(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'none'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">DevTools</h1>
    <p class="doc-p">MotionKit 内置轻量级 DevTools，帮助开发者在浏览器中实时查看、调试所有活跃的弹簧动画。</p>

    <h2 class="doc-h2">🚀 启用方式</h2>
    <p class="doc-p">在应用入口调用一次 <code class="doc-code-inline">setupMkMotionDevTools()</code> 即可。</p>
    <pre class="doc-code-block"><code>import { setupMkMotionDevTools } from 'mk-motion'

setupMkMotionDevTools()
</code></pre>

    <h2 class="doc-h2">🎛 功能面板</h2>
    <ul class="doc-list">
      <li>实时列出所有活跃的 <code class="doc-code-inline">SpringAnimation</code></li>
      <li>查看每个动画的目标元素、当前属性值、弹簧参数</li>
      <li>支持暂停 / 恢复 / 停止单个动画</li>
      <li>拖拽 scrubber 进行 seek 预览</li>
    </ul>

    <h2 class="doc-h2">💡 使用建议</h2>
    <ul class="doc-list">
      <li>仅在开发环境启用，生产构建请移除调用。</li>
      <li>可与 Vue DevTools 同时使用，互不影响。</li>
      <li>对于大量并发动画，面板会自动折叠同类动画以提升性能。</li>
    </ul>

    <h2 class="doc-h2">演示</h2>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:16px;min-height:160px;">
        <p style="color:var(--mk-text-secondary);">DevTools 会自动注册到 <code>window.__MK_MOTION__</code></p>
        <div id="devtools-status" style="padding:12px 24px;background:var(--mk-surface);border:1px solid var(--mk-border);border-radius:8px;font-family:monospace;font-size:0.85rem;">未启用</div>
        <div id="btn-devtools"></div>
      </div>
    </div>
  `

  setTimeout(() => {
    const status = document.getElementById('devtools-status')!
    const btn = document.createElement('button')
    btn.textContent = '启用 DevTools'
    btn.className = 'mk-button mk-button--primary'
    btn.addEventListener('click', () => {
      setupMkMotionDevTools()
      status.textContent = '已启用 — 打开浏览器控制台查看 __MK_MOTION__'
      btn.disabled = true
    })
    document.getElementById('btn-devtools')!.appendChild(btn)
  }, 0)
}
