"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Complete() {
  const router = useRouter();
  const { t } = useLanguage();
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [billInfo, setBillInfo] = useState<{
    total: string;
    participants: Array<{
      id: number;
      name: string;
      color: string;
      active: boolean;
      payRatio?: number;
      amount?: number;
    }>;
    emotionBased?: boolean;
  } | null>(null);

  useEffect(() => {
    // localStorageから情報を取得
    const savedGroupPhoto = localStorage.getItem("groupPhoto");
    const savedBillInfo = localStorage.getItem("billSplitInfo");
    
    if (savedGroupPhoto) {
      setGroupPhoto(savedGroupPhoto);
    }
    
    if (savedBillInfo) {
      try {
        setBillInfo(JSON.parse(savedBillInfo));
      } catch (error) {
        console.error("Error parsing bill info:", error);
      }
    }
  }, []);

  const handleBackToStart = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="flex flex-col items-center justify-center p-6 pt-16">
        <div className="w-full max-w-lg mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="text-6xl mb-8 opacity-80">🎉</div>
            
            <h1 className="text-3xl font-light text-slate-800 mb-4">
              {t('complete.title')}
            </h1>
            
            <p className="text-lg text-slate-600 mb-8">
              {t('complete.thank.you')}
            </p>
            
            {/* グループ写真表示 */}
            {groupPhoto && (
              <div className="mb-8">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-slate-50">
                  <img
                    src={groupPhoto}
                    alt={t('group-photo.subtitle')}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-4 text-left bg-slate-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-lg opacity-70">🍕</span>
                <span className="text-slate-700">{t('complete.description')}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg opacity-70">🎯</span>
                <span className="text-slate-700">{t('roulette.order.result')}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg opacity-70">📸</span>
                <span className="text-slate-700">{t('complete.memories')}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg opacity-70">💰</span>
                <span className="text-slate-700">
                  {t('bill-split.title')}
                  {billInfo?.emotionBased && ` (${t('bill-split.based.on.happiness')})`}
                </span>
              </div>
            </div>
            
            <p className="text-slate-700 font-medium mb-2">
              {t('complete.enjoy')}
            </p>
            <p className="text-sm text-slate-500">
              {t('complete.memories')}
            </p>
          </div>

          <button
            onClick={handleBackToStart}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            {t('button.home')}
          </button>
        </div>
      </div>
    </div>
  );
}