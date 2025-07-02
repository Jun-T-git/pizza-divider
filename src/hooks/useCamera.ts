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
  setVideoElement?: (element: HTMLVideoElement | null) => void;
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);

  // ストリームを取得後、video要素に設定する関数
  const setStreamToVideo = useCallback(() => {
    if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      
      // ビデオ要素の状態に応じて再生を開始
      if (videoRef.current.readyState >= 1) {
        videoRef.current.play().then(() => {
          setIsStreamActive(true);
        }).catch((err) => {
          console.error('Video play() failed:', err);
        });
      } else {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsStreamActive(true);
          }).catch((err) => {
            console.error('Video play() failed:', err);
          });
        };
      }
    }
  }, []);

  // video要素が変更されたときに、保存されたストリームを設定
  useEffect(() => {
    // ストリームが保存されていて、video要素がまだ設定されていない場合
    const checkAndSetStream = () => {
      if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        setStreamToVideo();
      }
    };

    // 初回チェック
    checkAndSetStream();

    // 念のため少し後にも再チェック
    const timer = setTimeout(checkAndSetStream, 200);
    
    return () => clearTimeout(timer);
  }, [setStreamToVideo]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // HTTPS接続チェック
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setError('カメラ機能はHTTPS接続が必要です。');
      setIsLoading(false);
      return;
    }

    // MediaDevices API対応チェック
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('このブラウザはカメラ機能に対応していません。');
      setIsLoading(false);
      return;
    }

    const constraints = [
      // 最初は理想的な設定を試す
      {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        }
      },
      // フォールバック: より基本的な設定
      {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      // 最終フォールバック: 最も基本的な設定
      {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      },
      // 最後の手段: 設定なし
      {
        video: true
      }
    ];

    // videoRef.currentがnullの場合の処理を削除
    // 元の実装では、ここでvideoRef.currentのチェックをしていた

    for (let i = 0; i < constraints.length; i++) {
      try {
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints[i]);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Promise化してタイムアウトを設定
          const videoLoaded = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Video loading timeout'));
            }, 10000); // 10秒タイムアウト

            
            // ビデオ要素の現在の状態をチェック
            if (videoRef.current!.readyState >= 1) {
              // 既にメタデータがロードされている場合
              videoRef.current!.play().then(() => {
                setIsStreamActive(true);
                clearTimeout(timeout);
                resolve();
              }).catch((err) => {
                console.error('Video play() failed:', err);
                clearTimeout(timeout);
                reject(err);
              });
            } else {
              // メタデータのロードを待つ
              videoRef.current!.onloadedmetadata = () => {
                clearTimeout(timeout);
                videoRef.current?.play().then(() => {
                  setIsStreamActive(true);
                  resolve();
                }).catch((err) => {
                  console.error('[useCamera] Video play() failed after metadata:', err);
                  reject(err);
                });
              };
            }

            videoRef.current!.onerror = (e) => {
              console.error('Video error event:', e);
              clearTimeout(timeout);
              reject(new Error('Video loading error'));
            };
          });

          await videoLoaded;
          break; // 成功したら終了
        } else {
          // video要素がない場合は、ストリームを保存しておき、後でsetStreamToVideoで設定
          setIsLoading(false);
          return;
        }
      } catch (err) {
        
        // 最後の試行でも失敗した場合
        if (i === constraints.length - 1) {
          let errorMessage = 'カメラにアクセスできませんでした';
          
          if (err instanceof Error) {

            if (err.name === 'NotAllowedError') {
              errorMessage = 'カメラへのアクセスが拒否されました。ブラウザの設定でカメラの使用を許可してください。';
            } else if (err.name === 'NotFoundError') {
              errorMessage = 'カメラが見つかりません。デバイスにカメラが接続されているか確認してください。';
            } else if (err.name === 'NotReadableError') {
              errorMessage = 'カメラが他のアプリケーションで使用されている可能性があります。';
            } else if (err.name === 'OverconstrainedError') {
              errorMessage = 'カメラの設定に問題があります。別のカメラを試してください。';
            } else if (err.name === 'NotSupportedError') {
              errorMessage = 'このデバイスのカメラはサポートされていません。';
            } else if (err.message === 'Video loading timeout') {
              errorMessage = 'カメラの起動がタイムアウトしました。ページを再読み込みして再試行してください。';
            }
          }
          
          setError(errorMessage);
        }
        
        // 現在のストリームがあれば停止
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }

    setIsLoading(false);
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
    // ページロード時にカメラ権限をチェック
    const checkCameraPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          
          if (result.state === 'denied') {
            setError('カメラへのアクセスが拒否されています。ブラウザの設定で許可してください。');
          }
        } catch {
          // Permission APIがサポートされていない場合は無視
        }
      }
    };

    checkCameraPermission();

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