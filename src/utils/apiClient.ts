import {
  CalculateIdealCutResponse,
  CalculateScoreResponse,
  RankingResponse,
  SaveScoreResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9000";

// File to base64 conversion utility
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 1. 理想的な切り方を計算
export const calculateIdealCut = async (
  image: File,
  numPieces: number
): Promise<CalculateIdealCutResponse> => {
  // スタブ実装 - 実際のAPIは未実装
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // ダミーSVGを生成（800x800の正方形）
  const centerX = 400;
  const centerY = 400;
  const radius = 360;

  let svgPaths = "";
  const angleStep = (2 * Math.PI) / numPieces;

  for (let i = 0; i < numPieces; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const endX = centerX + Math.cos(angle) * radius;
    const endY = centerY + Math.sin(angle) * radius;

    svgPaths += `<line x1="${centerX}" y1="${centerY}" x2="${endX}" y2="${endY}" stroke="#FF6B35" stroke-width="6" stroke-linecap="round" />`;
  }

  // サラミ位置のダミーデータ（800x800スケール）
  const salamiCircles = [
    '<circle cx="240" cy="300" r="16" fill="#C5282F" stroke="#FFFFFF" stroke-width="4" />',
    '<circle cx="560" cy="200" r="16" fill="#C5282F" stroke="#FFFFFF" stroke-width="4" />',
    '<circle cx="400" cy="440" r="16" fill="#C5282F" stroke="#FFFFFF" stroke-width="4" />',
    '<circle cx="320" cy="180" r="16" fill="#C5282F" stroke="#FFFFFF" stroke-width="4" />',
    '<circle cx="640" cy="360" r="16" fill="#C5282F" stroke="#FFFFFF" stroke-width="4" />',
    '<circle cx="160" cy="400" r="16" fill="#C5282F" stroke="#FFFFFF" stroke-width="4" />',
    '<circle cx="480" cy="320" r="16" fill="#C5282F" stroke="#FFFFFF" stroke-width="4" />',
    '<circle cx="360" cy="560" r="16" fill="#C5282F" stroke="#FFFFFF" stroke-width="4" />',
  ].join("");

  const svg = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    ${svgPaths}
    ${salamiCircles}
  </svg>`;

  /*
  // 実際のAPI呼び出し（未実装時はコメントアウト）
  try {
    const base64Image = await fileToBase64(image);
    
    const response = await fetch(`${API_BASE_URL}/api/calculate-ideal-cut`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        num_pieces: numPieces
      } as CalculateIdealCutRequest)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json() as CalculateIdealCutResponse;
  } catch (error) {
    console.error('Calculate ideal cut error:', error);
    throw error;
  }
  */

  return { svg };
};

// 2. スコア計算
export const calculateScore = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _actualImage: File,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _idealImage: File
): Promise<CalculateScoreResponse> => {
  // スタブ実装 - 実際のAPIは未実装
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const score = Math.floor(Math.random() * 40) + 60; // 60-100のランダムスコア

  /*
  // 実際のAPI呼び出し（未実装時はコメントアウト）
  try {
    const actualBase64 = await fileToBase64(actualImage);
    const idealBase64 = await fileToBase64(idealImage);
    
    const response = await fetch(`${API_BASE_URL}/api/calculate-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actual_image: actualBase64,
        ideal_image: idealBase64
      } as CalculateScoreRequest)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json() as CalculateScoreResponse;
  } catch (error) {
    console.error('Calculate score error:', error);
    throw error;
  }
  */

  return { score };
};

// 3. スコア保存
export const saveScore = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _accountName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _uuid: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _score: number
): Promise<SaveScoreResponse> => {
  // スタブ実装 - 実際のAPIは未実装
  await new Promise((resolve) => setTimeout(resolve, 800));

  /*
  // 実際のAPI呼び出し（未実装時はコメントアウト）
  try {
    const response = await fetch(`${API_BASE_URL}/api/save-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_name: accountName,
        uuid: uuid,
        score: score
      } as SaveScoreRequest)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json() as SaveScoreResponse;
  } catch (error) {
    console.error('Save score error:', error);
    throw error;
  }
  */

  return { success: true };
};

// 4. ランキング取得
export const getRanking = async (): Promise<RankingResponse> => {
  // スタブ実装 - 実際のAPIは未実装
  await new Promise((resolve) => setTimeout(resolve, 600));

  const dummyRanking = [
    { rank: 1, account_name: "ピザマスター", score: 98.5 },
    { rank: 2, account_name: "サラミ王", score: 92.0 },
    { rank: 3, account_name: "カット職人", score: 89.5 },
    { rank: 4, account_name: "均等太郎", score: 87.2 },
    { rank: 5, account_name: "分割花子", score: 84.8 },
  ];

  /*
  // 実際のAPI呼び出し（未実装時はコメントアウト）
  try {
    const response = await fetch(`${API_BASE_URL}/api/ranking`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json() as RankingResponse;
  } catch (error) {
    console.error('Get ranking error:', error);
    throw error;
  }
  */

  return { ranking: dummyRanking };
};

// UUID生成ユーティリティ
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ユーザー登録API
export const userApi = {
  async createUserRecord(data: { account: string; score: number }) {
    console.log("Attempting to create user record:", data);
    console.log("API_BASE_URL:", API_BASE_URL);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-records/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: data.account,
          score: data.score,
        }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("User record created successfully:", result);
      return result;
    } catch (error) {
      console.error("User record creation error:", error);

      // ネットワークエラーの場合の詳細情報
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("Network error - please check:");
        console.error("1. Backend server is running on", API_BASE_URL);
        console.error("2. CORS is properly configured");
        console.error("3. Endpoint /api/user-records/ exists");
      }

      throw error;
    }
  },
};
