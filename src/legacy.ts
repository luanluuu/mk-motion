/* ===== Legacy Imperative API (compatibility layer) =====
 *
 * These APIs are deprecated and moved out of the main entry in v2.0.
 * Import them from '@luanlu/mk-motion/legacy'.
 * They will be removed in a future major version.
 */

export { createButton } from './components/button/button.ts'
export { createInput } from './components/input/input.ts'
export { createCard } from './components/card/card.ts'
export { createDialog } from './components/dialog/dialog.ts'
export { createDrawer } from './components/drawer/drawer.ts'
export {
  message,
  messageSuccess,
  messageError,
  messageWarning,
} from './components/message/message.ts'
export { createSwitch } from './components/switch/switch.ts'
export { createSelect } from './components/form/select.ts'
export {
  createCheckbox,
  MkCheckboxGroup as LegacyCheckboxGroup,
} from './components/form/checkbox.ts'
export {
  MkRadio as LegacyRadio,
  MkRadioGroup as LegacyRadioGroup,
} from './components/form/radio.ts'
export { createTag } from './components/tag/tag.ts'
export { createTabs } from './components/tabs/tabs.ts'
export { createTooltip } from './components/tooltip/tooltip.ts'
export { createAvatar } from './components/avatar/avatar.ts'
export { createAlert } from './components/alert/alert.ts'
export { createProgress } from './components/progress/progress.ts'
export { createCollapse } from './components/collapse/collapse.ts'
export { createEmpty } from './components/empty/empty.ts'
export { createPopover } from './components/popover/popover.ts'
export { createMenu } from './components/menu/menu.ts'
export { createBreadcrumb } from './components/breadcrumb/breadcrumb.ts'
export { createSteps } from './components/steps/steps.ts'
export { createRow } from './components/layout/row.ts'
export { createSpace } from './components/layout/space.ts'
export { createDivider } from './components/layout/divider.ts'
export { createContainer } from './components/layout/container.ts'
export { createLayout } from './components/layout/layout.ts'
export { createHeader } from './components/layout/header.ts'
export { createAside } from './components/layout/aside.ts'
export { createMain } from './components/layout/main.ts'
export { createFooter } from './components/layout/footer.ts'
