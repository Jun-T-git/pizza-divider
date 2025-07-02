'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<number>(2);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const savedImage = localStorage.getItem('pizzaImage');
    if (!savedImage) {
      router.push('/camera');
      return;
    }
    setImageUrl(savedImage);
  }, [router]);

  const handleCalculateDivision = async () => {
    setIsCalculating(true);
    
    try {
      localStorage.setItem('peopleCount', selectedPeople.toString());
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      router.push('/result');
    } catch (error) {
      console.error('Division calculation error:', error);
      alert('分割線の計算に失敗しました');
    } finally {
      setIsCalculating(false);
    }
  };

  const peopleOptions = [2, 3, 4, 5, 6];

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">画像を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-orange-500 p-4">
            <h1 className="text-white text-xl font-bold text-center">分割設定</h1>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">撮影したピザ</h2>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-gray-100">
                <img
                  src={imageUrl}
                  alt="撮影したピザ"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">人数を選択</h2>
              <div className="grid grid-cols-3 gap-3">
                {peopleOptions.map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedPeople(count)}
                    className={`
                      py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200
                      ${selectedPeople === count
                        ? 'bg-orange-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {count}人
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCalculateDivision}
                disabled={isCalculating}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200
                  ${isCalculating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 active:scale-95'
                  }
                  text-white shadow-lg min-h-[60px] flex items-center justify-center
                `}
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    計算中...
                  </>
                ) : (
                  '分割線を計算する'
                )}
              </button>

              <Link href="/camera">
                <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  撮り直す
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}