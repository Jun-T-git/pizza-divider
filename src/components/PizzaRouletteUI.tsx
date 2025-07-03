"use client";

import {
  AVAILABLE_COLOR_NAMES,
  COLOR_DEFINITIONS,
  HEX_TO_COLOR_NAME,
} from "@/utils/colorDefinitions";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Header } from "./Header";
import PizzaPieces from "./PizzaPieces";

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

const PizzaRouletteUI: React.FC = () => {
  const router = useRouter();
  const [pieces, setPieces] = useState<PizzaPiece[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [assignments, setAssignments] = useState<{ [pieceId: number]: User }>(
    {}
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [, setCurrentStep] = useState(0);
  const [pieceColors, setPieceColors] = useState<{ [pieceId: number]: string }>(
    {}
  );
  const [isColorAnimating, setIsColorAnimating] = useState(false);
  const [svgContents, setSvgContents] = useState<{ [pieceId: number]: string }>(
    {}
  );

  // デバッグ用ログ
  console.log("Current users:", users);
  console.log("Current assignments:", assignments);

  // pizzaCutterResultsからpiece_svgsを読み込む
  useEffect(() => {
    const pizzaCutterResults = localStorage.getItem("pizzaCutterResults");
    if (pizzaCutterResults) {
      try {
        const results = JSON.parse(pizzaCutterResults);
        if (results.success && results.piece_svgs && Array.isArray(results.piece_svgs)) {
          const loadedPieces = results.piece_svgs.map((svg: string, index: number) => ({
            id: index + 1,
            imageUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
            isAssigned: false,
          }));
          setPieces(loadedPieces);
          
          // SVGコンテンツを直接設定
          const contents: { [pieceId: number]: string } = {};
          results.piece_svgs.forEach((svg: string, index: number) => {
            contents[index + 1] = svg;
          });
          setSvgContents(contents);
        }
      } catch (error) {
        console.error("Error loading pizza cutter results:", error);
      }
    }
  }, []);

  // 初期状態でピザらしい色を設定
  useEffect(() => {
    if (pieces.length > 0 && Object.keys(pieceColors).length === 0) {
      const initialColors: { [pieceId: number]: string } = {};
      pieces.forEach((piece) => {
        initialColors[piece.id] = "orange"; // ピザらしいオレンジ色
      });
      setPieceColors(initialColors);
    }
  }, [pieces, pieceColors]);

  // SVGから背景を削除して透過にし、色を適用
  const makeBackgroundTransparent = (svgContent: string): string => {
    return svgContent
      .replace(/<rect\s+fill="white"\s+[^>]*\/>/g, "") // 白い背景のrectを削除
      .replace(/<rect\s+[^>]*fill="white"[^>]*\/>/g, "") // fill="white"の順序違いにも対応
      .replace(
        /<svg([^>]*)>/g,
        '<svg$1 style="width: 100%; height: 100%; max-width: 100%; max-height: 100%;">'
      ); // SVGサイズ制御を追加
  };

  // 色名からHEX値を取得
  const getColorHex = (colorName: string): string => {
    return (
      COLOR_DEFINITIONS[colorName as keyof typeof COLOR_DEFINITIONS]?.hex ||
      "#d4a574"
    ); // ピザクラストっぽい茶色
  };

  // localStorage から参加者情報を取得
  useEffect(() => {
    const savedParticipants = localStorage.getItem("participants");
    if (savedParticipants) {
      try {
        const participants = JSON.parse(savedParticipants);
        if (Array.isArray(participants) && participants.length > 0) {
          const loadedUsers = participants
            .filter((p) => p && (p.id || p.name)) // 有効な参加者のみ
            .map(
              (
                p: { id?: number; name?: string; color?: string },
                index: number
              ) => ({
                id: p.id || index + 1,
                nickname: p.name || `参加者${p.id || index + 1}`,
                color: p.color || "#ef4444", // 色情報を保持（デフォルトは赤）
              })
            );

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

  // 平等なピース分配機能
  const startDistribution = () => {
    if (!users || users.length === 0) {
      console.error("ユーザーが設定されていません");
      return;
    }

    setIsSpinning(true);
    setIsColorAnimating(true);

    // シャッフルしたユーザー配列を作成
    const validUsers = users.filter((user) => user && user.id);
    const shuffledUsers = [...validUsers].sort(() => Math.random() - 0.5);

    // 各ピースにユーザーを公平に分配（ユーザーの色も一緒に設定）
    const newAssignments: { [pieceId: number]: User } = {};
    const finalColors: { [pieceId: number]: string } = {};

    pieces.forEach((piece, index) => {
      if (shuffledUsers[index % shuffledUsers.length]) {
        const assignedUser = shuffledUsers[index % shuffledUsers.length];
        newAssignments[piece.id] = assignedUser;
        // ユーザーの色からピースの色を決定（マッピングにない場合はランダム）
        finalColors[piece.id] =
          HEX_TO_COLOR_NAME[assignedUser.color] ||
          AVAILABLE_COLOR_NAMES[
            Math.floor(Math.random() * AVAILABLE_COLOR_NAMES.length)
          ];
      }
    });

    // カラーアニメーション（高速で色が変わる）
    let colorAnimationCount = 0;
    const maxColorAnimations = 20; // 2秒間で20回色変更

    const colorInterval = setInterval(() => {
      const tempColors: { [pieceId: number]: string } = {};
      pieces.forEach((piece) => {
        tempColors[piece.id] =
          AVAILABLE_COLOR_NAMES[
            Math.floor(Math.random() * AVAILABLE_COLOR_NAMES.length)
          ];
      });
      setPieceColors(tempColors);

      colorAnimationCount++;
      if (colorAnimationCount >= maxColorAnimations) {
        clearInterval(colorInterval);

        // 最終的な色を設定
        setPieceColors(finalColors);
        setIsColorAnimating(false);

        // 少し遅らせてユーザー分配結果を表示
        setTimeout(() => {
          setAssignments(newAssignments);
          setIsSpinning(false);
          setIsCompleted(true);

          // ピースを分配済みに更新
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

  // 分配リセット機能
  const resetAssignments = () => {
    setAssignments({});
    // 初期色をピザらしいオレンジに設定
    const initialColors: { [pieceId: number]: string } = {};
    pieces.forEach((piece) => {
      initialColors[piece.id] = "orange";
    });
    setPieceColors(initialColors);
    setIsCompleted(false);
    setCurrentStep(0);
    setIsSpinning(false);
    setIsColorAnimating(false);
    // piecesの状態をリセット
    setPieces((prev) =>
      prev.map((piece) => ({
        ...piece,
        isAssigned: false,
        assignedTo: undefined,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-slate-800 mb-2">
            ピザの分け方を決めよう
          </h2>
          <p className="text-slate-600 text-sm">
            誰がどの部分を食べるか決めましょう
          </p>
        </div>

        {/* ピザビジュアライゼーション */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 sm:mb-12">
          <div
            className={`transition-all duration-500 ${
              isColorAnimating ? "scale-105" : ""
            }`}
          >
            <PizzaPieces pieces={pieces} pieceColors={pieceColors} />
          </div>

          {/* カラーアニメーション中の表示 */}
          {isColorAnimating && (
            <div className="text-center mt-6 sm:mt-8">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
                <span className="text-slate-600 font-medium">
                  誰がどこを食べるか決めています...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* コントロールパネル */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          {!isCompleted && !isSpinning && (
            <div className="text-center p-8 sm:p-12">
              <button
                onClick={startDistribution}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 shadow-sm"
              >
                みんなで分け方を決める
              </button>
            </div>
          )}

          {isSpinning && (
            <div className="text-center p-8 sm:p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600"></div>
              </div>
              <p className="text-slate-600 font-medium">
                {isColorAnimating
                  ? "誰がどこを食べるか決めています..."
                  : "分け方を決めています..."}
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-light text-slate-800 mb-2">
                  分け方が決まりました！
                </h2>
                <p className="text-slate-600">
                  みんなの食べる部分が決まりました
                </p>
              </div>

              {/* ユーザー別結果表示 */}
              <div className="space-y-3 mb-8">
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
                        className="px-4 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          {assignedPiece && (
                            <div className="w-12 h-12 relative overflow-visible flex-shrink-0">
                              {svgContents[assignedPiece.id] ? (
                                <div
                                  className="w-full h-full border border-dashed border-gray-300"
                                  style={{
                                    color: pieceColors[assignedPiece.id]
                                      ? getColorHex(
                                          pieceColors[assignedPiece.id]
                                        )
                                      : "#d4a574",
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: makeBackgroundTransparent(
                                      svgContents[assignedPiece.id]
                                    ),
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                  ...
                                </div>
                              )}
                            </div>
                          )}
                          <div className="font-medium text-slate-800">
                            {user.nickname || "Unknown"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    ピザパーティーの様子を写真におさめましょう！
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/group-photo")}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  みんなで記念写真を撮る
                </button>

                <button
                  onClick={resetAssignments}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  もう一度決め直す
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PizzaRouletteUI;
