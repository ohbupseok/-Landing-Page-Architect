
import React, { useState, useEffect } from 'react';
import { ApiKeys, ImageProvider } from '../types';
import { saveApiKeys, loadApiKeys } from '../utils/secureStorage';
import { testConnection } from '../services/imageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ApiKeys>({ preferredProvider: 'loremflickr' });
  const [testing, setTesting] = useState<string | null>(null);
  const [status, setStatus] = useState<{[key: string]: 'success' | 'error' | null}>({});

  useEffect(() => {
    if (isOpen) {
      setConfig(loadApiKeys());
      setStatus({});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleTest = async (provider: ImageProvider, key?: string) => {
    if (!key && provider !== 'loremflickr') return;
    setTesting(provider);
    const success = await testConnection(provider, key || '');
    setStatus(prev => ({ ...prev, [provider]: success ? 'success' : 'error' }));
    setTesting(null);
  };

  const handleSave = () => {
    saveApiKeys(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-sliders-h text-blue-400"></i> 설정 (이미지 소스)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200">
            <i className="fas fa-shield-alt mr-2"></i>
            API 키는 브라우저(Local Storage)에 <strong>암호화</strong>되어 저장되며, 서버로 전송되지 않습니다.
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              사용할 이미지 소스
            </label>
            <select
              name="preferredProvider"
              value={config.preferredProvider}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="loremflickr">Lorem Flickr (무료/설정 불필요)</option>
              <option value="unsplash">Unsplash (고퀄리티/Key 필요)</option>
              <option value="pexels">Pexels (다양한 분위기/Key 필요)</option>
              <option value="pixabay">Pixabay (방대한 자료/Key 필요)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1 px-1">
              * Lorem Flickr는 별도의 키 설정 없이 바로 랜덤 이미지를 사용할 수 있습니다.
            </p>
          </div>

          <div className="border-t border-slate-700 my-4 pt-4 space-y-6">
             {/* Lorem Flickr Info */}
            {config.preferredProvider === 'loremflickr' && (
                <div className="text-center py-4 text-slate-400 text-sm">
                    <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                    <p>추가 설정이 필요하지 않습니다.</p>
                    <p>Lorem Flickr를 사용하여 이미지를 생성합니다.</p>
                </div>
            )}

            {/* Unsplash */}
            <div className={`transition-opacity duration-200 ${config.preferredProvider === 'unsplash' ? 'opacity-100' : 'hidden'}`}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  Unsplash Access Key
                </label>
              </div>
              <div className="flex gap-2 mb-1">
                <input
                  type="password"
                  name="unsplashAccessKey"
                  value={config.unsplashAccessKey || ''}
                  onChange={handleChange}
                  placeholder="Access Key 입력"
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                />
                <button 
                  onClick={() => handleTest('unsplash', config.unsplashAccessKey)}
                  disabled={!config.unsplashAccessKey}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border min-w-[60px] transition-colors ${
                    status['unsplash'] === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' : 
                    status['unsplash'] === 'error' ? 'bg-red-900/30 border-red-500 text-red-400' :
                    'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                   {testing === 'unsplash' ? <i className="fas fa-spinner fa-spin"></i> : status['unsplash'] === 'success' ? <i className="fas fa-check"></i> : 'Test'}
                </button>
              </div>
              <div className="text-xs text-slate-500 flex justify-between items-center px-1">
                <span>Your Apps &gt; Select App &gt; Keys &gt; Access Key 복사</span>
                <a href="https://unsplash.com/oauth/applications" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30">
                  키 발급 페이지로 이동 <i className="fas fa-external-link-alt ml-1"></i>
                </a>
              </div>
            </div>

            {/* Pexels */}
            <div className={`transition-opacity duration-200 ${config.preferredProvider === 'pexels' ? 'opacity-100' : 'hidden'}`}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  Pexels API Key
                </label>
              </div>
              <div className="flex gap-2 mb-1">
                <input
                  type="password"
                  name="pexelsApiKey"
                  value={config.pexelsApiKey || ''}
                  onChange={handleChange}
                  placeholder="API Key 입력"
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                />
                <button 
                  onClick={() => handleTest('pexels', config.pexelsApiKey)}
                  disabled={!config.pexelsApiKey}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border min-w-[60px] transition-colors ${
                    status['pexels'] === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' : 
                    status['pexels'] === 'error' ? 'bg-red-900/30 border-red-500 text-red-400' :
                    'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                   {testing === 'pexels' ? <i className="fas fa-spinner fa-spin"></i> : status['pexels'] === 'success' ? <i className="fas fa-check"></i> : 'Test'}
                </button>
              </div>
              <div className="text-xs text-slate-500 flex justify-between items-center px-1">
                <span>API Key 생성 버튼 클릭 후 복사</span>
                <a href="https://www.pexels.com/api/new/" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30">
                   키 발급 페이지로 이동 <i className="fas fa-external-link-alt ml-1"></i>
                </a>
              </div>
            </div>

            {/* Pixabay */}
            <div className={`transition-opacity duration-200 ${config.preferredProvider === 'pixabay' ? 'opacity-100' : 'hidden'}`}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  Pixabay API Key
                </label>
              </div>
              <div className="flex gap-2 mb-1">
                <input
                  type="password"
                  name="pixabayApiKey"
                  value={config.pixabayApiKey || ''}
                  onChange={handleChange}
                  placeholder="API Key 입력"
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                />
                <button 
                  onClick={() => handleTest('pixabay', config.pixabayApiKey)}
                  disabled={!config.pixabayApiKey}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border min-w-[60px] transition-colors ${
                    status['pixabay'] === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' : 
                    status['pixabay'] === 'error' ? 'bg-red-900/30 border-red-500 text-red-400' :
                    'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                   {testing === 'pixabay' ? <i className="fas fa-spinner fa-spin"></i> : status['pixabay'] === 'success' ? <i className="fas fa-check"></i> : 'Test'}
                </button>
              </div>
              <div className="text-xs text-slate-500 flex justify-between items-center px-1">
                <span>Documentation 페이지 상단 'Key' 확인</span>
                <a href="https://pixabay.com/api/docs/" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30">
                   키 발급 페이지로 이동 <i className="fas fa-external-link-alt ml-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800 px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 font-medium transition-colors"
          >
            닫기
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
