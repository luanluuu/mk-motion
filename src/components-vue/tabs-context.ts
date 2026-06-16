import type { InjectionKey, Ref } from 'vue'

export interface TabPaneInfo {
  key: string | number
  label: string
  disabled?: boolean
}

export interface TabsContext {
  activeKey: Ref<string | number>
  registerPane: (pane: TabPaneInfo) => void
  unregisterPane: (key: string | number) => void
}

export const tabsContextKey: InjectionKey<TabsContext> = Symbol('tabsContext')
