"use client";

import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  onBack,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between relative">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={onBack}
              className="mr-3 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label={t('nav.back')}
              title={t('nav.back')}
            >
              <svg
                className="w-5 h-5 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold text-white">{t('app.name')}</h1>
        </div>
        <LanguageToggle />
      </div>
    </div>
  );
};
