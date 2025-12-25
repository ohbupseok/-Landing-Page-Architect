
import React, { useState } from 'react';

const VITE_PROMPT = `첨부 소스를 바탕으로 GitHub 업로드 및 Vercel 배포가 가능한 Vite + React + TypeScript 프로젝트 구조로 변환해줘.
package.json, vite.config.ts, tsconfig.json 등 설정 파일을 포함하여 컴포넌트별로 파일을 완벽하게 분리해줘.`;

const ConversionFooter: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(VITE_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-700 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-slate-300 text-sm">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shrink-0">
            <i className="fas fa-rocket"></i>
          </div>
          <div>
            <p className="font-semibold text-white">다음 단계: React 프로젝트 변환</p>
            <p className="text-xs text-slate-400 hidden sm:block">다운로드한 HTML 파일을 AI STUDIO BUILD 에 업로드하고, 우측 프롬프트를 복사해서 붙여넣으세요.</p>
          </div>
        </div>

        <button
          onClick={handleCopyPrompt}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 whitespace-nowrap ${
            copied
              ? 'bg-green-600 text-white ring-2 ring-green-400'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/20'
          }`}
        >
          {copied ? (
            <>
              <i className="fas fa-check"></i> 복사 완료!
            </>
          ) : (
            <>
              <i className="fas fa-copy"></i> 변환 프롬프트 복사 (Vite+React)
            </>
          )}
        </button>
      </div>
    </footer>
  );
};

export default ConversionFooter;
