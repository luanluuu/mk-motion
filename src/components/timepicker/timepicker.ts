import './timepicker.css'

export interface TimePickerOptions {
  value?: string
  placeholder?: string
  format?: string
  disabled?: boolean
  onChange?: (value: string) => void
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function parseTime(value: string): { h: number; m: number; s: number } {
  const parts = value.split(':').map((v) => parseInt(v, 10))
  return {
    h: Math.max(0, Math.min(23, parts[0] || 0)),
    m: Math.max(0, Math.min(59, parts[1] || 0)),
    s: Math.max(0, Math.min(59, parts[2] || 0)),
  }
}

function formatTime(h: number, m: number, s: number, fmt: string): string {
  return fmt
    .replace('HH', pad(h))
    .replace('mm', pad(m))
    .replace('ss', pad(s))
}

export class MkTimePicker {
  el: HTMLDivElement
  private options: TimePickerOptions
  private input: HTMLInputElement
  private panel: HTMLDivElement
  private isOpen = false
  private _value: string
  private _outsideClickHandler?: (e: MouseEvent) => void

  constructor(container: HTMLElement | string, options: TimePickerOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      format: 'HH:mm:ss',
      ...options,
    }
    this._value = this.options.value || ''

    this.el = document.createElement('div')
    this.el.className = 'mk-timepicker'

    this.input = document.createElement('input')
    this.input.className = 'mk-timepicker__input'
    this.input.type = 'text'
    this.input.placeholder = this.options.placeholder || ''
    this.input.value = this._value
    this.input.readOnly = true
    if (this.options.disabled) {
      this.input.disabled = true
      this.el.classList.add('is-disabled')
    }

    this.input.addEventListener('click', () => {
      if (!this.options.disabled) this.open()
    })

    this.panel = document.createElement('div')
    this.panel.className = 'mk-timepicker__panel'

    const { h, m, s } = this._value ? parseTime(this._value) : { h: 0, m: 0, s: 0 }

    const hoursCol = this.createColumn('时', 0, 23, h, (val) => this.onSelect('h', val))
    const minutesCol = this.createColumn('分', 0, 59, m, (val) => this.onSelect('m', val))
    const secondsCol = this.createColumn('秒', 0, 59, s, (val) => this.onSelect('s', val))

    this.panel.appendChild(hoursCol)
    this.panel.appendChild(minutesCol)
    this.panel.appendChild(secondsCol)

    this.el.appendChild(this.input)
    this.el.appendChild(this.panel)
    parent.appendChild(this.el)

    this._outsideClickHandler = (e: MouseEvent) => {
      if (!this.el.contains(e.target as Node)) this.close()
    }
    document.addEventListener('click', this._outsideClickHandler)
  }

  private createColumn(
    label: string,
    min: number,
    max: number,
    selected: number,
    onSelect: (val: number) => void
  ): HTMLDivElement {
    const col = document.createElement('div')
    col.className = 'mk-timepicker__column'

    const header = document.createElement('div')
    header.className = 'mk-timepicker__column-header'
    header.textContent = label
    col.appendChild(header)

    const list = document.createElement('div')
    list.className = 'mk-timepicker__column-list'

    for (let i = min; i <= max; i++) {
      const item = document.createElement('div')
      item.className = 'mk-timepicker__item'
      item.textContent = pad(i)
      if (i === selected) item.classList.add('is-selected')
      item.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelect(i)
      })
      list.appendChild(item)
    }

    col.appendChild(list)

    // Scroll selected into view
    requestAnimationFrame(() => {
      const selectedEl = list.querySelector('.is-selected') as HTMLElement
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center' })
      }
    })

    return col
  }

  private onSelect(type: 'h' | 'm' | 's', val: number): void {
    const current = this._value ? parseTime(this._value) : { h: 0, m: 0, s: 0 }
    if (type === 'h') current.h = val
    if (type === 'm') current.m = val
    if (type === 's') current.s = val
    this._value = formatTime(current.h, current.m, current.s, this.options.format!)
    this.input.value = this._value
    this.updateSelection()
    this.options.onChange?.(this._value)
  }

  private updateSelection(): void {
    const { h, m, s } = this._value ? parseTime(this._value) : { h: 0, m: 0, s: 0 }
    const cols = this.panel.querySelectorAll('.mk-timepicker__column')
    const values = [h, m, s]
    cols.forEach((col, idx) => {
      const items = col.querySelectorAll('.mk-timepicker__item')
      items.forEach((item) => item.classList.remove('is-selected'))
      const selected = Array.from(items).find((item) => parseInt(item.textContent || '', 10) === values[idx])
      if (selected) {
        selected.classList.add('is-selected')
        selected.scrollIntoView({ block: 'center' })
      }
    })
  }

  get value(): string {
    return this._value
  }

  set value(v: string) {
    this._value = v
    this.input.value = v
    this.updateSelection()
  }

  open(): void {
    if (this.isOpen) return
    this.isOpen = true
    this.panel.classList.add('is-open')
    this.updateSelection()
  }

  close(): void {
    this.isOpen = false
    this.panel.classList.remove('is-open')
  }

  setDisabled(disabled: boolean): void {
    this.options.disabled = disabled
    this.input.disabled = disabled
    this.el.classList.toggle('is-disabled', disabled)
    if (disabled) this.close()
  }

  destroy(): void {
    if (this._outsideClickHandler) {
      document.removeEventListener('click', this._outsideClickHandler)
    }
    this.el.remove()
  }
}

export function createTimePicker(
  container: HTMLElement | string,
  options?: TimePickerOptions
): MkTimePicker {
  return new MkTimePicker(container, options)
}
