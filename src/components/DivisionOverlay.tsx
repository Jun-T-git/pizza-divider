'use client';

import { DivisionOverlayProps } from '@/types';

export const DivisionOverlay: React.FC<DivisionOverlayProps> = ({
  imageUrl,
  divisionLines,
  salamiPositions,
  pieceValues = []
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <img
        src={imageUrl}
        alt="Pizza"
        className="w-full h-auto rounded-lg shadow-lg"
      />
      
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
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
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-lg"
          />
        ))}
        
        {salamiPositions.map((salami, index) => (
          <circle
            key={index}
            cx={salami.x}
            cy={salami.y}
            r="8"
            fill="#C5282F"
            stroke="#FFFFFF"
            strokeWidth="2"
            className="drop-shadow-md"
          />
        ))}
      </svg>

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