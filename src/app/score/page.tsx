'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { evaluateDivision } from '@/utils/dummyApi';

export default function ScorePage() {
  const router = useRouter();
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAndEvaluate = async () => {
      try {
        const savedBeforeImage = localStorage.getItem('pizzaImage');
        const savedAfterImage = localStorage.getItem('afterPizzaImage');
        
        if (!savedBeforeImage || !savedAfterImage) {
          router.push('/result');
          return;
        }

        setBeforeImage(savedBeforeImage);
        setAfterImage(savedAfterImage);

        const beforeFile = new File([''], 'before.jpg', { type: 'image/jpeg' });
        const afterFile = new File([''], 'after.jpg', { type: 'image/jpeg' });
        
        const evaluationScore = await evaluateDivision(beforeFile, afterFile);
        setScore(evaluationScore);

      } catch (err) {
        console.error('Error evaluating division:', err);
        setError('評価の計算に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadAndEvaluate();
  }, [router]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return '素晴らしい！完璧な分割です！';
    if (score >= 80) return 'とても良い分割です！';
    if (score >= 70) return '良い分割です！';
    if (score >= 60) return 'まずまずの分割です';
    return '次回はもう少し丁寧に分割してみましょう';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">評価を計算中...</h2>
          <p className="text-gray-600">分割の精度を解析しています</p>
        </div>
      </div>
    );
  }

  if (error || !beforeImage || !afterImage || score === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error || '画像データが見つかりません'}</p>
          <Link href="/result">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors">
              分割結果に戻る
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
          <div className="bg-green-500 p-4">
            <h1 className="text-white text-xl font-bold text-center">評価結果</h1>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
                {score}点
              </div>
              <p className="text-lg text-gray-700 font-medium">
                {getScoreMessage(score)}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">分割前</h3>
                <img
                  src={beforeImage}
                  alt="分割前のピザ"
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">分割後</h3>
                <img
                  src={afterImage}
                  alt="分割後のピザ"
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 評価ポイント</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 分割線の正確性</li>
                <li>• 各ピースの価値均等性</li>
                <li>• サラミの分散度</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/">
                <button className="w-full py-4 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-lg">
                  新しいピザを分割する
                </button>
              </Link>

              <Link href="/result">
                <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  分割結果に戻る
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}