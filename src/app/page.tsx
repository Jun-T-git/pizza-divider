"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const handleStart = () => {
    router.push("/camera");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="flex flex-col items-center justify-center p-6 pt-16">
        <div className="text-center max-w-lg mx-auto">
          <div className="text-7xl mb-8">🍕</div>
          
          <h1 className="text-4xl sm:text-5xl font-light text-slate-800 mb-6">
            {t('home.title')}
          </h1>
          
          <p className="text-lg text-slate-600 mb-12 leading-relaxed">
            {t('home.subtitle')}<br />
            {t('home.description')}
          </p>
          
          <button 
            onClick={handleStart}
            className="bg-slate-900 hover:bg-slate-800 text-white text-lg font-medium py-4 px-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 w-full max-w-xs"
          >
            {t('button.start')}
          </button>
          
          <div className="mt-16 grid grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-3 opacity-70">📷</div>
              <p className="text-slate-600">{language === 'ja' ? 'ピザを撮影' : 'Take Photo'}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3 opacity-70">✂️</div>
              <p className="text-slate-600">{language === 'ja' ? '公平に分割' : 'Fair Division'}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3 opacity-70">🎯</div>
              <p className="text-slate-600">{language === 'ja' ? '分配' : 'Distribute'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
