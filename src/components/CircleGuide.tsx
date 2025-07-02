'use client';

interface CircleGuideProps {
  containerWidth: number;
  containerHeight: number;
  guideRatio?: number;
}

export const CircleGuide: React.FC<CircleGuideProps> = ({ 
  containerWidth, 
  containerHeight,
  guideRatio = 0.7
}) => {
  // 正方形のサイズを計算
  const squareSize = Math.min(containerWidth, containerHeight) * guideRatio;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const circleRadius = squareSize / 2;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 枠外を暗くするマスク */}
      <svg
        width={containerWidth}
        height={containerHeight}
        className="absolute top-0 left-0"
      >
        <defs>
          <mask id="squareMask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={centerX - squareSize / 2}
              y={centerY - squareSize / 2}
              width={squareSize}
              height={squareSize}
              fill="black"
            />
          </mask>
        </defs>
        
        {/* 枠外を暗くする */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.4)"
          mask="url(#squareMask)"
        />
        
        {/* 正方形の枠（撮影範囲） */}
        <rect
          x={centerX - squareSize / 2}
          y={centerY - squareSize / 2}
          width={squareSize}
          height={squareSize}
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3"
          className="drop-shadow-lg"
        />
        
        {/* 円形のガイド（ピザ用） */}
        <circle
          cx={centerX}
          cy={centerY}
          r={circleRadius * 0.9}
          fill="none"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="2"
          strokeDasharray="10 5"
          className="drop-shadow-lg"
        />
      </svg>
      <div 
        className="absolute bg-black bg-opacity-60 text-white text-sm px-4 py-2 rounded-lg"
        style={{
          top: centerY - squareSize / 2 - 50,
          left: centerX - 120,
          width: 240,
          textAlign: 'center'
        }}
      >
        枠内にピザを収めてください
      </div>
    </div>
  );
};