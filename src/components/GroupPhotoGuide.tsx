'use client';

import { PreciseCameraGuideManager } from '@/utils/preciseCameraGuide';
import { useLanguage } from '@/contexts/LanguageContext';

interface GroupPhotoGuideProps {
  containerWidth: number;
  containerHeight: number;
  guideRatio?: number;
}

export const GroupPhotoGuide: React.FC<GroupPhotoGuideProps> = ({ 
  containerWidth, 
  containerHeight,
  guideRatio = 0.7
}) => {
  const { t } = useLanguage();
  const preciseGuideManager = new PreciseCameraGuideManager(guideRatio);
  const displayGuide = preciseGuideManager.calculateDisplayGuide({ 
    width: containerWidth, 
    height: containerHeight 
  });
  
  const squareX = displayGuide.x;
  const squareY = displayGuide.y;
  const squareSize = displayGuide.width;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 枠外を暗くするマスク */}
      <svg
        width={containerWidth}
        height={containerHeight}
        className="absolute top-0 left-0"
      >
        <defs>
          <mask id="groupPhotoMask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={squareX}
              y={squareY}
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
          mask="url(#groupPhotoMask)"
        />
        
        {/* 正方形の枠（撮影範囲） */}
        <rect
          x={squareX}
          y={squareY}
          width={squareSize}
          height={squareSize}
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3"
          className="drop-shadow-lg"
        />
        
        {/* 中央のガイドライン */}
        <line
          x1={squareX + squareSize * 0.33}
          y1={squareY}
          x2={squareX + squareSize * 0.33}
          y2={squareY + squareSize}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
          strokeDasharray="5 5"
        />
        <line
          x1={squareX + squareSize * 0.67}
          y1={squareY}
          x2={squareX + squareSize * 0.67}
          y2={squareY + squareSize}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
          strokeDasharray="5 5"
        />
        
        {/* 人物アイコンの配置ガイド */}
        <g transform={`translate(${centerX}, ${centerY + squareSize * 0.1})`}>
          {/* 左の人物アイコン */}
          <g transform="translate(-60, 0)">
            <circle cx="0" cy="-20" r="15" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2"/>
            <path d="M -15 10 Q 0 -5 15 10 L 10 30 L -10 30 Z" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2"/>
          </g>
          
          {/* 中央の人物アイコン */}
          <g transform="translate(0, 0)">
            <circle cx="0" cy="-20" r="15" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2"/>
            <path d="M -15 10 Q 0 -5 15 10 L 10 30 L -10 30 Z" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2"/>
          </g>
          
          {/* 右の人物アイコン */}
          <g transform="translate(60, 0)">
            <circle cx="0" cy="-20" r="15" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2"/>
            <path d="M -15 10 Q 0 -5 15 10 L 10 30 L -10 30 Z" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2"/>
          </g>
        </g>
      </svg>
      
      {/* ガイドメッセージ */}
      <div 
        className="absolute bg-black bg-opacity-60 text-white text-sm px-4 py-2 rounded-lg"
        style={{
          top: squareY - 50,
          left: centerX - 140,
          width: 280,
          textAlign: 'center'
        }}
      >
        {t('group-photo.guide')}
      </div>
    </div>
  );
};