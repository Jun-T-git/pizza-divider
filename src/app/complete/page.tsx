"use client";

import { useRouter } from "next/navigation";

export default function Complete() {
  const router = useRouter();

  const handleBackToStart = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            完了！
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            お疲れ様でした！
          </p>
          
          <div className="space-y-3 text-left bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍕</span>
              <span className="text-gray-700">ピザを公平に分割しました</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎲</span>
              <span className="text-gray-700">ルーレットで割り当てました</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📸</span>
              <span className="text-gray-700">思い出の写真を撮影しました</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <span className="text-gray-700">満足度で割り勘しました</span>
            </div>
          </div>
          
          <p className="text-lg text-gray-700 font-medium mb-2">
            楽しいピザパーティーでしたね！
          </p>
          <p className="text-sm text-gray-500">
            またのご利用をお待ちしています
          </p>
        </div>

        <button
          onClick={handleBackToStart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-xl">🏠</span>
          最初に戻る
        </button>
      </div>
    </div>
  );
}