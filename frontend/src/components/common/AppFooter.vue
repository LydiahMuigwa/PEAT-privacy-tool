<template>
  <footer class="border-t border-gray-200/80 dark:border-gray-800/80 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
    <div class="max-w-4xl mx-auto px-4 py-12">
      
      <!-- Enhanced grid layout -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Brand section with consistent styling -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="relative">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div class="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl blur opacity-20"></div>
            </div>
            <span class="font-semibold text-gray-900 dark:text-white">PEAT</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Privacy analysis tool for comprehensive digital footprint discovery and protection.
          </p>
        </div>

        <!-- Features with enhanced styling -->
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div class="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            Features
          </h3>
          <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Breach monitoring
            </li>
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              Username tracking
            </li>
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
              AI risk analysis
            </li>
          </ul>
        </div>

        <!-- Security with enhanced styling -->
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div class="w-1 h-4 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
            Security
          </h3>
          <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              Zero data storage
            </li>
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Session-based processing
            </li>
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              Enterprise-grade security
            </li>
          </ul>
        </div>
      </div>

      <!-- Enhanced bottom section -->
      <div class="border-t border-gray-200/60 dark:border-gray-700/60 pt-8 mt-12">
        <div class="text-center space-y-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            © 2025 PEAT Privacy Analysis Tool
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            Developed by Lydiah Muigwa
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// No props or logic needed - this is purely presentational
</script>