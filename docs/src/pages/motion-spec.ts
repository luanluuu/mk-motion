import { renderToc } from '../shared/utils.js'

export function renderMotionSpec(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'block'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">动效规范</h1>
    <p class="doc-p">MotionKit 的标准动画时长、弹簧参数与缓动曲线参考。所有数值均经过用户体验优化，可直接用于生产环境。</p>

    <h2 class="doc-h2" id="durations">标准时长</h2>
    <div id="spec-durations"></div>

    <h2 class="doc-h2" id="springs">弹簧参数推荐</h2>
    <div id="spec-springs"></div>

    <h2 class="doc-h2" id="easings">缓动曲线</h2>
    <div id="spec-easings"></div>
  `
  renderToc(['durations', 'springs', 'easings'])
  setTimeout(() => {
    renderDurations()
    renderSprings()
    renderEasings()
  }, 0)
}

interface DurationEntry {
  component: string
  ms: number
  useCase: string
}

const DURATIONS: DurationEntry[] = [
  { component: 'Button', ms: 200, useCase: 'Hover / Active / Focus 反馈' },
  { component: 'Switch', ms: 200, useCase: '开关切换' },
  { component: 'Input', ms: 150, useCase: '边框颜色变化' },
  { component: 'Tag', ms: 150, useCase: '关闭/出现' },
  { component: 'Card', ms: 250, useCase: '悬停抬升 / 选中' },
  { component: 'Dialog', ms: 300, useCase: '打开 / 关闭' },
  { component: 'Drawer', ms: 300, useCase: '滑入 / 滑出' },
  { component: 'Toast / Message', ms: 250, useCase: '出现 / 消失' },
  { component: 'Menu', ms: 200, useCase: '展开 / 收起' },
  { component: 'Collapse', ms: 300, useCase: '高度展开 / 折叠' },
  { component: 'Tabs', ms: 200, useCase: '下划线滑动' },
  { component: 'Tooltip / Popover', ms: 150, useCase: '显示 / 隐藏' },
  { component: 'Page Transition', ms: 300, useCase: '路由切换' },
  { component: 'Loading', ms: 600, useCase: '旋转循环周期' },
  { component: 'Skeleton', ms: 1200, useCase: ' shimmer 扫光周期' },
]

interface SpringEntry {
  name: string
  stiffness: number
  damping: number
  mass: number
  useCase: string
}

const SPRINGS: SpringEntry[] = [
  {
    name: 'Default',
    stiffness: 170,
    damping: 26,
    mass: 1,
    useCase: '通用弹窗、卡片展开',
  },
  {
    name: 'Gentle',
    stiffness: 120,
    damping: 14,
    mass: 1,
    useCase: '柔和进入、背景遮罩',
  },
  {
    name: 'Wobbly',
    stiffness: 180,
    damping: 12,
    mass: 1,
    useCase: '趣味弹性、徽章跳动',
  },
  {
    name: 'Stiff',
    stiffness: 210,
    damping: 20,
    mass: 1,
    useCase: '快速响应、按钮按下',
  },
  {
    name: 'Slow',
    stiffness: 80,
    damping: 20,
    mass: 2,
    useCase: '重型面板、侧边栏',
  },
  {
    name: 'Bouncy',
    stiffness: 300,
    damping: 10,
    mass: 1,
    useCase: '庆祝动效、成功提示',
  },
]

interface EasingEntry {
  name: string
  value: string
  desc: string
}

const EASINGS: EasingEntry[] = [
  {
    name: 'ease-default',
    value: 'cubic-bezier(0.4, 0, 0.2, 1)',
    desc: '默认缓动，最通用',
  },
  { name: 'ease-out', value: 'cubic-bezier(0, 0, 0.2, 1)', desc: '减速出场' },
  {
    name: 'ease-out-expo',
    value: 'cubic-bezier(0.16, 1, 0.3, 1)',
    desc: '急速减速，对话框推荐',
  },
  {
    name: 'ease-in-out',
    value: 'cubic-bezier(0.4, 0, 0.2, 1)',
    desc: '对称加减速',
  },
  { name: 'ease-spring', value: 'linear', desc: '弹簧动画使用 JS 物理模拟' },
  {
    name: 'ease-bounce',
    value: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    desc: '轻微回弹',
  },
]

function renderDurations() {
  const el = document.getElementById('spec-durations')!
  const table = document.createElement('table')
  table.style.width = '100%'
  table.style.borderCollapse = 'collapse'
  table.style.fontSize = '0.85rem'
  table.innerHTML = `
    <thead>
      <tr style="border-bottom:1px solid var(--mk-border);">
        <th style="text-align:left;padding:10px 12px;color:var(--mk-text-secondary);font-weight:600;">组件</th>
        <th style="text-align:left;padding:10px 12px;color:var(--mk-text-secondary);font-weight:600;">时长</th>
        <th style="text-align:left;padding:10px 12px;color:var(--mk-text-secondary);font-weight:600;">使用场景</th>
      </tr>
    </thead>
    <tbody>
      ${DURATIONS.map(
        (d, i) => `
        <tr style="border-bottom:1px solid var(--mk-border);${i % 2 === 0 ? 'background:var(--mk-surface);' : ''}">
          <td style="padding:10px 12px;color:var(--mk-text);font-family:var(--mk-font-mono);">${d.component}</td>
          <td style="padding:10px 12px;color:var(--mk-text);font-family:var(--mk-font-mono);">${d.ms}ms</td>
          <td style="padding:10px 12px;color:var(--mk-text-secondary);">${d.useCase}</td>
        </tr>
      `
      ).join('')}
    </tbody>
  `
  el.appendChild(table)
}

function renderSprings() {
  const el = document.getElementById('spec-springs')!
  const grid = document.createElement('div')
  grid.style.display = 'grid'
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(260px, 1fr))'
  grid.style.gap = '12px'

  SPRINGS.forEach((s) => {
    const card = document.createElement('div')
    card.style.padding = '16px'
    card.style.border = '1px solid var(--mk-border)'
    card.style.borderRadius = 'var(--mk-radius)'
    card.style.background = 'var(--mk-surface)'
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-weight:600;color:var(--mk-text);">${s.name}</span>
        <span style="font-size:0.75rem;color:var(--mk-text-tertiary);font-family:var(--mk-font-mono);">${s.stiffness}/${s.damping}/${s.mass}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--mk-text-secondary);margin-bottom:12px;">${s.useCase}</div>
      <div style="height:4px;background:var(--mk-border);border-radius:2px;overflow:hidden;">
        <div class="spring-demo-bar" data-stiffness="${s.stiffness}" data-damping="${s.damping}" data-mass="${s.mass}" style="height:100%;width:0%;background:var(--mk-primary);border-radius:2px;"></div>
      </div>
    `
    grid.appendChild(card)
  })

  el.appendChild(grid)

  // Animate bars with simple physics approximation
  setTimeout(() => {
    el.querySelectorAll<HTMLElement>('.spring-demo-bar').forEach((bar) => {
      const stiffness = parseFloat(bar.dataset.stiffness || '170')
      const damping = parseFloat(bar.dataset.damping || '26')
      const mass = parseFloat(bar.dataset.mass || '1')
      let velocity = 0
      let position = 0
      const target = 100
      let lastTime = performance.now()

      const tick = (now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.05)
        lastTime = now
        const displacement = position - target
        const springForce = -stiffness * displacement
        const dampingForce = -damping * velocity
        const acceleration = (springForce + dampingForce) / mass
        velocity += acceleration * dt
        position += velocity * dt
        bar.style.width = `${Math.max(0, Math.min(100, position))}%`
        if (Math.abs(displacement) > 0.5 || Math.abs(velocity) > 0.5) {
          requestAnimationFrame(tick)
        } else {
          bar.style.width = '100%'
        }
      }
      requestAnimationFrame(tick)
    })
  }, 100)
}

function renderEasings() {
  const el = document.getElementById('spec-easings')!
  const grid = document.createElement('div')
  grid.style.display = 'grid'
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(260px, 1fr))'
  grid.style.gap = '12px'

  EASINGS.forEach((e) => {
    const card = document.createElement('div')
    card.style.padding = '16px'
    card.style.border = '1px solid var(--mk-border)'
    card.style.borderRadius = 'var(--mk-radius)'
    card.style.background = 'var(--mk-surface)'
    card.innerHTML = `
      <div style="font-weight:600;color:var(--mk-text);margin-bottom:4px;">${e.name}</div>
      <div style="font-family:var(--mk-font-mono);font-size:0.8rem;color:var(--mk-text-secondary);margin-bottom:8px;">${e.value}</div>
      <div style="font-size:0.8rem;color:var(--mk-text-tertiary);margin-bottom:12px;">${e.desc}</div>
      <div style="height:4px;background:var(--mk-border);border-radius:2px;overflow:hidden;">
        <div class="easing-demo-bar" style="height:100%;width:0%;background:var(--mk-primary);border-radius:2px;transition:width 1.2s ${e.value};"></div>
      </div>
    `
    grid.appendChild(card)
  })

  el.appendChild(grid)

  setTimeout(() => {
    el.querySelectorAll<HTMLElement>('.easing-demo-bar').forEach((bar) => {
      bar.style.width = '100%'
    })
  }, 100)
}
