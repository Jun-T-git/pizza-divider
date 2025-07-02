'use client';

import { useRouter } from 'next/navigation';
import { CameraCaptureSimple } from '@/components/CameraCaptureSimple';

export default function CameraPage() {
  const router = useRouter();

  const handleCapture = (imageFile: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        localStorage.setItem('pizzaImage', imageData);
        localStorage.setItem('pizzaImageFile', JSON.stringify({
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
          lastModified: imageFile.lastModified
        }));
        router.push('/settings');
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('画像の保存に失敗しました');
    }
  };

  const handleError = (error: string) => {
    console.error('Camera error:', error);
  };

  return (
    <div>
      <CameraCaptureSimple onCapture={handleCapture} onError={handleError} />
    </div>
  );
}