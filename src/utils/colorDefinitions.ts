// カラー定義を一元管理
export const COLOR_DEFINITIONS = {
  red: { hex: "#ef4444", name: "red" },
  blue: { hex: "#3b82f6", name: "blue" },
  green: { hex: "#10b981", name: "green" },
  purple: { hex: "#a855f7", name: "purple" },
  orange: { hex: "#f59e0b", name: "orange" },
  cyan: { hex: "#06b6d4", name: "cyan" },
  pink: { hex: "#ec4899", name: "pink" },
  yellow: { hex: "#eab308", name: "yellow" }
};

// 利用可能な色名の配列
export const AVAILABLE_COLOR_NAMES = Object.values(COLOR_DEFINITIONS).map(c => c.name);

// HEXカラーから色名への変換マップ
export const HEX_TO_COLOR_NAME: { [hex: string]: string } = Object.values(COLOR_DEFINITIONS).reduce(
  (acc, color) => ({ ...acc, [color.hex]: color.name }),
  {}
);

// 利用可能な色のHEX配列（順番固定）
export const AVAILABLE_COLORS_HEX = [
  COLOR_DEFINITIONS.red.hex,
  COLOR_DEFINITIONS.blue.hex,
  COLOR_DEFINITIONS.green.hex,
  COLOR_DEFINITIONS.purple.hex,
  COLOR_DEFINITIONS.orange.hex,
  COLOR_DEFINITIONS.cyan.hex,
  COLOR_DEFINITIONS.pink.hex,
  COLOR_DEFINITIONS.yellow.hex,
];