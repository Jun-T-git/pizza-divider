"use client";

import { CameraCaptureSimple } from "@/components/CameraCaptureSimple";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GroupPhotoPage() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const callEmotionAPI = async (imageFile: File) => {
    try {
      setIsProcessing(true);
      
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('count', '4'); // 最大4人を想定
      
      const response = await fetch('https://rocket2025-backend.onrender.com/api/face/emotion', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const emotionData = await response.json();
      
      // 感情認識結果をローカルストレージに保存
      localStorage.setItem('emotionResults', JSON.stringify(emotionData));
      
      console.log('感情認識結果:', emotionData);
      
    } catch (error) {
      console.error('感情認識API呼び出しエラー:', error);
      // エラーが発生しても処理を続行
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
      alert("写真の保存に失敗しました");
    }
  };

  const handleError = (error: string) => {
    console.error("Camera error:", error);
    setShowCamera(false);
  };

  const startCamera = () => {
    setShowCamera(true);
  };

  if (showCamera) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-black bg-opacity-60 text-white p-4 rounded-lg text-center">
            <h1 className="text-lg font-semibold mb-2">集合写真撮影</h1>
            <p className="text-sm">
              みんなでピザを囲んだ
              <br />
              記念写真を撮りましょう！
            </p>
          </div>
        </div>

        <CameraCaptureSimple
          onCapture={handleCapture}
          onError={handleError}
          isSelfie={true}
          showGuide={false}
        />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-3"></div>
              <p className="text-slate-600">感情を分析中...</p>
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
          <h2 className="text-xl font-medium text-slate-800 mb-2">
            集合写真
          </h2>
          <p className="text-slate-600 text-sm">
            みんなで記念撮影をしましょう
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-8">
              {/* カメラプレビューエリア */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-slate-50 mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3 opacity-60">📷</div>
                    <p className="text-slate-500">記念撮影の準備</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 text-center leading-relaxed">
                ピザの分割が完了しました<br />
                みんなで記念写真を撮りましょう
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full py-4 px-6 rounded-xl font-medium text-lg transition-all bg-slate-900 hover:bg-slate-800 hover:scale-105 text-white shadow-sm"
              >
                撮影する
              </button>

              <Link href="/bill-split">
                <button className="w-full py-3 px-6 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  スキップして次へ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
