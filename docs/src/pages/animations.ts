import { createButton } from '@luanlu/mk-motion/legacy'
import {
  Animator,
  withMotion,
  springTo,
  springStagger,
  springSequence,
  SpringAnimation,
  flip,
  filterGrid,
  shuffleGrid,
  DraggableList,
} from '@luanlu/mk-motion'

// ─── Inline: Typewriter ───────────────────────────────────────────
function typeWrite(el: HTMLElement, text: string, speed = 60) {
  el.textContent = ''
  el.style.borderRight = '2px solid currentColor'
  let i = 0
  return new Promise<void>((resolve) => {
    const tick = () => {
      if (i >= text.length) {
        el.style.borderRight = 'none'
        resolve()
        return
      }
      el.textContent += text[i++]
      setTimeout(tick, speed)
    }
    tick()
  })
}

// ─── Inline: CountUp ──────────────────────────────────────────────
function countUp(el: HTMLElement, end: number, dur = 2000) {
  const start = performance.now()
  return new Promise<void>((resolve) => {
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const v = Math.floor((1 - Math.pow(1 - p, 3)) * end)
      el.textContent = v.toLocaleString()
      if (p < 1) requestAnimationFrame(tick)
      else {
        el.textContent = end.toLocaleString()
        resolve()
      }
    }
    requestAnimationFrame(tick)
  })
}

// ─── Inline: WaveText ─────────────────────────────────────────────
function waveText(el: HTMLElement) {
  const text = el.textContent ?? ''
  el.innerHTML = ''
  el.style.display = 'inline-block'
  const spans = [...text].map((ch) => {
    const s = document.createElement('span')
    s.textContent = ch === ' ' ? '\u00A0' : ch
    s.style.display = 'inline-block'
    el.appendChild(s)
    return s
  })
  let t = 0,
    id = 0
  const loop = () => {
    t += 0.08
    spans.forEach(
      (s, i) =>
        (s.style.transform = `translateY(${Math.sin(t + i * 0.15) * 12}px)`)
    )
    id = requestAnimationFrame(loop)
  }
  id = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(id)
    el.style.display = ''
  }
}

// ─── Inline: Glitch ───────────────────────────────────────────────
function glitch(el: HTMLElement, dur = 300, intensity = 5) {
  const orig = el.style.cssText,
    steps = intensity * 2
  return new Promise<void>((resolve) => {
    let i = 0
    const run = () => {
      if (i >= steps) {
        el.style.cssText = orig
        el.style.textShadow = ''
        resolve()
        return
      }
      const x = (Math.random() - 0.5) * intensity * 4
      el.style.transform = `translateX(${x}px)`
      el.style.clipPath = `inset(${Math.random() * 80}% 0 ${Math.random() * 80}% 0)`
      el.style.textShadow = `#ff0040 ${x}px 0, #00ffff ${-x}px 0`
      i++
      setTimeout(run, dur / steps)
    }
    run()
  })
}

// ─── Inline: Magnetic ─────────────────────────────────────────────
function magnetic(el: HTMLElement) {
  el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < 150) {
      const f = 0.4 * (1 - d / 150)
      el.style.transform = `translate(${dx * f}px, ${dy * f}px)`
    } else el.style.transform = ''
  }
  document.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', () => (el.style.transform = ''))
  return () => document.removeEventListener('mousemove', onMove)
}

// ─── Inline: Ripple ───────────────────────────────────────────────
function addRipple(el: HTMLElement) {
  el.style.position = 'relative'
  el.style.overflow = 'hidden'
  const handler = (e: MouseEvent) => {
    const r = el.getBoundingClientRect(),
      s = Math.max(r.width, r.height)
    const d = document.createElement('span')
    Object.assign(d.style, {
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.35)',
      width: s + 'px',
      height: s + 'px',
      left: e.clientX - r.left - s / 2 + 'px',
      top: e.clientY - r.top - s / 2 + 'px',
      pointerEvents: 'none',
      transform: 'scale(0)',
      opacity: '1',
    })
    el.appendChild(d)
    d.animate(
      [
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(2.5)', opacity: 0 },
      ],
      { duration: 600, easing: 'ease-out' }
    ).onfinish = () => d.remove()
  }
  el.addEventListener('click', handler)
  return () => el.removeEventListener('click', handler)
}

// ─── Inline: Shimmer ──────────────────────────────────────────────
function shimmer(el: HTMLElement) {
  const orig = el.style.cssText
  el.style.background = '#1e293b'
  el.style.position = 'relative'
  el.style.overflow = 'hidden'
  const s = document.createElement('div')
  s.style.cssText = `position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%);background-size:200% 100%;animation:mk-shimmer 1.5s infinite linear;pointer-events:none`
  el.appendChild(s)
  if (!document.getElementById('mk-shimmer-style')) {
    const st = document.createElement('style')
    st.id = 'mk-shimmer-style'
    st.textContent =
      '@keyframes mk-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'
    document.head.appendChild(st)
  }
  return () => {
    s.remove()
    el.style.cssText = orig
  }
}

export function renderAnimations(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'none'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">动画引擎</h1>
    <p class="doc-p">MotionKit 提供从预设动画到物理引擎的完整动效体系，涵盖 30+ 预设、文字特效、赛博故障、交互反馈、3D 翻转等。</p>

    <!-- ═══ 预设动画 ═══ -->
    <h2 class="doc-h2">🎬 预设动画</h2>
    <p class="doc-p">内置 15 种 CSS <code class="doc-code-inline">@keyframes</code> 预设，通过 <code class="doc-code-inline">Animator</code> 一键调用。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:16px;min-height:240px;">
        <div id="anim-box" style="width:100px;height:100px;background:linear-gradient(135deg,var(--mk-primary),var(--mk-indigo-400));border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;box-shadow:var(--mk-shadow-lg);flex-shrink:0;">✨</div>
        <div id="anim-btn-list" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:600px;"></div>
      </div>
    </div>

    <!-- ═══ 组件级动画 ═══ -->
    <h2 class="doc-h2">🧩 组件级动画</h2>
    <p class="doc-p"><code class="doc-code-inline">withMotion</code> 为任意元素附加入场、悬停、按下、聚焦动画。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;gap:16px;flex-wrap:wrap;">
        <div id="motion-box1" style="padding:12px 24px;background:var(--mk-primary);color:#fff;border-radius:8px;cursor:pointer;font-weight:500;">Hover Lift + Press</div>
        <div id="motion-box2" style="padding:12px 24px;background:var(--mk-success);color:#fff;border-radius:8px;cursor:pointer;font-weight:500;">Hover Scale</div>
        <div id="motion-box3" style="padding:12px 24px;background:var(--mk-danger);color:#fff;border-radius:8px;cursor:pointer;font-weight:500;">Hover Glow</div>
      </div>
    </div>

    <!-- ═══ 序列入场 ═══ -->
    <h2 class="doc-h2">📊 序列入场</h2>
    <p class="doc-p">让一组元素依次淡入，营造优雅的入场节奏。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;align-items:center;">
        <div id="stagger-container" style="display:flex;gap:10px;">
          <div class="stagger-item" style="width:48px;height:48px;background:var(--mk-primary);border-radius:8px;"></div>
          <div class="stagger-item" style="width:48px;height:48px;background:var(--mk-success);border-radius:8px;"></div>
          <div class="stagger-item" style="width:48px;height:48px;background:var(--mk-warning);border-radius:8px;"></div>
          <div class="stagger-item" style="width:48px;height:48px;background:var(--mk-danger);border-radius:8px;"></div>
          <div class="stagger-item" style="width:48px;height:48px;background:var(--mk-info);border-radius:8px;"></div>
        </div>
        <div id="btn-stagger" style="margin-left:20px;"></div>
      </div>
    </div>

    <!-- ═══ 文字特效 ═══ -->
    <h2 class="doc-h2">✍️ 文字特效</h2>
    <p class="doc-p">打字机、数字滚动、波浪文字——让文字不再枯燥。</p>

    <h3 class="doc-h3">打字机效果</h3>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:12px;min-height:100px;">
        <div id="typewriter-target" style="font-size:1.3rem;font-family:monospace;color:var(--mk-primary);min-height:28px;white-space:nowrap;"></div>
        <div id="btn-typewriter"></div>
        <div id="btn-typewriter-reset"></div>
      </div>
    </div>

    <h3 class="doc-h3">数字滚动</h3>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:12px;min-height:100px;">
        <div style="display:flex;gap:24px;align-items:baseline;">
          <div style="text-align:center;">
            <div id="countup-users" style="font-size:2rem;font-weight:800;color:var(--mk-primary);">0</div>
            <div style="font-size:0.8rem;color:var(--mk-text-secondary);">注册用户</div>
          </div>
          <div style="text-align:center;">
            <div id="countup-stars" style="font-size:2rem;font-weight:800;color:var(--mk-warning);">0</div>
            <div style="font-size:0.8rem;color:var(--mk-text-secondary);">GitHub Stars</div>
          </div>
          <div style="text-align:center;">
            <div id="countup-downloads" style="font-size:2rem;font-weight:800;color:var(--mk-success);">0</div>
            <div style="font-size:0.8rem;color:var(--mk-text-secondary);">下载量</div>
          </div>
        </div>
        <div id="btn-countup"></div>
      </div>
    </div>

    <h3 class="doc-h3">波浪文字</h3>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:12px;min-height:120px;">
        <div id="wavetext-target" style="font-size:1.5rem;font-weight:700;letter-spacing:2px;color:var(--mk-primary);">~ MotionKit Waves ~</div>
        <div><span style="font-size:0.8rem;color:var(--mk-text-secondary);">文字随正弦波起伏，持续动画</span></div>
      </div>
    </div>

    <!-- ═══ 赛博故障 ═══ -->
    <h2 class="doc-h2">🩻 赛博故障</h2>
    <p class="doc-p">赛博朋克风格的 Glitch 故障效果，随机切片 + 色散。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:16px;min-height:140px;">
        <div id="glitch-target" style="font-size:2rem;font-weight:800;letter-spacing:4px;color:#fff;text-shadow:0 0 20px rgba(99,102,241,0.5);">SYSTEM_READY</div>
        <div style="display:flex;gap:8px;">
          <div id="btn-glitch"></div>
          <div id="btn-glitch-loop"></div>
        </div>
      </div>
    </div>

    <!-- ═══ 交互特效 ═══ -->
    <h2 class="doc-h2">🖱️ 交互特效</h2>
    <p class="doc-p">磁性跟随、水波纹点击——让每次交互都有反馈。</p>

    <h3 class="doc-h3">磁性按钮</h3>
    <p class="doc-p">鼠标靠近时按钮会被吸引过去，移开时回弹。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;gap:16px;min-height:120px;">
        <div id="magnetic-btn1" style="padding:16px 32px;background:linear-gradient(135deg,var(--mk-primary),var(--mk-indigo-500));color:#fff;border-radius:12px;font-size:1.1rem;font-weight:600;cursor:pointer;user-select:none;">🎯 靠近我</div>
        <div id="magnetic-btn2" style="padding:16px 32px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;user-select:none;">⚡</div>
      </div>
    </div>

    <h3 class="doc-h3">水波纹</h3>
    <p class="doc-p">Material Design 风格的点击波纹扩散效果。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;gap:16px;min-height:100px;">
        <div id="ripple-btn1" style="padding:14px 28px;background:var(--mk-primary);color:#fff;border-radius:8px;cursor:pointer;font-weight:500;user-select:none;">点击有水波</div>
        <div id="ripple-btn2" style="padding:14px 28px;background:var(--mk-success);color:#fff;border-radius:999px;cursor:pointer;font-weight:500;user-select:none;">圆形按钮</div>
        <div id="ripple-btn3" style="padding:14px 28px;border:2px solid var(--mk-primary);color:var(--mk-primary);border-radius:8px;cursor:pointer;font-weight:500;user-select:none;background:transparent;">边框按钮</div>
      </div>
    </div>

    <!-- ═══ 3D 翻转 ═══ -->
    <h2 class="doc-h2">🃏 3D 翻转卡片</h2>
    <p class="doc-p">点击卡片进行 3D Y轴翻转，展示背面内容。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;min-height:200px;">
        <div id="flip-container" style="width:240px;height:160px;perspective:800px;cursor:pointer;">
          <div id="flip-inner" style="position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);">
            <div id="flip-front" style="position:absolute;inset:0;backface-visibility:hidden;background:linear-gradient(135deg,var(--mk-primary),var(--mk-indigo-500));border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-size:1rem;font-weight:600;">🎴 点击翻转<br><span style="font-size:0.7rem;opacity:0.7;margin-top:4px;">查看背面 →</span></div>
            <div id="flip-back" style="position:absolute;inset:0;backface-visibility:hidden;background:linear-gradient(135deg,#1e293b,#334155);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;transform:rotateY(180deg);">🔙 这是背面<br><span style="font-size:0.7rem;opacity:0.7;margin-top:4px;">点击翻回 →</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 骨架屏 ═══ -->
    <h2 class="doc-h2">💀 骨架屏</h2>
    <p class="doc-p">Shimmer 加载占位效果，模拟内容加载中的状态。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="flex-direction:column;align-items:center;gap:16px;min-height:160px;">
        <div id="skeleton-card" style="width:300px;padding:20px;border-radius:12px;border:1px solid var(--mk-border-color);display:flex;flex-direction:column;gap:12px;transition:all 0.3s;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;border-radius:50%;background:#e2e8f0;"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
              <div style="height:16px;background:#e2e8f0;border-radius:4px;width:60%;"></div>
              <div style="height:12px;background:#e2e8f0;border-radius:4px;width:40%;"></div>
            </div>
          </div>
          <div style="height:12px;background:#e2e8f0;border-radius:4px;"></div>
          <div style="height:12px;background:#e2e8f0;border-radius:4px;width:80%;"></div>
        </div>
        <div style="display:flex;gap:8px;">
          <div id="btn-shimmer-on"></div>
          <div id="btn-shimmer-off"></div>
        </div>
      </div>
    </div>

    <!-- ═══ 弹簧动画引擎 ═══ -->
    <h2 class="doc-h2">🌀 弹簧动画引擎</h2>
    <p class="doc-p">基于真实物理的弹簧模型（胡克定律），支持多属性同时动画、颜色插值、编排与 seek。</p>

    <h3 class="doc-h3">弹性缩放 + 位移</h3>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;gap:24px;min-height:140px;flex-wrap:wrap;">
        <div id="spring-box2" style="width:80px;height:80px;background:linear-gradient(135deg,var(--mk-primary),var(--mk-indigo-400));border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.5rem;box-shadow:var(--mk-shadow-lg);user-select:none;position:relative;">🌀</div>
        <div style="font-size:0.85rem;color:var(--mk-text-secondary);max-width:220px;">点击体验 <code>springTo</code> 弹性缩放+位移。<br> stiffness=170, damping=26</div>
      </div>
    </div>

    <h3 class="doc-h3">颜色弹簧过渡</h3>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;gap:16px;min-height:120px;flex-wrap:wrap;">
        <div id="spring-color-box" style="width:120px;height:60px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:600;user-select:none;transition:none;">点击变色</div>
        <div style="font-size:0.85rem;color:var(--mk-text-secondary);max-width:200px;">背景色与文字色通过弹簧物理平滑过渡。</div>
      </div>
    </div>

    <h3 class="doc-h3">Stagger 弹簧入场</h3>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;gap:10px;min-height:120px;flex-wrap:wrap;">
        <div class="spring-stagger-item" style="width:48px;height:48px;background:var(--mk-primary);border-radius:8px;opacity:0;transform:scale(0.5);"></div>
        <div class="spring-stagger-item" style="width:48px;height:48px;background:var(--mk-success);border-radius:8px;opacity:0;transform:scale(0.5);"></div>
        <div class="spring-stagger-item" style="width:48px;height:48px;background:var(--mk-warning);border-radius:8px;opacity:0;transform:scale(0.5);"></div>
        <div class="spring-stagger-item" style="width:48px;height:48px;background:var(--mk-danger);border-radius:8px;opacity:0;transform:scale(0.5);"></div>
        <div class="spring-stagger-item" style="width:48px;height:48px;background:var(--mk-info);border-radius:8px;opacity:0;transform:scale(0.5);"></div>
      </div>
      <div style="display:flex;justify-content:center;padding:12px;gap:8px;">
        <div id="btn-spring-stagger"></div>
      </div>
    </div>

    <h3 class="doc-h3">Sequence 编排</h3>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;gap:16px;min-height:120px;flex-wrap:wrap;">
        <div id="seq-box1" style="width:60px;height:60px;background:var(--mk-primary);border-radius:12px;opacity:0.3;transform:scale(0.8);"></div>
        <div id="seq-box2" style="width:60px;height:60px;background:var(--mk-success);border-radius:12px;opacity:0.3;transform:scale(0.8);"></div>
        <div id="seq-box3" style="width:60px;height:60px;background:var(--mk-warning);border-radius:12px;opacity:0.3;transform:scale(0.8);"></div>
      </div>
      <div style="display:flex;justify-content:center;padding:12px;gap:8px;">
        <div id="btn-spring-seq"></div>
      </div>
    </div>

    <!-- ═══ 物理引擎（旧版） ═══ -->
    <h2 class="doc-h2">🔧 物理引擎（旧版）</h2>
    <p class="doc-p">基于弹簧物理的弹性动画，点击铃铛体验。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;gap:24px;min-height:120px;">
        <div id="spring-box" style="width:80px;height:80px;background:linear-gradient(135deg,#fbbf24,#f59e0b);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.5rem;box-shadow:0 6px 20px rgba(251,191,36,0.25);user-select:none;">🔔</div>
        <div style="font-size:0.85rem;color:var(--mk-text-secondary);max-width:200px;">点击铃铛触发弹性缩放<br>基于胡克定律的物理弹簧模拟</div>
      </div>
    </div>

    <!-- ═══ 粒子效果 ═══ -->
    <h2 class="doc-h2">✨ 粒子效果</h2>
    <p class="doc-p">点击按钮触发彩色粒子爆炸，每个粒子独立物理运动。</p>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="justify-content:center;min-height:100px;">
        <div id="btn-particle"></div>
      </div>
    </div>

    <!-- ═══ FLIP 动画 ═══ -->
    <h2 class="doc-h2">🔄 FLIP 动画</h2>
    <p class="doc-p">高性能布局变化动画引擎，通过 FLIP（First / Last / Invert / Play）技术实现丝滑的元素位置过渡。</p>

    <h3 class="doc-h3">可拖拽排序列表</h3>
    <div class="doc-demo">
      <div class="doc-demo-stage" style="min-height:220px;">
        <ul id="flip-drag-list" style="list-style:none;padding:0;margin:0;width:300px;border:1px solid var(--mk-border);border-radius:12px;overflow:hidden;background:var(--mk-bg-elevated);box-shadow:var(--mk-shadow-sm);">
          <li data-draggable style="padding:12px 16px;border-bottom:1px solid var(--mk-border);background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;transition:background-color 160ms ease;">
            <span style="color:var(--mk-text-secondary);font-size:0.85rem;">☰</span>
            <span style="flex:1;">🍎 苹果</span>
            <span style="font-size:0.75rem;color:var(--mk-text-secondary);">拖拽排序</span>
          </li>
          <li data-draggable style="padding:12px 16px;border-bottom:1px solid var(--mk-border);background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;transition:background-color 160ms ease;">
            <span style="color:var(--mk-text-secondary);font-size:0.85rem;">☰</span>
            <span style="flex:1;">🍌 香蕉</span>
            <span style="font-size:0.75rem;color:var(--mk-text-secondary);">拖拽排序</span>
          </li>
          <li data-draggable style="padding:12px 16px;border-bottom:1px solid var(--mk-border);background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;transition:background-color 160ms ease;">
            <span style="color:var(--mk-text-secondary);font-size:0.85rem;">☰</span>
            <span style="flex:1;">🍇 葡萄</span>
            <span style="font-size:0.75rem;color:var(--mk-text-secondary);">拖拽排序</span>
          </li>
          <li data-draggable style="padding:12px 16px;border-bottom:1px solid var(--mk-border);background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;transition:background-color 160ms ease;">
            <span style="color:var(--mk-text-secondary);font-size:0.85rem;">☰</span>
            <span style="flex:1;">🍊 橙子</span>
            <span style="font-size:0.75rem;color:var(--mk-text-secondary);">拖拽排序</span>
          </li>
          <li data-draggable style="padding:12px 16px;background:var(--mk-surface);cursor:grab;display:flex;align-items:center;gap:8px;user-select:none;transition:background-color 160ms ease;">
            <span style="color:var(--mk-text-secondary);font-size:0.85rem;">☰</span>
            <span style="flex:1;">🍓 草莓</span>
            <span style="font-size:0.75rem;color:var(--mk-text-secondary);">拖拽排序</span>
          </li>
        </ul>
      </div>
    </div>

    <h3 class="doc-h3">网格筛选与打乱</h3>
    <div class="doc-demo">
      <div class="doc-demo-toolbar">
        <div id="btn-flip-all"></div>
        <div id="btn-flip-fruits"></div>
        <div id="btn-flip-animals"></div>
        <div id="btn-flip-shuffle"></div>
      </div>
      <div class="doc-demo-stage" style="justify-content:center;">
        <div id="flip-grid" style="display:grid;grid-template-columns:repeat(4,80px);gap:12px;">
          <div data-flip-item data-category="fruit" style="width:80px;height:80px;border-radius:12px;background:linear-gradient(135deg,#ff6b6b,#ee5a5a);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🍎</div>
          <div data-flip-item data-category="animal" style="width:80px;height:80px;border-radius:12px;background:linear-gradient(135deg,#4ecdc4,#44a08d);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🐶</div>
          <div data-flip-item data-category="fruit" style="width:80px;height:80px;border-radius:12px;background:linear-gradient(135deg,#f7b731,#e58e26);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🍌</div>
          <div data-flip-item data-category="animal" style="width:80px;height:80px;border-radius:12px;background:linear-gradient(135deg,#5f27cd,#341f97);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🐱</div>
          <div data-flip-item data-category="fruit" style="width:80px;height:80px;border-radius:12px;background:linear-gradient(135deg,#a29bfe,#6c5ce7);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🍇</div>
          <div data-flip-item data-category="animal" style="width:80px;height:80px;border-radius:12px;background:linear-gradient(135deg,#fd79a8,#e84393);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🐰</div>
          <div data-flip-item data-category="fruit" style="width:80px;height:80px;border-radius:12px;background:linear-gradient(135deg,#fab1a0,#e17055);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🍊</div>
          <div data-flip-item data-category="animal" style="width:80px;height:80px;border-radius:12px;background:linear-gradient(135deg,#00b894,#00cec9);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🦊</div>
        </div>
      </div>
    </div>
  `

  setTimeout(() => {
    // ── Preset Buttons ──────────────────────────────────────────
    const anims = [
      'fadeIn',
      'fadeOut',
      'slideInUp',
      'slideInDown',
      'slideInLeft',
      'slideInRight',
      'zoomIn',
      'zoomOut',
      'bounceIn',
      'bounceOut',
      'flipInX',
      'flipInY',
      'shake',
      'pulse',
      'rotateIn',
    ]
    const animBox = document.getElementById('anim-box')!
    let animator: Animator | null = null
    anims.forEach((name) => {
      const btn = createButton(document.getElementById('anim-btn-list')!, {
        size: 'small',
        text: name,
      })
      btn.el.addEventListener('click', async () => {
        if (animator) {
          animator.stop()
          animator.reset()
        }
        animator = new Animator(animBox)
        await animator.animate(name, { duration: 500 })
      })
    })

    // ── withMotion ──────────────────────────────────────────────
    withMotion(document.getElementById('motion-box1')!, {
      hover: 'lift',
      active: 'press',
      duration: 200,
    })
    withMotion(document.getElementById('motion-box2')!, {
      hover: 'scale',
      active: 'press',
      duration: 200,
    })
    withMotion(document.getElementById('motion-box3')!, {
      hover: 'glow',
      active: 'press',
      duration: 200,
    })

    // ── Stagger ─────────────────────────────────────────────────
    const staggerContainer = document.getElementById('stagger-container')!
    function playStagger() {
      const items = staggerContainer.querySelectorAll('.stagger-item')
      items.forEach((el, i) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.opacity = '0'
        setTimeout(
          () => {
            htmlEl.style.transition = 'opacity 400ms ease'
            htmlEl.style.opacity = '1'
          },
          100 + i * 80
        )
      })
    }
    createButton(document.getElementById('btn-stagger')!, {
      type: 'primary',
      text: '▶ 重新播放',
      onClick: playStagger,
    })
    setTimeout(playStagger, 300)

    // ── Typewriter ──────────────────────────────────────────────
    const twTarget = document.getElementById('typewriter-target')!
    const typewriterTexts = [
      'Hello, MotionKit!',
      '让组件动起来 🚀',
      'Zero dependencies.',
      'Pure TypeScript + CSS.',
    ]
    let twIdx = 0
    async function playTypewriter() {
      twTarget.textContent = ''
      twTarget.style.borderRight = '2px solid currentColor'
      await typeWrite(twTarget, typewriterTexts[twIdx], 60)
      twIdx = (twIdx + 1) % typewriterTexts.length
    }
    createButton(document.getElementById('btn-typewriter')!, {
      type: 'primary',
      text: '▶ 开始打字',
      onClick: playTypewriter,
    })
    createButton(document.getElementById('btn-typewriter-reset')!, {
      text: '↺ 下一条',
      size: 'small',
      onClick: () => {
        twTarget.textContent = ''
        twTarget.style.borderRight = 'none'
      },
    })
    setTimeout(() => playTypewriter(), 400)

    // ── CountUp ─────────────────────────────────────────────────
    let countupRunning = false
    createButton(document.getElementById('btn-countup')!, {
      type: 'primary',
      text: '▶ 开始滚动',
      onClick: async () => {
        if (countupRunning) return
        countupRunning = true
        await Promise.all([
          countUp(document.getElementById('countup-users')!, 12847, 1500),
          countUp(document.getElementById('countup-stars')!, 3826, 1500),
          countUp(document.getElementById('countup-downloads')!, 95420, 1500),
        ])
        countupRunning = false
      },
    })
    setTimeout(() => {
      countUp(document.getElementById('countup-users')!, 12847, 1200)
      countUp(document.getElementById('countup-stars')!, 3826, 1200)
      countUp(document.getElementById('countup-downloads')!, 95420, 1200)
    }, 500)

    // ── WaveText ────────────────────────────────────────────────
    setTimeout(() => waveText(document.getElementById('wavetext-target')!), 300)

    // ── Glitch ──────────────────────────────────────────────────
    const glitchEl = document.getElementById('glitch-target')!
    let glitchLooping = false,
      glitchLoopId: ReturnType<typeof setInterval> | null = null
    createButton(document.getElementById('btn-glitch')!, {
      type: 'danger',
      text: '⚡ 触发故障',
      onClick: () => glitch(glitchEl, 400, 6),
    })
    createButton(document.getElementById('btn-glitch-loop')!, {
      type: 'warning',
      text: '🔄 持续故障',
      onClick: () => {
        if (glitchLooping) {
          glitchLooping = false
          if (glitchLoopId) {
            clearInterval(glitchLoopId)
            glitchLoopId = null
          }
          glitchEl.style.cssText =
            'font-size:2rem;font-weight:800;letter-spacing:4px;color:#fff;text-shadow:0 0 20px rgba(99,102,241,0.5);'
        } else {
          glitchLooping = true
          const loop = () => {
            if (glitchLooping)
              glitch(glitchEl, 200, 4).then(() => {
                if (glitchLooping)
                  glitchLoopId = setTimeout(loop, 300 + Math.random() * 500)
              })
          }
          loop()
        }
      },
    })

    // ── Magnetic ────────────────────────────────────────────────
    magnetic(document.getElementById('magnetic-btn1')!)
    magnetic(document.getElementById('magnetic-btn2')!)

    // ── Ripple ──────────────────────────────────────────────────
    addRipple(document.getElementById('ripple-btn1')!)
    addRipple(document.getElementById('ripple-btn2')!)
    addRipple(document.getElementById('ripple-btn3')!)

    // ── FlipCard ────────────────────────────────────────────────
    const flipInner = document.getElementById('flip-inner')!
    let flipped = false
    document.getElementById('flip-container')!.addEventListener('click', () => {
      flipped = !flipped
      flipInner.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
    })

    // ── Shimmer ─────────────────────────────────────────────────
    let stopShimmer: (() => void) | null = null
    const skCard = document.getElementById('skeleton-card')!
    createButton(document.getElementById('btn-shimmer-on')!, {
      type: 'primary',
      text: '▶ 加载中',
      size: 'small',
      onClick: () => {
        if (stopShimmer) stopShimmer()
        skCard.querySelectorAll('div[style]').forEach((child: Element) => {
          if (
            child.style.background === 'rgb(226, 232, 240)' ||
            child.style.background === '#e2e8f0'
          ) {
            stopShimmer = shimmer(child as HTMLElement)
          }
        })
      },
    })
    createButton(document.getElementById('btn-shimmer-off')!, {
      text: '停止',
      size: 'small',
      onClick: () => {
        if (stopShimmer) {
          stopShimmer()
          stopShimmer = null
        }
      },
    })

    // ── Spring Engine Demos ─────────────────────────────────────
    // 弹性缩放 + 位移
    const springBox2 = document.getElementById('spring-box2')!
    springBox2.addEventListener('click', () => {
      springTo(
        springBox2,
        { scale: 1.4, x: 40 },
        { stiffness: 200, damping: 15 }
      ).then(() => {
        springTo(
          springBox2,
          { scale: 1, x: 0 },
          { stiffness: 180, damping: 20 }
        )
      })
    })

    // 颜色弹簧过渡
    const colorBox = document.getElementById('spring-color-box')!
    let colorToggle = false
    colorBox.style.backgroundColor = 'var(--mk-primary)'
    colorBox.style.color = '#fff'
    colorBox.addEventListener('click', () => {
      colorToggle = !colorToggle
      springTo(
        colorBox,
        {
          backgroundColor: colorToggle ? '#ef4444' : 'var(--mk-primary)',
          scale: colorToggle ? 1.1 : 1,
        },
        { stiffness: 150, damping: 20 }
      )
    })

    // Stagger 弹簧入场
    createButton(document.getElementById('btn-spring-stagger')!, {
      type: 'primary',
      text: '▶ Stagger 入场',
      onClick: async () => {
        const items = document.querySelectorAll(
          '.spring-stagger-item'
        ) as NodeListOf<HTMLElement>
        items.forEach((el) => {
          el.style.opacity = '0'
          el.style.transform = 'scale(0.5)'
        })
        await springStagger(
          Array.from(items),
          { opacity: 1, scale: 1 },
          { stiffness: 200, damping: 20, delay: 60 }
        )
      },
    })

    // Sequence 编排
    createButton(document.getElementById('btn-spring-seq')!, {
      type: 'primary',
      text: '▶ Sequence 编排',
      onClick: async () => {
        const s1 = document.getElementById('seq-box1')!
        const s2 = document.getElementById('seq-box2')!
        const s3 = document.getElementById('seq-box3')!
        ;[s1, s2, s3].forEach((el) => {
          el.style.opacity = '0.3'
          el.style.transform = 'scale(0.8)'
        })
        await springSequence([
          { target: s1, to: { opacity: 1, scale: 1.2, rotate: 15 } },
          { target: s2, to: { opacity: 1, scale: 1.2, rotate: -15 } },
          { target: s3, to: { opacity: 1, scale: 1.2, rotate: 15 } },
        ])
        await springTo(
          s1,
          { rotate: 0, scale: 1 },
          { stiffness: 300, damping: 25 }
        )
        await springTo(
          s2,
          { rotate: 0, scale: 1 },
          { stiffness: 300, damping: 25 }
        )
        await springTo(
          s3,
          { rotate: 0, scale: 1 },
          { stiffness: 300, damping: 25 }
        )
      },
    })

    // ── Physics (Elastic Scale) ─────────────────────────────────
    // inline spring-based elastic scale
    function elasticScale(el: HTMLElement, toScale: number) {
      let v = 0,
        s = 1,
        id = 0,
        running = true
      const tick = () => {
        if (!running) return
        const force = -170 * (s - toScale) - 26 * v
        v += force / 60
        s += v / 60
        el.style.transform = `scale(${s})`
        if (Math.abs(s - toScale) < 0.001 && Math.abs(v) < 0.001) {
          running = false
          return
        }
        id = requestAnimationFrame(tick)
      }
      id = requestAnimationFrame(tick)
      return () => {
        running = false
        cancelAnimationFrame(id)
      }
    }
    let stopSpring: (() => void) | null = null
    const springBox = document.getElementById('spring-box')!
    springBox.addEventListener('click', () => {
      if (stopSpring) stopSpring()
      stopSpring = elasticScale(springBox, 1.3)
      setTimeout(() => {
        if (stopSpring) {
          stopSpring()
          stopSpring = elasticScale(springBox, 1)
        }
      }, 300)
    })

    // ── Particle Burst ──────────────────────────────────────────
    const particleBtn = createButton(document.getElementById('btn-particle')!, {
      type: 'danger',
      text: '💥 点我爆炸',
      size: 'large',
    })
    particleBtn.el.addEventListener('click', () => {
      const rect = particleBtn.el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const colors = [
        '#f56c6c',
        '#e6a23c',
        '#67c23a',
        '#409eff',
        '#a855f7',
        '#ec4899',
      ]
      for (let i = 0; i < 50; i++) {
        const el = document.createElement('div')
        el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${4 + Math.random() * 6}px;height:${4 + Math.random() * 6}px;border-radius:50%;background:${colors[i % colors.length]};pointer-events:none;z-index:99999;`
        document.body.appendChild(el)
        const angle = (Math.PI * 2 * i) / 50 + Math.random() * 0.5
        const speed = 4 * (0.5 + Math.random())
        let x = 0,
          y = 0,
          vx = Math.cos(angle) * speed,
          vy = Math.sin(angle) * speed
        const tick = () => {
          vy += 0.25
          x += vx
          y += vy
          el.style.transform = `translate(${x}px,${y}px)`
          el.style.opacity = String(
            Math.max(0, 1 - Math.sqrt(x * x + y * y) / 180)
          )
          if (parseFloat(el.style.opacity) > 0) requestAnimationFrame(tick)
          else el.remove()
        }
        requestAnimationFrame(tick)
      }
    })

    // ── FLIP Draggable List ────────────────────────────────────
    const dragList = document.getElementById('flip-drag-list')!
    const draggable = new DraggableList(dragList, {
      spring: { stiffness: 300, damping: 30, mass: 1 },
      duration: 170,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      ghostOpacity: 0.98,
      dragScale: 1.01,
      onReorder: (oldIndex: number, newIndex: number) => {
        console.log(`[FLIP] 从 ${oldIndex} 移动到 ${newIndex}`)
      },
    })

    // ── FLIP Grid Filter & Shuffle ──────────────────────────────
    const flipGrid = document.getElementById('flip-grid')!
    const flipItems = Array.from(
      flipGrid.querySelectorAll<HTMLElement>('[data-flip-item]')
    )

    createButton(document.getElementById('btn-flip-all')!, {
      type: 'primary',
      text: '全部',
      size: 'small',
    }).el.addEventListener('click', () => {
      filterGrid(flipGrid, '[data-flip-item]', () => {
        flipItems.forEach((el) => (el.style.display = 'flex'))
      })
    })
    createButton(document.getElementById('btn-flip-fruits')!, {
      type: 'success',
      text: '🍎 水果',
      size: 'small',
    }).el.addEventListener('click', () => {
      filterGrid(flipGrid, '[data-flip-item]', () => {
        flipItems.forEach((el) => {
          el.style.display = el.dataset.category === 'fruit' ? 'flex' : 'none'
        })
      })
    })
    createButton(document.getElementById('btn-flip-animals')!, {
      type: 'warning',
      text: '🐶 动物',
      size: 'small',
    }).el.addEventListener('click', () => {
      filterGrid(flipGrid, '[data-flip-item]', () => {
        flipItems.forEach((el) => {
          el.style.display = el.dataset.category === 'animal' ? 'flex' : 'none'
        })
      })
    })
    createButton(document.getElementById('btn-flip-shuffle')!, {
      type: 'danger',
      text: '🔀 打乱',
      size: 'small',
    }).el.addEventListener('click', () => {
      shuffleGrid(flipGrid, '[data-flip-item]')
    })
  }, 0)
}
