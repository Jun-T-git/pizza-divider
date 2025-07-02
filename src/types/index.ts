export interface Point {
  x: number;
  y: number;
}

export interface Line {
  start: Point;
  end: Point;
}

export interface SalamiDetection {
  position: Point;
  confidence: number;
}

export interface AppState {
  originalImage: File | null;
  salamiPositions: Point[];
  divisionLines: Line[];
  peopleCount: number;
  evaluationScore?: number;
}

export interface CameraProps {
  onCapture: (imageFile: File) => void;
  onError?: (error: string) => void;
}

export interface DivisionOverlayProps {
  imageUrl: string;
  divisionLines: Line[];
  salamiPositions: Point[];
  pieceValues?: number[];
}