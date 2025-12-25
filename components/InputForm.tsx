
import React, { useState, useRef, useEffect } from 'react';
import { UserInputs } from '../types';
import { generateSuggestions } from '../services/geminiService';

interface InputFormProps {
  onSubmit: (data: UserInputs) => void;
  isSubmitting: boolean;
}

const TOPIC_PRESETS = [
  "개인 홈피(About Me)",
  "프로필 카드(링크 인 바이오)",
  "이력서/경력 소개(온라인 CV)",
  "포트폴리오(디자이너/개발자/작가)",
  "회사, 병원, 기업, 가게 등의 홍보 페이지",
  "뉴스레터 구독",
  "콘텐츠 허브(블로그/유튜브/팟캐스트 모음)",
  "디지털 굿즈 판매(템플릿, 전자책, 코드 스니펫)",
  "컨설팅/멘토링 예약",
  "프리랜서 서비스(디자인/개발/번역 등)",
  "수업/클래스/워크숍 접수",
  "지역 소규모 서비스(사진 촬영, 홈튜터, 헤어 등)",
  "후원/기부(크리에이터 후원, 프로젝트 펀딩)",
  "웹도구 모음(개발·마케팅 툴북마크/본인 제작 툴)",
  "바로가기(즐겨찾기/리소스 링크 허브)",
  "미니 웹앱/게임/계산기/체크리스트",
  "오픈소스/프로젝트 랜딩",
  "대기자 명단(앱/사이드 프로젝트)",
  "설문/피드백 수집",
  "기타(사용자입력)"
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isSubmitting }) => {
  const [inputs, setInputs] = useState<UserInputs>({
    topic: '',
    target: '',
    goal: '',
  });
  const [showPresets, setShowPresets] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPresets(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handlePresetSelect = (preset: string) => {
    if (preset === "기타(사용자입력)") {
      setInputs(prev => ({ ...prev, topic: '' }));
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setInputs(prev => ({ ...prev, topic: preset }));
    }
    setShowPresets(false);
  };

  const handleAutoSuggest = async () => {
    if (!inputs.topic) {
      alert("주제를 먼저 입력해주세요.");
      inputRef.current?.focus();
      return;
    }
    
    setIsSuggesting(true);
    try {
      const suggestion = await generateSuggestions(inputs.topic);
      setInputs(prev => ({
        ...prev,
        target: suggestion.target,
        goal: suggestion.goal
      }));
    } catch (error) {
      console.error(error);
      alert("제안 생성에 실패했습니다. API 키를 확인해주세요.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.topic && inputs.target && inputs.goal) {
      onSubmit(inputs);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 relative">
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        프로젝트 정의
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative" ref={dropdownRef}>
          <div className="flex justify-between items-end mb-2">
            <label className="block text-sm font-medium text-slate-300">
              웹사이트 주제 (Topic)
            </label>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700/50"
            >
              <i className="fas fa-list-ul"></i> 주제 예시 선택
            </button>
          </div>
          
          {/* Dropdown Menu */}
          {showPresets && (
            <div className="absolute right-0 top-9 z-30 w-full sm:w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
              {TOPIC_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white border-b border-slate-700/50 last:border-0 transition-colors flex items-center justify-between group"
                >
                  <span>{preset}</span>
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity text-slate-500"></i>
                </button>
              ))}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            name="topic"
            value={inputs.topic}
            onChange={handleChange}
            placeholder="예: AI 기반 영어 학습 플랫폼, 친환경 커피 구독 서비스"
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            required
            autoComplete="off"
          />
          
          {/* AI Suggest Button */}
          <div className="mt-2 flex justify-end">
             <button
               type="button"
               onClick={handleAutoSuggest}
               disabled={isSuggesting || !inputs.topic}
               className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                 inputs.topic 
                  ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900 hover:text-indigo-200 border border-indigo-500/30 cursor-pointer' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
               }`}
             >
               {isSuggesting ? (
                 <>
                   <i className="fas fa-spinner fa-spin"></i> 생각하는 중...
                 </>
               ) : (
                 <>
                   <i className="fas fa-magic"></i> 타겟/목표 자동 완성
                 </>
               )}
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                타겟 고객 (Target Audience)
              </label>
              <input
                type="text"
                name="target"
                value={inputs.target}
                onChange={handleChange}
                placeholder="예: 자기개발에 관심 많은 2030 직장인"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                핵심 목표 (Core Goal)
              </label>
              <textarea
                name="goal"
                value={inputs.goal}
                onChange={handleChange}
                placeholder="예: 무료 체험 가입 전환율 10% 달성, 브랜드 인지도 제고"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none h-24 resize-none"
                required
              />
            </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
            isSubmitting 
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-spinner fa-spin"></i> 기획안 생성 중...
            </span>
          ) : (
            '기획안 생성 시작'
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
