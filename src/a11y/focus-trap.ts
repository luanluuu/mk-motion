/**
 * Focus trap for modals, drawers, and popovers.
 * Keeps keyboard focus within a given container.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export class FocusTrap {
  private container: HTMLElement
  private previousActiveElement: Element | null = null
  private listeners: Array<() => void> = []

  constructor(container: HTMLElement) {
    this.container = container
  }

  activate(initialFocus?: HTMLElement): void {
    this.previousActiveElement = document.activeElement
    const focusable = this.getFocusableElements()
    const toFocus = initialFocus || (focusable.length > 0 ? focusable[0] : null)
    if (toFocus instanceof HTMLElement) {
      toFocus.focus()
    }

    const handler = (e: KeyboardEvent) => this.handleKeyDown(e)
    this.container.addEventListener('keydown', handler)
    this.listeners.push(() => this.container.removeEventListener('keydown', handler))
  }

  deactivate(): void {
    this.listeners.forEach((remove) => remove())
    this.listeners = []
    if (this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus()
    }
  }

  private getFocusableElements(): NodeListOf<HTMLElement> {
    return this.container.querySelectorAll(FOCUSABLE_SELECTOR)
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return
    const focusable = Array.from(this.getFocusableElements())
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
