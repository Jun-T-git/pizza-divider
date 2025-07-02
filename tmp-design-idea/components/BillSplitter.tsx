import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { DollarSign, Calculator, Share2, Download, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface BillSplitterProps {
  slices: any[];
  totalPrice: number;
  onPriceChange: (price: number) => void;
}

export default function BillSplitter({ slices, totalPrice, onPriceChange }: BillSplitterProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    calculatePayments();
  }, [slices, totalPrice]);

  const calculatePayments = () => {
    const totalValue = slices.reduce((sum, slice) => sum + slice.value, 0);
    
    const calculatedPayments = slices.map((slice, index) => {
      const valueRatio = slice.value / totalValue;
      const fairAmount = Math.round(totalPrice * valueRatio);
      const equalAmount = Math.round(totalPrice / slices.length);
      const difference = fairAmount - equalAmount;
      
      return {
        id: slice.id,
        person: slice.person,
        sliceValue: slice.value,
        valueRatio: valueRatio * 100,
        equalAmount: equalAmount,
        fairAmount: fairAmount,
        difference: difference,
        status: Math.abs(difference) < 50 ? 'fair' : difference > 0 ? 'overpay' : 'underpay'
      };
    });

    setPayments(calculatedPayments);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fair': return 'text-green-600';
      case 'overpay': return 'text-red-600';
      case 'underpay': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string, difference: number) => {
    switch (status) {
      case 'fair':
        return <Badge className="bg-green-500">公平</Badge>;
      case 'overpay':
        return <Badge className="bg-red-500">+{difference}円</Badge>;
      case 'underpay':
        return <Badge className="bg-blue-500">{difference}円</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const totalFairAmount = payments.reduce((sum, payment) => sum + payment.fairAmount, 0);
  const averageVariance = payments.reduce((sum, payment) => 
    sum + Math.abs(payment.difference), 0) / payments.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            価値ベース割り勘
          </CardTitle>
          <CardDescription>
            食べた価値の比率に応じた公平な支払い額を計算しました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="total-price">ピザの合計金額</Label>
            <div className="flex items-center gap-2">
              <Input
                id="total-price"
                type="number"
                value={totalPrice}
                onChange={(e) => onPriceChange(Number(e.target.value))}
                className="text-right"
                min="0"
                step="100"
              />
              <span className="text-sm text-muted-foreground">円</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">合計金額</p>
              <p className="font-bold">{totalPrice.toLocaleString()}円</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">均等割り</p>
              <p className="font-bold">{Math.round(totalPrice / slices.length).toLocaleString()}円</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-muted-foreground">平均誤差</p>
              <p className="font-bold text-green-600">{Math.round(averageVariance)}円</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              個別支払い額
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '簡潔表示' : '詳細表示'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {payment.id}
                    </div>
                    <div>
                      <p className="font-medium">{payment.person}</p>
                      <p className="text-sm text-muted-foreground">
                        価値: {payment.sliceValue}pt ({payment.valueRatio.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {payment.fairAmount.toLocaleString()}円
                    </p>
                    {getStatusBadge(payment.status, payment.difference)}
                  </div>
                </div>

                {showDetails && (
                  <div className="ml-13 p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>均等割り額:</span>
                      <span>{payment.equalAmount.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>価値比例額:</span>
                      <span className={getStatusColor(payment.status)}>
                        {payment.fairAmount.toLocaleString()}円
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>調整額:</span>
                      <span className={getStatusColor(payment.status)}>
                        {payment.difference > 0 ? '+' : ''}{payment.difference}円
                      </span>
                    </div>
                  </div>
                )}
                
                {index < payments.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 計算説明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            計算方法
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium">価値比例計算</h4>
                <p className="text-sm text-muted-foreground">
                  各スライスの価値ポイントの比率に応じて支払額を算出
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">計算式:</p>
              <p className="font-mono bg-muted p-2 rounded">
                個人支払額 = 総額 × (個人価値 ÷ 総価値)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アクション */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            シェア
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            レシート
          </Button>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🍕</span>
            </div>
            <h3 className="font-semibold">ピザ分割完了！</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            みんなで公平にピザを楽しめました。お疲れ様でした！
          </p>
        </div>
      </div>
    </div>
  );
}