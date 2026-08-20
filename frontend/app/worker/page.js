'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import VoiceInput from '@/components/VoiceInput';
import ChatBubble from '@/components/ChatBubble';
import KaamIDCard from '@/components/KaamIDCard';
import ManualForm from '@/components/ManualForm';
import { extractProfile, registerWorker } from '@/lib/api';

const STEPS = ['language', 'voice', 'review', 'kaamid'];

const helplines = {
  IN: { number: '1800-11-9090', label: 'Labour Helpline (India)' },
  BR: { number: '158', label: 'Trabalho Helpline (Brazil)' },
  ZA: { number: '0800 030 003', label: 'Labour Helpline (South Africa)' },
  RU: { number: '8-800-707-88-41', label: 'Rostrud (Russia)' },
  CN: { number: '12333', label: 'HR Hotline (China)' }
};

export default function WorkerOnboarding() {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [kaamId, setKaamId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showDistressAlert, setShowDistressAlert] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    // Check for saved language
    const savedLang = localStorage.getItem('kaamsetu_lang');
    const savedName = localStorage.getItem('kaamsetu_lang_name');
    if (savedLang && savedName) {
      // Don't auto-skip, let user confirm
    }
  }, []);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    addMessage(true, getGreeting(lang.code));
    setTimeout(() => setStep(1), 800);
  };

  const getGreeting = (code) => {
    const greetings = {
      hi: 'नमस्ते! मैं KaamSetu AI हूँ। आपका स्वागत है। कृपया अपने बारे में बताएं — आपका नाम, काम, कहाँ रहते हैं।',
      en: 'Hello! I am KaamSetu AI. Welcome. Please tell me about yourself — your name, work, and where you live.',
      pt: 'Olá! Eu sou o KaamSetu AI. Bem-vindo. Por favor, me conte sobre você — seu nome, trabalho e onde mora.',
      zh: '你好！我是KaamSetu AI。欢迎。请告诉我你的名字、工作和住址。',
      ru: 'Здравствуйте! Я KaamSetu AI. Добро пожаловать. Расскажите о себе — имя, работа, место проживания.',
      zu: 'Sawubona! NginguKaamSetu AI. Siyakwamukela. Sicela usitshele ngawe — igama lakho, umsebenzi, nendawo.',
      ta: 'வணக்கம்! நான் KaamSetu AI. உங்கள் பெயர், வேலை, எங்கு இருக்கிறீர்கள் என்று சொல்லுங்கள்.',
      bn: 'নমস্কার! আমি KaamSetu AI। আপনার নাম, কাজ এবং কোথায় থাকেন সেটা বলুন।'
    };
    return greetings[code] || greetings.en;
  };

  const addMessage = (isAI, text) => {
    setMessages(prev => [...prev, { isAI, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const handleTranscript = async (text) => {
    addMessage(false, text);
    setIsProcessing(true);
    setError(null);

    try {
      addMessage(true, '⏳ Processing your information...');

      const res = await extractProfile(text, language?.code || 'en');
      const extractedProfile = res.data.profile || res.data;

      // Remove processing message
      setMessages(prev => prev.filter(m => !m.text.includes('Processing your')));

      setProfile(extractedProfile);

      // Show profile summary
      const summary = `✅ I understood! Here is what I found:\n\n` +
        `👤 Name: ${extractedProfile.name}\n` +
        `🔧 Skill: ${extractedProfile.skill}\n` +
        `📍 Location: ${extractedProfile.current_location}\n` +
        `🏠 Home: ${extractedProfile.home_location}\n` +
        `📅 Experience: ${extractedProfile.experience_years} years\n\n` +
        `Is this correct? Tap "Confirm" to get your KaamID.`;

      addMessage(true, summary);
      setStep(2);

      // Check for distress
      if (extractedProfile.distress) {
        setShowDistressAlert(true);
      }
    } catch (err) {
      console.error('Profile extraction failed:', err);
      setMessages(prev => prev.filter(m => !m.text.includes('Processing your')));
      addMessage(true, '❌ Sorry, I had trouble understanding. Could you try again? Speak clearly about your name, work, and location.');
      setError('Extraction failed. Please try again.');
    }
    setIsProcessing(false);
  };

  const handleManualSubmit = (formData) => {
    setShowManualForm(false);
    setProfile({
      ...formData,
      language: language?.english || 'English'
    });
    
    const summary = `✅ Manual Entry Received!\n\n` +
      `👤 Name: ${formData.name}\n` +
      `🔧 Skill: ${formData.skill}\n` +
      `📍 Location: ${formData.current_location}\n` +
      `🏠 Home: ${formData.home_location}\n` +
      `📅 Experience: ${formData.experience_years} years\n\n` +
      `Is this correct? Tap "Confirm" to get your KaamID.`;

    addMessage(true, summary);
    setStep(2);

    if (formData.distress) {
      setShowDistressAlert(true);
    }
  };

  const handleConfirmProfile = async () => {
    setIsProcessing(true);
    try {
      addMessage(true, '🔄 Creating your KaamID...');

      const res = await registerWorker(profile);
      const data = res.data;

      setKaamId(data.kaamId);
      setQrCode(data.qrCode);

      setMessages(prev => prev.filter(m => !m.text.includes('Creating your')));
      addMessage(true, `🎉 Your KaamID is ready!\n\n🪪 ${data.kaamId}\n\nYou can download it as an image or share it. This ID helps you access government schemes.`);

      setStep(3);

      // Save to localStorage for offline access
      localStorage.setItem('kaamsetu_profile', JSON.stringify(data));
    } catch (err) {
      console.error('Registration failed:', err);
      setMessages(prev => prev.filter(m => !m.text.includes('Creating your')));
      addMessage(true, '❌ Registration had an issue. Please try again.');
    }
    setIsProcessing(false);
  };

  const country = profile?.country || 'IN';
  const helpline = helplines[country] || helplines.IN;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF9933] flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="font-bold text-[#1a3a6b] text-sm">KaamSetu</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className={`w-8 h-1.5 rounded-full transition-colors ${
                i <= step ? 'bg-[#FF9933]' : 'bg-slate-200'
              }`} />
            ))}
          </div>
        </div>
      </header>

      {/* Distress Alert */}
      {showDistressAlert && (
        <div className="bg-red-50 border-b-2 border-red-300 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-sm">We detected you may be in distress</p>
              <p className="text-red-600 text-xs mt-1">
                {profile?.distress_type === 'unpaid_wages' && 'Unpaid wages is a violation of your rights.'}
                {profile?.distress_type === 'injury' && 'Workplace injury must be reported immediately.'}
                {profile?.distress_type === 'unsafe_conditions' && 'Unsafe working conditions are illegal.'}
                {!profile?.distress_type && 'Your safety matters to us.'}
              </p>
              <a href={`tel:${helpline.number.replace(/\s/g, '')}`}
                 className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-red-600 text-white text-xs 
                            font-semibold rounded-lg hover:bg-red-700 transition-colors">
                📞 Call {helpline.label}: {helpline.number}
              </a>
            </div>
            <button onClick={() => setShowDistressAlert(false)} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Step 0: Language Selection */}
        {step === 0 && (
          <div className="fade-in-up">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#1a3a6b] mb-1">Welcome to KaamSetu</h1>
              <p className="text-slate-500 text-sm">First, choose your preferred language</p>
            </div>
            <LanguageSelector onSelect={handleLanguageSelect} selected={language} />
          </div>
        )}

        {/* Steps 1-3: Chat + Voice interface */}
        {step >= 1 && (
          <div className="space-y-4 fade-in-up">
            {/* Chat messages */}
            <div className="space-y-1 max-h-[50vh] overflow-y-auto px-1">
              {messages.map((msg, i) => (
                <ChatBubble key={i} message={msg.text} isAI={msg.isAI} timestamp={msg.time} />
              ))}
            </div>

            {/* Voice input (Step 1) */}
            {step === 1 && (
              showManualForm ? (
                <div className="pt-4">
                  <ManualForm 
                    onSubmit={handleManualSubmit} 
                    onCancel={() => setShowManualForm(false)} 
                  />
                </div>
              ) : (
                <>
                  <VoiceInput
                    onTranscript={handleTranscript}
                    language={language?.code || 'en'}
                    disabled={isProcessing}
                  />
                  {!isProcessing && (
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => setShowManualForm(true)}
                        className="text-sm text-slate-500 hover:text-[#1a3a6b] underline transition-colors"
                      >
                        Prefer typing? Fill manual form instead
                      </button>
                    </div>
                  )}
                </>
              )
            )}

            {/* Confirm button (Step 2) */}
            {step === 2 && profile && (
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmProfile}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#138808] text-white font-semibold rounded-xl
                             hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg> Creating...</>
                  ) : '✓ Confirm & Get KaamID'}
                </button>
                <button
                  onClick={() => { setStep(1); setProfile(null); }}
                  className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl
                             hover:bg-slate-50 transition-colors text-sm"
                >
                  ↻ Retry
                </button>
              </div>
            )}

            {/* KaamID Card (Step 3) */}
            {step === 3 && kaamId && (
              <div className="space-y-4">
                <KaamIDCard profile={profile} kaamId={kaamId} qrCode={qrCode} />

                <div className="flex gap-3">
                  <Link href={`/worker/schemes?kaamId=${kaamId}`}
                    className="flex-1 py-3 bg-[#FF9933] text-white font-semibold rounded-xl text-center
                               hover:bg-[#e68a2e] transition-colors text-sm">
                    View My Schemes →
                  </Link>
                  <Link href={`/worker/kaam-id?kaamId=${kaamId}`}
                    className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-center
                               hover:bg-slate-50 transition-colors text-sm">
                    Full Card
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
