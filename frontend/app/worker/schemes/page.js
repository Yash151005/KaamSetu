'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SchemeCard from '@/components/SchemeCard';
import { matchSchemes, getWorker } from '@/lib/api';

function SchemesContent() {
  const searchParams = useSearchParams();
  const kaamId = searchParams.get('kaamId');

  const [schemes, setSchemes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBenefit, setTotalBenefit] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSchemes();
  }, [kaamId]);

  const loadSchemes = async () => {
    setIsLoading(true);
    try {
      // Try to get profile from localStorage first
      let workerProfile = null;
      const cached = localStorage.getItem('kaamsetu_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        workerProfile = parsed.profile;
      }

      // Or fetch from API
      if (!workerProfile && kaamId) {
        const res = await getWorker(kaamId);
        workerProfile = res.data.profile;
      }

      if (!workerProfile) {
        workerProfile = {
          name: 'Demo Worker',
          skill: 'construction',
          current_location: 'Mumbai, Maharashtra',
          country: 'IN',
          language: 'Hindi'
        };
      }

      setProfile(workerProfile);

      // Match schemes
      const res = await matchSchemes(kaamId, workerProfile, workerProfile.country);
      setSchemes(res.data.matched_schemes || []);
      setTotalBenefit(res.data.total_benefit_estimate || 0);
      setCurrency(res.data.currency || 'INR');
    } catch (err) {
      console.error('Scheme matching error:', err);
      setError('Could not load schemes. Please try again.');
    }
    setIsLoading(false);
  };

  const currencySymbols = { INR: '₹', BRL: 'R$', ZAR: 'R', RUB: '₽', CNY: '¥' };
  const symbol = currencySymbols[currency] || '₹';

  const highCount = schemes.filter(s => s.urgency === 'HIGH').length;
  const claimedCount = 0; // Demo: none claimed yet

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/worker" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
            ← Back
          </Link>
          <span className="font-bold text-[#1a3a6b] text-sm">Your Entitlements</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                <div className="skeleton h-5 w-48" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-8 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={loadSchemes} className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm">
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6 fade-in-up">
            {/* Summary card */}
            <div className="bg-[#1a3a6b] rounded-2xl p-5 text-white">
              <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">Total Schemes Matched</p>
              <p className="text-4xl font-extrabold mb-1">{schemes.length}</p>
              <p className="text-blue-200 text-sm mb-4">
                {highCount > 0 && <span className="text-[#FF9933] font-semibold">{highCount} high priority</span>}
                {highCount > 0 && ' • '}
                Est. benefit: <span className="font-bold text-white">{symbol}{(totalBenefit).toLocaleString()}/year</span>
              </p>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] text-blue-300 mb-1">
                  <span>Schemes Claimed</span>
                  <span>{claimedCount} of {schemes.length}</span>
                </div>
                <div className="h-2 bg-blue-900 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF9933] rounded-full transition-all" 
                       style={{ width: `${schemes.length > 0 ? (claimedCount / schemes.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Profile summary */}
            {profile && (
              <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#FF9933] flex items-center justify-center text-white font-bold">
                  {(profile.name || 'W')[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{profile.name}</p>
                  <p className="text-slate-500 text-xs">{profile.skill} • {profile.current_location}</p>
                </div>
              </div>
            )}

            {/* Scheme cards */}
            <div className="space-y-3">
              {schemes.map((scheme, i) => (
                <SchemeCard key={scheme.scheme_id || i} scheme={scheme} />
              ))}
            </div>

            {schemes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400 text-lg mb-2">🔍</p>
                <p className="text-slate-500 text-sm">No schemes found. Complete registration first.</p>
                <Link href="/worker" className="text-[#FF9933] text-sm font-medium hover:underline mt-2 inline-block">
                  Register Now →
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#FF9933] border-t-transparent rounded-full" />
      </div>
    }>
      <SchemesContent />
    </Suspense>
  );
}
