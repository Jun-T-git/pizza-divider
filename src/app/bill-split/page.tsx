"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";

interface EmotionResult {
  detected: number;
  results: Array<{
    image: string;
    dominant: string;
    scores: {
      [key: string]: number;
    };
    pay: number;
  }>;
  file: string;
}

interface ParticipantWithPayment {
  id: number;
  name: string;
  color: string;
  active: boolean;
  payRatio?: number;
  amount?: number;
}

export default function BillSplitPage() {
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState<string>("3000");
  const [participants, setParticipants] = useState<ParticipantWithPayment[]>([]);
  const [emotionResults, setEmotionResults] = useState<EmotionResult | null>(null);
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);

  useEffect(() => {
    // localStorageから参加者情報を取得
    const savedParticipants = localStorage.getItem("participants");
    const savedEmotionResults = localStorage.getItem("emotionResults");
    const savedGroupPhoto = localStorage.getItem("groupPhoto");
    
    // グループ写真を設定
    if (savedGroupPhoto) {
      setGroupPhoto(savedGroupPhoto);
    }
    
    if (savedParticipants) {
      try {
        const parsed = JSON.parse(savedParticipants) as ParticipantWithPayment[];
        
        // 感情認識結果がある場合は支払い比率を計算
        if (savedEmotionResults) {
          const emotionData = JSON.parse(savedEmotionResults) as EmotionResult;
          setEmotionResults(emotionData);
          
          // 各参加者に支払い比率を割り当て
          const updatedParticipants = parsed.map((participant, index) => {
            if (emotionData.results[index]) {
              return {
                ...participant,
                payRatio: emotionData.results[index].pay
              };
            }
            return {
              ...participant,
              payRatio: 1 / parsed.length // デフォルトは均等割り
            };
          });
          
          setParticipants(updatedParticipants);
          calculateAmounts(updatedParticipants, totalAmount);
        } else {
          // 感情認識結果がない場合は均等割り
          const updatedParticipants = parsed.map(p => ({
            ...p,
            payRatio: 1 / parsed.length
          }));
          setParticipants(updatedParticipants);
          calculateAmounts(updatedParticipants, totalAmount);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
  }, [totalAmount]);

  const calculateAmounts = (participantsList: ParticipantWithPayment[], amount: string) => {
    const total = parseInt(amount) || 0;
    if (total === 0 || participantsList.length === 0) return;

    // 支払い比率の合計を計算
    const totalRatio = participantsList.reduce((sum, p) => sum + (p.payRatio || 0), 0);
    
    // 各参加者の金額を計算
    const updatedParticipants = participantsList.map(participant => {
      const ratio = participant.payRatio || 0;
      const amount = Math.ceil((total * ratio) / totalRatio);
      return {
        ...participant,
        amount
      };
    });
    
    setParticipants(updatedParticipants);
  };

  const handleAmountChange = (value: string) => {
    // 数字のみ許可
    const numericValue = value.replace(/[^0-9]/g, "");
    setTotalAmount(numericValue);
    
    // 金額を再計算
    calculateAmounts(participants, numericValue);
  };

  const handleComplete = () => {
    // 割り勘情報を保存
    const billData: {
      total: string;
      emotionBased: boolean;
      facePayments?: Array<{
        index: number;
        image: string;
        dominant: string;
        payRatio: number;
        amount: number;
      }>;
      participants?: ParticipantWithPayment[];
    } = {
      total: totalAmount,
      emotionBased: !!emotionResults,
    };
    
    if (emotionResults && emotionResults.results) {
      // 感情認識結果がある場合は顔ごとの金額を保存
      billData.facePayments = emotionResults.results.map((result, index) => {
        const amount = Math.ceil((parseInt(totalAmount) || 0) * result.pay / emotionResults.results.reduce((sum, r) => sum + r.pay, 0));
        return {
          index: index + 1,
          image: result.image,
          dominant: result.dominant,
          payRatio: result.pay,
          amount: amount
        };
      });
    } else {
      // 感情認識結果がない場合は参加者情報を保存
      billData.participants = participants;
    }
    
    localStorage.setItem("billSplitInfo", JSON.stringify(billData));
    router.push("/complete");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="max-w-lg mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-slate-800 mb-2">
            割り勘計算
          </h2>
          <p className="text-slate-600 text-sm">
            お会計を入力してください
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-8">
              {/* グループ写真表示 */}
              {groupPhoto && (
                <div className="mb-6">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-slate-50">
                    <img
                      src={groupPhoto}
                      alt="グループ写真"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    みんなの記念写真
                  </p>
                </div>
              )}

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
                  {emotionResults ? `検出された顔 (${emotionResults.detected}名)` : `参加者 (${participants.length}名)`}
                </h3>
                <div className="space-y-3">
                  {emotionResults && emotionResults.results ? (
                    // 感情認識結果がある場合は顔写真ごとに表示
                    emotionResults.results.map((result, index) => {
                      const amount = Math.ceil((parseInt(totalAmount) || 0) * result.pay / emotionResults.results.reduce((sum, r) => sum + r.pay, 0));
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            {result.image ? (
                              <img
                                src={`data:image/jpeg;base64,${result.image}`}
                                alt={`顔${index + 1}`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-slate-800">
                                顔{index + 1}
                              </span>
                              <div className="text-xs text-slate-500">
                                {result.dominant} ({Math.round(result.pay * 100)}%)
                              </div>
                            </div>
                          </div>
                          <span className="text-slate-900 font-semibold">
                            ¥{amount.toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    // 感情認識結果がない場合は従来通りユーザー名で表示
                    participants.map((participant, index) => (
                      <div
                        key={participant.id || index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-800">
                            {participant.name || `参加者${index + 1}`}
                          </span>
                        </div>
                        <span className="text-slate-900 font-semibold">
                          ¥{(participant.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                {emotionResults 
                  ? "※ 感情認識結果をもとに支払い比率を計算しています"
                  : "※ 端数は切り上げて計算しています"}
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
