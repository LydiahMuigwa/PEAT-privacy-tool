// utils/validation.js

export const validateInput = {
  email(emailValue) {
    const trimmed = emailValue.trim()
    if (!trimmed) throw new Error('Email is required.')
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      throw new Error('Please enter a valid email address.')
    }
    
    return trimmed
  },

  username(usernameValue) {
    const trimmed = usernameValue.trim()
    if (!trimmed) throw new Error('Username is required.')
    
    if (trimmed.includes(' ') || trimmed.length < 3 || trimmed.length > 50) {
      throw new Error('Username must be 3-50 characters without spaces.')
    }
    
    const sanitized = trimmed.replace(/[^a-zA-Z0-9_.-]/g, '')
    if (sanitized !== trimmed) {
      throw new Error('Username contains invalid characters. Only letters, numbers, dots, hyphens, and underscores are allowed.')
    }
    
    return sanitized
  }
}

export const extractURL = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname + urlObj.pathname
  } catch (e) {
    return url
  }
}