import { onMounted, onUnmounted, type Ref } from 'vue'

export function useClickOutside(
  elementRef: Ref<HTMLElement | null | undefined>,
  handler: (event: MouseEvent) => void,
  options: { ignore?: Ref<HTMLElement | null | undefined>[] } = {}
) {
  const listener = (event: MouseEvent) => {
    const el = elementRef.value
    if (!el) return
    const target = event.target as Node
    if (el.contains(target)) return
    if (options.ignore?.some((ref) => ref.value && ref.value.contains(target)))
      return
    handler(event)
  }

  onMounted(() => {
    document.addEventListener('click', listener, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', listener, true)
  })
}
