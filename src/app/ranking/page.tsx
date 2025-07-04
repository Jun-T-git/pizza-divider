'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRanking } from '@/utils/apiClient';
import { RankingEntry } from '@/types';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RankingPage() {
  const { t } = useLanguage();
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
        setError(t('ranking.error.load'));
      } finally {
        setIsLoading(false);
      }
    };

    loadRanking();
  }, [t]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-medium text-slate-800 mb-2">{t('ranking.loading')}</h2>
            <p className="text-slate-600">{t('ranking.loading.description')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center pt-32 p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-medium text-slate-800 mb-4">{t('ranking.error')}</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link href="/">
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-sm">
                {t('button.home')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="max-w-lg mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-slate-800 mb-2">
            🏆 {t('ranking.title')}
          </h2>
          <p className="text-slate-600 text-sm">
            {t('ranking.description')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            {userRank && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 mb-2">{t('ranking.your.rank')}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getRankIcon(userRank.rank)}</span>
                    <div>
                      <div className="font-bold text-gray-800">{userRank.account_name}</div>
                      <div className="text-sm text-gray-600">{t('ranking.rank.position', { rank: userRank.rank })}</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {t('ranking.points', { score: userRank.score.toFixed(1) })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('ranking.top.ranking')}</h2>
              
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
                      <div className="text-sm text-gray-600">{t('ranking.rank.position', { rank: entry.rank })}</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    {t('ranking.points', { score: entry.score.toFixed(1) })}
                  </div>
                </div>
              ))}

              {ranking.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📊</div>
                  <p className="text-gray-600">{t('ranking.no.data')}</p>
                  <p className="text-sm text-gray-500 mt-2">{t('ranking.no.data.description')}</p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <Link href="/">
                <button className="w-full py-4 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-lg">
                  {t('ranking.button.new.pizza')}
                </button>
              </Link>

              <Link href="/score">
                <button className="w-full py-3 px-6 rounded-lg border-2 border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition-colors">
                  {t('ranking.button.back.score')}
                </button>
              </Link>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📈 {t('ranking.about.title')}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('ranking.about.1')}</li>
                <li>• {t('ranking.about.2')}</li>
                <li>• {t('ranking.about.3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}