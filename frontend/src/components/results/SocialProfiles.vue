<template>
  <div class="group">
    <!-- Sophisticated header with subtle gradient accent -->
    <div class="flex items-center gap-4 mb-6">
      <div class="relative">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <div class="absolute -inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
      </div>
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ isUsernameSearch ? 'Public Profiles Found' : 'Social Media Profiles' }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
            {{ profiles.length }}
          </span>
          {{ isUsernameSearch ? 'platforms using this username' : `public profile${profiles.length !== 1 ? 's' : ''} discovered` }}
        </p>
      </div>
    </div>

    <!-- Elegant scanning indicator - only show for partial results -->
    <div v-if="isPartial" class="mb-6">
      <div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
        <div class="relative">
          <svg class="animate-spin w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
          {{ isUsernameSearch ? 'Scanning additional platforms for this username...' : 'Scanning additional platforms...' }}
        </span>
      </div>
    </div>

    <!-- Success message for username searches with no results -->
    <div v-if="isUsernameSearch && profiles.length === 0" class="text-center py-8">
      <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Great Privacy!</h3>
      <p class="text-gray-600 dark:text-gray-400">No public profiles found with this username. Your privacy footprint is minimal.</p>
    </div>

    <!-- Sophisticated profile list -->
    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <div 
        v-for="(profile, i) in profiles" 
        :key="i" 
        class="group/item relative overflow-hidden"
      >
        <!-- Subtle hover glow effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
        
        <div class="relative flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/80 dark:border-gray-700/80 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <!-- Platform icon with elegant styling -->
            <div class="relative">
              <div class="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center shadow-sm group-hover/item:shadow-md transition-shadow">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
              </div>
              <!-- Subtle pulse ring on hover -->
              <div class="absolute inset-0 w-10 h-10 bg-blue-500/20 rounded-lg opacity-0 group-hover/item:opacity-100 group-hover/item:animate-ping transition-opacity"></div>
            </div>
            
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                {{ profile.platform }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-mono break-all mt-1">
                {{ extractURL(profile.url) }}
              </p>
            </div>
          </div>
          
          <!-- Elegant CTA button -->
          <a
            :href="extractCleanURL(profile.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="group/btn inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0"
          >
            <span class="group-hover/btn:scale-95 transition-transform duration-150">View</span>
            <svg class="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  profiles: {
    type: Array,
    required: true,
    default: () => []
  },
  isPartial: {
    type: Boolean,
    default: false
  },
  isUsernameSearch: {
    type: Boolean,
    default: false
  }
})

// Utility function to extract URL domain for display
const extractURL = (url) => {
  try {
    const cleanUrl = extractCleanURL(url)
    const urlObj = new URL(cleanUrl)
    return urlObj.hostname + urlObj.pathname
  } catch (e) {
    return url
  }
}

// Utility function to extract clean URL from descriptive text
const extractCleanURL = (urlText) => {
  if (!urlText) return '#'
  
  // Look for HTTP/HTTPS URLs in the text
  const urlMatch = urlText.match(/(https?:\/\/[^\s]+)/i)
  if (urlMatch) {
    return urlMatch[1]
  }
  
  // If no protocol found, try to extract domain and add https
  const domainMatch = urlText.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/i)
  if (domainMatch) {
    return `https://${domainMatch[1]}`
  }
  
  return '#'
}
</script>