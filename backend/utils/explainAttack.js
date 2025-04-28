const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function explainAttack(profile, piiExposed, attacks) {
  const messages = [
    {
      role: "system",
      content:
        "You are a cybersecurity analyst. Explain how each simulated phishing attack below uses exposed personal information (PII) from a user's social media profile to trick them.",
    },
    {
      role: "user",
      content: `
Profile Summary:
- Full Name: ${profile.fullName}
- Job Title: ${profile.jobTitle}
- Company: ${profile.company}
- City: ${profile.city}
- PII Exposed: ${piiExposed.join(", ")}

Simulated Attacks:
${attacks.map((a, i) => `${i + 1}. ${a.subject}\n${a.message}`).join("\n\n")}

For each, explain:
- Why this attack is effective
- What data is being exploited
- How to prevent it
      `,
    },
  ];

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
  });

  return chatCompletion.choices[0].message.content;
}

module.exports = { explainAttack };
