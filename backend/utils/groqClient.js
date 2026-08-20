const Groq = require('groq-sdk');

let groqClient = null;

function getGroqClient() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Send a chat completion request to Groq.
 * Falls back to mock responses when API key is not configured.
 */
async function chatCompletion(systemPrompt, userMessage, options = {}) {
  const client = getGroqClient();

  if (!client) {
    console.warn('⚠️  GROQ_API_KEY not set — returning mock response');
    return getMockResponse(systemPrompt, userMessage);
  }

  try {
    const completion = await client.chat.completions.create({
      model: options.model || 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: options.temperature || 0.3,
      max_tokens: options.maxTokens || 2048,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API error:', error.message);

    // Retry once on transient errors
    if (error.status === 429 || error.status >= 500) {
      console.log('Retrying Groq request in 2 seconds...');
      await new Promise(r => setTimeout(r, 2000));
      try {
        const retry = await client.chat.completions.create({
          model: options.model || 'llama3-70b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: options.temperature || 0.3,
          max_tokens: options.maxTokens || 2048,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined
        });
        return retry.choices[0]?.message?.content || '';
      } catch (retryError) {
        console.error('Groq retry failed:', retryError.message);
      }
    }

    return getMockResponse(systemPrompt, userMessage);
  }
}

/**
 * Generate mock responses when Groq is unavailable.
 */
function getMockResponse(systemPrompt, userMessage) {
  // Profile extraction mock
  if (systemPrompt.includes('worker profile extractor')) {
    return JSON.stringify({
      name: 'Demo Worker',
      skill: 'Construction Mason',
      experience_years: 5,
      current_location: 'Mumbai, Maharashtra',
      home_location: 'Patna, Bihar',
      language: 'Hindi',
      distress: false,
      distress_type: null,
      raw_input: userMessage
    });
  }

  // Scheme matching mock
  if (systemPrompt.includes('welfare scheme advisor')) {
    return JSON.stringify([
      {
        scheme_id: 'eshram',
        rank: 1,
        why_qualifies: 'You are an informal worker and qualify for registration.',
        benefit: 'Accidental insurance cover of ₹2 lakh',
        next_step: 'Visit your nearest CSC center with Aadhaar card to register.',
        urgency: 'HIGH'
      },
      {
        scheme_id: 'pmjay',
        rank: 2,
        why_qualifies: 'Your income level makes you eligible for free health insurance.',
        benefit: 'Free health insurance cover of ₹5 lakh per year for your family',
        next_step: 'Visit any empaneled hospital with Aadhaar to check eligibility.',
        urgency: 'HIGH'
      },
      {
        scheme_id: 'bocw',
        rank: 3,
        why_qualifies: 'As a construction worker with over 90 days of work, you qualify.',
        benefit: 'Education support for children, pension, and medical aid',
        next_step: 'Register at the Labour Department office with work certificate.',
        urgency: 'MEDIUM'
      }
    ]);
  }

  // Policy brief mock
  if (systemPrompt.includes('senior policy analyst')) {
    return `EXECUTIVE SUMMARY:
Analysis of 500+ registered workers across BRICS nations reveals a critical wage dispute cluster in Maharashtra, India, affecting 47 construction workers. Concurrent domestic worker distress signals detected in São Paulo, Brazil.

SIGNAL DETECTED:
Wage dispute reports increased 340% in Pune-Mumbai corridor over the past 7 days (confidence: 87%). Pattern matches pre-strike signature from Q2 2025.

GEOGRAPHIC SCOPE:
Primary: Maharashtra, India (Pune, Mumbai, Thane districts)
Secondary: São Paulo, Brazil (domestic workers)
Tertiary: Gauteng, South Africa (mining sector health concerns)

RECOMMENDED INTERVENTIONS:
1. [Immediate — 24 hours] Deploy mobile labour court in Pune district. Contact top 5 construction contractors for wage audit.
2. [Short-term — 7 days] Activate BOCW welfare fund disbursement for affected workers. Set up grievance redressal camp.
3. [Policy action — 30 days] Propose mandatory digital wage receipts for construction sector in Maharashtra.

URGENCY LEVEL: CRITICAL

RESPONSIBLE MINISTRY: Ministry of Labour and Employment, Government of India (Primary); Ministério do Trabalho, Brazil (Secondary)

DATA CONFIDENCE: 87% based on 47 verified worker signals from 3 districts.`;
  }

  return 'Mock response — configure GROQ_API_KEY for real AI responses.';
}

module.exports = { chatCompletion };
