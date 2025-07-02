import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import {
  Camera,
  Scan,
  Users,
  Calculator,
  Scissors,
  DollarSign,
  Pizza,
  Sparkles,
} from "lucide-react";
import PizzaScanner from "./components/PizzaScanner";
import ValueMapping from "./components/ValueMapping";
import SliceCalculator from "./components/SliceCalculator";
import ARGuide from "./components/ARGuide";
import BillSplitter from "./components/BillSplitter";

type AppStep =
  | "home"
  | "scan"
  | "mapping"
  | "calculate"
  | "ar"
  | "split";

export default function App() {
  const [currentStep, setCurrentStep] =
    useState<AppStep>("home");
  const [pizzaData, setPizzaData] = useState<any>(null);
  const [participants, setParticipants] = useState(3);
  const [slices, setSlices] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(3000);

  const steps = [
    {
      id: "home",
      title: "ホーム",
      icon: Pizza,
      description: "ピザ分割を開始",
    },
    {
      id: "scan",
      title: "スキャン",
      icon: Camera,
      description: "ピザを撮影・認識",
    },
    {
      id: "mapping",
      title: "価値分析",
      icon: Scan,
      description: "具材の価値を分析",
    },
    {
      id: "calculate",
      title: "分割計算",
      icon: Users,
      description: "最適な分割を計算",
    },
    {
      id: "ar",
      title: "カットガイド",
      icon: Scissors,
      description: "ARガイドでカット",
    },
    {
      id: "split",
      title: "割り勘",
      icon: DollarSign,
      description: "公平な支払い計算",
    },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex((step) => step.id === currentStep);
  const progress =
    ((getCurrentStepIndex() + 1) / steps.length) * 100;

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as AppStep);
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as AppStep);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "home":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Pizza className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  ピザ等価値分割
                </h1>
                <p className="text-muted-foreground mt-2">
                  AIが具材の価値を分析して、公平な分割を実現
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  アプリの特徴
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Scan className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4>AI具材認識</h4>
                      <p className="text-sm text-muted-foreground">
                        カメラでピザを撮影するだけで具材を自動認識
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calculator className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4>価値ベース分割</h4>
                      <p className="text-sm text-muted-foreground">
                        具材の価値に基づいた最適な分割線を計算
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <h4>公平な割り勘</h4>
                      <p className="text-sm text-muted-foreground">
                        価値の比率に応じた支払い額を自動計算
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Label htmlFor="participants">参加人数</Label>
              <Input
                id="participants"
                type="number"
                min="2"
                max="8"
                value={participants}
                onChange={(e) =>
                  setParticipants(Number(e.target.value))
                }
                className="text-center"
              />
            </div>

            <Button
              onClick={nextStep}
              className="w-full"
              size="lg"
            >
              <Camera className="w-4 h-4 mr-2" />
              ピザをスキャンして開始
            </Button>
          </div>
        );

      case "scan":
        return (
          <PizzaScanner
            onPizzaScanned={(data) => {
              setPizzaData(data);
              nextStep();
            }}
          />
        );

      case "mapping":
        return (
          <ValueMapping
            pizzaData={pizzaData}
            onAnalysisComplete={nextStep}
          />
        );

      case "calculate":
        return (
          <SliceCalculator
            pizzaData={pizzaData}
            participants={participants}
            onCalculationComplete={(calculatedSlices) => {
              setSlices(calculatedSlices);
              nextStep();
            }}
          />
        );

      case "ar":
        return (
          <ARGuide
            slices={slices}
            onCuttingComplete={nextStep}
          />
        );

      case "split":
        return (
          <BillSplitter
            slices={slices}
            totalPrice={totalPrice}
            onPriceChange={setTotalPrice}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
      <div className="container max-w-md mx-auto p-4 space-y-6">
        {/* ステップインジケーター */}
        {currentStep !== "home" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {steps.find((s) => s.id === currentStep)?.title}
              </h2>
              <Badge variant="secondary">
                {getCurrentStepIndex() + 1} / {steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="space-y-6">{renderCurrentStep()}</div>

        {/* ナビゲーションボタン */}
        {currentStep !== "home" && (
          <>
            <Separator />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={getCurrentStepIndex() === 0}
                className="flex-1"
              >
                戻る
              </Button>
              {currentStep === "split" && (
                <Button
                  onClick={() => setCurrentStep("home")}
                  className="flex-1"
                >
                  新しいピザ
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}