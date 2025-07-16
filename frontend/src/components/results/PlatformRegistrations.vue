<template>
  <div class="group">
    <!-- Sophisticated header with subtle gradient accent -->
    <div class="flex items-center gap-4 mb-6">
      <div class="relative">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div class="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
      </div>
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Platform Registrations
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
            {{ platforms.length }}
          </span>
          platform{{ platforms.length !== 1 ? 's' : '' }} found
        </p>
      </div>
    </div>
    
    <!-- Elegant platform chips with sophisticated styling -->
    <div class="flex flex-wrap gap-3">
      <span
        v-for="(platform, index) in displayedPlatforms"
        :key="index"
        class="group/chip relative overflow-hidden inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/80 dark:border-gray-700/80 hover:border-emerald-300/50 dark:hover:border-emerald-600/50 shadow-sm hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 cursor-default"
      >
        <!-- Subtle hover glow -->
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover/chip:opacity-100 transition-opacity duration-300"></div>
        
        <!-- Platform name with subtle highlight on hover -->
        <span class="relative z-10 group-hover/chip:text-emerald-600 dark:group-hover/chip:text-emerald-400 transition-colors duration-200">
          {{ platform }}
        </span>
        
        <!-- Subtle pulse ring on hover -->
        <div class="absolute inset-0 bg-emerald-500/20 rounded-xl opacity-0 group-hover/chip:opacity-100 group-hover/chip:animate-ping transition-opacity"></div>
      </span>
    </div>

    <!-- Sophisticated expand/collapse section -->
    <div v-if="platforms.length > 12" class="mt-6 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
      <button 
        @click="showAllPlatforms = !showAllPlatforms"
        class="group/btn inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300/70 dark:hover:border-emerald-600/70 transition-all duration-200"
      >
        <svg 
          :class="['w-4 h-4 transition-transform duration-200', showAllPlatforms ? 'rotate-180' : '']" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
        <span>{{ showAllPlatforms ? 'Show fewer platforms' : `Show all ${platforms.length} platforms` }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  platforms: {
    type: Array,
    required: true,
    default: () => []
  },
  debugId: {
    type: String,
    default: 'unknown'
  }
})

const showAllPlatforms = ref(false)

const displayedPlatforms = computed(() => {
  if (showAllPlatforms.value || props.platforms.length <= 12) {
    return props.platforms
  }
  return props.platforms.slice(0, 12)
})
</script>