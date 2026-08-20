'use client';

import { useState } from 'react';

const languages = [
  { code: 'hi', name: 'हिन्दी', english: 'Hindi', flag: '🇮🇳' },
  { code: 'en', name: 'English', english: 'English', flag: '🌐' },
  { code: 'pt', name: 'Português', english: 'Portuguese', flag: '🇧🇷' },
  { code: 'zh', name: '中文', english: 'Mandarin', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', english: 'Russian', flag: '🇷🇺' },
  { code: 'zu', name: 'isiZulu', english: 'Zulu', flag: '🇿🇦' },
  { code: 'ta', name: 'தமிழ்', english: 'Tamil', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', english: 'Bengali', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', english: 'Arabic', flag: '🌍' },
  { code: 'am', name: 'አማርኛ', english: 'Amharic', flag: '🇪🇹' },
  { code: 'fa', name: 'فارسی', english: 'Farsi', flag: '🇮🇷' },
  { code: 'id', name: 'Bahasa', english: 'Indonesian', flag: '🇮🇩' }
];

export default function LanguageSelector({ onSelect, selected }) {
  const [hoveredLang, setHoveredLang] = useState(null);

  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-center mb-2 text-slate-800">
        Choose Your Language
      </h2>
      <p className="text-center text-sm text-slate-500 mb-6">
        अपनी भाषा चुनें • Escolha seu idioma • 选择语言
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => {
              localStorage.setItem('kaamsetu_lang', lang.code);
              localStorage.setItem('kaamsetu_lang_name', lang.english);
              onSelect(lang);
            }}
            onMouseEnter={() => setHoveredLang(lang.code)}
            onMouseLeave={() => setHoveredLang(null)}
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 
              transition-all duration-200 cursor-pointer
              ${selected?.code === lang.code
                ? 'border-[#FF9933] bg-orange-50 shadow-md scale-105'
                : hoveredLang === lang.code
                  ? 'border-[#1a3a6b] bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }
            `}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-sm font-semibold text-slate-800">{lang.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{lang.english}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
