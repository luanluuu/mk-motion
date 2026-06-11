import { renderToc } from '../shared/utils.js'
import { API_STABILITY } from '../../../src/stability.ts'

export function renderApiStability(container?: HTMLElement) {
  document.getElementById('toc')!.style.display = 'block'
  const main = container || document.getElementById('main')!
  main.innerHTML = `
    <h1 class="doc-h1">API 稳定性</h1>
    <p class="doc-p">mk-motion 的所有公开 API 分为三个稳定性级别。选择适合你风险偏好的 API。</p>

    <h2 class="doc-h2" id="levels">稳定性级别</h2>
    <div id="stability-levels"></div>

    <h2 class="doc-h2" id="stable">@stable — 稳定 API</h2>
    <div id="stability-stable"></div>

    <h2 class="doc-h2" id="experimental">@experimental — 实验性 API</h2>
    <div id="stability-experimental"></div>

    <h2 class="doc-h2" id="legacy">@legacy — 旧版 API</h2>
    <div id="stability-legacy"></div>
  `
  renderToc(['levels', 'stable', 'experimental', 'legacy'])
  setTimeout(() => {
    renderLevels()
    renderApiTable('stable')
    renderApiTable('experimental')
    renderApiTable('legacy')
  }, 0)
}

function renderLevels() {
  const el = document.getElementById('stability-levels')!
  el.innerHTML = `
    <table class="doc-table">
      <thead><tr><th>级别</th><th>含义</th><th>是否可用于生产</th></tr></thead>
      <tbody>
        <tr>
          <td><span class="stability-badge stable">@stable</span></td>
          <td>API 已稳定，同大版本内向后兼容。破坏性变更需要大版本升级。</td>
          <td>✅ 推荐</td>
        </tr>
        <tr>
          <td><span class="stability-badge experimental">@experimental</span></td>
          <td>API 可能在小版本/补丁版本中变更。建议锁定版本号。</td>
          <td>⚠️ 可用，需锁定版本</td>
        </tr>
        <tr>
          <td><span class="stability-badge legacy">@legacy</span></td>
          <td>已废弃的命令式 DOM API。仅保留兼容，不再新增功能。将在未来大版本中移除。</td>
          <td>❌ 新项目不推荐</td>
        </tr>
      </tbody>
    </table>
  `
}

function renderApiTable(level: string) {
  const el = document.getElementById(`stability-${level}`)!
  const apis = API_STABILITY.filter(e => e.level === level)
  if (apis.length === 0) {
    el.innerHTML = '<p class="doc-p">暂无此级别的 API。</p>'
    return
  }
  const rows = apis.map(a =>
    `<tr><td><code>${a.name}</code></td><td>${a.description}</td><td><code>@luanlu/mk-motion</code></td></tr>`
  ).join('')
  el.innerHTML = `
    <table class="doc-table">
      <thead><tr><th>API</th><th>说明</th><th>导入路径</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `
}
