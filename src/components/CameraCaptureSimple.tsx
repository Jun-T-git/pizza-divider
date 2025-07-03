"use client";

import { CircleGuide } from "@/components/CircleGuide";
import type { CameraProps } from "@/types";
import { PreciseCameraGuideManager } from "@/utils/preciseCameraGuide";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export const CameraCaptureSimple: React.FC<CameraProps> = ({
  onCapture,
  onError,
  isSelfie = false,
  showGuide = true, // デフォルトはガイド表示
  overlayImage = null, // SVGオーバーレイ画像
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const preciseGuideManager = new PreciseCameraGuideManager();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 200, // ボタンエリア分を除く
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCapture = async () => {
    if (!webcamRef.current || isCapturing || dimensions.width === 0) return;

    setIsCapturing(true);
    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        onError?.("撮影に失敗しました。");
        return;
      }

      // ガイドが無効な場合は画像をそのまま使用
      if (!showGuide) {
        // Base64からFileオブジェクトを作成
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        return;
      }

      // ガイドが有効な場合は精密なトリミング処理
      // ビデオ要素から自然なサイズを取得
      const videoElement = webcamRef.current.video;
      if (!videoElement) {
        onError?.("ビデオ要素にアクセスできませんでした。");
        return;
      }

      const naturalVideoSize = {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      };

      // スクリーンショット画像のサイズを取得
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = screenshot;
      });

      const screenshotSize = {
        width: img.width,
        height: img.height,
      };

      // 精密な座標変換を実行
      const cropData = preciseGuideManager.calculatePreciseCrop(
        dimensions,
        naturalVideoSize,
        screenshotSize
      );

      console.log("PreciseCameraGuide calculation:", {
        viewport: dimensions,
        naturalVideo: naturalVideoSize,
        screenshot: screenshotSize,
        cropData,
      });

      if (!cropData.isValid) {
        onError?.("トリミング領域が無効です。");
        return;
      }

      const croppedFile = await preciseGuideManager.cropImagePrecise(
        screenshot,
        cropData
      );
      if (!croppedFile) {
        onError?.("画像の処理に失敗しました。");
        return;
      }

      onCapture(croppedFile);
    } catch (error) {
      console.error("Capture error:", error);
      onError?.("撮影に失敗しました。");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      <div className="relative w-full" style={{ height: dimensions.height }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment",
            width: 1920,
            height: 1080,
          }}
          mirrored={!isSelfie}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          onUserMediaError={(error) => {
            console.error("Webcam error:", error);
            onError?.("カメラにアクセスできませんでした。");
          }}
        />

        {dimensions.width > 0 && showGuide && !overlayImage && (
          <CircleGuide
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
            guideRatio={0.7}
          />
        )}

        {dimensions.width > 0 && overlayImage && showGuide && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <img
              src={`data:image/svg+xml;base64,${btoa(overlayImage)}`}
              alt="Pizza Division Guide"
              className="object-contain"
              style={{
                width: Math.min(dimensions.width, dimensions.height) * 0.7,
                height: Math.min(dimensions.width, dimensions.height) * 0.7,
              }}
            />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
        <div className="flex justify-center">
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className={`
              w-20 h-20 rounded-full border-4 border-white
              ${
                isCapturing
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 active:scale-95"
              }
              transition-all duration-200 flex items-center justify-center
            `}
          >
            {isCapturing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-full" />
            )}
          </button>
        </div>
        <p className="text-white text-center mt-4 text-sm">
          {isCapturing ? "撮影中..." : "タップして撮影"}
        </p>
      </div>
    </div>
  );
};
