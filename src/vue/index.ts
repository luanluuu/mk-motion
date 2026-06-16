import type { App, Component, Plugin } from 'vue'
import * as components from '../components-vue/index.js'
import '../style.css'

// Vue 3 SFC Components (re-exported from the new declarative layer)
export {
  MkButton,
  MkInput,
  MkSwitch,
  MkRadio,
  MkRadioGroup,
  MkCheckbox,
  MkCheckboxGroup,
  MkSlider,
  MkCard,
  MkTag,
  MkAlert,
  MkProgress,
  MkEmpty,
  MkAvatar,
  MkDivider,
  MkSpace,
  MkRow,
  MkCol,
  MkContainer,
  MkLayout,
  MkHeader,
  MkAside,
  MkMain,
  MkFooter,
  MkDialog,
  MkDrawer,
  MkMenu,
  MkMenuItem,
  MkTabs,
  MkTabPane,
  MkPopover,
  MkDropdown,
  MkTooltip,
  MkBreadcrumb,
  MkSteps,
  MkLoading,
  MkMessage,
  MkCollapse,
  MkSelect,
  MkOption,
  MkTable,
  MkPagination,
  MkTree,
  MkDatePicker,
  MkTimePicker,
  MkUpload,
  MkForm,
  MkFormItem,
} from '../components-vue/index.js'

// Composables
export {
  useMkTheme,
  useMkMotion,
  useMkLoading,
  useMkMessage,
} from './composables/index.js'
export type {
  MkTheme,
  UseMkThemeOptions,
  UseMkMotionOptions,
  UseMkLoadingOptions,
  UseMkMessageOptions,
} from './composables/index.js'

// Shared component prop types
export type * from '../components-vue/types.js'

const componentEntries = Object.entries(components).filter(([name]) =>
  name.startsWith('Mk')
)

function checkMkCssVars() {
  if (typeof window === 'undefined') return
  const mode = (import.meta as { env?: { MODE?: string } }).env?.MODE
  if (mode === 'production') return
  if (typeof document === 'undefined') return

  const required = [
    '--mk-primary',
    '--mk-text',
    '--mk-border',
    '--mk-surface',
  ]
  const style = getComputedStyle(document.documentElement)
  const missing = required.filter((v) => !style.getPropertyValue(v).trim())
  if (missing.length) {
    console.warn(
      `[mk-motion] Missing CSS variables detected: ${missing.join(', ')}. ` +
        `Did you forget to import '@luanlu/mk-motion/css'?`
    )
  }
}

export const MkMotionVue: Plugin = {
  install(app: App) {
    for (const [name, component] of componentEntries) {
      app.component(name, component as Component)
    }
    checkMkCssVars()
  },
}

export default MkMotionVue
