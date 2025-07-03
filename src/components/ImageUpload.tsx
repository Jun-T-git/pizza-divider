'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  onCapture: (imageFile: File) => void;
  onError?: (error: string) => void;
  title: string;
  description: string;
  acceptedFormats?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onCapture,
  onError,
  title,
  description,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // ファイルタイプチェック
    if (!acceptedFormats.includes(file.type)) {
      onError?.(`対応していないファイル形式です。${acceptedFormats.map(f => f.split('/')[1]).join(', ')}形式のファイルを選択してください。`);
      return false;
    }

    // ファイルサイズチェック (10MB制限)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      onError?.('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsProcessing(true);
    try {
      // ファイルを画像として読み込んで検証
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // 最小解像度チェック
          if (img.width < 200 || img.height < 200) {
            reject(new Error('画像の解像度が低すぎます。200x200ピクセル以上の画像を選択してください。'));
            return;
          }

          // 正方形にリサイズ (800x800)
          const size = 800;
          canvas.width = size;
          canvas.height = size;
          
          // アスペクト比を維持して中央クロップ
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          
          ctx?.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve();
                onCapture(processedFile);
              } else {
                reject(new Error('画像の処理に失敗しました。'));
              }
            },
            'image/jpeg',
            0.9
          );
        };
        
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Image processing error:', error);
      onError?.(error instanceof Error ? error.message : '画像の処理に失敗しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <div className="max-w-lg mx-auto p-6 h-full flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
          <p className="text-slate-600">{description}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            {/* ドラッグ&ドロップエリア */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragging 
                  ? 'border-slate-400 bg-slate-50' 
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }
                ${isProcessing ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <div className="space-y-4">
                <div className="text-6xl">📷</div>
                <div>
                  <p className="text-lg font-medium text-slate-800 mb-2">
                    画像をアップロード
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    ファイルを選択するかドラッグ&ドロップしてください
                  </p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>対応形式: JPEG, PNG, WebP</p>
                    <p>最大サイズ: 10MB</p>
                    <p>推奨解像度: 200x200ピクセル以上</p>
                  </div>
                </div>
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-3"></div>
                    <p className="text-slate-600">画像を処理中...</p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="mt-6 space-y-3">
              <button
                onClick={openFileDialog}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl font-medium text-lg transition-all bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm"
              >
                {isProcessing ? '処理中...' : 'ファイルを選択'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};