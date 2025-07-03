"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/camera");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="text-8xl mb-6">🍕</div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ピザ分割アプリ
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          公平にピザを分けて<br />
          みんなで楽しく食べよう！
        </p>
        
        <button 
          onClick={handleStart}
          className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[60px] flex items-center justify-center gap-3 w-full"
        >
          <span className="text-2xl">🚀</span>
          スタート
        </button>
        
        <div className="mt-12 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-3xl mb-2">📷</div>
            <p className="text-gray-600">ピザを撮影</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">✂️</div>
            <p className="text-gray-600">公平に分割</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎲</div>
            <p className="text-gray-600">ルーレット</p>
          </div>
        </div>
      </div>
    </div>
  );
}
