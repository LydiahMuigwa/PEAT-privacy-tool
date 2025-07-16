<template>
  <header class="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/80 dark:border-gray-800/80 shadow-sm">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        
        <!-- Enhanced logo with consistent styling -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <!-- Subtle glow effect -->
            <div class="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl blur opacity-20"></div>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">PEAT</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Privacy Analysis</p>
          </div>
        </div>

        <!-- Enhanced theme toggle -->
        <button 
          @click="toggleDark"
          class="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 group"
          aria-label="Toggle theme"
        >
          <svg v-if="isDark" class="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-amber-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
          </svg>
          <svg v-else class="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useTheme } from '@/composables/theme.js'

const { isDark, toggleDark } = useTheme()
</script>