# Migration Guide

## From v1.x to v2.0.0

`@luanlu/mk-motion` v2.0.0 splits the monolithic main entry into capability-based subpath exports. The main entry now only exposes the modern animation and interaction API.

### What changed

| Capability | v1.x entry | v2.0 entry |
|------------|------------|------------|
| Animation & interaction API | `@luanlu/mk-motion` or `@luanlu/mk-motion/motion` | `@luanlu/mk-motion` |
| Vue 3 SFC components | `@luanlu/mk-motion` | `@luanlu/mk-motion/vue` |
| Legacy imperative DOM API | `@luanlu/mk-motion` | `@luanlu/mk-motion/legacy` |
| Styles | imported as a side effect of the main entry | `@luanlu/mk-motion/css` |

### Removed from the main entry

The following exports are no longer available from `@luanlu/mk-motion`. Import them from the new entries shown above.

**Vue components**

`MkButton`, `MkInput`, `MkSwitch`, `MkRadio`, `MkRadioGroup`, `MkCheckbox`, `MkCheckboxGroup`, `MkSlider`, `MkCard`, `MkTag`, `MkAlert`, `MkProgress`, `MkEmpty`, `MkAvatar`, `MkDivider`, `MkSpace`, `MkRow`, `MkCol`, `MkContainer`, `MkLayout`, `MkHeader`, `MkAside`, `MkMain`, `MkFooter`, `MkDialog`, `MkDrawer`, `MkMenu`, `MkMenuItem`, `MkTabs`, `MkPopover`, `MkDropdown`, `MkTooltip`, `MkBreadcrumb`, `MkSteps`, `MkLoading`, `MkMessage`, `MkCollapse`, `MkSelect`, `MkTable`, `MkPagination`, `MkTree`, `MkDatePicker`, `MkTimePicker`, `MkUpload`, `MkForm`, `MkFormItem`

**Legacy imperative API**

`createButton`, `createInput`, `createCard`, `createDialog`, `createDrawer`, `message`, `messageSuccess`, `messageError`, `messageWarning`, `createSwitch`, `createSelect`, `createCheckbox`, `LegacyCheckboxGroup`, `LegacyRadio`, `LegacyRadioGroup`, `createTag`, `createTabs`, `createTooltip`, `createAvatar`, `createAlert`, `createProgress`, `createCollapse`, `createEmpty`, `createPopover`, `createMenu`, `createBreadcrumb`, `createSteps`, `createRow`, `createSpace`, `createDivider`, `createContainer`, `createLayout`, `createHeader`, `createAside`, `createMain`, `createFooter`

### Migration examples

#### Using only the animation API

```ts
// v1.x
import { springTo, flip, fadeIn } from '@luanlu/mk-motion'

// v2.0 — unchanged
import { springTo, flip, fadeIn } from '@luanlu/mk-motion'
import '@luanlu/mk-motion/css'
```

#### Using Vue components

```ts
// v1.x
import { MkButton, MkDialog } from '@luanlu/mk-motion'

// v2.0
import { MkButton, MkDialog } from '@luanlu/mk-motion/vue'
```

#### Using the legacy imperative API

```ts
// v1.x
import { createButton, createDialog, messageSuccess } from '@luanlu/mk-motion'

// v2.0
import { createButton, createDialog, messageSuccess } from '@luanlu/mk-motion/legacy'
import '@luanlu/mk-motion/css'
```

### CSS side effect removed

The main entry no longer imports CSS automatically. Add the CSS import explicitly in your application entry:

```ts
import '@luanlu/mk-motion/css'
```

## From v2.0.x to v2.1.0

### Theme system overhaul

v2.1.0 introduces a first-class light/dark/auto theme system and changes the default theme from dark to light.

| Change | v2.0.x | v2.1.0 |
|--------|--------|--------|
| Default theme | dark | light |
| `useMkTheme` API | `{ isDark, setTheme(dark: boolean), toggle }` | `{ theme, resolvedTheme, setTheme('auto' \| 'light' \| 'dark'), toggle }` |
| Theme attribute | `data-mk-theme="light" \| "dark"` | same, plus `auto` resolves to system preference |
| Storage key | none | `mk-theme` in `localStorage` |

Update your theme toggle code:

```ts
// v2.0.x
const { isDark, toggle } = useMkTheme()

// v2.1.0
const { resolvedTheme, setTheme, toggle } = useMkTheme()
// resolvedTheme: 'light' | 'dark'
setTheme('dark')
toggle()
```

### Popover/floating components now teleport to body by default

`MkSelect`, `MkDropdown`, `MkTooltip`, `MkPopover`, `MkDatePicker`, and `MkTimePicker` now render their popup layer into `document.body` by default via `<Teleport>`, preventing clipping by `overflow: hidden` ancestors. You can disable this with `:teleport="false"`.

### Default max-width removed

Form and floating components no longer ship with a fixed `max-width`. Their width is now controlled by their container or by your own CSS:

- `MkInput`, `MkSelect`, `MkSlider`, `MkDatePicker`, `MkTimePicker`, `MkUpload`
- `MkTooltip`, `MkPopover`

If you relied on the previous defaults, add explicit widths in your app styles.

### Automated migration tips

You can use the following search/replace patterns in your editor or with `sed`:

```bash
# Vue components
sed -i "s/from '@luanlu\/mk-motion'/from '@luanlu\/mk-motion\/vue'/g" src/**/*.vue

# Legacy imperative API (run only on files that use createXxx/messageXxx)
sed -i "s/from '@luanlu\/mk-motion'/from '@luanlu\/mk-motion\/legacy'/g" src/legacy/**/*.ts
```

> Note: these patterns are starting points. Review each changed import to ensure it maps to the correct subpath.
