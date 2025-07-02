'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  error: string | null;
  isStreamActive: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: (guideRatio?: number) => Promise<File | null>;
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreamActive(true);
        };
      }
    } catch (err) {
      let errorMessage = 'カメラにアクセスできませんでした';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'カメラが見つかりません。デバイスにカメラが接続されているか確認してください。';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'カメラが他のアプリケーションで使用されている可能性があります。';
        }
      }
      
      setError(errorMessage);
      console.error('Camera access error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreamActive(false);
  }, []);

  const captureImage = useCallback(async (guideRatio: number = 0.7): Promise<File | null> => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    // まず全体を一時的なキャンバスに描画して、表示されている内容を正確に取得
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    
    if (!tempContext) {
      return null;
    }

    // ビデオの表示サイズを取得
    const displayRect = video.getBoundingClientRect();
    const displayWidth = displayRect.width;
    const displayHeight = displayRect.height;
    
    // 一時キャンバスのサイズを表示サイズに設定
    tempCanvas.width = displayWidth;
    tempCanvas.height = displayHeight;
    
    // ビデオの実際の解像度
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // object-coverの挙動を再現
    const scale = Math.max(displayWidth / videoWidth, displayHeight / videoHeight);
    const scaledWidth = videoWidth * scale;
    const scaledHeight = videoHeight * scale;
    const offsetX = (displayWidth - scaledWidth) / 2;
    const offsetY = (displayHeight - scaledHeight) / 2;
    
    // 一時キャンバスに描画（左右反転を元に戻す）
    tempContext.save();
    tempContext.scale(-1, 1);
    tempContext.translate(-displayWidth, 0);
    tempContext.drawImage(
      video,
      offsetX, offsetY, scaledWidth, scaledHeight
    );
    tempContext.restore();
    
    // ガイド枠の位置とサイズを計算
    const guideSize = Math.min(displayWidth, displayHeight) * guideRatio;
    const guideX = (displayWidth - guideSize) / 2;
    const guideY = (displayHeight - guideSize) / 2;
    
    console.log('Capture info:', {
      displayWidth,
      displayHeight,
      guideSize,
      guideX,
      guideY,
      guideRatio
    });
    
    // 最終的な出力キャンバスにガイド枠内のみを描画
    const outputSize = 800;
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    context.drawImage(
      tempCanvas,
      guideX, guideY, guideSize, guideSize,  // ソース領域（ガイド枠内）
      0, 0, outputSize, outputSize            // 描画先領域
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `pizza-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(file);
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.9);
    });
  }, [isStreamActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isLoading,
    error,
    isStreamActive,
    startCamera,
    stopCamera,
    captureImage
  };
};