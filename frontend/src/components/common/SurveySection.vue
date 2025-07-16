<template>
  <div class="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/80 dark:border-blue-800/80 shadow-sm">
    
    <!-- Subtle background pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%);"></div>
    </div>
    
    <!-- Enhanced content -->
    <div class="relative text-center space-y-4">
      <div class="flex items-center justify-center gap-3">
        <div class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl blur opacity-25"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Help Advance Privacy Research
        </h3>
      </div>
      
      <p class="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        Your anonymous feedback helps improve PEAT and contributes to cybersecurity research at Kadir Has University. 
        <span class="font-semibold">Takes just 2 minutes.</span>
      </p>
      
      <!-- Enhanced action buttons -->
      <div class="flex flex-col sm:flex-row gap-3 pt-4">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSc1h5axMkmOVUR2fJswKMoWVHnhPnoUC2gLBIGJSo4V03Z3kQ/viewform?usp=dialog"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 text-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
        >
          <span class="group-hover:scale-95 transition-transform duration-150 inline-block">Complete Survey</span>
        </a>
        
        <button
          @click="$emit('reset')"
          class="group flex-1 px-6 py-3 bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border border-gray-300/80 dark:border-gray-600/80 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 font-semibold backdrop-blur-sm shadow-sm hover:shadow-md"
        >
          <span class="group-hover:scale-95 transition-transform duration-150 inline-block">New Analysis</span>
        </button>
      </div>
      
      <!-- Enhanced trust indicators -->
      <div class="flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400 pt-4">
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          Anonymous
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          2 minutes
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          Academic research
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['reset'])
</script>