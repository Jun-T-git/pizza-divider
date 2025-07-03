"use client";

import {
  AVAILABLE_COLORS_HEX,
  COLOR_DEFINITIONS,
} from "@/utils/colorDefinitions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";

interface PizzaCutterResponse {
  success: boolean;
  svg_before_explosion: string;
  svg_after_explosion: string;
  svg_animated: string;
  piece_svgs: string[];
  error_message: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [participants, setParticipants] = useState([
    { id: 1, name: "", color: AVAILABLE_COLORS_HEX[0], active: true },
    { id: 2, name: "", color: AVAILABLE_COLORS_HEX[1], active: true },
  ]);
  const [isCalculating, setIsCalculating] = useState(false);
  const maxParticipants = 20;

  useEffect(() => {
    const savedImage = localStorage.getItem("pizzaImage");
    if (!savedImage) {
      router.push("/camera");
      return;
    }
    setImageUrl(savedImage);

    // settingsページではオーバーレイは表示しない（resultページで表示）
  }, [router]);

  const handleNameChange = (id: number, name: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name, active: name.trim() !== "" } : p
      )
    );
  };

  const addParticipant = () => {
    if (participants.length >= maxParticipants) {
      alert(`最大${maxParticipants}人までです`);
      return;
    }

    const newId = Math.max(...participants.map((p) => p.id)) + 1;
    const usedColors = participants.map((p) => p.color);
    const availableColor =
      AVAILABLE_COLORS_HEX.find((color) => !usedColors.includes(color)) ||
      AVAILABLE_COLORS_HEX[participants.length % AVAILABLE_COLORS_HEX.length];

    setParticipants([
      ...participants,
      {
        id: newId,
        name: "",
        color: availableColor,
        active: false,
      },
    ]);
  };

  const removeParticipant = (id: number) => {
    if (participants.filter((p) => p.active).length <= 2) {
      alert("最低2人は必要です");
      return;
    }
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const getActiveParticipants = () => {
    return participants.filter((p) => p.active && p.name.trim() !== "");
  };

  const callPizzaCutterAPI = async (participantCount: number) => {
    try {
      const savedImageFile = localStorage.getItem("pizzaImageFile");
      if (!savedImageFile) {
        throw new Error("画像ファイル情報が見つかりません");
      }

      const imageFileInfo = JSON.parse(savedImageFile);
      const savedImage = localStorage.getItem("pizzaImage");
      if (!savedImage) {
        throw new Error("画像データが見つかりません");
      }

      // Base64データをBlobに変換
      const base64Data = savedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const imageFile = new File([byteArray], imageFileInfo.name, { type: imageFileInfo.type });

      // 開発環境かどうかをチェック
      if (process.env.NODE_ENV === "development") {
        // 開発環境では localhost:9000 のAPIを呼び出す
        try {
          const formData = new FormData();
          formData.append("file", imageFile);
          formData.append("n_pieces", participantCount.toString());

          const apiUrl = "http://localhost:9000/api/pizza-cutter/divide";
          const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const cutterData: PizzaCutterResponse = await response.json();
          localStorage.setItem("pizzaCutterResults", JSON.stringify(cutterData));
          console.log("ピザカッター結果:", cutterData);
          return cutterData;
        } catch (apiError) {
          console.error("開発API呼び出しエラー、スタブデータを使用:", apiError);
          // API呼び出し失敗時はスタブデータを使用
        }
      }

      if (process.env.NODE_ENV === "production") {
        // 本番環境では実際のAPIを呼び出す
        try {
          const formData = new FormData();
          formData.append("file", imageFile);
          formData.append("n_pieces", participantCount.toString());

          const apiUrl = "https://rocket2025-backend.onrender.com/api/pizza-cutter/divide";
          const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const cutterData: PizzaCutterResponse = await response.json();
          localStorage.setItem("pizzaCutterResults", JSON.stringify(cutterData));
          console.log("ピザカッター結果:", cutterData);
          return cutterData;
        } catch (apiError) {
          console.error("本番API呼び出しエラー、スタブデータを使用:", apiError);
        }
      }

      // スタブデータを使用（テスト用の簡単なオーバーレイ画像）
      const stubResponse: PizzaCutterResponse = {
        success: true,
        svg_before_explosion: "",
        svg_after_explosion: "",
        svg_animated: "",
        piece_svgs: [],
        overlay_image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // 透明な1x1ピクセル画像（テスト用）
        error_message: ""
      };

      localStorage.setItem("pizzaCutterResults", JSON.stringify(stubResponse));
      console.log("ピザカッター結果（スタブ）:", stubResponse);
      return stubResponse;
    } catch (error) {
      console.error("ピザカッターAPI呼び出しエラー:", error);
      throw error;
    }
  };

  const handleCalculateDivision = async () => {
    const activeParticipants = getActiveParticipants();

    if (activeParticipants.length < 2) {
      alert("最低2人の参加者が必要です");
      return;
    }

    setIsCalculating(true);

    try {
      localStorage.setItem("peopleCount", activeParticipants.length.toString());
      localStorage.setItem("participants", JSON.stringify(activeParticipants));

      // ピザカッターAPIを呼び出し
      await callPizzaCutterAPI(activeParticipants.length);

      router.push("/result");
    } catch (error) {
      console.error("Division calculation error:", error);
      alert("分割線の計算に失敗しました");
    } finally {
      setIsCalculating(false);
    }
  };

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600">画像を読み込み中...</p>
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
            分割設定
          </h2>
          <p className="text-slate-600 text-sm">
            参加者を設定してピザを分割しましょう
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-medium text-slate-800 mb-4">
                撮影したピザ
              </h2>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-slate-50">
                <img
                  src={imageUrl}
                  alt="撮影したピザ"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-medium text-slate-800">参加者</h2>
                  <p className="text-sm text-slate-600">
                    {getActiveParticipants().length}人 / 最大{maxParticipants}人
                  </p>
                </div>
                <button
                  onClick={addParticipant}
                  disabled={participants.length >= maxParticipants}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${
                      participants.length >= maxParticipants
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }
                  `}
                >
                  + 参加者を追加
                </button>
              </div>

              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-4 transition-all duration-200 ${
                      participant.active ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <div
                      className="w-10 h-10 text-white rounded-full flex items-center justify-center font-medium transition-all duration-300 shadow-sm"
                      style={{ backgroundColor: participant.color }}
                    >
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={participant.name}
                      onChange={(e) =>
                        handleNameChange(participant.id, e.target.value)
                      }
                      placeholder={`参加者${index + 1}のニックネーム`}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all duration-200 text-slate-900 placeholder-slate-400 bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: participant.color }}
                        />
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          {Object.entries(COLOR_DEFINITIONS).find(
                            ([, def]) => def.hex === participant.color
                          )?.[0] || "custom"}
                        </span>
                      </div>
                      {participants.length > 2 && (
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="p-1 rounded hover:bg-slate-100 transition-colors"
                          title="削除"
                        >
                          <svg
                            className="w-5 h-5 text-slate-400 hover:text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {participants.length < maxParticipants && (
                <button
                  onClick={addParticipant}
                  className="w-full mt-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-all duration-200"
                >
                  + 参加者を追加
                </button>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCalculateDivision}
                disabled={isCalculating || getActiveParticipants().length < 2}
                className={`
                  w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-200
                  ${
                    isCalculating || getActiveParticipants().length < 2
                      ? "bg-slate-300 cursor-not-allowed text-slate-500"
                      : "bg-slate-900 hover:bg-slate-800 text-white hover:scale-105"
                  }
                  shadow-sm min-h-[60px] flex items-center justify-center
                `}
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    計算中...
                  </>
                ) : getActiveParticipants().length < 2 ? (
                  "最低2人の参加者が必要です"
                ) : (
                  `${getActiveParticipants().length}人で分割する`
                )}
              </button>

              <Link href="/camera">
                <button className="w-full py-3 px-6 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  撮り直す
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
