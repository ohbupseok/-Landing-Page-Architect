
import React, { useState } from 'react';

interface CodePreviewProps {
  code: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden mt-8 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium flex items-center ${
              activeTab === 'preview' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <i className="fas fa-desktop mr-2"></i> 미리보기
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium flex items-center ${
              activeTab === 'code' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <i className="fas fa-code mr-2"></i> 코드
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`text-xs px-3 py-1.5 rounded transition-colors flex items-center shadow-lg font-bold border active:transform active:scale-95 ${
              copied 
                ? 'bg-green-600 text-white border-green-500' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-indigo-900/20'
            }`}
          >
             {copied ? (
               <>
                 <i className="fas fa-check mr-1.5"></i> 복사 완료
               </>
             ) : (
               <>
                 <i className="fas fa-copy mr-1.5"></i> HTML 복사
               </>
             )}
          </button>
          <button 
            onClick={handleDownload}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition-colors flex items-center shadow-lg shadow-emerald-900/20 font-bold border border-emerald-500/50 active:transform active:scale-95"
          >
            <i className="fas fa-download mr-1.5"></i> HTML 다운로드
          </button>
        </div>
      </div>

      <div className="h-[800px] w-full bg-white relative">
        {activeTab === 'preview' ? (
          <iframe
            title="Preview"
            srcDoc={code}
            className="w-full h-full border-none bg-white"
            // Removed 'allow-same-origin' to fix 'ERR_BLOCKED_BY_RESPONSE' in AI Studio Build environment.
            // Added allow-forms/popups to support interactive elements in the generated landing page.
            sandbox="allow-scripts allow-forms allow-popups allow-modals"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-950 overflow-auto p-6 custom-scrollbar">
             <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed font-medium">{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePreview;
