"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SplitBill() {
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState("3000");
  
  // ダミーデータ：表情満足度に基づく重み付け
  const participants = [
    { id: 1, name: "太郎", satisfaction: 95, emoji: "😄" },
    { id: 2, name: "花子", satisfaction: 88, emoji: "😊" },
    { id: 3, name: "次郎", satisfaction: 75, emoji: "🙂" },
    { id: 4, name: "美咲", satisfaction: 92, emoji: "😁" },
  ];

  // 満足度に基づいて支払い比率を計算
  const totalSatisfaction = participants.reduce((sum, p) => sum + p.satisfaction, 0);
  const payments = participants.map(p => ({
    ...p,
    ratio: p.satisfaction / totalSatisfaction,
    amount: Math.round((Number(totalAmount) * p.satisfaction) / totalSatisfaction)
  }));

  const handleNext = () => {
    router.push("/complete");
  };

  const handleBack = () => {
    router.push("/group-photo");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">💰 割り勘金額計算</h1>
          <p className="text-gray-600">表情満足度による重み付けで計算します</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              合計金額（円）
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-2xl font-bold text-center"
            />
          </div>

          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{payment.emoji}</span>
                    <span className="font-medium text-gray-800">{payment.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      ¥{payment.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      満足度: {payment.satisfaction}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${payment.satisfaction}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">計算方法：</p>
              <p>満足度が高い人ほど多く支払う仕組みです。</p>
              <p>「美味しかった分だけ払う」公平な割り勘！</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleNext}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="text-xl">✅</span>
            完了
          </button>

          <button
            onClick={handleBack}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all duration-200"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}