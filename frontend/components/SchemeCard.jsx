'use client';

import { useState } from 'react';

const urgencyColors = {
  HIGH: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-500' },
  MEDIUM: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-500' },
  LOW: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-500' }
};

const countryFlags = { IN: '🇮🇳', BR: '🇧🇷', ZA: '🇿🇦', RU: '🇷🇺', CN: '🇨🇳' };

export default function SchemeCard({ scheme, onEnroll, onSpeak }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const colors = urgencyColors[scheme.urgency] || urgencyColors.MEDIUM;

  const handleSpeak = async () => {
    setIsSpeaking(true);
    try {
      if (onSpeak) {
        await onSpeak(scheme);
      } else {
        // Browser fallback TTS
        const text = `${scheme.name}. ${scheme.benefit || scheme.why_qualifies}. Next step: ${scheme.next_step}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
        return;
      }
    } catch (err) {
      console.error('Speak failed:', err);
    }
    setIsSpeaking(false);
  };

  return (
    <div className={`bg-white border ${colors.border} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{countryFlags[scheme.country] || '🌐'}</span>
            <h3 className="font-bold text-slate-800 text-sm">{scheme.name}</h3>
          </div>
          <span className={`${colors.badge} text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase`}>
            {scheme.urgency}
          </span>
        </div>

        {/* Benefit */}
        <p className="text-[#1a3a6b] font-semibold text-sm mb-2">
          {scheme.benefit || scheme.description}
        </p>

        {/* Why you qualify */}
        {scheme.why_qualifies && (
          <div className="flex items-start gap-2 mb-3">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 text-xs">{scheme.why_qualifies}</p>
          </div>
        )}

        {/* Next step */}
        {scheme.next_step && (
          <div className={`${colors.bg} rounded-lg p-2.5 mb-3`}>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Next Step</p>
            <p className={`${colors.text} text-xs font-medium`}>{scheme.next_step}</p>
          </div>
        )}

        {/* Expandable enrollment steps */}
        {scheme.enrollment_steps && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-[#1a3a6b] hover:underline mb-2 flex items-center gap-1"
            >
              {isExpanded ? '▼' : '▶'} Full enrollment steps
            </button>
            {isExpanded && (
              <ol className="text-xs text-slate-600 space-y-1.5 ml-4 mb-3 list-decimal">
                {scheme.enrollment_steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEnroll?.(scheme) || window.open(scheme.enrollment_url, '_blank')}
            className="flex-1 py-2 bg-[#138808] text-white text-xs font-semibold rounded-lg
                       hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Enroll Now
          </button>
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className="px-3 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg
                       hover:bg-slate-50 transition-colors flex items-center gap-1
                       disabled:opacity-50"
          >
            {isSpeaking ? '🔊' : '🔈'} Hear This
          </button>
        </div>
      </div>
    </div>
  );
}
