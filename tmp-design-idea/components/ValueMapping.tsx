import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { TrendingUp, Edit, CheckCircle, Map } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ValueMappingProps {
  pizzaData: any;
  onAnalysisComplete: () => void;
}

export default function ValueMapping({ pizzaData, onAnalysisComplete }: ValueMappingProps) {
  const [toppings, setToppings] = useState(pizzaData?.toppings || []);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    // 分析プロセスのシミュレーション
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          setIsAnalyzing(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const totalValue = toppings.reduce((sum: number, topping: any) => 
    sum + (topping.value * topping.coverage / 100), 0
  );

  const updateToppingValue = (index: number, newValue: number) => {
    const updatedToppings = [...toppings];
    updatedToppings[index] = { ...updatedToppings[index], value: newValue };
    setToppings(updatedToppings);
  };

  const getToppingColor = (toppingName: string) => {
    const colors: { [key: string]: string } = {
      'サラミ': 'bg-red-500',
      'チーズ': 'bg-yellow-400',
      'ピーマン': 'bg-green-500',
      'オリーブ': 'bg-purple-600',
      'トマトソース': 'bg-orange-500'
    };
    return colors[toppingName] || 'bg-gray-500';
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-blue-500" />
              価値マッピング分析
            </CardTitle>
            <CardDescription>
              具材の価値分布を解析しています...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop"
                alt="ピザ価値分析"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg animate-pulse" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 dark:bg-black/90 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">分析進行度</span>
                    <span className="text-sm">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4>分析ステップ:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">具材領域の特定</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">密度分布の計算</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysisProgress >= 70 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span className="text-sm">価値ポイントの算出</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysisProgress >= 100 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm">最適化マップの生成</span>
                </div>
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
            <TrendingUp className="w-5 h-5 text-green-500" />
            価値マップ完成
          </CardTitle>
          <CardDescription>
            具材の価値分布が分析されました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 価値ヒートマップ（モック） */}
          <div className="relative aspect-square">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop"
              alt="ピザ価値マップ"
              className="w-full h-full object-cover rounded-lg"
            />
            
            {/* 価値ポイントのオーバーレイ */}
            <div className="absolute inset-0 rounded-lg">
              {/* サラミの価値ポイント */}
              <div className="absolute top-[20%] left-[30%] w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white text-xs font-bold">
                10
              </div>
              <div className="absolute top-[30%] right-[30%] w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white text-xs font-bold">
                10
              </div>
              <div className="absolute bottom-[20%] left-[40%] w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white text-xs font-bold">
                10
              </div>
              
              {/* ピーマンの価値ポイント */}
              <div className="absolute top-[60%] left-[20%] w-6 h-6 bg-green-500/80 rounded-full flex items-center justify-center text-white text-xs font-bold">
                3
              </div>
              <div className="absolute top-[40%] right-[20%] w-6 h-6 bg-green-500/80 rounded-full flex items-center justify-center text-white text-xs font-bold">
                3
              </div>
              
              {/* オリーブの価値ポイント */}
              <div className="absolute bottom-[30%] right-[40%] w-6 h-6 bg-purple-600/80 rounded-full flex items-center justify-center text-white text-xs font-bold">
                5
              </div>
            </div>

            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500">
                価値分析完了
              </Badge>
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground">総価値</p>
            <p className="text-2xl font-bold text-green-600">{totalValue.toFixed(0)} ポイント</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>具材価値設定</CardTitle>
            <CardDescription>
              必要に応じて具材の価値を調整できます
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {editMode ? '完了' : '編集'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {toppings.map((topping: any, index: number) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getToppingColor(topping.name)}`} />
                    <div>
                      <p className="font-medium">{topping.name}</p>
                      <p className="text-sm text-muted-foreground">
                        カバー率: {topping.coverage}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{topping.value} pt/100g</p>
                    <p className="text-sm text-muted-foreground">
                      総価値: {((topping.value * topping.coverage) / 100).toFixed(0)}pt
                    </p>
                  </div>
                </div>
                
                {editMode && (
                  <div className="px-1">
                    <Slider
                      value={[topping.value]}
                      onValueChange={([value]) => updateToppingValue(index, value)}
                      max={20}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1pt</span>
                      <span>20pt</span>
                    </div>
                  </div>
                )}
                
                {index < toppings.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={onAnalysisComplete} className="w-full" size="lg">
        <CheckCircle className="w-4 h-4 mr-2" />
        分割計算に進む
      </Button>
    </div>
  );
}