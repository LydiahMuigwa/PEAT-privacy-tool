// backend/utils/validators.js (Enhanced Security Version)

/**
 * Validate email format with enhanced security checks
 * @param {string} email 
 * @returns {boolean}
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const trimmed = email.trim().toLowerCase();
  
  // Length validation (RFC 5321 limits)
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  
  // Enhanced email regex with stricter validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) return false;
  
  // Additional security checks
  const localPart = trimmed.split('@')[0];
  const domainPart = trimmed.split('@')[1];
  
  // Local part shouldn't be too long
  if (localPart.length > 64) return false;
  
  // Domain part basic validation
  if (domainPart.length < 3 || domainPart.length > 253) return false;
  
  // Prevent suspicious patterns
  const suspiciousPatterns = [
    /\.{2,}/, // Multiple consecutive dots
    /^\./, // Starting with dot
    /\.$/, // Ending with dot
    /<script/i, // Script injection
    /javascript:/i, // JavaScript URLs
    /['"<>]/g // Quotes and brackets
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) return false;
  }
  
  return true;
};

/**
 * Validate username format with enhanced security
 * @param {string} username 
 * @returns {boolean}
 */
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  
  const trimmed = username.trim();
  
  // Length validation
  if (trimmed.length < 1 || trimmed.length > 50) return false;
  
  // Character validation - prevent command injection
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return false;
  
  // Prevent suspicious patterns
  const suspiciousPatterns = [
    /^[.-]/, // Starting with dot or dash
    /[.-]$/, // Ending with dot or dash
    /\.{2,}/, // Multiple consecutive dots
    /-{2,}/, // Multiple consecutive dashes
    /_{2,}/, // Multiple consecutive underscores
    /admin/i, // Common system usernames
    /root/i,
    /administrator/i,
    /system/i,
    /test/i,
    /null/i,
    /undefined/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) return false;
  }
  
  return true;
};

/**
 * Validate username array with limits
 * @param {Array} usernames 
 * @returns {boolean}
 */
const validateUsernameArray = (usernames) => {
  if (!Array.isArray(usernames)) return false;
  
  // Limit array size to prevent abuse
  if (usernames.length === 0 || usernames.length > 5) return false;
  
  // Validate each username
  return usernames.every(username => validateUsername(username));
};

/**
 * Enhanced scan parameter validation
 * @param {Object} params 
 * @returns {Object} { isValid: boolean, errors: string[], sanitized: Object }
 */
const validateScanParams = (params) => {
  const errors = [];
  const sanitized = {};
  
  // Validate input is an object
  if (!params || typeof params !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid parameters: expected object'],
      sanitized: {}
    };
  }
  
  // Check for email or username (mutually exclusive for primary scan)
  const hasEmail = params.email && params.email.trim();
  const hasUsername = params.username && params.username.trim();
  const hasUsernames = params.usernames && Array.isArray(params.usernames) && params.usernames.length > 0;
  
  if (hasEmail && (hasUsername || hasUsernames)) {
    errors.push('Cannot specify both email and username parameters');
  } else if (!hasEmail && !hasUsername && !hasUsernames) {
    errors.push('Must specify either email or username parameter');
  }
  
  // Email validation
  if (hasEmail) {
    if (!validateEmail(params.email)) {
      errors.push('Invalid email format or potentially unsafe email address');
    } else {
      sanitized.email = params.email.trim().toLowerCase();
    }
  }
  
  // Single username validation
  if (hasUsername) {
    if (!validateUsername(params.username)) {
      errors.push('Invalid username format (1-50 chars, letters/numbers/dots/hyphens/underscores only, no suspicious patterns)');
    } else {
      sanitized.username = params.username.trim();
    }
  }
  
  // Username array validation
  if (hasUsernames) {
    if (!validateUsernameArray(params.usernames)) {
      errors.push('Invalid usernames array (1-5 valid usernames required)');
    } else {
      sanitized.usernames = params.usernames.map(u => u.trim()).filter(Boolean);
    }
  }
  
  // Validate forceRefresh parameter
  if (params.forceRefresh !== undefined) {
    if (typeof params.forceRefresh === 'string') {
      sanitized.forceRefresh = params.forceRefresh.toLowerCase() === 'true';
    } else if (typeof params.forceRefresh === 'boolean') {
      sanitized.forceRefresh = params.forceRefresh;
    } else {
      errors.push('forceRefresh must be a boolean or string "true"/"false"');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Enhanced input sanitization
 * @param {string} input 
 * @returns {string}
 */
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .substring(0, 1000); // Limit length to prevent DoS
};

/**
 * Validate and sanitize profile data for scrape endpoint
 * @param {Object} profile 
 * @returns {Object} { isValid: boolean, errors: string[], sanitized: Object }
 */
const validateProfileData = (profile) => {
  const errors = [];
  const sanitized = {};
  
  if (!profile || typeof profile !== 'object') {
    return {
      isValid: false,
      errors: ['Profile must be an object'],
      sanitized: {}
    };
  }
  
  // Validate and sanitize each field
  const stringFields = ['fullName', 'email', 'city', 'country', 'jobTitle', 'company'];
  
  for (const field of stringFields) {
    if (profile[field] !== undefined) {
      if (typeof profile[field] !== 'string') {
        errors.push(`${field} must be a string`);
      } else {
        const sanitized_value = sanitizeInput(profile[field]);
        if (sanitized_value.length > 200) {
          errors.push(`${field} is too long (max 200 characters)`);
        } else {
          sanitized[field] = sanitized_value;
        }
      }
    }
  }
  
  // Special validation for email field if present
  if (profile.email && !validateEmail(profile.email)) {
    errors.push('Invalid email format in profile');
  }
  
  // Ensure at least one meaningful field is provided
  const meaningfulFields = ['fullName', 'email'];
  const hasMeaningfulData = meaningfulFields.some(field => 
    sanitized[field] && sanitized[field].length > 0
  );
  
  if (!hasMeaningfulData) {
    errors.push('Profile must contain at least fullName or email');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate request rate limiting headers
 * @param {Object} req Express request object
 * @returns {boolean} true if request should be allowed
 */
const validateRateLimit = (req) => {
  // This is typically handled by express-rate-limit middleware
  // But we can add additional custom logic here if needed
  
  // Example: Check for suspicious rapid-fire requests
  const userAgent = req.get('User-Agent');
  if (!userAgent || userAgent.length < 10) {
    return false; // Suspicious or missing user agent
  }
  
  // Check for bot patterns in user agent
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, 
    /curl/i, /wget/i, /python/i, /php/i
  ];
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  if (isBot) {
    console.warn(`Potential bot detected: ${userAgent} from ${req.ip}`);
    // Don't block bots entirely, but log them
  }
  
  return true;
};

module.exports = {
  validateEmail,
  validateUsername,
  validateUsernameArray,
  validateScanParams,
  validateProfileData,
  validateRateLimit,
  sanitizeInput
};