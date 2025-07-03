'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AVAILABLE_COLORS_HEX, COLOR_DEFINITIONS } from '@/utils/colorDefinitions';

export default function SettingsPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [participants, setParticipants] = useState([
    { id: 1, name: "", color: AVAILABLE_COLORS_HEX[0], active: true },
    { id: 2, name: "", color: AVAILABLE_COLORS_HEX[1], active: true },
  ]);
  const [isCalculating, setIsCalculating] = useState(false);
  const maxParticipants = 20;

  useEffect(() => {
    const savedImage = localStorage.getItem('pizzaImage');
    if (!savedImage) {
      router.push('/camera');
      return;
    }
    setImageUrl(savedImage);
  }, [router]);

  const handleNameChange = (id: number, name: string) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, name, active: name.trim() !== "" } : p)
    );
  };

  const addParticipant = () => {
    if (participants.length >= maxParticipants) {
      alert(`最大${maxParticipants}人までです`);
      return;
    }
    
    const newId = Math.max(...participants.map(p => p.id)) + 1;
    const usedColors = participants.map(p => p.color);
    const availableColor = AVAILABLE_COLORS_HEX.find(color => !usedColors.includes(color)) 
      || AVAILABLE_COLORS_HEX[participants.length % AVAILABLE_COLORS_HEX.length];
    
    setParticipants([...participants, {
      id: newId,
      name: "",
      color: availableColor,
      active: false
    }]);
  };

  const removeParticipant = (id: number) => {
    if (participants.filter(p => p.active).length <= 2) {
      alert('最低2人は必要です');
      return;
    }
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const getActiveParticipants = () => {
    return participants.filter(p => p.active && p.name.trim() !== "");
  };

  const handleCalculateDivision = async () => {
    const activeParticipants = getActiveParticipants();
    
    if (activeParticipants.length < 2) {
      alert('最低2人の参加者が必要です');
      return;
    }
    
    setIsCalculating(true);
    
    try {
      localStorage.setItem('peopleCount', activeParticipants.length.toString());
      localStorage.setItem('participants', JSON.stringify(activeParticipants));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      router.push('/result');
    } catch (error) {
      console.error('Division calculation error:', error);
      alert('分割線の計算に失敗しました');
    } finally {
      setIsCalculating(false);
    }
  };


  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">画像を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-orange-500 p-4">
            <h1 className="text-white text-xl font-bold text-center">分割設定</h1>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">撮影したピザ</h2>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-gray-100">
                <img
                  src={imageUrl}
                  alt="撮影したピザ"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">参加者</h2>
                  <p className="text-sm text-gray-600">
                    {getActiveParticipants().length}人 / 最大{maxParticipants}人
                  </p>
                </div>
                <button
                  onClick={addParticipant}
                  disabled={participants.length >= maxParticipants}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${participants.length >= maxParticipants
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }
                  `}
                >
                  + 参加者を追加
                </button>
              </div>
              
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div 
                    key={participant.id} 
                    className={`flex items-center gap-3 transition-all duration-200 ${
                      participant.active ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 text-white rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-md"
                      style={{ backgroundColor: participant.color }}
                    >
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={participant.name}
                      onChange={(e) => handleNameChange(participant.id, e.target.value)}
                      placeholder={`参加者${index + 1}のニックネーム`}
                      className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white font-medium"
                      style={{ 
                        borderColor: participant.active ? participant.color : '#e5e7eb',
                        '--tw-ring-color': participant.color + '40', // 25% transparency
                      } as React.CSSProperties}
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: participant.color }}
                        />
                        <span className="text-xs text-gray-500 hidden sm:inline">
                          {Object.entries(COLOR_DEFINITIONS).find(([, def]) => def.hex === participant.color)?.[0] || 'custom'}
                        </span>
                      </div>
                      {participants.length > 2 && (
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                          title="削除"
                        >
                          <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {participants.length < maxParticipants && (
                <button
                  onClick={addParticipant}
                  className="w-full mt-3 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all duration-200"
                >
                  + 参加者を追加
                </button>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCalculateDivision}
                disabled={isCalculating || getActiveParticipants().length < 2}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200
                  ${isCalculating || getActiveParticipants().length < 2
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 active:scale-95'
                  }
                  text-white shadow-lg min-h-[60px] flex items-center justify-center
                `}
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    計算中...
                  </>
                ) : getActiveParticipants().length < 2 ? (
                  '最低2人の参加者が必要です'
                ) : (
                  `${getActiveParticipants().length}人で分割する`
                )}
              </button>

              <Link href="/camera">
                <button className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  撮り直す
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}