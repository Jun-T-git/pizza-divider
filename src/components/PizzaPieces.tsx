"use client";

import React, { useState, useEffect } from "react";
import { COLOR_DEFINITIONS } from '@/utils/colorDefinitions';

interface PizzaPiece {
  id: number;
  imageUrl: string;
}

interface PizzaPiecesProps {
  pieces: PizzaPiece[];
  pieceColors?: { [pieceId: number]: string };
  className?: string;
}

// 色名からHEX値を取得
const getColorHex = (colorName: string): string => {
  return COLOR_DEFINITIONS[colorName as keyof typeof COLOR_DEFINITIONS]?.hex || '#d4a574'; // ピザクラストっぽい茶色
};

// SVGから背景を削除して透過にし、サイズを制御
const makeBackgroundTransparent = (svgContent: string): string => {
  return svgContent
    .replace(/<rect\s+fill="white"\s+[^>]*\/>/g, '') // 白い背景のrectを削除
    .replace(/<rect\s+[^>]*fill="white"[^>]*\/>/g, '') // fill="white"の順序違いにも対応
    .replace(/<svg([^>]*)>/g, '<svg$1 style="width: 100%; height: 100%; max-width: 100%; max-height: 100%;">'); // SVGサイズ制御を追加
};

const PizzaPieces: React.FC<PizzaPiecesProps> = ({
  pieces,
  pieceColors = {},
  className = "",
}) => {
  const [svgContents, setSvgContents] = useState<{ [pieceId: number]: string }>({});

  useEffect(() => {
    const loadSvgContents = async () => {
      const contents: { [pieceId: number]: string } = {};
      
      for (const piece of pieces) {
        try {
          const response = await fetch(piece.imageUrl);
          const svgText = await response.text();
          contents[piece.id] = svgText;
        } catch (error) {
          console.error(`Failed to load SVG for piece ${piece.id}:`, error);
        }
      }
      
      setSvgContents(contents);
    };

    loadSvgContents();
  }, [pieces]);

  return (
    <div
      className={`relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] aspect-square mx-auto bg-transparent overflow-visible p-4 sm:p-6 md:p-8 ${className}`}
    >
      {/* 全ピースを重ね合わせて表示 */}
      {pieces.map((piece) => {
        const svgContent = svgContents[piece.id];
        const pieceColor = pieceColors[piece.id];
        
        if (!svgContent) {
          return (
            <div key={piece.id} className="absolute inset-4 sm:inset-6 md:inset-8 w-auto h-auto">
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                Loading...
              </div>
            </div>
          );
        }

        const colorHex = pieceColor ? getColorHex(pieceColor) : '#d4a574';
        
        // 背景を透過にしたSVGコンテンツ
        const transparentSvg = makeBackgroundTransparent(svgContent);

        return (
          <div 
            key={piece.id} 
            className="absolute inset-4 sm:inset-6 md:inset-8 w-auto h-auto transition-all duration-300 ease-in-out"
            style={{ 
              color: colorHex,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            dangerouslySetInnerHTML={{ __html: transparentSvg }}
          />
        );
      })}
    </div>
  );
};

export default PizzaPieces;
