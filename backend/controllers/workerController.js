const QRCode = require('qrcode');
const { saveWorker, getWorker } = require('../utils/firebaseAdmin');

/**
 * Map location strings to state codes.
 */
const STATE_CODES = {
  'maharashtra': 'MH', 'delhi': 'DL', 'karnataka': 'KA', 'tamil nadu': 'TN',
  'bihar': 'BR', 'west bengal': 'WB', 'rajasthan': 'RJ', 'gujarat': 'GJ',
  'uttar pradesh': 'UP', 'madhya pradesh': 'MP', 'kerala': 'KL', 'punjab': 'PB',
  'andhra pradesh': 'AP', 'telangana': 'TS', 'odisha': 'OD', 'assam': 'AS',
  'são paulo': 'SP', 'rio de janeiro': 'RJ', 'minas gerais': 'MG', 'bahia': 'BA',
  'gauteng': 'GT', 'western cape': 'WC', 'kwazulu-natal': 'KN', 'limpopo': 'LP',
  'moscow': 'MO', 'saint petersburg': 'SP', 'novosibirsk': 'NS',
  'guangdong': 'GD', 'zhejiang': 'ZJ', 'sichuan': 'SC', 'beijing': 'BJ',
  'mumbai': 'MH', 'pune': 'MH', 'chennai': 'TN', 'bengaluru': 'KA',
  'kolkata': 'WB', 'patna': 'BR', 'jaipur': 'RJ', 'ahmedabad': 'GJ'
};

function getStateCode(location) {
  if (!location) return 'XX';
  const lower = location.toLowerCase();
  for (const [key, code] of Object.entries(STATE_CODES)) {
    if (lower.includes(key)) return code;
  }
  return lower.substring(0, 2).toUpperCase();
}

/**
 * POST /api/workers/register
 */
exports.register = async (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    // Generate KaamID
    const stateCode = getStateCode(profile.current_location);
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const kaamId = `KAAM-${stateCode}-${year}-${random}`;

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(kaamId, {
      width: 200,
      margin: 1,
      color: { dark: '#1a3a6b', light: '#ffffff' }
    });

    // Determine country from location
    const country = detectCountry(profile.current_location, profile.language);

    // Save to database (non-blocking)
    saveWorker(kaamId, {
      profile: { ...profile, country },
      schemes: [],
      country
    }).catch(err => console.error('Worker save error:', err));

    // Cache profile for offline access
    res.json({
      kaamId,
      qrCode: qrDataUrl,
      profile: { ...profile, country },
      message: 'Worker registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * GET /api/workers/:kaamId
 */
exports.getWorker = async (req, res) => {
  try {
    const { kaamId } = req.params;
    const worker = await getWorker(kaamId);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({ error: 'Failed to fetch worker data' });
  }
};

function detectCountry(location, language) {
  if (!location && !language) return 'IN';
  const loc = (location || '').toLowerCase();
  const lang = (language || '').toLowerCase();

  if (['portuguese', 'pt'].includes(lang) || ['são paulo', 'rio', 'brazil', 'brasil'].some(c => loc.includes(c))) return 'BR';
  if (['zulu', 'zu'].includes(lang) || ['johannesburg', 'cape town', 'durban', 'south africa', 'gauteng'].some(c => loc.includes(c))) return 'ZA';
  if (['russian', 'ru'].includes(lang) || ['moscow', 'russia', 'saint petersburg'].some(c => loc.includes(c))) return 'RU';
  if (['mandarin', 'zh', 'chinese'].includes(lang) || ['beijing', 'shanghai', 'guangzhou', 'china', 'shenzhen'].some(c => loc.includes(c))) return 'CN';
  return 'IN';
}
