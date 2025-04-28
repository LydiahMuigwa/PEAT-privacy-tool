const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { detectPII } = require('./utils/piiDetector');

const app = express();
app.use(cors());
app.use(express.json());

// Load merged profiles from local file
const profilePath = path.join(__dirname, 'data', 'merged_social_profiles.json');
const mergedProfiles = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

const parseJSONSafely = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
};

const generateSimulatedAttack = (profile) => {
  const name = profile.fullName || 'User';
  const company = profile.company?.name || 'your company';
  const jobTitle = profile.jobTitle || 'employee';
  const email = profile.email || 'you@example.com';
  const city = profile.city || 'your city';

  return [
    {
      type: 'Phishing Email',
      subject: 'Action Required: Payroll Verification',
      message: `Hi ${name},\n\nWe're updating our payroll records for ${company}. Please verify your bank account information to avoid delays.\n\n[Click here to verify now]`,
      attackerGoal: 'Credential Harvesting'
    },
    {
      type: 'Impersonation Message',
      subject: `From your CEO (${company})`,
      message: `Hello ${name}, I need you to urgently purchase some gift cards for a client meeting. Please reply once done.`,
      attackerGoal: 'Impersonation / Gift Card Scam'
    },
    {
      type: 'Location-Based Scam',
      subject: 'Local Job Opportunity in ' + city,
      message: `Hi ${name}, we saw your experience as a ${jobTitle} and have a freelance offer in ${city}. Click to learn more!`,
      attackerGoal: 'Malicious Link Click'
    }
  ];
};

app.get('/', (req, res) => {
  res.send('🌱 PEAT backend is up and running!');
});

app.post('/api/scrape', (req, res) => {
  const { url } = req.body;
  let matchedProfile = null;

  try {
    const urlObj = new URL(url);
    const profileParam = urlObj.searchParams.get('profile');
    const pathParts = urlObj.pathname.split('/');
    const usernameOrName = pathParts[pathParts.length - 1].toLowerCase();

    if (profileParam !== null && !isNaN(profileParam)) {
      matchedProfile = mergedProfiles[parseInt(profileParam)];
    } else {
      matchedProfile = mergedProfiles.find(profile =>
        profile.fullName?.toLowerCase().includes(usernameOrName) ||
        profile.username?.toLowerCase() === usernameOrName
      );
    }
  } catch {
    matchedProfile = null;
  }

  if (!matchedProfile) {
    return res.status(404).json({ error: 'No matching user profile found.' });
  }

  const piiExposed = detectPII(matchedProfile);
  const educationEntries = parseJSONSafely(matchedProfile.education);
  const companyData = parseJSONSafely(matchedProfile.company);

  const result = {
    url,
    fullName: matchedProfile.fullName,
    dataFound: Object.keys(matchedProfile).filter((key) => !!matchedProfile[key]),
    potentialRisks: piiExposed.length > 0 ? ['Phishing', 'Impersonation'] : [],
    piiExposed,
    timeline: [
      { label: 'Full Name', date: '2018-04-15' },
      { label: 'Education', date: '2019-09-01' },
      { label: 'Job Title', date: '2021-03-20' },
      { label: 'Company', date: '2023-01-10' }
    ],
    message: `Simulated analysis of ${url}`,
    photo: matchedProfile.photo,
    profileMeta: {
      city: matchedProfile.city,
      country: matchedProfile.country,
      jobTitle: matchedProfile.jobTitle,
      company: companyData.name || 'Private Company',
      education: educationEntries.map(e => e.title).join(', ')
    },
    privacyTips: piiExposed.map(pii => `Avoid oversharing your ${pii.toLowerCase()} on social platforms.`),
    educationSuggestions: piiExposed.map(pii => ({
      title: `${pii} Privacy 101`,
      level: 'Beginner',
      description: `Learn how to protect your ${pii.toLowerCase()} from exposure.`,
      tips: [`Don’t publish your ${pii.toLowerCase()} on public social media profiles.`]
    })),
    simulatedAttacks: generateSimulatedAttack(matchedProfile)
  };

  res.json(result);
});

app.get('/api/education', (req, res) => {
  const lessons = [
    {
      pii: 'Email Address',
      title: 'Email Protection Basics',
      level: 'Beginner',
      description: 'Learn to reduce exposure of personal email addresses online.',
      tips: ['Use aliases for online signups.', 'Avoid putting your email in bios.']
    },
    {
      pii: 'Phone Number',
      title: 'Phone Privacy Techniques',
      level: 'Intermediate',
      description: 'Understand how to prevent SIM swaps and spam.',
      tips: ['Don’t publish your phone number publicly.']
    },
    {
      pii: 'Full Name',
      title: 'Identity Protection',
      level: 'Beginner',
      description: 'Tips on reducing impersonation risks tied to your full name.',
      tips: ['Use display names on public accounts.']
    }
  ];
  res.json(lessons);
});

const { explainAttack } = require('./utils/explainAttack');

app.post('/api/explain-attack', async (req, res) => {
  const { profile, piiExposed, simulatedAttacks } = req.body;

  try {
    const explanation = await explainAttack(profile, piiExposed, simulatedAttacks);
    res.json({ explanation });
  } catch (err) {
    console.error('GPT error:', err.message);
    res.status(500).json({ error: 'Failed to generate attack explanation.' });
  }
});


app.post('/api/log-scan', (req, res) => {
  console.log('📦 Scan logged:', req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
