"use client";

import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmotionResult {
  detected: number;
  results: Array<{
    face: string; // Base64エンコードされた顔画像（data URI形式）
    dominant: string;
    scores: {
      [key: string]: number;
    };
    pay: number;
  }>;
  file: string;
}

interface ParticipantWithPayment {
  id: number;
  name: string;
  color: string;
  active: boolean;
  payRatio?: number;
  amount?: number;
}

export default function BillSplitPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [totalAmount, setTotalAmount] = useState<string>("3000");
  const [participants, setParticipants] = useState<ParticipantWithPayment[]>(
    []
  );
  const [emotionResults, setEmotionResults] = useState<EmotionResult | null>(
    null
  );
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [faceNameAssignments, setFaceNameAssignments] = useState<{[faceIndex: number]: string}>({});
  const [showNameSelector, setShowNameSelector] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // localStorageから参加者情報を取得
    const savedParticipants = localStorage.getItem("participants");
    const savedEmotionResults = localStorage.getItem("emotionResults");
    const savedGroupPhoto = localStorage.getItem("groupPhoto");

    // グループ写真を設定
    if (savedGroupPhoto) {
      setGroupPhoto(savedGroupPhoto);
    }

    if (savedParticipants) {
      try {
        const parsed = JSON.parse(
          savedParticipants
        ) as ParticipantWithPayment[];

        // 感情認識結果がある場合は支払い比率を計算
        if (savedEmotionResults) {
          const emotionData = JSON.parse(savedEmotionResults) as EmotionResult;
          setEmotionResults(emotionData);

          // 各参加者に支払い比率を割り当て
          const updatedParticipants = parsed.map((participant, index) => {
            if (emotionData.results[index]) {
              return {
                ...participant,
                payRatio: emotionData.results[index].pay,
              };
            }
            return {
              ...participant,
              payRatio: 1 / parsed.length, // デフォルトは均等割り
            };
          });

          setParticipants(updatedParticipants);
          calculateAmounts(updatedParticipants, totalAmount);
        } else {
          // 感情認識結果がない場合は均等割り
          const updatedParticipants = parsed.map((p) => ({
            ...p,
            payRatio: 1 / parsed.length,
          }));
          setParticipants(updatedParticipants);
          calculateAmounts(updatedParticipants, totalAmount);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
  }, [totalAmount]);

  const calculateAmounts = (
    participantsList: ParticipantWithPayment[],
    amount: string
  ) => {
    const total = parseInt(amount) || 0;
    if (total === 0 || participantsList.length === 0) return;

    // 支払い比率の合計を計算
    const totalRatio = participantsList.reduce(
      (sum, p) => sum + (p.payRatio || 0),
      0
    );

    // 各参加者の金額を計算（まず基本的な割り当て）
    const updatedParticipants = participantsList.map((participant) => {
      const ratio = participant.payRatio || 0;
      const amount = Math.floor((total * ratio) / totalRatio);
      return {
        ...participant,
        amount,
        adjustmentRatio: ratio, // 端数調整のために比率も保持
      };
    });

    // 端数を調整して合計を一致させる
    const currentTotal = updatedParticipants.reduce((sum, p) => sum + p.amount, 0);
    const difference = total - currentTotal;

    if (difference > 0) {
      // 不足分がある場合、比率が高い順に1円ずつ追加
      const sortedByRatio = [...updatedParticipants]
        .map((p, index) => ({ ...p, originalIndex: index }))
        .sort((a, b) => b.adjustmentRatio - a.adjustmentRatio);

      for (let i = 0; i < difference; i++) {
        const targetIndex = sortedByRatio[i % sortedByRatio.length].originalIndex;
        updatedParticipants[targetIndex].amount += 1;
      }
    } else if (difference < 0) {
      // 超過分がある場合、比率が低い順に1円ずつ減額
      const sortedByRatio = [...updatedParticipants]
        .map((p, index) => ({ ...p, originalIndex: index }))
        .sort((a, b) => a.adjustmentRatio - b.adjustmentRatio);

      for (let i = 0; i < Math.abs(difference); i++) {
        const targetIndex = sortedByRatio[i % sortedByRatio.length].originalIndex;
        if (updatedParticipants[targetIndex].amount > 0) {
          updatedParticipants[targetIndex].amount -= 1;
        }
      }
    }

    // adjustmentRatio プロパティを削除  
    const finalParticipants = updatedParticipants.map(({ adjustmentRatio, ...p }) => {
      // adjustmentRatio を除去
      void adjustmentRatio;
      return p;
    });

    setParticipants(finalParticipants);
  };

  const handleAmountChange = (value: string) => {
    // 数字のみ許可
    const numericValue = value.replace(/[^0-9]/g, "");
    setTotalAmount(numericValue);

    // 金額を再計算
    calculateAmounts(participants, numericValue);
  };

  const calculateEmotionAmounts = (results: EmotionResult['results'], total: number) => {
    if (!results || results.length === 0) return [];

    const totalPay = results.reduce((sum, r) => sum + r.pay, 0);
    
    // totalPayが0の場合は均等割り
    if (totalPay === 0) {
      const baseAmount = Math.floor(total / results.length);
      const amounts = new Array(results.length).fill(baseAmount);
      const remainder = total - baseAmount * results.length;
      
      // 余りを先頭から配布
      for (let i = 0; i < remainder; i++) {
        amounts[i] += 1;
      }
      return amounts;
    }
    
    // 各顔の基本金額を計算（Math.floor使用）
    const amounts = results.map(result => 
      Math.floor((total * result.pay) / totalPay)
    );

    // 端数を調整
    const currentTotal = amounts.reduce((sum, amount) => sum + amount, 0);
    const difference = total - currentTotal;

    if (difference > 0) {
      // 不足分がある場合、支払い比率が高い順に1円ずつ追加
      const sortedIndices = results
        .map((result, index) => ({ index, pay: result.pay }))
        .sort((a, b) => b.pay - a.pay);

      for (let i = 0; i < difference; i++) {
        const targetIndex = sortedIndices[i % sortedIndices.length].index;
        amounts[targetIndex] += 1;
      }
    } else if (difference < 0) {
      // 超過分がある場合、支払い比率が低い順に1円ずつ減額
      const sortedIndices = results
        .map((result, index) => ({ index, pay: result.pay }))
        .sort((a, b) => a.pay - b.pay);

      let remainingReduction = Math.abs(difference);
      for (let i = 0; i < sortedIndices.length && remainingReduction > 0; i++) {
        const targetIndex = sortedIndices[i % sortedIndices.length].index;
        const reduction = Math.min(amounts[targetIndex], remainingReduction);
        amounts[targetIndex] -= reduction;
        remainingReduction -= reduction;
      }
    }

    return amounts;
  };

  const handleFaceNameAssignment = (faceIndex: number, participantName: string) => {
    setFaceNameAssignments(prev => ({
      ...prev,
      [faceIndex]: participantName
    }));
    setShowNameSelector(null);
  };

  const getAvailableParticipants = () => {
    const assignedNames = Object.values(faceNameAssignments);
    return participants.filter(p => !assignedNames.includes(p.name));
  };

  const getFaceDisplayName = (faceIndex: number) => {
    return faceNameAssignments[faceIndex] || t('bill-split.assign.name');
  };

  const getParticipantColor = (participantName: string) => {
    const participant = participants.find(p => p.name === participantName);
    return participant?.color || '#cbd5e1';
  };

  const generateShareImage = async () => {
    try {
      if (!canvasRef.current) {
        console.error('Canvas reference not found');
        return null;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Canvas context not found');
        return null;
      }

      console.log('Starting image generation...');

      // キャンバスサイズを設定
      canvas.width = 800;
      canvas.height = 1200;

      // 白い背景
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 上部に集合写真を表示
      const photoHeight = 250;
      const photoY = 40;

      if (groupPhoto) {
        try {
          const photoImg = new Image();
          await new Promise((resolve, reject) => {
            photoImg.onload = resolve;
            photoImg.onerror = reject;
            photoImg.src = groupPhoto;
          });

          // アスペクト比を保持して写真を描画
          const photoAspect = photoImg.width / photoImg.height;
          const photoWidth = Math.min(canvas.width - 80, photoHeight * photoAspect);
          const photoX = (canvas.width - photoWidth) / 2;

          // 写真の影
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(photoX + 4, photoY + 4, photoWidth, photoHeight);

          // 写真を描画
          ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);

          // 写真の枠線
          ctx.strokeStyle = '#ddd';
          ctx.lineWidth = 2;
          ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);

        } catch (error) {
          console.error('Error loading group photo:', error);
        }
      }

      // レシート風の白い領域
      const receiptWidth = 600;
      const receiptX = (canvas.width - receiptWidth) / 2;
      const receiptY = photoY + photoHeight + 40;
      const receiptHeight = 800;

      // レシートの影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(receiptX + 8, receiptY + 8, receiptWidth, receiptHeight);

      // レシート背景（白い紙）
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(receiptX, receiptY, receiptWidth, receiptHeight);

      // レシートの破れ線を上下に描画
      ctx.strokeStyle = '#ddd';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(receiptX, receiptY);
      ctx.lineTo(receiptX + receiptWidth, receiptY);
      ctx.moveTo(receiptX, receiptY + receiptHeight);
      ctx.lineTo(receiptX + receiptWidth, receiptY + receiptHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      let currentY = receiptY + 60;

      // レシートヘッダー
      ctx.fillStyle = '#000';
      ctx.font = 'bold 28px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GALAXYCUTTER RECEIPT', canvas.width / 2, currentY);

      currentY += 40;
      ctx.font = '16px "Courier New", monospace';
      ctx.fillText('=============================', canvas.width / 2, currentY);

      currentY += 40;
      const now = new Date();
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText(`Date: ${now.toLocaleDateString()}`, canvas.width / 2, currentY);

      currentY += 25;
      ctx.fillText(`Time: ${now.toLocaleTimeString()}`, canvas.width / 2, currentY);

      currentY += 40;
      ctx.font = '16px "Courier New", monospace';
      ctx.fillText('=============================', canvas.width / 2, currentY);

      currentY += 50;

      if (emotionResults && emotionResults.results && emotionResults.results.length > 0) {
        // 感情認識結果がある場合
        console.log('Face assignments for image:', faceNameAssignments);

        ctx.font = '18px "Courier New", monospace';
        ctx.fillText(`DETECTED: ${emotionResults.detected} PEOPLE`, canvas.width / 2, currentY);
        currentY += 40;

        const amounts = calculateEmotionAmounts(emotionResults.results, parseInt(totalAmount || '0'));

        for (let i = 0; i < emotionResults.results.length; i++) {
          const result = emotionResults.results[i];
          const amount = amounts[i];

          // 項目行
          ctx.font = '16px "Courier New", monospace';
          ctx.textAlign = 'left';
          const assignedName = faceNameAssignments[i];
          console.log(`Face ${i}: assigned name = "${assignedName}"`);

          const displayText = assignedName && assignedName.trim() !== ''
            ? `${assignedName} (${result.dominant})`
            : `Face ${i + 1} (${result.dominant})`;
          ctx.fillText(displayText, receiptX + 30, currentY);

          ctx.textAlign = 'right';
          ctx.fillText(`¥${amount.toLocaleString()}`, receiptX + receiptWidth - 30, currentY);

          currentY += 30;

          // 支払い比率
          ctx.font = '12px "Courier New", monospace';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#666';
          ctx.fillText(`  Payment ratio: ${Math.round(result.pay * 100)}%`, receiptX + 30, currentY);
          ctx.fillStyle = '#000';

          currentY += 35;
        }
      } else if (participants && participants.length > 0) {
        // 通常の参加者表示
        ctx.font = '18px "Courier New", monospace';
        ctx.fillText(`PARTICIPANTS: ${participants.length}`, canvas.width / 2, currentY);
        currentY += 40;

        for (let i = 0; i < participants.length; i++) {
          const participant = participants[i];

          ctx.font = '16px "Courier New", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(participant.name || `Person ${i + 1}`, receiptX + 30, currentY);

          ctx.textAlign = 'right';
          ctx.fillText(`¥${(participant.amount || 0).toLocaleString()}`, receiptX + receiptWidth - 30, currentY);

          currentY += 35;
        }
      }

      // 区切り線
      currentY += 20;
      ctx.font = '16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('-----------------------------', canvas.width / 2, currentY);

      // 合計金額
      currentY += 50;
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillText('TOTAL AMOUNT', canvas.width / 2, currentY);

      currentY += 40;
      ctx.font = 'bold 32px "Courier New", monospace';
      ctx.fillText(`¥${parseInt(totalAmount || '0').toLocaleString()}`, canvas.width / 2, currentY);

      // 下部区切り線
      currentY += 60;
      ctx.font = '16px "Courier New", monospace';
      ctx.fillText('=============================', canvas.width / 2, currentY);

      // フッター
      currentY += 40;
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('Thank you for using', canvas.width / 2, currentY);

      currentY += 25;
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('GALAXYCUTTER', canvas.width / 2, currentY);

      currentY += 30;
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('Created by RocketFactory', canvas.width / 2, currentY);

      currentY += 20;
      ctx.fillText('@ 17F LODGE Kitchen', canvas.width / 2, currentY);

      console.log('Image generation completed');
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error in generateShareImage:', error);
      return null;
    }
  };

  const handleCopyToClipboard = async () => {
    console.log('=== Copy to Clipboard ===');

    const imageData = await generateShareImage();
    if (!imageData) {
      alert(t('error.share-generate'));
      return;
    }

    // 文言を作成
    let message = `${t('share.title')}\n${t('share.subtitle')}\n\n${t('share.total-amount', { amount: parseInt(totalAmount || '0').toLocaleString() })}\n`;

    if (emotionResults && emotionResults.results && emotionResults.results.length > 0) {
      message += `${t('share.participants', { participants: emotionResults.detected })}\n\n`;
      const amounts = calculateEmotionAmounts(emotionResults.results, parseInt(totalAmount || '0'));
      emotionResults.results.forEach((result, index) => {
        const assignedName = faceNameAssignments[index];
        const displayName = assignedName && assignedName.trim() !== '' ? assignedName : `顔${index + 1}`;
        const amount = amounts[index];
        message += `${displayName}: ¥${amount.toLocaleString()} (${Math.round(result.pay * 100)}%)\n`;
      });
    } else if (participants && participants.length > 0) {
      message += `${t('share.participants', { participants: participants.length })}\n\n`;
      participants.forEach((participant) => {
        message += `${participant.name}: ¥${(participant.amount || 0).toLocaleString()}\n`;
      });
    }

    message += `\n${t('share.ai-calculation')}\n${t('share.app-link')}\n\n#ROCKET_PIZZA #HackId19 #Hackday2025 #RocketFactory`;

    // スマホかどうかを判定
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // スマホの場合：Web Share API を優先使用
      try {
        if (navigator.share) {
          // データURLをBlobに変換
          const response = await fetch(imageData);
          const blob = await response.blob();
          const file = new File([blob], 'galaxycutter-result.png', { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'GalaxyCutter 割り勘結果',
              text: message,
              files: [file]
            });
            return;
          } else {
            // ファイル共有できない場合はテキストのみ
            await navigator.share({
              title: 'GalaxyCutter 割り勘結果',
              text: message + '\n\n※ 画像は別途ダウンロードされます'
            });

            // 画像をダウンロード
            const link = document.createElement('a');
            link.download = 'galaxycutter-result.png';
            link.href = imageData;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
          }
        }
      } catch (shareError) {
        console.log('Web Share failed, trying clipboard:', shareError);
      }

      // フォールバック: テキストのみクリップボード
      try {
        await navigator.clipboard.writeText(message);

        // 画像をダウンロード
        const link = document.createElement('a');
        link.download = 'galaxycutter-result.png';
        link.href = imageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(t('share.success.mobile'));

      } catch (clipError) {
        console.error('Mobile clipboard failed:', clipError);

        // 最終フォールバック: ダウンロードのみ
        const link = document.createElement('a');
        link.download = 'galaxycutter-result.png';
        link.href = imageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(t('share.success.image-download', { message }));
      }
    } else {
      // PC の場合：ClipboardItem を使用
      try {
        // データURLをBlobに変換
        const response = await fetch(imageData);
        const blob = await response.blob();

        // ClipboardItem を作成（画像と文字を両方含む）
        const clipboardItems = [
          new ClipboardItem({
            'image/png': blob,
            'text/plain': new Blob([message], { type: 'text/plain' })
          })
        ];

        // クリップボードに書き込み
        await navigator.clipboard.write(clipboardItems);

        alert(t('share.success.clipboard'));

      } catch (error) {
        console.error('PC Clipboard copy failed:', error);

        // フォールバック: 文字のみコピー + 画像ダウンロード
        try {
          await navigator.clipboard.writeText(message + '\n\n※ 結果画像は別途ダウンロードされます');

          // 画像もダウンロード
          const link = document.createElement('a');
          link.download = 'galaxycutter-result.png';
          link.href = imageData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          alert(t('share.success.text-image'));

        } catch (textError) {
          console.error('Text copy also failed:', textError);
          alert(t('share.error.copy'));
        }
      }
    }
  };

  const handleShareImage = async () => {
    console.log('=== Share Image Debug ===');
    console.log('Total Amount:', totalAmount);
    console.log('Participants:', participants);
    console.log('Emotion Results:', emotionResults);
    console.log('Canvas Ref:', canvasRef.current);

    const imageData = await generateShareImage();
    console.log('Generated Image Data:', imageData ? 'Success' : 'Failed');

    if (!imageData) {
      console.error('Image generation failed - no data returned');
      alert(t('error.share-generate'));
      return;
    }

    try {
      console.log('Starting share process...');

      // Web Share APIが利用可能な場合
      if (navigator.share && navigator.canShare) {
        console.log('Web Share API available');

        // データURLをBlobに変換
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], 'galaxycutter-result.png', { type: 'image/png' });

        console.log('File created:', file.size, 'bytes');

        if (navigator.canShare({ files: [file] })) {
          console.log('Can share files, sharing...');
          await navigator.share({
            title: 'GalaxyCutter 割り勘結果',
            text: `${t('share.title')}\n${t('share.total-amount', { amount: parseInt(totalAmount || '0').toLocaleString() })}\n\n#ROCKET_PIZZA #HackId19 #Hackday2025 #RocketFactory`,
            files: [file]
          });
          console.log('Share completed successfully');
          return;
        } else {
          console.log('Cannot share files, falling back to download');
        }
      } else {
        console.log('Web Share API not available, using download');
      }

      // フォールバック: 画像をダウンロード
      const link = document.createElement('a');
      link.download = 'galaxycutter-result.png';
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download initiated');
    } catch (error) {
      console.error('Share failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(t('share.error.failed', { error: errorMessage }));
    }
  };

  const handleComplete = () => {
    // 割り勘情報を保存
    const billData: {
      total: string;
      emotionBased: boolean;
      facePayments?: Array<{
        index: number;
        image: string;
        dominant: string;
        payRatio: number;
        amount: number;
      }>;
      participants?: ParticipantWithPayment[];
    } = {
      total: totalAmount,
      emotionBased: !!emotionResults,
    };

    if (emotionResults && emotionResults.results) {
      // 感情認識結果がある場合は顔ごとの金額を保存
      const amounts = calculateEmotionAmounts(emotionResults.results, parseInt(totalAmount) || 0);
      billData.facePayments = emotionResults.results.map((result, index) => {
        return {
          index: index + 1,
          image: result.face,
          dominant: result.dominant,
          payRatio: result.pay,
          amount: amounts[index],
        };
      });
    } else {
      // 感情認識結果がない場合は参加者情報を保存
      billData.participants = participants;
    }

    localStorage.setItem("billSplitInfo", JSON.stringify(billData));
    router.push("/complete");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="max-w-lg mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-slate-800 mb-2">
            {t('bill-split.title')}
          </h2>
          <p className="text-slate-600 text-sm">{t('bill-split.description')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-8">
              {/* グループ写真表示 */}
              {groupPhoto && (
                <div className="mb-6">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-slate-50">
                    <img
                      src={groupPhoto}
                      alt={t('group-photo.subtitle')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    {t('group-photo.subtitle')}
                  </p>
                </div>
              )}

              {/* 金額入力 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  {t('bill-split.total.amount')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-transparent text-lg font-medium bg-white text-gray-700"
                    placeholder={t('bill-split.amount.placeholder')}
                  />
                </div>
              </div>

              {/* 参加者リスト */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-4">
                  {emotionResults
                    ? `${t('bill-split.assign.faces')} (${emotionResults.detected}${t('bill-split.currency')})`
                    : `${t('bill-split.total')} (${participants.length}${t('bill-split.currency')})`}
                </h3>
                <div className="space-y-3">
                  {emotionResults && emotionResults.results
                    ? // 感情認識結果がある場合は顔写真ごとに表示
                      (() => {
                        const amounts = calculateEmotionAmounts(emotionResults.results, parseInt(totalAmount) || 0);
                        return emotionResults.results.map((result, index) => {
                          const amount = amounts[index];
                          return (
                            <div key={index}>
                              <div
                                className="flex items-center justify-between p-4 rounded-xl transition-colors"
                                style={{
                                  backgroundColor: faceNameAssignments[index]
                                    ? `${getParticipantColor(faceNameAssignments[index])}20`
                                    : '#f1f5f9'
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  {result.face ? (
                                    <img
                                      src={result.face}
                                      alt={t('bill-split.face.image', { number: index + 1 })}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold">
                                      {index + 1}
                                    </div>
                                  )}
                                  <div>
                                    <button
                                      onClick={() => setShowNameSelector(showNameSelector === index ? null : index)}
                                      className={`font-medium transition-colors border-b border-dashed ${
                                        faceNameAssignments[index] 
                                          ? 'text-slate-800 hover:text-blue-600 border-slate-400 hover:border-blue-600'
                                          : 'text-slate-500 hover:text-blue-600 border-slate-300 hover:border-blue-600'
                                      }`}
                                    >
                                      {getFaceDisplayName(index)}
                                    </button>
                                    <div className="text-xs text-slate-500">
                                      {t('bill-split.emotion')}: {result.dominant} (
                                      {Math.round(result.pay * 100)}%)
                                    </div>
                                  </div>
                                </div>
                                <span className="text-slate-900 font-semibold">
                                  {t('bill-split.currency')}{amount.toLocaleString()}
                                </span>
                              </div>

                              {/* 名前選択UI */}
                              {showNameSelector === index && (
                                <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                  <p className="text-xs text-slate-600 mb-2">{t('bill-split.assign.instruction')}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {getAvailableParticipants().map((participant) => (
                                      <button
                                        key={participant.id}
                                        onClick={() => handleFaceNameAssignment(index, participant.name)}
                                        className="px-3 py-2 text-sm text-white rounded-full transition-all hover:scale-105 shadow-sm"
                                        style={{
                                          backgroundColor: participant.color,
                                          boxShadow: `0 2px 8px ${participant.color}40`
                                        }}
                                      >
                                        {participant.name}
                                      </button>
                                    ))}
                                    {faceNameAssignments[index] && (
                                      <button
                                        onClick={() => handleFaceNameAssignment(index, '')}
                                        className="px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full transition-all hover:scale-105 shadow-sm"
                                      >
                                        {t('button.delete')}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()
                    : // 感情認識結果がない場合は従来通りユーザー名で表示
                      participants.map((participant, index) => (
                        <div
                          key={participant.id || index}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-800">
                              {participant.name || `${t('settings.participant', { number: index + 1 })}`}
                            </span>
                          </div>
                          <span className="text-slate-900 font-semibold">
                            {t('bill-split.currency')}{(participant.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                {emotionResults
                  ? t('bill-split.based.on.happiness')
                  : t('bill-split.payment')}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopyToClipboard}
                className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all hover:scale-105 shadow-sm flex items-center justify-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                📋 {t('button.split.bill')}
              </button>


              <button
                onClick={handleShareImage}
                className="w-full py-4 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all hover:scale-105 shadow-sm flex items-center justify-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16,6 12,2 8,6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {t('button.complete')}
              </button>

              <a
                href="https://workers-hub.enterprise.slack.com/archives/C077LMG8ZS9/p1751600937550819"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all hover:scale-105 shadow-sm flex items-center justify-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                🗳️ 投票はこちら！
              </a>

              <button
                onClick={handleComplete}
                className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all hover:scale-105 shadow-sm"
              >
                {t('button.complete')}
              </button>

              <Link href="/group-photo">
                <button className="w-full py-3 px-6 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  {t('nav.back')}
                </button>
              </Link>
            </div>

            {/* 非表示のキャンバス */}
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
              width={800}
              height={1200}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
