import {
  defineNuxtModule,
  addComponent,
  addImportsDir,
  createResolver,
} from '@nuxt/kit'

export interface ModuleOptions {
  prefix?: string
}

const ALL_COMPONENTS = [
  'Button',
  'Input',
  'Switch',
  'Radio',
  'RadioGroup',
  'Checkbox',
  'CheckboxGroup',
  'Slider',
  'Card',
  'Tag',
  'Alert',
  'Progress',
  'Empty',
  'Avatar',
  'Divider',
  'Space',
  'Row',
  'Col',
  'Container',
  'Layout',
  'Header',
  'Aside',
  'Main',
  'Footer',
  'Dialog',
  'Drawer',
  'Menu',
  'MenuItem',
  'Tabs',
  'Popover',
  'Dropdown',
  'Tooltip',
  'Breadcrumb',
  'Steps',
  'Loading',
  'Message',
  'Collapse',
  'Select',
  'Table',
  'Pagination',
  'Tree',
  'DatePicker',
  'TimePicker',
  'Upload',
  'Form',
  'FormItem',
]

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'mk-motion',
    configKey: 'mkMotion',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    prefix: 'Mk',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Auto-import all Vue components
    for (const name of ALL_COMPONENTS) {
      const componentName = `${options.prefix}${name}`
      addComponent({
        name: componentName,
        export: `Mk${name}`,
        filePath: '@luanlu/mk-motion/vue',
      })
    }

    // Auto-import composables
    addImportsDir(resolver.resolve('../../vue/composables'))

    // Inject CSS
    nuxt.options.css.push('@luanlu/mk-motion/css')
  },
})
