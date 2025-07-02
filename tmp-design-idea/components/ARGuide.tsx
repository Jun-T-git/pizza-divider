import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Smartphone, Scissors, CheckCircle, Camera, Target, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ARGuideProps {
  slices: any[];
  onCuttingComplete: () => void;
}

export default function ARGuide({ slices, onCuttingComplete }: ARGuideProps) {
  const [arMode, setArMode] = useState(false);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [completedCuts, setCompletedCuts] = useState<number[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const totalCuts = slices.length;
  const progress = (completedCuts.length / totalCuts) * 100;

  const startARMode = async () => {
    setIsCalibrating(true);
    // カメラ起動をシミュレート
    setTimeout(() => {
      setArMode(true);
      setIsCalibrating(false);
    }, 2000);
  };

  const markCutComplete = () => {
    if (!completedCuts.includes(currentSlice)) {
      setCompletedCuts([...completedCuts, currentSlice]);
    }
    
    const nextSlice = currentSlice + 1;
    if (nextSlice < totalCuts) {
      setCurrentSlice(nextSlice);
    }
  };

  const resetCuts = () => {
    setCompletedCuts([]);
    setCurrentSlice(0);
  };

  if (isCalibrating) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500 animate-pulse" />
              ARカメラを準備中
            </CardTitle>
            <CardDescription>
              ピザとカメラの位置を調整しています
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="text-white text-center space-y-2">
                <Camera className="w-12 h-12 mx-auto animate-pulse" />
                <p className="text-sm">カメラ起動中...</p>
              </div>
              
              {/* グリッドオーバーレイ */}
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">カメラアクセス許可</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">ピザ検出・位置合わせ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                <span className="text-sm">ARオーバーレイ準備</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!arMode) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              ARカッティングガイド
            </CardTitle>
            <CardDescription>
              拡張現実を使って正確にピザをカットしましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* プレビュー画像 */}
            <div className="relative aspect-square">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop"
                alt="カッティングプレビュー"
                className="w-full h-full object-cover rounded-lg"
              />
              
              {/* 分割線プレビュー */}
              <div className="absolute inset-0 rounded-lg">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                >
                  {slices.map((slice, index) => {
                    const angle = (slice.angle.start * Math.PI) / 180;
                    const x = 100 + 90 * Math.cos(angle);
                    const y = 100 + 90 * Math.sin(angle);
                    
                    return (
                      <line
                        key={index}
                        x1="100"
                        y1="100"
                        x2={x}
                        y2={y}
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                    );
                  })}
                  <circle cx="100" cy="100" r="3" fill="#3B82F6" />
                </svg>
              </div>

              <div className="absolute top-2 right-2">
                <Badge variant="secondary">
                  プレビューモード
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">分割数</p>
                <p className="font-semibold">{totalCuts}カット</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">予想時間</p>
                <p className="font-semibold">2-3分</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用方法</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">スマートフォンをピザの真上に固定</p>
                  <p className="text-sm text-muted-foreground">
                    ピザ全体が画面に収まる高さに調整してください
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">ARガイド線に沿ってカット</p>
                  <p className="text-sm text-muted-foreground">
                    表示される青い線に沿って丁寧にカットしてください
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">各カット完了をタップで記録</p>
                  <p className="text-sm text-muted-foreground">
                    一本カットするごとに完了ボタンをタップしてください
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={startARMode} className="w-full" size="lg">
          <Smartphone className="w-4 h-4 mr-2" />
          ARガイドを開始
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              <CardTitle className="text-lg">ARガイド起動中</CardTitle>
            </div>
            <Badge className="bg-green-500">
              ライブ
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <CardDescription>
              カット {currentSlice + 1} / {totalCuts}
            </CardDescription>
            <span className="text-sm font-medium">{Math.round(progress)}%完了</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ARビューポート */}
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop"
              alt="ARビュー"
              className="w-full h-full object-cover"
            />
            
            {/* ARオーバーレイ */}
            <div className="absolute inset-0">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
              >
                {/* 完了したカット線 */}
                {slices.map((slice, index) => {
                  if (!completedCuts.includes(index)) return null;
                  
                  const angle = (slice.angle.start * Math.PI) / 180;
                  const x = 100 + 90 * Math.cos(angle);
                  const y = 100 + 90 * Math.sin(angle);
                  
                  return (
                    <line
                      key={`completed-${index}`}
                      x1="100"
                      y1="100"
                      x2={x}
                      y2={y}
                      stroke="#22C55E"
                      strokeWidth="4"
                      opacity="0.8"
                    />
                  );
                })}
                
                {/* 現在のカット線 */}
                {currentSlice < totalCuts && (
                  <line
                    x1="100"
                    y1="100"
                    x2={100 + 90 * Math.cos((slices[currentSlice].angle.start * Math.PI) / 180)}
                    y2={100 + 90 * Math.sin((slices[currentSlice].angle.start * Math.PI) / 180)}
                    stroke="#3B82F6"
                    strokeWidth="5"
                    strokeDasharray="8,4"
                    className="animate-pulse"
                  />
                )}
                
                {/* 残りのカット線（薄く表示） */}
                {slices.map((slice, index) => {
                  if (completedCuts.includes(index) || index === currentSlice) return null;
                  
                  const angle = (slice.angle.start * Math.PI) / 180;
                  const x = 100 + 90 * Math.cos(angle);
                  const y = 100 + 90 * Math.sin(angle);
                  
                  return (
                    <line
                      key={`pending-${index}`}
                      x1="100"
                      y1="100"
                      x2={x}
                      y2={y}
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                      opacity="0.5"
                    />
                  );
                })}
                
                <circle cx="100" cy="100" r="3" fill="#3B82F6" />
              </svg>
              
              {/* カット番号 */}
              {currentSlice < totalCuts && (
                <div className="absolute top-4 left-4">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    カット #{currentSlice + 1}
                  </div>
                </div>
              )}
              
              {/* 進行状況 */}
              <div className="absolute top-4 right-4">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {completedCuts.length}/{totalCuts}
                </div>
              </div>
            </div>
          </div>

          {/* カット情報 */}
          {currentSlice < totalCuts && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    次のカット: {slices[currentSlice].person}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    価値: {slices[currentSlice].value}pt
                  </p>
                </div>
                <Badge variant="outline">
                  {slices[currentSlice].angle.start}°
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* コントロール */}
      <div className="space-y-4">
        {currentSlice < totalCuts ? (
          <Button 
            onClick={markCutComplete} 
            className="w-full" 
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            カット #{currentSlice + 1} 完了
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="font-semibold text-green-600">
                全てのカットが完了しました！
              </p>
            </div>
            <Button onClick={onCuttingComplete} className="w-full" size="lg">
              割り勘計算に進む
            </Button>
          </div>
        )}

        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="ar-mode" 
              checked={arMode}
              onCheckedChange={setArMode}
            />
            <Label htmlFor="ar-mode">ARモード</Label>
          </div>
          <Button variant="outline" size="sm" onClick={resetCuts}>
            リセット
          </Button>
        </div>
      </div>
    </div>
  );
}