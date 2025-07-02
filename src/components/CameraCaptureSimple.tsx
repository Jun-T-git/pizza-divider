"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import type { CameraProps } from "@/types";

export const CameraCaptureSimple: React.FC<CameraProps> = ({
  onCapture,
  onError,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!webcamRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        onError?.("撮影に失敗しました。");
        return;
      }

      const response = await fetch(screenshot);
      const blob = await response.blob();
      const file = new File([blob], `pizza-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      onCapture(file);
    } catch (error) {
      console.error("Capture error:", error);
      onError?.("撮影に失敗しました。");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      <div className="relative w-full h-full">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment",
            width: 1920,
            height: 1080,
          }}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          onUserMediaError={(error) => {
            console.error("Webcam error:", error);
            onError?.("カメラにアクセスできませんでした。");
          }}
        />
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