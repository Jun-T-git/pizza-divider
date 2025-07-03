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
  idealSvg?: string;
  accountName?: string;
  uuid?: string;
}

export interface CameraProps {
  onCapture: (imageFile: File) => void;
  onError?: (error: string) => void;
  isSelfie?: boolean; // カメラの向きを指定するオプション
  showGuide?: boolean; // ガイドの表示制御
  guideType?: 'pizza' | 'group-photo'; // ガイドの種類
  overlayImage?: string | null; // SVGオーバーレイ画像
}

export interface DivisionOverlayProps {
  imageUrl: string;
  overlayImage?: string;
  pieceValues?: number[];
}

// API Request/Response Types
export interface CalculateIdealCutRequest {
  image: string; // base64_encoded_image
  num_pieces: number;
}

export interface CalculateIdealCutResponse {
  svg: string;
}

export interface CalculateScoreRequest {
  actual_image: string; // base64_encoded_image
  ideal_image: string; // base64_encoded_image
}

export interface CalculateScoreResponse {
  score: number;
}

export interface SaveScoreRequest {
  account_name: string;
  uuid: string;
  score: number;
}

export interface SaveScoreResponse {
  success: boolean;
}

export interface RankingEntry {
  rank: number;
  account_name: string;
  score: number;
}

export interface RankingResponse {
  ranking: RankingEntry[];
}

export interface PizzaCutterResponse {
  success: boolean;
  svg_before_explosion: string;
  svg_after_explosion: string;
  svg_animated: string;
  piece_svgs: string[];
  overlay_image: string;
  error_message: string;
}

export interface PizzaScoreResponse {
  success: boolean;
  fairness_score: number;
  error_message: string;
}
