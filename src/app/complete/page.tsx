"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";

export default function Complete() {
  const router = useRouter();

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
              完了
            </h1>
            
            <p className="text-lg text-slate-600 mb-8">
              お疲れ様でした
            </p>
            
            <div className="space-y-4 text-left bg-slate-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-lg opacity-70">🍕</span>
                <span className="text-slate-700">ピザを公平に分割しました</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg opacity-70">🎯</span>
                <span className="text-slate-700">ピースを割り当てました</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg opacity-70">📸</span>
                <span className="text-slate-700">思い出の写真を撮影しました</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg opacity-70">💰</span>
                <span className="text-slate-700">割り勘を計算しました</span>
              </div>
            </div>
            
            <p className="text-slate-700 font-medium mb-2">
              楽しいピザパーティーでしたね
            </p>
            <p className="text-sm text-slate-500">
              またのご利用をお待ちしています
            </p>
          </div>

          <button
            onClick={handleBackToStart}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            最初に戻る
          </button>
        </div>
      </div>
    </div>
  );
}