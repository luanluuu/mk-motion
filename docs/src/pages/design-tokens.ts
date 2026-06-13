import { renderToc } from '../shared/utils.js'

export function renderDesignTokens(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'block'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">设计令牌</h1>
    <p class="doc-p">MotionKit 使用 CSS 自定义属性构建完整的设计系统，所有组件共享同一套令牌。支持暗黑/亮色主题一键切换。</p>

    <h2 class="doc-h2" id="semantic">语义色彩</h2>
    <p class="doc-p">Primary、Success、Warning、Danger、Info 五个语义色，每个都有 soft/muted 变体用于背景。</p>
    <div id="token-semantic"></div>

    <h2 class="doc-h2" id="colors">色阶</h2>
    <p class="doc-p">Indigo、Green、Amber、Red、Slate、Sky 六个基础色阶，每个 50-950 共 11 个梯度。</p>
    <div id="token-colors"></div>

    <h2 class="doc-h2" id="surfaces">表面与边框</h2>
    <div id="token-surfaces"></div>

    <h2 class="doc-h2" id="typography">字体</h2>
    <div id="token-typography"></div>

    <h2 class="doc-h2" id="spacing">间距</h2>
    <div id="token-spacing"></div>

    <h2 class="doc-h2" id="radius">圆角</h2>
    <div id="token-radius"></div>

    <h2 class="doc-h2" id="shadows">阴影</h2>
    <div id="token-shadows"></div>

    <h2 class="doc-h2" id="motion">运动</h2>
    <div id="token-motion"></div>
  `
  renderToc([
    'semantic',
    'colors',
    'surfaces',
    'typography',
    'spacing',
    'radius',
    'shadows',
    'motion',
  ])
  setTimeout(() => {
    renderSemantic()
    renderAllColorScales()
    renderSurfaces()
    renderTypography()
    renderSpacing()
    renderRadius()
    renderShadows()
    renderMotion()
  }, 0)
}

function renderSemantic() {
  const el = document.getElementById('token-semantic')!
  const tokens = [
    { name: 'primary', label: 'Primary' },
    { name: 'success', label: 'Success' },
    { name: 'warning', label: 'Warning' },
    { name: 'danger', label: 'Danger' },
    { name: 'info', label: 'Info' },
  ]
  tokens.forEach(({ name, label }) => {
    const section = document.createElement('div')
    section.style.marginBottom = '16px'
    const header = document.createElement('h4')
    header.textContent = label
    header.style.fontSize = '0.85rem'
    header.style.color = 'var(--mk-text-secondary)'
    header.style.marginBottom = '8px'
    section.appendChild(header)

    const grid = document.createElement('div')
    grid.style.display = 'grid'
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'
    grid.style.gap = '8px'

    const vars = [`--mk-${name}`, `--mk-${name}-soft`, `--mk-${name}-muted`]
    vars.forEach((v) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim()
      const box = document.createElement('div')
      box.style.background = value || '#000'
      box.style.borderRadius = '8px'
      box.style.padding = '14px 12px'
      box.style.display = 'flex'
      box.style.flexDirection = 'column'
      box.style.gap = '4px'
      const isDark = v.includes('soft') || v.includes('muted') ? false : true
      box.innerHTML = `<span style="font-size:0.7rem;font-weight:600;color:${isDark ? '#fff' : '#0f172a'};font-family:var(--mk-font-mono);">${v.replace('--mk-', '')}</span><span style="font-size:0.65rem;color:${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'};font-family:var(--mk-font-mono);">${value}</span>`
      grid.appendChild(box)
    })
    section.appendChild(grid)
    el.appendChild(section)
  })
}

function renderAllColorScales() {
  const el = document.getElementById('token-colors')!
  const colors = ['indigo', 'green', 'amber', 'red', 'slate', 'sky']
  colors.forEach((colorName) => {
    const section = document.createElement('div')
    section.style.marginBottom = '20px'
    const header = document.createElement('h4')
    header.textContent = colorName.charAt(0).toUpperCase() + colorName.slice(1)
    header.style.fontSize = '0.85rem'
    header.style.color = 'var(--mk-text-secondary)'
    header.style.marginBottom = '8px'
    section.appendChild(header)

    const grid = document.createElement('div')
    grid.style.display = 'grid'
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))'
    grid.style.gap = '6px'

    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
    steps.forEach((step) => {
      const varName = `--mk-${colorName}-${step}`
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim()
      const box = document.createElement('div')
      box.style.background = value || '#000'
      box.style.borderRadius = '6px'
      box.style.padding = '12px 10px'
      box.style.display = 'flex'
      box.style.flexDirection = 'column'
      box.style.gap = '3px'
      const isDark = step >= 500
      box.innerHTML = `<span style="font-size:0.65rem;font-weight:600;color:${isDark ? '#fff' : '#0f172a'};font-family:var(--mk-font-mono);">${step}</span><span style="font-size:0.6rem;color:${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'};font-family:var(--mk-font-mono);">${value}</span>`
      grid.appendChild(box)
    })
    section.appendChild(grid)
    el.appendChild(section)
  })
}

function renderSurfaces() {
  const el = document.getElementById('token-surfaces')!
  const tokens = [
    '--mk-bg',
    '--mk-bg-elevated',
    '--mk-surface',
    '--mk-surface-hover',
    '--mk-surface-active',
    '--mk-surface-raised',
    '--mk-border',
    '--mk-border-hover',
    '--mk-border-active',
    '--mk-divider',
    '--mk-text',
    '--mk-text-primary',
    '--mk-text-secondary',
    '--mk-text-tertiary',
    '--mk-text-disabled',
    '--mk-text-inverse',
  ]
  const grid = document.createElement('div')
  grid.style.display = 'grid'
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))'
  grid.style.gap = '8px'

  tokens.forEach((v) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(v)
      .trim()
    const isColor =
      value.startsWith('#') ||
      value.startsWith('rgb') ||
      value.startsWith('var')
    const box = document.createElement('div')
    box.style.display = 'flex'
    box.style.alignItems = 'center'
    box.style.gap = '10px'
    box.style.padding = '10px 12px'
    box.style.borderRadius = '8px'
    box.style.border = '1px solid var(--mk-border)'
    box.style.background = 'var(--mk-surface)'

    if (isColor) {
      const swatch = document.createElement('div')
      swatch.style.width = '28px'
      swatch.style.height = '28px'
      swatch.style.borderRadius = '6px'
      swatch.style.background = value
      swatch.style.border = '1px solid var(--mk-border)'
      swatch.style.flexShrink = '0'
      box.appendChild(swatch)
    }

    const text = document.createElement('div')
    text.style.display = 'flex'
    text.style.flexDirection = 'column'
    text.style.gap = '2px'
    text.innerHTML = `<span style="font-size:0.75rem;color:var(--mk-text);font-family:var(--mk-font-mono);">${v.replace('--mk-', '')}</span><span style="font-size:0.65rem;color:var(--mk-text-tertiary);font-family:var(--mk-font-mono);">${value}</span>`
    box.appendChild(text)
    grid.appendChild(box)
  })
  el.appendChild(grid)
}

function renderTypography() {
  const el = document.getElementById('token-typography')!
  const sizes = [
    { name: 'xs', size: '0.75rem' },
    { name: 'sm', size: '0.8125rem' },
    { name: 'base', size: '0.875rem' },
    { name: 'md', size: '1rem' },
    { name: 'lg', size: '1.125rem' },
    { name: 'xl', size: '1.25rem' },
    { name: '2xl', size: '1.5rem' },
    { name: '3xl', size: '1.875rem' },
    { name: '4xl', size: '2.25rem' },
  ]
  el.innerHTML = sizes
    .map(
      (s) => `
    <div style="display:flex;align-items:center;gap:16px;padding:10px 0;border-bottom:1px solid var(--mk-border);">
      <span style="font-size:0.75rem;color:var(--mk-text-tertiary);width:80px;font-family:var(--mk-font-mono);">${s.size}</span>
      <span style="font-size:${s.size};color:var(--mk-text);">Text ${s.name.toUpperCase()}</span>
    </div>
  `
    )
    .join('')
}

function renderSpacing() {
  const el = document.getElementById('token-spacing')!
  const spaces = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
  el.style.display = 'grid'
  el.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))'
  el.style.gap = '8px'
  spaces.forEach((n) => {
    const px = n * 4
    const box = document.createElement('div')
    box.style.display = 'flex'
    box.style.alignItems = 'center'
    box.style.gap = '12px'
    box.style.padding = '10px 12px'
    box.style.borderRadius = '6px'
    box.style.border = '1px solid var(--mk-border)'
    box.innerHTML = `<div style="width:${px}px;height:16px;background:var(--mk-primary);border-radius:4px;flex-shrink:0;"></div><span style="font-size:0.75rem;color:var(--mk-text-secondary);font-family:var(--mk-font-mono);">space-${n} = ${px}px</span>`
    el.appendChild(box)
  })
}

function renderRadius() {
  const el = document.getElementById('token-radius')!
  const radii = [
    { name: 'none', val: '0px' },
    { name: 'sm', val: '4px' },
    { name: '', val: '8px' },
    { name: 'md', val: '10px' },
    { name: 'lg', val: '12px' },
    { name: 'xl', val: '16px' },
    { name: '2xl', val: '20px' },
    { name: 'full', val: '9999px' },
  ]
  el.style.display = 'grid'
  el.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'
  el.style.gap = '12px'
  radii.forEach((r) => {
    const name = r.name ? `radius-${r.name}` : 'radius'
    const box = document.createElement('div')
    box.style.display = 'flex'
    box.style.flexDirection = 'column'
    box.style.gap = '6px'
    box.style.alignItems = 'center'
    const shape = document.createElement('div')
    shape.style.width = '64px'
    shape.style.height = '64px'
    shape.style.background = 'var(--mk-primary)'
    shape.style.borderRadius = r.val
    const label = document.createElement('span')
    label.style.fontSize = '0.75rem'
    label.style.color = 'var(--mk-text-secondary)'
    label.style.fontFamily = 'var(--mk-font-mono)'
    label.textContent = name
    box.appendChild(shape)
    box.appendChild(label)
    el.appendChild(box)
  })
}

function renderShadows() {
  const el = document.getElementById('token-shadows')!
  const shadows = ['sm', '', 'md', 'lg', 'xl']
  el.style.display = 'grid'
  el.style.gridTemplateColumns = '1fr'
  el.style.gap = '12px'
  shadows.forEach((s) => {
    const name = s ? `shadow-${s}` : 'shadow'
    const box = document.createElement('div')
    box.style.height = '60px'
    box.style.background = 'var(--mk-surface)'
    box.style.borderRadius = '8px'
    box.style.boxShadow = `var(--mk-${name})`
    box.style.display = 'flex'
    box.style.alignItems = 'center'
    box.style.padding = '0 16px'
    box.innerHTML = `<span style="font-size:0.8rem;color:var(--mk-text-secondary);font-family:var(--mk-font-mono);">--mk-${name}</span>`
    el.appendChild(box)
  })
}

function renderMotion() {
  const el = document.getElementById('token-motion')!
  const easings = [
    { name: 'ease-default', label: 'Default' },
    { name: 'ease-out', label: 'Out' },
    { name: 'ease-out-expo', label: 'Out Expo' },
    { name: 'ease-spring', label: 'Spring' },
    { name: 'ease-bounce', label: 'Bounce' },
  ]
  const durations = [
    { name: 'fast', ms: '150ms' },
    { name: 'normal', ms: '250ms' },
    { name: 'slow', ms: '400ms' },
    { name: 'slower', ms: '600ms' },
  ]

  let html =
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:24px;">'
  easings.forEach((e) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--mk-${e.name}`)
      .trim()
    html += `
      <div style="padding:12px;border:1px solid var(--mk-border);border-radius:8px;background:var(--mk-surface);">
        <div style="font-size:0.8rem;color:var(--mk-text);margin-bottom:8px;font-family:var(--mk-font-mono);">${e.label}</div>
        <div style="height:4px;background:var(--mk-border);border-radius:2px;overflow:hidden;">
          <div class="motion-demo-bar" style="height:100%;width:0%;background:var(--mk-primary);border-radius:2px;transition:width 1.5s ${value};"></div>
        </div>
        <div style="font-size:0.65rem;color:var(--mk-text-tertiary);margin-top:4px;font-family:var(--mk-font-mono);">${value}</div>
      </div>
    `
  })
  html += '</div>'

  html +=
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">'
  durations.forEach((d) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--mk-duration-${d.name}`)
      .trim()
    html += `
      <div style="padding:12px;border:1px solid var(--mk-border);border-radius:8px;background:var(--mk-surface);display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div style="font-size:0.8rem;color:var(--mk-text);font-family:var(--mk-font-mono);">${d.name}</div>
        <div style="font-size:0.75rem;color:var(--mk-text-secondary);font-family:var(--mk-font-mono);">${value}</div>
        <div style="height:4px;width:100%;background:var(--mk-border);border-radius:2px;overflow:hidden;">
          <div class="motion-demo-bar" style="height:100%;width:0%;background:var(--mk-primary);border-radius:2px;transition:width ${value} var(--mk-ease-default);"></div>
        </div>
      </div>
    `
  })
  html += '</div>'
  el.innerHTML = html

  // Animate the bars
  setTimeout(() => {
    el.querySelectorAll<HTMLElement>('.motion-demo-bar').forEach((bar) => {
      bar.style.width = '100%'
    })
  }, 100)
}
