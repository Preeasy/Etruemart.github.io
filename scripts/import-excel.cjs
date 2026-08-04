const XLSX =const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

constconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garmentconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Giftconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/imagesconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-setconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpgconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_00const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramicconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kidsconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (nameconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: {const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin userconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.logconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categoriesconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetNameconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basenameconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  letconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i =const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = rowconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = rowconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || ''const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categoryconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categorySlug}" not found in database`);
      }

      const keywords = JSON.stringify([const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categorySlug}" not found in database`);
      }

      const keywords = JSON.stringify([nameEN, nameCN, categoryL1, categoryL2, sku].filter(Booleanconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categorySlug}" not found in database`);
      }

      const keywords = JSON.stringify([nameEN, nameCN, categoryL1, categoryL2, sku].filter(Boolean));
      const slug = generateSlug(nameEN, sku);
      const defaultImageconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categorySlug}" not found in database`);
      }

      const keywords = JSON.stringify([nameEN, nameCN, categoryL1, categoryL2, sku].filter(Boolean));
      const slug = generateSlug(nameEN, sku);
      const defaultImage = DEFAULT_IMAGES[categorySlug] || '/images/products/v2_test1.jpg';

const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categorySlug}" not found in database`);
      }

      const keywords = JSON.stringify([nameEN, nameCN, categoryL1, categoryL2, sku].filter(Boolean));
      const slug = generateSlug(nameEN, sku);
      const defaultImage = DEFAULT_IMAGES[categorySlug] || '/images/products/v2_test1.jpg';

      const description = `${nameEN}\n\n${nameCN ? '中文名: ' + nameconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categorySlug}" not found in database`);
      }

      const keywords = JSON.stringify([nameEN, nameCN, categoryL1, categoryL2, sku].filter(Boolean));
      const slug = generateSlug(nameEN, sku);
      const defaultImage = DEFAULT_IMAGES[categorySlug] || '/images/products/v2_test1.jpg';

      const description = `${nameEN}\n\n${nameCN ? '中文名: ' + nameCN + '\n\n' : ''}SKU: ${sku}\n分类: ${categoryconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categorySlug}" not found in database`);
      }

      const keywords = JSON.stringify([nameEN, nameCN, categoryL1, categoryL2, sku].filter(Boolean));
      const slug = generateSlug(nameEN, sku);
      const defaultImage = DEFAULT_IMAGES[categorySlug] || '/images/products/v2_test1.jpg';

      const description = `${nameEN}\n\n${nameCN ? '中文名: ' + nameCN + '\n\n' : ''}SKU: ${sku}\n分类: ${categoryL1} / ${categoryL2}\n最小起订量: ${moq} pconst XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

const CATEGORY_MAP = {
  'Fashion Jewelry': 'fashion-jewelry',
  'Garment Accessories': 'garment-accessories',
  'Bag Accessories': 'accessories',
  'Hair Accessories': 'accessories',
  'Toys & Gift': 'toys',
  'Home Decor & Crafts': 'home-decor-crafts',
};

const DEFAULT_IMAGES = {
  'fashion-jewelry': '/images/products/v2_boho-jewelry-set.jpg',
  'garment-accessories': '/images/products/v2_cotton-lace-trim.jpg',
  'accessories': '/images/products/v2_pearl-bracelet.jpg',
  'bags': '/images/products/v3_wallet_043_002.jpg',
  'home-decor-crafts': '/images/products/v2_ceramic-vase-elegant.jpg',
  'toys': '/images/products/v2_kids-party-favor-set.jpg',
  'gift': '/images/products/v2_christmas-gift-box.jpg',
};

function toNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
}

function generateSlug(name, sku) {
  const base = (name || sku || 'product')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
  const suffix = sku ? `-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return (base + suffix).substring(0, 100);
}

async function importExcel(excelPath) {
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    process.exit(1);
  }
  console.log('Found admin user:', admin.email);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log('Loaded', categories.length, 'categories');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  console.log('\nExcel file:', path.basename(excelPath));
  console.log('Sheet name:', sheetName);
  console.log('Total products to import:', rows.length);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2;
    try {
      const sku = row['SKU']?.toString()?.trim() || '';
      const nameCN = row['Product Name (CN)']?.toString()?.trim() || '';
      const nameEN = row['Product Name (EN)']?.toString()?.trim() || nameCN || `Product ${sku}`;
      const moq = toNumber(row['MOQ'], 1);
      const priceMin = toNumber(row['Price (Min)'], 0);
      const priceMax = toNumber(row['Price (Max)'], priceMin);
      const categoryL1 = row['Category L1']?.toString()?.trim() || '';
      const categoryL2 = row['Category L2']?.toString()?.trim() || '';

      if (!nameEN || !sku) {
        throw new Error(`Missing required fields: SKU or Product Name`);
      }

      let categorySlug = CATEGORY_MAP[categoryL1] || '';
      if (!categorySlug) {
        throw new Error(`Unknown category: "${categoryL1}"`);
      }
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        throw new Error(`Category slug "${categorySlug}" not found in database`);
      }

      const keywords = JSON.stringify([nameEN, nameCN, categoryL1, categoryL2, sku].filter(Boolean));
      const slug = generateSlug(nameEN, sku);
      const defaultImage = DEFAULT_IMAGES[categorySlug] || '/images/products/v2_test1.jpg';

      const description = `${nameEN}\n\n${nameCN ? '中文名: ' + nameCN + '\n\n' : ''}SKU: ${sku}\n分类: ${categoryL1} / ${categoryL2}\n最小起订量: ${moq} pcs\n\n高品质批发产品，直接来自义乌市场。\n\nHigh quality wholesale product direct