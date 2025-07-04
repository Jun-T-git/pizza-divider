"use client";

import { DivisionOverlay } from "@/components/DivisionOverlay";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { PizzaCutterResponse } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
            setError(t("error.parse_results"));
          }
        } else {
          console.warn("ピザカッター結果が見つかりません");
          // スタブ環境では警告のみでエラーにしない
        }
      } catch (err) {
        console.error("Error loading result:", err);
        setError(t("error.load_results"));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-medium text-slate-800 mb-2">
              {t("loading.calculating")}
            </h2>
            <p className="text-slate-600">{t("loading.analyzing")}</p>
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
              {t("error.title")}
            </h2>
            <p className="text-slate-600 mb-6">
              {error || t("error.no_image_data")}
            </p>
            <Link href="/">
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-sm">
                {t("button.start_over")}
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
          <h2 className="text-xl font-medium text-slate-800 mb-2">{t("result.title")}</h2>
          <p className="text-slate-600 text-sm">{t("result.description", { count: peopleCount })}</p>
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
                🍕 {t("result.points")}
              </h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• {t("result.cut.along")}</li>
                <li>• {t("result.equal.size")}</li>
                <li>• {t("result.center.align")}</li>
              </ul>
            </div>

            <div className="">
              <Link href="/evaluate">
                <button className="w-full py-4 px-6 my-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all hover:scale-105 shadow-sm">
                  {t("result.next.step")}
                </button>
              </Link>

              <Link href="/">
                <button className="w-full py-3 px-6 my-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition-colors">
                  {t("button.complete")}
                </button>
              </Link>

              <Link href="/settings">
                <button className="w-full py-3 px-6 my-1.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  {t("button.change_settings")}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
