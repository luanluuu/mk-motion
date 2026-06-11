import './datepicker.css'

export interface DatePickerOptions {
  value?: Date | string
  placeholder?: string
  format?: string
  disabled?: boolean
  onChange?: (value: string) => void
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function formatDate(date: Date, fmt: string): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return fmt
    .replace('YYYY', String(year))
    .replace('MM', pad(month))
    .replace('DD', pad(day))
}

function parseDate(str: string, fmt: string): Date | null {
  const yIndex = fmt.indexOf('YYYY')
  const mIndex = fmt.indexOf('MM')
  const dIndex = fmt.indexOf('DD')
  if (yIndex === -1 || mIndex === -1 || dIndex === -1) return null
  const year = parseInt(str.slice(yIndex, yIndex + 4), 10)
  const month = parseInt(str.slice(mIndex, mIndex + 2), 10)
  const day = parseInt(str.slice(dIndex, dIndex + 2), 10)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return d
}

function getMonthData(year: number, month: number): { date: Date; isCurrentMonth: boolean }[] {
  const firstDay = new Date(year, month, 1)
  const start = new Date(year, month, 1 - firstDay.getDay())
  const days: { date: Date; isCurrentMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({ date: d, isCurrentMonth: d.getMonth() === month })
  }
  return days
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export class MkDatePicker {
  el: HTMLDivElement
  private options: DatePickerOptions
  private input: HTMLInputElement
  private calendar: HTMLDivElement
  private header: HTMLDivElement
  private daysContainer: HTMLDivElement
  private isOpen = false
  private currentMonth: Date
  private _value: Date | null
  private _outsideClickHandler?: (e: MouseEvent) => void

  constructor(container: HTMLElement | string, options: DatePickerOptions = {}) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      format: 'YYYY-MM-DD',
      ...options,
    }

    const fmt = this.options.format!
    if (this.options.value) {
      this._value = this.options.value instanceof Date ? this.options.value : parseDate(this.options.value, fmt)
    } else {
      this._value = null
    }
    this.currentMonth = this._value ? new Date(this._value.getFullYear(), this._value.getMonth(), 1) : new Date()

    this.el = document.createElement('div')
    this.el.className = 'mk-datepicker'

    this.input = document.createElement('input')
    this.input.className = 'mk-datepicker__input'
    this.input.type = 'text'
    this.input.placeholder = this.options.placeholder || ''
    this.input.value = this._value ? formatDate(this._value, fmt) : ''
    this.input.readOnly = true
    if (this.options.disabled) {
      this.input.disabled = true
      this.el.classList.add('is-disabled')
    }

    this.input.addEventListener('click', () => {
      if (!this.options.disabled) this.open()
    })

    this.calendar = document.createElement('div')
    this.calendar.className = 'mk-datepicker__calendar'

    this.header = document.createElement('div')
    this.header.className = 'mk-datepicker__header'

    const prevBtn = document.createElement('button')
    prevBtn.type = 'button'
    prevBtn.className = 'mk-datepicker__nav'
    prevBtn.textContent = '‹'
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.changeMonth(-1)
    })

    const nextBtn = document.createElement('button')
    nextBtn.type = 'button'
    nextBtn.className = 'mk-datepicker__nav'
    nextBtn.textContent = '›'
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.changeMonth(1)
    })

    const title = document.createElement('span')
    title.className = 'mk-datepicker__title'
    this.header.appendChild(prevBtn)
    this.header.appendChild(title)
    this.header.appendChild(nextBtn)

    const weekRow = document.createElement('div')
    weekRow.className = 'mk-datepicker__weekdays'
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    weekDays.forEach((w) => {
      const cell = document.createElement('span')
      cell.textContent = w
      weekRow.appendChild(cell)
    })

    this.daysContainer = document.createElement('div')
    this.daysContainer.className = 'mk-datepicker__days'

    this.calendar.appendChild(this.header)
    this.calendar.appendChild(weekRow)
    this.calendar.appendChild(this.daysContainer)

    this.el.appendChild(this.input)
    this.el.appendChild(this.calendar)
    parent.appendChild(this.el)

    this.renderCalendar()

    this._outsideClickHandler = (e: MouseEvent) => {
      if (!this.el.contains(e.target as Node)) this.close()
    }
    document.addEventListener('click', this._outsideClickHandler)
  }

  private changeMonth(delta: number): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + delta)
    this.renderCalendar()
  }

  private renderCalendar(): void {
    const title = this.header.querySelector('.mk-datepicker__title') as HTMLSpanElement
    title.textContent = `${this.currentMonth.getFullYear()}年 ${this.currentMonth.getMonth() + 1}月`

    this.daysContainer.innerHTML = ''
    const days = getMonthData(this.currentMonth.getFullYear(), this.currentMonth.getMonth())
    const today = new Date()

    days.forEach(({ date, isCurrentMonth }) => {
      const dayEl = document.createElement('span')
      dayEl.className = 'mk-datepicker__day'
      dayEl.textContent = String(date.getDate())

      if (!isCurrentMonth) dayEl.classList.add('is-other-month')
      if (isSameDay(date, today)) dayEl.classList.add('is-today')
      if (this._value && isSameDay(date, this._value)) dayEl.classList.add('is-selected')

      dayEl.addEventListener('click', (e) => {
        e.stopPropagation()
        this.selectDate(date)
      })

      this.daysContainer.appendChild(dayEl)
    })
  }

  private selectDate(date: Date): void {
    this._value = date
    this.input.value = formatDate(date, this.options.format!)
    this.renderCalendar()
    this.close()
    this.options.onChange?.(this.input.value)
  }

  get value(): string {
    return this.input.value
  }

  set value(v: string) {
    this.input.value = v
    this._value = v ? parseDate(v, this.options.format!) : null
    if (this._value) {
      this.currentMonth = new Date(this._value.getFullYear(), this._value.getMonth(), 1)
    }
    this.renderCalendar()
  }

  open(): void {
    if (this.isOpen) return
    this.isOpen = true
    this.calendar.classList.add('is-open')
    if (this._value) {
      this.currentMonth = new Date(this._value.getFullYear(), this._value.getMonth(), 1)
      this.renderCalendar()
    }
  }

  close(): void {
    this.isOpen = false
    this.calendar.classList.remove('is-open')
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

export function createDatePicker(
  container: HTMLElement | string,
  options?: DatePickerOptions
): MkDatePicker {
  return new MkDatePicker(container, options)
}
