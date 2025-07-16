const express = require('express');
const router = express.Router();
const { validateEmail } = require('../utils/validators');
const { getScanResults } = require('../utils/exposureService');

// =========================
// Main Scan Route - Updated to handle scanType
// =========================
router.get('/', async (req, res, next) => {
  const { email, username, usernames, forceRefresh, scanType } = req.query;

  // Determine scan type from parameters
  let determinedScanType = scanType || 'email'; // Default to email
  
  // Auto-detect scan type if not provided
  if (!scanType) {
    if (email) {
      determinedScanType = 'email';
    } else if (username || usernames) {
      determinedScanType = 'username';
    }
  }

  const usernameList = [];
  if (username) {
    usernameList.push(username.trim());
  } else if (usernames) {
    if (Array.isArray(usernames)) {
      usernameList.push(...usernames.map(u => u.trim()).filter(Boolean));
    } else {
      usernameList.push(...usernames.split(',').map(u => u.trim()).filter(Boolean));
    }
  }

  // Validation based on scan type
  if (determinedScanType === 'email') {
    if (!email) {
      return res.status(400).json({
        error: 'Email is required for email scans',
        scanType: determinedScanType
      });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        example: 'Try "test@example.com"',
        scanType: determinedScanType
      });
    }
  } else if (determinedScanType === 'username') {
    if (usernameList.length === 0) {
      return res.status(400).json({
        error: 'At least one username is required for username scans',
        scanType: determinedScanType
      });
    }
  } else {
    return res.status(400).json({
      error: 'scanType must be either "email" or "username"'
    });
  }

  try {
    console.log(`🔍 Starting ${determinedScanType} scan for: ${email || usernameList.join(', ')}`);

    // Call getScanResults with scanType parameter
    const scanResults = await getScanResults(
      determinedScanType === 'email' ? email : null, 
      forceRefresh === 'true', 
      usernameList,
      determinedScanType // Pass scanType to the service
    );

    const sherlockResults = scanResults?.sherlock || [];
    const sherlockPlatforms = sherlockResults.map(result => result.platform).filter(Boolean);

    const fullResults = {
      ...scanResults,
      holehePlatforms: scanResults?.used_on || [],
      holehePlatformCount: scanResults?.count || 0,
      sherlockPlatformCount: sherlockResults.length,
      sherlockPlatforms,
      scanType: determinedScanType, // Include scan type in response
    };

    res.json(fullResults);
  } catch (err) {
    console.error(`❌ ${determinedScanType} scan failed for ${email || usernameList.join(', ')}:`, err.message);
    next(err);
  }
});

// =========================
// Quick Phase Scan Route (Email Only) - Updated with scanType
// =========================
router.get('/quick', async (req, res) => {
  const { email } = req.query;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email required for quick scan.' });
  }

  try {
    const [hibp, holehe] = await Promise.all([
      require('../utils/hibpService').getHIBPData(email),
      require('../utils/holeheService').runHolehe(email)
    ]);

    // Check if breach count is extremely high and warn user
    const breachCount = hibp.breaches?.length || 0;
    
    if (breachCount > 200) {
      console.log(`⚠️ High breach count detected (${breachCount}) for ${email}. Using fallback response.`);
      
      return res.json({
        email,
        breaches: hibp.breaches.slice(0, 20), // Show only recent 20 breaches
        used_on: holehe.used_on,
        scanType: 'email', // Add scanType
        explanation: `
          <h3>High-Risk Email Detected</h3>
          <p>Your email appears in <strong>${breachCount} data breaches</strong>, which is significantly higher than average.</p>
          
          <h3>Immediate Action Required</h3>
          <ol>
            <li><strong>Change your email password immediately</strong></li>
            <li><strong>Enable two-factor authentication</strong> on your email account</li>
            <li><strong>Consider using a new email address</strong> for important accounts</li>
            <li><strong>Use a password manager</strong> with unique passwords for each site</li>
          </ol>
          
          <h3>What This Means</h3>
          <p>This email address has been compromised in numerous data breaches over time. While concerning, this is recoverable with proper security measures.</p>
          
          <p><em>Showing 20 most recent breaches. Full analysis available with premium features.</em></p>
        `,
        partial: true,
        _meta: {
          breachCountTruncated: true,
          totalBreaches: breachCount,
          showingBreaches: Math.min(breachCount, 20)
        }
      });
    }

    // Normal processing for reasonable breach counts
    let explanation;
    try {
      explanation = await require('../utils/explainAttack').explainAttack({
        email,
        hibpBreaches: hibp.breaches,
        socialPlatforms: holehe.used_on,
        sherlockPlatforms: [],
        scanType: 'email' // Add scanType parameter
      });
    } catch (aiError) {
      console.error('❌ AI explanation failed:', aiError.message);
      
      // Provide a user-friendly fallback
      explanation = `
        <h3>Privacy Analysis Complete</h3>
        <p>We found <strong>${breachCount} data breaches</strong> and <strong>${holehe.used_on?.length || 0} platform registrations</strong> for your email.</p>
        
        <h3>Recommended Actions</h3>
        <ol>
          <li>Change passwords on all affected platforms</li>
          <li>Enable two-factor authentication where available</li>
          <li>Monitor accounts for suspicious activity</li>
          <li>Use unique passwords for each platform</li>
        </ol>
        
        <p><em>Detailed AI analysis temporarily unavailable. Basic security recommendations provided.</em></p>
      `;
    }

    res.json({
      email,
      breaches: hibp.breaches,
      used_on: holehe.used_on,
      scanType: 'email', // Add scanType
      explanation,
      partial: true
    });

  } catch (err) {
    console.error('❌ Error in /scan/quick:', err);
    
    // Return a helpful error message instead of crashing
    res.status(500).json({ 
      error: 'Scan temporarily unavailable',
      message: 'Our scanning services are experiencing high demand. Please try again in a few minutes.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;