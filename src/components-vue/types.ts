export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps {
  modelValue?: boolean
  title?: string
  placement?: DrawerPlacement
  size?: string | number
}

export interface MenuItem {
  index: string
  label: string
  icon?: string
  disabled?: boolean
  children?: MenuItem[]
}

export type MenuMode = 'vertical' | 'horizontal'

export interface MenuProps {
  items: MenuItem[]
  mode?: MenuMode
  defaultActive?: string
  collapse?: boolean
  defaultOpeneds?: string[]
}

export interface TabItem {
  key?: string | number
  label: string
  content?: string
  disabled?: boolean
}

export type TabsType = 'default' | 'card'

export interface TabsProps {
  modelValue?: string | number
  items?: TabItem[]
  type?: TabsType
}

export interface TabsEmits {
  'update:modelValue': [value: string | number]
  tabClick: [value: string | number, item: TabItem]
}

export interface TabsSlots {
  default?: () => unknown
  tabBarExtraContent?: () => unknown
  [key: `panel-${string | number}`]: () => unknown
}

export type PopoverTrigger = 'click' | 'hover'

export interface PopoverProps {
  content?: string
  title?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: PopoverTrigger
  width?: string | number
  disabled?: boolean
}

export interface DropdownItem {
  label: string
  value: string
  disabled?: boolean
  divided?: boolean
}

export type DropdownTrigger = 'click' | 'hover'

export interface DropdownProps {
  items: DropdownItem[]
  trigger?: DropdownTrigger
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
}

export interface TooltipProps {
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  href?: string
  target?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string
}

export type StepStatus = 'wait' | 'process' | 'finish' | 'error'
export type StepsDirection = 'horizontal' | 'vertical'
export type StepsSize = 'small' | 'default'

export interface StepItem {
  title: string
  description?: string
  icon?: string
  status?: StepStatus
}

export interface StepsProps {
  items: StepItem[]
  direction?: StepsDirection
  current?: number
  size?: StepsSize
}

export interface LoadingProps {
  loading?: boolean
  text?: string
  fullscreen?: boolean
}

export type MessageType = 'success' | 'warning' | 'error' | 'info'

export interface MessageProps {
  type?: MessageType
  message?: string
  duration?: number
  showClose?: boolean
}

export interface CollapseItem {
  key?: string | number
  title: string
  content?: string
  disabled?: boolean
}

export interface CollapseItemProps {
  name: string | number
  title?: string
  disabled?: boolean
}

export interface CollapseProps {
  modelValue?: (string | number)[]
  accordion?: boolean
  items?: CollapseItem[]
}

export interface CollapseEmits {
  'update:modelValue': [value: (string | number)[]]
  change: [value: (string | number)[]]
}

/* ===== Data/Form Components Types ===== */

export interface TableColumn {
  key: string
  title: string
  width?: string
  sortable?: boolean
  editable?: boolean
  render?: (value: unknown, row: Record<string, unknown>, index: number) => unknown
}

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  disabled?: boolean
  isLeaf?: boolean
  expanded?: boolean
  checked?: boolean
}

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface SelectProps {
  modelValue?: string | number | (string | number)[]
  options?: SelectOption[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  size?: 'small' | 'default' | 'large'
  teleport?: string | HTMLElement | false
}

export interface SelectEmits {
  'update:modelValue': [value: string | number | (string | number)[]]
  change: [value: string | number | (string | number)[]]
  focus: []
  blur: []
}

export interface SelectSlots {
  default?: (props: { option: SelectOption; selected: boolean }) => unknown
  empty?: () => unknown
  prefix?: () => unknown
}

export interface InputProps {
  modelValue?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  clearable?: boolean
  showPassword?: boolean
  rows?: number
  autosize?: { minRows?: number; maxRows?: number }
}

export interface InputEmits {
  'update:modelValue': [value: string]
  input: [value: string]
  change: [value: string]
  focus: [evt: FocusEvent]
  blur: [evt: FocusEvent]
}

export interface InputSlots {
  prefix?: () => unknown
  suffix?: () => unknown
}

export interface DialogProps {
  modelValue?: boolean
  title?: string
  width?: string | number
  showClose?: boolean
  beforeClose?: (done: () => void) => void
}

export interface DialogEmits {
  'update:modelValue': [value: boolean]
  open: []
  close: []
  confirm: []
}

export interface DialogSlots {
  default?: () => unknown
  title?: () => unknown
  footer?: () => unknown
}

export interface UploadFile {
  uid?: string | number
  name: string
  url?: string
  size?: number
  status?: 'ready' | 'uploading' | 'success' | 'error'
  progress?: number
  raw?: File
  response?: unknown
}

export type { FormRule } from './formInjection.js'
