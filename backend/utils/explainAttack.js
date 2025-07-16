const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function explainAttack({
  email,
  hibpBreaches = [],
  socialPlatforms = [],
  sherlockPlatforms = [],
  scanType = 'email' // Add scan type parameter
}) {
  console.log("🧠 explainAttack() input:", {
    email,
    scanType,
    hibpBreachesCount: hibpBreaches.length,
    socialPlatformsCount: Array.isArray(socialPlatforms) ? socialPlatforms.length : socialPlatforms,
    sherlockPlatformsCount: Array.isArray(sherlockPlatforms) ? sherlockPlatforms.length : sherlockPlatforms
  });

  // Handle username scans differently
  if (scanType === 'username') {
    return generateUsernameAnalysis(email, sherlockPlatforms, socialPlatforms);
  }

  // Ensure arrays are properly formatted
  const safeHibpBreaches = Array.isArray(hibpBreaches) ? hibpBreaches : [];
  const safeSocialPlatforms = Array.isArray(socialPlatforms) ? socialPlatforms : [];
  const safeSherlockPlatforms = Array.isArray(sherlockPlatforms) ? sherlockPlatforms : [];

  // Focus on most critical data for email scans
  const recentBreaches = safeHibpBreaches
    .sort((a, b) => new Date(b.breachDate || 0) - new Date(a.breachDate || 0))
    .slice(0, 8); // Reduced for clarity

  const riskMetrics = calculateRiskMetrics(safeHibpBreaches, safeSherlockPlatforms, safeSocialPlatforms);

  // Get specific breach details for personalization
  const breachDetails = getBreachInsights(recentBreaches);
  const platformDetails = getPlatformInsights(safeSocialPlatforms, safeSherlockPlatforms);
  
  // Define truncated variables that were missing
  const truncatedSocial = safeSocialPlatforms.slice(0, 12);
  const truncatedSherlock = safeSherlockPlatforms.slice(0, 12);
  const truncatedSocialPlatforms = safeSocialPlatforms.slice(0, 15);
  const truncatedSherlockPlatforms = safeSherlockPlatforms.slice(0, 15);
  
  const riskLevel = riskMetrics.level;
  
  const messages = [
    {
      role: "system",
      content: `You are an expert cybersecurity analyst providing personalized digital risk assessments.

🎯 Your job is to analyze the user's digital exposure and produce a **clear, structured HTML report**.

---

✅ **RESPONSE STRUCTURE (use HTML):**
1. <h3>Immediate Risks</h3> — 2–4 concise sentences about what urgent threats the user faces.
2. <h3>Platform-Specific Risks</h3> — 2–3 sentences calling out specific platforms exposed.
3. <h3>Long-term Concerns</h3> — 2–4 sentences about professional/reputation risks and data persistence.
4. <h3>Action Plan</h3> — Use <ol> with 3–5 numbered, bolded action items (each 1–2 sentences).
5. <h3>Positive Notes</h3> — 2–4 sentences ending on a positive, empowering note.

---

💡 **FORMATTING GUIDELINES:**
- Use <strong> for platform names and key phrases like "change your password", "enable 2FA", etc.
- Keep paragraphs short and scannable (no walls of text).
- Use lists when explaining steps.
- Emphasize risk age (e.g., "3+ years ago") and reuse issues.

---

🗣️ **TONE & STYLE:**
- Speak **directly to the user** ("your", "you")
- Mix urgency with encouragement
- Be realistic, clear, and actionable
- Explain **why** each issue matters, not just what to do
- End with motivation (e.g., "you're already ahead by taking this step")

---

🧩 **CONTEXT TO INCLUDE (but don't restate raw):**
- Risk Level: ${riskLevel}
- Total Breaches: ${safeHibpBreaches.length}
- Mention real platforms if available
- If applicable, refer to recent breaches (within last 2 years)
- Mention if passwords may be 3+ years old
- Refer to public profiles (${safeSherlockPlatforms.length} found)
- Show why platform spread matters

The final output should be clean, reassuring, informative, and reflect the seriousness of the user's digital footprint while empowering them to act.`
    },
    {
      role: "user",
      content: `Provide a high-impact security brief for this specific user:

**THEIR DIGITAL FOOTPRINT:**
Email: ${email}
Breach Count: ${safeHibpBreaches.length} total exposures
Recent Major Breaches: ${recentBreaches.slice(0, 4).map(b => `${b.title || 'Unknown'} (${b.breachDate || 'Unknown'})`).join(', ') || 'None found'}
Most Sensitive Data Exposed: ${breachDetails.sensitiveData.length ? breachDetails.sensitiveData.slice(0, 3).join(', ') : 'Standard account data'}
Timeline Risk: Oldest breach ${breachDetails.yearsOld} years ago
Platform Presence: ${safeSocialPlatforms.length} registered accounts, ${safeSherlockPlatforms.length} public profiles
Overall Risk: ${riskMetrics.level}

**KEY PLATFORMS FOUND:**
Social: ${safeSocialPlatforms.slice(0, 4).map(p => typeof p === 'string' ? p : (p.name || 'Unknown')).join(', ') || 'None detected'}
Public Profiles: ${safeSherlockPlatforms.slice(0, 4).map(p => p.platform || 'Unknown').join(', ') || 'None detected'}

**SPECIFIC REQUIREMENTS:**
- Reference their actual breach names in Immediate Risks
- Mention their specific platform vulnerabilities  
- Address their ${breachDetails.yearsOld}-year timeline if ≥3 years (password reuse concern)
- Call out any sensitive data types found
- Make it feel like a personalized consultation, not generic advice

Deliver a briefing that shows you've analyzed THEIR specific digital footprint, not a template response.`
    }
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 750, // Reduced for conciseness
      temperature: 0.3, // Lower for more focused response
    });

    const response = chatCompletion.choices[0].message.content;
    console.log("✅ AI explanation generated");
    return response;

  } catch (error) {
    console.error("❌ OpenAI API Error:", error.message);
    return generateMinimalFallback(email, safeHibpBreaches, safeSocialPlatforms, safeSherlockPlatforms);
  }
}

// Username-specific analysis function
function generateUsernameAnalysis(username, sherlockPlatforms, socialPlatforms) {
  const safeSherlockPlatforms = Array.isArray(sherlockPlatforms) ? sherlockPlatforms : [];
  const safeSocialPlatforms = Array.isArray(socialPlatforms) ? socialPlatforms : [];
  
  const profileCount = safeSherlockPlatforms.length;
  
  // Get platform categories - safely handle platform objects
  const socialPlatforms_list = safeSherlockPlatforms.filter(p => {
    const platformName = (p.platform || '').toLowerCase();
    return ['instagram', 'twitter', 'facebook', 'tiktok', 'snapchat', 'reddit'].some(social => 
      platformName.includes(social)
    );
  });
  
  const professionalPlatforms = safeSherlockPlatforms.filter(p => {
    const platformName = (p.platform || '').toLowerCase();
    return ['linkedin', 'github', 'behance', 'dribbble'].some(prof => 
      platformName.includes(prof)
    );
  });
  
  const publicPlatforms = safeSherlockPlatforms.slice(0, 4).map(p => p.platform || 'Unknown').join(', ');
  
  return `
    <h3>Profile Discovery Results</h3>
    <p>Found your username on <strong class="font-semibold text-gray-800 dark:text-gray-200">${profileCount} platforms</strong>${publicPlatforms ? ` including ${publicPlatforms}` : ''}. ${profileCount >= 8 ? 'You have an active digital presence across multiple platforms.' : profileCount >= 4 ? 'You maintain a moderate online presence.' : profileCount >= 1 ? 'You have a selective digital presence.' : 'Your username maintains excellent privacy with no public profiles detected.'}</p>
    
    <h3>Digital Presence Audit</h3>
    <p>${profileCount >= 1 ? 'Take a moment to review these accounts - do you recognize all of them? Some might be old accounts you forgot about.' : 'No accounts found means excellent username privacy.'} ${socialPlatforms_list.length >= 2 ? 'Your social media accounts are part of your digital identity.' : ''} ${professionalPlatforms.length >= 1 ? 'Professional profiles can showcase your skills and experience.' : ''} ${profileCount >= 3 ? 'Having the same username across platforms makes it easy for people to find and connect with you.' : ''}</p>
    
    <h3>Taking Control</h3>
    <p>Having multiple online accounts is completely normal in today's digital world. ${profileCount >= 5 ? 'The key is knowing where your data lives and ensuring these accounts represent who you are today.' : profileCount >= 1 ? 'What matters is staying aware of your digital footprint and keeping it current.' : 'Your minimal digital presence gives you great control over your online identity.'} ${profileCount >= 3 ? 'You have the power to update, clean up, or remove any accounts that no longer serve you.' : ''}</p>
    
    <h3>Your Action Plan</h3>
    <ol>
      ${profileCount >= 1 ? '<li><strong class="font-semibold text-gray-800 dark:text-gray-200">Audit your accounts</strong> - Make sure you recognize all discovered platforms and remember creating them.</li>' : ''}
      ${profileCount >= 3 ? '<li><strong class="font-semibold text-gray-800 dark:text-gray-200">Clean up dormant accounts</strong> - Delete accounts you no longer use or that don\'t represent you anymore.</li>' : ''}
      <li><strong class="font-semibold text-gray-800 dark:text-gray-200">Review what\'s public</strong> - Check privacy settings and ensure only information you\'re comfortable sharing is visible.</li>
      ${profileCount >= 1 ? '<li><strong class="font-semibold text-gray-800 dark:text-gray-200">Request data deletion</strong> - Most platforms allow you to delete your data entirely if you no longer want to use their service.</li>' : ''}
    </ol>
    
    <h3>You're In Control</h3>
    <p>${profileCount >= 5 ? 'Having an active digital presence isn\'t a problem - it\'s about being intentional with it.' : profileCount >= 1 ? 'Your digital footprint reflects your online life, and you have full control over it.' : 'Your excellent privacy shows you\'re already in control of your digital presence.'} ${profileCount >= 1 ? 'You can adjust privacy settings, update information, or remove accounts anytime you want.' : ''} By checking your username, you\'re already taking charge of your digital identity - that\'s exactly what privacy-conscious people do.</p>
  `;
}

// Get detailed insights for personalization
function getBreachInsights(breaches) {
  if (!Array.isArray(breaches) || breaches.length === 0) {
    return {
      formattedBreaches: '',
      dataTypes: '',
      sensitiveData: [],
      oldestYear: null,
      yearsOld: 0,
      newestBreach: 'Unknown'
    };
  }

  const dataTypes = [...new Set(breaches.flatMap(b => b.dataClasses || []))];
  const sensitiveData = dataTypes.filter(type => 
    ['passwords', 'password', 'credit cards', 'phone numbers', 'addresses', 'dates of birth', 'social security numbers']
    .some(sensitive => type.toLowerCase().includes(sensitive))
  );
  
  const oldestBreach = breaches.reduce((oldest, breach) => {
    if (!breach.breachDate) return oldest;
    const date = new Date(breach.breachDate);
    return !oldest || date < oldest.date ? { date, title: breach.title } : oldest;
  }, null);
  
  const newestBreach = breaches.reduce((newest, breach) => {
    if (!breach.breachDate) return newest;
    const date = new Date(breach.breachDate);
    return !newest || date > newest.date ? { date, title: breach.title } : newest;
  }, null);
  
  return {
    formattedBreaches: breaches.slice(0, 5).map(b => 
      `${b.title || 'Unknown'} (${b.breachDate || 'Unknown date'}) - exposed: ${(b.dataClasses || ['Unknown']).slice(0, 3).join(', ')}`
    ).join('\n'),
    dataTypes: dataTypes.slice(0, 8).join(', '),
    sensitiveData,
    oldestYear: oldestBreach ? oldestBreach.date.getFullYear() : null,
    yearsOld: oldestBreach ? new Date().getFullYear() - oldestBreach.date.getFullYear() : 0,
    newestBreach: newestBreach ? newestBreach.title : 'Unknown'
  };
}

function getPlatformInsights(social, sherlock) {
  // Safely handle different data types
  const safeSocial = Array.isArray(social) ? social : [];
  const safeSherlock = Array.isArray(sherlock) ? sherlock : [];
  
  const highRiskPlatforms = ['facebook', 'twitter', 'instagram', 'snapchat'];
  const professionalPlatforms = ['linkedin', 'github', 'behance'];
  const dataPlatforms = ['adobe', 'canva', 'dropbox'];
  
  // Handle social platforms (could be strings or objects)
  const hasHighRisk = safeSocial.some(p => {
    const platformName = typeof p === 'string' ? p : (p.name || p.platform || '');
    return highRiskPlatforms.some(hr => platformName.toLowerCase().includes(hr));
  });
  
  // Handle sherlock platforms (objects with .platform property)
  const hasProfessional = safeSherlock.some(p => {
    const platformName = (p.platform || '').toLowerCase();
    return professionalPlatforms.some(pr => platformName.includes(pr));
  });
  
  return { hasHighRisk, hasProfessional };
}

// Enhanced risk calculation with specific factors
function calculateRiskMetrics(breaches, publicProfiles, platforms) {
  const safeBreaches = Array.isArray(breaches) ? breaches : [];
  const safePublicProfiles = Array.isArray(publicProfiles) ? publicProfiles : [];
  const safePlatforms = Array.isArray(platforms) ? platforms : [];

  let score = 0;
  let riskFactors = [];
  
  // Breach analysis
  if (safeBreaches.length >= 20) {
    score += 5;
    riskFactors.push('extensive breach history');
  } else if (safeBreaches.length >= 10) {
    score += 3;
    riskFactors.push('multiple breaches');
  } else if (safeBreaches.length >= 5) {
    score += 2;
    riskFactors.push('several breaches');
  }
  
  // Check for sensitive data exposure
  const sensitiveBreaches = safeBreaches.filter(b => 
    b.dataClasses?.some(dc => ['password', 'credit card', 'ssn', 'phone'].some(s => dc.toLowerCase().includes(s)))
  );
  if (sensitiveBreaches.length >= 3) {
    score += 3;
    riskFactors.push('sensitive data exposed');
  }
  
  // Old breach penalty (password reuse risk)
  const oldBreaches = safeBreaches.filter(b => {
    if (!b.breachDate) return false;
    return new Date().getFullYear() - new Date(b.breachDate).getFullYear() >= 4;
  });
  if (oldBreaches.length >= 5) {
    score += 2;
    riskFactors.push('old passwords likely reused');
  }
  
  // Public exposure
  if (safePublicProfiles.length >= 8) {
    score += 2;
    riskFactors.push('high public visibility');
  }
  
  // Platform spread
  if (safePlatforms.length >= 15) {
    score += 1;
    riskFactors.push('wide digital footprint');
  }
  
  let level;
  if (score >= 8) level = 'CRITICAL';
  else if (score >= 6) level = 'HIGH';
  else if (score >= 3) level = 'MEDIUM';
  else level = 'LOW';
  
  return { 
    score: Math.min(score, 10), 
    level,
    riskFactors: riskFactors.length ? riskFactors : ['minimal exposure detected']
  };
}

// Enhanced personalized fallback with proper structure
function generateMinimalFallback(email, breaches, socialPlatforms, sherlockPlatforms) {
  const safeBreaches = Array.isArray(breaches) ? breaches : [];
  const safeSocialPlatforms = Array.isArray(socialPlatforms) ? socialPlatforms : [];
  const safeSherlockPlatforms = Array.isArray(sherlockPlatforms) ? sherlockPlatforms : [];

  const breachCount = safeBreaches.length;
  const recentBreaches = safeBreaches
    .sort((a, b) => new Date(b.breachDate || 0) - new Date(a.breachDate || 0))
    .slice(0, 3);
  
  const breachDetails = getBreachInsights(safeBreaches);
  const riskMetrics = calculateRiskMetrics(safeBreaches, safeSherlockPlatforms, safeSocialPlatforms);
  
  const specificBreaches = recentBreaches.map(b => b.title || 'Unknown').join(', ') || 'recent breaches';
  const oldestYear = breachDetails.oldestYear;
  const yearsOld = breachDetails.yearsOld;
  
  // Safely get platform names
  const socialPlatformNames = safeSocialPlatforms
    .map(p => typeof p === 'string' ? p : (p.name || p.platform || 'Unknown'))
    .filter(name => name !== 'Unknown')
    .slice(0, 3);
  
  const sherlockPlatformNames = safeSherlockPlatforms
    .map(p => p.platform || 'Unknown')
    .filter(name => name !== 'Unknown')
    .slice(0, 2);
  
  return `
    <h3>Immediate Risks</h3>
    <p>${breachCount > 0 ? 
      `Your ${breachCount} breaches including ${specificBreaches} have exposed ${breachDetails.sensitiveData.length ? breachDetails.sensitiveData.slice(0, 2).join(' and ') : 'personal account data'}. ${yearsOld >= 4 ? `With breaches dating back to ${oldestYear}, any reused passwords are highly vulnerable to credential stuffing attacks.` : 'Recent exposures increase your risk of targeted phishing campaigns.'}` :
      'No major data breaches detected for your email address, which significantly reduces your exposure to credential-based attacks.'
    } ${riskMetrics.level} risk level detected.</p>
    
    <h3>Platform-Specific Risks</h3>
    <p>Your presence on ${socialPlatformNames.length ? socialPlatformNames.join(', ') : 'various'} platforms combined with ${safeSherlockPlatforms.length} public profiles creates ${safeSherlockPlatforms.length >= 5 ? 'a detailed digital fingerprint' : 'a manageable digital presence'}. ${safeSherlockPlatforms.length >= 5 ? 'Attackers can easily research your interests, connections, and communication style for sophisticated social engineering.' : 'Limited public exposure reduces social engineering risks.'} ${breachCount > 0 ? 'Cross-platform password reuse amplifies breach impact significantly.' : 'Without major breaches, your main risk comes from platform-specific vulnerabilities.'}</p>
    
    <h3>Long-term Concerns</h3>
    <p>${safeSherlockPlatforms.length >= 5 ? 'Your long-term risks include potential damage to your professional and personal reputation due to the high number of public profiles discovered. Bad actors may use your personal information to impersonate you, damage your reputation, or carry out targeted attacks.' : 'Your limited public profile exposure reduces long-term reputation risks, but maintaining awareness of your digital footprint remains important.'}</p>
    
    <h3>Action Plan</h3>
    <ol>
      ${breachCount > 0 ? 
        `<li><strong>Change passwords immediately</strong> for ${specificBreaches} and any accounts sharing those credentials.</li>` :
        '<li><strong>Maintain strong passwords</strong> and avoid reusing them across multiple platforms.</li>'
      }
      <li><strong>Enable 2FA</strong> on all ${socialPlatformNames.length ? socialPlatformNames.slice(0, 2).join(' and ') : 'important'} accounts plus email and banking.</li>
      <li><strong>Review privacy settings</strong> ${sherlockPlatformNames.length ? `on ${sherlockPlatformNames.join(' and ')} to limit public information visibility.` : 'on all public profiles to limit information visibility.'}</li>
    </ol>
    
    <h3>Positive Notes</h3>
    <p>Proactively scanning your digital footprint puts you ahead of 95% of internet users. ${breachCount <= 5 ? 'Your limited breach exposure is manageable with proper password hygiene.' : 'While your exposure is extensive, systematic security improvements will dramatically reduce your risk.'} Most attack vectors can be eliminated with password updates and 2FA activation.</p>
  `;
}

module.exports = { explainAttack };