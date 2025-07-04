'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ja' ? 'en' : 'ja');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white border border-slate-600"
      aria-label={`Switch to ${language === 'ja' ? 'English' : 'Japanese'}`}
      title={`Switch to ${language === 'ja' ? 'English' : 'Japanese'}`}
    >
      <span className="text-sm font-medium">
        {language === 'ja' ? '🇯🇵 日本語' : '🇺🇸 English'}
      </span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>
    </button>
  );
};