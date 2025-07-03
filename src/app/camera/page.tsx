"use client";

import { CameraCaptureSimple } from "@/components/CameraCaptureSimple";
import { ImageUpload } from "@/components/ImageUpload";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CameraPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'camera' | 'upload' | 'select'>('select');


  const handleCapture = (imageFile: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        localStorage.setItem("pizzaImage", imageData);
        localStorage.setItem(
          "pizzaImageFile",
          JSON.stringify({
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type,
            lastModified: imageFile.lastModified,
          })
        );

        router.push("/settings");
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error("Error saving image:", error);
      alert("画像の保存に失敗しました");
    }
  };

  const handleError = (error: string) => {
    console.error("Camera error:", error);
  };

  if (mode === 'camera') {
    return (
      <div>
        <CameraCaptureSimple onCapture={handleCapture} onError={handleError} />
      </div>
    );
  }

  if (mode === 'upload') {
    return (
      <ImageUpload
        onCapture={handleCapture}
        onError={handleError}
        title="ピザ撮影"
        description="切る前のピザの写真をアップロードしてください"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="max-w-lg mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-slate-800 mb-2">ピザ撮影</h2>
          <p className="text-slate-600 text-sm">切る前のピザの写真を撮影してください</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-8">
              {/* プレビューエリア */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-slate-50 mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3 opacity-60">🍕</div>
                    <p className="text-slate-500">ピザの撮影準備</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 text-center leading-relaxed">
                切る前のピザの写真を撮影します
                <br />
                撮影方法を選択してください
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMode('camera')}
                className="w-full py-4 px-6 rounded-xl font-medium text-lg transition-all bg-slate-900 hover:bg-slate-800 hover:scale-105 text-white shadow-sm"
              >
                📷 カメラで撮影
              </button>

              <button
                onClick={() => setMode('upload')}
                className="w-full py-3 px-6 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                📁 ファイルをアップロード
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
