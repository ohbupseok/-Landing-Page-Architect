import React, { useState } from 'react';
import InputForm from './components/InputForm';
import MarkdownDisplay from './components/MarkdownDisplay';
import CodePreview from './components/CodePreview';
import SettingsModal from './components/SettingsModal';
import { startPlanningSession, generateCodePhase } from './services/geminiService';
import { processHtmlWithRealImages } from './services/imageService';
import { loadApiKeys } from './utils/secureStorage';
import { UserInputs, AppStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [planContent, setPlanContent] = useState<string>('');
  const [codeContent, setCodeContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState<string>('코드 생성 중...');

  const handleFormSubmit = async (data: UserInputs) => {
    setStatus(AppStatus.GENERATING_PLAN);
    setErrorMsg(null);
    try {
      const result = await startPlanningSession(data);
      setPlanContent(result);
      setStatus(AppStatus.PLAN_COMPLETE);
      // Scroll to plan section
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "기획안 생성 중 오류가 발생했습니다.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateCode = async () => {
    // 1. Validate Image API Configuration
    const apiConfig = loadApiKeys();
    const { preferredProvider } = apiConfig;
    
    let isKeyMissing = false;
    if (preferredProvider === 'unsplash' && !apiConfig.unsplashAccessKey) isKeyMissing = true;
    else if (preferredProvider === 'pexels' && !apiConfig.pexelsApiKey) isKeyMissing = true;
    else if (preferredProvider === 'pixabay' && !apiConfig.pixabayApiKey) isKeyMissing = true;

    setStatus(AppStatus.GENERATING_CODE);
    setGeneratingMessage('구조 및 디자인 코드 생성 중...');
    setErrorMsg(null);
    
    try {
      // 2. Generate Raw HTML from Gemini
      const rawHtml = await generateCodePhase();
      
      // 3. Post-process HTML to replace placeholders with real images
      let finalHtml = rawHtml;
      
      const providerName = apiConfig.preferredProvider.charAt(0).toUpperCase() + apiConfig.preferredProvider.slice(1);
      setGeneratingMessage(`${providerName} 이미지 적용 중...`);
      
      try {
        finalHtml = await processHtmlWithRealImages(rawHtml, apiConfig);
      } catch (imgError) {
        console.error("Image replacement failed, using placeholders", imgError);
      }

      setCodeContent(finalHtml);
      setStatus(AppStatus.CODE_COMPLETE);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "코드 생성 중 오류가 발생했습니다.");
      setStatus(AppStatus.PLAN_COMPLETE); // Revert to plan complete state
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative">
      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Landing Page Architect</span>
            <span className="font-bold text-xl tracking-tight text-white sm:hidden">LPA</span>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mr-2 border-r border-slate-700 pr-4">
              <a 
                href="https://www.youtube.com/@siliconrenaissance" 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-red-500 transition-all transform hover:scale-110 text-xl flex items-center"
                title="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a 
                href="https://blog.naver.com/joy014" 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-green-500 transition-all transform hover:scale-110 text-xl flex items-center"
                title="Blog"
              >
                <i className="fas fa-rss"></i>
              </a>
              <a 
                href="https://www.threads.com/@ohbeopseok" 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-white transition-all transform hover:scale-110 text-xl flex items-center"
                title="Threads"
              >
                <i className="fa-brands fa-threads"></i>
              </a>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              <i className="fas fa-cog"></i>
              <span className="hidden sm:inline">설정</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        
        {/* Step 1: Input Form */}
        {status === AppStatus.IDLE || status === AppStatus.GENERATING_PLAN || status === AppStatus.ERROR ? (
           <div className="animate-fade-in-up">
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
                  아이디어만 있으면<br />기획과 코드가 완성됩니다
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  주제와 타겟만 입력하세요. AI Studio Build에 바로 사용할 수 있는
                  최적화된 프롬프트를 생성해드립니다.
                </p>
              </div>
              <InputForm 
                onSubmit={handleFormSubmit} 
                isSubmitting={status === AppStatus.GENERATING_PLAN} 
              />
           </div>
        ) : null}

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8 mt-4 flex items-center gap-3 animate-pulse">
            <i className="fas fa-exclamation-triangle"></i>
            {errorMsg}
          </div>
        )}

        {/* Step 2: Plan Display */}
        {(status === AppStatus.PLAN_COMPLETE || status === AppStatus.GENERATING_CODE || status === AppStatus.CODE_COMPLETE) && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center text-sm border border-blue-500/30">1</span>
                AI Studio Build 요청용 기획안
              </h2>
              {status === AppStatus.PLAN_COMPLETE && (
                 <button 
                   onClick={handleGenerateCode}
                   className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105 flex items-center gap-2"
                 >
                   <i className="fas fa-code"></i> PROTO TYPE 만들기
                 </button>
              )}
              {status === AppStatus.GENERATING_CODE && (
                 <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/20 animate-pulse">
                   <i className="fas fa-cog fa-spin"></i> {generatingMessage}
                 </div>
              )}
            </div>
            
            <MarkdownDisplay content={planContent} />
          </div>
        )}

        {/* Step 3: Code Display */}
        {status === AppStatus.CODE_COMPLETE && (
          <div className="mt-16 space-y-6 animate-fade-in-up">
            <div className="border-t border-slate-800 pt-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-900/50 text-purple-400 flex items-center justify-center text-sm border border-purple-500/30">2</span>
                프로토타입 구현 (Phase 2)
              </h2>
              <p className="text-slate-400 mt-2">
                위 기획안을 바탕으로 이 앱에서 직접 생성한 프로토타입입니다.
              </p>
            </div>
            
            <CodePreview code={codeContent} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;