'use client';

import Link from 'next/link';
import USSDSimulator from '@/components/USSDSimulator';

export default function USSDPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF9933] flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="font-bold text-[#1a3a6b] text-sm">KaamSetu</span>
          </Link>
          <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">USSD Demo</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Left: Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1a3a6b] mb-3">
              No Smartphone? No Problem.
            </h1>
            <p className="text-slate-600 leading-relaxed mb-6">
              KaamSetu works on any basic feature phone through USSD technology. 
              Workers can register, check schemes, and report issues — all without internet.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Dial *14434#</h3>
                  <p className="text-slate-500 text-xs">Works on any phone. No internet needed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Choose an option</h3>
                  <p className="text-slate-500 text-xs">Register, check schemes, or report an issue.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Get your KaamID via SMS</h3>
                  <p className="text-slate-500 text-xs">Receive your worker ID and scheme info by text.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Try the demo</p>
              <p className="text-sm text-blue-800">
                Use the simulated phone on the right. Type <code className="bg-blue-100 px-1 rounded text-[#1a3a6b] font-mono">*14434#</code> and 
                press SEND to begin.
              </p>
            </div>
          </div>

          {/* Right: Phone simulator */}
          <div className="flex-shrink-0">
            <USSDSimulator />
          </div>
        </div>
      </main>
    </div>
  );
}
