'use client';

import { useState, useEffect, useCallback } from 'react';

const SCREENS = {
  DIAL: 'dial',
  CONNECTING: 'connecting',
  MAIN_MENU: 'main_menu',
  REGISTER_SKILL: 'register_skill',
  REGISTER_STATE: 'register_state',
  REGISTER_DONE: 'register_done',
  CHECK_ID: 'check_id',
  CHECK_RESULT: 'check_result',
  REPORT_ISSUE: 'report_issue',
  REPORT_DONE: 'report_done',
  HELPLINE: 'helpline'
};

export default function USSDSimulator() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.DIAL);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const transitionTo = useCallback((screen) => {
    setIsConnecting(true);
    setInput('');
    setTimeout(() => {
      setIsConnecting(false);
      setCurrentScreen(screen);
    }, 1500);
  }, []);

  const handleKeyPress = (key) => {
    if (key === 'DEL') {
      setInput(prev => prev.slice(0, -1));
    } else if (key === 'SEND') {
      handleSend();
    } else {
      setInput(prev => prev + key);
    }
  };

  const handleSend = () => {
    const val = input.trim();

    switch (currentScreen) {
      case SCREENS.DIAL:
        if (val === '*14434#' || val.includes('14434')) {
          transitionTo(SCREENS.MAIN_MENU);
        }
        break;
      case SCREENS.MAIN_MENU:
        if (val === '1') transitionTo(SCREENS.REGISTER_SKILL);
        else if (val === '2') transitionTo(SCREENS.CHECK_ID);
        else if (val === '3') transitionTo(SCREENS.REPORT_ISSUE);
        else if (val === '4') transitionTo(SCREENS.HELPLINE);
        break;
      case SCREENS.REGISTER_SKILL:
        transitionTo(SCREENS.REGISTER_STATE);
        break;
      case SCREENS.REGISTER_STATE:
        transitionTo(SCREENS.REGISTER_DONE);
        break;
      case SCREENS.CHECK_ID:
        transitionTo(SCREENS.CHECK_RESULT);
        break;
      case SCREENS.REPORT_ISSUE:
        transitionTo(SCREENS.REPORT_DONE);
        break;
      default:
        break;
    }
    setInput('');
  };

  const getScreenContent = () => {
    if (isConnecting) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-green-400 text-xs">Connecting...</p>
        </div>
      );
    }

    switch (currentScreen) {
      case SCREENS.DIAL:
        return (
          <div className="text-center">
            <p className="text-green-400 text-xs mb-2">Dial *14434# to start</p>
            <p className="text-white text-lg font-mono">{input || '*14434#'}</p>
          </div>
        );
      case SCREENS.MAIN_MENU:
        return (
          <div className="text-green-400 text-xs space-y-1.5">
            <p className="text-white text-sm font-bold mb-2">KaamSetu</p>
            <p className="text-yellow-300 text-[10px] mb-3">Worker Safety Net</p>
            <p>1. Register as Worker</p>
            <p>2. Check My Schemes</p>
            <p>3. Report Wage Issue</p>
            <p>4. Emergency Helpline</p>
            <p className="text-gray-500 mt-3 text-[10px]">Reply with number</p>
          </div>
        );
      case SCREENS.REGISTER_SKILL:
        return (
          <div className="text-green-400 text-xs space-y-1.5">
            <p className="text-white text-sm mb-2">Select Your Skill:</p>
            <p>1. Mason / Construction</p>
            <p>2. Driver</p>
            <p>3. Domestic Worker</p>
            <p>4. Street Vendor</p>
            <p>5. Other</p>
            <p className="text-gray-500 mt-3 text-[10px]">Reply with number</p>
          </div>
        );
      case SCREENS.REGISTER_STATE:
        return (
          <div className="text-green-400 text-xs space-y-1.5">
            <p className="text-white text-sm mb-2">Enter State Code:</p>
            <p>MH=Maharashtra</p>
            <p>DL=Delhi, KA=Karnataka</p>
            <p>TN=Tamil Nadu, BR=Bihar</p>
            <p className="text-gray-500 mt-3 text-[10px]">Type code and send</p>
          </div>
        );
      case SCREENS.REGISTER_DONE:
        return (
          <div className="text-green-400 text-xs space-y-2">
            <p className="text-yellow-300 text-sm mb-1">✓ Registration Complete!</p>
            <p className="text-white font-mono text-sm">
              KaamID: KAAM-MH-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}
            </p>
            <p className="mt-2">SMS sent to your number with KaamID details.</p>
            <p className="text-gray-500 mt-2 text-[10px]">You qualify for 3 schemes.</p>
            <p className="text-gray-500 text-[10px]">Dial *14434# → 2 to check</p>
          </div>
        );
      case SCREENS.CHECK_ID:
        return (
          <div className="text-green-400 text-xs space-y-2">
            <p className="text-white text-sm mb-2">Enter your KaamID:</p>
            <p className="text-gray-500 text-[10px]">Format: KAAM-XX-YYYY-NNNN</p>
            <p className="text-white font-mono mt-2">{input}</p>
          </div>
        );
      case SCREENS.CHECK_RESULT:
        return (
          <div className="text-green-400 text-xs space-y-1.5">
            <p className="text-yellow-300 text-sm mb-1">Your Schemes (3 found):</p>
            <p>1. eShram — ₹2L insurance</p>
            <p>2. PMJAY — ₹5L health cover</p>
            <p>3. BOCW — Welfare benefits</p>
            <p className="text-gray-500 mt-3 text-[10px]">Reply 1-3 for details</p>
          </div>
        );
      case SCREENS.REPORT_ISSUE:
        return (
          <div className="text-green-400 text-xs space-y-2">
            <p className="text-white text-sm mb-2">Describe your issue briefly:</p>
            <p className="text-gray-500 text-[10px]">e.g., "wages not paid 3 months"</p>
            <p className="text-white font-mono mt-2">{input}</p>
          </div>
        );
      case SCREENS.REPORT_DONE:
        return (
          <div className="text-green-400 text-xs space-y-2">
            <p className="text-yellow-300 text-sm mb-1">✓ Complaint Registered</p>
            <p className="text-white font-mono">Ref: KS-{Date.now().toString().slice(-8)}</p>
            <p className="mt-2">Helpline: 1800-11-9090</p>
            <p className="text-gray-500 text-[10px]">A labour officer will contact you within 48 hours.</p>
          </div>
        );
      case SCREENS.HELPLINE:
        return (
          <div className="text-green-400 text-xs space-y-2">
            <p className="text-white text-sm mb-2">Emergency Helplines:</p>
            <p>🇮🇳 India: 1800-11-9090</p>
            <p>🇧🇷 Brazil: 158</p>
            <p>🇿🇦 SA: 0800 030 003</p>
            <p>🇷🇺 Russia: 8-800-707-88-41</p>
            <p>🇨🇳 China: 12333</p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleReset = () => {
    setCurrentScreen(SCREENS.DIAL);
    setInput('');
    setHistory([]);
    setIsConnecting(false);
  };

  const keys = ['1','2','3','4','5','6','7','8','9','*','0','#'];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone frame */}
      <div className="w-72 bg-gray-900 rounded-3xl p-3 shadow-2xl border border-gray-700">
        {/* Speaker grille */}
        <div className="flex justify-center mb-2">
          <div className="w-16 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Screen */}
        <div className="bg-black rounded-lg p-4 h-52 flex flex-col justify-between mb-3 border border-gray-800">
          <div className="flex-1 flex flex-col justify-center">
            {getScreenContent()}
          </div>

          {/* Input display */}
          {!isConnecting && currentScreen !== SCREENS.REGISTER_DONE && 
           currentScreen !== SCREENS.CHECK_RESULT && currentScreen !== SCREENS.REPORT_DONE && 
           currentScreen !== SCREENS.HELPLINE && (
            <div className="border-t border-gray-800 pt-2 mt-2">
              <p className="text-green-400 font-mono text-sm">{input}<span className="animate-pulse">_</span></p>
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {keys.map(key => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="bg-gray-800 text-white text-lg font-mono py-2.5 rounded-lg
                         hover:bg-gray-700 active:bg-gray-600 transition-colors"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleKeyPress('DEL')}
            className="bg-red-900 text-red-300 text-xs py-2 rounded-lg hover:bg-red-800 transition-colors font-semibold"
          >
            DEL
          </button>
          <button
            onClick={() => handleKeyPress('SEND')}
            className="bg-green-900 text-green-300 text-xs py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold col-span-2"
          >
            SEND
          </button>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-300 transition-colors font-medium"
      >
        ↻ Reset Demo
      </button>
    </div>
  );
}
