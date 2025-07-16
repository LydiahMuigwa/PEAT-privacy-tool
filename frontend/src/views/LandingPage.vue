<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    
    <!-- Header -->
    <AppHeader />

    <main class="pt-20 pb-8 px-4">
      <div class="max-w-2xl mx-auto space-y-8">
        
        <!-- Clean hero -->
        <div class="text-center space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Research Project
          </div>
          
          <div class="space-y-3">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Check Your Privacy Footprint
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              See what data attackers can find about you online. 
              <span class="font-semibold">Get your privacy report in 2 minutes.</span>
            </p>
          </div>
        </div>

        <!-- Simple trust indicators -->
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div class="text-xs font-medium text-gray-900 dark:text-white">Secure</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">No passwords</div>
          </div>
          
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="text-xs font-medium text-gray-900 dark:text-white">Fast</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">2 minutes</div>
          </div>
          
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"></path>
              </svg>
            </div>
            <div class="text-xs font-medium text-gray-900 dark:text-white">Private</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Auto-delete</div>
          </div>
        </div>

        <!-- Consent section -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">Research Consent</h3>

            </div>
          </div>
          
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">
            This analysis is part of academic research on privacy awareness. 
            After your scan, you can help by taking an optional 2-minute survey.
          </p>
          
          <!-- Consent checkbox -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label class="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="consentGiven" 
                class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
              />
              <div class="flex-1">
                <span class="font-medium text-gray-900 dark:text-white">I agree to participate</span>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  I understand this will analyze my public data for research. I can opt out anytime.
                </p>
              </div>
            </label>
          </div>
          
          <!-- Error message -->
          <div v-if="showWarning" class="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div class="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"></path>
              </svg>
              Please accept the consent to continue
            </div>
          </div>
        </div>

        <!-- CTA button -->
        <div class="space-y-4">
          <button
            @click="startScan"
            :disabled="!consentGiven"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            <div class="flex items-center justify-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span>Start Privacy Scan</span>
            </div>
          </button>
          
          <!-- Quick benefits -->
          <div class="flex justify-center items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>No signup</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Free report</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Secure</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Desktop features section -->
      <div class="hidden md:block max-w-4xl mx-auto mt-16">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">What PEAT Analyzes</h2>
            <p class="text-gray-600 dark:text-gray-300">Advanced privacy scanning techniques</p>
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Data Breaches</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">Check if your email appears in known breaches</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Social Profiles</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">Find your profiles across 300+ platforms</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Risk Analysis</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">AI-powered privacy risk assessment</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Recommendations</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">Actionable steps to improve privacy</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer - Desktop Only -->
        <div class="mt-16">
          <AppFooter />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/theme.js'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const router = useRouter()
const { isDark } = useTheme()
const consentGiven = ref(false)
const showWarning = ref(false)

const startScan = () => {
  if (!consentGiven.value) {
    showWarning.value = true
    setTimeout(() => showWarning.value = false, 3000)
    return
  }

  // Navigate to footprint page without any email pre-fill
  router.push('/footprint')
}
</script>