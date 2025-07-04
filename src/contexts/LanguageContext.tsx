'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  ja: {
    // App name and navigation
    'app.name': 'GalaxyCutter',
    'nav.back': '戻る',
    
    // Common buttons
    'button.next': '次へ',
    'button.skip': 'スキップ',
    'button.skip.next': 'スキップして次へ',
    'button.camera': '📷 カメラで撮影',
    'button.upload': '📁 ファイルをアップロード',
    'button.start': 'スタート',
    'button.confirm': '確認',
    'button.save': '保存',
    'button.add': '+ 追加',
    'button.delete': '削除',
    'button.divide.pizza': 'ピザを分割',
    'button.take.photo': '写真を撮る',
    'button.retake': '撮り直す',
    'button.use.photo': 'この写真を使用',
    'button.home': 'ホームに戻る',
    'button.new.game': '新しいゲームを始める',
    'button.split.bill': '支払いを確定',
    'button.complete': '完了',
    'button.start_over': '最初から始める',
    'button.change_settings': '設定を変更',
    
    // Home page
    'home.title': 'ピザ分割アプリ',
    'home.subtitle': '公平にピザを分けて',
    'home.description': 'みんなで楽しく食べよう',
    
    // Camera page
    'camera.title': 'ピザ撮影',
    'camera.description': '切る前のピザの写真を撮影してください',
    'camera.preparation': 'ピザの撮影準備',
    'camera.instruction': '切る前のピザの写真を撮影します',
    'camera.select.method': '撮影方法を選択してください',
    
    // Settings page
    'settings.title': '分割設定',
    'settings.description': '参加者を設定してピザを分割しましょう',
    'settings.people.count': '人数: {count}人',
    'settings.participant': '参加者{number}',
    'settings.name.placeholder': '名前を入力',
    'settings.color.select': '色を選択',
    'settings.min.people.error': '最低2人は必要です',
    'settings.guide.1': '人数を選択してください',
    'settings.guide.2': '参加者の名前を入力できます',
    'settings.guide.3': '各参加者の色を選んでください',
    
    // Result page
    'result.title': '分割結果', 
    'result.description': 'ピザを{count}等分に分割しました',
    'result.points': '分割のポイント',
    'result.cut.along': 'ガイドに沿って切り分けてください',
    'result.equal.size': '各ピースが同じ大きさになるように',
    'result.center.align': '中心を合わせて正確に',
    'result.next.step': '実際に切ったら撮影してね！',
    
    // Evaluate page
    'evaluate.title': '分割後の評価',
    'evaluate.description': '実際に切り分けたピザを撮影して分割の精度を評価します',
    'evaluate.instruction.1': '実際に切り分けたピザを撮影して',
    'evaluate.instruction.2': '分割の精度を評価します',
    'evaluate.preparation': '分割後の撮影準備',
    'evaluate.select.method': '撮影方法を選択してください',
    
    // Score page
    'score.title': '公平性スコア',
    'score.description': 'ピザ分割の公平性を評価しました',
    'score.fairness': '公平性',
    'score.percent': '{score}%',
    'score.message.perfect': '完璧な分割です！',
    'score.message.excellent': '素晴らしい分割です！',
    'score.message.good': '良い分割です！',
    'score.message.fair': 'まずまずの分割です',
    'score.message.poor': 'もう少し練習しましょう',
    'score.comparison': '分割前後の比較',
    'score.before': '分割前',
    'score.after': '分割後',
    
    // Roulette page
    'roulette.title': '誰が最初に選ぶ？',
    'roulette.description': 'ルーレットで順番を決めよう！',
    'roulette.instruction': 'タップしてルーレットを回そう',
    'roulette.result': '{name}さんが最初！',
    'roulette.order.result': '選ぶ順番が決まりました！',
    'roulette.position': '{position}番目',
    
    // Group photo page
    'group-photo.title': '集合写真撮影',
    'group-photo.subtitle': '集合写真',
    'group-photo.description': 'みんなで記念撮影をしましょう',
    'group-photo.instruction.1': 'みんなでピザを囲んだ',
    'group-photo.instruction.2': '記念写真を撮りましょう！',
    'group-photo.preparation': '記念撮影の準備',
    'group-photo.completed': 'ピザの分割が完了しました',
    'group-photo.take.photo': 'みんなで記念写真を撮りましょう',
    'group-photo.guide': 'みんなで枠内に入って記念撮影しましょう',
    'group-photo.processing': '感情を分析中...',
    
    // Bill split page
    'bill-split.title': '会計分割',
    'bill-split.description': '感情に基づいて支払い金額を計算します',
    'bill-split.total.amount': '合計金額',
    'bill-split.amount.placeholder': '金額を入力',
    'bill-split.based.on.happiness': '幸福度に基づく分割',
    'bill-split.assign.faces': '顔認識結果と名前の紐付け',
    'bill-split.assign.instruction': '各顔画像をタップして名前を割り当ててください',
    'bill-split.emotion': '感情',
    'bill-split.payment': '支払い',
    'bill-split.assign.name': '名前を割り当て',
    'bill-split.face.image': '顔 {number}',
    'bill-split.total': '合計',
    'bill-split.currency': '円',
    
    // Complete page
    'complete.title': '完了！',
    'complete.description': 'ピザの分割が完了しました',
    'complete.thank.you': 'お疲れさまでした！',
    'complete.enjoy': '美味しいピザをお楽しみください',
    'complete.memories': '楽しい思い出ができました',
    
    // Image upload
    'upload.title': '画像をアップロード',
    'upload.description': 'ファイルを選択するかドラッグ&ドロップしてください',
    'upload.formats': '対応形式: JPEG, PNG, WebP',
    'upload.max.size': '最大サイズ: 10MB',
    'upload.resolution': '推奨解像度: 200x200ピクセル以上',
    'upload.processing': '画像を処理中...',
    'upload.select.file': 'ファイルを選択',
    
    // Loading messages
    'loading.calculating': '分割線を計算中...',
    'loading.analyzing': 'サラミの位置を解析しています',
    
    // Error messages
    'error.title': 'エラーが発生しました',
    'error.no_image_data': '画像データが見つかりません',
    'error.parse_results': '分割結果の解析に失敗しました',
    'error.load_results': '分割結果の読み込みに失敗しました',
    'error.image-save': '画像の保存に失敗しました',
    'error.min-people': '最低2人は必要です',
    'error.camera': 'カメラエラーが発生しました',
    'error.file.format': '対応していないファイル形式です。{formats}形式のファイルを選択してください。',
    'error.file.size': 'ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。',
    'error.resolution': '画像の解像度が低すぎます。200x200ピクセル以上の画像を選択してください。',
    'error.processing': '画像の処理に失敗しました。',
    'error.load': '画像の読み込みに失敗しました。',
    'error.photo-save': '写真の保存に失敗しました',
    'error.capture-failed': '撮影に失敗しました。',
    'error.video-access': 'ビデオ要素にアクセスできませんでした。',
    'error.max-people': '最大{max}人までです',
    'error.no-image-file': '画像ファイル情報が見つかりません',
    'error.score-save': 'スコアの保存に失敗しました',
    'error.share-generate': '画像の生成に失敗しました。',
    
    // Additional UI elements
    'ui.photographed-pizza': '撮影したピザ',
    'ui.participant': '参加者',
    'ui.participant-number': '参加者{number}',
    'ui.piece-value': '各ピースの価値',
    'ui.piece': 'ピース',
    'ui.pizza-in-frame': '枠内にピザを収めてください',
    'ui.loading': '読み込み中...',
    'ui.analyzing': '分析中...',
    'ui.processing': '処理中...',
    
    // Sharing messages
    'share.title': '🍕 焼き立てのピザを配布中！',
    'share.subtitle': 'GalaxyCutterで割り勘計算完了！',
    'share.ai-calculation': '✨ 感情認識AI による公平な割り勘計算',
    'share.total-amount': '💰 合計金額: {amount}円',
    'share.participants': '👥 参加者: {participants}',
    'share.app-link': '🔗 https://galaxycutter.app',
    
    // Stub data names
    'stub.pizza-master': 'ピザマスター',
    'stub.salami-king': 'サラミ王',
    'stub.cheese-lover': 'チーズ愛好家',
    'stub.tomato-prince': 'トマト王子',
    
    // PizzaRouletteUI page
    'roulette.pizza.title': 'ピザの分け方を決めよう',
    'roulette.pizza.description': '誰がどの部分を食べるか決めましょう',
    'roulette.pizza.deciding': '誰がどこを食べるか決めています...',
    'roulette.pizza.decided': '分け方が決まりました！',
    'roulette.pizza.assigned': 'みんなの食べる部分が決まりました',
    'roulette.pizza.button.decide': 'みんなで分け方を決める',
    'roulette.pizza.button.photo': 'みんなで記念写真を撮る',
    'roulette.pizza.button.restart': 'もう一度決め直す',
    'roulette.pizza.description.photo': 'ピザパーティーの様子を写真におさめましょう！',
    
    // Ranking page
    'ranking.title': 'ランキング',
    'ranking.description': 'トップスコアランキング',
    'ranking.your.rank': 'あなたの順位',
    'ranking.top.ranking': 'トップランキング',
    'ranking.rank.position': '{rank}位',
    'ranking.points': '{score}点',
    'ranking.loading': 'ランキング読み込み中...',
    'ranking.loading.description': '最新のスコアを取得しています',
    'ranking.error': 'エラーが発生しました',
    'ranking.error.load': 'ランキングの読み込みに失敗しました',
    'ranking.no.data': 'まだランキングデータがありません',
    'ranking.no.data.description': '最初にスコアを投稿してみましょう！',
    'ranking.button.new.pizza': '新しいピザを分割する',
    'ranking.button.back.score': 'スコア画面に戻る',
    'ranking.about.title': 'ランキングについて',
    'ranking.about.1': 'スコアは分割の精度を100点満点で評価',
    'ranking.about.2': '上位者は理想的な分割に近い結果を達成',
    'ranking.about.3': 'ランキングは定期的に更新されます',
    
    // Split bill page
    'split-bill.title': '割り勘金額計算',
    'split-bill.description': '表情満足度による重み付けで計算します',
    'split-bill.total.label': '合計金額（円）',
    'split-bill.satisfaction': '満足度: {satisfaction}%',
    'split-bill.calculation': '計算方法：',
    'split-bill.calculation.desc1': '満足度が高い人ほど多く支払う仕組みです。',
    'split-bill.calculation.desc2': '「美味しかった分だけ払う」公平な割り勘！',
    'split-bill.button.complete': '完了',
    'split-bill.button.back': '戻る',
    
    // Share messages
    'share.success.mobile': '📱 文言をコピーし、画像をダウンロードしました！\n\n1. Slackに文言を貼り付け\n2. 画像を添付してください',
    'share.success.image-download': '📱 画像をダウンロードしました！\n\n以下の文言をコピーしてSlackに投稿してください：\n\n{message}',
    'share.success.clipboard': '💻 画像と文言をクリップボードにコピーしました！\nSlackに貼り付けてください。',
    'share.success.text-image': '💻 文言をコピーし、画像をダウンロードしました！\n両方をSlackに投稿してください。',
    'share.error.copy': '⚠️ コピーに失敗しました。手動でシェアしてください。',
    'share.error.failed': 'シェアに失敗しました: {error}',
    
    // App metadata
    'meta.description': 'ピザを公平に分けるアプリ',
  },
  en: {
    // App name and navigation
    'app.name': 'GalaxyCutter',
    'nav.back': 'Back',
    
    // Common buttons
    'button.next': 'Next',
    'button.skip': 'Skip',
    'button.skip.next': 'Skip to Next',
    'button.camera': '📷 Take Photo',
    'button.upload': '📁 Upload File',
    'button.start': 'Start',
    'button.confirm': 'Confirm',
    'button.save': 'Save',
    'button.add': '+ Add',
    'button.delete': 'Delete',
    'button.divide.pizza': 'Divide Pizza',
    'button.take.photo': 'Take Photo',
    'button.retake': 'Retake',
    'button.use.photo': 'Use This Photo',
    'button.home': 'Back to Home',
    'button.new.game': 'Start New Game',
    'button.split.bill': 'Confirm Payment',
    'button.complete': 'Complete',
    'button.start_over': 'Start Over',
    'button.change_settings': 'Change Settings',
    
    // Home page
    'home.title': 'Pizza Divider App',
    'home.subtitle': 'Divide Pizza Fairly',
    'home.description': 'Let\'s enjoy together',
    
    // Camera page
    'camera.title': 'Pizza Photo',
    'camera.description': 'Take a photo of the pizza before cutting',
    'camera.preparation': 'Pizza Photo Setup',
    'camera.instruction': 'Take a photo of the uncut pizza',
    'camera.select.method': 'Select capture method',
    
    // Settings page
    'settings.title': 'Division Settings',
    'settings.description': 'Set up participants and divide the pizza',
    'settings.people.count': 'People: {count}',
    'settings.participant': 'Participant {number}',
    'settings.name.placeholder': 'Enter name',
    'settings.color.select': 'Select color',
    'settings.min.people.error': 'At least 2 people required',
    'settings.guide.1': 'Select number of people',
    'settings.guide.2': 'You can enter participant names',
    'settings.guide.3': 'Choose color for each participant',
    
    // Result page
    'result.title': 'Division Result',
    'result.description': 'Pizza divided into {count} equal pieces',
    'result.points': 'Division Points',
    'result.cut.along': 'Cut along the guides',
    'result.equal.size': 'Make each piece equal size',
    'result.center.align': 'Align with center precisely',
    'result.next.step': 'Take a photo after cutting!',
    
    // Evaluate page
    'evaluate.title': 'Post-Division Evaluation',
    'evaluate.description': 'Take a photo of the cut pizza to evaluate accuracy',
    'evaluate.instruction.1': 'Take a photo of the cut pizza',
    'evaluate.instruction.2': 'to evaluate division accuracy',
    'evaluate.preparation': 'Post-Division Photo Setup',
    'evaluate.select.method': 'Select capture method',
    
    // Score page
    'score.title': 'Fairness Score',
    'score.description': 'Pizza division fairness evaluated',
    'score.fairness': 'Fairness',
    'score.percent': '{score}%',
    'score.message.perfect': 'Perfect division!',
    'score.message.excellent': 'Excellent division!',
    'score.message.good': 'Good division!',
    'score.message.fair': 'Fair division',
    'score.message.poor': 'Keep practicing',
    'score.comparison': 'Before/After Comparison',
    'score.before': 'Before',
    'score.after': 'After',
    
    // Roulette page
    'roulette.title': 'Who Chooses First?',
    'roulette.description': 'Let\'s decide the order with roulette!',
    'roulette.instruction': 'Tap to spin the roulette',
    'roulette.result': '{name} goes first!',
    'roulette.order.result': 'Selection order decided!',
    'roulette.position': 'Position {position}',
    
    // Group photo page
    'group-photo.title': 'Group Photo',
    'group-photo.subtitle': 'Group Photo',
    'group-photo.description': 'Take a commemorative photo together',
    'group-photo.instruction.1': 'Gather around the pizza',
    'group-photo.instruction.2': 'for a commemorative photo!',
    'group-photo.preparation': 'Photo Setup',
    'group-photo.completed': 'Pizza division completed',
    'group-photo.take.photo': 'Take a group photo together',
    'group-photo.guide': 'Everyone get in the frame for the photo',
    'group-photo.processing': 'Analyzing emotions...',
    
    // Bill split page
    'bill-split.title': 'Bill Split',
    'bill-split.description': 'Calculate payment based on emotions',
    'bill-split.total.amount': 'Total Amount',
    'bill-split.amount.placeholder': 'Enter amount',
    'bill-split.based.on.happiness': 'Split based on happiness',
    'bill-split.assign.faces': 'Assign Names to Faces',
    'bill-split.assign.instruction': 'Tap each face to assign a name',
    'bill-split.emotion': 'Emotion',
    'bill-split.payment': 'Payment',
    'bill-split.assign.name': 'Assign Name',
    'bill-split.face.image': 'Face {number}',
    'bill-split.total': 'Total',
    'bill-split.currency': '¥',
    
    // Complete page
    'complete.title': 'Complete!',
    'complete.description': 'Pizza division completed',
    'complete.thank.you': 'Great job!',
    'complete.enjoy': 'Enjoy your delicious pizza',
    'complete.memories': 'Great memories made',
    
    // Image upload
    'upload.title': 'Upload Image',
    'upload.description': 'Select file or drag & drop',
    'upload.formats': 'Formats: JPEG, PNG, WebP',
    'upload.max.size': 'Max size: 10MB',
    'upload.resolution': 'Recommended: 200x200px or higher',
    'upload.processing': 'Processing image...',
    'upload.select.file': 'Select File',
    
    // Loading messages
    'loading.calculating': 'Calculating division lines...',
    'loading.analyzing': 'Analyzing topping positions',
    
    // Error messages
    'error.title': 'An error occurred',
    'error.no_image_data': 'Image data not found',
    'error.parse_results': 'Failed to parse division results',
    'error.load_results': 'Failed to load division results',
    'error.image-save': 'Failed to save image',
    'error.min-people': 'At least 2 people required',
    'error.camera': 'Camera error occurred',
    'error.file.format': 'Unsupported file format. Please select {formats} format.',
    'error.file.size': 'File too large. Please select file under 10MB.',
    'error.resolution': 'Image resolution too low. Please select image over 200x200 pixels.',
    'error.processing': 'Failed to process image.',
    'error.load': 'Failed to load image.',
    'error.photo-save': 'Failed to save photo',
    'error.capture-failed': 'Capture failed.',
    'error.video-access': 'Could not access video element.',
    'error.max-people': 'Maximum {max} people allowed',
    'error.no-image-file': 'Image file information not found',
    'error.score-save': 'Failed to save score',
    'error.share-generate': 'Failed to generate image.',
    
    // Additional UI elements
    'ui.photographed-pizza': 'Photographed Pizza',
    'ui.participant': 'Participant',
    'ui.participant-number': 'Participant {number}',
    'ui.piece-value': 'Each Piece Value',
    'ui.piece': 'Piece',
    'ui.pizza-in-frame': 'Fit pizza in frame',
    'ui.loading': 'Loading...',
    'ui.analyzing': 'Analyzing...',
    'ui.processing': 'Processing...',
    
    // Sharing messages
    'share.title': '🍕 Fresh Pizza Distribution!',
    'share.subtitle': 'Bill split completed with GalaxyCutter!',
    'share.ai-calculation': '✨ Fair bill split by emotion recognition AI',
    'share.total-amount': '💰 Total: ¥{amount}',
    'share.participants': '👥 Participants: {participants}',
    'share.app-link': '🔗 https://galaxycutter.app',
    
    // Stub data names
    'stub.pizza-master': 'Pizza Master',
    'stub.salami-king': 'Salami King',
    'stub.cheese-lover': 'Cheese Lover',
    'stub.tomato-prince': 'Tomato Prince',
    
    // PizzaRouletteUI page
    'roulette.pizza.title': 'Let\'s decide how to share the pizza',
    'roulette.pizza.description': 'Decide who eats which part',
    'roulette.pizza.deciding': 'Deciding who eats where...',
    'roulette.pizza.decided': 'Division decided!',
    'roulette.pizza.assigned': 'Everyone\'s portion has been decided',
    'roulette.pizza.button.decide': 'Decide sharing together',
    'roulette.pizza.button.photo': 'Take a group photo',
    'roulette.pizza.button.restart': 'Decide again',
    'roulette.pizza.description.photo': 'Let\'s capture the pizza party moment!',
    
    // Ranking page
    'ranking.title': 'Ranking',
    'ranking.description': 'Top Score Ranking',
    'ranking.your.rank': 'Your Rank',
    'ranking.top.ranking': 'Top Ranking',
    'ranking.rank.position': 'Rank {rank}',
    'ranking.points': '{score} pts',
    'ranking.loading': 'Loading ranking...',
    'ranking.loading.description': 'Fetching latest scores',
    'ranking.error': 'An error occurred',
    'ranking.error.load': 'Failed to load ranking',
    'ranking.no.data': 'No ranking data yet',
    'ranking.no.data.description': 'Be the first to post a score!',
    'ranking.button.new.pizza': 'Divide New Pizza',
    'ranking.button.back.score': 'Back to Score',
    'ranking.about.title': 'About Ranking',
    'ranking.about.1': 'Scores evaluate division accuracy out of 100 points',
    'ranking.about.2': 'Top players achieve near-perfect division results',
    'ranking.about.3': 'Rankings are updated regularly',
    
    // Split bill page
    'split-bill.title': 'Bill Calculation',
    'split-bill.description': 'Calculated based on satisfaction from facial expressions',
    'split-bill.total.label': 'Total Amount (¥)',
    'split-bill.satisfaction': 'Satisfaction: {satisfaction}%',
    'split-bill.calculation': 'Calculation method:',
    'split-bill.calculation.desc1': 'Higher satisfaction means higher payment.',
    'split-bill.calculation.desc2': 'Pay for how much you enjoyed it - fair split!',
    'split-bill.button.complete': 'Complete',
    'split-bill.button.back': 'Back',
    
    // Share messages
    'share.success.mobile': '📱 Text copied and image downloaded!\n\n1. Paste text in Slack\n2. Attach the image',
    'share.success.image-download': '📱 Image downloaded!\n\nCopy this text and post to Slack:\n\n{message}',
    'share.success.clipboard': '💻 Image and text copied to clipboard!\nPaste in Slack.',
    'share.success.text-image': '💻 Text copied and image downloaded!\nPost both to Slack.',
    'share.error.copy': '⚠️ Copy failed. Please share manually.',
    'share.error.failed': 'Share failed: {error}',
    
    // App metadata
    'meta.description': 'App for fair pizza division',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ja');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('pizza-divider-language') as Language;
    if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('pizza-divider-language', lang);
    
    // Update document language
    document.documentElement.lang = lang;
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key;
    
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        translation = translation.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varValue));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};