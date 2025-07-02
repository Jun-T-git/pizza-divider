'use client';

interface CircleGuideProps {
  containerWidth: number;
  containerHeight: number;
}

export const CircleGuide: React.FC<CircleGuideProps> = ({ 
  containerWidth, 
  containerHeight 
}) => {
  const circleSize = Math.min(containerWidth, containerHeight) * 0.7;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        width={containerWidth}
        height={containerHeight}
        className="absolute top-0 left-0"
      >
        <circle
          cx={centerX}
          cy={centerY}
          r={circleSize / 2}
          fill="none"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="3"
          className="drop-shadow-lg"
        />
      </svg>
      <div 
        className="absolute bg-black bg-opacity-40 text-white text-sm px-3 py-2 rounded-lg"
        style={{
          top: centerY - circleSize / 2 - 50,
          left: centerX - 100,
          width: 200,
          textAlign: 'center'
        }}
      >
        ピザをこの円に合わせてください
      </div>
    </div>
  );
};