<template>
  <div class="group">
    <!-- Clean, minimal header -->
    <div 
      class="flex items-center justify-between cursor-pointer py-5 px-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ scanType === 'username' ? 'Username Privacy Analysis' : 'AI Privacy Analysis' }}
            </h2>
            <span class="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              AI GENERATED
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ expanded ? 'Hide analysis' : scanType === 'username' ? 'View privacy insights' : 'View personalized insights' }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {{ expanded ? 'Collapse' : 'Expand' }}
        </span>
        <div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-200">
          <svg 
            :class="['w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-200', expanded ? 'rotate-180' : '']"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Minimal stats when collapsed - HIDE for username scans -->
    <div v-if="!expanded && scanType === 'email'" class="mt-4 grid grid-cols-4 gap-3">
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <div class="text-xl font-semibold text-gray-900 dark:text-white">{{ results.breaches?.length || 0 }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Breaches</div>
      </div>
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <div class="text-xl font-semibold text-gray-900 dark:text-white">{{ results.used_on?.length || 0 }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Platforms</div>
      </div>
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <div class="text-xl font-semibold text-gray-900 dark:text-white">{{ results.sherlock?.length || 0 }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Profiles</div>
      </div>
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <div class="text-xl font-semibold text-gray-900 dark:text-white">{{ riskScore }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Risk Score</div>
      </div>
    </div>

    <!-- Clean expanded content -->
    <div v-if="expanded" class="mt-6 space-y-6">
      
      <!-- Direct findings from AI Analysis - NO REDUNDANT HEADER -->
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6">
        <!-- Key finding teaser -->
        <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
          <div class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" v-html="keyFindingTeaser"></div>
        </div>
        
        <!-- Read more toggle -->
        <button 
          @click="showFullAnalysis = !showFullAnalysis"
          class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <span>{{ showFullAnalysis ? 'Show less' : 'Show detailed analysis' }}</span>
          <svg 
            :class="['w-4 h-4 transition-transform duration-200', showFullAnalysis ? 'rotate-180' : '']"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <!-- Full detailed analysis (hidden by default) -->
        <div v-if="showFullAnalysis" class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div class="prose prose-sm max-w-none">
            <div class="space-y-6 text-gray-700 dark:text-gray-300" v-html="fullAnalysis"></div>
          </div>
        </div>
      </div>

      <!-- Privacy Tips - FOLLOWS THE ANALYSIS -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div class="mb-4 flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">Privacy Tips</h4>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <span class="w-6 h-6 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-sm font-medium flex items-center justify-center">1</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">Change compromised passwords</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Update passwords on breached platforms immediately</div>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <span class="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded text-sm font-medium flex items-center justify-center">2</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">Request data deletion</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Ask platforms to delete your personal information</div>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <span class="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-sm font-medium flex items-center justify-center">3</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">Customize privacy settings</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Don't rely on defaults - adjust settings to your preference</div>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <span class="w-6 h-6 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-sm font-medium flex items-center justify-center">4</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">Clean up connected accounts</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Remove old Google/Facebook app connections you no longer use</div>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <span class="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-sm font-medium flex items-center justify-center">5</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">Choose your cookie preferences</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Don't accept all cookies - customize what you're comfortable with</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple footer -->
      <div class="text-xs text-gray-400 text-center pt-4 border-t border-gray-100 dark:border-gray-800">
        Analysis generated using advanced AI to assess your specific digital footprint
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  explanation: {
    type: String,
    required: true
  },
  results: {
    type: Object,
    required: true
  },
  scanType: {
    type: String,
    default: 'email' // 'email' or 'username'
  }
})

const expanded = ref(true)
const showFullAnalysis = ref(false)

// Extract key finding (immediate risk summary) as teaser
const keyFindingTeaser = computed(() => {
  if (!props.explanation) return ''
  
  // Look for the Immediate Risks section
  const immediateRisksMatch = props.explanation.match(/<h3>Immediate Risks<\/h3>\s*<p>(.*?)<\/p>/s)
  if (immediateRisksMatch) {
    const finding = immediateRisksMatch[1].trim()
    return `<div class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Immediate Risk Level</div><div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">${finding}</div>`
  }
  
  // Fallback: generate based on results
  const breaches = props.results.breaches?.length || 0
  const platforms = props.results.used_on?.length || 0
  
  if (breaches === 0) {
    return `<div class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Immediate Risk Level</div><div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">No major data breaches detected for your email address, which significantly reduces your exposure to credential-based attacks. <span class="font-medium text-orange-600 dark:text-orange-400">MEDIUM</span> risk level detected.</div>`
  } else {
    return `<div class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Immediate Risk Level</div><div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Your email was found in ${breaches} data breach${breaches > 1 ? 'es' : ''}, creating potential security vulnerabilities. <span class="font-medium text-red-600 dark:text-red-400">HIGH</span> risk level detected.</div>`
  }
})

// Extract summary (first key insight) from AI explanation
const summaryText = computed(() => {
  if (!props.explanation) return ''
  
  // Find the first substantive paragraph before any section headers
  const paragraphs = props.explanation.split('<p>').filter(p => p.trim())
  if (paragraphs.length > 0) {
    // Take the first paragraph and clean it up
    const firstParagraph = paragraphs[0].replace(/<\/p>.*/, '').trim()
    return `<div class="font-medium text-gray-900 dark:text-white">${firstParagraph}</div>`
  }
  
  return '<div class="font-medium text-gray-900 dark:text-white">Your digital footprint analysis is ready.</div>'
})



// Full formatted analysis (original detailed version, minus the immediate risks teaser)
const fullAnalysis = computed(() => {
  if (!props.explanation) return ''
  
  // Enhanced formatting - handle both <h3> and <strong> tags for section headers
  let formatted = props.explanation
    // Remove the Immediate Risks section since it's now shown as teaser
    .replace(/<h3>Immediate Risks<\/h3>\s*<p>.*?<\/p>\s*/s, '')
    // First, handle <h3> tags (which the AI is actually generating)
    .replace(/<h3>(Platform-Specific Risks|Long-term Concerns|Action Plan|Positive Notes)<\/h3>/g, 
             '<h4 class="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-6 first:mt-0">$1</h4>')
    // Also handle <strong> tags in case the fallback is used
    .replace(/<strong>(Platform-Specific Risks|Long-term Concerns|Action Plan|Positive Notes)<\/strong>/g, 
             '<h4 class="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-6 first:mt-0">$1</h4>')
    
  // Now remove all remaining <strong> tags to prevent over-bolding
  formatted = formatted
    .replace(/<strong>/g, '')
    .replace(/<\/strong>/g, '')
    // Style paragraphs with better spacing
    .replace(/<p>/g, '<div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">')
    .replace(/<\/p>/g, '</div>')
    // Style ordered lists properly
    .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 ml-4">')
    .replace(/<li>/g, '<li class="text-sm text-gray-600 dark:text-gray-300">')
    
  return formatted
})

// Simplified risk calculation
const riskScore = computed(() => {
  if (!props.results) return 0
  
  let score = 0
  if (props.results.breaches) score += Math.min(props.results.breaches.length * 0.5, 6)
  if (props.results.used_on) score += Math.min(props.results.used_on.length * 0.2, 2)
  if (props.results.sherlock) score += Math.min(props.results.sherlock.length * 0.2, 2)
  
  return Math.min(score, 10).toFixed(1)
})

// Clean risk level assessment
const riskLevel = computed(() => {
  const score = parseFloat(riskScore.value)
  if (score >= 7) return { level: 'HIGH', color: 'red' }
  if (score >= 4) return { level: 'MEDIUM', color: 'orange' }
  return { level: 'LOW', color: 'green' }
})
</script>
