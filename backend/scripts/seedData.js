/**
 * Seed script — generates 500 realistic worker records across BRICS nations.
 * Run: node scripts/seedData.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { bulkInsertWorkers } = require('../utils/firebaseAdmin');

// Real locations with coordinates
const locations = {
  IN: [
    { state: 'Maharashtra', cities: [
      { city: 'Mumbai', lat: 19.076, lng: 72.877 },
      { city: 'Pune', lat: 18.520, lng: 73.856 },
      { city: 'Nagpur', lat: 21.145, lng: 79.088 },
      { city: 'Thane', lat: 19.218, lng: 72.978 }
    ]},
    { state: 'Delhi', cities: [
      { city: 'New Delhi', lat: 28.613, lng: 77.209 },
      { city: 'Noida', lat: 28.535, lng: 77.391 }
    ]},
    { state: 'Karnataka', cities: [
      { city: 'Bengaluru', lat: 12.971, lng: 77.594 },
      { city: 'Mysuru', lat: 12.295, lng: 76.639 }
    ]},
    { state: 'Tamil Nadu', cities: [
      { city: 'Chennai', lat: 13.082, lng: 80.270 },
      { city: 'Coimbatore', lat: 11.016, lng: 76.955 }
    ]},
    { state: 'Bihar', cities: [
      { city: 'Patna', lat: 25.594, lng: 85.137 },
      { city: 'Gaya', lat: 24.795, lng: 84.999 }
    ]},
    { state: 'West Bengal', cities: [
      { city: 'Kolkata', lat: 22.572, lng: 88.363 }
    ]},
    { state: 'Rajasthan', cities: [
      { city: 'Jaipur', lat: 26.912, lng: 75.787 }
    ]},
    { state: 'Gujarat', cities: [
      { city: 'Ahmedabad', lat: 23.022, lng: 72.571 },
      { city: 'Surat', lat: 21.170, lng: 72.831 }
    ]}
  ],
  BR: [
    { state: 'São Paulo', cities: [
      { city: 'São Paulo', lat: -23.550, lng: -46.633 },
      { city: 'Campinas', lat: -22.905, lng: -47.060 },
      { city: 'Guarulhos', lat: -23.454, lng: -46.533 }
    ]},
    { state: 'Rio de Janeiro', cities: [
      { city: 'Rio de Janeiro', lat: -22.906, lng: -43.172 },
      { city: 'Niterói', lat: -22.883, lng: -43.103 }
    ]},
    { state: 'Minas Gerais', cities: [
      { city: 'Belo Horizonte', lat: -19.917, lng: -43.934 }
    ]},
    { state: 'Bahia', cities: [
      { city: 'Salvador', lat: -12.971, lng: -38.510 }
    ]}
  ],
  ZA: [
    { state: 'Gauteng', cities: [
      { city: 'Johannesburg', lat: -26.204, lng: 28.047 },
      { city: 'Pretoria', lat: -25.747, lng: 28.229 },
      { city: 'Soweto', lat: -26.267, lng: 27.858 }
    ]},
    { state: 'Western Cape', cities: [
      { city: 'Cape Town', lat: -33.924, lng: 18.424 }
    ]},
    { state: 'KwaZulu-Natal', cities: [
      { city: 'Durban', lat: -29.858, lng: 31.029 }
    ]},
    { state: 'Limpopo', cities: [
      { city: 'Polokwane', lat: -23.896, lng: 29.448 }
    ]}
  ],
  RU: [
    { state: 'Moscow Oblast', cities: [
      { city: 'Moscow', lat: 55.755, lng: 37.617 }
    ]},
    { state: 'Saint Petersburg', cities: [
      { city: 'Saint Petersburg', lat: 59.934, lng: 30.335 }
    ]},
    { state: 'Novosibirsk Oblast', cities: [
      { city: 'Novosibirsk', lat: 55.008, lng: 82.935 }
    ]},
    { state: 'Sverdlovsk Oblast', cities: [
      { city: 'Yekaterinburg', lat: 56.838, lng: 60.597 }
    ]}
  ],
  CN: [
    { state: 'Guangdong', cities: [
      { city: 'Guangzhou', lat: 23.129, lng: 113.264 },
      { city: 'Shenzhen', lat: 22.543, lng: 114.057 },
      { city: 'Dongguan', lat: 23.020, lng: 113.751 }
    ]},
    { state: 'Zhejiang', cities: [
      { city: 'Hangzhou', lat: 30.274, lng: 120.155 }
    ]},
    { state: 'Sichuan', cities: [
      { city: 'Chengdu', lat: 30.572, lng: 104.066 }
    ]},
    { state: 'Beijing', cities: [
      { city: 'Beijing', lat: 39.904, lng: 116.407 }
    ]}
  ]
};

const skills = {
  IN: ['mason', 'construction', 'carpenter', 'plumber', 'electrician', 'domestic worker', 'driver', 'street vendor', 'welder', 'painter', 'tailor', 'agricultural labourer'],
  BR: ['domestic worker', 'construction', 'driver', 'street vendor', 'agricultural labourer', 'mason', 'electrician', 'cleaner', 'cook', 'security guard'],
  ZA: ['mining worker', 'domestic worker', 'construction', 'security guard', 'driver', 'farm worker', 'cleaner', 'mason', 'electrician', 'street vendor'],
  RU: ['construction', 'driver', 'cleaner', 'warehouse worker', 'electrician', 'plumber', 'cook', 'security guard', 'agricultural labourer', 'welder'],
  CN: ['factory worker', 'construction', 'driver', 'domestic worker', 'street vendor', 'delivery rider', 'warehouse worker', 'welder', 'electrician', 'cook']
};

const distressTypes = ['unpaid_wages', 'unsafe_conditions', 'injury', 'harassment', 'excessive_hours', 'wage_theft'];

const indianNames = ['Raju Kumar', 'Sita Devi', 'Mohammed Ismail', 'Priya Sharma', 'Arun Singh', 'Lakshmi Bai', 'Ramesh Yadav', 'Sunita Kumari', 'Vikram Patel', 'Meena Devi', 'Suresh Gupta', 'Kamla Devi', 'Rajendra Prasad', 'Asha Kumari', 'Dinesh Thakur'];
const brazilianNames = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Souza', 'Pedro Costa', 'Francisca Lima', 'José Pereira', 'Antônia Rodrigues', 'Paulo Ferreira', 'Lucia Almeida'];
const saNames = ['Thabo Molefe', 'Nomsa Dlamini', 'Sipho Nkosi', 'Zanele Mkhize', 'Bongani Zulu', 'Lindiwe Khumalo', 'Mandla Ndlovu', 'Precious Moyo', 'Sibusiso Cele', 'Nokuthula Shabalala'];
const russianNames = ['Alexei Petrov', 'Olga Ivanova', 'Dmitri Smirnov', 'Natalia Kuznetsova', 'Sergei Popov', 'Elena Sokolova', 'Andrei Novikov', 'Marina Morozova', 'Viktor Volkov', 'Tatiana Pavlova'];
const chineseNames = ['Zhang Wei', 'Li Na', 'Wang Fang', 'Liu Yang', 'Chen Jie', 'Zhao Min', 'Sun Li', 'Zhou Ping', 'Wu Gang', 'Xu Hong'];

const namesByCountry = { IN: indianNames, BR: brazilianNames, ZA: saNames, RU: russianNames, CN: chineseNames };

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function jitter(val, range) { return val + (Math.random() - 0.5) * range; }

function generateWorkers() {
  const workers = [];
  const distribution = { IN: 200, BR: 100, ZA: 100, RU: 50, CN: 50 };

  for (const [country, count] of Object.entries(distribution)) {
    for (let i = 0; i < count; i++) {
      const stateData = randomPick(locations[country]);
      const cityData = randomPick(stateData.cities);
      const skill = randomPick(skills[country]);
      const name = randomPick(namesByCountry[country]);

      // Simulate distress clusters
      let distress = false;
      let distressType = null;

      // Maharashtra construction wage dispute cluster
      if (country === 'IN' && stateData.state === 'Maharashtra' && ['mason', 'construction', 'carpenter', 'welder'].includes(skill)) {
        distress = Math.random() < 0.65;
        distressType = distress ? 'unpaid_wages' : null;
      }
      // São Paulo domestic worker distress cluster
      else if (country === 'BR' && stateData.state === 'São Paulo' && skill === 'domestic worker') {
        distress = Math.random() < 0.55;
        distressType = distress ? randomPick(['harassment', 'excessive_hours', 'wage_theft']) : null;
      }
      // Gauteng mining health emergency cluster
      else if (country === 'ZA' && stateData.state === 'Gauteng' && skill === 'mining worker') {
        distress = Math.random() < 0.70;
        distressType = distress ? randomPick(['unsafe_conditions', 'injury']) : null;
      }
      // Background distress rate
      else {
        distress = Math.random() < 0.12;
        distressType = distress ? randomPick(distressTypes) : null;
      }

      const stateCode = stateData.state.substring(0, 2).toUpperCase();
      const kaamId = `KAAM-${stateCode}-${2026}-${String(randomInt(1000, 9999))}`;
      const daysAgo = randomInt(0, 30);
      const registeredAt = new Date(Date.now() - daysAgo * 86400000).toISOString();

      workers.push({
        kaamId,
        profile: {
          name: `${name}${i > 0 ? ` ${String.fromCharCode(65 + (i % 26))}` : ''}`,
          skill,
          experience_years: randomInt(1, 25),
          current_location: `${cityData.city}, ${stateData.state}`,
          home_location: `${randomPick(locations[country]).cities[0].city}, ${randomPick(locations[country]).state}`,
          language: country === 'IN' ? randomPick(['Hindi', 'Tamil', 'Bengali', 'English']) :
                    country === 'BR' ? 'Portuguese' :
                    country === 'ZA' ? randomPick(['Zulu', 'English']) :
                    country === 'RU' ? 'Russian' : 'Mandarin',
          distress,
          distress_type: distressType,
          country,
          location: {
            lat: jitter(cityData.lat, 0.15),
            lng: jitter(cityData.lng, 0.15)
          }
        },
        schemes: [],
        registeredAt,
        country
      });
    }
  }

  return workers;
}

async function seed() {
  console.log('\n🌱 Seeding KaamSetu database with 500 realistic worker records...\n');
  const workers = generateWorkers();

  // Print summary
  const summary = {};
  let totalDistress = 0;
  workers.forEach(w => {
    const c = w.country;
    summary[c] = summary[c] || { total: 0, distress: 0 };
    summary[c].total++;
    if (w.profile.distress) { summary[c].distress++; totalDistress++; }
  });

  console.log('📊 Distribution:');
  for (const [country, data] of Object.entries(summary)) {
    console.log(`   ${country}: ${data.total} workers, ${data.distress} in distress`);
  }
  console.log(`   Total: ${workers.length} workers, ${totalDistress} distress signals\n`);

  await bulkInsertWorkers(workers);
  console.log('\n✅ Seeding complete!\n');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
