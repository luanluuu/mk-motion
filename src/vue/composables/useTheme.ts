import { ref, onMounted } from 'vue'

const isDark = ref(false)

function setDOMTheme(dark: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-mk-theme', dark ? 'dark' : 'light')
  }
}

export function useMkTheme() {
  onMounted(() => {
    setDOMTheme(isDark.value)
  })

  const setTheme = (dark: boolean) => {
    isDark.value = dark
    setDOMTheme(dark)
  }
  const toggle = () => setTheme(!isDark.value)
  return { isDark, setTheme, toggle }
}
