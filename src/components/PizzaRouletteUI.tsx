"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import PizzaPieces from "./PizzaPieces";
import { COLOR_DEFINITIONS, HEX_TO_COLOR_NAME, AVAILABLE_COLOR_NAMES } from "@/utils/colorDefinitions";

// 型定義
interface PizzaPiece {
  id: number;
  imageUrl: string;
  isAssigned: boolean;
  assignedTo?: string;
}

interface User {
  id: number;
  nickname: string;
  color: string; // ユーザー識別カラー
  assignedPiece?: PizzaPiece;
}

// サンプルデータ
const initialPieces: PizzaPiece[] = [
  {
    id: 1,
    imageUrl: "/pieces/piece_0.svg",
    isAssigned: false,
  },
  {
    id: 2,
    imageUrl: "/pieces/piece_1.svg",
    isAssigned: false,
  },
  {
    id: 3,
    imageUrl: "/pieces/piece_2.svg",
    isAssigned: false,
  },
  {
    id: 4,
    imageUrl: "/pieces/piece_3.svg",
    isAssigned: false,
  },
];


const PizzaRouletteUI: React.FC = () => {
  const router = useRouter();
  const [pieces, setPieces] = useState<PizzaPiece[]>(initialPieces);
  const [users, setUsers] = useState<User[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [assignments, setAssignments] = useState<{ [pieceId: number]: User }>(
    {}
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pieceColors, setPieceColors] = useState<{ [pieceId: number]: string }>({});
  const [isColorAnimating, setIsColorAnimating] = useState(false);

  // デバッグ用ログ
  console.log("Current users:", users);
  console.log("Current assignments:", assignments);

  // localStorage から参加者情報を取得
  useEffect(() => {
    const savedParticipants = localStorage.getItem("participants");
    if (savedParticipants) {
      try {
        const participants = JSON.parse(savedParticipants);
        if (Array.isArray(participants) && participants.length > 0) {
          const loadedUsers = participants
            .filter((p) => p && (p.id || p.name)) // 有効な参加者のみ
            .map((p: any, index: number) => ({
              id: p.id || index + 1,
              nickname: p.name || `参加者${p.id || index + 1}`,
              color: p.color || "#ef4444", // 色情報を保持（デフォルトは赤）
            }));

          if (loadedUsers.length > 0) {
            setUsers(loadedUsers);
          }
        }
      } catch (error) {
        console.error("Error loading participants:", error);
      }
    } else {
      // 参加者情報がない場合は設定画面へリダイレクト
      router.push("/settings");
    }
  }, [router]);

  // ワクワクするアニメーション付きルーレット機能
  const startRoulette = () => {
    if (!users || users.length === 0) {
      console.error("ユーザーが設定されていません");
      return;
    }

    setIsSpinning(true);
    setIsColorAnimating(true);


    // シャッフルしたユーザー配列を作成
    const validUsers = users.filter((user) => user && user.id);
    const shuffledUsers = [...validUsers].sort(() => Math.random() - 0.5);

    // 各ピースにユーザーを割り当て（ユーザーの色も一緒に設定）
    const newAssignments: { [pieceId: number]: User } = {};
    const finalColors: { [pieceId: number]: string } = {};
    
    pieces.forEach((piece, index) => {
      if (shuffledUsers[index % shuffledUsers.length]) {
        const assignedUser = shuffledUsers[index % shuffledUsers.length];
        newAssignments[piece.id] = assignedUser;
        // ユーザーの色からピースの色を決定（マッピングにない場合はランダム）
        finalColors[piece.id] = HEX_TO_COLOR_NAME[assignedUser.color] || 
          AVAILABLE_COLOR_NAMES[Math.floor(Math.random() * AVAILABLE_COLOR_NAMES.length)];
      }
    });

    // カラーアニメーション（高速で色が変わる）
    let colorAnimationCount = 0;
    const maxColorAnimations = 20; // 2秒間で20回色変更
    
    const colorInterval = setInterval(() => {
      const tempColors: { [pieceId: number]: string } = {};
      pieces.forEach((piece) => {
        tempColors[piece.id] = AVAILABLE_COLOR_NAMES[Math.floor(Math.random() * AVAILABLE_COLOR_NAMES.length)];
      });
      setPieceColors(tempColors);
      
      colorAnimationCount++;
      if (colorAnimationCount >= maxColorAnimations) {
        clearInterval(colorInterval);
        
        // 最終的な色を設定
        setPieceColors(finalColors);
        setIsColorAnimating(false);
        
        // 少し遅らせてユーザー割り当てを表示
        setTimeout(() => {
          setAssignments(newAssignments);
          setIsSpinning(false);
          setIsCompleted(true);

          // ピースを割り当て済みに更新
          setPieces((prev) =>
            prev.map((piece) => ({
              ...piece,
              isAssigned: true,
              assignedTo: newAssignments[piece.id]?.nickname || "Unknown",
            }))
          );
        }, 500);
      }
    }, 100); // 100ms間隔で色変更
  };

  // リセット機能
  const resetAssignments = () => {
    setPieces(initialPieces);
    setAssignments({});
    setPieceColors({});
    setIsCompleted(false);
    setCurrentStep(0);
    setIsSpinning(false);
    setIsColorAnimating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-orange-800 mb-8">
          🍕 ピザルーレット
        </h1>

        {/* ピザビジュアライゼーション */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-8">
          <div className={`transition-all duration-300 ${isColorAnimating ? 'animate-pulse scale-105' : ''}`}>
            <PizzaPieces pieces={pieces} pieceColors={pieceColors} />
          </div>
          
          {/* カラーアニメーション中の表示 */}
          {isColorAnimating && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                <span className="text-lg font-semibold text-red-600 animate-bounce">
                  🎨 色を決めています...
                </span>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
              </div>
            </div>
          )}
        </div>

        {/* コントロールパネル */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {!isCompleted && !isSpinning && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ピースを割り当てましょう！
              </h2>
              <button
                onClick={startRoulette}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 animate-pulse"
              >
                🎯 ワクワクルーレット開始
              </button>
            </div>
          )}

          {isSpinning && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
              <p className="text-xl text-gray-700 font-semibold animate-bounce">
                {isColorAnimating ? '🌈 色をランダム選択中...' : '👥 ユーザーを割り当て中...'}
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-6">
                🎉 割り当て完了！
              </h2>

              {/* ユーザー別結果表示 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {users
                  .filter((user) => user && user.id)
                  .map((user) => {
                    const assignedPieceId = Object.keys(assignments).find(
                      (pieceId) => assignments[Number(pieceId)]?.id === user.id
                    );
                    const assignedPiece = pieces.find(
                      (p) => p.id === Number(assignedPieceId)
                    );

                    return (
                      <div
                        key={user.id}
                        className="border-2 rounded-lg p-4 transition-all hover:scale-105 animate-fadeIn"
                        style={{ borderColor: user.color || "#gray" }}
                      >
                        <div
                          className="w-8 h-8 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: user.color || "#gray" }}
                        ></div>
                        <div className="font-bold text-gray-800 mb-2">
                          {user.nickname || "Unknown"}
                        </div>
                        {assignedPiece && (
                          <div className="w-16 h-16 mx-auto mb-2">
                            <img
                              src={assignedPiece.imageUrl}
                              alt={`ピース${assignedPiece.id}`}
                              className="w-full h-full object-contain"
                              style={{
                                filter: pieceColors[assignedPiece.id] 
                                  ? `hue-rotate(${getHueRotation(pieceColors[assignedPiece.id])}deg) saturate(1.5)` 
                                  : 'none'
                              }}
                            />
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          ピース {assignedPieceId || "?"}
                        </div>
                        {pieceColors[Number(assignedPieceId)] && (
                          <div 
                            className="text-xs font-medium mt-1" 
                            style={{ 
                              color: COLOR_DEFINITIONS[pieceColors[Number(assignedPieceId)] as keyof typeof COLOR_DEFINITIONS]?.hex || '#000' 
                            }}
                          >
                            🎨 {pieceColors[Number(assignedPieceId)]}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/group-photo")}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105"
                >
                  📸 集合写真へ進む
                </button>

                <button
                  onClick={resetAssignments}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105"
                >
                  🔄 もう一度
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 色名からhue-rotate値を計算
const getHueRotation = (colorName: string): number => {
  const hueMap: { [key: string]: number } = {
    red: 0,
    orange: 30,
    yellow: 60,
    green: 120,
    cyan: 180,
    blue: 240,
    purple: 270,
    pink: 320
  };
  return hueMap[colorName] || 0;
};

export default PizzaRouletteUI;
