'use client';

export default function ChatBubble({ message, isAI = false, timestamp }) {
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isAI
            ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-md shadow-sm'
            : 'bg-[#1a3a6b] text-white rounded-tr-md shadow-md'
          }
        `}
      >
        {isAI && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-[#FF9933] flex items-center justify-center text-[10px] text-white font-bold">K</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">KaamSetu AI</span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <p className={`text-[10px] mt-1 ${isAI ? 'text-slate-400' : 'text-blue-200'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
