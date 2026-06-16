import type { InjectionKey, Ref } from 'vue'

export interface CollapseItemInfo {
  name: string | number
  title?: string
  disabled?: boolean
}

export interface CollapseContext {
  activeNames: Ref<(string | number)[]>
  accordion: Ref<boolean>
  registerItem: (item: CollapseItemInfo) => void
  unregisterItem: (name: string | number) => void
  toggle: (name: string | number, disabled?: boolean) => void
  isActive: (name: string | number) => boolean
}

export const collapseContextKey: InjectionKey<CollapseContext> =
  Symbol('collapseContext')
