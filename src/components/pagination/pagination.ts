import './pagination.css'

export interface PaginationOptions {
  total: number
  pageSize?: number
  currentPage?: number
  pageSizes?: number[]
  onChange?: (page: number) => void
  onSizeChange?: (size: number) => void
}

export class MkPagination {
  el: HTMLDivElement
  private options: PaginationOptions
  private currentPage: number
  private pageSize: number

  constructor(container: HTMLElement | string, options: PaginationOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      pageSize: 10,
      currentPage: 1,
      pageSizes: [10, 20, 50],
      ...options,
    }
    this.currentPage = this.options.currentPage!
    this.pageSize = this.options.pageSize!

    this.el = document.createElement('div')
    this.el.className = 'mk-pagination'

    this.render()
    parent.appendChild(this.el)
  }

  private get totalPages(): number {
    return Math.max(1, Math.ceil(this.options.total / this.pageSize))
  }

  private render(): void {
    this.el.innerHTML = ''

    const totalEl = document.createElement('span')
    totalEl.className = 'mk-pagination__total'
    totalEl.textContent = `共 ${this.options.total} 条`
    this.el.appendChild(totalEl)

    const prev = document.createElement('button')
    prev.className = 'mk-pagination__btn'
    prev.textContent = '‹'
    prev.disabled = this.currentPage <= 1
    prev.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--
        this.onChange()
      }
    })
    this.el.appendChild(prev)

    const maxVisible = 5
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1)
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    if (startPage > 1) {
      this.el.appendChild(this.createPageBtn(1))
      if (startPage > 2) {
        const dots = document.createElement('span')
        dots.className = 'mk-pagination__btn'
        dots.textContent = '...'
        dots.style.cursor = 'default'
        this.el.appendChild(dots)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      this.el.appendChild(this.createPageBtn(i))
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        const dots = document.createElement('span')
        dots.className = 'mk-pagination__btn'
        dots.textContent = '...'
        dots.style.cursor = 'default'
        this.el.appendChild(dots)
      }
      this.el.appendChild(this.createPageBtn(this.totalPages))
    }

    const next = document.createElement('button')
    next.className = 'mk-pagination__btn'
    next.textContent = '›'
    next.disabled = this.currentPage >= this.totalPages
    next.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.onChange()
      }
    })
    this.el.appendChild(next)

    const sizeEl = document.createElement('span')
    sizeEl.className = 'mk-pagination__size'
    const sizes = this.options.pageSizes || [10, 20, 50]
    const optionsHtml = sizes
      .map(
        (s) =>
          `<option value="${s}" ${this.pageSize === s ? 'selected' : ''}>${s}</option>`
      )
      .join('')
    sizeEl.innerHTML = `每页 <select>${optionsHtml}</select> 条`
    sizeEl.querySelector('select')!.addEventListener('change', (e) => {
      this.pageSize = Number((e.target as HTMLSelectElement).value)
      this.currentPage = 1
      this.onSizeChange()
    })
    this.el.appendChild(sizeEl)
  }

  private createPageBtn(page: number): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = 'mk-pagination__btn'
    btn.textContent = String(page)
    if (page === this.currentPage) btn.classList.add('is-active')
    btn.addEventListener('click', () => {
      this.currentPage = page
      this.onChange()
    })
    return btn
  }

  private onChange(): void {
    this.render()
    this.options.onChange?.(this.currentPage)
  }

  private onSizeChange(): void {
    this.render()
    this.options.onSizeChange?.(this.pageSize)
  }

  setTotal(total: number): void {
    this.options.total = total
    this.currentPage = 1
    this.render()
  }

  setCurrentPage(page: number): void {
    this.currentPage = page
    this.render()
  }

  destroy(): void {
    this.el.remove()
  }
}

export function createPagination(
  container: HTMLElement | string,
  options: PaginationOptions
): MkPagination {
  return new MkPagination(container, options)
}
