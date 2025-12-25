
import React, { useState } from 'react';

interface MarkdownDisplayProps {
  content: string;
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <i className="fas fa-file-code text-indigo-400"></i>
                AI Studio Build 입력용 기획안 (JSON)
            </h3>
            <p className="text-sm text-slate-400 mt-1">
                아래 내용을 복사하여 <strong>AI Studio Build</strong> 대화창에 붙여넣으면 즉시 앱을 생성할 수 있습니다.
            </p>
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl border-2 border-indigo-500/30 shadow-lg shadow-indigo-900/10 overflow-hidden flex flex-col relative group">
        
        {/* Toolbar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                 <span className="text-xs font-mono text-indigo-300 font-semibold uppercase tracking-wider">Plan.json</span>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleCopy}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 font-medium"
                    title="전체 복사"
                >
                    <i className="fas fa-copy"></i>
                    <span>복사하기</span>
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="relative">
            <div className="p-6 overflow-auto max-h-[500px] bg-slate-950 custom-scrollbar">
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed selection:bg-indigo-500/30 selection:text-indigo-100">
                    {content}
                </pre>
            </div>
            {/* Shadow overlay for depth */}
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-end">
            <button 
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-base shadow-lg transition-all duration-200 transform active:scale-95 w-full sm:w-auto ${
                    copied 
                    ? 'bg-green-600 text-white ring-2 ring-green-400 ring-offset-2 ring-offset-slate-900' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25 hover:-translate-y-0.5'
                }`}
            >
                {copied ? (
                    <>
                        <i className="fas fa-check-circle"></i> 복사 완료!
                    </>
                ) : (
                    <>
                        <i className="fas fa-copy"></i> JSON 기획안 복사
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownDisplay;
