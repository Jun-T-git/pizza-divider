import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Camera, Scan, CheckCircle, Upload } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PizzaScannerProps {
  onPizzaScanned: (data: any) => void;
}

export default function PizzaScanner({ onPizzaScanned }: PizzaScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [recognitionComplete, setRecognitionComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // サンプルピザデータ
  const samplePizzaData = {
    shape: 'circular',
    diameter: 30,
    toppings: [
      { name: 'サラミ', value: 10, coverage: 35, positions: [[0.3, 0.2], [0.7, 0.3], [0.4, 0.8]] },
      { name: 'チーズ', value: 8, coverage: 80, positions: 'uniform' },
      { name: 'ピーマン', value: 3, coverage: 25, positions: [[0.2, 0.6], [0.8, 0.4], [0.5, 0.1]] },
      { name: 'オリーブ', value: 5, coverage: 15, positions: [[0.6, 0.7], [0.3, 0.4]] },
      { name: 'トマトソース', value: 4, coverage: 90, positions: 'base' }
    ],
    totalValue: 680
  };

  const simulateScanning = () => {
    setIsScanning(true);
    setScannedImage('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop');
    
    // スキャニングシミュレーション
    setTimeout(() => {
      setIsScanning(false);
      setRecognitionComplete(true);
    }, 3000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScannedImage(e.target?.result as string);
        simulateScanning();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    onPizzaScanned(samplePizzaData);
  };

  if (recognitionComplete) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              認識完了
            </CardTitle>
            <CardDescription>
              ピザの形状と具材を正常に認識しました
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scannedImage && (
              <div className="relative">
                <ImageWithFallback 
                  src={scannedImage}
                  alt="スキャンされたピザ"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/10 rounded-lg" />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-500">
                    認識済み
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">形状</p>
                <p className="font-semibold">円形 (30cm)</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">検出具材</p>
                <p className="font-semibold">5種類</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4>検出された具材:</h4>
              <div className="flex flex-wrap gap-2">
                {samplePizzaData.toppings.map((topping, index) => (
                  <Badge key={index} variant="secondary">
                    {topping.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleComplete} className="w-full" size="lg">
          価値分析を開始
        </Button>
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5 animate-pulse text-blue-500" />
              AI分析中...
            </CardTitle>
            <CardDescription>
              ピザの形状と具材を認識しています
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scannedImage && (
              <div className="relative">
                <ImageWithFallback 
                  src={scannedImage}
                  alt="スキャン中のピザ"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-black/90 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Scan className="w-4 h-4 animate-spin" />
                      <span className="text-sm">分析中...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">形状認識</span>
                <Badge className="bg-green-500">完了</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">具材検出</span>
                <Badge className="bg-blue-500 animate-pulse">処理中</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">価値計算</span>
                <Badge variant="secondary">待機中</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            ピザをスキャン
          </CardTitle>
          <CardDescription>
            ピザを真上から撮影して、具材の分布を認識します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* カメラプレビューエリア（モック） */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
            <div className="text-center space-y-2">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                カメラでピザを撮影
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={simulateScanning} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              撮影する
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              画像選択
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>撮影のコツ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">ピザ全体が画面に収まるように撮影</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">真上から垂直に撮影</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">具材がはっきり見えるよう明るい場所で撮影</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}