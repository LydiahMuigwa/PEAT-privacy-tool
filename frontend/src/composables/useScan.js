// composables/useScan.js
import { ref } from 'vue'
import { validateInput } from '@/utils/validation.js'
import confetti from 'canvas-confetti'

export function useScan() {
  // Get API base URL from environment variable
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  // Reactive state
  const activeTab = ref('email')
  const email = ref('')
  const username = ref('')
  const results = ref(null)
  const loading = ref(false)
  const progress = ref(0)
  let scanAbortController = null

  // Utility functions
  function fireConfettiBurst() {
    const colors = ['#22c55e', '#2563eb', '#10b981']
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 }, colors })
  }

  const resetScan = () => {
    email.value = ''
    username.value = ''
    results.value = null
    loading.value = false
    progress.value = 0
    if (scanAbortController) {
      scanAbortController.abort()
      scanAbortController = null
    }
  }

  const cancelScan = () => {
    if (scanAbortController) {
      scanAbortController.abort()
    }
    resetScan()
    alert('Scan cancelled.')
  }

  const runScan = async () => {
    loading.value = true
    results.value = null
    progress.value = 0
    scanAbortController = new AbortController()
    const { signal } = scanAbortController

    try {
      const params = new URLSearchParams()
      
      // Add scanType parameter
      params.append('scanType', activeTab.value)
      
      // Input validation
      if (activeTab.value === 'email') {
        const emailValue = validateInput.email(email.value)
        params.append('email', emailValue)
      } else {
        const usernameValue = validateInput.username(username.value)
        params.append('username', usernameValue)
      }

      // Username scan
      if (activeTab.value === 'username') {
        await performUsernameScan(params, signal)
        return
      }

      // Email scan (quick + full)
      await performEmailScan(params, signal)

    } catch (err) {
      handleScanError(err)
    } finally {
      loading.value = false
      scanAbortController = null
    }
  }

  const performUsernameScan = async (params, signal) => {
    let currentProgress = 0
    const interval = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += Math.random() * 5
        progress.value = Math.min(currentProgress, 90)
      }
    }, 200)

    const res = await fetch(`${API_BASE_URL}/api/scan?${params.toString()}`, { 
      signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    clearInterval(interval)
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || 'Username scan failed.')
    }

    const data = await res.json()
    results.value = {
      sherlock: data.sherlock || [],
      used_on: data.used_on || [], // Include platforms for username scans
      explanation: data.explanation || '',
      scanType: data.scanType || 'username', // Include scanType in results
      _meta: data._meta || { partial: false }
    }
    progress.value = 100
  }

  const performEmailScan = async (params, signal) => {
    // Quick scan
    const quickData = await performQuickScan(params, signal)
    
    // Celebration for no breaches
    if (quickData.breaches?.length === 0) {
      fireConfettiBurst()
      setTimeout(fireConfettiBurst, 500)
      setTimeout(fireConfettiBurst, 1000)
    }

    // Full scan
    await performFullScan(params, signal)
  }

  const performQuickScan = async (params, signal) => {
    let quickScanProgress = 0
    const quickScanInterval = setInterval(() => {
      if (quickScanProgress < 40) {
        quickScanProgress += Math.random() * 3
        progress.value = Math.min(quickScanProgress, 40)
      }
    }, 100)

    // Add scanType to quick scan params
    const quickParams = new URLSearchParams(params)
    quickParams.set('scanType', 'email') // Quick scan is always email

    const quickRes = await fetch(`${API_BASE_URL}/api/scan/quick?${quickParams.toString()}`, { 
      signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    clearInterval(quickScanInterval)
    
    if (!quickRes.ok) {
      const errorData = await quickRes.json().catch(() => ({}))
      throw new Error(errorData.error || 'Quick scan failed.')
    }

    const quickData = await quickRes.json()
    results.value = {
      ...quickData,
      breaches: quickData.breaches || [],
      used_on: quickData.used_on || [],
      scanType: quickData.scanType || 'email', // Include scanType in results
      _meta: { ...(quickData._meta || {}), partial: true }
    }
    progress.value = 50

    return quickData
  }

  const performFullScan = async (params, signal) => {
    let fullScanProgress = progress.value
    const fullScanInterval = setInterval(() => {
      if (fullScanProgress < 90) {
        fullScanProgress += Math.random() * 2
        progress.value = Math.min(fullScanProgress, 90)
      }
    }, 150)

    const fullRes = await fetch(`${API_BASE_URL}/api/scan?${params.toString()}`, { 
      signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    clearInterval(fullScanInterval)
    
    if (fullRes.ok) {
      const fullData = await fullRes.json()
      results.value = {
        ...results.value,
        ...fullData,
        scanType: fullData.scanType || results.value.scanType, // Preserve scanType
        _meta: {
          ...(results.value._meta || {}),
          ...(fullData._meta || {}),
          partial: false
        }
      }
      progress.value = 100
    }
  }

  const handleScanError = (err) => {
    if (err.name === 'AbortError') {
      console.log('Scan aborted by user.')
    } else {
      console.error('Scan error:', err)
      alert(err.message || 'Something went wrong. Please try again.')
    }
    resetScan()
  }

  return {
    activeTab,
    email,
    username,
    results,
    loading,
    progress,
    runScan,
    cancelScan,
    resetScan
  }
}