/**
 * カメラガイド表示とトリミング処理の一元管理
 */

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface VideoElement {
  videoWidth: number;
  videoHeight: number;
}

export interface GuideCalculation {
  // 表示用（SVGガイド）
  display: {
    squareX: number;
    squareY: number;
    squareSize: number;
    centerX: number;
    centerY: number;
  };
  
  // トリミング用（Canvas座標）
  crop: {
    sourceX: number;
    sourceY: number;
    sourceSize: number;
    targetSize: number;
  };
  
  // デバッグ情報
  debug: {
    viewport: ViewportDimensions;
    videoArea: {
      width: number;
      height: number;
      offsetX: number;
      offsetY: number;
    };
    aspectRatios: {
      viewport: number;
      video: number;
    };
    adjustments?: {
      originalSquare: { x: number; y: number; size: number };
      adjustedSquare: { x: number; y: number; size: number };
    };
  };
}

export class CameraGuideManager {
  private guideRatio: number;
  private targetOutputSize: number;

  constructor(guideRatio: number = 0.7, targetOutputSize: number = 800) {
    this.guideRatio = guideRatio;
    this.targetOutputSize = targetOutputSize;
  }

  /**
   * ガイド表示とトリミング座標を計算
   */
  calculateGuide(
    viewport: ViewportDimensions,
    screenshotImg?: { width: number; height: number }
  ): GuideCalculation {
    // 1. 表示用ガイド座標（画面全体基準）
    const squareSize = Math.min(viewport.width, viewport.height) * this.guideRatio;
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const squareX = centerX - squareSize / 2;
    const squareY = centerY - squareSize / 2;

    // 2. トリミング用座標（スクリーンショット画像基準）
    let cropData = {
      sourceX: 0,
      sourceY: 0,
      sourceSize: screenshotImg?.width || squareSize,
      targetSize: this.targetOutputSize
    };

    let debugVideoArea = {
      width: viewport.width,
      height: viewport.height,
      offsetX: 0,
      offsetY: 0
    };

    if (screenshotImg) {
      // スクリーンショット画像が利用可能な場合の精密計算
      const videoAspectRatio = screenshotImg.width / screenshotImg.height;
      const viewportAspectRatio = viewport.width / viewport.height;

      // ビデオ表示領域を計算（object-cover挙動）
      let actualVideoWidth, actualVideoHeight, offsetX = 0, offsetY = 0;

      if (videoAspectRatio > viewportAspectRatio) {
        // ビデオが横長 -> 上下に余白
        actualVideoWidth = viewport.width;
        actualVideoHeight = viewport.width / videoAspectRatio;
        offsetY = (viewport.height - actualVideoHeight) / 2;
      } else {
        // ビデオが縦長 -> 左右に余白
        actualVideoHeight = viewport.height;
        actualVideoWidth = viewport.height * videoAspectRatio;
        offsetX = (viewport.width - actualVideoWidth) / 2;
      }

      debugVideoArea = { width: actualVideoWidth, height: actualVideoHeight, offsetX, offsetY };

      // ガイド枠をビデオ領域に合わせて調整
      const adjustedSquareX = Math.max(offsetX, Math.min(squareX, offsetX + actualVideoWidth - squareSize));
      const adjustedSquareY = Math.max(offsetY, Math.min(squareY, offsetY + actualVideoHeight - squareSize));
      
      // ビデオ領域からはみ出る場合は、ビデオ領域内に収まるサイズに調整
      const maxSquareSize = Math.min(
        squareSize,
        actualVideoWidth - (adjustedSquareX - offsetX),
        actualVideoHeight - (adjustedSquareY - offsetY)
      );
      
      // ビデオ領域内での相対座標
      const relativeX = (adjustedSquareX - offsetX) / actualVideoWidth;
      const relativeY = (adjustedSquareY - offsetY) / actualVideoHeight;
      const relativeSize = maxSquareSize / Math.min(actualVideoWidth, actualVideoHeight);

      // スクリーンショット画像上の座標
      cropData = {
        sourceX: relativeX * screenshotImg.width,
        sourceY: relativeY * screenshotImg.height,
        sourceSize: relativeSize * Math.min(screenshotImg.width, screenshotImg.height),
        targetSize: this.targetOutputSize
      };
    }

    const result: GuideCalculation = {
      display: {
        squareX,
        squareY,
        squareSize,
        centerX,
        centerY
      },
      crop: cropData,
      debug: {
        viewport,
        videoArea: debugVideoArea,
        aspectRatios: {
          viewport: viewport.width / viewport.height,
          video: screenshotImg ? screenshotImg.width / screenshotImg.height : 1
        }
      }
    };

    // 調整が行われた場合はデバッグ情報に追加
    if (screenshotImg) {
      const adjustedSquareX = Math.max(debugVideoArea.offsetX, Math.min(squareX, debugVideoArea.offsetX + debugVideoArea.width - squareSize));
      const adjustedSquareY = Math.max(debugVideoArea.offsetY, Math.min(squareY, debugVideoArea.offsetY + debugVideoArea.height - squareSize));
      const maxSquareSize = Math.min(
        squareSize,
        debugVideoArea.width - (adjustedSquareX - debugVideoArea.offsetX),
        debugVideoArea.height - (adjustedSquareY - debugVideoArea.offsetY)
      );

      result.debug.adjustments = {
        originalSquare: { x: squareX, y: squareY, size: squareSize },
        adjustedSquare: { x: adjustedSquareX, y: adjustedSquareY, size: maxSquareSize }
      };
    }

    return result;
  }

  /**
   * Canvas上でトリミング実行
   */
  async cropImage(
    screenshotDataUrl: string,
    calculation: GuideCalculation
  ): Promise<File | null> {
    try {
      // 画像読み込み
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = screenshotDataUrl;
      });

      // Canvas作成
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = calculation.crop.targetSize;
      canvas.height = calculation.crop.targetSize;

      // 座標を安全な範囲に調整
      const safeX = Math.max(0, Math.min(calculation.crop.sourceX, img.width - calculation.crop.sourceSize));
      const safeY = Math.max(0, Math.min(calculation.crop.sourceY, img.height - calculation.crop.sourceSize));
      const safeSize = Math.min(
        calculation.crop.sourceSize,
        img.width - safeX,
        img.height - safeY
      );

      console.log('CameraGuideManager crop:', {
        original: calculation.crop,
        safe: { x: safeX, y: safeY, size: safeSize },
        imgSize: { width: img.width, height: img.height }
      });

      // 左右反転を元に戻しながら描画
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-calculation.crop.targetSize, 0);
      ctx.drawImage(
        img,
        safeX, safeY, safeSize, safeSize,
        0, 0, calculation.crop.targetSize, calculation.crop.targetSize
      );
      ctx.restore();

      // Fileオブジェクト作成
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `pizza-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(file);
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.9);
      });
    } catch (error) {
      console.error('CameraGuideManager crop error:', error);
      return null;
    }
  }
}