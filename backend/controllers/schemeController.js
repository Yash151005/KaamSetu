const { chatCompletion } = require('../utils/groqClient');
const schemesData = require('../data/schemes.json');

const SCHEME_ADVISOR_PROMPT = `You are a welfare scheme advisor for KaamSetu.
Worker profile: {profile}
Matched schemes: {schemes}

For each scheme rank by importance to this worker.
For each scheme provide:
- scheme_id: the original scheme ID
- rank: number (1 = most important)
- why_qualifies: 1 sentence in simple language explaining why this worker qualifies
- benefit: 1 sentence about the most important benefit
- next_step: 1 actionable sentence on exactly what to do next to enroll
- urgency: HIGH/MEDIUM/LOW

Respond in {language}.
Return ONLY a valid JSON array of objects.`;

/**
 * POST /api/schemes/match
 */
exports.matchSchemes = async (req, res) => {
  try {
    const { kaamId, profile, country } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'Profile is required' });
    }

    const workerCountry = country || profile.country || 'IN';

    // Step 1: Filter schemes by country
    const countrySchemes = schemesData.schemes.filter(s => s.country === workerCountry);

    // Step 2: Check eligibility rules
    const matched = countrySchemes.filter(scheme => {
      const elig = scheme.eligibility;

      // Check skill match
      if (elig.skills[0] !== 'all') {
        const workerSkill = (profile.skill || '').toLowerCase();
        const matches = elig.skills.some(s => 
          workerSkill.includes(s) || s.includes(workerSkill)
        );
        if (!matches) return false;
      }

      // Check age
      if (profile.age) {
        if (elig.min_age && profile.age < elig.min_age) return false;
        if (elig.max_age && elig.max_age < 900 && profile.age > elig.max_age) return false;
      }

      // Check income
      if (elig.max_income && profile.income && profile.income > elig.max_income) {
        return false;
      }

      return true;
    });

    // Step 3: Get AI ranking and explanations
    const language = profile.language || 'English';
    const prompt = SCHEME_ADVISOR_PROMPT
      .replace('{profile}', JSON.stringify(profile))
      .replace('{schemes}', JSON.stringify(matched.map(s => ({
        id: s.id, name: s.name, benefit: s.benefit, 
        description: s.description, category: s.category
      }))))
      .replace('{language}', language);

    let rankedSchemes;
    try {
      const aiResult = await chatCompletion(
        prompt,
        `Rank these ${matched.length} schemes for this ${profile.skill} worker in ${profile.current_location}`,
        { jsonMode: true }
      );
      rankedSchemes = JSON.parse(aiResult);
      if (!Array.isArray(rankedSchemes)) {
        // Sometimes Groq wraps in an object
        rankedSchemes = rankedSchemes.schemes || rankedSchemes.ranked_schemes || [rankedSchemes];
      }
    } catch (aiErr) {
      console.warn('AI ranking failed, using default order:', aiErr.message);
      rankedSchemes = matched.map((s, i) => ({
        scheme_id: s.id,
        rank: i + 1,
        why_qualifies: `As a ${profile.skill}, you are eligible for this scheme.`,
        benefit: s.benefit,
        next_step: s.enrollment_steps?.[0] || 'Visit the nearest government office.',
        urgency: i === 0 ? 'HIGH' : 'MEDIUM'
      }));
    }

    // Merge AI rankings with full scheme data
    const enrichedSchemes = rankedSchemes.map(ranked => {
      const fullScheme = matched.find(s => s.id === ranked.scheme_id) || matched[ranked.rank - 1];
      return {
        ...ranked,
        name: fullScheme?.name || ranked.scheme_id,
        description: fullScheme?.description,
        benefit_value: fullScheme?.benefit_value || 0,
        currency: fullScheme?.currency || 'INR',
        enrollment_url: fullScheme?.enrollment_url,
        enrollment_steps: fullScheme?.enrollment_steps,
        category: fullScheme?.category,
        ministry: fullScheme?.ministry,
        country: workerCountry
      };
    });

    // Calculate total benefit estimate
    const totalBenefit = enrichedSchemes.reduce((sum, s) => sum + (s.benefit_value || 0), 0);

    res.json({
      matched_schemes: enrichedSchemes.sort((a, b) => (a.rank || 99) - (b.rank || 99)),
      total_matched: enrichedSchemes.length,
      total_benefit_estimate: totalBenefit,
      currency: enrichedSchemes[0]?.currency || 'INR',
      worker_country: workerCountry
    });
  } catch (error) {
    console.error('Scheme matching error:', error);
    res.status(500).json({ error: 'Scheme matching failed' });
  }
};
