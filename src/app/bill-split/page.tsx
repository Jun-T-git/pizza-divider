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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-500 p-4">
            <h1 className="text-white text-xl font-bold text-center">
              割り勘計算
            </h1>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                💰 お会計を入力してください
              </h2>

              {/* 金額入力 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  合計金額
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ¥
                  </span>
                  <input
                    type="text"
                    value={totalAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 参加者リスト */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  参加者 ({participants.length}名)
                </h3>
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-800">
                        {participant.name || `参加者${index + 1}`}
                      </span>
                      <span className="text-green-600 font-bold">
                        ¥{splitAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                ※ 端数は切り上げて計算しています
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleComplete}
                className="w-full py-4 px-6 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors shadow-lg"
              >
                完了する
              </button>

              <Link href="/group-photo">
                <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
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
