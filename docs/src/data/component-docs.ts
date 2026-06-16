import {
  createButton,
  createInput,
  createCard,
  createDialog,
  createDrawer,
  message,
  messageSuccess,
  createSwitch,
  createTag,
  createTabs,
  createTooltip,
  createAvatar,
  createAlert,
  createProgress,
  createCollapse,
  createEmpty,
  createPopover,
  createMenu,
  createBreadcrumb,
  createSteps,
  createRow,
  createSpace,
  createDivider,
  createContainer,
  createLayout,
  createHeader,
  createAside,
  createMain,
  createFooter,
} from '@luanlu/mk-motion/legacy'
import {
  MkSelect,
  MkCheckbox,
  MkRadio,
  MkRadioGroup,
  MkSlider,
  MkTable,
} from '@luanlu/mk-motion/vue'

export interface ComponentDoc {
  title: string
  desc: string
  demos: { title: string; code: string; init: (el: HTMLElement) => void }[]
  api: { prop: string; type: string; default: string; desc: string }[]
}

export const componentDocs: Record<string, ComponentDoc> = {
  button: {
    title: 'Button 按钮',
    desc: '按钮用于触发一个操作或事件，是界面中最基础的交互元素。',
    demos: [
      {
        title: '类型',
        code: `createButton(container, { type: 'primary', text: 'Primary' })`,
        init: (el: HTMLElement) => {
          createButton(el, { type: 'default', text: 'Default' })
          createButton(el, { type: 'primary', text: 'Primary' })
          createButton(el, { type: 'success', text: 'Success' })
          createButton(el, { type: 'warning', text: 'Warning' })
          createButton(el, { type: 'danger', text: 'Danger' })
        },
      },
      {
        title: '尺寸',
        code: `createButton(container, { size: 'large', text: 'Large', type: 'primary' })`,
        init: (el: HTMLElement) => {
          createButton(el, { size: 'small', text: 'Small', type: 'primary' })
          createButton(el, { text: 'Default', type: 'primary' })
          createButton(el, { size: 'large', text: 'Large', type: 'primary' })
        },
      },
    ],
    api: [
      {
        prop: 'type',
        type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'text'",
        default: "'default'",
        desc: '按钮类型',
      },
      {
        prop: 'size',
        type: "'small' | 'default' | 'large'",
        default: "'default'",
        desc: '按钮尺寸',
      },
      { prop: 'text', type: 'string', default: "''", desc: '按钮文字' },
      { prop: 'loading', type: 'boolean', default: 'false', desc: '加载状态' },
      { prop: 'disabled', type: 'boolean', default: 'false', desc: '禁用状态' },
      { prop: 'onClick', type: '() => void', default: '-', desc: '点击回调' },
    ],
  },
  input: {
    title: 'Input 输入框',
    desc: '输入框用于接收用户的文本输入。',
    demos: [
      {
        title: '基础用法',
        code: `createInput(container, { placeholder: '请输入内容' })`,
        init: (el: HTMLElement) =>
          createInput(el, { placeholder: '请输入内容' }),
      },
      {
        title: '可清空',
        code: `createInput(container, { placeholder: '可清空', clearable: true })`,
        init: (el: HTMLElement) =>
          createInput(el, {
            placeholder: '可清空',
            clearable: true,
            value: 'Hello',
          }),
      },
    ],
    api: [
      { prop: 'placeholder', type: 'string', default: "''", desc: '占位文本' },
      {
        prop: 'type',
        type: "'text' | 'password'",
        default: "'text'",
        desc: '输入框类型',
      },
      {
        prop: 'clearable',
        type: 'boolean',
        default: 'false',
        desc: '是否可清空',
      },
      {
        prop: 'showPassword',
        type: 'boolean',
        default: 'false',
        desc: '是否显示切换密码图标',
      },
    ],
  },
  card: {
    title: 'Card 卡片',
    desc: '卡片容器，用于组织信息和内容。',
    demos: [
      {
        title: '基础用法',
        code: `createCard(container, { title: '标题', body: '内容' })`,
        init: (el: HTMLElement) => {
          createCard(el, {
            title: '基础卡片',
            body: '这是一个基础卡片组件。',
            footer: '2024-06-07',
          })
          createCard(el, {
            title: '悬停阴影',
            body: '鼠标悬停时会显示更强的阴影效果。',
            shadow: 'hover',
          })
        },
      },
    ],
    api: [
      { prop: 'title', type: 'string', default: "''", desc: '标题' },
      { prop: 'body', type: 'string', default: "''", desc: '内容' },
      { prop: 'footer', type: 'string', default: "''", desc: '页脚' },
      {
        prop: 'shadow',
        type: "'always' | 'hover' | 'never'",
        default: "'always'",
        desc: '阴影显示时机',
      },
    ],
  },
  tag: {
    title: 'Tag 标签',
    desc: '标签用于标记事物的属性和维度。',
    demos: [
      {
        title: '类型',
        code: `createTag(container, { type: 'primary', text: 'Primary' })`,
        init: (el: HTMLElement) => {
          createTag(el, { text: 'Default' })
          createTag(el, { type: 'primary', text: 'Primary' })
          createTag(el, { type: 'success', text: 'Success' })
          createTag(el, { type: 'warning', text: 'Warning' })
          createTag(el, { type: 'danger', text: 'Danger' })
          createTag(el, { type: 'info', text: 'Info' })
        },
      },
    ],
    api: [
      { prop: 'text', type: 'string', default: "''", desc: '标签文字' },
      {
        prop: 'type',
        type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'",
        default: "'default'",
        desc: '类型',
      },
      {
        prop: 'closable',
        type: 'boolean',
        default: 'false',
        desc: '是否可关闭',
      },
    ],
  },
  tabs: {
    title: 'Tabs 标签页',
    desc: '标签页用于在同一区域切换不同内容。',
    demos: [
      {
        title: '线型',
        code: `createTabs(container, { type: 'line', items: [...] })`,
        init: (el: HTMLElement) => {
          createTabs(el, {
            type: 'line',
            items: [
              { label: 'Tab 1', content: '内容一' },
              { label: 'Tab 2', content: '内容二' },
            ],
          })
        },
      },
      {
        title: '卡片',
        code: `createTabs(container, { type: 'card', items: [...] })`,
        init: (el: HTMLElement) => {
          createTabs(el, {
            type: 'card',
            items: [
              { label: 'Tab A', content: '卡片内容 A' },
              { label: 'Tab B', content: '卡片内容 B' },
            ],
          })
        },
      },
    ],
    api: [
      {
        prop: 'type',
        type: "'line' | 'card' | 'pill'",
        default: "'line'",
        desc: '标签页类型',
      },
      { prop: 'items', type: 'TabItem[]', default: '[]', desc: '标签项' },
      { prop: 'activeIndex', type: 'number', default: '0', desc: '当前激活项' },
    ],
  },
  table: {
    title: 'Table 表格',
    desc: '数据表格用于展示大量结构化数据。',
    demos: [
      {
        title: '基础表格',
        code: `new MkTable(container, { columns, data })`,
        init: (el: HTMLElement) => {
          const data = Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            name: 'User ' + (i + 1),
            age: 20 + (i % 10),
            status: i % 3 === 0 ? 'Active' : 'Inactive',
            score: 60 + Math.floor(Math.random() * 40),
          }))
          new MkTable(el, {
            columns: [
              { key: 'id', title: 'ID', width: '60px', sortable: true },
              { key: 'name', title: '姓名', sortable: true },
              { key: 'age', title: '年龄', width: '80px', sortable: true },
              {
                key: 'status',
                title: '状态',
                width: '100px',
                render: (v: string) =>
                  `<span style="color:${v === 'Active' ? 'var(--mk-success)' : 'var(--mk-text-tertiary)'}">● ${v}</span>`,
              },
              { key: 'score', title: '分数', width: '80px', sortable: true },
            ],
            data,
            pageSize: 5,
          })
        },
      },
      {
        title: '虚拟滚动（10000 行）',
        code: `new MkTable(container, { virtual: true, columns, data: Array.from({length:10000}) })`,
        init: (el: HTMLElement) => {
          const data = Array.from({ length: 10000 }, (_, i) => ({
            id: i + 1,
            name: 'User ' + (i + 1),
            age: 20 + (i % 50),
            status: i % 3 === 0 ? 'Active' : 'Inactive',
            score: Math.floor(Math.random() * 100),
          }))
          new MkTable(el, {
            virtual: true,
            virtualHeight: 300,
            itemHeight: 44,
            columns: [
              { key: 'id', title: 'ID', width: '80px', sortable: true },
              { key: 'name', title: '姓名' },
              { key: 'age', title: '年龄', width: '80px', sortable: true },
              {
                key: 'status',
                title: '状态',
                width: '100px',
                render: (v: string) =>
                  `<span style="color:${v === 'Active' ? 'var(--mk-success)' : 'var(--mk-text-tertiary)'}">● ${v}</span>`,
              },
              { key: 'score', title: '分数', width: '80px', sortable: true },
            ],
            data,
          })
        },
      },
    ],
    api: [
      { prop: 'columns', type: 'TableColumn[]', default: '-', desc: '列配置' },
      {
        prop: 'data',
        type: 'Record<string,any>[]',
        default: '[]',
        desc: '表格数据',
      },
      {
        prop: 'pageSize',
        type: 'number',
        default: '10',
        desc: '每页条数（虚拟滚动时无效）',
      },
      {
        prop: 'virtual',
        type: 'boolean',
        default: 'false',
        desc: '是否启用虚拟滚动',
      },
      {
        prop: 'itemHeight',
        type: 'number',
        default: '44',
        desc: '行高（虚拟滚动时必填）',
      },
      {
        prop: 'virtualHeight',
        type: 'number',
        default: '400',
        desc: '滚动容器高度（px）',
      },
    ],
  },
  dialog: {
    title: 'Dialog 对话框',
    desc: '对话框用于重要信息的确认或展示。',
    demos: [
      {
        title: '基础用法',
        code: `createDialog({ title: '提示', content: '内容' }).open()`,
        init: (el: HTMLElement) => {
          createButton(el, {
            type: 'primary',
            text: '打开 Dialog',
            onClick: () => {
              const dlg = createDialog({
                title: '提示',
                content: '这是一个 Dialog 对话框，自带焦点陷阱和 Escape 关闭。',
                onConfirm: () => messageSuccess('点击了确定'),
              })
              dlg.open()
            },
          })
        },
      },
    ],
    api: [
      { prop: 'title', type: 'string', default: "''", desc: '标题' },
      {
        prop: 'content',
        type: 'string | HTMLElement',
        default: "''",
        desc: '内容',
      },
      {
        prop: 'showCancel',
        type: 'boolean',
        default: 'true',
        desc: '是否显示取消按钮',
      },
      { prop: 'onConfirm', type: '() => void', default: '-', desc: '确定回调' },
    ],
  },
  switch: {
    title: 'Switch 开关',
    desc: '开关用于在两种状态间切换。',
    demos: [
      {
        title: '基础用法',
        code: `createSwitch(container)`,
        init: (el: HTMLElement) => createSwitch(el),
      },
      {
        title: '带文字',
        code: `createSwitch(container, { activeText: '开启', inactiveText: '关闭' })`,
        init: (el: HTMLElement) =>
          createSwitch(el, {
            activeText: '开启',
            inactiveText: '关闭',
            value: true,
          }),
      },
    ],
    api: [
      { prop: 'value', type: 'boolean', default: 'false', desc: '当前值' },
      { prop: 'activeText', type: 'string', default: "''", desc: '开启文字' },
      { prop: 'inactiveText', type: 'string', default: "''", desc: '关闭文字' },
      {
        prop: 'onChange',
        type: '(value: boolean) => void',
        default: '-',
        desc: '切换回调',
      },
    ],
  },
  select: {
    title: 'Select 选择器',
    desc: '下拉选择器用于从多个选项中选择一个。支持通过 `options` 属性传入选项，也支持 `<MkOption>` 子组件写法。',
    demos: [
      {
        title: '基础用法',
        code: `new MkSelect(container, { options: [...] })`,
        init: (el: HTMLElement) => {
          new MkSelect(el, {
            placeholder: '请选择城市',
            options: [
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
              { label: '广州', value: 'guangzhou' },
              { label: '深圳', value: 'shenzhen' },
            ],
          })
        },
      },
      {
        title: '默认选中',
        code: `new MkSelect(container, { value: 'shanghai', options: [...] })`,
        init: (el: HTMLElement) => {
          new MkSelect(el, {
            value: 'shanghai',
            options: [
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
              { label: '广州', value: 'guangzhou' },
              { label: '深圳', value: 'shenzhen' },
            ],
          })
        },
      },
      {
        title: '禁用状态',
        code: `new MkSelect(container, { disabled: true })`,
        init: (el: HTMLElement) => {
          new MkSelect(el, {
            disabled: true,
            value: 'beijing',
            options: [
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
            ],
          })
        },
      },
      {
        title: '禁用选项',
        code: `new MkSelect(container, { options: [{ disabled: true, ... }] })`,
        init: (el: HTMLElement) => {
          new MkSelect(el, {
            placeholder: '请选择',
            options: [
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai', disabled: true },
              { label: '广州', value: 'guangzhou' },
              { label: '深圳', value: 'shenzhen', disabled: true },
            ],
          })
        },
      },
      {
        title: '本地搜索',
        code: `new MkSelect(container, { filterable: true, options: [...] })`,
        init: (el: HTMLElement) => {
          new MkSelect(el, {
            filterable: true,
            placeholder: '搜索城市',
            options: [
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
              { label: '广州', value: 'guangzhou' },
              { label: '深圳', value: 'shenzhen' },
              { label: '杭州', value: 'hangzhou' },
              { label: '南京', value: 'nanjing' },
              { label: '成都', value: 'chengdu' },
              { label: '武汉', value: 'wuhan' },
            ],
          })
        },
      },
      {
        title: '远程搜索',
        code: `new MkSelect(container, { remote: true, remoteMethod: async (q) => [...] })`,
        init: (el: HTMLElement) => {
          const allCities = [
            { label: '北京', value: 'beijing' },
            { label: '上海', value: 'shanghai' },
            { label: '广州', value: 'guangzhou' },
            { label: '深圳', value: 'shenzhen' },
            { label: '杭州', value: 'hangzhou' },
            { label: '南京', value: 'nanjing' },
            { label: '成都', value: 'chengdu' },
            { label: '武汉', value: 'wuhan' },
            { label: '西安', value: 'xian' },
            { label: '重庆', value: 'chongqing' },
          ]
          new MkSelect(el, {
            remote: true,
            placeholder: '输入搜索城市',
            options: allCities,
            remoteMethod: (query: string) => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  const result = allCities.filter((c) =>
                    c.label.includes(query)
                  )
                  resolve(result)
                }, 400)
              })
            },
          })
        },
      },
      {
        title: '大量选项（虚拟滚动）',
        code: `new MkSelect(container, { options: Array.from({length:10000}), virtualThreshold:50 })`,
        init: (el: HTMLElement) => {
          new MkSelect(el, {
            placeholder: '从 10000 项中选择',
            virtualThreshold: 50,
            options: Array.from({ length: 10000 }, (_, i) => ({
              label: '选项 ' + (i + 1),
              value: i + 1,
            })),
          })
        },
      },
    ],
    api: [
      {
        prop: 'placeholder',
        type: 'string',
        default: "'请选择'",
        desc: '占位文本',
      },
      {
        prop: 'options',
        type: 'SelectOption[]',
        default: '[]',
        desc: '选项列表',
      },
      { prop: 'value', type: 'string | number', default: '-', desc: '当前值' },
      {
        prop: 'disabled',
        type: 'boolean',
        default: 'false',
        desc: '是否禁用整个选择器',
      },
      {
        prop: 'filterable',
        type: 'boolean',
        default: 'false',
        desc: '是否可搜索（本地过滤）',
      },
      {
        prop: 'remote',
        type: 'boolean',
        default: 'false',
        desc: '是否启用远程搜索',
      },
      {
        prop: 'remoteMethod',
        type: '(query: string) => Promise<SelectOption[]> | SelectOption[]',
        default: '-',
        desc: '远程搜索方法',
      },
      {
        prop: 'debounce',
        type: 'number',
        default: '300',
        desc: '搜索防抖延迟（ms）',
      },
      {
        prop: 'virtualThreshold',
        type: 'number',
        default: '50',
        desc: '启用虚拟滚动的选项阈值',
      },
      {
        prop: 'onChange',
        type: '(value: string | number) => void',
        default: '-',
        desc: '选中变化回调',
      },
    ],
  },
  checkbox: {
    title: 'Checkbox 复选框',
    desc: '复选框用于多选场景。',
    demos: [
      {
        title: '基础用法',
        code: `new MkCheckbox(container, { label: '选项' })`,
        init: (el: HTMLElement) => {
          new MkCheckbox(el, { label: 'Apple', checked: true })
          new MkCheckbox(el, { label: 'Banana' })
          new MkCheckbox(el, { label: 'Cherry', checked: true })
        },
      },
    ],
    api: [
      { prop: 'label', type: 'string', default: "''", desc: '标签文字' },
      { prop: 'checked', type: 'boolean', default: 'false', desc: '是否选中' },
    ],
  },
  radio: {
    title: 'Radio 单选框',
    desc: '单选框用于单选场景。',
    demos: [
      {
        title: '基础用法',
        code: `new MkRadioGroup(container, { value: 'A' }).add({ label: 'A', value: 'A' })`,
        init: (el: HTMLElement) => {
          const rg = new MkRadioGroup(el)
          rg.add({ label: 'Option A', value: 'A' })
          rg.add({ label: 'Option B', value: 'B' })
          rg.add({ label: 'Option C', value: 'C', disabled: true })
          rg.setValue('A')
        },
      },
    ],
    api: [
      { prop: 'value', type: 'string | number', default: '-', desc: '当前值' },
    ],
  },
  slider: {
    title: 'Slider 滑块',
    desc: '滑块用于在一定范围内选择数值。',
    demos: [
      {
        title: '基础用法',
        code: `new MkSlider(container, { value: 35 })`,
        init: (el: HTMLElement) => new MkSlider(el, { value: 35 }),
      },
    ],
    api: [
      { prop: 'min', type: 'number', default: '0', desc: '最小值' },
      { prop: 'max', type: 'number', default: '100', desc: '最大值' },
      { prop: 'step', type: 'number', default: '1', desc: '步长' },
      { prop: 'value', type: 'number', default: '0', desc: '当前值' },
    ],
  },
  avatar: {
    title: 'Avatar 头像',
    desc: '头像用于展示用户或事物的形象。',
    demos: [
      {
        title: '基础用法',
        code: `createAvatar(container, { text: 'MK' })`,
        init: (el: HTMLElement) => {
          createAvatar(el, { text: 'MK', size: 'large' })
          createAvatar(el, {
            src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
          })
          createAvatar(el, { icon: '👤' })
        },
      },
    ],
    api: [
      { prop: 'src', type: 'string', default: "''", desc: '图片地址' },
      { prop: 'text', type: 'string', default: "''", desc: '文字回显' },
      {
        prop: 'size',
        type: "'small' | 'default' | 'large'",
        default: "'default'",
        desc: '尺寸',
      },
    ],
  },
  alert: {
    title: 'Alert 警告提示',
    desc: '警告提示用于展示需要用户关注的信息。',
    demos: [
      {
        title: '类型',
        code: `createAlert(container, { type: 'success', title: '成功' })`,
        init: (el: HTMLElement) => {
          createAlert(el, {
            type: 'info',
            title: '信息提示',
            description: '这是一条普通的信息提示。',
          })
          createAlert(el, {
            type: 'success',
            title: '成功',
            description: '操作已成功完成。',
          })
          createAlert(el, {
            type: 'warning',
            title: '警告',
            description: '请注意检查您的输入。',
          })
          createAlert(el, {
            type: 'danger',
            title: '错误',
            description: '发生了错误，请重试。',
          })
        },
      },
    ],
    api: [
      {
        prop: 'type',
        type: "'info' | 'success' | 'warning' | 'danger'",
        default: "'info'",
        desc: '类型',
      },
      { prop: 'title', type: 'string', default: "''", desc: '标题' },
      { prop: 'description', type: 'string', default: "''", desc: '描述' },
    ],
  },
  progress: {
    title: 'Progress 进度条',
    desc: '进度条用于展示操作的当前进度。',
    demos: [
      {
        title: '线性',
        code: `createProgress(container, { percent: 60 })`,
        init: (el: HTMLElement) => {
          createProgress(el, { percent: 30 })
          createProgress(el, { percent: 60, status: 'active' })
          createProgress(el, { percent: 100, status: 'success' })
        },
      },
      {
        title: '环形',
        code: `createProgress(container, { type: 'circle', percent: 75 })`,
        init: (el: HTMLElement) => {
          createProgress(el, { type: 'circle', percent: 75 })
          createProgress(el, {
            type: 'circle',
            percent: 100,
            status: 'success',
          })
        },
      },
    ],
    api: [
      {
        prop: 'type',
        type: "'line' | 'circle' | 'dashboard'",
        default: "'line'",
        desc: '类型',
      },
      { prop: 'percent', type: 'number', default: '0', desc: '百分比' },
      {
        prop: 'status',
        type: "'active' | 'success' | 'exception'",
        default: "'active'",
        desc: '状态',
      },
    ],
  },
  collapse: {
    title: 'Collapse 折叠面板',
    desc: '折叠面板用于收纳内容。',
    demos: [
      {
        title: '基础用法',
        code: `createCollapse(container, { items: [...] })`,
        init: (el: HTMLElement) => {
          createCollapse(el, {
            items: [
              { title: '面板一', content: '这是第一个面板的内容。' },
              { title: '面板二', content: '这是第二个面板的内容。' },
              { title: '面板三', content: '这是第三个面板的内容。' },
            ],
          })
        },
      },
    ],
    api: [
      { prop: 'items', type: 'CollapseItem[]', default: '[]', desc: '面板项' },
      {
        prop: 'accordion',
        type: 'boolean',
        default: 'false',
        desc: '是否手风琴模式',
      },
    ],
  },
  empty: {
    title: 'Empty 空状态',
    desc: '空状态用于无数据时的占位展示。',
    demos: [
      {
        title: '基础用法',
        code: `createEmpty(container, { description: '暂无数据' })`,
        init: (el: HTMLElement) => createEmpty(el, { description: '暂无数据' }),
      },
    ],
    api: [
      {
        prop: 'description',
        type: 'string',
        default: "'暂无数据'",
        desc: '描述文字',
      },
    ],
  },
  popover: {
    title: 'Popover 气泡卡片',
    desc: '气泡卡片用于展示比 Tooltip 更丰富的内容。',
    demos: [
      {
        title: '基础用法',
        code: `createPopover(target, { content: '内容', title: '标题' })`,
        init: (el: HTMLElement) => {
          const btn = document.createElement('button')
          btn.className = 'mk-button mk-button--primary'
          btn.textContent = '点击我'
          el.appendChild(btn)
          createPopover(btn, {
            title: '气泡标题',
            content: '这是气泡卡片的内容。',
            trigger: 'click',
            placement: 'top',
          })
        },
      },
    ],
    api: [
      { prop: 'title', type: 'string', default: "''", desc: '标题' },
      {
        prop: 'content',
        type: 'string | HTMLElement',
        default: "''",
        desc: '内容',
      },
      {
        prop: 'placement',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: "'top'",
        desc: '位置',
      },
    ],
  },
  menu: {
    title: 'Menu 菜单',
    desc: '菜单用于页面功能的导航。',
    demos: [
      {
        title: '垂直菜单',
        code: `createMenu(container, { mode: 'vertical', items: [...] })`,
        init: (el: HTMLElement) => {
          createMenu(el, {
            mode: 'vertical',
            items: [
              { index: '1', label: '首页', icon: '🏠' },
              {
                index: '2',
                label: '用户管理',
                icon: '👥',
                children: [
                  { index: '2-1', label: '用户列表' },
                  { index: '2-2', label: '角色权限' },
                ],
              },
              { index: '3', label: '系统设置', icon: '⚙️' },
            ],
          })
        },
      },
    ],
    api: [
      {
        prop: 'mode',
        type: "'vertical' | 'horizontal'",
        default: "'vertical'",
        desc: '模式',
      },
      { prop: 'items', type: 'MenuItem[]', default: '[]', desc: '菜单项' },
    ],
  },
  breadcrumb: {
    title: 'Breadcrumb 面包屑',
    desc: '面包屑显示当前页面在层级结构中的位置。',
    demos: [
      {
        title: '基础用法',
        code: `createBreadcrumb(container, { items: [...] })`,
        init: (el: HTMLElement) => {
          createBreadcrumb(el, {
            items: [
              { label: '首页', onClick: () => message('首页') },
              { label: '用户管理', onClick: () => message('用户管理') },
              { label: '用户列表' },
            ],
          })
        },
      },
    ],
    api: [
      {
        prop: 'items',
        type: 'BreadcrumbItem[]',
        default: '[]',
        desc: '面包屑项',
      },
    ],
  },
  steps: {
    title: 'Steps 步骤条',
    desc: '步骤条引导用户按照流程完成任务。',
    demos: [
      {
        title: '水平步骤条',
        code: `createSteps(container, { current: 1, items: [...] })`,
        init: (el: HTMLElement) => {
          createSteps(el, {
            current: 1,
            items: [
              { title: '步骤一', description: '填写信息' },
              { title: '步骤二', description: '确认订单' },
              { title: '步骤三', description: '完成支付' },
            ],
          })
        },
      },
    ],
    api: [
      { prop: 'current', type: 'number', default: '0', desc: '当前步骤' },
      { prop: 'items', type: 'StepItem[]', default: '[]', desc: '步骤项' },
    ],
  },
  row: {
    title: 'Row / Col 栅格',
    desc: '基于 Flex 的 24 列响应式栅格系统，支持对齐、间距和偏移。',
    demos: [
      {
        title: '基础栅格',
        code: `const row = createRow(container)\nrow.addCol(8, 'Col-8')\nrow.addCol(16, 'Col-16')`,
        init: (el: HTMLElement) => {
          const row = createRow(el)
          const c1 = row.addCol(8, '', { className: 'demo-col' })
          c1.style.background = 'var(--mk-primary-soft)'
          c1.style.padding = '12px'
          c1.style.borderRadius = '4px'
          c1.style.border = '1px solid var(--mk-border)'
          c1.textContent = 'Col-8'
          const c2 = row.addCol(16, '', { className: 'demo-col' })
          c2.style.background = 'var(--mk-success-soft)'
          c2.style.padding = '12px'
          c2.style.borderRadius = '4px'
          c2.style.border = '1px solid var(--mk-border)'
          c2.textContent = 'Col-16'
        },
      },
      {
        title: '对齐方式',
        code: `createRow(container, { justify: 'center', align: 'middle' })`,
        init: (el: HTMLElement) => {
          const row = createRow(el, { justify: 'center', align: 'middle' })
          const c1 = row.addCol(6, '', { className: 'demo-col' })
          c1.style.background = 'var(--mk-primary-soft)'
          c1.style.padding = '12px'
          c1.style.borderRadius = '4px'
          c1.style.border = '1px solid var(--mk-border)'
          c1.textContent = 'Center'
          const c2 = row.addCol(6, '', { className: 'demo-col' })
          c2.style.background = 'var(--mk-success-soft)'
          c2.style.padding = '12px'
          c2.style.borderRadius = '4px'
          c2.style.border = '1px solid var(--mk-border)'
          c2.textContent = 'Middle'
        },
      },
      {
        title: '间距与偏移',
        code: `createRow(container, { gutter: 24 }).addCol(6, 'A').addCol(6, 'B', { offset: 6 })`,
        init: (el: HTMLElement) => {
          const row = createRow(el, { gutter: 24 })
          const c1 = row.addCol(6, '', { className: 'demo-col' })
          c1.style.background = 'var(--mk-primary-soft)'
          c1.style.padding = '12px'
          c1.style.borderRadius = '4px'
          c1.style.border = '1px solid var(--mk-border)'
          c1.textContent = 'A (6)'
          const c2 = row.addCol(6, '', { offset: 6, className: 'demo-col' })
          c2.style.background = 'var(--mk-success-soft)'
          c2.style.padding = '12px'
          c2.style.borderRadius = '4px'
          c2.style.border = '1px solid var(--mk-border)'
          c2.textContent = 'B (6 + offset 6)'
        },
      },
    ],
    api: [
      { prop: 'gutter', type: 'number', default: '16', desc: '栅格间距（px）' },
      {
        prop: 'justify',
        type: "'start' | 'center' | 'end' | 'space-between' | 'space-around'",
        default: "'start'",
        desc: '水平对齐',
      },
      {
        prop: 'align',
        type: "'top' | 'middle' | 'bottom'",
        default: "'top'",
        desc: '垂直对齐',
      },
      { prop: 'wrap', type: 'boolean', default: 'true', desc: '是否换行' },
    ],
  },
  space: {
    title: 'Space 间距',
    desc: '设置组件之间的间距，支持水平和垂直方向。',
    demos: [
      {
        title: '基础用法',
        code: `createSpace(container).add('Item 1')`,
        init: (el: HTMLElement) => {
          const s = createSpace(el)
          s.add('Item 1')
          s.add('Item 2')
          s.add('Item 3')
        },
      },
      {
        title: '垂直间距',
        code: `createSpace(container, { direction: 'vertical' })`,
        init: (el: HTMLElement) => {
          const s = createSpace(el, { direction: 'vertical' })
          s.add('Top')
          s.add('Middle')
          s.add('Bottom')
        },
      },
      {
        title: '间距大小',
        code: `createSpace(container, { size: 'large' })`,
        init: (el: HTMLElement) => {
          const s = createSpace(el, { size: 'large' })
          s.add('Large 1')
          s.add('Large 2')
        },
      },
    ],
    api: [
      {
        prop: 'direction',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        desc: '排列方向',
      },
      {
        prop: 'size',
        type: "'small' | 'default' | 'large'",
        default: "'default'",
        desc: '间距大小',
      },
      { prop: 'wrap', type: 'boolean', default: 'true', desc: '是否换行' },
    ],
  },
  divider: {
    title: 'Divider 分割线',
    desc: '区隔内容的分割线，支持水平和垂直方向。',
    demos: [
      {
        title: '水平分割线',
        code: `createDivider(container, { text: '分割线' })`,
        init: (el: HTMLElement) => {
          const p = document.createElement('p')
          p.textContent = '上方内容'
          p.className = 'doc-p'
          el.appendChild(p)
          createDivider(el, { text: '分割线' })
          const p2 = document.createElement('p')
          p2.textContent = '下方内容'
          p2.className = 'doc-p'
          el.appendChild(p2)
        },
      },
      {
        title: '虚线分割',
        code: `createDivider(container, { dashed: true })`,
        init: (el: HTMLElement) => {
          createDivider(el, { text: 'Dashed', dashed: true })
        },
      },
      {
        title: '垂直分割',
        code: `createDivider(container, { direction: 'vertical' })`,
        init: (el: HTMLElement) => {
          el.style.display = 'flex'
          el.style.alignItems = 'center'
          el.style.gap = '8px'
          const s1 = document.createElement('span')
          s1.textContent = 'Left'
          const s2 = document.createElement('span')
          s2.textContent = 'Right'
          el.appendChild(s1)
          createDivider(el, { direction: 'vertical' })
          el.appendChild(s2)
        },
      },
    ],
    api: [
      { prop: 'text', type: 'string', default: "''", desc: '分割线文字' },
      {
        prop: 'direction',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        desc: '方向',
      },
      { prop: 'dashed', type: 'boolean', default: 'false', desc: '是否虚线' },
    ],
  },
  container: {
    title: 'Container 容器',
    desc: '页面级容器，用于包裹主要内容区域，支持固定宽度和流式布局。',
    demos: [
      {
        title: '固定宽度',
        code: `createContainer(container)`,
        init: (el: HTMLElement) => {
          const c = createContainer(el)
          c.el.style.background = 'var(--mk-primary-soft)'
          c.el.style.border = '1px solid var(--mk-border)'
          c.el.style.padding = '24px'
          c.el.style.borderRadius = '8px'
          c.el.textContent = '固定宽度容器（默认 max-width: 1200px）'
        },
      },
      {
        title: '流式布局',
        code: `createContainer(container, { fluid: true })`,
        init: (el: HTMLElement) => {
          const c = createContainer(el, { fluid: true })
          c.el.style.background = 'var(--mk-success-soft)'
          c.el.style.border = '1px solid var(--mk-border)'
          c.el.style.padding = '24px'
          c.el.style.borderRadius = '8px'
          c.el.textContent = '流式容器（宽度 100%）'
        },
      },
      {
        title: '自定义最大宽度',
        code: `createContainer(container, { maxWidth: 600 })`,
        init: (el: HTMLElement) => {
          const c = createContainer(el, { maxWidth: 600 })
          c.el.style.background = 'var(--mk-warning-soft)'
          c.el.style.border = '1px solid var(--mk-border)'
          c.el.style.padding = '24px'
          c.el.style.borderRadius = '8px'
          c.el.textContent = '自定义 max-width: 600px'
        },
      },
    ],
    api: [
      {
        prop: 'fluid',
        type: 'boolean',
        default: 'false',
        desc: '是否流式宽度（100%）',
      },
      {
        prop: 'maxWidth',
        type: 'number | string',
        default: '1200',
        desc: '最大宽度',
      },
      {
        prop: 'padding',
        type: 'number | string',
        default: '响应式',
        desc: '内边距',
      },
      {
        prop: 'centered',
        type: 'boolean',
        default: 'true',
        desc: '是否水平居中',
      },
    ],
  },
  layout: {
    title: 'Layout 页面布局',
    desc: '用于搭建页面的整体结构，支持 Header、Aside、Main、Footer 的灵活组合。',
    demos: [
      {
        title: '上中下布局',
        code: `const outer = createLayout(container, { direction: 'vertical' })\ncreateHeader(outer.el)\ncreateMain(outer.el)\ncreateFooter(outer.el)`,
        init: (el: HTMLElement) => {
          const outer = createLayout(el, { direction: 'vertical' })
          outer.el.style.height = '200px'
          outer.el.style.border = '1px solid var(--mk-border)'
          outer.el.style.borderRadius = '8px'
          outer.el.style.overflow = 'hidden'
          const h = createHeader(outer.el, { height: 40 })
          h.el.style.padding = '0 16px'
          h.el.style.background = 'var(--mk-primary-soft)'
          h.el.textContent = 'Header'
          const m = createMain(outer.el)
          m.el.style.background = 'var(--mk-bg-elevated)'
          m.el.textContent = 'Main Content'
          const f = createFooter(outer.el, { height: 40 })
          f.el.style.padding = '0 16px'
          f.el.style.background = 'var(--mk-success-soft)'
          f.el.textContent = 'Footer'
        },
      },
      {
        title: '侧边栏布局',
        code: `const outer = createLayout(container, { direction: 'vertical' })\nconst inner = createLayout(outer.el, { direction: 'horizontal' })\ncreateAside(inner.el)\ncreateMain(inner.el)`,
        init: (el: HTMLElement) => {
          const outer = createLayout(el, { direction: 'vertical' })
          outer.el.style.height = '200px'
          outer.el.style.border = '1px solid var(--mk-border)'
          outer.el.style.borderRadius = '8px'
          outer.el.style.overflow = 'hidden'
          const h = createHeader(outer.el, { height: 40 })
          h.el.style.padding = '0 16px'
          h.el.style.background = 'var(--mk-primary-soft)'
          h.el.textContent = 'Header'
          const inner = createLayout(outer.el, { direction: 'horizontal' })
          const a = createAside(inner.el, { width: 100 })
          a.el.style.background = 'var(--mk-warning-soft)'
          a.el.textContent = 'Aside'
          const m = createMain(inner.el)
          m.el.style.background = 'var(--mk-bg-elevated)'
          m.el.textContent = 'Main'
          const f = createFooter(outer.el, { height: 40 })
          f.el.style.padding = '0 16px'
          f.el.style.background = 'var(--mk-success-soft)'
          f.el.textContent = 'Footer'
        },
      },
    ],
    api: [
      {
        prop: 'direction',
        type: "'vertical' | 'horizontal'",
        default: "'vertical'",
        desc: '布局方向',
      },
      {
        prop: 'height',
        type: 'number | string',
        default: '60',
        desc: 'Header / Footer 高度',
      },
      {
        prop: 'width',
        type: 'number | string',
        default: '240',
        desc: 'Aside 宽度',
      },
    ],
  },
}
