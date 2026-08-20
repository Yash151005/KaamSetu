'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import KaamIDCard from '@/components/KaamIDCard';

function KaamIdContent() {
  const searchParams = useSearchParams();
  const kaamIdParam = searchParams.get('kaamId');

  const [profile, setProfile] = useState(null);
  const [kaamId, setKaamId] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    // Load from localStorage (offline-first)
    const cached = localStorage.getItem('kaamsetu_profile');
    if (cached) {
      const data = JSON.parse(cached);
      setProfile(data.profile);
      setKaamId(data.kaamId);
      setQrCode(data.qrCode);
    }
  }, []);

  if (!profile || !kaamId) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🪪</p>
          <h2 className="text-xl font-bold text-[#1a3a6b] mb-2">No KaamID Found</h2>
          <p className="text-slate-500 text-sm mb-6">Register first to get your digital identity card.</p>
          <Link href="/worker"
            className="px-6 py-3 bg-[#FF9933] text-white font-semibold rounded-xl hover:bg-[#e68a2e] transition-colors">
            Register Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/worker" className="text-slate-500 hover:text-slate-700 text-sm">← Back</Link>
          <span className="font-bold text-[#1a3a6b] text-sm">Your KaamID</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="fade-in-up">
          <KaamIDCard profile={profile} kaamId={kaamId} qrCode={qrCode} />

          <div className="mt-6 space-y-3">
            <Link href={`/worker/schemes?kaamId=${kaamId}`}
              className="block w-full py-3 bg-[#138808] text-white font-semibold rounded-xl text-center
                         hover:bg-green-700 transition-colors text-sm">
              🛡️ Check My Schemes
            </Link>
            <Link href="/"
              className="block w-full py-3 border border-slate-200 text-slate-600 font-medium rounded-xl 
                         text-center hover:bg-slate-50 transition-colors text-sm">
              ← Home
            </Link>
          </div>

          {/* Offline notice */}
          <p className="text-center text-[10px] text-slate-400 mt-6">
            🔒 This card is saved offline on your device
          </p>
        </div>
      </main>
    </div>
  );
}

export default function KaamIdPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#FF9933] border-t-transparent rounded-full" />
      </div>
    }>
      <KaamIdContent />
    </Suspense>
  );
}
