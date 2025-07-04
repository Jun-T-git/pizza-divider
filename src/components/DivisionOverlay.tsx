'use client';

import { DivisionOverlayProps } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export const DivisionOverlay: React.FC<DivisionOverlayProps> = ({
  imageUrl,
  overlayImage,
  pieceValues = []
}) => {
  const { t } = useLanguage();
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* 正方形のコンテナ */}
      <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg bg-gray-100">
        {/* 背景の撮影画像 */}
        <img
          src={imageUrl}
          alt="Pizza"
          className="w-full h-full object-cover"
        />
        
        {/* PNGオーバーレイ画像 */}
        {overlayImage && (
          <img
            src={overlayImage.startsWith('data:') ? overlayImage : `data:image/png;base64,${overlayImage}`}
            alt="Pizza Division Overlay"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              mixBlendMode: 'normal'
            }}
          />
        )}
      </div>

      {pieceValues.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">{t('ui.piece-value')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {pieceValues.map((value, index) => (
              <div
                key={index}
                className="bg-orange-100 border border-orange-300 rounded-lg p-3 text-center"
              >
                <div className="text-sm text-gray-600">{t('ui.piece')} {index + 1}</div>
                <div className="text-lg font-bold text-orange-600">{value}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};