// 颜色名 → hex 映射的单一数据源（合并 VariantSelector 与 ProductCard 两套实现）
// 支持英文 + 中文色名，支持渐变(多色)

const COLOR_HEX_MAP: Record<string, string> = {
  red: '#ef4444', '红': '#ef4444',
  blue: '#3b82f6', '蓝': '#3b82f6',
  navy: '#1e3a5f', '藏青': '#1e3a5f',
  'dark blue': '#1e3a5f',
  black: '#1f2937', '黑': '#1f2937',
  white: '#f9fafb', '白': '#f9fafb',
  green: '#22c55e', '绿': '#22c55e',
  yellow: '#eab308', '黄': '#eab308',
  pink: '#ec4899', '粉': '#ec4899',
  purple: '#a855f7', '紫': '#a855f7',
  orange: '#f97316', '橙': '#f97316',
  gold: '#d4af37', '金': '#d4af37',
  silver: '#c0c0c0', '银': '#c0c0c0',
  rose: '#f43f5e', '玫瑰金': '#f43f5e',
  brown: '#92400e', '棕': '#92400e',
  gray: '#6b7280', '灰': '#6b7280',
  grey: '#6b7280',
  beige: '#e7d4b5', '米': '#e7d4b5',
  khaki: '#b5a678',
  cream: '#fef3c7',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  multicolor: 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e,#eab308)',
  mixed: 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e,#eab308)',
  '彩色': 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e,#eab308)',
};

const FALLBACK_HEX = '#d1d5db';

// 完整匹配 + 包含匹配 + hex 直通。无匹配时返回 fallbackHex（默认灰）。
export function colorToHex(color?: string | null, fallbackHex: string = FALLBACK_HEX): string {
  if (!color) return fallbackHex;
  const lower = color.toLowerCase().trim();
  if (COLOR_HEX_MAP[lower]) return COLOR_HEX_MAP[lower];
  // 按键长度降序匹配，避免 "red" 误命中 "rose" 之类（此处用 includes 子串）
  const keys = Object.keys(COLOR_HEX_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return COLOR_HEX_MAP[key];
  }
  if (/^#[0-9a-f]{6}$/i.test(lower)) return lower;
  return fallbackHex;
}

// 返回 null 表示无匹配（用于需要区分"有/无色板"的场景）
export function getColorHex(color?: string | null): string | null {
  if (!color) return null;
  const hex = colorToHex(color, '');
  return hex === '' ? null : hex;
}

export { COLOR_HEX_MAP, FALLBACK_HEX };
