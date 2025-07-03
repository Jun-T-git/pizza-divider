"use client";

import { DivisionOverlay } from "@/components/DivisionOverlay";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PizzaCutterResponse {
  success: boolean;
  svg_before_explosion: string;
  svg_after_explosion: string;
  svg_animated: string;
  piece_svgs: string[];
  overlay_image: string;
  error_message: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedImage = localStorage.getItem("pizzaImage");
        const savedPeopleCount = localStorage.getItem("peopleCount");
        const pizzaCutterResults = localStorage.getItem("pizzaCutterResults");

        if (!savedImage || !savedPeopleCount) {
          router.push("/");
          return;
        }

        setImageUrl(savedImage);
        const people = parseInt(savedPeopleCount);
        setPeopleCount(people);

        // ピザカッター結果からオーバーレイ画像を取得
        if (pizzaCutterResults) {
          try {
            const results: PizzaCutterResponse = JSON.parse(pizzaCutterResults);
            if (results.success) {
              if (results.overlay_image) {
                setOverlayImage(results.overlay_image);
              }
              // 結果をlocalStorageに保存（評価で使用）
              if (results.svg_before_explosion) {
                localStorage.setItem("idealSvg", results.svg_before_explosion);
              }
            }
          } catch (parseError) {
            console.error("ピザカッター結果の解析エラー:", parseError);
            setError("分割結果の解析に失敗しました");
          }
        } else {
          console.warn("ピザカッター結果が見つかりません");
          // スタブ環境では警告のみでエラーにしない
        }
      } catch (err) {
        console.error("Error loading result:", err);
        setError("分割結果の読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-medium text-slate-800 mb-2">
              分割線を計算中...
            </h2>
            <p className="text-slate-600">サラミの位置を解析しています</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center pt-32 p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-medium text-slate-800 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-slate-600 mb-6">
              {error || "画像データが見つかりません"}
            </p>
            <Link href="/">
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-sm">
                最初から始める
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
          <h2 className="text-xl font-medium text-slate-800 mb-2">分割結果</h2>
          <p className="text-slate-600 text-sm">{peopleCount}人で分割</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <DivisionOverlay
                imageUrl={imageUrl}
                overlayImage={overlayImage || undefined}
              />
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                🍕 分割のポイント
              </h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• {peopleCount}人で均等に分割されています</li>
                <li>• 赤い線に沿って切り分けてください</li>
                <li>• 中心から外側に向かって切り分けるとやりやすいです</li>
              </ul>
            </div>

            <div className="">
              <Link href="/evaluate">
                <button className="w-full py-4 px-6 my-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all hover:scale-105 shadow-sm">
                  分割後の評価をする
                </button>
              </Link>

              <Link href="/">
                <button className="w-full py-3 px-6 my-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition-colors">
                  完了
                </button>
              </Link>

              <Link href="/settings">
                <button className="w-full py-3 px-6 my-1.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  設定を変更
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
