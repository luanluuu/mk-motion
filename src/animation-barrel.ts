/* ===== Core ===== */
export { Animator } from './core/animator.ts'
export { Timeline } from './core/timeline.ts'
export {
  SpringValue,
  SpringAnimation,
  springTo,
  springFromTo,
  springStagger,
  springSequence,
  springParallel,
} from './core/spring-engine.ts'
export type {
  SpringOptions,
  SpringProperties,
  StaggerOptions,
  SpringSequenceStep,
} from './core/spring-engine.ts'
export type { AnimationName, AnimationOptions } from './core/utils.ts'

/* ===== Presets ===== */
export {
  fadeIn,
  fadeOut,
  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideOutUp,
  slideOutDown,
  zoomIn,
  zoomOut,
  bounceIn,
  bounceOut,
  flipInX,
  flipInY,
  shake,
  pulse,
  rotateIn,
} from './presets/index.ts'
export * as presets from './presets/index.ts'

/* ===== Scroll ===== */
export { ScrollTrigger, scrollAnimate } from './scroll/scroll-trigger.ts'
export type { ScrollTriggerOptions } from './scroll/scroll-trigger.ts'

/* ===== Text ===== */
export { Typewriter, typewrite } from './text/typewriter.ts'
export { CountUp, countUp } from './text/count-up.ts'
export type { TypewriterOptions } from './text/typewriter.ts'
export type { CountUpOptions } from './text/count-up.ts'

/* ===== Gesture ===== */
export { spring, elasticScale, elasticMove } from './gesture/spring.ts'
export { Draggable } from './gesture/draggable.ts'
export { SwipeRecognizer } from './gesture/swipe.ts'
export { PinchRecognizer } from './gesture/pinch.ts'
export { TapRecognizer } from './gesture/tap.ts'
export type { SpringTarget } from './gesture/spring.ts'
export type { DraggableOptions } from './gesture/draggable.ts'
export type { SwipeOptions } from './gesture/swipe.ts'
export type { PinchOptions } from './gesture/pinch.ts'
export type { TapOptions } from './gesture/tap.ts'

/* ===== Micro ===== */
export { addRipple, rippleEffect } from './micro/ripple.ts'
export { hoverLift, hoverGlow } from './micro/hover-lift.ts'
export type { RippleOptions } from './micro/ripple.ts'
export type { HoverLiftOptions } from './micro/hover-lift.ts'

/* ===== Effects ===== */
export { particleBurst, particleAt } from './effects/particle.ts'
export { TextSplit, splitText } from './effects/text-split.ts'
export { glitch, glitchLoop } from './effects/glitch.ts'
export { WaveText, waveText } from './effects/wave-text.ts'
export type { ParticleOptions } from './effects/particle.ts'
export type { TextSplitOptions } from './effects/text-split.ts'
export type { GlitchOptions } from './effects/glitch.ts'
export type { WaveTextOptions } from './effects/wave-text.ts'

/* ===== Transitions ===== */
export { parallax, parallaxGroup } from './transitions/parallax.ts'
export { shimmer, skeleton } from './transitions/shimmer.ts'
export { blurReveal, blurRevealChildren } from './transitions/blur-reveal.ts'
export { lazyImage, lazyImages } from './transitions/lazy-image.ts'
export type { ParallaxOptions } from './transitions/parallax.ts'
export type { ShimmerOptions } from './transitions/shimmer.ts'
export type { BlurRevealOptions } from './transitions/blur-reveal.ts'
export type { LazyImageOptions } from './transitions/lazy-image.ts'
export { expand, collapse, toggleCollapse } from './transitions/collapse.ts'
export { listStagger } from './transitions/list.ts'
export { showLoading, fullscreenLoading } from './transitions/loading.ts'
export {
  toast,
  toastSuccess,
  toastError,
  toastWarning,
  notify,
} from './transitions/toast.ts'
export type { CollapseOptions } from './transitions/collapse.ts'
export type { ListStaggerOptions } from './transitions/list.ts'
export type { LoadingOptions } from './transitions/loading.ts'
export type { ToastOptions } from './transitions/toast.ts'
export {
  pageTransition,
  createPageTransitionRouter,
} from './transitions/page-transition.ts'
export type { PageTransitionOptions } from './transitions/page-transition.ts'

/* ===== Interactive ===== */
export { magnetic, magneticText } from './interactive/magnetic.ts'
export { CoverFlow, createCoverFlow } from './interactive/coverflow.ts'
export { FlipCard, createFlipCard } from './interactive/flip-card.ts'
export { cursorTrail } from './interactive/cursor-trail.ts'
export {
  DraggableList,
  createDraggableList,
} from './interactive/draggable-list.ts'
export type { MagneticOptions } from './interactive/magnetic.ts'
export type { CoverFlowOptions } from './interactive/coverflow.ts'
export type { FlipCardOptions } from './interactive/flip-card.ts'
export type { CursorTrailOptions } from './interactive/cursor-trail.ts'
export type { DraggableListOptions } from './interactive/draggable-list.ts'

/* ===== Motion System ===== */
export { withMotion, staggerEnter } from './motion/component-motion.ts'
export {
  springOverlay,
  springHover,
  springPress,
} from './motion/component-spring.ts'
export { flip, staggerFlip } from './motion/flip.ts'
export {
  flipGrid,
  filterGrid,
  sortGrid,
  shuffleGrid,
} from './motion/flip-grid.ts'
export type {
  MotionOptions,
  MicroAnimation,
} from './motion/component-motion.ts'
export type { ComponentSpringOptions } from './motion/component-spring.ts'
export type { FlipOptions } from './motion/flip.ts'
export type { FlipGridOptions, ShuffleGridOptions } from './motion/flip-grid.ts'

/* ===== A11y ===== */
export { FocusTrap } from './a11y/focus-trap.ts'
export { onKey, Keys } from './a11y/keyboard.ts'

/* ===== DevTools ===== */
export { setupMkMotionDevTools } from './devtools/plugin.ts'

/* ===== Theme ===== */
export { theme, ThemeManager } from './theme/theme.ts'
