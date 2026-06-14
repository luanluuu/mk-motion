import { particleBurst, splitText, waveText, glitch } from '@luanlu/mk-motion'

export function renderEffects(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'none'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">视觉特效</h1>
    <p class="doc-p">MotionKit 提供粒子爆炸、文字分割、波浪文字、赛博故障等特效，适用于营销页、加载状态与交互反馈。</p>

    <h2 class="doc-h2">💥 粒子爆炸</h2>
    <p class="doc-p"><code class="doc-code-inline">particleBurst</code> 在指定坐标触发彩色粒子，支持自定义颜色、数量与生命周期。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;min-height:120px;">
        <button id="btn-particle" class="mk-button mk-button--danger mk-button--large">💥 点我爆炸</button>
      </div>
    </div>

    <h2 class="doc-h2">✂️ 文字分割</h2>
    <p class="doc-p"><code class="doc-code-inline">splitText</code> 将文本拆分为独立字符或单词，便于配合 GSAP 或 CSS 动画逐字控制。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:12px;min-height:120px;">
        <div id="split-target" style="font-size:1.5rem;font-weight:700;color:var(--mk-primary);">MotionKit</div>
        <button id="btn-split" class="mk-button mk-button--primary mk-button--small">拆分字符</button>
      </div>
    </div>

    <h2 class="doc-h2">🌊 波浪文字</h2>
    <p class="doc-p"><code class="doc-code-inline">waveText</code> 让文字像波浪一样上下起伏。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;min-height:100px;">
        <div id="wave-target" style="font-size:1.5rem;font-weight:700;letter-spacing:2px;color:var(--mk-success);">~ MotionKit Waves ~</div>
      </div>
    </div>

    <h2 class="doc-h2">🩻 赛博故障</h2>
    <p class="doc-p"><code class="doc-code-inline">glitch</code> 提供随机切片 + RGB 色散的故障效果。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:16px;min-height:140px;">
        <div id="glitch-target" style="font-size:2rem;font-weight:800;letter-spacing:4px;color:#fff;text-shadow:0 0 20px rgba(99,102,241,0.5);">SYSTEM_READY</div>
        <button id="btn-glitch" class="mk-button mk-button--warning mk-button--small">⚡ 触发故障</button>
      </div>
    </div>

    <h2 class="doc-h2">代码示例</h2>
    <pre class="doc-code-block"><code>import { particleBurst, splitText, waveText, glitch } from '@luanlu/mk-motion'

// 粒子爆炸
particleBurst({ x: 100, y: 100, colors: ['#f56c6c', '#67c23a'] })

// 文字拆分
const chars = splitText('#title')

// 波浪文字
waveText('#title') // 返回清理函数

// 故障效果
glitch('#title', 400, 6)
</code></pre>
  `

  setTimeout(() => {
    document.getElementById('btn-particle')!.addEventListener('click', (e) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      particleBurst({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        count: 40,
        colors: [
          '#f56c6c',
          '#e6a23c',
          '#67c23a',
          '#409eff',
          '#a855f7',
          '#ec4899',
        ],
      })
    })

    const splitTarget = document.getElementById('split-target')!
    document.getElementById('btn-split')!.addEventListener('click', () => {
      splitText(splitTarget)
    })

    const waveCleanup = waveText(document.getElementById('wave-target')!)

    const glitchTarget = document.getElementById('glitch-target')!
    document.getElementById('btn-glitch')!.addEventListener('click', () => {
      glitch(glitchTarget, 400, 6)
    })

    return () => {
      waveCleanup?.()
    }
  }, 0)
}
