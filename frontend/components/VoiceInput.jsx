'use client';

import { useState, useRef, useEffect } from 'react';

export default function VoiceInput({ onTranscript, language = 'hi', disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle, listening, processing
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    const langMap = {
      'hi': 'hi-IN', 'en': 'en-IN', 'pt': 'pt-BR', 'zh': 'zh-CN',
      'ru': 'ru-RU', 'zu': 'zu-ZA', 'ta': 'ta-IN', 'bn': 'bn-IN',
      'ar': 'ar-SA', 'am': 'am-ET', 'fa': 'fa-IR', 'id': 'id-ID'
    };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript(prev => {
        const updated = prev + finalTranscript;
        if (interimTranscript) return updated + interimTranscript;
        return updated;
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setStatus('idle');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status === 'listening') setStatus('idle');
    };

    recognitionRef.current = recognition;
  }, [language]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setStatus('listening');
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    setStatus('processing');

    // Small delay to collect any final results
    setTimeout(() => {
      setStatus('idle');
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
    }, 500);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    const text = textInputRef.current?.value?.trim();
    if (text) {
      setTranscript(text);
      onTranscript(text);
      textInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6">
      {/* Mic button */}
      <div className="relative">
        {/* Pulsing rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-[#FF9933] opacity-20 animate-ping" 
                 style={{ animationDuration: '1.5s' }} />
            <div className="absolute -inset-3 rounded-full bg-[#FF9933] opacity-10 animate-ping" 
                 style={{ animationDuration: '2s' }} />
            <div className="absolute -inset-6 rounded-full bg-[#FF9933] opacity-5 animate-ping" 
                 style={{ animationDuration: '2.5s' }} />
          </>
        )}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled || !isSupported}
          className={`
            relative z-10 w-24 h-24 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-lg
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 scale-110'
              : disabled
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-[#FF9933] hover:bg-[#e68a2e] hover:scale-105'
            }
          `}
        >
          {isListening ? (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Status text */}
      <div className="text-center">
        {status === 'idle' && !transcript && (
          <p className="text-slate-500 text-sm">
            {isSupported ? 'Tap the mic and tell us about yourself' : 'Voice not supported — type below'}
          </p>
        )}
        {status === 'listening' && (
          <p className="text-[#FF9933] font-semibold text-sm animate-pulse">
            🎙️ Listening... speak now
          </p>
        )}
        {status === 'processing' && (
          <p className="text-[#1a3a6b] font-semibold text-sm">
            ⏳ Processing your response...
          </p>
        )}
      </div>

      {/* Live transcription */}
      {transcript && (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-relaxed min-h-[60px]">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Your words</p>
          {transcript}
        </div>
      )}

      {/* Text fallback */}
      <form onSubmit={handleTextSubmit} className="w-full flex gap-2">
        <input
          ref={textInputRef}
          type="text"
          placeholder={isSupported ? "Or type here..." : "Type your details here..."}
          disabled={disabled}
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm 
                     focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent
                     disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled}
          className="px-5 py-3 bg-[#1a3a6b] text-white rounded-xl text-sm font-medium
                     hover:bg-[#15305a] transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
