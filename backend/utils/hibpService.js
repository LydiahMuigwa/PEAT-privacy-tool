const axios = require("axios");

const HIBP_API_KEY = process.env.HIBP_API_KEY;
const BASE_URL = "https://haveibeenpwned.com/api/v3";

const headers = {
  "hibp-api-key": HIBP_API_KEY,
  "User-Agent": "PEAT-Privacy-Awareness-Tool"
};

// Helper: Assign risk level based on leaked data
const calculateBreachSeverity = (dataClasses = []) => {
  const criticalFields = ['Passwords', 'Credit card data', 'Social security numbers'];
  const highFields = ['Email addresses', 'Usernames', 'Phone numbers'];
  
  const hasCritical = dataClasses.some(d => criticalFields.includes(d));
  const hasHigh = dataClasses.some(d => highFields.includes(d));

  if (hasCritical) return 'critical';
  if (hasHigh) return 'high';
  return 'medium';
};

// Helper: Format & sort breaches
const formatBreaches = (breaches = []) => {
  return breaches
    .sort((a, b) => new Date(b.BreachDate) - new Date(a.BreachDate))
    .map(breach => ({
  title: breach.Title,
  domain: breach.Domain,
  breachDate: breach.BreachDate,
  dataClasses: breach.DataClasses,
  description: breach.Description,
  pwnCount: breach.PwnCount,
  isVerified: breach.IsVerified,
  severity: calculateBreachSeverity(breach.DataClasses)
}));

};

// Get all breaches for an email
const getBreachesForEmail = async (email) => {
  try {
    const response = await axios.get(`${BASE_URL}/breachedaccount/${encodeURIComponent(email)}`, {
      headers,
      params: {
        truncateResponse: false
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return [];
    if (error.response?.status === 429) {
      console.warn(`⚠️ HIBP breach lookup rate limited for ${email}`);
      return [];
    }
    throw new Error(`HIBP breach lookup failed: ${error.message}`);
  }
};

// Get pastes for an email
const getPastesForEmail = async (email) => {
  try {
    const response = await axios.get(`${BASE_URL}/pasteaccount/${encodeURIComponent(email)}`, {
      headers
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return [];
    if (error.response?.status === 429) {
      console.warn(`⚠️ HIBP paste lookup rate limited for ${email}`);
      return [];
    }
    throw new Error(`HIBP paste lookup failed: ${error.message}`);
  }
};

// 🔥 Unified HIBP scanner (with formatting)
const getHIBPData = async (email) => {
  try {
    const rawBreaches = await getBreachesForEmail(email);
    const pastes = await getPastesForEmail(email);

    const breaches = formatBreaches(rawBreaches);

    return {
      breaches,
      breachCount: breaches.length,
      pastes: pastes || []
    };
  } catch (err) {
    console.warn(`⚠️ HIBP failed for ${email}: ${err.message}`);
    return { breaches: [], breachCount: 0, pastes: [], hibp_error: err.message };
  }
};

module.exports = {
  getBreachesForEmail,
  getPastesForEmail,
  getHIBPData
};
