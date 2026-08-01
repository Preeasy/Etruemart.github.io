// 站点全局配置 —— 单一数据源，避免多处硬编码不一致
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://etruemart.vercel.app';
export const SITE_NAME = 'eTrue Mark';
export const SITE_DESCRIPTION =
  'Wholesale jewelry, accessories & crafts direct from Yiwu factories. Low MOQ, factory-direct pricing, global shipping. Trusted B2B sourcing platform.';
export const SITE_PHONE = '+86-579-85000000';
export const SITE_EMAIL = 'sales@etruemark.com';
export const SITE_WHATSAPP = '+86 15988516408';
export const SITE_COMPANY = 'Yiwu Yeatru Trading Co., Ltd.';
export const SITE_ADDRESS = 'Yiwu International Trade City, Chouzhou Road, Yiwu, Zhejiang 322000, China';
export const SITE_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
