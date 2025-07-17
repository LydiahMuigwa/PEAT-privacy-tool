<template>
  <div class="group">
    <!-- Sophisticated header with status indicator -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="relative">
          <div :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/10',
            breaches.length 
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'
          ]">
            <svg v-if="breaches.length" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div :class="[
            'absolute -inset-1 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300',
            breaches.length 
              ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          ]"></div>
        </div>
        
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Data Breaches
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
            <span :class="[
              'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
              breaches.length 
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            ]">
              {{ breaches.length }}
            </span>
            {{ breaches.length 
              ? `Found in ${breaches.length} breach${breaches.length !== 1 ? 'es' : ''}` 
              : 'No breaches detected' 
            }}
          </p>
        </div>
      </div>
      
      <!-- Sophisticated download menu -->
      <div v-if="breaches.length" class="relative">
        <button
          @click="showDownloadMenu = !showDownloadMenu"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/80 dark:border-gray-700/80 hover:border-gray-300/80 dark:hover:border-gray-600/80 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3"></path>
          </svg>
          <span>Export</span>
          <svg :class="['w-3 h-3 transition-transform duration-200', showDownloadMenu ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <div v-if="showDownloadMenu" class="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-xl z-10">
          <div class="py-1">
            <button
              @click="$emit('download-text'); showDownloadMenu = false"
              class="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Download as Text</span>
            </button>
            <button
              @click="$emit('download-pdf'); showDownloadMenu = false"
              class="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L13.293 3.293A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              <span>Download as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Elegant breach list with improved spacing -->
    <div v-if="breaches.length" class="space-y-3">
      <div
        v-for="(breach, i) in displayedBreaches"
        :key="i"
        class="group/item relative overflow-hidden"
      >
        <div class="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/80 dark:border-gray-700/80 transition-all duration-300">
          <!-- Enhanced left accent bar -->
          <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 to-orange-600 rounded-r-full"></div>
          
          <div class="flex items-start justify-between gap-6 ml-4">
            <div class="min-w-0 flex-1">
              <div class="mb-3">
                <h3 class="font-semibold text-gray-900 dark:text-white text-lg transition-colors">
                  {{ breach.title }}
                </h3>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 9v2m-6 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                  </svg>
                  <span class="font-medium">{{ breach.breachDate }}</span>
                </div>
                
                <!-- Enhanced exposed data section with clear labeling -->
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span class="font-medium text-gray-900 dark:text-white">Exposed Data:</span>
                  </div>
                  <div class="ml-6">
                    <span class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ formatDataClasses(breach.dataClasses) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Enhanced details button -->
            <button
              @click="$emit('view-details', breach)"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0"
            >
              <span>Details</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Enhanced show more button -->
      <div v-if="breaches.length > 5" class="pt-4">
        <button
          @click="showAllBreaches = !showAllBreaches"
          class="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-50/50 dark:bg-amber-900/20 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 rounded-xl border border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300/70 dark:hover:border-amber-600/70 transition-all duration-200"
        >
          <svg :class="['w-4 h-4 transition-transform duration-200', showAllBreaches ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          <span>{{ showAllBreaches ? 'Show fewer breaches' : `Show all ${breaches.length} breaches` }}</span>
        </button>
      </div>
    </div>

    <!-- Enhanced no breaches state -->
    <div v-else class="text-center py-16">
      <div class="relative inline-flex items-center justify-center w-20 h-20 mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/10">
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="absolute -inset-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur opacity-20 animate-pulse"></div>
      </div>
      
      <h3 class="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-3">Looking Good!</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-4">
        Your email wasn't found in any known data breaches in our database.
      </p>
      
      <!-- Educational disclaimer -->
      <div class="inline-flex items-start gap-3 px-4 py-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 max-w-lg mx-auto">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="text-left">
          <p class="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Keep in mind:</p>
          <p class="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
            This reflects publicly reported breaches only. New breaches are discovered regularly, so consider checking back periodically.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  breaches: {
    type: Array,
    required: true,
    default: () => []
  }
})

defineEmits(['download-text', 'download-pdf', 'view-details'])

const showDownloadMenu = ref(false)
const showAllBreaches = ref(false)

const displayedBreaches = computed(() => {
  if (showAllBreaches.value || props.breaches.length <= 5) {
    return props.breaches
  }
  return props.breaches.slice(0, 5)
})

const formatDataClasses = (dataClasses) => {
  if (!dataClasses || dataClasses.length === 0) {
    return 'Data types not specified'
  }
  
  const formatted = dataClasses
    .slice(0, 3)
    .map(dc => String(dc).replace(/[<>]/g, '').split('.').pop().replace(/([A-Z])/g, ' $1').trim())
    .join(', ')
  
  return dataClasses.length > 3 ? `${formatted} and more` : formatted
}
</script>