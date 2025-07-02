'use client';

import { DivisionOverlayProps } from '@/types';

export const DivisionOverlay: React.FC<DivisionOverlayProps> = ({
  imageUrl,
  idealSvg,
  divisionLines = [],
  salamiPositions = [],
  pieceValues = []
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* 正方形のコンテナ */}
      <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg bg-gray-100">
        <img
          src={imageUrl}
          alt="Pizza"
          className="w-full h-full object-contain"
        />
        
        {/* SVGオーバーレイ - APIからのSVGを優先 */}
        {idealSvg ? (
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            dangerouslySetInnerHTML={{ __html: idealSvg }}
          />
        ) : (
          // フォールバック: 従来の線・点描画
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 800 800"
            preserveAspectRatio="xMidYMid meet"
          >
            {divisionLines.map((line, index) => (
              <line
                key={index}
                x1={line.start.x}
                y1={line.start.y}
                x2={line.end.x}
                y2={line.end.y}
                stroke="#FF6B35"
                strokeWidth="6"
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
            ))}
            
            {salamiPositions.map((salami, index) => (
              <circle
                key={index}
                cx={salami.x}
                cy={salami.y}
                r="16"
                fill="#C5282F"
                stroke="#FFFFFF"
                strokeWidth="4"
                className="drop-shadow-md"
              />
            ))}
          </svg>
        )}
      </div>

      {pieceValues.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">各ピースの価値</h3>
          <div className="grid grid-cols-2 gap-2">
            {pieceValues.map((value, index) => (
              <div
                key={index}
                className="bg-orange-100 border border-orange-300 rounded-lg p-3 text-center"
              >
                <div className="text-sm text-gray-600">ピース {index + 1}</div>
                <div className="text-lg font-bold text-orange-600">{value}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};