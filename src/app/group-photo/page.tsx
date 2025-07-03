'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CameraCaptureSimple } from '@/components/CameraCaptureSimple';

export default function GroupPhotoPage() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = (imageFile: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        localStorage.setItem('groupPhoto', imageData);
        localStorage.setItem('groupPhotoFile', JSON.stringify({
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
          lastModified: imageFile.lastModified
        }));
        router.push('/bill-split');
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Error saving group photo:', error);
      alert('写真の保存に失敗しました');
    }
  };

  const handleError = (error: string) => {
    console.error('Camera error:', error);
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
              みんなでピザを囲んだ<br />
              記念写真を撮りましょう！
            </p>
          </div>
        </div>
        
        <CameraCaptureSimple onCapture={handleCapture} onError={handleError} showGuide={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-purple-500 p-4">
            <h1 className="text-white text-xl font-bold text-center">集合写真</h1>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                📸 みんなで記念撮影！
              </h2>
              
              {/* カメラプレビューエリア */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-gray-100 mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📷</div>
                    <p className="text-gray-500">記念撮影の準備</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                ピザの分割が完了しました！<br />
                みんなで記念写真を撮りましょう
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all bg-purple-500 hover:bg-purple-600 active:scale-95 text-white shadow-lg"
              >
                📸 撮影する
              </button>

              <Link href="/bill-split">
                <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
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