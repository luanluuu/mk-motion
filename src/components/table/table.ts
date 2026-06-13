import './table.css'
import '../form/checkbox.css'

export interface TableColumn {
  key: string
  title: string
  width?: string
  sortable?: boolean
  editable?: boolean
  render?: (
    value: unknown,
    row: Record<string, unknown>,
    index: number
  ) => HTMLElement | string
}

export interface TableOptions {
  columns: TableColumn[]
  data: Record<string, unknown>[]
  pageSize?: number
  virtual?: boolean
  itemHeight?: number
  virtualHeight?: number
  selection?: 'single' | 'multiple'
  onEdit?: (row: Record<string, unknown>, rowIndex: number) => void
  onDelete?: (row: Record<string, unknown>, rowIndex: number) => void
  onRowClick?: (row: Record<string, unknown>, rowIndex: number) => void
  onSelectChange?: (selected: Record<string, unknown>[]) => void
}

const DEFAULT_ITEM_HEIGHT = 44
const DEFAULT_VIRTUAL_HEIGHT = 400
const BUFFER_COUNT = 5

export class MkTable {
  el: HTMLDivElement
  private table: HTMLTableElement
  private tbody: HTMLTableSectionElement
  private scrollContainer?: HTMLDivElement
  private columns: TableColumn[]
  private data: Record<string, unknown>[]
  private pageSize: number
  private currentPage = 1
  private sortState: { key: string; order: 'asc' | 'desc' } | null = null
  private editingRow: number | null = null
  private editCache: Record<string, unknown> | null = null
  private filteredData: Record<string, unknown>[]
  private _isVirtual = false
  private _itemHeight = DEFAULT_ITEM_HEIGHT
  private _virtualHeight = DEFAULT_VIRTUAL_HEIGHT
  private _scrollHandler?: () => void

  private selectedRows = new Set<Record<string, unknown>>()
  private selectionMode?: 'single' | 'multiple'

  private callbacks: Pick<
    TableOptions,
    'onEdit' | 'onDelete' | 'onRowClick' | 'onSelectChange'
  >

  constructor(container: HTMLElement | string, options: TableOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.columns = options.columns
    this.data = options.data
    this.pageSize = options.pageSize || 10
    this.filteredData = [...this.data]
    this.callbacks = options
    this.selectionMode = options.selection
    this._isVirtual = !!options.virtual
    this._itemHeight = options.itemHeight || DEFAULT_ITEM_HEIGHT
    this._virtualHeight = options.virtualHeight || DEFAULT_VIRTUAL_HEIGHT

    this.el = document.createElement('div')
    this.el.className = 'mk-table-wrapper'

    if (this._isVirtual) {
      this.scrollContainer = document.createElement('div')
      this.scrollContainer.className = 'mk-table-scroll-container'
      this.scrollContainer.style.maxHeight = `${this._virtualHeight}px`
      this.scrollContainer.style.overflowY = 'auto'
      this._scrollHandler = () => this.renderVirtualWindow()
      this.scrollContainer.addEventListener('scroll', this._scrollHandler)
      this.el.appendChild(this.scrollContainer)
    }

    this.table = document.createElement('table')
    this.table.className = 'mk-table'
    this.table.setAttribute('role', 'table')

    const thead = document.createElement('thead')
    thead.setAttribute('role', 'rowgroup')
    const headerRow = document.createElement('tr')
    headerRow.setAttribute('role', 'row')
    if (this.selectionMode) {
      const th = document.createElement('th')
      th.setAttribute('role', 'columnheader')
      th.appendChild(this.createHeaderSelectionCheckbox())
      headerRow.appendChild(th)
    }
    this.columns.forEach((col) => {
      const th = document.createElement('th')
      th.setAttribute('role', 'columnheader')
      th.textContent = col.title
      if (col.width) th.style.width = col.width
      if (col.sortable) {
        th.classList.add('is-sortable')
        th.setAttribute('aria-sort', 'none')
        const icon = document.createElement('span')
        icon.className = 'mk-table__sort-icon'
        icon.textContent = '⇅'
        th.appendChild(icon)
        th.addEventListener('click', () => this.handleSort(col.key))
      }
      headerRow.appendChild(th)
    })
    thead.appendChild(headerRow)
    this.table.appendChild(thead)

    this.tbody = document.createElement('tbody')
    this.tbody.setAttribute('role', 'rowgroup')
    this.table.appendChild(this.tbody)

    if (this.scrollContainer) {
      this.scrollContainer.appendChild(this.table)
    } else {
      this.el.appendChild(this.table)
    }

    parent.appendChild(this.el)
    this.render()
  }

  private get colCount(): number {
    return this.columns.length + (this.selectionMode ? 1 : 0)
  }

  private getDisplayData(): Record<string, unknown>[] {
    if (this.sortState) {
      const sorted = [...this.filteredData].sort((a, b) => {
        const av = a[this.sortState!.key] as string | number
        const bv = b[this.sortState!.key] as string | number
        if (av < bv) return this.sortState!.order === 'asc' ? -1 : 1
        if (av > bv) return this.sortState!.order === 'asc' ? 1 : -1
        return 0
      })
      return sorted
    }
    return this.filteredData
  }

  private handleSort(key: string): void {
    if (!this.sortState || this.sortState.key !== key) {
      this.sortState = { key, order: 'asc' }
    } else if (this.sortState.order === 'asc') {
      this.sortState.order = 'desc'
    } else {
      this.sortState = null
    }
    this.render()
  }

  render(): void {
    this.tbody.innerHTML = ''
    const displayData = this.getDisplayData()

    if (displayData.length === 0) {
      const row = document.createElement('tr')
      row.setAttribute('role', 'row')
      const cell = document.createElement('td')
      cell.setAttribute('role', 'cell')
      cell.colSpan = this.colCount
      cell.className = 'mk-table__empty'
      cell.textContent = '暂无数据'
      row.appendChild(cell)
      this.tbody.appendChild(row)
      if (!this._isVirtual) {
        this.renderPagination(displayData.length)
      } else {
        this.removePagination()
      }
      this.updateSortIcons()
      return
    }

    if (this._isVirtual) {
      this.renderVirtualSpacers(displayData.length)
      this.renderVirtualWindow()
    } else {
      const start = (this.currentPage - 1) * this.pageSize
      const pageData = displayData.slice(start, start + this.pageSize)
      pageData.forEach((rowData, pageIndex) => {
        const rowIndex = start + pageIndex
        this.renderRow(rowData, rowIndex)
      })
      this.renderPagination(displayData.length)
    }

    this.updateSortIcons()
  }

  private renderVirtualSpacers(totalCount: number): void {
    // Top spacer
    const topSpacer = document.createElement('tr')
    topSpacer.className = 'mk-table__virtual-spacer-top'
    const topCell = document.createElement('td')
    topCell.colSpan = this.colCount
    topCell.style.padding = '0'
    topCell.style.border = 'none'
    topCell.style.height = '0px'
    topSpacer.appendChild(topCell)
    this.tbody.appendChild(topSpacer)

    // Bottom spacer
    const bottomSpacer = document.createElement('tr')
    bottomSpacer.className = 'mk-table__virtual-spacer-bottom'
    const bottomCell = document.createElement('td')
    bottomCell.colSpan = this.colCount
    bottomCell.style.padding = '0'
    bottomCell.style.border = 'none'
    bottomCell.style.height = `${totalCount * this._itemHeight}px`
    bottomSpacer.appendChild(bottomCell)
    this.tbody.appendChild(bottomSpacer)
  }

  private renderVirtualWindow(): void {
    if (!this._isVirtual || !this.scrollContainer) return

    const displayData = this.getDisplayData()
    const totalCount = displayData.length
    const scrollTop = this.scrollContainer.scrollTop
    const containerHeight =
      this.scrollContainer.clientHeight || this._virtualHeight

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / this._itemHeight) - BUFFER_COUNT
    )
    const visibleCount = Math.ceil(containerHeight / this._itemHeight)
    const endIndex = Math.min(
      totalCount,
      startIndex + visibleCount + BUFFER_COUNT * 2
    )

    // Remove old visible rows (between spacers)
    const oldRows = this.tbody.querySelectorAll('.mk-table__virtual-row')
    oldRows.forEach((el) => el.remove())

    // Update spacer heights
    const topSpacer = this.tbody.querySelector(
      '.mk-table__virtual-spacer-top td'
    ) as HTMLTableCellElement
    const bottomSpacer = this.tbody.querySelector(
      '.mk-table__virtual-spacer-bottom td'
    ) as HTMLTableCellElement
    if (topSpacer) topSpacer.style.height = `${startIndex * this._itemHeight}px`
    if (bottomSpacer)
      bottomSpacer.style.height = `${(totalCount - endIndex) * this._itemHeight}px`

    // Render visible rows (insert between spacers)
    const bottomSpacerRow = this.tbody.querySelector(
      '.mk-table__virtual-spacer-bottom'
    )
    for (let i = startIndex; i < endIndex; i++) {
      const rowData = displayData[i]
      if (!rowData) continue
      const tr = this.createRowElement(rowData, i)
      tr.classList.add('mk-table__virtual-row')
      tr.style.height = `${this._itemHeight}px`
      if (bottomSpacerRow) {
        this.tbody.insertBefore(tr, bottomSpacerRow)
      } else {
        this.tbody.appendChild(tr)
      }
    }
  }

  private renderRow(rowData: Record<string, unknown>, rowIndex: number): void {
    const tr = this.createRowElement(rowData, rowIndex)
    this.tbody.appendChild(tr)
  }

  private createRowElement(
    rowData: Record<string, unknown>,
    rowIndex: number
  ): HTMLTableRowElement {
    const tr = document.createElement('tr')
    tr.setAttribute('role', 'row')
    if (this.editingRow === rowIndex) tr.classList.add('is-editing')
    tr.addEventListener('click', () => {
      this.callbacks.onRowClick?.(rowData, rowIndex)
    })

    if (this.selectionMode) {
      const td = document.createElement('td')
      td.setAttribute('role', 'cell')
      td.appendChild(this.createRowSelectionCheckbox(rowData))
      tr.appendChild(td)
    }

    this.columns.forEach((col) => {
      const td = document.createElement('td')
      td.setAttribute('role', 'cell')
      if (
        this.editingRow === rowIndex &&
        col.editable &&
        col.key !== 'actions'
      ) {
        const input = document.createElement('input')
        input.className = 'mk-table__edit-input'
        input.value = String(this.editCache![col.key] ?? rowData[col.key] ?? '')
        input.addEventListener('input', (e) => {
          this.editCache![col.key] = (e.target as HTMLInputElement).value
        })
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.saveEdit()
          if (e.key === 'Escape') this.cancelEdit()
        })
        td.appendChild(input)
      } else if (col.render) {
        const rendered = col.render(rowData[col.key], rowData, rowIndex)
        if (rendered instanceof HTMLElement) {
          td.appendChild(rendered)
        } else if (typeof rendered === 'string' && rendered.includes('<')) {
          td.innerHTML = rendered
        } else {
          td.textContent = String(rendered)
        }
      } else {
        td.textContent =
          rowData[col.key] !== undefined ? String(rowData[col.key]) : ''
      }
      tr.appendChild(td)
    })
    return tr
  }

  private updateSortIcons(): void {
    const headers = this.table.querySelectorAll('th')
    headers.forEach((th) => {
      const icon = th.querySelector('.mk-table__sort-icon')
      if (icon) {
        icon.classList.remove('is-active')
        icon.textContent = '⇅'
        th.setAttribute('aria-sort', 'none')
      }
    })
    if (this.sortState) {
      const colIndex = this.columns.findIndex(
        (c) => c.key === this.sortState!.key
      )
      if (colIndex >= 0) {
        const offset = this.selectionMode ? 1 : 0
        const th = headers[colIndex + offset]
        const icon = th?.querySelector('.mk-table__sort-icon')
        if (icon) {
          icon.classList.add('is-active')
          icon.textContent = this.sortState.order === 'asc' ? '↑' : '↓'
        }
        if (th) {
          th.setAttribute(
            'aria-sort',
            this.sortState.order === 'asc' ? 'ascending' : 'descending'
          )
        }
      }
    }
  }

  private removePagination(): void {
    const existing = this.el.querySelector('.mk-pagination')
    existing?.remove()
  }

  private renderPagination(total: number): void {
    const existing = this.el.querySelector('.mk-pagination')
    existing?.remove()

    const totalPages = Math.max(1, Math.ceil(total / this.pageSize))
    const pagination = document.createElement('div')
    pagination.className = 'mk-pagination'

    const totalEl = document.createElement('span')
    totalEl.className = 'mk-pagination__total'
    totalEl.textContent = `共 ${total} 条`
    pagination.appendChild(totalEl)

    const prev = document.createElement('button')
    prev.className = 'mk-pagination__btn'
    prev.textContent = '‹'
    prev.disabled = this.currentPage <= 1
    prev.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--
        this.render()
      }
    })
    pagination.appendChild(prev)

    const maxVisible = 5
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    if (startPage > 1) {
      pagination.appendChild(this.createPageBtn(1))
      if (startPage > 2) {
        const dots = document.createElement('span')
        dots.className = 'mk-pagination__btn'
        dots.textContent = '...'
        dots.style.cursor = 'default'
        pagination.appendChild(dots)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pagination.appendChild(this.createPageBtn(i))
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('span')
        dots.className = 'mk-pagination__btn'
        dots.textContent = '...'
        dots.style.cursor = 'default'
        pagination.appendChild(dots)
      }
      pagination.appendChild(this.createPageBtn(totalPages))
    }

    const next = document.createElement('button')
    next.className = 'mk-pagination__btn'
    next.textContent = '›'
    next.disabled = this.currentPage >= totalPages
    next.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.currentPage++
        this.render()
      }
    })
    pagination.appendChild(next)

    const sizeEl = document.createElement('span')
    sizeEl.className = 'mk-pagination__size'
    sizeEl.innerHTML = `
      每页
      <select>
        <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10</option>
        <option value="20" ${this.pageSize === 20 ? 'selected' : ''}>20</option>
        <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50</option>
      </select>
      条
    `
    sizeEl.querySelector('select')!.addEventListener('change', (e) => {
      this.pageSize = Number((e.target as HTMLSelectElement).value)
      this.currentPage = 1
      this.render()
    })
    pagination.appendChild(sizeEl)

    this.el.appendChild(pagination)
  }

  private createPageBtn(page: number): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = 'mk-pagination__btn'
    btn.textContent = String(page)
    if (page === this.currentPage) btn.classList.add('is-active')
    btn.addEventListener('click', () => {
      this.currentPage = page
      this.render()
    })
    return btn
  }

  setData(data: Record<string, unknown>[]): void {
    this.data = data
    this.filteredData = [...data]
    this.currentPage = 1
    this.render()
  }

  filter(predicate: (row: Record<string, unknown>) => boolean): void {
    this.filteredData = this.data.filter(predicate)
    this.currentPage = 1
    this.render()
  }

  clearFilter(): void {
    this.filteredData = [...this.data]
    this.currentPage = 1
    this.render()
  }

  startEdit(rowIndex: number): void {
    this.editingRow = rowIndex
    this.editCache = { ...this.filteredData[rowIndex] }
    this.render()
    const input = this.tbody.querySelector(
      '.mk-table__edit-input'
    ) as HTMLInputElement
    input?.focus()
  }

  saveEdit(): void {
    if (this.editingRow !== null && this.editCache) {
      const rowData = this.editCache
      this.filteredData[this.editingRow] = rowData
      const origIndex = this.data.findIndex(
        (r, i) =>
          i === this.editingRow || JSON.stringify(r) === JSON.stringify(rowData)
      )
      if (origIndex >= 0) this.data[origIndex] = rowData
      this.callbacks.onEdit?.(rowData, this.editingRow)
    }
    this.editingRow = null
    this.editCache = null
    this.render()
  }

  cancelEdit(): void {
    this.editingRow = null
    this.editCache = null
    this.render()
  }

  deleteRow(rowIndex: number): void {
    const row = this.filteredData[rowIndex]
    this.data = this.data.filter((r) => r !== row)
    this.filteredData = this.filteredData.filter((r) => r !== row)
    this.selectedRows.delete(row)
    this.callbacks.onDelete?.(row, rowIndex)
    if (
      this.filteredData.length <= (this.currentPage - 1) * this.pageSize &&
      this.currentPage > 1
    ) {
      this.currentPage--
    }
    this.render()
  }

  private createHeaderSelectionCheckbox(): HTMLLabelElement {
    const label = document.createElement('label')
    label.className = 'mk-checkbox'
    label.setAttribute('role', 'checkbox')
    const allSelected =
      this.filteredData.length > 0 &&
      this.filteredData.every((r) => this.selectedRows.has(r))
    label.setAttribute('aria-checked', String(allSelected))
    if (allSelected) label.classList.add('is-checked')

    const box = document.createElement('span')
    box.className = 'mk-checkbox__input'
    const check = document.createElement('span')
    check.className = 'mk-checkbox__check'
    check.textContent = '✓'
    box.appendChild(check)
    label.appendChild(box)

    if (this.selectionMode === 'multiple') {
      label.addEventListener('click', (e) => {
        e.stopPropagation()
        if (allSelected) this.clearSelection()
        else this.selectAll()
      })
    } else {
      label.style.visibility = 'hidden'
    }

    return label
  }

  private createRowSelectionCheckbox(
    rowData: Record<string, unknown>
  ): HTMLLabelElement {
    const label = document.createElement('label')
    label.className = 'mk-checkbox'
    label.setAttribute('role', 'checkbox')
    const checked = this.selectedRows.has(rowData)
    label.setAttribute('aria-checked', String(checked))
    if (checked) label.classList.add('is-checked')

    const box = document.createElement('span')
    box.className = 'mk-checkbox__input'
    const check = document.createElement('span')
    check.className = 'mk-checkbox__check'
    check.textContent = '✓'
    box.appendChild(check)
    label.appendChild(box)

    label.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleRowSelection(rowData)
    })

    return label
  }

  private toggleRowSelection(rowData: Record<string, unknown>): void {
    if (this.selectionMode === 'single') {
      this.selectedRows.clear()
      this.selectedRows.add(rowData)
    } else {
      if (this.selectedRows.has(rowData)) {
        this.selectedRows.delete(rowData)
      } else {
        this.selectedRows.add(rowData)
      }
    }
    this.render()
    this.callbacks.onSelectChange?.(this.getSelectedRows())
  }

  getSelectedRows(): Record<string, unknown>[] {
    return Array.from(this.selectedRows)
  }

  selectAll(): void {
    if (this.selectionMode !== 'multiple') return
    this.getDisplayData().forEach((r) => this.selectedRows.add(r))
    this.render()
    this.callbacks.onSelectChange?.(this.getSelectedRows())
  }

  clearSelection(): void {
    this.selectedRows.clear()
    this.render()
    this.callbacks.onSelectChange?.(this.getSelectedRows())
  }

  destroy(): void {
    if (this._scrollHandler && this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this._scrollHandler)
    }
    this.el.remove()
  }
}

export function createTable(
  container: HTMLElement | string,
  options: TableOptions
): MkTable {
  return new MkTable(container, options)
}
