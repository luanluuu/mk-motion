import { ref, type Ref } from 'vue'

export interface DropdownPosition {
  top: number
  left: number
  width: number
}

export function useDropdownPosition(
  triggerRef: Ref<HTMLElement | null | undefined>,
  dropdownRef: Ref<HTMLElement | null | undefined>,
  offset = 4
) {
  const position = ref<DropdownPosition>({ top: 0, left: 0, width: 0 })

  const update = () => {
    const trigger = triggerRef.value
    const dropdown = dropdownRef.value
    if (!trigger || !dropdown) return

    const rect = trigger.getBoundingClientRect()
    const scrollX = window.scrollX ?? 0
    const scrollY = window.scrollY ?? 0

    let top = rect.bottom + scrollY + offset
    let left = rect.left + scrollX
    let width = rect.width

    // Basic boundary check
    const padding = 8
    if (left < padding) left = padding
    if (left + width > window.innerWidth - padding) {
      left = Math.max(padding, window.innerWidth - width - padding)
    }
    if (top + dropdown.offsetHeight > window.innerHeight + scrollY - padding) {
      top = rect.top + scrollY - dropdown.offsetHeight - offset
    }
    if (top < scrollY + padding) top = scrollY + padding

    position.value = { top, left, width }
  }

  return { position, update }
}
