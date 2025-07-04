"use client";

import { CameraCaptureSimple } from "@/components/CameraCaptureSimple";
import { ImageUpload } from "@/components/ImageUpload";
import { Header } from "@/components/Header";
import { PizzaCutterResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EvaluatePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'camera' | 'upload' | 'select'>('select');
  const [, setSvgAfterExplosion] = useState<string | null>(
    null
  );

  useEffect(() => {
    // pizzaCutterResultsからsvg_after_explosionを取得
    const pizzaCutterResults = localStorage.getItem("pizzaCutterResults");
    if (pizzaCutterResults) {
      try {
        const results: PizzaCutterResponse = JSON.parse(pizzaCutterResults);
        if (results.success && results.svg_after_explosion) {
          console.log("ピザカッター結果:", results.svg_after_explosion);
          setSvgAfterExplosion(results.svg_after_explosion);
        }
      } catch (error) {
        console.error("ピザカッター結果の解析エラー:", error);
      }
    }
  }, []);

  const handleCapture = async (imageFile: File) => {
    try {
      // 画像データを保存
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        localStorage.setItem("afterPizzaImage", imageData);
        localStorage.setItem(
          "afterPizzaImageFile",
          JSON.stringify({
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type,
            lastModified: imageFile.lastModified,
          })
        );

        // APIを呼び出してスコアを計算
        try {
          const formData = new FormData();
          formData.append("file", imageFile);

          const apiUrl =
            process.env.NODE_ENV === "production"
              ? "https://rocket2025-backend.onrender.com/api/pizza-cutter/score"
              : "http://localhost:9000/api/pizza-cutter/score";

          const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const scoreData = await response.json();
          console.log("公平性スコア:", scoreData);

          if (scoreData.success) {
            localStorage.setItem(
              "fairnessScore",
              scoreData.fairness_score.toString()
            );
          }
        } catch (apiError) {
          console.error("スコア計算APIエラー:", apiError);
          // エラーが発生してもスコアページには進む
        }

        router.push("/score");
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error("Error saving after image:", error);
      alert(t('error.image-save'));
    }
  };

  const handleError = (error: string) => {
    console.error("Camera error:", error);
  };

  if (mode === 'camera') {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-black bg-opacity-60 text-white p-4 rounded-lg text-center">
            <h1 className="text-lg font-semibold mb-2">{t('evaluate.title')}</h1>
            <p className="text-sm">
              {t('evaluate.instruction.1')}
              <br />
              {t('evaluate.instruction.2')}
            </p>
          </div>
        </div>

        <CameraCaptureSimple
          onCapture={handleCapture}
          onError={handleError}
          showGuide={true}
        />
      </div>
    );
  }

  if (mode === 'upload') {
    return (
      <ImageUpload
        onCapture={handleCapture}
        onError={handleError}
        title={t('evaluate.title')}
        description={t('evaluate.description')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="max-w-lg mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-slate-800 mb-2">{t('evaluate.title')}</h2>
          <p className="text-slate-600 text-sm">{t('evaluate.description')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-8">
              {/* プレビューエリア */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-slate-50 mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3 opacity-60">🍕</div>
                    <p className="text-slate-500">{t('evaluate.preparation')}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 text-center leading-relaxed">
                {t('evaluate.select.method')}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMode('camera')}
                className="w-full py-4 px-6 rounded-xl font-medium text-lg transition-all bg-slate-900 hover:bg-slate-800 hover:scale-105 text-white shadow-sm"
              >
                📷 {t('button.camera')}
              </button>

              <button
                onClick={() => setMode('upload')}
                className="w-full py-3 px-6 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                📁 {t('button.upload')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
