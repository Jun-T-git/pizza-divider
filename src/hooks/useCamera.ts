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
      console.log('[useCamera] Setting stream to video');
      
      // 重要: iOS Safariでは必ずmuted=trueに設定する必要がある
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.setAttribute('autoplay', '');
      }
      
      videoRef.current.srcObject = streamRef.current;
      
      // ビデオ要素の状態に応じて再生を開始
      if (videoRef.current.readyState >= 1) {
        console.log('[useCamera] Video element ready, playing');
        videoRef.current.play()
          .then(() => {
            console.log('[useCamera] Video playback started successfully');
            setIsStreamActive(true);
          })
          .catch((err) => {
            console.error('[useCamera] Video play() failed:', err);
          });
      } else {
        console.log('[useCamera] Waiting for loadedmetadata event');
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) return;
          console.log('[useCamera] Metadata loaded, playing video');
          videoRef.current.play()
            .then(() => {
              console.log('[useCamera] Video playback started after metadata');
              setIsStreamActive(true);
            })
            .catch((err) => {
              console.error('[useCamera] Video play() failed after metadata:', err);
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
        console.log('[useCamera] Video ref changed, setting stream');
        setStreamToVideo();
      }
    };

    // 初回チェック
    checkAndSetStream();

    // 念のため少し後にも再チェック (iOS Safariでの信頼性向上)
    const timer = setTimeout(checkAndSetStream, 300);
    
    return () => clearTimeout(timer);
  }, [setStreamToVideo]);

  const startCamera = useCallback(async () => {
    console.log('[useCamera] Starting camera');
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

    // 順番に試す制約の配列
    const constraints = [
      // より基本的な設定 (フロントカメラから試む - 多くのモバイルではこれが望ましい)
      {
        video: {
          facingMode: "user", // フロントカメラから試む
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      // 次に背面カメラを試む
      {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      // より制約の少ない設定
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

    // 以前のストリームが存在すれば停止
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    // 各制約を順番に試す
    for (let i = 0; i < constraints.length; i++) {
      try {
        console.log(`[useCamera] Trying camera constraints option ${i+1}`, constraints[i]);
        const stream = await navigator.mediaDevices.getUserMedia(constraints[i]);
        streamRef.current = stream;
        console.log('[useCamera] Camera stream obtained successfully');

        if (videoRef.current) {
          console.log('[useCamera] Video element exists, configuring it');
          // iOS Safariでの再生を確実にするための設定
          videoRef.current.muted = true;
          videoRef.current.setAttribute('playsinline', '');
          videoRef.current.setAttribute('autoplay', '');
          
          videoRef.current.srcObject = stream;
          
          // Promise化してタイムアウトを設定
          const videoLoaded = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Video loading timeout'));
            }, 10000); // 10秒タイムアウト

            // ビデオ要素の現在の状態をチェック
            if (videoRef.current && videoRef.current.readyState >= 1) {
              // 既にメタデータがロードされている場合
              videoRef.current.play().then(() => {
                console.log('[useCamera] Video playback started immediately');
                setIsStreamActive(true);
                clearTimeout(timeout);
                resolve();
              }).catch((err) => {
                console.error('[useCamera] Video play() failed:', err);
                clearTimeout(timeout);
                reject(err);
              });
            } else if (videoRef.current) {
              // メタデータのロードを待つ
              console.log('[useCamera] Waiting for video metadata to load');
              videoRef.current.onloadedmetadata = () => {
                if (!videoRef.current) return;
                
                clearTimeout(timeout);
                console.log('[useCamera] Video metadata loaded, attempting to play');
                videoRef.current.play().then(() => {
                  console.log('[useCamera] Video playback started after metadata');
                  setIsStreamActive(true);
                  resolve();
                }).catch((err) => {
                  console.error('[useCamera] Video play() failed after metadata:', err);
                  reject(err);
                });
              };
            }

            if (videoRef.current) {
              videoRef.current.onerror = (e) => {
                console.error('[useCamera] Video error event:', e);
                clearTimeout(timeout);
                reject(new Error('Video loading error'));
              };
            }
          });

          try {
            await videoLoaded;
            break; // 成功したら終了
          } catch (err) {
            console.warn(`[useCamera] Failed to start video with constraints option ${i+1}:`, err);
            // 次の制約を試す前に現在のストリームを停止
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            // 最後の制約でなければ次を試す
            if (i < constraints.length - 1) continue;
            throw err;
          }
        } else {
          // video要素がない場合は、ストリームを保存しておき、後でsetStreamToVideoで設定
          console.log('[useCamera] No video element yet, storing stream for later');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn(`[useCamera] getUserMedia failed with constraints option ${i+1}:`, err);
        
        // 最後の試行でも失敗した場合
        if (i === constraints.length - 1) {
          let errorMessage = 'カメラにアクセスできませんでした';
          
          if (err instanceof Error) {
            console.error('[useCamera] Final camera access attempt failed:', err);

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
    console.log('[useCamera] Stopping camera');
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
    
    console.log('[useCamera] Video dimensions:', videoWidth, 'x', videoHeight);
    console.log('[useCamera] Display dimensions:', displayWidth, 'x', displayHeight);
    
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
          console.log('[useCamera] Permissions API not supported');
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