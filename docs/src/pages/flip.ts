import {
  flip,
  filterGrid,
  sortGrid,
  shuffleGrid,
  DraggableList,
} from '@luanlu/mk-motion'

export function renderFlip(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'none'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">FLIP 动画</h1>
    <p class="doc-p">FLIP（First / Last / Invert / Play）是一种高性能布局动画技术。MotionKit 提供 <code class="doc-code-inline">flip</code>、<code class="doc-code-inline">filterGrid</code>、<code class="doc-code-inline">sortGrid</code>、<code class="doc-code-inline">shuffleGrid</code> 以及 <code class="doc-code-inline">DraggableList</code> 等封装。</p>

    <h2 class="doc-h2">🔄 核心 flip</h2>
    <p class="doc-p">记录元素初始位置 → 应用变化 → 通过 transform 动画回到新位置。</p>
    <pre class="doc-code-block"><code>import { flip } from '@luanlu/mk-motion'

await flip(container, () => {
  // 改变 DOM 顺序或样式
  container.appendChild(first)
})
</code></pre>

    <h2 class="doc-h2">📊 网格筛选</h2>
    <div class="doc-demo">
      <div class="doc-demo-toolbar">
        <button id="flip-all" class="mk-button mk-button--primary mk-button--small">全部</button>
        <button id="flip-fruits" class="mk-button mk-button--success mk-button--small">水果</button>
        <button id="flip-animals" class="mk-button mk-button--warning mk-button--small">动物</button>
        <button id="flip-shuffle" class="mk-button mk-button--danger mk-button--small">打乱</button>
      </div>
      <div class="doc-demo-stage" style="justify-content:center;">
        <div id="flip-grid" style="display:grid;grid-template-columns:repeat(4,70px);gap:10px;">
          <div data-flip-item data-category="fruit" style="width:70px;height:70px;border-radius:10px;background:linear-gradient(135deg,#ff6b6b,#ee5a5a);display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;">🍎</div>
          <div data-flip-item data-category="animal" style="width:70px;height:70px;border-radius:10px;background:linear-gradient(135deg,#4ecdc4,#44a08d);display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;">🐶</div>
          <div data-flip-item data-category="fruit" style="width:70px;height:70px;border-radius:10px;background:linear-gradient(135deg,#f7b731,#e58e26);display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;">🍌</div>
          <div data-flip-item data-category="animal" style="width:70px;height:70px;border-radius:10px;background:linear-gradient(135deg,#5f27cd,#341f97);display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;">🐱</div>
          <div data-flip-item data-category="fruit" style="width:70px;height:70px;border-radius:10px;background:linear-gradient(135deg,#a29bfe,#6c5ce7);display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;">🍇</div>
          <div data-flip-item data-category="animal" style="width:70px;height:70px;border-radius:10px;background:linear-gradient(135deg,#fd79a8,#e84393);display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;">🐰</div>
          <div data-flip-item data-category="fruit" style="width:70px;height:70px;border-radius:10px;background:linear-gradient(135deg,#fab1a0,#e17055);display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;">🍊</div>
          <div data-flip-item data-category="animal" style="width:70px;height:70px;border-radius:10px;background:linear-gradient(135deg,#00b894,#00cec9);display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;">🦊</div>
        </div>
      </div>
    </div>

    <h2 class="doc-h2">🖐 拖拽排序</h2>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="min-height:220px;">
        <ul id="flip-drag-list" style="list-style:none;padding:0;margin:0;width:280px;border:1px solid var(--mk-border);border-radius:12px;overflow:hidden;background:var(--mk-bg-elevated);">
          <li data-draggable style="padding:12px 16px;border-bottom:1px solid var(--mk-border);background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;"><span>☰</span><span style="flex:1;">🍎 苹果</span></li>
          <li data-draggable style="padding:12px 16px;border-bottom:1px solid var(--mk-border);background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;"><span>☰</span><span style="flex:1;">🍌 香蕉</span></li>
          <li data-draggable style="padding:12px 16px;border-bottom:1px solid var(--mk-border);background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;"><span>☰</span><span style="flex:1;">🍇 葡萄</span></li>
          <li data-draggable style="padding:12px 16px;border-bottom:1px solid var(--mk-border);background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;"><span>☰</span><span style="flex:1;">🍊 橙子</span></li>
          <li data-draggable style="padding:12px 16px;background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;"><span>☰</span><span style="flex:1;">🍓 草莓</span></li>
        </ul>
      </div>
    </div>

    <h2 class="doc-h2">API 速查</h2>
    <pre class="doc-code-block"><code>import { flip, filterGrid, sortGrid, shuffleGrid, DraggableList } from '@luanlu/mk-motion'

// 筛选
filterGrid(container, '[data-item]', () => {
  items.forEach(el => el.style.display = shouldShow(el) ? '' : 'none')
})

// 排序
sortGrid(container, (a, b) => a.textContent!.localeCompare(b.textContent!))

// 打乱
shuffleGrid(container, '[data-item]')

// 拖拽排序
new DraggableList(container, { onReorder: (from, to) => {} })
</code></pre>
  `

  setTimeout(() => {
    const grid = document.getElementById('flip-grid')!
    const items = Array.from(
      grid.querySelectorAll<HTMLElement>('[data-flip-item]')
    )

    document.getElementById('flip-all')!.addEventListener('click', () => {
      filterGrid(grid, '[data-flip-item]', () =>
        items.forEach((el) => (el.style.display = 'flex'))
      )
    })
    document.getElementById('flip-fruits')!.addEventListener('click', () => {
      filterGrid(grid, '[data-flip-item]', () =>
        items.forEach((el) => {
          el.style.display = el.dataset.category === 'fruit' ? 'flex' : 'none'
        })
      )
    })
    document.getElementById('flip-animals')!.addEventListener('click', () => {
      filterGrid(grid, '[data-flip-item]', () =>
        items.forEach((el) => {
          el.style.display = el.dataset.category === 'animal' ? 'flex' : 'none'
        })
      )
    })
    document.getElementById('flip-shuffle')!.addEventListener('click', () => {
      shuffleGrid(grid, '[data-flip-item]')
    })

    new DraggableList(document.getElementById('flip-drag-list')!, {
      duration: 180,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    })
  }, 0)
}
