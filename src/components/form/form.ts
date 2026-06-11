import './form.css'
import { MkInput } from '../input/input.ts'
import { MkSelect } from './select.ts'
import { MkCheckbox } from './checkbox.ts'
import { MkRadioGroup } from './radio.ts'
import type { InputOptions } from '../input/input.ts'
import type { SelectOptions } from './select.ts'
import type { CheckboxOptions } from './checkbox.ts'
import type { RadioOptions } from './radio.ts'

export interface FormField {
  key: string
  label: string
  type: 'input' | 'select' | 'checkbox' | 'radio' | 'textarea'
  options?: any
  rules?: { required?: boolean; min?: number; max?: number; pattern?: RegExp; message?: string }[]
}

export interface FormOptions {
  fields: FormField[]
  layout?: 'vertical' | 'horizontal' | 'inline'
  labelWidth?: string
  onSubmit?: (values: Record<string, any>) => void
  onValidate?: (errors: Record<string, string>) => void
}

export class MkForm {
  el: HTMLFormElement
  private options: FormOptions
  private instances: Map<string, any> = new Map()
  private values: Record<string, any> = {}
  private errors: Record<string, string> = {}
  private errorEls: Map<string, HTMLSpanElement> = new Map()

  constructor(container: HTMLElement | string, options: FormOptions) {
    const parent =
      typeof container === 'string'
        ? document.querySelector(container)!
        : container

    this.options = {
      layout: 'vertical',
      ...options,
    }

    this.el = document.createElement('form')
    this.el.className = 'mk-form'
    if (this.options.layout !== 'vertical') {
      this.el.classList.add(`mk-form--${this.options.layout}`)
    }
    this.el.noValidate = true

    this.options.fields.forEach((field) => {
      this.values[field.key] = field.options?.value ?? field.options?.checked ?? ''
      this.renderField(field)
    })

    const actions = document.createElement('div')
    actions.className = 'mk-form__actions'

    const submitBtn = document.createElement('button')
    submitBtn.type = 'submit'
    submitBtn.className = 'mk-form__submit'
    submitBtn.textContent = '提交'
    actions.appendChild(submitBtn)

    this.el.appendChild(actions)

    this.el.addEventListener('submit', (e) => {
      e.preventDefault()
      this.validateAll()
      if (Object.keys(this.errors).length === 0) {
        this.options.onSubmit?.({ ...this.values })
      } else {
        this.options.onValidate?.({ ...this.errors })
      }
    })

    parent.appendChild(this.el)
  }

  private renderField(field: FormField): void {
    const item = document.createElement('div')
    item.className = 'mk-form__item'

    const label = document.createElement('label')
    label.className = 'mk-form__label'
    label.textContent = field.label
    if (this.options.labelWidth) {
      label.style.width = this.options.labelWidth
      label.style.flexShrink = '0'
    }

    const content = document.createElement('div')
    content.className = 'mk-form__content'

    let instance: any = null

    if (field.type === 'input') {
      const inputOpts: InputOptions = {
        ...field.options,
        value: this.values[field.key],
        onInput: (v: string) => {
          this.values[field.key] = v
          this.clearError(field.key)
        },
      }
      const wrapper = document.createElement('div')
      instance = new MkInput(wrapper, inputOpts)
      content.appendChild(wrapper)
    } else if (field.type === 'textarea') {
      const wrapper = document.createElement('div')
      const textarea = document.createElement('textarea')
      textarea.className = 'mk-form__textarea'
      textarea.value = this.values[field.key] || ''
      textarea.placeholder = field.options?.placeholder || ''
      textarea.rows = field.options?.rows || 3
      textarea.addEventListener('input', () => {
        this.values[field.key] = textarea.value
        this.clearError(field.key)
      })
      textarea.addEventListener('blur', () => {
        this.validateField(field)
      })
      wrapper.appendChild(textarea)
      content.appendChild(wrapper)
      instance = { el: wrapper, get value() { return textarea.value }, set value(v: string) { textarea.value = v } }
    } else if (field.type === 'select') {
      const selectOpts: SelectOptions = {
        ...field.options,
        options: field.options?.options || [],
        value: this.values[field.key],
        onChange: (v: string | number) => {
          this.values[field.key] = v
          this.clearError(field.key)
        },
      }
      const wrapper = document.createElement('div')
      instance = new MkSelect(wrapper, selectOpts)
      content.appendChild(wrapper)
    } else if (field.type === 'checkbox') {
      const wrapper = document.createElement('div')
      const cbOpts: CheckboxOptions = {
        ...field.options,
        checked: !!this.values[field.key],
        onChange: (v: boolean) => {
          this.values[field.key] = v
          this.clearError(field.key)
        },
      }
      instance = new MkCheckbox(wrapper, cbOpts)
      content.appendChild(wrapper)
    } else if (field.type === 'radio') {
      const wrapper = document.createElement('div')
      const group = new MkRadioGroup(wrapper, {
        value: this.values[field.key],
        onChange: (v: string | number) => {
          this.values[field.key] = v
          this.clearError(field.key)
        },
      })
      const radioOpts: RadioOptions[] = field.options?.options || []
      radioOpts.forEach((opt) => group.add(opt))
      instance = group
      content.appendChild(wrapper)
    }

    if (instance) {
      this.instances.set(field.key, instance)
    }

    const errorEl = document.createElement('span')
    errorEl.className = 'mk-form__error'
    this.errorEls.set(field.key, errorEl)
    content.appendChild(errorEl)

    item.appendChild(label)
    item.appendChild(content)
    this.el.insertBefore(item, this.el.querySelector('.mk-form__actions'))
  }

  private validateField(field: FormField): boolean {
    if (!field.rules || field.rules.length === 0) return true
    const value = this.values[field.key]
    for (const rule of field.rules) {
      if (rule.required && (value === undefined || value === '' || value === false || value === null)) {
        this.showError(field.key, rule.message || `${field.label}不能为空`)
        return false
      }
      if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
        this.showError(field.key, rule.message || `${field.label}长度不能小于${rule.min}`)
        return false
      }
      if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
        this.showError(field.key, rule.message || `${field.label}长度不能大于${rule.max}`)
        return false
      }
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        this.showError(field.key, rule.message || `${field.label}格式不正确`)
        return false
      }
    }
    this.clearError(field.key)
    return true
  }

  private validateAll(): void {
    this.errors = {}
    this.options.fields.forEach((field) => {
      if (!this.validateField(field)) {
        this.errors[field.key] = this.errorEls.get(field.key)?.textContent || ''
      }
    })
  }

  private showError(key: string, message: string): void {
    const el = this.errorEls.get(key)
    if (el) {
      el.textContent = message
      el.classList.add('is-visible')
    }
    const item = this.instances.get(key)?.el?.closest('.mk-form__item') as HTMLElement
    if (item) item.classList.add('is-error')
  }

  private clearError(key: string): void {
    const el = this.errorEls.get(key)
    if (el) {
      el.textContent = ''
      el.classList.remove('is-visible')
    }
    const item = this.instances.get(key)?.el?.closest?.('.mk-form__item') as HTMLElement
    if (item) item.classList.remove('is-error')
  }

  getValues(): Record<string, any> {
    return { ...this.values }
  }

  setValues(values: Record<string, any>): void {
    Object.keys(values).forEach((key) => {
      this.values[key] = values[key]
      const instance = this.instances.get(key)
      if (instance) {
        if (instance.input) instance.input.value = values[key]
        else if (instance.value !== undefined) instance.value = values[key]
        else if (instance.setValue) instance.setValue(values[key])
        else if (instance.checked !== undefined) instance.checked = !!values[key]
      }
    })
  }

  reset(): void {
    this.values = {}
    this.errors = {}
    this.options.fields.forEach((field) => {
      this.values[field.key] = field.options?.value ?? field.options?.checked ?? ''
      this.clearError(field.key)
      const instance = this.instances.get(field.key)
      if (instance) {
        if (instance.input) instance.input.value = this.values[field.key]
        else if (instance.value !== undefined) instance.value = this.values[field.key]
        else if (instance.setValue) instance.setValue(this.values[field.key])
        else if (instance.checked !== undefined) instance.checked = !!this.values[field.key]
      }
    })
  }

  validate(): boolean {
    this.validateAll()
    return Object.keys(this.errors).length === 0
  }

  destroy(): void {
    this.instances.forEach((inst) => {
      if (inst.destroy) inst.destroy()
    })
    this.instances.clear()
    this.el.remove()
  }
}

export function createForm(
  container: HTMLElement | string,
  options: FormOptions
): MkForm {
  return new MkForm(container, options)
}
