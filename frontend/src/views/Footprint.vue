<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    
    <AppHeader />

    <main class="pt-24 pb-8 px-4">
      <div class="max-w-2xl mx-auto space-y-8">
        
        <!-- Clean hero -->
        <div class="text-center space-y-6">
          <div class="space-y-3">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Check Your Privacy Footprint
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              See what data attackers can find about you online in 2 minutes.
            </p>
          </div>
        </div>

        <!-- Consent confirmation badge -->
        <div class="flex justify-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 text-xs font-medium border border-green-200 dark:border-green-800">
            <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Research Consent Confirmed
          </div>
        </div>

        <!-- Simple scan interface -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          
          <!-- Guidance text -->
          <div class="text-center mb-6">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Start with your <strong class="text-gray-900 dark:text-white">email</strong> for breach analysis, 
              or try <strong class="text-gray-900 dark:text-white">username</strong> for social media discovery
            </p>
          </div>

          <!-- Tab selector -->
          <div class="mb-6">
            <div class="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                @click="activeTab = 'email'"
                :class="[
                  'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'email'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                ]"
              >
                📧 Email Analysis
              </button>
              <button
                @click="activeTab = 'username'"
                :class="[
                  'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'username'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                ]"
              >
                👤 Username Search
              </button>
            </div>
          </div>

          <!-- Input field -->
          <div class="space-y-4">
            <input
              v-model="modelValue"
              :type="activeTab === 'email' ? 'email' : 'text'"
              :placeholder="activeTab === 'email' ? 'Enter your email address...' : 'Enter username...'"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            
            <!-- Single CTA button -->
            <button
              @click="runScan"
              :disabled="loading || !modelValue.trim()"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              {{ loading ? 'Analyzing...' : 'Start Privacy Scan' }}
            </button>
          </div>

          <!-- Simple trust indicators -->
          <div class="grid grid-cols-3 gap-4 mt-6 text-center">
            <div class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div class="text-xs">
                <div class="font-medium text-gray-900 dark:text-white">Secure</div>
                <div class="text-gray-500 dark:text-gray-400">No passwords</div>
              </div>
            </div>

            <div class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="text-xs">
                <div class="font-medium text-gray-900 dark:text-white">Fast</div>
                <div class="text-gray-500 dark:text-gray-400">2 minutes</div>
              </div>
            </div>

            <div class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"></path>
                </svg>
              </div>
              <div class="text-xs">
                <div class="font-medium text-gray-900 dark:text-white">Private</div>
                <div class="text-gray-500 dark:text-gray-400">Auto-delete</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state (minimal) -->
        <div v-if="loading" class="text-center space-y-4">
          <div class="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ activeTab === 'email' ? 'Checking breach databases...' : 'Scanning social platforms...' }}</span>
          </div>
          
          <!-- Progress indicator -->
          <div class="max-w-xs mx-auto">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                class="h-1 rounded-full bg-blue-600 transition-all duration-500" 
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">{{ progress.toFixed(0) }}% complete</p>
          </div>
        </div>

        <!-- Results sections -->
        <div v-if="results" class="space-y-8">
          
          <!-- Breach Analysis -->
          <BreachAnalysis 
            v-if="activeTab === 'email'" 
            :breaches="results.breaches || []"
            @download-text="downloadTextClicked"
            @download-pdf="downloadPDFClicked"
            @view-details="handleViewDetails"
          />

          <!-- Platform Registrations -->
          <PlatformRegistrations 
            v-if="results.used_on?.length" 
            :platforms="results.used_on" 
            debug-id="main-footprint"
          />
          
          <!-- Social Profiles -->
          <SocialProfiles 
            v-if="results.sherlock?.length" 
            :profiles="results.sherlock"
            :is-partial="results._meta?.partial && activeTab === 'username'"
            :is-username-search="activeTab === 'username'"
          />
          
          <!-- AI Risk Assessment -->
          <AIRiskAssessment 
            v-if="results.explanation"
            :explanation="results.explanation"
            :results="results"
            :scan-type="activeTab"
          />

          <!-- Survey Section -->
          <SurveySection @reset="resetScan" />
        </div>

        <!-- Breach Details Modal -->
        <div v-if="selectedBreach" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 relative shadow-xl border border-gray-200 dark:border-gray-700">
            
            <!-- Title -->
            <h3 class="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
              {{ selectedBreach.title }}
            </h3>

            <!-- Description -->
            <div class="mb-5">
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-1 font-semibold">Description:</p>
              <div
                v-if="selectedBreach.description && selectedBreach.description !== 'No description available.'"
                v-html="cleanDescription"
                class="text-sm text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed"
              ></div>
              <span v-else class="italic text-sm text-gray-500 dark:text-gray-400">No public description available.</span>
            </div>

            <!-- External Link -->
            <a
              :href="`https://haveibeenpwned.com/breach/${encodeURIComponent(selectedBreach.title)}`"
              class="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 3h7m0 0v7m0-7L10 14"></path>
              </svg>
              View on HIBP →
            </a>

            <!-- Close Button -->
            <button
              @click="selectedBreach = null"
              class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              aria-label="Close"
            >✕</button>
          </div>
        </div>

        <!-- Empty state -->
        <EmptyState v-if="!results && !loading" />

      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DOMPurify from 'dompurify'
import { useTheme } from '@/composables/theme.js'
import { useScan } from '@/composables/useScan.js'
import { useDownload } from '@/composables/useDownload.js'

// Components
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import EmptyState from '@/components/scan/EmptyState.vue'
import SurveySection from '@/components/common/SurveySection.vue'
import PlatformRegistrations from '@/components/results/PlatformRegistrations.vue'
import SocialProfiles from '@/components/results/SocialProfiles.vue'
import BreachAnalysis from '@/components/results/BreachAnalysis.vue'
import AIRiskAssessment from '@/components/results/AIRiskAssessment.vue'

const selectedBreach = ref(null)

const handleViewDetails = (breach) => {
  selectedBreach.value = breach
}

const cleanDescription = computed(() => {
  if (!selectedBreach.value?.description) return ''
  return DOMPurify.sanitize(selectedBreach.value.description)
})

// Composables
const { isDark } = useTheme()

// Scan functionality
const {
  activeTab,
  email,
  username,
  results,
  loading,
  progress,
  runScan,
  cancelScan,
  resetScan
} = useScan()

// Download functionality
const { downloadTextClicked, downloadPDFClicked } = useDownload(activeTab, email, username, results)

// Computed model value
const modelValue = computed({
  get: () => activeTab.value === 'email' ? email.value : username.value,
  set: (val) => {
    if (activeTab.value === 'email') {
      email.value = val
    } else {
      username.value = val
    }
  }
})
</script>