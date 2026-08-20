'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PolicyBrief from '@/components/PolicyBrief';
import { getPolicyStats, generateBrief, getHeatmapData } from '@/lib/api';

const PolicyMap = dynamic(() => import('@/components/PolicyMap'), { ssr: false });

const CORRECT_PIN = 'POLICY2026';
const countryFlags = { IN: '🇮🇳', BR: '🇧🇷', ZA: '🇿🇦', RU: '🇷🇺', CN: '🇨🇳' };

function AnimatedNumber({ value, duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
}

export default function PolicyDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [stats, setStats] = useState(null);
  const [briefData, setBriefData] = useState(null);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [filters, setFilters] = useState({ country: 'ALL', distressType: 'ALL' });

  // Demo alerts
  const alerts = [
    { location: 'Maharashtra, India', count: 47, type: 'Wage Disputes', time: '2 hours ago', urgency: 'CRITICAL' },
    { location: 'Gauteng, South Africa', count: 31, type: 'Health Emergency', time: '6 hours ago', urgency: 'HIGH' },
    { location: 'São Paulo, Brazil', count: 23, type: 'Harassment Reports', time: '12 hours ago', urgency: 'MEDIUM' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHeatmap();
    }
  }, [filters, isAuthenticated]);

  const loadDashboard = async () => {
    try {
      const res = await getPolicyStats();
      setStats(res.data);
    } catch (err) {
      console.error('Stats load error:', err);
      setStats({
        total_workers: 500, distress_count: 87, schemes_matched_today: 1150,
        by_country: [{ country: 'IN', count: 200 }, { country: 'BR', count: 100 },
                     { country: 'ZA', count: 100 }, { country: 'RU', count: 50 }, { country: 'CN', count: 50 }],
        by_skill: []
      });
    }
  };

  const loadHeatmap = async () => {
    try {
      const res = await getHeatmapData(filters.country, filters.distressType);
      setHeatmapPoints(res.data.points || []);
    } catch (err) {
      console.error('Heatmap load error:', err);
    }
  };

  const handleGenerateBrief = async () => {
    setIsBriefLoading(true);
    try {
      const res = await generateBrief({ country: filters.country });
      setBriefData(res.data);
    } catch (err) {
      console.error('Brief generation error:', err);
    }
    setIsBriefLoading(false);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // PIN Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#FF9933] flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">K</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Policy Dashboard</h1>
            <p className="text-blue-300 text-sm">BRICS Intelligence — Restricted Access</p>
          </div>

          <form onSubmit={handlePinSubmit} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <label className="block text-blue-300 text-xs uppercase tracking-wider mb-2">Enter Access PIN</label>
            <input
              type="password"
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError(false); }}
              placeholder="••••••••"
              className={`w-full px-4 py-3 bg-white/10 border ${pinError ? 'border-red-500' : 'border-white/20'} 
                         rounded-xl text-white text-center text-lg tracking-widest font-mono
                         focus:outline-none focus:ring-2 focus:ring-[#FF9933] placeholder-white/30`}
              autoFocus
            />
            {pinError && <p className="text-red-400 text-xs mt-2 text-center">Invalid PIN. Try again.</p>}
            <button type="submit"
              className="w-full mt-4 py-3 bg-[#FF9933] text-white font-semibold rounded-xl
                         hover:bg-[#e68a2e] transition-colors">
              Access Dashboard
            </button>
          </form>

          <p className="text-center text-slate-500 text-xs mt-4">
            Demo PIN: POLICY2026
          </p>
        </div>
      </div>
    );
  }

  const urgencyBadge = (u) => {
    const cls = {
      CRITICAL: 'bg-red-500 animate-pulse',
      HIGH: 'bg-red-500',
      MEDIUM: 'bg-orange-500',
      LOW: 'bg-green-500'
    };
    return `${cls[u] || cls.MEDIUM} text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase`;
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Top bar */}
      <header className="bg-[#0d1f3c] border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF9933] flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
            </Link>
            <div>
              <h1 className="font-bold text-sm">Policy Intelligence</h1>
              <p className="text-blue-400 text-[10px] uppercase tracking-widest">BRICS Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">
        {/* Left panel */}
        <div className="lg:w-[42%] overflow-y-auto border-r border-slate-700/50 p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-blue-400 text-[10px] uppercase tracking-wider">Workers Registered</p>
              <p className="text-2xl font-extrabold text-white">
                <AnimatedNumber value={stats?.total_workers || 500} />
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-red-500/30">
              <p className="text-red-400 text-[10px] uppercase tracking-wider">Distress Signals</p>
              <p className="text-2xl font-extrabold text-red-400">
                <AnimatedNumber value={stats?.distress_count || 87} />
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-blue-400 text-[10px] uppercase tracking-wider">Nations Connected</p>
              <p className="text-lg font-bold mt-1">
                {Object.values(countryFlags).map((f, i) => <span key={i} className="mr-0.5">{f}</span>)}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-blue-400 text-[10px] uppercase tracking-wider">Schemes Matched</p>
              <p className="text-2xl font-extrabold text-[#FF9933]">
                <AnimatedNumber value={stats?.schemes_matched_today || 1150} />
              </p>
            </div>
          </div>

          {/* Urgency alerts */}
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Active Alerts
            </h2>
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className={urgencyBadge(alert.urgency)}>{alert.urgency}</span>
                    <span className="text-slate-500 text-[10px]">{alert.time}</span>
                  </div>
                  <p className="text-sm font-medium text-white">{alert.location}</p>
                  <p className="text-xs text-slate-400">
                    {alert.count} workers • {alert.type}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Country breakdown */}
          {stats?.by_country && (
            <div>
              <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">By Country</h2>
              <div className="space-y-1.5">
                {stats.by_country.map(({ country, count }) => (
                  <div key={country} className="flex items-center gap-2">
                    <span className="text-sm">{countryFlags[country]}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF9933] rounded-full transition-all"
                           style={{ width: `${(count / (stats.total_workers || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Policy Brief */}
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">AI Policy Brief</h2>
            <PolicyBrief
              briefData={briefData}
              onGenerate={handleGenerateBrief}
              isLoading={isBriefLoading}
            />
          </div>
        </div>

        {/* Right panel — Map */}
        <div className="lg:w-[58%] h-[400px] lg:h-full">
          <PolicyMap
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            heatmapData={heatmapPoints}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>
      </div>
    </div>
  );
}
