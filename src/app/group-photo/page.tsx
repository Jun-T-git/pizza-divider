"use client";

import { CameraCaptureSimple } from "@/components/CameraCaptureSimple";
import { ImageUpload } from "@/components/ImageUpload";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function GroupPhotoPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'camera' | 'upload' | 'select'>('select');
  const [isProcessing, setIsProcessing] = useState(false);

  const callEmotionAPI = async (imageFile: File) => {
    try {
      setIsProcessing(true);

      // スタブデータを生成
      const stubEmotionData = {
        detected: 3,
        results: [
          {
            face: "", // 実際のAPIでは Base64 顔画像（data URI形式）が入る
            dominant: "happy",
            scores: {
              happy: 0.85,
              neutral: 0.1,
              sad: 0.05,
            },
            pay: 0.45, // 45%の支払い比率
          },
          {
            face: "",
            dominant: "neutral",
            scores: {
              happy: 0.3,
              neutral: 0.6,
              sad: 0.1,
            },
            pay: 0.35, // 35%の支払い比率
          },
          {
            face: "",
            dominant: "happy",
            scores: {
              happy: 0.7,
              neutral: 0.25,
              sad: 0.05,
            },
            pay: 0.2, // 20%の支払い比率
          },
        ],
        file: "upload.jpg",
      };

      try {
        const apiUrl =
          process.env.NODE_ENV === "development"
            ? "http://localhost:9000/api/face/emotion"
            : "https://rocket2025-backend.onrender.com/api/face/emotion";

        // FormDataを使用してmultipart/form-dataリクエストを作成
        const formData = new FormData();
        formData.append('file', imageFile);
        
        // localStorageから実際の人数を取得
        const peopleCount = localStorage.getItem("peopleCount") || '2';
        formData.append('count', peopleCount);

        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const emotionData = await response.json();
        localStorage.setItem("emotionResults", JSON.stringify(emotionData));
        console.log("感情認識結果:", emotionData);
      } catch (apiError) {
        console.error("感情認識API呼び出しエラー:", apiError);
        // APIエラー時はスタブデータを使用
        localStorage.setItem("emotionResults", JSON.stringify(stubEmotionData));
        console.log("APIエラーのためスタブデータを使用");
      }
    } catch (error) {
      console.error("感情認識処理エラー:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = async (imageFile: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        localStorage.setItem("groupPhoto", imageData);
        localStorage.setItem(
          "groupPhotoFile",
          JSON.stringify({
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type,
            lastModified: imageFile.lastModified,
          })
        );

        // 感情認識API呼び出し
        await callEmotionAPI(imageFile);

        router.push("/bill-split");
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error("Error saving group photo:", error);
      alert(t('error.photo-save'));
    }
  };

  const handleError = (error: string) => {
    console.error("Camera error:", error);
    setMode('select');
  };

  if (mode === 'camera') {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-black bg-opacity-60 text-white p-4 rounded-lg text-center">
            <h1 className="text-lg font-semibold mb-2">{t('group-photo.title')}</h1>
            <p className="text-sm">
              {t('group-photo.instruction.1')}
              <br />
              {t('group-photo.instruction.2')}
            </p>
          </div>
        </div>

        <CameraCaptureSimple
          onCapture={handleCapture}
          onError={handleError}
          showGuide={true}
          guideType="group-photo"
        />

        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-3"></div>
              <p className="text-slate-600">{t('group-photo.processing')}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'upload') {
    return (
      <div className="relative">
        <ImageUpload
          onCapture={handleCapture}
          onError={handleError}
          title={t('group-photo.subtitle')}
          description={t('group-photo.description')}
        />

        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-3"></div>
              <p className="text-slate-600">{t('group-photo.processing')}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="max-w-lg mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-slate-800 mb-2">{t('group-photo.subtitle')}</h2>
          <p className="text-slate-600 text-sm">{t('group-photo.description')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-8">
              {/* カメラプレビューエリア */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-slate-50 mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3 opacity-60">📷</div>
                    <p className="text-slate-500">{t('group-photo.preparation')}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 text-center leading-relaxed">
                {t('group-photo.completed')}
                <br />
                {t('group-photo.take.photo')}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMode('camera')}
                className="w-full py-4 px-6 rounded-xl font-medium text-lg transition-all bg-slate-900 hover:bg-slate-800 hover:scale-105 text-white shadow-sm"
              >
                {t('button.camera')}
              </button>

              <button
                onClick={() => setMode('upload')}
                className="w-full py-3 px-6 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                {t('button.upload')}
              </button>

              <Link href="/bill-split">
                <button className="w-full py-2 px-6 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors">
                  {t('button.skip.next')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
