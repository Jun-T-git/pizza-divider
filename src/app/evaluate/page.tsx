"use client";

import { CameraCaptureSimple } from "@/components/CameraCaptureSimple";
import { PizzaCutterResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EvaluatePage() {
  const router = useRouter();
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
      alert("画像の保存に失敗しました");
    }
  };

  const handleError = (error: string) => {
    console.error("Camera error:", error);
  };

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-black bg-opacity-60 text-white p-4 rounded-lg text-center">
          <h1 className="text-lg font-semibold mb-2">分割後の評価</h1>
          <p className="text-sm">
            実際に切り分けたピザを撮影して
            <br />
            分割の精度を評価します
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
