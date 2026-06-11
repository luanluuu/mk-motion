import './select.css'
import { onKey, Keys } from '../../a11y/keyboard.ts'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface SelectOptions {
  placeholder?: string
  options: SelectOption[]
  value?: string | number
  disabled?: boolean
  onChange?: (value: string | number) => void
  virtualThreshold?: number
  itemHeight?: number
  filterable?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => Promise<SelectOption[]> | SelectOption[]
  debounce?: number
  loading?: boolean
}

const DEFAULT_ITEM_HEIGHT = 36
const DEFAULT_VIRTUAL_THRESHOLD = 50
const DEFAULT_DEBOUNCE = 300
const BUFFER_COUNT = 5

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export class MkSelect {
  el: HTMLDivElement
  private trigger: HTMLDivElement
  private dropdown: HTMLDivElement
  private options: SelectOptions
  private _value: string | number | undefined
  private isOpen = false
  private _cleanupKey?: () => void
  private _outsideClickHandler?: (e: MouseEvent) => void
  private _scrollHandler?: () => void
  private _topSpacer?: HTMLDivElement
  private _bottomSpacer?: HTMLDivElement
  private _isVirtual = false
  private _searchInput?: HTMLInputElement
  private _labelEl?: HTMLSpanElement
  private _allOptions: SelectOption[] = []
  private _isRemoteLoading = false
  private _debouncedSearch?: (query: string) => void
  private _loadingEl?: HTMLDivElement

  constructor(container: HTMLElement | string, options: SelectOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = options
    this._value = options.value
    this._allOptions = [...options.options]
    this._isVirtual = this.shouldVirtualize()

    this.el = document.createElement('div')
    this.el.className = 'mk-select'
    if (options.filterable) this.el.classList.add('is-filterable')
    if (options.remote) this.el.classList.add('is-remote')

    this.trigger = document.createElement('div')
    this.trigger.className = 'mk-select__trigger'
    this.trigger.setAttribute('role', 'combobox')
    this.trigger.setAttribute('aria-haspopup', 'listbox')
    this.trigger.setAttribute('aria-expanded', 'false')
    this.trigger.setAttribute('tabindex', options.disabled ? '-1' : '0')

    if (options.disabled) {
      this.trigger.classList.add('is-disabled')
    } else {
      this.trigger.addEventListener('click', () => this.onTriggerClick())
    }

    this._labelEl = document.createElement('span')
    this._labelEl.className = 'mk-select__label'
    this.updateLabel(this._labelEl)
    this.trigger.appendChild(this._labelEl)

    // Search input for filterable / remote
    if (options.filterable || options.remote) {
      this._searchInput = document.createElement('input')
      this._searchInput.className = 'mk-select__search-input'
      this._searchInput.type = 'text'
      this._searchInput.placeholder = this.getSelectedLabel() || options.placeholder || '请选择'
      this._searchInput.style.display = 'none'
      this._searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value
        this.onSearchInput(query)
      })
      this._searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          this.moveSelection(1)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          this.moveSelection(-1)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (this.isOpen) this.close()
          else this.open()
        } else if (e.key === 'Escape') {
          this.close()
          this.trigger.focus()
        }
      })
      this.trigger.appendChild(this._searchInput)

      this._debouncedSearch = debounce((query: string) => this.doSearch(query), options.debounce ?? DEFAULT_DEBOUNCE)
    }

    const arrow = document.createElement('span')
    arrow.className = 'mk-select__arrow'
    arrow.textContent = '▼'
    this.trigger.appendChild(arrow)

    this.dropdown = document.createElement('div')
    this.dropdown.className = 'mk-select__dropdown'
    this.dropdown.setAttribute('role', 'listbox')

    if (this._isVirtual) {
      this.dropdown.classList.add('is-virtual')
      this._scrollHandler = () => this.renderVirtualWindow()
      this.dropdown.addEventListener('scroll', this._scrollHandler)
      this._topSpacer = document.createElement('div')
      this._topSpacer.className = 'mk-select__virtual-spacer'
      this._bottomSpacer = document.createElement('div')
      this._bottomSpacer.className = 'mk-select__virtual-spacer'
    }

    this.renderOptionItems()

    this.el.appendChild(this.trigger)
    this.el.appendChild(this.dropdown)
    parent.appendChild(this.el)

    this._cleanupKey = onKey(this.trigger, [
      { key: Keys.ArrowDown, handler: () => this.moveSelection(1) },
      { key: Keys.ArrowUp, handler: () => this.moveSelection(-1) },
      { key: Keys.Enter, handler: () => {
        if (this.isOpen) this.close()
        else this.open()
      }},
      { key: Keys.Escape, handler: () => this.close() },
    ])

    this._outsideClickHandler = (e: MouseEvent) => {
      if (!this.el.contains(e.target as Node)) this.close()
    }
    document.addEventListener('click', this._outsideClickHandler)
  }

  private get itemHeight(): number {
    return this.options.itemHeight || DEFAULT_ITEM_HEIGHT
  }

  private shouldVirtualize(): boolean {
    const threshold = this.options.virtualThreshold ?? DEFAULT_VIRTUAL_THRESHOLD
    return this.options.options.length > threshold
  }

  private onTriggerClick(): void {
    if (this.options.filterable || this.options.remote) {
      this.open()
      this.showSearchInput()
    } else {
      this.toggle()
    }
  }

  private showSearchInput(): void {
    if (!this._searchInput || !this._labelEl) return
    this._labelEl.style.display = 'none'
    this._searchInput.style.display = 'block'
    this._searchInput.value = ''
    this._searchInput.focus()
  }

  private hideSearchInput(): void {
    if (!this._searchInput || !this._labelEl) return
    this._searchInput.style.display = 'none'
    this._searchInput.value = ''
    this._labelEl.style.display = 'block'
  }

  private onSearchInput(query: string): void {
    if (this.options.remote && this._debouncedSearch) {
      this._debouncedSearch(query)
    } else if (this.options.filterable) {
      this._debouncedSearch?.(query)
    }
  }

  private async doSearch(query: string): Promise<void> {
    if (this.options.remote && this.options.remoteMethod) {
      this.setLoading(true)
      try {
        const result = await this.options.remoteMethod(query)
        this.options.options = result
        this._isVirtual = this.shouldVirtualize()
        this.rebuildVirtual()
        this.renderOptionItems()
      } finally {
        this.setLoading(false)
      }
    } else if (this.options.filterable) {
      const q = query.toLowerCase()
      this.options.options = this._allOptions.filter((opt) =>
        opt.label.toLowerCase().includes(q)
      )
      this._isVirtual = this.shouldVirtualize()
      this.rebuildVirtual()
      this.renderOptionItems()
    }
  }

  private setLoading(loading: boolean): void {
    this._isRemoteLoading = loading
    if (loading) {
      if (!this._loadingEl) {
        this._loadingEl = document.createElement('div')
        this._loadingEl.className = 'mk-select__loading'
        this._loadingEl.textContent = '加载中...'
      }
      if (!this.dropdown.contains(this._loadingEl)) {
        this.dropdown.appendChild(this._loadingEl)
      }
    } else if (this._loadingEl) {
      this._loadingEl.remove()
    }
  }

  private rebuildVirtual(): void {
    if (this._isVirtual) {
      if (!this._scrollHandler) {
        this.dropdown.classList.add('is-virtual')
        this._scrollHandler = () => this.renderVirtualWindow()
        this.dropdown.addEventListener('scroll', this._scrollHandler)
        this._topSpacer = document.createElement('div')
        this._topSpacer.className = 'mk-select__virtual-spacer'
        this._bottomSpacer = document.createElement('div')
        this._bottomSpacer.className = 'mk-select__virtual-spacer'
      }
    } else {
      this.dropdown.classList.remove('is-virtual')
      if (this._scrollHandler) {
        this.dropdown.removeEventListener('scroll', this._scrollHandler)
        this._scrollHandler = undefined
      }
      this._topSpacer = undefined
      this._bottomSpacer = undefined
    }
  }

  private renderOptionItems(): void {
    // Remove loading element temporarily
    if (this._loadingEl && this.dropdown.contains(this._loadingEl)) {
      this._loadingEl.remove()
    }

    this.dropdown.innerHTML = ''
    if (this._isVirtual && this._topSpacer && this._bottomSpacer) {
      this.dropdown.appendChild(this._topSpacer)
      this.dropdown.appendChild(this._bottomSpacer)
      this.renderVirtualWindow()
    } else {
      this.renderAllOptions()
    }

    // Re-add loading if active
    if (this._isRemoteLoading && this._loadingEl) {
      this.dropdown.appendChild(this._loadingEl)
    }

    // Show empty state if no options
    if (this.options.options.length === 0 && !this._isRemoteLoading) {
      const empty = document.createElement('div')
      empty.className = 'mk-select__empty'
      empty.textContent = '无匹配数据'
      this.dropdown.appendChild(empty)
    }
  }

  private renderAllOptions(): void {
    this.options.options.forEach((opt) => {
      const item = this.createOptionElement(opt)
      this.dropdown.appendChild(item)
    })
  }

  private renderVirtualWindow(): void {
    if (!this._isVirtual || !this._topSpacer || !this._bottomSpacer) return

    const scrollTop = this.dropdown.scrollTop
    const containerHeight = this.dropdown.clientHeight || 240
    const totalCount = this.options.options.length

    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - BUFFER_COUNT)
    const visibleCount = Math.ceil(containerHeight / this.itemHeight)
    const endIndex = Math.min(totalCount, startIndex + visibleCount + BUFFER_COUNT * 2)

    // Remove old visible items (but keep spacers)
    const oldItems = this.dropdown.querySelectorAll('.mk-select__option')
    oldItems.forEach((el) => el.remove())

    // Update spacers
    this._topSpacer.style.height = `${startIndex * this.itemHeight}px`
    this._bottomSpacer.style.height = `${(totalCount - endIndex) * this.itemHeight}px`

    // Render visible window
    for (let i = startIndex; i < endIndex; i++) {
      const opt = this.options.options[i]
      if (!opt) continue
      const item = this.createOptionElement(opt)
      this.dropdown.insertBefore(item, this._bottomSpacer)
    }
  }

  private createOptionElement(opt: SelectOption): HTMLDivElement {
    const item = document.createElement('div')
    item.className = 'mk-select__option'
    item.textContent = opt.label
    item.setAttribute('role', 'option')
    item.setAttribute('aria-selected', String(opt.value === this._value))
    item.style.height = `${this.itemHeight}px`
    if (opt.disabled) {
      item.setAttribute('aria-disabled', 'true')
      item.classList.add('is-disabled')
    }
    if (!opt.disabled && !this.options.disabled) {
      item.addEventListener('click', () => {
        this.setValue(opt.value)
        this.close()
      })
    }
    return item
  }

  private getSelectedLabel(): string {
    const selected = this.options.options.find((o) => o.value === this._value)
    return selected?.label || ''
  }

  private updateLabel(labelEl: HTMLSpanElement): void {
    const selected = this.options.options.find((o) => o.value === this._value)
    if (selected) {
      labelEl.textContent = selected.label
      labelEl.classList.remove('mk-select__placeholder')
    } else {
      labelEl.textContent = this.options.placeholder || '请选择'
      labelEl.classList.add('mk-select__placeholder')
    }
  }

  get value(): string | number | undefined {
    return this._value
  }

  setValue(v: string | number): void {
    this._value = v
    if (this._labelEl) this.updateLabel(this._labelEl)
    this.renderOptionItems()
    this.options.onChange?.(v)
  }

  setDisabled(v: boolean): void {
    this.options.disabled = v
    this.trigger.classList.toggle('is-disabled', v)
    this.trigger.setAttribute('tabindex', v ? '-1' : '0')
    if (this._searchInput) this._searchInput.disabled = v
    if (v) {
      this.close()
    }
    this.renderOptionItems()
  }

  setOptions(opts: SelectOption[]): void {
    this._allOptions = [...opts]
    this.options.options = opts
    this._isVirtual = this.shouldVirtualize()
    this.rebuildVirtual()
    this.renderOptionItems()
  }

  private toggle(): void {
    this.isOpen ? this.close() : this.open()
  }

  open(): void {
    if (this.options.disabled) return
    this.isOpen = true
    this.trigger.setAttribute('aria-expanded', 'true')
    this.trigger.classList.add('is-open')
    this.dropdown.classList.add('is-open')
    if (this._isVirtual) {
      this.scrollToSelected()
    }
  }

  private scrollToSelected(): void {
    if (!this._isVirtual || !this._value) return
    const index = this.options.options.findIndex((o) => o.value === this._value)
    if (index >= 0) {
      const scrollPos = index * this.itemHeight
      const containerHeight = this.dropdown.clientHeight || 240
      this.dropdown.scrollTop = Math.max(0, scrollPos - containerHeight / 2 + this.itemHeight / 2)
      this.renderVirtualWindow()
    }
  }

  close(): void {
    this.isOpen = false
    this.trigger.setAttribute('aria-expanded', 'false')
    this.trigger.classList.remove('is-open')
    this.dropdown.classList.remove('is-open')
    this.hideSearchInput()
    // Reset filterable options
    if ((this.options.filterable || this.options.remote) && this._allOptions.length) {
      this.options.options = [...this._allOptions]
      this._isVirtual = this.shouldVirtualize()
      this.rebuildVirtual()
      this.renderOptionItems()
    }
  }

  private moveSelection(dir: number): void {
    if (this.options.disabled) return
    if (!this.isOpen) {
      this.open()
    }
    const currentIndex = this.options.options.findIndex((o) => o.value === this._value)
    let next = currentIndex
    for (let i = 0; i < this.options.options.length; i++) {
      next = (next + dir + this.options.options.length) % this.options.options.length
      if (!this.options.options[next].disabled) {
        this.setValue(this.options.options[next].value)
        if (this._isVirtual) {
          this.scrollToIndex(next)
        }
        return
      }
    }
  }

  private scrollToIndex(index: number): void {
    if (!this._isVirtual) return
    const scrollTop = this.dropdown.scrollTop
    const containerHeight = this.dropdown.clientHeight || 240
    const itemTop = index * this.itemHeight
    const itemBottom = itemTop + this.itemHeight

    if (itemTop < scrollTop) {
      this.dropdown.scrollTop = itemTop
    } else if (itemBottom > scrollTop + containerHeight) {
      this.dropdown.scrollTop = itemBottom - containerHeight
    }
    this.renderVirtualWindow()
  }

  destroy(): void {
    this._cleanupKey?.()
    if (this._outsideClickHandler) {
      document.removeEventListener('click', this._outsideClickHandler)
    }
    if (this._scrollHandler) {
      this.dropdown.removeEventListener('scroll', this._scrollHandler)
    }
    this.el.remove()
  }
}

export function createSelect(
  container: HTMLElement | string,
  options: SelectOptions
): MkSelect {
  return new MkSelect(container, options)
}
