import type { Plugin } from 'vite'

export interface MkMotionOptions {
  /** Components to auto-import. Defaults to all. */
  components?: string[]
  /**
   * Auto-import component CSS.
   * - `true` (default): import the full `@luanlu/mk-motion/css`
   * - `'component'`: import base styles plus each used component's CSS only
   * - `false`: do not import CSS
   */
  importStyle?: boolean | 'component'
  /** Inject composables (useMkTheme, useMkMotion, etc.) */
  composables?: boolean
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

const COMPOSABLES = [
  'useMkTheme',
  'useMkMotion',
  'useMkLoading',
  'useMkMessage',
]

// Match both @luanlu/mk-motion/vue and mk-motion/vue (alias)
const MK_VUE_SOURCE_RE = /@luanlu\/mk-motion\/vue|mk-motion\/vue/

export function mkMotion(options: MkMotionOptions = {}): Plugin {
  const components = options.components || ALL_COMPONENTS
  const importStyle: boolean | 'component' =
    options.importStyle === false
      ? false
      : options.importStyle === 'component'
        ? 'component'
        : true
  const enableComposables = options.composables !== false

  return {
    name: 'mk-motion',
    enforce: 'pre',
    transform(code, id) {
      // Only process Vue SFC files (original file, not virtual modules)
      // Skip internal library components to avoid duplicating their manual imports
      if (
        !id.endsWith('.vue') ||
        id.includes('?vue&') ||
        id.includes('components-vue')
      )
        return

      let transformed = code
      let hasChanges = false

      // ---- Auto-import components ----
      const usedComponents = components.filter((name) => {
        const tag = `Mk${name}`
        // Match component tags in template: <MkButton> or <MkButton />
        const regex = new RegExp(`<${tag}(\\s|/>|>)`, 'g')
        return regex.test(code)
      })

      if (usedComponents.length > 0) {
        const importNames = usedComponents.map((n) => `Mk${n}`).join(', ')
        const importLine = `import { ${importNames} } from '@luanlu/mk-motion/vue'`

        // Check if already imported (from any mk-motion/vue source)
        const alreadyImported = usedComponents.every((n) => {
          const regex = new RegExp(
            `import\\s*\\{[^}]*\\bMk${n}\\b[^}]*\\}\\s*from\\s*['"](${MK_VUE_SOURCE_RE.source})['"]`
          )
          return regex.test(code)
        })

        if (!alreadyImported) {
          // Find <script setup> or <script> block and insert after the tag
          const scriptMatch =
            code.match(/<script\s+setup[^>]*>/i) || code.match(/<script[^>]*>/i)
          if (scriptMatch) {
            const insertPos = scriptMatch.index! + scriptMatch[0].length
            // Add CSS import(s) if not already present
            let cssImportLines = ''
            if (
              importStyle &&
              !code.includes('@luanlu/mk-motion/css') &&
              !code.includes('mk-motion/css')
            ) {
              if (importStyle === 'component') {
                cssImportLines = `\nimport '@luanlu/mk-motion/css/base'`
                for (const name of usedComponents) {
                  const kebab = name
                    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                    .toLowerCase()
                  cssImportLines += `\nimport '@luanlu/mk-motion/css/${kebab}'`
                }
              } else {
                cssImportLines = `\nimport '@luanlu/mk-motion/css'`
              }
            }
            transformed =
              transformed.slice(0, insertPos) +
              '\n' +
              importLine +
              cssImportLines +
              '\n' +
              transformed.slice(insertPos)
            hasChanges = true
          }
        }
      }

      // ---- Auto-import composables ----
      if (enableComposables) {
        const usedComposables = COMPOSABLES.filter((name) => {
          // Match usage like: const theme = useMkTheme()
          const regex = new RegExp(`\\b${name}\\s*\\(`, 'g')
          return regex.test(code)
        })

        if (usedComposables.length > 0) {
          const importNames = usedComposables.join(', ')
          const importLine = `import { ${importNames} } from '@luanlu/mk-motion/vue'`

          const alreadyImported = usedComposables.every((n) => {
            const regex = new RegExp(
              `import\\s*\\{[^}]*\\b${n}\\b[^}]*\\}\\s*from\\s*['"](${MK_VUE_SOURCE_RE.source})['"]`
            )
            return regex.test(code)
          })

          if (!alreadyImported) {
            const scriptMatch =
              code.match(/<script\s+setup[^>]*>/i) ||
              code.match(/<script[^>]*>/i)
            if (scriptMatch) {
              const insertPos = scriptMatch.index! + scriptMatch[0].length
              transformed =
                transformed.slice(0, insertPos) +
                '\n' +
                importLine +
                '\n' +
                transformed.slice(insertPos)
              hasChanges = true
            }
          }
        }
      }

      return hasChanges ? transformed : code
    },
  }
}

export { MkMotionResolver } from './resolver.js'
export type { MkMotionResolverOptions } from './resolver.js'
