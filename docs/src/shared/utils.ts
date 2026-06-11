export function demoCard(title: string, stageHtml: string, code: string) {
  const id = 'code-' + Math.random().toString(36).slice(2, 8)
  return `
    <div class="doc-demo">
      <div class="doc-demo-stage">${stageHtml}</div>
      <div class="doc-demo-code">
        <button class="doc-demo-copy" data-code-id="${id}">复制</button>
        <pre><code class="language-typescript" id="${id}">${escapeHtml(code)}</code></pre>
      </div>
    </div>
  `
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function copyCode(id: string) {
  const text = document.getElementById(id)!.textContent!
  navigator.clipboard.writeText(text)
  const btn = document.querySelector(`button[data-code-id="${id}"]`) as HTMLButtonElement
  if (!btn) return
  const old = btn.textContent
  btn.textContent = '已复制'
  setTimeout(() => btn.textContent = old, 1500)
}

export function renderToc(ids: string[]) {
  const toc = document.getElementById('toc')!
  toc.innerHTML = '<div class="doc-toc-title">目录</div>' +
    ids.map(id => {
      const el = document.getElementById(id)
      const text = el ? (el.tagName.match(/^H/i) ? el.textContent : el.previousElementSibling?.textContent || id) : id
      return `<a href="#${id}" onclick="event.preventDefault();document.getElementById('${id}').scrollIntoView({behavior:'smooth'})">${text}</a>`
    }).join('')
}

export function codeBlock(text: string): HTMLElement {
  const el = document.createElement('div')
  el.style.fontFamily = 'var(--mk-font-mono)'
  el.style.fontSize = '0.85rem'
  el.style.background = 'var(--mk-bg-elevated)'
  el.style.padding = '14px 18px'
  el.style.borderRadius = 'var(--mk-radius-md)'
  el.style.border = '1px solid var(--mk-border)'
  el.style.color = 'var(--mk-text-secondary)'
  el.textContent = text
  return el
}
