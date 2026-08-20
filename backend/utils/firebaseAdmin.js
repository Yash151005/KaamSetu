const admin = require('firebase-admin');

let db = null;
let useInMemory = false;

// In-memory store for when Firebase isn't configured
const inMemoryStore = {
  workers: new Map(),
  stats: { totalWorkers: 0, totalDistress: 0 }
};

function initializeFirebase() {
  if (db) return db;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        })
      });
      db = admin.firestore();
      console.log('✅ Firebase Firestore connected');
      return db;
    } catch (error) {
      console.warn('⚠️  Firebase init failed:', error.message);
    }
  }

  console.log('📦 Using in-memory store (Firebase not configured)');
  useInMemory = true;
  return null;
}

// Initialize on load
initializeFirebase();

/**
 * Save a worker record.
 */
async function saveWorker(kaamId, data) {
  if (useInMemory) {
    inMemoryStore.workers.set(kaamId, { ...data, kaamId, createdAt: new Date().toISOString() });
    inMemoryStore.stats.totalWorkers = inMemoryStore.workers.size;
    if (data.profile?.distress) inMemoryStore.stats.totalDistress++;
    return;
  }
  await db.collection('workers').doc(kaamId).set({
    ...data,
    kaamId,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Get a worker by KaamID.
 */
async function getWorker(kaamId) {
  if (useInMemory) {
    return inMemoryStore.workers.get(kaamId) || null;
  }
  const doc = await db.collection('workers').doc(kaamId).get();
  return doc.exists ? doc.data() : null;
}

/**
 * Get aggregated policy stats.
 */
async function getPolicyStats() {
  if (useInMemory) {
    const workers = Array.from(inMemoryStore.workers.values());
    const byCountry = {};
    const bySkill = {};
    let distressCount = 0;

    workers.forEach(w => {
      const profile = w.profile || w;
      const country = profile.country || 'IN';
      const skill = profile.skill || 'Unknown';

      byCountry[country] = (byCountry[country] || 0) + 1;
      bySkill[skill] = (bySkill[skill] || 0) + 1;
      if (profile.distress) distressCount++;
    });

    return {
      total_workers: workers.length,
      distress_count: distressCount,
      by_country: Object.entries(byCountry).map(([country, count]) => ({ country, count })),
      by_skill: Object.entries(bySkill).map(([skill, count]) => ({ skill, count })),
      schemes_matched_today: Math.floor(workers.length * 2.3)
    };
  }

  const snapshot = await db.collection('workers').get();
  const workers = snapshot.docs.map(d => d.data());
  const byCountry = {};
  const bySkill = {};
  let distressCount = 0;

  workers.forEach(w => {
    const profile = w.profile || w;
    const country = profile.country || 'IN';
    const skill = profile.skill || 'Unknown';

    byCountry[country] = (byCountry[country] || 0) + 1;
    bySkill[skill] = (bySkill[skill] || 0) + 1;
    if (profile.distress) distressCount++;
  });

  return {
    total_workers: workers.length,
    distress_count: distressCount,
    by_country: Object.entries(byCountry).map(([country, count]) => ({ country, count })),
    by_skill: Object.entries(bySkill).map(([skill, count]) => ({ skill, count })),
    schemes_matched_today: Math.floor(workers.length * 2.3)
  };
}

/**
 * Get heatmap data points.
 */
async function getHeatmapData(filters = {}) {
  if (useInMemory) {
    const workers = Array.from(inMemoryStore.workers.values());
    return workers
      .filter(w => {
        const profile = w.profile || w;
        if (filters.country && profile.country !== filters.country) return false;
        if (filters.distressType && profile.distress_type !== filters.distressType) return false;
        return true;
      })
      .filter(w => (w.profile || w).location)
      .map(w => {
        const profile = w.profile || w;
        return {
          lat: profile.location?.lat || 19.076,
          lng: profile.location?.lng || 72.877,
          weight: profile.distress ? 3 : 1,
          type: profile.distress_type || 'none',
          skill: profile.skill,
          country: profile.country
        };
      });
  }

  let query = db.collection('workers');
  if (filters.country) {
    query = query.where('profile.country', '==', filters.country);
  }

  const snapshot = await query.get();
  return snapshot.docs
    .map(d => d.data())
    .filter(w => (w.profile || w).location)
    .map(w => {
      const profile = w.profile || w;
      return {
        lat: profile.location?.lat || 19.076,
        lng: profile.location?.lng || 72.877,
        weight: profile.distress ? 3 : 1,
        type: profile.distress_type || 'none',
        skill: profile.skill,
        country: profile.country
      };
    });
}

/**
 * Bulk insert workers (for seeding).
 */
async function bulkInsertWorkers(workers) {
  if (useInMemory) {
    workers.forEach(w => {
      inMemoryStore.workers.set(w.kaamId, w);
    });
    inMemoryStore.stats.totalWorkers = inMemoryStore.workers.size;
    console.log(`📦 In-memory: seeded ${workers.length} workers`);
    return;
  }

  const batch = db.batch();
  let count = 0;

  for (const worker of workers) {
    const ref = db.collection('workers').doc(worker.kaamId);
    batch.set(ref, worker);
    count++;

    // Firestore batch limit is 500
    if (count % 490 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} workers...`);
    }
  }

  await batch.commit();
  console.log(`✅ Seeded ${count} workers to Firestore`);
}

module.exports = {
  saveWorker,
  getWorker,
  getPolicyStats,
  getHeatmapData,
  bulkInsertWorkers,
  inMemoryStore
};
