'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRanking } from '@/utils/apiClient';
import { RankingEntry } from '@/types';

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<RankingEntry | null>(null);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const response = await getRanking();
        setRanking(response.ranking);

        // 保存されたスコアがあれば、ユーザーの順位を表示
        const savedScore = localStorage.getItem('savedScore');
        if (savedScore) {
          const { accountName, score } = JSON.parse(savedScore);
          // 実際のランキングから該当する項目を探す
          const userEntry = response.ranking.find(entry => 
            entry.account_name === accountName && entry.score === score
          );
          if (userEntry) {
            setUserRank(userEntry);
          }
        }

      } catch (err) {
        console.error('Error loading ranking:', err);
        setError('ランキングの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadRanking();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-gray-600 bg-gray-50 border-gray-200';
      case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">ランキング読み込み中...</h2>
          <p className="text-gray-600">最新のスコアを取得しています</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors">
              ホームに戻る
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-purple-500 p-4">
            <h1 className="text-white text-xl font-bold text-center">🏆 ランキング</h1>
          </div>
          
          <div className="p-6">
            {userRank && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 mb-2">あなたの順位</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getRankIcon(userRank.rank)}</span>
                    <div>
                      <div className="font-bold text-gray-800">{userRank.account_name}</div>
                      <div className="text-sm text-gray-600">{userRank.rank}位</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {userRank.score.toFixed(1)}点
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">トップランキング</h2>
              
              {ranking.map((entry, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border-2 transition-all
                    ${getRankColor(entry.rank)}
                    ${userRank?.account_name === entry.account_name ? 'ring-2 ring-green-400' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getRankIcon(entry.rank)}</span>
                    <div>
                      <div className="font-bold text-gray-800">{entry.account_name}</div>
                      <div className="text-sm text-gray-600">{entry.rank}位</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    {entry.score.toFixed(1)}点
                  </div>
                </div>
              ))}

              {ranking.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📊</div>
                  <p className="text-gray-600">まだランキングデータがありません</p>
                  <p className="text-sm text-gray-500 mt-2">最初にスコアを投稿してみましょう！</p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <Link href="/">
                <button className="w-full py-4 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-lg">
                  新しいピザを分割する
                </button>
              </Link>

              <Link href="/score">
                <button className="w-full py-3 px-6 rounded-lg border-2 border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition-colors">
                  スコア画面に戻る
                </button>
              </Link>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📈 ランキングについて</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• スコアは分割の精度を100点満点で評価</li>
                <li>• 上位者は理想的な分割に近い結果を達成</li>
                <li>• ランキングは定期的に更新されます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}