'use client';

import { useRouter } from 'next/navigation';
import { CameraCapture } from '@/components/CameraCapture';

export default function EvaluatePage() {
  const router = useRouter();

  const handleCapture = (imageFile: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        localStorage.setItem('afterPizzaImage', imageData);
        localStorage.setItem('afterPizzaImageFile', JSON.stringify({
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
          lastModified: imageFile.lastModified
        }));
        router.push('/score');
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Error saving after image:', error);
      alert('画像の保存に失敗しました');
    }
  };

  const handleError = (error: string) => {
    console.error('Camera error:', error);
  };

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-black bg-opacity-60 text-white p-4 rounded-lg text-center">
          <h1 className="text-lg font-semibold mb-2">分割後の評価</h1>
          <p className="text-sm">
            実際に切り分けたピザを撮影して<br />
            分割の精度を評価します
          </p>
        </div>
      </div>
      
      <CameraCapture onCapture={handleCapture} onError={handleError} />
    </div>
  );
}