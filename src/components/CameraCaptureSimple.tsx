"use client";

import { CircleGuide } from "@/components/CircleGuide";
import { GroupPhotoGuide } from "@/components/GroupPhotoGuide";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CameraProps } from "@/types";
import { PreciseCameraGuideManager } from "@/utils/preciseCameraGuide";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export const CameraCaptureSimple: React.FC<CameraProps> = ({
  onCapture,
  onError,
  isSelfie = false,
  showGuide = true, // デフォルトはガイド表示
  guideType = 'pizza', // デフォルトはピザガイド
  overlayImage = null, // SVGオーバーレイ画像
}) => {
  const { t } = useLanguage();
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentFacingMode, setCurrentFacingMode] = useState<"user" | "environment">(
    isSelfie ? "user" : "environment"
  );
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);
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

  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoInputs);
        console.log('Available cameras:', videoInputs);
      } catch (error) {
        console.error('Error getting video devices:', error);
      }
    };

    getVideoDevices();
  }, []);

  const toggleCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex(device => device.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      setCurrentDeviceId(videoDevices[nextIndex].deviceId);
      console.log('Switching to camera:', videoDevices[nextIndex].label || videoDevices[nextIndex].deviceId);
    } else {
      // フォールバック: facingModeで切り替え
      setCurrentFacingMode(prev => prev === "user" ? "environment" : "user");
    }
  };

  const handleCapture = async () => {
    if (!webcamRef.current || isCapturing || dimensions.width === 0) return;

    setIsCapturing(true);
    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        onError?.(t('error.capture-failed'));
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
        onError?.(t('error.video-access'));
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
        onError?.(t('error.processing'));
        return;
      }

      const croppedFile = await preciseGuideManager.cropImagePrecise(
        screenshot,
        cropData
      );
      if (!croppedFile) {
        onError?.(t('error.processing'));
        return;
      }

      onCapture(croppedFile);
    } catch (error) {
      console.error("Capture error:", error);
      onError?.(t('error.capture-failed'));
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
            ...(currentDeviceId ? { deviceId: currentDeviceId } : { facingMode: currentFacingMode }),
            width: 1920,
            height: 1080,
          }}
          mirrored={currentFacingMode === "user"}
          className="w-full h-full object-cover"
          onUserMediaError={(error) => {
            console.error("Webcam error:", error);
            onError?.(t('error.camera'));
          }}
        />

        {dimensions.width > 0 && showGuide && !overlayImage && guideType === 'pizza' && (
          <CircleGuide
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
            guideRatio={0.7}
          />
        )}

        {dimensions.width > 0 && showGuide && !overlayImage && guideType === 'group-photo' && (
          <GroupPhotoGuide
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

        {/* カメラ切り替えボタン */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleCamera}
            disabled={isCapturing}
            className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all disabled:opacity-50"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="rotate-y-180"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
              <path d="m9 7 3 3 3-3" />
            </svg>
          </button>
        </div>
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
          {isCapturing ? t('ui.processing') : t('button.take.photo')}
        </p>
      </div>
    </div>
  );
};
