/**
 * unplugin-vue-components resolver for mk-motion
 *
 * Usage:
 *   import Components from 'unplugin-vue-components/vite'
 *   import { MkMotionResolver } from '@luanlu/mk-motion/vite'
 *
 *   Components({ resolvers: [MkMotionResolver()] })
 */

export interface MkMotionResolverOptions {
  /** Import style along with components */
  importStyle?: boolean
}

const ALL_COMPONENTS = [
  'MkButton',
  'MkInput',
  'MkSwitch',
  'MkRadio',
  'MkRadioGroup',
  'MkCheckbox',
  'MkCheckboxGroup',
  'MkSlider',
  'MkCard',
  'MkTag',
  'MkAlert',
  'MkProgress',
  'MkEmpty',
  'MkAvatar',
  'MkDivider',
  'MkSpace',
  'MkRow',
  'MkCol',
  'MkContainer',
  'MkLayout',
  'MkHeader',
  'MkAside',
  'MkMain',
  'MkFooter',
  'MkDialog',
  'MkDrawer',
  'MkMenu',
  'MkMenuItem',
  'MkTabs',
  'MkPopover',
  'MkDropdown',
  'MkTooltip',
  'MkBreadcrumb',
  'MkSteps',
  'MkLoading',
  'MkMessage',
  'MkCollapse',
  'MkSelect',
  'MkTable',
  'MkPagination',
  'MkTree',
  'MkDatePicker',
  'MkTimePicker',
  'MkUpload',
  'MkForm',
  'MkFormItem',
]

export function MkMotionResolver(options: MkMotionResolverOptions = {}) {
  const { importStyle = true } = options

  return {
    type: 'component' as const,
    resolve: (name: string) => {
      if (!ALL_COMPONENTS.includes(name)) return

      const result: {
        name: string
        from: string
        sideEffects?: string
      } = {
        name,
        from: '@luanlu/mk-motion/vue',
      }

      if (importStyle) {
        result.sideEffects = '@luanlu/mk-motion/css'
      }

      return result
    },
  }
}
