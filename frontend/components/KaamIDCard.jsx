'use client';

import { useRef, useState } from 'react';

export default function KaamIDCard({ profile, kaamId, qrCode }) {
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `KaamID-${kaamId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
    setIsDownloading(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `KaamSetu ID: ${kaamId}`,
          text: `Worker: ${profile.name}\nSkill: ${profile.skill}\nKaamID: ${kaamId}`,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard?.writeText(`KaamID: ${kaamId} | ${profile.name} | ${profile.skill}`);
      alert('KaamID copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* The Card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1a3a6b 0%, #0f2847 60%, #0a1e3d 100%)'
        }}
      >
        {/* Top accent bar */}
        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #FF9933, #FFFFFF, #138808)' }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#FF9933] flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-wide">KAAMSETU</p>
                <p className="text-blue-300 text-[10px] tracking-widest uppercase">Worker Identity Card</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-300 text-[10px] uppercase tracking-wider">BRICS</p>
              <p className="text-white text-xs">🇮🇳 🇧🇷 🇷🇺 🇨🇳 🇿🇦</p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex gap-4">
            {/* Left: Details */}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-blue-400 text-[10px] uppercase tracking-wider">Full Name</p>
                <p className="text-white font-bold text-lg">{profile.name || 'Worker'}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-blue-400 text-[10px] uppercase tracking-wider">Skill</p>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-[#FF9933] text-white text-xs font-semibold rounded-full">
                    {profile.skill || 'General'}
                  </span>
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] uppercase tracking-wider">Experience</p>
                  <p className="text-white text-sm font-medium mt-0.5">{profile.experience_years || 0} years</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-blue-400 text-[10px] uppercase tracking-wider">Current Location</p>
                  <p className="text-white text-xs">{profile.current_location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] uppercase tracking-wider">Home</p>
                  <p className="text-white text-xs">{profile.home_location || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center gap-1">
              {qrCode && (
                <div className="bg-white p-2 rounded-lg">
                  <img src={qrCode} alt="QR Code" className="w-24 h-24" />
                </div>
              )}
              <p className="text-blue-300 text-[9px] text-center">Scan to verify</p>
            </div>
          </div>

          {/* KaamID */}
          <div className="mt-4 pt-3 border-t border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-[10px] uppercase tracking-wider">KaamID</p>
                <p className="text-[#FF9933] font-mono font-bold text-lg tracking-wider">{kaamId}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-400 text-[10px] uppercase tracking-wider font-semibold">
                    AI Verified
                  </span>
                </div>
                <p className="text-blue-400 text-[9px]">Verified by KaamSetu AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1.5 w-full bg-[#FF9933]" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a3a6b] text-white rounded-xl
                     font-medium text-sm hover:bg-[#15305a] transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isDownloading ? 'Saving...' : 'Download PNG'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FF9933] text-white rounded-xl
                     font-medium text-sm hover:bg-[#e68a2e] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
