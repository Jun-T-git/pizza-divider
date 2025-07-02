/**
 * 精密なカメラガイド座標変換システム
 * 表示ガイド枠と実際のトリミング領域を正確に一致させる
 */

export interface Dimensions {
  width: number;
  height: number;
}

export interface CoordinateRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RelativeRect {
  x: number; // 0.0-1.0
  y: number; // 0.0-1.0  
  width: number; // 0.0-1.0
  height: number; // 0.0-1.0
}

export interface PreciseCropData {
  displayGuide: CoordinateRect;
  videoDisplayArea: CoordinateRect;
  relativeCoords: RelativeRect;
  cropCoords: CoordinateRect;
  isValid: boolean;
}

export class PreciseCameraGuideManager {
  private guideRatio: number;
  private targetOutputSize: number;

  constructor(guideRatio: number = 0.7, targetOutputSize: number = 800) {
    this.guideRatio = guideRatio;
    this.targetOutputSize = targetOutputSize;
  }

  /**
   * Step 1: 表示座標系でのガイド枠計算
   */
  calculateDisplayGuide(viewport: Dimensions): CoordinateRect {
    const squareSize = Math.min(viewport.width, viewport.height) * this.guideRatio;
    const x = (viewport.width - squareSize) / 2;
    const y = (viewport.height - squareSize) / 2;
    
    return {
      x,
      y,
      width: squareSize,
      height: squareSize
    };
  }

  /**
   * Step 2: ビデオ表示領域計算 (object-cover適用後)
   */
  calculateVideoDisplayArea(viewport: Dimensions, naturalVideoSize: Dimensions): CoordinateRect {
    const viewportAspect = viewport.width / viewport.height;
    const videoAspect = naturalVideoSize.width / naturalVideoSize.height;

    let displayWidth: number;
    let displayHeight: number;
    let offsetX: number = 0;
    let offsetY: number = 0;

    if (videoAspect > viewportAspect) {
      // ビデオが横長 → 高さを基準に拡大、左右クロップ
      displayHeight = viewport.height;
      displayWidth = viewport.height * videoAspect;
      offsetX = (viewport.width - displayWidth) / 2;
    } else {
      // ビデオが縦長 → 幅を基準に拡大、上下クロップ
      displayWidth = viewport.width;
      displayHeight = viewport.width / videoAspect;
      offsetY = (viewport.height - displayHeight) / 2;
    }

    return {
      x: offsetX,
      y: offsetY,
      width: displayWidth,
      height: displayHeight
    };
  }

  /**
   * Step 3: 表示座標 → ビデオ領域内相対座標変換
   */
  displayToRelative(displayRect: CoordinateRect, videoDisplayArea: CoordinateRect): RelativeRect {
    // ガイド枠がビデオ領域内にあるかチェック
    const guideLeft = displayRect.x;
    const guideTop = displayRect.y;
    const guideRight = displayRect.x + displayRect.width;
    const guideBottom = displayRect.y + displayRect.height;

    const videoLeft = videoDisplayArea.x;
    const videoTop = videoDisplayArea.y;
    const videoRight = videoDisplayArea.x + videoDisplayArea.width;
    const videoBottom = videoDisplayArea.y + videoDisplayArea.height;

    // ビデオ領域内に収まるように調整
    const clampedLeft = Math.max(guideLeft, videoLeft);
    const clampedTop = Math.max(guideTop, videoTop);
    const clampedRight = Math.min(guideRight, videoRight);
    const clampedBottom = Math.min(guideBottom, videoBottom);

    // ビデオ領域内での相対座標 (0.0-1.0)
    const relativeX = (clampedLeft - videoLeft) / videoDisplayArea.width;
    const relativeY = (clampedTop - videoTop) / videoDisplayArea.height;
    const relativeWidth = (clampedRight - clampedLeft) / videoDisplayArea.width;
    const relativeHeight = (clampedBottom - clampedTop) / videoDisplayArea.height;

    return {
      x: relativeX,
      y: relativeY,
      width: relativeWidth,
      height: relativeHeight
    };
  }

  /**
   * Step 4: 相対座標 → スクリーンショット絶対座標変換
   */
  relativeToScreenshot(relativeRect: RelativeRect, screenshotSize: Dimensions): CoordinateRect {
    const x = relativeRect.x * screenshotSize.width;
    const y = relativeRect.y * screenshotSize.height;
    const width = relativeRect.width * screenshotSize.width;
    const height = relativeRect.height * screenshotSize.height;

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * 統合メソッド: 全変換ステップを実行
   */
  calculatePreciseCrop(
    viewport: Dimensions,
    naturalVideoSize: Dimensions,
    screenshotSize: Dimensions
  ): PreciseCropData {
    // Step 1: 表示ガイド枠
    const displayGuide = this.calculateDisplayGuide(viewport);
    
    // Step 2: ビデオ表示領域
    const videoDisplayArea = this.calculateVideoDisplayArea(viewport, naturalVideoSize);
    
    // Step 3: 相対座標変換
    const relativeCoords = this.displayToRelative(displayGuide, videoDisplayArea);
    
    // Step 4: 絶対座標変換
    const cropCoords = this.relativeToScreenshot(relativeCoords, screenshotSize);

    // 有効性チェック
    const isValid = cropCoords.width > 0 && cropCoords.height > 0 &&
                   cropCoords.x >= 0 && cropCoords.y >= 0 &&
                   cropCoords.x + cropCoords.width <= screenshotSize.width &&
                   cropCoords.y + cropCoords.height <= screenshotSize.height;

    return {
      displayGuide,
      videoDisplayArea,
      relativeCoords,
      cropCoords,
      isValid
    };
  }

  /**
   * Canvas上でトリミング実行
   */
  async cropImagePrecise(
    screenshotDataUrl: string,
    cropData: PreciseCropData
  ): Promise<File | null> {
    if (!cropData.isValid) {
      console.error('Invalid crop data:', cropData);
      return null;
    }

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

      // 正方形出力に調整
      const sourceSize = Math.min(cropData.cropCoords.width, cropData.cropCoords.height);
      const sourceX = cropData.cropCoords.x + (cropData.cropCoords.width - sourceSize) / 2;
      const sourceY = cropData.cropCoords.y + (cropData.cropCoords.height - sourceSize) / 2;

      canvas.width = this.targetOutputSize;
      canvas.height = this.targetOutputSize;

      console.log('PreciseCrop debug:', {
        original: cropData,
        adjusted: { sourceX, sourceY, sourceSize },
        imageSize: { width: img.width, height: img.height }
      });

      // 左右反転を元に戻しながら描画
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-this.targetOutputSize, 0);
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize,
        0, 0, this.targetOutputSize, this.targetOutputSize
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
      console.error('PreciseCrop error:', error);
      return null;
    }
  }
}