import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Calculator, Users, Zap, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SliceCalculatorProps {
  pizzaData: any;
  participants: number;
  onCalculationComplete: (slices: any[]) => void;
}

export default function SliceCalculator({ pizzaData, participants, onCalculationComplete }: SliceCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(true);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [slices, setSlices] = useState<any[]>([]);
  const [calculationMethod, setCalculationMethod] = useState<'optimal' | 'traditional'>('optimal');

  useEffect(() => {
    calculateSlices();
  }, [participants, calculationMethod]);

  const calculateSlices = () => {
    setIsCalculating(true);
    setCalculationProgress(0);

    const interval = setInterval(() => {
      setCalculationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalculating(false);
          generateSlices();
          return 100;
        }
        return prev + 12.5;
      });
    }, 200);
  };

  const generateSlices = () => {
    const totalValue = pizzaData?.totalValue || 680;
    const targetValuePerSlice = totalValue / participants;
    
    // スライスデータを生成（実際のアルゴリズムではなく、デモ用の簡略化された計算）
    const generatedSlices = Array.from({ length: participants }, (_, index) => {
      const variance = (Math.random() - 0.5) * 0.1; // ±5%の誤差
      const sliceValue = targetValuePerSlice * (1 + variance);
      
      return {
        id: index + 1,
        person: `参加者${index + 1}`,
        value: Math.round(sliceValue),
        targetValue: Math.round(targetValuePerSlice),
        percentage: Math.round((sliceValue / totalValue) * 100),
        angle: {
          start: (360 / participants) * index,
          end: (360 / participants) * (index + 1)
        },
        toppings: pizzaData?.toppings?.map((t: any) => ({
          ...t,
          amount: Math.round((t.coverage / participants) * (1 + variance * 0.5))
        })) || []
      };
    });

    setSlices(generatedSlices);
  };

  const getVarianceColor = (actual: number, target: number) => {
    const variance = Math.abs(actual - target) / target;
    if (variance < 0.05) return 'text-green-600';
    if (variance < 0.1) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVarianceText = (actual: number, target: number) => {
    const variance = ((actual - target) / target) * 100;
    const sign = variance > 0 ? '+' : '';
    return `${sign}${variance.toFixed(1)}%`;
  };

  if (isCalculating) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500 animate-pulse" />
              最適分割を計算中
            </CardTitle>
            <CardDescription>
              {participants}人で価値を均等に分割するための最適解を計算しています
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">計算進行度</span>
              <span className="text-sm">{calculationProgress}%</span>
            </div>
            <Progress value={calculationProgress} className="h-3" />

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">価値分布マップの解析</span>
                <Badge className="ml-auto bg-green-500">完了</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm">最適化アルゴリズムの実行</span>
                {calculationProgress >= 50 ? (
                  <Badge className="ml-auto bg-green-500">完了</Badge>
                ) : (
                  <Badge className="ml-auto bg-blue-500 animate-pulse">処理中</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${calculationProgress >= 75 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-sm">分割線の座標計算</span>
                {calculationProgress >= 100 ? (
                  <Badge className="ml-auto bg-green-500">完了</Badge>
                ) : calculationProgress >= 75 ? (
                  <Badge className="ml-auto bg-blue-500 animate-pulse">処理中</Badge>
                ) : (
                  <Badge className="ml-auto" variant="secondary">待機中</Badge>
                )}
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
            <Zap className="w-5 h-5 text-green-500" />
            最適分割完了
          </CardTitle>
          <CardDescription>
            価値の均等分配を実現する分割パターンを生成しました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 分割図表示 */}
          <div className="relative aspect-square">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop"
              alt="分割されたピザ"
              className="w-full h-full object-cover rounded-lg"
            />
            
            {/* 分割線のオーバーレイ */}
            <div className="absolute inset-0 rounded-lg">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                {/* 中心点 */}
                <circle cx="100" cy="100" r="2" fill="white" stroke="black" strokeWidth="1" />
                
                {/* 分割線 */}
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
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                  );
                })}
              </svg>
              
              {/* スライス番号 */}
              {slices.map((slice, index) => {
                const midAngle = ((slice.angle.start + slice.angle.end) / 2 * Math.PI) / 180;
                const x = 50 + 35 * Math.cos(midAngle);
                const y = 50 + 35 * Math.sin(midAngle);
                
                return (
                  <div
                    key={index}
                    className="absolute w-8 h-8 bg-white dark:bg-black border-2 border-black dark:border-white rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {slice.id}
                  </div>
                );
              })}
            </div>

            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500">
                {participants}等分完了
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">分割方法</p>
              <p className="font-semibold">価値均等型</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">最大誤差</p>
              <p className="font-semibold text-green-600">&lt; 10%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            分割結果詳細
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slices.map((slice, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      {slice.id}
                    </div>
                    <div>
                      <p className="font-medium">{slice.person}</p>
                      <p className="text-sm text-muted-foreground">
                        スライス {slice.percentage}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{slice.value}pt</p>
                    <p className={`text-sm ${getVarianceColor(slice.value, slice.targetValue)}`}>
                      {getVarianceText(slice.value, slice.targetValue)}
                    </p>
                  </div>
                </div>
                
                {index < slices.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={calculateSlices}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          再計算
        </Button>
        <Button
          onClick={() => onCalculationComplete(slices)}
          className="flex-1"
        >
          ARガイドへ
        </Button>
      </div>
    </div>
  );
}