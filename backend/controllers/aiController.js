const { chatCompletion } = require('../utils/groqClient');
const axios = require('axios');

const PROFILE_SYSTEM_PROMPT = `You are a worker profile extractor for KaamSetu.
Extract from the worker's statement:
- Full name (if mentioned)
- Primary skill (e.g. mason, welder, domestic worker, driver)
- Years of experience
- Current city/state
- Home state/country
- Preferred language
- Any distress signals (unpaid wages, injury, unsafe conditions)

Return ONLY valid JSON in this exact format:
{
  "name": "string or Unknown",
  "skill": "string",
  "experience_years": 0,
  "current_location": "string",
  "home_location": "string",
  "language": "string",
  "distress": false,
  "distress_type": null,
  "raw_input": "string"
}`;

/**
 * POST /api/ai/extract-profile
 * Extracts structured worker profile from natural language input.
 */
exports.extractProfile = async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Translate to English if needed
    let processedText = text;
    let detectedLang = language || 'en';

    if (language && language !== 'en' && language !== 'English') {
      try {
        const translated = await translateText(text, 'en');
        processedText = translated.translatedText || text;
        detectedLang = translated.detectedLanguage || language;
      } catch (translateErr) {
        console.warn('Translation failed, using original text:', translateErr.message);
      }
    }

    // Extract profile via Groq
    const result = await chatCompletion(PROFILE_SYSTEM_PROMPT, processedText, { jsonMode: true });

    let profile;
    try {
      profile = JSON.parse(result);
    } catch (parseErr) {
      // Try to extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        profile = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Ensure all fields exist
    profile = {
      name: profile.name || 'Unknown',
      skill: profile.skill || 'General Worker',
      experience_years: profile.experience_years || 0,
      current_location: profile.current_location || 'Not specified',
      home_location: profile.home_location || 'Not specified',
      language: profile.language || detectedLang,
      distress: profile.distress || false,
      distress_type: profile.distress_type || null,
      raw_input: text
    };

    res.json({
      profile,
      confidence: profile.name !== 'Unknown' ? 0.85 : 0.5,
      detected_language: detectedLang
    });
  } catch (error) {
    console.error('Profile extraction error:', error);
    res.status(500).json({
      error: 'Profile extraction failed',
      profile: {
        name: 'Unknown',
        skill: 'General Worker',
        experience_years: 0,
        current_location: 'Not specified',
        home_location: 'Not specified',
        language: req.body.language || 'en',
        distress: false,
        distress_type: null,
        raw_input: req.body.text || ''
      },
      confidence: 0.3
    });
  }
};

/**
 * POST /api/ai/translate
 * Translates text using Google Translate API.
 */
exports.translate = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await translateText(text, targetLanguage || 'en');
    res.json(result);
  } catch (error) {
    console.error('Translation error:', error);
    res.json({
      translatedText: req.body.text,
      detectedLanguage: 'unknown',
      error: 'Translation service unavailable'
    });
  }
};

/**
 * POST /api/ai/speak
 * Converts text to speech using Google TTS API.
 */
exports.speak = async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;

    if (!apiKey) {
      return res.json({
        audioBase64: null,
        message: 'TTS not configured — use browser speech synthesis as fallback'
      });
    }

    const langMap = {
      'Hindi': 'hi-IN', 'English': 'en-IN', 'Portuguese': 'pt-BR',
      'Mandarin': 'cmn-CN', 'Russian': 'ru-RU', 'Zulu': 'zu-ZA',
      'Tamil': 'ta-IN', 'Bengali': 'bn-IN', 'Arabic': 'ar-XA',
      'Amharic': 'am-ET', 'Farsi': 'fa-IR', 'Indonesian': 'id-ID'
    };

    const languageCode = langMap[language] || 'en-IN';

    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        input: { text: text.substring(0, 500) },
        voice: { languageCode, ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 }
      }
    );

    res.json({ audioBase64: response.data.audioContent });
  } catch (error) {
    console.error('TTS error:', error.message);
    res.json({
      audioBase64: null,
      message: 'TTS service error — use browser speech synthesis as fallback'
    });
  }
};

/**
 * Helper: translate text using Google Cloud Translation API.
 */
async function translateText(text, targetLanguage) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  GOOGLE_TRANSLATE_API_KEY not set — skipping translation');
    return { translatedText: text, detectedLanguage: 'unknown' };
  }

  const response = await axios.post(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    { q: text, target: targetLanguage, format: 'text' }
  );

  const translation = response.data.data.translations[0];
  return {
    translatedText: translation.translatedText,
    detectedLanguage: translation.detectedSourceLanguage
  };
}
