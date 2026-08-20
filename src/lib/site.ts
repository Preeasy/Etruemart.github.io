// 站点全局配置 —— 单一数据源，避免多处硬编码不一致
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://etruemart.vercel.app';
export const SITE_NAME = 'eTrue Mart';
export const SITE_DESCRIPTION =
  'Wholesale jewelry, accessories & crafts direct from Yiwu factories. Low MOQ, factory-direct pricing, global shipping. Trusted B2B sourcing platform.';
export const SITE_PHONE = '+86 18767960499';
export const SITE_EMAIL = 'yeatrusourcing@gmail.com';
export const SITE_WHATSAPP = '+86 18767960499';
export const SITE_COMPANY = 'Yiwu Yichu Trading Co., Ltd.';
export const SITE_COMPANY_CN = '义乌弋楚贸易有限公司';
export const SITE_ADDRESS = 'Yiwu, Zhejiang, China';
export const SITE_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// 业务常量 —— 单一数据源，避免 cart/checkout/详情页各自硬编码产生漂移
export const TAX_RATE = 0.08; // 8% 销售税（演示用）
export const FREE_SHIPPING_THRESHOLD = 50; // 满 $50 免运
export const FREE_SHIPPING_COST = 5.99; // 未达免运门槛时的运费
export const DEFAULT_MOQ = 12; // 默认最小起订量
export const DEFAULT_STOCK_FALLBACK = 9999; // 库存兜底值
export const MAX_PRICE_FILTER = 999; // 价格筛选上限
