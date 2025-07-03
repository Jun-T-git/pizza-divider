"use client";

import React from "react";

interface PizzaPiece {
  id: number;
  imageUrl: string;
}

interface PizzaPiecesProps {
  pieces: PizzaPiece[];
  pieceColors?: { [pieceId: number]: string };
  className?: string;
}

// 色名からCSS filterを生成
const getColorFilter = (colorName: string): string => {
  const filterMap: { [key: string]: string } = {
    red: 'hue-rotate(0deg) saturate(1.5)',
    orange: 'hue-rotate(30deg) saturate(1.5)',
    yellow: 'hue-rotate(60deg) saturate(1.5)',
    green: 'hue-rotate(120deg) saturate(1.5)',
    cyan: 'hue-rotate(180deg) saturate(1.5)',
    blue: 'hue-rotate(240deg) saturate(1.5)',
    purple: 'hue-rotate(270deg) saturate(1.5)',
    pink: 'hue-rotate(320deg) saturate(1.5)',
  };
  return filterMap[colorName] || 'none';
};

const PizzaPieces: React.FC<PizzaPiecesProps> = ({
  pieces,
  pieceColors = {},
  className = "",
}) => {
  return (
    <div
      className={`relative w-full max-w-[500px] aspect-square mx-auto bg-transparent overflow-hidden ${className}`}
    >
      {/* 全ピースを重ね合わせて表示 */}
      {pieces.map((piece) => (
        <div key={piece.id} className="absolute inset-0 w-full h-full">
          <img
            src={piece.imageUrl}
            alt={`Pizza piece ${piece.id}`}
            className="w-full h-full object-contain"
            style={{
              filter: pieceColors[piece.id] ? getColorFilter(pieceColors[piece.id]) : 'none',
              transition: 'filter 0.3s ease-in-out'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PizzaPieces;
