'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DivisionOverlay } from '@/components/DivisionOverlay';
import { calculateIdealCut } from '@/utils/apiClient';

export default function ResultPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [idealSvg, setIdealSvg] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedImage = localStorage.getItem('pizzaImage');
        const savedPeopleCount = localStorage.getItem('peopleCount');
        const savedImageFile = localStorage.getItem('pizzaImageFile');
        
        if (!savedImage || !savedPeopleCount || !savedImageFile) {
          router.push('/');
          return;
        }

        setImageUrl(savedImage);
        const people = parseInt(savedPeopleCount);
        setPeopleCount(people);

        // 保存されたファイル情報から File オブジェクトを再構築
        const fileInfo = JSON.parse(savedImageFile);
        
        // base64からBlobを作成してFileオブジェクトに変換
        const base64Data = savedImage.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileInfo.type });
        const imageFile = new File([blob], fileInfo.name, {
          type: fileInfo.type,
          lastModified: fileInfo.lastModified
        });

        // 理想的な切り方を計算
        const response = await calculateIdealCut(imageFile, people);
        setIdealSvg(response.svg);

        // 結果をlocalStorageに保存（評価で使用）
        localStorage.setItem('idealSvg', response.svg);

      } catch (err) {
        console.error('Error loading result:', err);
        setError('分割結果の読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">分割線を計算中...</h2>
          <p className="text-gray-600">サラミの位置を解析しています</p>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error || '画像データが見つかりません'}</p>
          <Link href="/">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors">
              最初から始める
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-500 p-4">
            <h1 className="text-white text-xl font-bold text-center">分割結果</h1>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                {peopleCount}人で分割
              </h2>
              <DivisionOverlay
                imageUrl={imageUrl}
                idealSvg={idealSvg || undefined}
              />
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">🍕 分割のポイント</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• サラミの位置を考慮して等価値で分割</li>
                <li>• 各ピースの価値を%で表示</li>
                <li>• 中心から外側に向かって切り分けてください</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/evaluate">
                <button className="w-full py-4 px-6 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors shadow-lg">
                  分割後の評価をする
                </button>
              </Link>

              <Link href="/">
                <button className="w-full py-3 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">
                  完了
                </button>
              </Link>

              <Link href="/settings">
                <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  設定を変更
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}