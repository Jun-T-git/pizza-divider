import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="text-8xl mb-6">🍕</div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ピザカッター
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          サラミの価値で等分する<br />
          ピザ分割補助アプリ
        </p>
        
        <Link href="/camera">
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[60px] flex items-center justify-center gap-3 w-full">
            <span className="text-2xl">📷</span>
            ピザを撮影する
          </button>
        </Link>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>撮影 → 設定 → 分割線表示</p>
        </div>
      </div>
    </div>
  );
}
