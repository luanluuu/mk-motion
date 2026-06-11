/**
 * Keyboard navigation helpers for accessible components.
 */

export interface KeyHandler {
  key: string
  handler: (e: KeyboardEvent) => void
  preventDefault?: boolean
}

/**
 * Attach keyboard handlers to an element.
 * Returns a cleanup function.
 */
export function onKey(el: HTMLElement, handlers: KeyHandler[]): () => void {
  const listener = (e: KeyboardEvent) => {
    for (const h of handlers) {
      if (e.key === h.key) {
        if (h.preventDefault !== false) e.preventDefault()
        h.handler(e)
        return
      }
    }
  }
  el.addEventListener('keydown', listener)
  return () => el.removeEventListener('keydown', listener)
}

/**
 * Common ARIA key patterns.
 */
export const Keys = {
  Enter: 'Enter',
  Escape: 'Escape',
  Tab: 'Tab',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  Space: ' ',
} as const
