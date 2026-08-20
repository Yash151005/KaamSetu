'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function AnimatedCounter({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

  const stats = [
    { value: '800M+', label: 'Informal Workers in BRICS' },
    { value: '62%', label: 'Workforce Unprotected' },
    { value: '0', label: 'Cross-Border Systems (Before KaamSetu)' },
    { value: '47+', label: 'Government Schemes Mapped' }
  ];

  const steps = [
    { icon: '🎙️', title: 'Speak Your Story', desc: 'Tell us about yourself in your own language. No forms, no jargon.' },
    { icon: '🪪', title: 'Get Your KaamID', desc: 'Receive a portable digital identity with QR code — your gateway to entitlements.' },
    { icon: '🛡️', title: 'Claim Your Rights', desc: 'See every government scheme you qualify for. Enroll with one tap.' }
  ];

  const nations = [
    { flag: '🇮🇳', name: 'India', workers: '400M+', schemes: 7, languages: 'Hindi, Tamil, Bengali, English' },
    { flag: '🇧🇷', name: 'Brazil', workers: '100M+', schemes: 3, languages: 'Portuguese' },
    { flag: '🇷🇺', name: 'Russia', workers: '30M+', schemes: 2, languages: 'Russian' },
    { flag: '🇨🇳', name: 'China', workers: '250M+', schemes: 2, languages: 'Mandarin' },
    { flag: '🇿🇦', name: 'South Africa', workers: '11M+', schemes: 3, languages: 'Zulu, English' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF9933] flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-[#1a3a6b] text-lg">KaamSetu</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
            <Link href="/worker" className="hover:text-[#1a3a6b] transition-colors">Worker Portal</Link>
            <Link href="/policy" className="hover:text-[#1a3a6b] transition-colors">Policy Dashboard</Link>
            <Link href="/ussd" className="hover:text-[#1a3a6b] transition-colors">USSD Guide</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden hero-pattern"
        style={{ background: 'linear-gradient(180deg, #0a1628 0%, #1a3a6b 50%, #1e4080 100%)' }}>
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#FF9933] blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-[#138808] blur-3xl" />
        </div>

        <div className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm 
                          rounded-full border border-white/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-blue-200 text-xs font-medium tracking-wide">
              Built for BRICS | 12 Languages | Any Phone
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            800 Million Workers.{' '}
            <span className="text-gradient">Zero Safety Net.</span>
            <br />Until Now.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            KaamSetu — AI Bridge Between Invisible Workers and Their Rights
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/worker"
              className="w-full sm:w-auto px-8 py-4 bg-[#FF9933] text-white font-bold text-lg rounded-xl
                         hover:bg-[#e68a2e] transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl
                         hover:shadow-orange-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              🙋 I Am a Worker
            </Link>
            <Link href="/policy"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg 
                         rounded-xl border border-white/20 hover:bg-white/20 transition-all
                         hover:-translate-y-0.5 flex items-center justify-center gap-2">
              📊 I Am a Policymaker
            </Link>
          </div>

          {/* Live counter */}
          <div className="inline-flex items-center gap-2 text-blue-300 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <AnimatedCounter target={1247} duration={3000} /> workers registered across BRICS today
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path fill="#f8fafc" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 px-4 -mt-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-center
                                    hover:shadow-md transition-shadow">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1a3a6b] mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1a3a6b] mb-3">How It Works</h2>
          <p className="text-center text-slate-500 mb-12">Three steps. Any language. Any phone.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center
                                      hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-[#1a3a6b] text-white text-xs font-bold 
                                   flex items-center justify-center">{i + 1}</span>
                  <h3 className="font-bold text-[#1a3a6b] text-lg">{step.title}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRICS Nations */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1a3a6b] mb-3">Across BRICS Nations</h2>
          <p className="text-center text-slate-500 mb-12">One platform. Five nations. 800 million workers.</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {nations.map((nation, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100 text-center
                                      hover:border-[#FF9933] transition-colors">
                <span className="text-4xl block mb-2">{nation.flag}</span>
                <h3 className="font-bold text-[#1a3a6b] text-sm mb-2">{nation.name}</h3>
                <div className="space-y-1 text-[11px] text-slate-500">
                  <p><span className="font-semibold text-slate-700">{nation.workers}</span> workers</p>
                  <p><span className="font-semibold text-slate-700">{nation.schemes}</span> schemes</p>
                  <p className="truncate">{nation.languages}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USSD CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-[#1a3a6b] rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">No Smartphone? No Problem.</h2>
          <p className="text-blue-200 mb-6">
            KaamSetu works on any feature phone via USSD. Dial <span className="font-mono text-[#FF9933] font-bold">*14434#</span> to register.
          </p>
          <Link href="/ussd"
            className="inline-block px-6 py-3 bg-[#FF9933] text-white font-semibold rounded-xl
                       hover:bg-[#e68a2e] transition-colors">
            See USSD Demo →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF9933] flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-white text-lg">KaamSetu</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/worker" className="hover:text-white transition-colors">Worker Portal</Link>
              <Link href="/policy" className="hover:text-white transition-colors">Policy Dashboard</Link>
              <Link href="/ussd" className="hover:text-white transition-colors">USSD Guide</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs">
            <p>Built for BRICS Hackathon 2026 | Google Cloud + Groq AI</p>
            <p className="mt-1 text-slate-500">KaamSetu — The voice that millions of invisible workers never had.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
