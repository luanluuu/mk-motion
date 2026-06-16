# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!-- Unreleased entries will be added during v2.0.13 development. -->


## [2.0.12] - 2026-06-16

### Added

- **Theme system v2.1**: `useMkTheme()` now supports `auto` | `light` | `dark`, persists to `localStorage`, listens to `prefers-color-scheme`, and is SSR-safe.
- Light theme is now the default; `tokens.css` has been split into `:root` neutral tokens + `[data-mk-theme="light"]` / `[data-mk-theme="dark"]` full semantic palettes.
- Floating components (`MkSelect`, `MkDropdown`, `MkTooltip`, `MkPopover`, `MkDatePicker`, `MkTimePicker`) now support a `teleport` prop and default to rendering their popup in `document.body` to avoid clipping.
- New `MkTeleport` internal component and `useDropdownPosition` composable for body-anchored popups.
- `MkOption` and `MkTabPane` child-component support for `MkSelect` and `MkTabs`.
- New `MkOption` component for declarative select options.
- New `MkTabPane` component for declarative tab panes.
- `MkSelect` now supports `size` prop (`small` | `default` | `large`) and `<MkOption>` child components in addition to the `:options` prop.
- `MkTabs` now supports `<MkTabPane>` child components in addition to the `:items` prop.
- `MkTable` exports generic `TableColumn<T>` type for typed column definitions.
- Exported prop/composable types from `@luanlu/mk-motion/vue`: `MkTheme`, `UseMkThemeOptions`, `UseMkMotionOptions`, `UseMkLoadingOptions`, `UseMkMessageOptions`, and all shared component prop types.
- Added SSR safety guards to `MkSelect`, `MkDatePicker`, and `MkTimePicker` document/window access.
- Added Nuxt module auto-registration for `MkTabPane` and `MkOption`.
- Vitest coverage reporting (`text`, `lcov`, `html`) and `npm run check` now runs coverage.
- Per-component CSS entries under `dist/css/*` and `mkMotion({ importStyle: 'component' })` for on-demand styles.
- Semantic color hover/active variables: `--mk-success-hover`, `--mk-success-active`, `--mk-warning-hover`, `--mk-warning-active`, `--mk-danger-hover`, `--mk-danger-active`, `--mk-info-hover`, `--mk-info-active`.
- Dev-mode CSS variable check: warns when `--mk-primary`, `--mk-text`, `--mk-border`, or `--mk-surface` are missing.
- `demo-vue`, `examples/admin-dashboard`, and `examples/landing-page` now include theme toggles.
- `MkSelect` demo added to `demo-vue` inside an `overflow: hidden` container to verify Teleport anti-clipping.

### Changed

- `useMkTheme` API changed from `{ isDark, setTheme(boolean), toggle }` to `{ theme, resolvedTheme, setTheme('auto' | 'light' | 'dark'), toggle }`.
- Removed default `max-width` from form and floating components (`MkInput`, `MkSelect`, `MkSlider`, `MkDatePicker`, `MkTimePicker`, `MkUpload`, `MkTooltip`, `MkPopover`).
- `dist/style.css` now includes the full `:root` theme tokens, so `import '@luanlu/mk-motion/css'` works standalone.
- `MkButton` default margin changed to `0`; legacy spacing available via `.mk-button--gutter` or CSS variables `--mk-button-margin-x` / `--mk-button-margin-y`.
- Docs site header now uses `useMkTheme` with ☀️/🌙/Auto buttons instead of a manual color-temperature slider.
- `examples/admin-dashboard` now imports legacy components from `@luanlu/mk-motion/legacy`.
- README examples updated to use `MkSelect :options` / `<MkOption>` and `MkTabs :items`.
- README notes on Vite auto-import: avoid mixing auto-import with explicit imports.

### Fixed

- `MkTabs` panel visibility: inactive panels are now `display: none`, active panels are `display: block`.
- `MkTabs` TypeScript error when resolving `<MkTabPane>` items.
- `MkSelect` unused `MkOption` import warning.
- `MkSelect` dropdown now adds the `is-open` class when opened, fixing `opacity: 0` visibility issue.
- `MkDropdown` menu now uses `display: block` when open.

## [2.0.2] - 2026-06-14

### Added

- Expand test coverage: `spring-engine`, `Timeline`, `DraggableList`, `Draggable`, and `TapRecognizer`.
- Add Touch constructor mock to jsdom test environment.

### Changed

- Make `docs/` a standalone deployable sub-project with its own `package.json` and dependency on `@luanlu/mk-motion`.
- Update documentation imports from `mk-motion` to `@luanlu/mk-motion`.
- Align entries build CSS output name with package exports (`dist/style.css`).

### Fixed

- Fix `TapRecognizer` first-tap misdetected as double-tap when `performance.now()` is near zero.
- Fix `pointercancel` incorrectly triggering single-tap callback.

## [2.0.1] - 2026-06-13

### Fixed

- Bump version to 2.0.1 to resolve npm "cannot publish over previously published versions" error.

## [2.0.0] - 2026-06-13

### Removed

- **BREAKING**: Vue 3 SFC components are no longer exported from the main entry. Import from `@luanlu/mk-motion/vue` instead.
- **BREAKING**: Legacy imperative DOM API (`createButton`, `createDialog`, `message`, etc.) are no longer exported from the main entry. Import from `@luanlu/mk-motion/legacy` instead.
- **BREAKING**: The main entry no longer imports CSS as a side effect. Import `@luanlu/mk-motion/css` explicitly.

### Added

- New subpath export `@luanlu/mk-motion/legacy` for the deprecated imperative DOM API.
- New `MIGRATION.md` guide for upgrading from v1.x to v2.0.0.

### Changed

- The main entry `@luanlu/mk-motion` now only exports the modern animation and interaction API.
- Update `README.md` examples to use `@luanlu/mk-motion/legacy` for imperative DOM API.
- Update `API_STABILITY` metadata so legacy APIs point to the `./legacy` import path.

## [Unreleased]

### Added

- Add `@luanlu/mk-motion/stability` subpath export for API stability metadata.
- Add `sideEffects: ["*.css"]` to enable JS tree-shaking while preserving CSS side effects.
- Add `typecheck` script for `tsc --noEmit` validation.
- Add test coverage support with `@vitest/coverage-v8`.

### Changed

- Set `vue` as external in main build to reduce bundle size.
- Extract shared animation exports into `src/animation-barrel.ts` to eliminate duplication between main and motion entries.
- Link `demo-vue` to local package via `file:..` instead of remote npm version.

### Fixed

- Fix duplicate CSS `@keyframes` names between `animations.css` and `element-plus.css`.
- Fix composables API mismatch in `useMkLoading` and `useMkMessage` for Vue demo.
- Fix TypeScript module declaration for `@luanlu/mk-motion/css` side-effect import.

## [1.2.5] - 2026-06-12

### Changed

- Improve input component custom sizing support.

## [1.2.4] - 2026-06-12

### Changed

- Maintenance release with version bump.

## [1.2.3] - 2026-06-12

### Added

- Add CD pipeline trigger for automated npm publish and docs deployment.

## [1.2.2] - 2026-06-11

### Added

- Add `@luanlu/mk-motion/motion` as a lightweight animation and interaction entry.
- Add `LICENSE` to the published package.
- Add release check scripts for tests, builds, docs build, and package dry-run.

### Changed

- Recommend the lightweight motion entry for animation and drag-sort usage in README.
- Narrow npm package contents to built assets and release metadata.
- Move development-only build/demo dependencies out of runtime dependencies.
- Consolidate package styles through a single source style entry.

### Fixed

- Fix docs build resolution for package subpath imports.
- Exclude test declarations and source test files from the published package.
- Make `ThemeManager` safe to import in SSR/Node environments.
- Silence jsdom canvas test noise with a test setup mock.

## [1.2.1] - 2026-06-07

### Added

- `DraggableList` release animation: ghost fly-to-target via `releaseToPlaceholder`
- `flipGrid` / `filterGrid` / `shuffleGrid` / `sortGrid` FLIP grid API
- `CoverFlow` 3D cover flow component
- `FlipCard` card flip component
- `magnetic` / `magneticText` cursor-follow effects
- `cursorTrail` cursor trail effect
- `WaveText` wave text animation
- `glitch` / `glitchLoop` glitch effects
- `TextSplit` text splitting animation
- `particleBurst` / `particleAt` particle effects
- `blurReveal` / `blurRevealChildren` blur reveal transitions
- `shimmer` / `skeleton` shimmer loading effects
- `parallax` / `parallaxGroup` parallax scroll effects
- `lazyImage` / `lazyImages` lazy image transitions
- `pageTransition` / `createPageTransitionRouter` page transition system
- `toast` / `toastSuccess` / `toastError` / `toastWarning` / `notify` toast notifications
- `showLoading` / `fullscreenLoading` loading overlays
- `expand` / `collapse` / `toggleCollapse` collapse transitions
- `listStagger` staggered list animation
- `FocusTrap` accessibility focus trap
- `onKey` / `Keys` keyboard shortcut helpers
- `setupMkMotionDevTools` devtools integration
- `theme` / `ThemeManager` runtime theme system
- `useMkTheme` Vue 3 composable for dark mode toggle
- 50+ Vue 3 SFC components rewritten in `<script setup>` declarative syntax
- Vite plugin `mkMotion` for auto-import of Vue components
- Nuxt 3 module for zero-config integration
- `MkMotionResolver` for `unplugin-vue-components`
- Command-line DevTools inspector panel

### Changed

- Spring engine: reduced default stiffness/damping for smoother animation
- Spring engine: fixed `getCurrentValue` transform parsing
- Spring engine: WeakMap-based animation conflict protection
- `DraggableList`: replaced WAAPI FLIP sibling animation with ghost fly-to-target
- `DraggableList`: mirror rendered in fixed-position drag layer (z-index: 2147483647)
- FLIP core: hidden/visible toggles now use opacity instead of scale(0) → scale(1)
- All 50+ Vue SFC components migrated to `<script setup>` declarative API

### Fixed

- `DraggableList` ghost animation: fixed `getBoundingClientRect()` returning all-zeros when element is `display:none`
- Grid emoji offset: docs use `display='flex'` instead of empty string

## [1.1.0] - 2026-05

### Added

- Spring engine (`springTo`, `springFromTo`, `springStagger`, `springSequence`, `springParallel`)
- FLIP animation system (`flip`, `staggerFlip`)
- `Animator` declarative animation controller (WAAPI + CSS presets)
- `Timeline` animation timeline with seek/label support
- CSS preset animations: `fadeIn/Out`, `slideIn/Out`, `zoomIn/Out`, `bounceIn/Out`, `flipInX/Y`, `shake`, `pulse`, `rotateIn`
- `ScrollTrigger` / `scrollAnimate` scroll-driven animation
- `Typewriter` / `typewrite` typewriter text effect
- `CountUp` / `countUp` number counting animation
- `DraggableList` drag-and-drop sort
- `Draggable` generic drag interaction
- `SwipeRecognizer`, `PinchRecognizer`, `TapRecognizer` gesture recognizers
- `spring`, `elasticScale`, `elasticMove` gesture spring effects
- `rippleEffect` / `addRipple` material ripple
- `hoverLift` / `hoverGlow` micro-interaction effects
- `withMotion` / `staggerEnter` declarative component motion
- `springOverlay`, `springHover`, `springPress` component spring effects
- Legacy imperative DOM API (command-style component creation)

## [1.0.0] - 2026-04

### Added

- Initial release
- Vue 3 component system with basic components
- CSS variable-based theme system with Design Tokens
- Dark mode support
- TypeScript type definitions
- ESM + UMD dual format build

[2.0.12]: https://github.com/luanluuu/mk-motion/releases/tag/v2.0.12
[2.0.2]: https://github.com/luanluuu/mk-motion/releases/tag/v2.0.2
[2.0.1]: https://github.com/luanluuu/mk-motion/releases/tag/v2.0.1
[2.0.0]: https://github.com/luanluuu/mk-motion/releases/tag/v2.0.0
[1.2.2]: https://github.com/luanluuu/mk-motion/releases/tag/v1.2.2
[1.2.1]: https://github.com/luanluuu/mk-motion/releases/tag/v1.2.1
[1.1.0]: https://github.com/luanluuu/mk-motion/releases/tag/v1.1.0
[1.0.0]: https://github.com/luanluuu/mk-motion/releases/tag/v1.0.0
