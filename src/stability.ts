/**
 * API Stability Levels
 *
 * This file declares the stability level of every public API in mk-motion.
 * Levels follow the project's stability policy:
 *
 *   @stable     – Backward-compatible within the same major version.
 *                 Breaking changes require a major version bump.
 *   @experimental – API may change in minor/patch releases.
 *                    Use is encouraged but pin your version.
 *   @legacy     – Deprecated imperative DOM API. Kept for compatibility.
 *                 No new features. Will be removed in a future major version.
 *
 * Last updated: 2026-06-07
 */

export type StabilityLevel = 'stable' | 'experimental' | 'legacy'

export interface StabilityEntry {
  name: string
  level: StabilityLevel
  /** Import path relative to the package root */
  importPath: string
  /** Brief one-line description */
  description: string
}

export const API_STABILITY: StabilityEntry[] = [
  // ============================================================
  // @stable — Core Animation Engine
  // ============================================================

  { name: 'Animator',              level: 'stable', importPath: '.', description: 'Declarative animation controller' },
  { name: 'Timeline',              level: 'stable', importPath: '.', description: 'Animation timeline with seek/label' },
  { name: 'SpringValue',           level: 'stable', importPath: '.', description: 'Spring physics value driver' },
  { name: 'SpringAnimation',       level: 'stable', importPath: '.', description: 'Spring animation instance' },
  { name: 'springTo',              level: 'stable', importPath: '.', description: 'Single-element spring animation' },
  { name: 'springFromTo',          level: 'stable', importPath: '.', description: 'Spring with explicit from/to values' },
  { name: 'springStagger',         level: 'stable', importPath: '.', description: 'Staggered spring animation batch' },
  { name: 'springSequence',        level: 'stable', importPath: '.', description: 'Sequential spring animation chain' },
  { name: 'springParallel',        level: 'stable', importPath: '.', description: 'Parallel spring animation group' },
  { name: 'flip',                  level: 'stable', importPath: '.', description: 'FLIP layout animation' },
  { name: 'staggerFlip',           level: 'stable', importPath: '.', description: 'Staggered FLIP animation' },
  { name: 'flipGrid',              level: 'experimental', importPath: '.', description: 'Grid FLIP animation' },
  { name: 'filterGrid',            level: 'experimental', importPath: '.', description: 'Filter + FLIP grid' },
  { name: 'sortGrid',              level: 'experimental', importPath: '.', description: 'Sort + FLIP grid' },
  { name: 'shuffleGrid',           level: 'experimental', importPath: '.', description: 'Shuffle + FLIP grid' },

  // ============================================================
  // @stable — CSS Presets
  // ============================================================

  { name: 'fadeIn',                level: 'stable', importPath: '.', description: 'Fade-in preset' },
  { name: 'fadeOut',               level: 'stable', importPath: '.', description: 'Fade-out preset' },
  { name: 'slideInUp',             level: 'stable', importPath: '.', description: 'Slide-in from bottom' },
  { name: 'slideInDown',           level: 'stable', importPath: '.', description: 'Slide-in from top' },
  { name: 'slideInLeft',           level: 'stable', importPath: '.', description: 'Slide-in from right' },
  { name: 'slideInRight',          level: 'stable', importPath: '.', description: 'Slide-in from left' },
  { name: 'slideOutUp',            level: 'stable', importPath: '.', description: 'Slide-out to top' },
  { name: 'slideOutDown',          level: 'stable', importPath: '.', description: 'Slide-out to bottom' },
  { name: 'zoomIn',                level: 'stable', importPath: '.', description: 'Zoom-in preset' },
  { name: 'zoomOut',               level: 'stable', importPath: '.', description: 'Zoom-out preset' },
  { name: 'bounceIn',              level: 'stable', importPath: '.', description: 'Bounce-in preset' },
  { name: 'bounceOut',             level: 'stable', importPath: '.', description: 'Bounce-out preset' },
  { name: 'flipInX',               level: 'stable', importPath: '.', description: 'Flip-in on X axis' },
  { name: 'flipInY',               level: 'stable', importPath: '.', description: 'Flip-in on Y axis' },
  { name: 'shake',                 level: 'stable', importPath: '.', description: 'Shake effect preset' },
  { name: 'pulse',                 level: 'stable', importPath: '.', description: 'Pulse effect preset' },
  { name: 'rotateIn',              level: 'stable', importPath: '.', description: 'Rotate-in preset' },

  // ============================================================
  // @stable — Scroll & Text
  // ============================================================

  { name: 'ScrollTrigger',         level: 'stable', importPath: '.', description: 'Scroll-driven animation trigger' },
  { name: 'scrollAnimate',         level: 'stable', importPath: '.', description: 'Declarative scroll animation' },
  { name: 'Typewriter',            level: 'stable', importPath: '.', description: 'Typewriter text effect class' },
  { name: 'typewrite',             level: 'stable', importPath: '.', description: 'Typewriter convenience function' },
  { name: 'CountUp',               level: 'stable', importPath: '.', description: 'Number counting animation class' },
  { name: 'countUp',               level: 'stable', importPath: '.', description: 'Count-up convenience function' },

  // ============================================================
  // @stable — Motion System
  // ============================================================

  { name: 'withMotion',            level: 'stable', importPath: '.', description: 'Declarative component entrance animation' },
  { name: 'staggerEnter',          level: 'stable', importPath: '.', description: 'Staggered child entrance animation' },
  { name: 'springOverlay',         level: 'stable', importPath: '.', description: 'Spring-driven overlay animation' },
  { name: 'springHover',           level: 'stable', importPath: '.', description: 'Spring-driven hover effect' },
  { name: 'springPress',           level: 'stable', importPath: '.', description: 'Spring-driven press/tap effect' },

  // ============================================================
  // @stable — Gesture Recognizers
  // ============================================================

  { name: 'Draggable',             level: 'stable', importPath: '.', description: 'Generic drag interaction' },
  { name: 'SwipeRecognizer',       level: 'stable', importPath: '.', description: 'Swipe gesture recognizer' },
  { name: 'PinchRecognizer',       level: 'stable', importPath: '.', description: 'Pinch gesture recognizer' },
  { name: 'TapRecognizer',         level: 'stable', importPath: '.', description: 'Tap/long-press recognizer' },
  { name: 'spring',                level: 'stable', importPath: '.', description: 'Gesture-driven spring physics' },
  { name: 'elasticScale',          level: 'stable', importPath: '.', description: 'Elastic scale on gesture' },
  { name: 'elasticMove',           level: 'stable', importPath: '.', description: 'Elastic move on gesture' },

  // ============================================================
  // @stable — Micro-interactions
  // ============================================================

  { name: 'addRipple',             level: 'stable', importPath: '.', description: 'Material ripple effect' },
  { name: 'rippleEffect',          level: 'stable', importPath: '.', description: 'Ripple effect convenience' },
  { name: 'hoverLift',             level: 'stable', importPath: '.', description: 'Hover lift effect' },
  { name: 'hoverGlow',             level: 'stable', importPath: '.', description: 'Hover glow effect' },

  // ============================================================
  // @stable — A11y & DevTools
  // ============================================================

  { name: 'FocusTrap',             level: 'stable', importPath: '.', description: 'Focus trap for dialogs/modals' },
  { name: 'onKey',                 level: 'stable', importPath: '.', description: 'Keyboard shortcut helper' },
  { name: 'Keys',                  level: 'stable', importPath: '.', description: 'Key name constants' },
  { name: 'setupMkMotionDevTools', level: 'stable', importPath: '.', description: 'DevTools panel setup' },
  { name: 'theme',                 level: 'stable', importPath: '.', description: 'Theme singleton instance' },
  { name: 'ThemeManager',          level: 'stable', importPath: '.', description: 'Theme manager class' },

  // ============================================================
  // @experimental — Interactive Components
  // ============================================================

  { name: 'DraggableList',         level: 'experimental', importPath: '.', description: 'Drag-and-drop sort list' },
  { name: 'createDraggableList',   level: 'experimental', importPath: '.', description: 'DraggableList factory function' },
  { name: 'CoverFlow',             level: 'experimental', importPath: '.', description: '3D cover flow' },
  { name: 'createCoverFlow',       level: 'experimental', importPath: '.', description: 'CoverFlow factory function' },
  { name: 'FlipCard',              level: 'experimental', importPath: '.', description: 'Card flip interaction' },
  { name: 'createFlipCard',        level: 'experimental', importPath: '.', description: 'FlipCard factory function' },
  { name: 'magnetic',              level: 'experimental', importPath: '.', description: 'Magnetic cursor follow' },
  { name: 'magneticText',          level: 'experimental', importPath: '.', description: 'Magnetic text effect' },
  { name: 'cursorTrail',           level: 'experimental', importPath: '.', description: 'Cursor trail effect' },

  // ============================================================
  // @experimental — Visual Effects
  // ============================================================

  { name: 'particleBurst',         level: 'experimental', importPath: '.', description: 'Particle burst at element' },
  { name: 'particleAt',            level: 'experimental', importPath: '.', description: 'Particle burst at coordinates' },
  { name: 'TextSplit',             level: 'experimental', importPath: '.', description: 'Text split animation class' },
  { name: 'splitText',             level: 'experimental', importPath: '.', description: 'Text split convenience' },
  { name: 'glitch',                level: 'experimental', importPath: '.', description: 'Glitch effect' },
  { name: 'glitchLoop',            level: 'experimental', importPath: '.', description: 'Looping glitch effect' },
  { name: 'WaveText',              level: 'experimental', importPath: '.', description: 'Wave text animation class' },
  { name: 'waveText',              level: 'experimental', importPath: '.', description: 'Wave text convenience' },

  // ============================================================
  // @experimental — Transition Helpers
  // ============================================================

  { name: 'parallax',              level: 'experimental', importPath: '.', description: 'Parallax scroll effect' },
  { name: 'parallaxGroup',         level: 'experimental', importPath: '.', description: 'Group parallax effect' },
  { name: 'shimmer',               level: 'experimental', importPath: '.', description: 'Shimmer loading effect' },
  { name: 'skeleton',              level: 'experimental', importPath: '.', description: 'Skeleton screen' },
  { name: 'blurReveal',            level: 'experimental', importPath: '.', description: 'Blur-reveal animation' },
  { name: 'blurRevealChildren',    level: 'experimental', importPath: '.', description: 'Blur-reveal on children' },
  { name: 'lazyImage',             level: 'experimental', importPath: '.', description: 'Lazy image with animation' },
  { name: 'lazyImages',            level: 'experimental', importPath: '.', description: 'Batch lazy images' },
  { name: 'expand',                level: 'experimental', importPath: '.', description: 'Expand transition' },
  { name: 'collapse',              level: 'experimental', importPath: '.', description: 'Collapse transition' },
  { name: 'toggleCollapse',        level: 'experimental', importPath: '.', description: 'Toggle collapse/expand' },
  { name: 'listStagger',           level: 'experimental', importPath: '.', description: 'Staggered list animation' },
  { name: 'showLoading',           level: 'experimental', importPath: '.', description: 'Show loading overlay' },
  { name: 'fullscreenLoading',     level: 'experimental', importPath: '.', description: 'Fullscreen loading' },
  { name: 'toast',                 level: 'experimental', importPath: '.', description: 'Toast notification' },
  { name: 'toastSuccess',          level: 'experimental', importPath: '.', description: 'Success toast' },
  { name: 'toastError',            level: 'experimental', importPath: '.', description: 'Error toast' },
  { name: 'toastWarning',          level: 'experimental', importPath: '.', description: 'Warning toast' },
  { name: 'notify',                level: 'experimental', importPath: '.', description: 'Notification' },
  { name: 'pageTransition',        level: 'experimental', importPath: '.', description: 'Page transition' },
  { name: 'createPageTransitionRouter', level: 'experimental', importPath: '.', description: 'Page transition router factory' },

  // ============================================================
  // @legacy — Imperative DOM API (deprecated)
  // ============================================================

  { name: 'createButton',          level: 'legacy', importPath: '.', description: 'Imperative button creation' },
  { name: 'createInput',           level: 'legacy', importPath: '.', description: 'Imperative input creation' },
  { name: 'createCard',            level: 'legacy', importPath: '.', description: 'Imperative card creation' },
  { name: 'createDialog',          level: 'legacy', importPath: '.', description: 'Imperative dialog creation' },
  { name: 'createDrawer',          level: 'legacy', importPath: '.', description: 'Imperative drawer creation' },
  { name: 'message',               level: 'legacy', importPath: '.', description: 'Imperative message' },
  { name: 'messageSuccess',        level: 'legacy', importPath: '.', description: 'Imperative success message' },
  { name: 'messageError',          level: 'legacy', importPath: '.', description: 'Imperative error message' },
  { name: 'messageWarning',        level: 'legacy', importPath: '.', description: 'Imperative warning message' },
  { name: 'createSwitch',          level: 'legacy', importPath: '.', description: 'Imperative switch creation' },
  { name: 'createSelect',          level: 'legacy', importPath: '.', description: 'Imperative select creation' },
  { name: 'createCheckbox',        level: 'legacy', importPath: '.', description: 'Imperative checkbox creation' },
  { name: 'createTag',             level: 'legacy', importPath: '.', description: 'Imperative tag creation' },
  { name: 'createTabs',            level: 'legacy', importPath: '.', description: 'Imperative tabs creation' },
  { name: 'createTooltip',         level: 'legacy', importPath: '.', description: 'Imperative tooltip creation' },
  { name: 'createAvatar',          level: 'legacy', importPath: '.', description: 'Imperative avatar creation' },
  { name: 'createAlert',           level: 'legacy', importPath: '.', description: 'Imperative alert creation' },
  { name: 'createProgress',        level: 'legacy', importPath: '.', description: 'Imperative progress creation' },
  { name: 'createCollapse',        level: 'legacy', importPath: '.', description: 'Imperative collapse creation' },
  { name: 'createEmpty',           level: 'legacy', importPath: '.', description: 'Imperative empty state creation' },
  { name: 'createPopover',         level: 'legacy', importPath: '.', description: 'Imperative popover creation' },
  { name: 'createMenu',            level: 'legacy', importPath: '.', description: 'Imperative menu creation' },
  { name: 'createBreadcrumb',      level: 'legacy', importPath: '.', description: 'Imperative breadcrumb creation' },
  { name: 'createSteps',           level: 'legacy', importPath: '.', description: 'Imperative steps creation' },
  { name: 'createRow',             level: 'legacy', importPath: '.', description: 'Imperative row creation' },
  { name: 'createSpace',           level: 'legacy', importPath: '.', description: 'Imperative space creation' },
  { name: 'createDivider',         level: 'legacy', importPath: '.', description: 'Imperative divider creation' },
  { name: 'createContainer',       level: 'legacy', importPath: '.', description: 'Imperative container creation' },
  { name: 'createLayout',          level: 'legacy', importPath: '.', description: 'Imperative layout creation' },
  { name: 'createHeader',          level: 'legacy', importPath: '.', description: 'Imperative header creation' },
  { name: 'createAside',           level: 'legacy', importPath: '.', description: 'Imperative aside creation' },
  { name: 'createMain',            level: 'legacy', importPath: '.', description: 'Imperative main creation' },
  { name: 'createFooter',          level: 'legacy', importPath: '.', description: 'Imperative footer creation' },
]
