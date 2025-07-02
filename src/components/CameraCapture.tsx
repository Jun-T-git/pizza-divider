"use client";

import { useCamera } from "@/hooks/useCamera";
import { CameraProps } from "@/types";
import { useEffect, useState } from "react";
import { CircleGuide } from "./CircleGuide";

export const CameraCapture: React.FC<CameraProps> = ({
  onCapture,
  onError,
}) => {
  const {
    videoRef,
    canvasRef,
    isLoading,
    error,
    isStreamActive,
    startCamera,
    stopCamera,
    captureImage,
  } = useCamera();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 200,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCapture = async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    try {
      // ガイド枠の比率（0.7）を渡して、枠内のみをキャプチャ
      const imageFile = await captureImage(0.7);
      if (imageFile) {
        onCapture(imageFile);
      }
    } catch (err) {
      console.error("Capture error:", err);
      if (onError) {
        onError("撮影に失敗しました");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">カメラを起動中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 p-6">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">📷</div>
          <h2 className="text-white text-xl font-bold mb-4">カメラエラー</h2>
          <p className="text-white mb-6 leading-relaxed">{error}</p>

          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              再試行
            </button>

            <div className="text-left bg-gray-800 p-4 rounded-lg text-sm">
              <h3 className="text-orange-400 font-semibold mb-2">
                トラブルシューティング:
              </h3>
              <ul className="text-gray-300 space-y-1 text-xs">
                <li>• ブラウザでカメラの使用を許可してください</li>
                <li>• HTTPS接続を確認してください</li>
                <li>• 他のアプリがカメラを使用していないか確認</li>
                <li>• ページを再読み込みして再試行</li>
                <li>• デバイスにカメラが接続されているか確認</li>
              </ul>
            </div>

            <div className="text-xs text-gray-400">
              URL: {window.location.href}
              <br />
              HTTPS: {window.location.protocol === "https:" ? "✅" : "❌"}
              <br />
              UserAgent: {navigator.userAgent.slice(0, 50)}...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      <div className="relative w-full" style={{ height: dimensions.height }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {isStreamActive && dimensions.width > 0 && (
          <CircleGuide
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
        <div className="flex justify-center">
          <button
            onClick={handleCapture}
            disabled={!isStreamActive || isCapturing}
            className={`
              w-20 h-20 rounded-full border-4 border-white
              ${
                isStreamActive && !isCapturing
                  ? "bg-orange-500 hover:bg-orange-600 active:scale-95"
                  : "bg-gray-500 cursor-not-allowed"
              }
              transition-all duration-200 flex items-center justify-center
            `}
          >
            {isCapturing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : (
              <div className="w-16 h-16 bg-white rounded-full"></div>
            )}
          </button>
        </div>

        <p className="text-white text-center mt-4 text-sm">
          {isCapturing ? "撮影中..." : "タップして撮影"}
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
