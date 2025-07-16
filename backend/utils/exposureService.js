const mongoose = require('mongoose');
const { runSherlock } = require('./sherlockService');
const cacheService = require('./cacheService'); // NEW: Import cache service
require('dotenv').config();

// ============================================
// MongoDB Schema
// ============================================
const exposureSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  results: { type: Object, default: {} }, // Full scan results stored here
  riskSummary: {
    averageScore: Number,
    totalHits: Number,
    highestRiskDomain: String,
    highRiskCount: Number
  },
  lastChecked: { type: Date, default: Date.now }
}, { timestamps: true });

// ============================================
// Main Service
// ============================================
class ExposureService {
  constructor() {
    this.Exposure = mongoose.model('Exposure', exposureSchema);
  }

  /**
   * Gets exposure data for an email (currently not implemented)
   * @param {string} email - The email to scan
   * @param {boolean} forceRefresh - Whether to bypass cache
   * @returns {Promise<Array>} Empty array (feature not implemented)
   * @throws {Error} If email is invalid
   */
  async getExposureData(email, forceRefresh = false) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address');
    }

    console.log(`ℹ️ [${email}] Skipping footprint scan – using HIBP, Holehe, and Sherlock only`);
    return []; // Skipping full footprint scan for now
  }

  /**
   * Gets comprehensive scan results for either email or username
   * @typedef {Object} ScanResults
   * @property {string|null} email
   * @property {Array} exposures
   * @property {Array} breaches
   * @property {Array} used_on
   * @property {Array} sherlock
   * @property {string} explanation
   * @property {Object} _meta
   * 
   * @param {string|null} email - Email to scan (null for username-only scan)
   * @param {boolean} forceRefresh - Whether to bypass cache
   * @param {Array<string>} usernameList - Usernames to scan
   * @param {string} scanType - Type of scan: 'email' or 'username'
   * @returns {Promise<ScanResults>} Comprehensive scan results
   * @throws {Error} If inputs are invalid
   */
  async getScanResults(email, forceRefresh = false, usernameList = [], scanType = 'email') {
    // Validate usernameList parameter
    if (usernameList && !Array.isArray(usernameList)) {
      throw new Error('usernameList must be an array');
    }

    // NEW: Check in-memory cache first (faster than MongoDB)
    if (!forceRefresh) {
      const cachedResult = cacheService.get(email, usernameList);
      if (cachedResult) {
        console.log(`🚀 [CACHE HIT] Fast cache hit for ${email || usernameList.join(',')}`);
        return cachedResult;
      }
    }

    // Check MongoDB cache for email scans (fallback)
    let mongoCache = null;
    if (email && !forceRefresh && scanType === 'email') {
      mongoCache = await this._getCachedData(email);
      if (mongoCache) {
        console.log(`📄 [MONGO CACHE] Using MongoDB cached results for ${email}`);
        // Also store in fast cache for next time
        cacheService.set(email, usernameList, mongoCache);
        return mongoCache;
      }
    }

    // If scanning by username only (no email)
    if (!email || scanType === 'username') {
      const startTime = Date.now();
      const usernamesToScan = usernameList.length > 0 ? usernameList : [];
      
      let sherlock = [];
      let sherlockTime = 0;
      try {
        const sherlockStart = Date.now();
        sherlock = usernamesToScan.length ? await runSherlock(usernamesToScan) : [];
        sherlockTime = Date.now() - sherlockStart;
      } catch (e) {
        console.error('Sherlock scan failed:', e);
      }

      const explanationStart = Date.now();
      let explanation = '';
      try {
        explanation = await require('./explainAttack').explainAttack({
          email: usernamesToScan[0] || 'username', // Pass the username instead of null
          hibpBreaches: [], // clean
          socialPlatforms: [], // clean
          sherlockPlatforms: sherlock?.map(p => p.platform) || [],
          scanType: 'username' // ADD THIS LINE
        });
      } catch (e) {
        console.error('AI explanation failed for username scan:', e.message);
        explanation = `
          <h3>Username Analysis Complete</h3>
          <p>Found <strong>${sherlock.length} public profiles</strong> for the username(s): ${usernamesToScan.join(', ')}</p>
          <h3>Recommended Actions</h3>
          <ol>
            <li>Review privacy settings on discovered platforms</li>
            <li>Use unique usernames for sensitive accounts</li>
            <li>Consider removing unused profiles</li>
          </ol>
          <h3>Positive Notes</h3>
          <p>Taking control of your username privacy shows you're proactive about digital security. Most privacy risks can be managed with proper settings and account cleanup.</p>
        `;
      }
      const explanationTime = Date.now() - explanationStart;

      const usernameResults = {
        email: null,
        exposures: [],
        breaches: [],
        used_on: [],
        sherlock: sherlock,
        explanation,
        scanType: 'username',
        _meta: {
          cached: false,
          generatedAt: new Date().toISOString(),
          sources: {
            hibp: false,
            holehe: false,
            sherlock: sherlock.length > 0
          },
          timing: {
            sherlock: sherlockTime,
            explanation: explanationTime,
            total: Date.now() - startTime
          }
        }
      };

      // NEW: Cache username results if meaningful
      if (cacheService.shouldCache(usernameResults)) {
        cacheService.set(null, usernameList, usernameResults);
      }

      return usernameResults;
    }

    // If scanning by email (normal flow)
    const startTime = Date.now();
    const defaultUsername = email.split('@')[0];
    const usernamesToScan = usernameList.length > 0 ? usernameList : [defaultUsername];

    console.log(`🔄 [FRESH SCAN] Running new scan for ${email}`);

    // Run all scans in parallel with timing
    const [exposures, hibp, holehe, sherlock] = await Promise.all([
      this.getExposureData(email, forceRefresh),
      require('./hibpService').getHIBPData(email),
      require('./holeheService').runHolehe(email),
      (async () => {
        try {
          return usernamesToScan.length ? await runSherlock(usernamesToScan) : [];
        } catch (e) {
          console.error('Sherlock scan failed:', e);
          return [];
        }
      })()
    ]);

    // Generate explanation with enhanced error handling
    const socialPlatforms = [
      ...(holehe?.used_on || []),
      ...(holehe?.rate_limited || [])
    ];

    const sherlockPlatforms = sherlock?.map(p => p.platform) || [];

    const explanationStart = Date.now();
    let explanation = '';
    try {
      explanation = await require('./explainAttack').explainAttack({
        email,
        hibpBreaches: hibp?.breaches || [],
        socialPlatforms,
        sherlockPlatforms,
        scanType: 'email' // ADD THIS LINE
      });
    } catch (e) {
      console.error('AI explanation failed:', e.message);
      
      // Fallback explanation
      const breachCount = hibp?.breaches?.length || 0;
      explanation = `
        <h3>Privacy Analysis Complete</h3>
        <p>We found <strong>${breachCount} data breaches</strong> and <strong>${socialPlatforms.length} platform registrations</strong> for your email.</p>
        
        <h3>Recommended Actions</h3>
        <ol>
          <li>Change passwords on all affected platforms</li>
          <li>Enable two-factor authentication where available</li>
          <li>Monitor accounts for suspicious activity</li>
          <li>Use unique passwords for each platform</li>
        </ol>
        
        <h3>Positive Notes</h3>
        <p>By taking this scan, you're being proactive about your digital security. Most security issues can be resolved with proper password management and two-factor authentication.</p>
        
        <p><em>Detailed AI analysis temporarily unavailable. Basic security recommendations provided.</em></p>
      `;
    }
    const explanationTime = Date.now() - explanationStart;

    // Prepare full results
    const fullResults = {
      email,
      exposures,
      breaches: hibp?.breaches || [],
      used_on: holehe?.used_on || [],
      sherlock: sherlock || [],
      explanation,
      scanType: 'email',
      _meta: {
        cached: false,
        generatedAt: new Date().toISOString(),
        sources: {
          hibp: !!hibp?.breaches,
          holehe: !!holehe?.used_on,
          sherlock: sherlock.length > 0
        },
        timing: {
          explanation: explanationTime,
          total: Date.now() - startTime
        }
      }
    };

    // Compute risk summary for email scans
    const breachCount = hibp?.breaches?.length || 0;
    const breaches = hibp?.breaches || [];

    const riskSummary = {
      averageScore: breachCount * 2,
      totalHits: breachCount + (holehe?.used_on?.length || 0) + (sherlock?.length || 0),
      highestRiskDomain: breaches[0]?.domain || null,
      highRiskCount: breaches.filter((b) => b.DataClasses?.includes('Passwords')).length
    };

    // NEW: Cache results in both places
    try {
      // 1. Fast in-memory cache
      if (cacheService.shouldCache(fullResults)) {
        cacheService.set(email, usernameList, fullResults);
      }
      
      // 2. Persistent MongoDB cache
      await this._updateMongo(email, fullResults, riskSummary);
    } catch (cacheError) {
      console.warn('⚠️ Failed to cache results:', cacheError.message);
      // Don't fail the request if caching fails
    }

    return fullResults;
  }

  // ============================================
  // Cache Management Methods
  // ============================================

  /**
   * Get cache statistics for monitoring
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      inMemory: cacheService.getStats(),
      mongodb: {
        // MongoDB stats would require additional queries
        message: 'MongoDB cache stats available via health endpoint'
      }
    };
  }

  /**
   * Clear all caches (use with caution)
   * @param {boolean} includeDB - Whether to clear MongoDB cache too
   */
  async clearCache(includeDB = false) {
    cacheService.clear();
    
    if (includeDB) {
      const result = await this.Exposure.deleteMany({});
      console.log(`🗑️ Cleared ${result.deletedCount} MongoDB cache entries`);
    }
    
    console.log('✅ Cache cleared successfully');
  }

  // ============================================
  // Private Methods (MongoDB-only cache)
  // ============================================

  /**
   * Gets cached data for an email if valid
   * @private
   * @param {string} email 
   * @returns {Promise<ScanResults|null>} Cached results or null
   */
  async _getCachedData(email) {
    try {
      const doc = await this.Exposure.findOne({ email });
      if (doc && this._isCacheValid(doc.lastChecked)) {
        return {
          ...doc.results,
          _meta: {
            ...(doc.results._meta || {}),
            cached: true,
            cachedAt: doc.lastChecked.toISOString(),
            cacheSource: 'mongodb'
          }
        };
      }
    } catch (error) {
      console.warn('⚠️ MongoDB cache lookup failed:', error.message);
    }
    return null;
  }

  /**
   * Updates MongoDB cache
   * @private
   * @param {string} email 
   * @param {Object} results 
   * @param {Object} riskSummary 
   */
  async _updateMongo(email, results, riskSummary) {
    try {
      await this.Exposure.findOneAndUpdate(
        { email },
        {
          results,
          riskSummary,
          lastChecked: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.warn('⚠️ Failed to update MongoDB cache:', error.message);
      // Don't throw - caching failure shouldn't break the scan
    }
  }

  /**
   * Checks if cache is still valid
   * @private
   * @param {Date} lastChecked 
   * @returns {boolean} True if cache is valid
   */
  _isCacheValid(lastChecked) {
    if (!lastChecked) return false;
    const ageHours = (Date.now() - new Date(lastChecked)) / (1000 * 60 * 60);
    return ageHours < 24; // Valid for 24 hours
  }
}

// ============================================
// Exports
// ============================================
const service = new ExposureService();
module.exports = {
  getExposureData: service.getExposureData.bind(service),
  getScanResults: service.getScanResults.bind(service),
  getCacheStats: service.getCacheStats.bind(service),
  clearCache: service.clearCache.bind(service),
  Exposure: service.Exposure
};