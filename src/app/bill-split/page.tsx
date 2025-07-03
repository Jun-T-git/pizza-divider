"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BillSplitPage() {
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState<string>("3000");
  const [participants, setParticipants] = useState<Array<{ id: number; name: string; color: string; active: boolean }>>([]);
  const [splitAmount, setSplitAmount] = useState<number>(0);

  useEffect(() => {
    // localStorageから参加者情報を取得
    const savedParticipants = localStorage.getItem("participants");
    if (savedParticipants) {
      try {
        const parsed = JSON.parse(savedParticipants);
        setParticipants(parsed);

        // 金額を人数で割る
        const amount = parseInt(totalAmount) || 0;
        const perPerson = Math.ceil(amount / parsed.length);
        setSplitAmount(perPerson);
      } catch (error) {
        console.error("Error loading participants:", error);
      }
    }
  }, [totalAmount]);

  const handleAmountChange = (value: string) => {
    // 数字のみ許可
    const numericValue = value.replace(/[^0-9]/g, "");
    setTotalAmount(numericValue);

    // 金額を再計算
    const amount = parseInt(numericValue) || 0;
    const perPerson =
      participants.length > 0 ? Math.ceil(amount / participants.length) : 0;
    setSplitAmount(perPerson);
  };

  const handleComplete = () => {
    // 割り勘情報を保存
    localStorage.setItem(
      "billSplitInfo",
      JSON.stringify({
        total: totalAmount,
        perPerson: splitAmount,
        participants: participants,
      })
    );

    router.push("/complete");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-slate-800 text-2xl font-light text-center">
              割り勘計算
            </h1>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-medium text-slate-800 mb-6">
                お会計を入力してください
              </h2>

              {/* 金額入力 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  合計金額
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                    ¥
                  </span>
                  <input
                    type="text"
                    value={totalAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-transparent text-lg font-medium bg-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 参加者リスト */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-4">
                  参加者 ({participants.length}名)
                </h3>
                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id || index}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                      <span className="font-medium text-slate-800">
                        {participant.name || `参加者${index + 1}`}
                      </span>
                      <span className="text-slate-900 font-semibold">
                        ¥{splitAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                ※ 端数は切り上げて計算しています
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleComplete}
                className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all hover:scale-105 shadow-sm"
              >
                完了する
              </button>

              <Link href="/group-photo">
                <button className="w-full py-3 px-6 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  戻る
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
