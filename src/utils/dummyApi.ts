import { Point, Line } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const analyzePizza = async (_image: File): Promise<Point[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const salamiPositions: Point[] = [
    { x: 120, y: 150 },
    { x: 280, y: 100 },
    { x: 200, y: 220 },
    { x: 160, y: 90 },
    { x: 320, y: 180 },
    { x: 80, y: 200 },
    { x: 240, y: 160 },
    { x: 180, y: 280 }
  ];
  
  return salamiPositions;
};

export const calculateDivision = async (salamis: Point[], people: number): Promise<{ lines: Line[], values: number[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const centerX = 200;
  const centerY = 200;
  const radius = 180;
  
  const lines: Line[] = [];
  const angleStep = (2 * Math.PI) / people;
  
  for (let i = 0; i < people; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const endX = centerX + Math.cos(angle) * radius;
    const endY = centerY + Math.sin(angle) * radius;
    
    lines.push({
      start: { x: centerX, y: centerY },
      end: { x: endX, y: endY }
    });
  }
  
  const baseValue = Math.floor(100 / people);
  const remainder = 100 - (baseValue * people);
  
  const values: number[] = [];
  for (let i = 0; i < people; i++) {
    const variance = Math.floor(Math.random() * 10) - 5;
    let pieceValue = baseValue + variance;
    
    if (i < remainder) {
      pieceValue += 1;
    }
    
    values.push(Math.max(5, Math.min(pieceValue, 50)));
  }
  
  const total = values.reduce((sum, val) => sum + val, 0);
  const adjustedValues = values.map(val => Math.round((val / total) * 100));
  
  return { lines, values: adjustedValues };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const evaluateDivision = async (_beforeImage: File, _afterImage: File): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const score = Math.floor(Math.random() * 40) + 60;
  return score;
};