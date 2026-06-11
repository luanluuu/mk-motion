import { flip, type FlipOptions } from './flip.js'
import type { SpringOptions } from '../core/spring-engine.js'

export interface FlipGridOptions extends FlipOptions {
  /** Grid item selector */
  itemSelector?: string
}

/**
 * Animate grid layout changes (filter, sort, resize) with FLIP.
 */
export function flipGrid(
  container: HTMLElement | string,
  changeFn: () => void,
  options: FlipGridOptions = {}
): Promise<void> {
  const opts: FlipOptions = {
    selector: options.itemSelector || '> *',
    ...options,
  }
  return flip(container, changeFn, opts)
}

/**
 * Filter grid items with FLIP animation.
 *
 * Supports two signatures:
 *   filterGrid(container, itemSelector, changeFn, options?)
 *   filterGrid(container, predicate, options?)
 */
export function filterGrid(
  container: HTMLElement | string,
  itemSelectorOrPredicate: string | ((el: HTMLElement) => boolean),
  changeFnOrOptions?: (() => void) | FlipGridOptions,
  maybeOptions?: FlipGridOptions
): Promise<void> {
  const el = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)!
    : container

  // New signature: filterGrid(container, itemSelector, changeFn, options)
  if (typeof itemSelectorOrPredicate === 'string') {
    const itemSelector = itemSelectorOrPredicate
    const changeFn = typeof changeFnOrOptions === 'function' ? changeFnOrOptions : () => {}
    const options = maybeOptions || {}
    return flipGrid(el, () => {
      changeFn()
    }, { ...options, itemSelector })
  }

  // Legacy signature: filterGrid(container, predicate, options)
  const predicate = itemSelectorOrPredicate
  const options = (changeFnOrOptions as FlipGridOptions) || {}
  return flipGrid(el, () => {
    const items = Array.from(el.querySelectorAll(options.itemSelector || '> *')) as HTMLElement[]
    items.forEach((item) => {
      item.style.display = predicate(item) ? '' : 'none'
    })
  }, options)
}

/**
 * Sort grid items with FLIP animation.
 */
export function sortGrid(
  container: HTMLElement | string,
  compareFn: (a: HTMLElement, b: HTMLElement) => number,
  options: FlipGridOptions = {}
): Promise<void> {
  const el = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)!
    : container

  return flipGrid(el, () => {
    const items = Array.from(el.children) as HTMLElement[]
    items.sort(compareFn)
    items.forEach((item) => el.appendChild(item))
  }, options)
}

export interface ShuffleGridOptions extends FlipGridOptions {
  spring?: SpringOptions
  onComplete?: () => void
}

/**
 * Shuffle grid items with FLIP animation.
 *
 * Supports two signatures:
 *   shuffleGrid(container, itemSelector, options?)
 *   shuffleGrid(container, options?)
 */
export function shuffleGrid(
  container: HTMLElement | string,
  itemSelectorOrOptions?: string | ShuffleGridOptions,
  maybeOptions?: ShuffleGridOptions
): Promise<void> {
  const el = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)!
    : container

  let itemSelector: string | undefined
  let options: ShuffleGridOptions = {}

  if (typeof itemSelectorOrOptions === 'string') {
    itemSelector = itemSelectorOrOptions
    options = maybeOptions || {}
  } else {
    options = itemSelectorOrOptions || {}
    itemSelector = options.itemSelector
  }

  const selector = itemSelector || '> *'

  return flipGrid(el, () => {
    const items = Array.from(el.querySelectorAll(selector)) as HTMLElement[]
    // Fisher-Yates shuffle using insertBefore to reorder DOM
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      // Swap positions in DOM
      if (j !== i) {
        const ref = items[i].nextSibling
        el.insertBefore(items[i], items[j])
        el.insertBefore(items[j], ref)
        // Update array to reflect new order
        ;[items[i], items[j]] = [items[j], items[i]]
      }
    }
  }, { ...options, itemSelector: selector })
}
