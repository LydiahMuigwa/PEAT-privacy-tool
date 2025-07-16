// src/composables/theme.js
import { ref, onMounted, watch } from 'vue'

// CHANGE 1: Default to dark mode
const isDark = ref(true)

export function useTheme() {
  const initTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // CHANGE 2: Default to dark mode instead of checking system preference
      isDark.value = true
      // Save the default preference
      localStorage.setItem('theme', 'dark')
    }
    updateHtml()
  }

  const updateHtml = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  const toggleDark = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    updateHtml()
  }

  onMounted(() => {
    initTheme()
  })

  watch(isDark, () => {
    updateHtml()
  })

  return { isDark, toggleDark }
}