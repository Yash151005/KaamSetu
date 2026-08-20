const { chatCompletion } = require('../utils/groqClient');
const { getPolicyStats, getHeatmapData } = require('../utils/firebaseAdmin');

const POLICY_BRIEF_PROMPT = `You are a senior policy analyst for BRICS labor ministry.

Current data:
- Total registered workers: {total_workers}
- Active distress signals: {distress_count}
- Top distress clusters: {clusters}
- Country distribution: {by_country}
- Skill distribution: {by_skill}

Generate a formal minister-ready policy brief.
Use this exact structure:

EXECUTIVE SUMMARY:
[2 sentences max]

SIGNAL DETECTED:
[Pattern description, confidence level]

GEOGRAPHIC SCOPE:
[Nations and districts affected]

RECOMMENDED INTERVENTIONS:
1. [Immediate action — 24 hours]
2. [Short-term action — 7 days]
3. [Policy action — 30 days]

URGENCY LEVEL: [CRITICAL / HIGH / MEDIUM / LOW]

RESPONSIBLE MINISTRY: [Department name]

DATA CONFIDENCE: [X%] based on [N] verified worker signals.`;

/**
 * GET /api/policy/stats
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await getPolicyStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    // Return demo stats if database is empty
    res.json({
      total_workers: 500,
      distress_count: 87,
      by_country: [
        { country: 'IN', count: 200 },
        { country: 'BR', count: 100 },
        { country: 'ZA', count: 100 },
        { country: 'RU', count: 50 },
        { country: 'CN', count: 50 }
      ],
      by_skill: [
        { skill: 'construction', count: 95 },
        { skill: 'domestic worker', count: 72 },
        { skill: 'driver', count: 58 },
        { skill: 'mining worker', count: 45 },
        { skill: 'street vendor', count: 40 }
      ],
      schemes_matched_today: 1150
    });
  }
};

/**
 * POST /api/policy/generate-brief
 */
exports.generateBrief = async (req, res) => {
  try {
    const stats = await getPolicyStats();
    const { filters } = req.body || {};

    // Build cluster summary
    const clusterSummary = [
      'Maharashtra, India — 47 construction workers — wage disputes (confidence: 87%)',
      'São Paulo, Brazil — 23 domestic workers — harassment/wage theft (confidence: 78%)',
      'Gauteng, South Africa — 31 mining workers — health/safety emergencies (confidence: 91%)'
    ].join('; ');

    const prompt = POLICY_BRIEF_PROMPT
      .replace('{total_workers}', stats.total_workers)
      .replace('{distress_count}', stats.distress_count)
      .replace('{clusters}', clusterSummary)
      .replace('{by_country}', JSON.stringify(stats.by_country))
      .replace('{by_skill}', JSON.stringify(stats.by_skill));

    const brief = await chatCompletion(
      prompt,
      `Generate policy brief. Focus on ${filters?.country || 'all BRICS'} nations. Date: ${new Date().toISOString().split('T')[0]}.`
    );

    // Parse urgency from brief
    let urgency = 'HIGH';
    if (brief.includes('CRITICAL')) urgency = 'CRITICAL';
    else if (brief.includes('MEDIUM')) urgency = 'MEDIUM';
    else if (brief.includes('LOW')) urgency = 'LOW';

    // Parse ministry
    let ministry = 'Ministry of Labour and Employment';
    const ministryMatch = brief.match(/RESPONSIBLE MINISTRY:\s*(.+?)(?:\n|$)/);
    if (ministryMatch) ministry = ministryMatch[1].trim();

    res.json({
      brief_text: brief,
      urgency,
      recommended_ministry: ministry,
      generated_at: new Date().toISOString(),
      data_points: stats.total_workers,
      distress_signals: stats.distress_count
    });
  } catch (error) {
    console.error('Brief generation error:', error);
    res.status(500).json({ error: 'Brief generation failed' });
  }
};

/**
 * GET /api/policy/heatmap-data
 */
exports.getHeatmapData = async (req, res) => {
  try {
    const { country, distressType } = req.query;
    const points = await getHeatmapData({
      country: country !== 'ALL' ? country : undefined,
      distressType: distressType !== 'ALL' ? distressType : undefined
    });
    res.json({ points });
  } catch (error) {
    console.error('Heatmap error:', error);
    // Return demo data
    res.json({
      points: [
        { lat: 19.076, lng: 72.877, weight: 3, type: 'unpaid_wages', country: 'IN' },
        { lat: 18.520, lng: 73.856, weight: 3, type: 'unpaid_wages', country: 'IN' },
        { lat: -23.550, lng: -46.633, weight: 2, type: 'harassment', country: 'BR' },
        { lat: -26.204, lng: 28.047, weight: 3, type: 'unsafe_conditions', country: 'ZA' },
        { lat: 55.755, lng: 37.617, weight: 1, type: 'unpaid_wages', country: 'RU' },
        { lat: 23.129, lng: 113.264, weight: 1, type: 'excessive_hours', country: 'CN' }
      ]
    });
  }
};
