// composables/useDownload.js
import { computed } from 'vue'

export function useDownload(activeTab, email, username, results) {
  
  // Get API base URL from environment variable
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  // Calculate risk score for reports
  const riskScore = computed(() => {
    if (!results.value) return 0
    
    let score = 0
    
    // Breach scoring
    if (results.value.breaches) {
      score += results.value.breaches.length * 2.5
      
      // Add severity bonus
      results.value.breaches.forEach(breach => {
        if (breach.severity === 'high') score += 1.5
        else if (breach.severity === 'medium') score += 1
      })
    }
    
    // Platform exposure scoring
    if (results.value.used_on) {
      score += Math.min(results.value.used_on.length * 0.3, 2)
    }
    
    // Social media profiles scoring
    if (results.value.sherlock) {
      score += Math.min(results.value.sherlock.length * 0.2, 2)
    }
    
    return Math.min(score, 10).toFixed(1)
  })

  // Risk level based on score
  const riskLevel = computed(() => {
    const score = parseFloat(riskScore.value)
    if (score >= 7) return { level: 'HIGH', color: 'red' }
    if (score >= 4) return { level: 'MEDIUM', color: 'orange' }
    return { level: 'LOW', color: 'green' }
  })

  const downloadReport = async (format = 'text') => {
    if (!results.value) {
      alert('No scan results available to download.')
      return
    }

    try {
      const timestamp = new Date().toLocaleString()
      const scanType = activeTab.value === 'email' ? 'Email' : 'Username'
      const scanTarget = activeTab.value === 'email' ? email.value : username.value
      
      // Validate scan target exists
      if (!scanTarget || scanTarget.trim() === '') {
        alert('Invalid scan target for report generation.')
        return
      }

      if (format === 'pdf') {
        // Backend PDF generation
        await downloadPDFReport(scanTarget, scanType)
      } else {
        // Frontend text generation
        await downloadTextReport(timestamp, scanType, scanTarget)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert(`Failed to generate ${format} report. Please try again.`)
    }
  }

  // Text report generation (frontend)
  const downloadTextReport = async (timestamp, scanType, scanTarget) => {
    let reportContent = `PEAT Privacy Analysis Report
Generated: ${timestamp}
Scan Type: ${scanType} Analysis
Target: ${scanTarget}
Risk Score: ${riskScore.value}/10 (${riskLevel.value.level})

==============================================

`

    // Email breach results
    if (activeTab.value === 'email' && results.value.breaches) {
      reportContent += `BREACH ANALYSIS
================
Total Breaches Found: ${results.value.breaches.length}

`
      
      if (results.value.breaches.length === 0) {
        reportContent += `✓ Good news! This email was not found in any known data breaches.

`
      } else {
        results.value.breaches.forEach((breach, index) => {
          // Handle different breach object structures
          const title = breach.title || breach.Title || 'Unknown Breach'
          const breachDate = breach.breachDate || breach.BreachDate || 'Unknown Date'
          const severity = breach.severity || 'Not specified'
          const domain = breach.domain || breach.Domain || 'N/A'
          const dataClasses = breach.dataClasses || breach.DataClasses || []
          
          reportContent += `Breach ${index + 1}: ${title}
- Date: ${breachDate}
- Severity: ${severity}
- Domain: ${domain}
- Exposed Data: ${Array.isArray(dataClasses) ? dataClasses.join(', ') : 'Not specified'}

`
        })
      }
    }

    // Platform registrations
    if (results.value.used_on && results.value.used_on.length > 0) {
      reportContent += `PLATFORM REGISTRATIONS
======================
Found on ${results.value.used_on.length} platform(s):
${results.value.used_on.map(platform => `- ${platform}`).join('\n')}

`
    }

    // Social media profiles
    if (results.value.sherlock && results.value.sherlock.length > 0) {
      reportContent += `SOCIAL MEDIA PROFILES
=====================
${results.value.sherlock.length} public profile(s) discovered:
${results.value.sherlock.map(profile => `- ${profile.platform}: ${profile.url}`).join('\n')}

`
    }

    // AI Analysis (strip HTML tags properly)
    if (results.value.explanation) {
      const cleanExplanation = results.value.explanation
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim()
      
      reportContent += `AI RISK ASSESSMENT
==================
${cleanExplanation}

`
    }

    // Privacy recommendations
    if (results.value.breaches?.length > 0 || results.value.sherlock?.length > 0) {
      reportContent += `PRIVACY RECOMMENDATIONS
=======================
Based on your scan results, consider these steps:

1. Change passwords on affected platforms
2. Enable two-factor authentication where possible
3. Review privacy settings on social media accounts
4. Monitor accounts for suspicious activity
5. Consider using unique passwords for each platform

`
    }

    reportContent += `==============================================
Report generated by PEAT Privacy Analysis Tool
Developed by Lydiah Muigwa • Kadir Has University
© 2025 PEAT Privacy Analysis Tool

For more information, visit: https://peat-privacy.tool
`

    // Create and download the text file
    const blob = new Blob([reportContent], { 
      type: 'text/plain;charset=utf-8' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Generate safe filename
    const safeTarget = scanTarget.replace(/[^a-zA-Z0-9@._-]/g, '_')
    const dateStr = new Date().toISOString().split('T')[0]
    link.download = `PEAT-Privacy-Report-${safeTarget}-${dateStr}.txt`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('Text report downloaded successfully')
  }

  // PDF report generation (backend)
  const downloadPDFReport = async (scanTarget, scanType) => {
    try {
      const params = new URLSearchParams()
      
      if (activeTab.value === 'email') {
        params.append('email', scanTarget)
      } else {
        params.append('username', scanTarget)
      }

      // Call backend PDF generation endpoint - FIXED: Using full API URL
      const response = await fetch(`${API_BASE_URL}/api/report/pdf?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'PDF generation failed')
      }

      // Get the PDF blob
      const pdfBlob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate safe filename
      const safeTarget = scanTarget.replace(/[^a-zA-Z0-9@._-]/g, '_')
      const dateStr = new Date().toISOString().split('T')[0]
      link.download = `PEAT-Privacy-Report-${safeTarget}-${dateStr}.pdf`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('PDF report downloaded successfully')
    } catch (error) {
      console.error('PDF download error:', error)
      // Fallback to text if PDF fails
      alert('PDF generation failed. Downloading text report instead.')
      await downloadTextReport(new Date().toLocaleString(), scanType, scanTarget)
    }
  }

  const downloadTextClicked = () => {
    console.log('Text clicked')
    downloadReport('text')
  }

  const downloadPDFClicked = () => {
    console.log('PDF clicked')
    downloadReport('pdf')
  }

  return {
    downloadTextClicked,
    downloadPDFClicked,
    riskScore,
    riskLevel
  }
}