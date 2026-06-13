import type { InjectionKey } from 'vue'

export interface FormRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
  validator?: (value: unknown) => boolean | string
}

export interface FormContext {
  model: Record<string, unknown>
  rules?: Record<string, FormRule[]>
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  layout?: 'vertical' | 'horizontal' | 'inline'
  registerField: (prop: string, validate: () => string | undefined) => void
  unregisterField: (prop: string) => void
  updateFieldValue: (prop: string, value: unknown) => void
}

export const formContextKey: InjectionKey<FormContext> = Symbol('MkFormContext')

export function validateValue(
  value: unknown,
  rules: FormRule[],
  label = ''
): string | undefined {
  for (const rule of rules) {
    if (
      rule.required &&
      (value === undefined || value === '' || value === false || value === null)
    ) {
      return rule.message || `${label || '该项'}不能为空`
    }
    if (
      rule.min !== undefined &&
      typeof value === 'string' &&
      value.length < rule.min
    ) {
      return rule.message || `${label || '该项'}长度不能小于${rule.min}`
    }
    if (
      rule.max !== undefined &&
      typeof value === 'string' &&
      value.length > rule.max
    ) {
      return rule.message || `${label || '该项'}长度不能大于${rule.max}`
    }
    if (
      rule.pattern &&
      typeof value === 'string' &&
      !rule.pattern.test(value)
    ) {
      return rule.message || `${label || '该项'}格式不正确`
    }
    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== true)
        return typeof result === 'string'
          ? result
          : rule.message || `${label || '该项'}校验失败`
    }
  }
  return undefined
}
