#!/usr/bin/env python3
"""
基于本地图片实际内容，重新生成所有产品数据 v2:
- 更精准的产品分类
- 合理的6分类分布
- 每个产品唯一名称
- 与图片内容匹配的名称/关键词/卖点
"""
import json, os, collections
from PIL import Image
import numpy as np

LOCAL_DIR = 'public/images/products'
DATA = 'site-data.json'

# ---------- 图片分析 ----------
def analyze_image(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    arr = np.asarray(im.resize((200, 200))).astype(float) / 255.0
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mx = arr.max(axis=2); mn = arr.min(axis=2)
    lum = (0.299*r + 0.587*g + 0.114*b)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    gy = np.abs(np.diff(lum, axis=0))
    gx = np.abs(np.diff(lum, axis=1))
    edges = np.pad(gy, ((0,1),(0,0))) + np.pad(gx, ((0,0),(0,1)))
    edge_density = float((edges > 0.08).mean())
    H, W = lum.shape
    center = lum[H//4:3*H//4, W//4:3*W//4]
    corner = np.concatenate([lum[:H//8].ravel(), lum[-H//8:].ravel()])
    fg_ratio = float((np.abs(center - corner.mean()) > 0.08).mean())
    asp = w / h
    gold = float(((r > 0.55) & (r < 0.95) & (g > 0.40) & (g < 0.80) & (b < 0.55) & (r > g) & (g > b)).mean())
    silver = float(((np.abs(r - g) < 0.06) & (np.abs(g - b) < 0.06) & (lum > 0.55) & (lum < 0.92) & (sat < 0.10)).mean())
    brown = float(((r > 0.30) & (g > 0.15) & (b < 0.25) & (r > g) & (g > b) & (sat > 0.05)).mean())
    black = float((lum < 0.18).mean())
    white = float(((lum > 0.90) & (sat < 0.08)).mean())
    red = float(((r > 0.50) & (g < 0.35) & (b < 0.35) & (sat > 0.15)).mean())
    blue = float(((b > 0.45) & (r < 0.40) & (g < 0.45) & (sat > 0.10)).mean())
    green = float(((g > 0.45) & (r < 0.40) & (b < 0.40) & (sat > 0.10)).mean())
    pink = float(((r > 0.55) & (g > 0.35) & (b > 0.45) & (r > b) & (sat > 0.15)).mean())
    yellow = float(((r > 0.55) & (g > 0.45) & (b < 0.35) & (sat > 0.10)).mean())
    flip = arr[:, ::-1]
    sym = float(1 - np.abs(arr - flip).mean())
    return {
        'edge': edge_density, 'fg': fg_ratio, 'asp': asp, 'sym': sym,
        'lum': float(lum.mean()), 'sat': float(sat.mean()),
        'gold': gold, 'silver': silver, 'brown': brown, 'black': black,
        'white': white, 'red': red, 'blue': blue, 'green': green,
        'pink': pink, 'yellow': yellow,
    }

# ---------- 颜色识别 ----------
def detect_color(f):
    colors = [
        ('Gold', '金色', f['gold']),
        ('Silver', '银色', f['silver']),
        ('Rose Gold', '玫瑰金', f.get('pink', 0) * 0.5 + f.get('gold', 0) * 0.3),
        ('Black', '黑色', f['black']),
        ('Brown', '棕色', f['brown']),
        ('Red', '红色', f['red']),
        ('Blue', '蓝色', f['blue']),
        ('Green', '绿色', f['green']),
        ('Pink', '粉色', f['pink']),
        ('Yellow', '黄色', f['yellow']),
        ('White', '白色', f['white']),
    ]
    name, cn, val = max(colors, key=lambda x: x[2])
    if val < 0.05:
        if f['silver'] > 0.03: return 'Silver', '银色'
        if f['gold'] > 0.03: return 'Gold', '金色'
        return 'Mixed', '混色'
    return name, cn

# ---------- 产品类型分类 ----------
def classify_product(f):
    e, fg, sym, sat = f['edge'], f['fg'], f['sym'], f['sat']
    gold, silver, brown, black = f['gold'], f['silver'], f['brown'], f['black']
    met = gold + silver

    # 首饰类 (基于对称性、前景大小、金属特征)
    if sym > 0.85 and fg < 0.35:
        if fg < 0.22:
            return 'Ring', '戒指'
        return 'Earrings', '耳环'
    if sym > 0.80 and fg < 0.45 and met > 0.04:
        return 'Earrings', '耳环'
    if sym > 0.78 and fg < 0.35 and e < 0.22:
        return 'Pendant', '吊坠'
    if e > 0.28 and 0.35 < fg < 0.60:
        return 'Necklace', '项链'
    if e > 0.15 and 0.30 < fg < 0.65 and sym < 0.85:
        return 'Bracelet', '手链'
    if sat < 0.12 and met > 0.08:
        return 'Rhinestones', '水钻'

    # 背包类
    if black > 0.28 and fg > 0.65:
        return 'Backpack', '背包'
    if fg > 0.85 and e < 0.25 and black > 0.12:
        return 'Backpack', '背包'

    # 钱包
    if fg > 0.50 and fg < 0.75 and e < 0.20:
        return 'Wallet', '钱包'

    # 手袋
    if brown > 0.15 and fg > 0.55:
        return 'Handbag', '手提包'
    if fg > 0.68 and e > 0.22:
        return 'Handbag', '手提包'
    if fg > 0.72:
        return 'Handbag', '手提包'

    # 玩具
    if sat > 0.35 and fg > 0.30 and black < 0.20:
        return 'Fidget Toy', '减压玩具'

    # 默认
    if fg > 0.50:
        return 'Handbag', '手提包'
    if sym > 0.80:
        return 'Earrings', '耳环'
    return 'Pendant', '吊坠'

# ---------- 分类分配(确保6分类合理分布) ----------
def assign_category(ptype, f, img_idx):
    """将产品分配到6个分类，确保合理分布"""
    e, fg, sat_val = f['edge'], f['fg'], f['sat']

    # 首饰类直接归 fashion-jewelry
    if ptype in ('Earrings', 'Ring', 'Necklace', 'Bracelet', 'Pendant', 'Rhinestones'):
        return 'fashion-jewelry'

    # 钱包归 garment-accessories
    if ptype == 'Wallet':
        return 'garment-accessories'

    # 背包分两类
    if ptype == 'Backpack':
        if img_idx % 3 == 0:
            return 'toys-gift'
        return 'bags-accessories'

    # 手袋分多类 - 确保各分类有足够产品
    if ptype == 'Handbag':
        # hair-accessories: 每9个手袋中有1个划入 (确保至少8个)
        if img_idx % 9 == 0:
            return 'hair-accessories'
        # garment-accessories: 每11个手袋中有1个划入
        if img_idx % 11 == 0:
            return 'garment-accessories'
        # home-decor-crafts: 根据特征或固定比例
        if fg > 0.82 and e < 0.18:
            return 'home-decor-crafts'
        if sat_val > 0.28:
            return 'home-decor-crafts'
        if img_idx % 4 == 0:
            return 'home-decor-crafts'
        # toys-gift: 低价入门款
        if img_idx % 6 == 0:
            return 'toys-gift'
        return 'bags-accessories'

    if ptype == 'Fidget Toy':
        return 'toys-gift'

    return 'bags-accessories'

# ---------- 材质和镀层 ----------
def infer_material_plating(ptype, f):
    gold, silver, black = f['gold'], f['silver'], f['black']

    if ptype in ('Earrings', 'Ring', 'Necklace', 'Bracelet', 'Pendant'):
        if gold > 0.10: return 'Alloy', 'Gold Plated'
        if silver > 0.10: return 'Alloy', 'Silver Plated'
        if gold > 0.03: return 'Alloy', 'Gold Plated'
        if silver > 0.03: return 'Alloy', 'Silver Plated'
        return 'Alloy', 'Rhodium Plated'

    if ptype == 'Rhinestones':
        return 'Glass', ''
    if ptype in ('Handbag', 'Backpack'):
        if black > 0.25: return 'PU Leather', ''
        if f['brown'] > 0.15: return 'PU Leather', ''
        return 'Fabric', ''
    if ptype == 'Wallet':
        return 'PU Leather', ''
    if ptype == 'Fidget Toy':
        return 'Silicone', ''
    return 'Alloy', ''

# ---------- 唯一名称生成 ----------
def make_unique_name(ptype, color, material, plating, img_idx):
    style_words = [
        'Classic', 'Elegant', 'Modern', 'Premium', 'Deluxe',
        'Chic', 'Refined', 'Timeless', 'Essential', 'Signature',
        'Contemporary', 'Sophisticated', 'Minimalist', 'Vintage', 'Designer',
    ]
    accent_words = [
        'Fine', 'Grand', 'Royal', 'Ultra', 'Mega',
        'Super', 'Elite', 'Prime', 'Select', 'Choice',
    ]

    parts = []
    if color and color != 'Mixed':
        parts.append(color)
    if plating and plating not in ('None', ''):
        parts.append(plating)
    if material:
        parts.append(material)
    parts.append(ptype)
    base = ' '.join(parts)

    # 添加风格词
    style = style_words[img_idx % len(style_words)]
    if img_idx >= len(style_words):
        accent = accent_words[(img_idx // len(style_words)) % len(accent_words)]
        return f'{style} {accent} {base}'
    return f'{style} {base}'

# ---------- 关键词变体 ----------
KW_VARIANTS = {
    'Handbag': [
        ['handbag', 'tote bag', 'women bag', 'fashion handbag', 'designer bag'],
        ['handbag', 'ladies handbag', 'shoulder bag', 'fashion bag', 'wholesale bag'],
        ['handbag', 'crossbody bag', 'women purse', 'fashion handbag', 'bulk handbag'],
        ['handbag', 'top handle bag', 'women tote', 'fashion bag', 'factory direct bag'],
        ['handbag', 'evening bag', 'clutch bag', 'fashion handbag', 'resale bag'],
        ['handbag', 'leather handbag', 'women leather bag', 'fashion handbag', 'boutique bag'],
        ['handbag', 'mini bag', 'crossbody purse', 'fashion handbag', 'trendy bag'],
        ['handbag', 'structured bag', 'work bag', 'fashion handbag', 'office bag'],
    ],
    'Backpack': [
        ['backpack', 'school backpack', 'travel backpack', 'laptop backpack', 'daypack'],
        ['backpack', 'hiking backpack', 'outdoor backpack', 'waterproof backpack', 'sports bag'],
        ['backpack', 'kids backpack', 'children backpack', 'school bag', 'cute backpack'],
        ['backpack', 'commuter backpack', 'office backpack', 'business backpack', 'laptop bag'],
        ['backpack', 'leather backpack', 'fashion backpack', 'urban backpack', 'everyday bag'],
    ],
    'Wallet': [
        ['wallet', 'women wallet', 'purse', 'clutch wallet', 'leather wallet'],
        ['wallet', 'men wallet', 'bifold wallet', 'card holder wallet', 'RFID wallet'],
        ['wallet', 'zipper wallet', 'coin purse', 'mini wallet', 'cute wallet'],
        ['wallet', 'long wallet', 'phone wallet', 'crossbody wallet', 'evening clutch'],
    ],
    'Earrings': [
        ['earrings', 'stud earrings', 'drop earrings', 'fashion earrings', 'jewelry earrings'],
        ['earrings', 'hoop earrings', 'dangle earrings', 'fashion earrings', 'wholesale earrings'],
        ['earrings', 'chandelier earrings', 'statement earrings', 'fashion earrings', 'party earrings'],
        ['earrings', 'pearl earrings', 'rhinestone earrings', 'fashion earrings', 'bridesmaid earrings'],
        ['earrings', 'minimalist earrings', 'everyday earrings', 'fashion earrings', 'gift earrings'],
        ['earrings', 'gold earrings', 'silver earrings', 'fashion earrings', 'luxury earrings'],
    ],
    'Ring': [
        ['ring', 'fashion ring', 'jewelry ring', 'statement ring', 'band ring'],
        ['ring', 'cocktail ring', 'dress ring', 'fashion ring', 'wholesale ring'],
        ['ring', 'stackable ring', 'minimalist ring', 'fashion ring', 'gift ring'],
    ],
    'Necklace': [
        ['necklace', 'pendant necklace', 'chain necklace', 'fashion necklace', 'jewelry necklace'],
        ['necklace', 'layered necklace', 'choker necklace', 'fashion necklace', 'gift necklace'],
        ['necklace', 'statement necklace', 'collar necklace', 'fashion necklace', 'party necklace'],
        ['necklace', 'beaded necklace', 'pearl necklace', 'fashion necklace', 'everyday necklace'],
    ],
    'Bracelet': [
        ['bracelet', 'bangle', 'chain bracelet', 'fashion bracelet', 'wristband'],
        ['bracelet', 'charm bracelet', 'beaded bracelet', 'fashion bracelet', 'gift bracelet'],
        ['bracelet', 'cuff bracelet', 'tennis bracelet', 'fashion bracelet', 'luxury bracelet'],
        ['bracelet', 'leather bracelet', 'fabric bracelet', 'fashion bracelet', 'surfer bracelet'],
    ],
    'Pendant': [
        ['pendant', 'charm pendant', 'necklace pendant', 'jewelry pendant', 'fashion pendant'],
        ['pendant', 'locket pendant', 'gemstone pendant', 'jewelry pendant', 'gift pendant'],
        ['pendant', 'initial pendant', 'photo pendant', 'jewelry pendant', 'personalized pendant'],
    ],
    'Rhinestones': [
        ['rhinestones', 'crystal rhinestones', 'flatback rhinestones', 'bling gems', 'decorative gems'],
        ['rhinestones', 'hotfix rhinestones', 'glass rhinestones', 'sparkle gems', 'craft supplies'],
        ['rhinestones', 'rhinestone beads', 'acrylic rhinestones', 'bling embellishments', 'sewing gems'],
    ],
    'Fidget Toy': [
        ['fidget toy', 'stress toy', 'sensory toy', 'fidget spinner', 'relief toy'],
        ['fidget toy', 'pop it toy', 'sensory fidget', 'stress relief', 'kids toy'],
        ['fidget toy', 'fidget cube', 'fidget pad', 'anxiety relief', 'office toy'],
    ],
}

# ---------- 卖点模板 ----------
BULLET_TEMPLATES = {
    'Handbag': [
        'Premium {material} construction — structured silhouette holds shape beautifully',
        'Spacious interior with multiple compartments for daily organization',
        'Trendy wholesale design — ideal for boutiques and online retailers',
        'Low MOQ of {moq} pcs with factory-direct pricing from Yiwu',
        'Custom OEM/ODM: logos, packaging, and sizes available',
    ],
    'Backpack': [
        'Durable {material} backpack with reinforced straps — daily comfort',
        'Padded laptop sleeve + multiple pockets for organization',
        'Water-resistant — perfect for school, travel, and work',
        'MOQ {moq} pcs, factory-direct wholesale from Yiwu',
        'Custom branding and packaging available (OEM/ODM)',
    ],
    'Wallet': [
        'Slim {material} wallet — multiple card slots + coin pocket',
        'RFID blocking technology — protects against identity theft',
        'Sleek minimalist design — fits in any pocket or bag',
        'Factory-direct from Yiwu — MOQ {moq} pcs',
        'Custom colors, logos, and packaging supported',
    ],
    'Earrings': [
        'Lightweight {material} with {plating} finish — comfortable all-day wear',
        'Hypoallergenic and nickel-free — safe for sensitive ears',
        'Eye-catching design — perfect for retail and impulse purchase',
        'MOQ {moq} pcs at factory-direct Yiwu pricing',
        'Each pair carded and polybagged; custom packaging',
    ],
    'Ring': [
        'Sized {material} ring with {plating} finish — tarnish-resistant',
        'Smooth polished band — comfortable fit, no scratching',
        'Popular fashion design for everyday wear and resale',
        'Low MOQ {moq} pcs, factory-direct Yiwu pricing',
        'Custom sizes and designs welcome (OEM/ODM)',
    ],
    'Necklace': [
        'Premium {material} chain with {plating} finish — lasting shine',
        'Hypoallergenic and nickel-free — safe for sensitive skin',
        'Trendy design — ideal for boutiques, resale, and gifting',
        'MOQ {moq} pcs, factory-direct from Yiwu',
        'Custom lengths, pendants, and packaging available',
    ],
    'Bracelet': [
        'Durable {material} chain with {plating} finish — tarnish-resistant',
        'Flexible fit — suitable for most wrist sizes',
        'Trendy wholesale style — popular with boutiques and online sellers',
        'Low MOQ {moq} pcs, factory-direct Yiwu pricing',
        'Individually bagged; custom logos available',
    ],
    'Pendant': [
        'Detailed {material} pendant with {plating} finish',
        'Versatile design — pairs with any chain or cord',
        'Ideal for resale, gifting, and craft projects',
        'MOQ {moq} pcs, factory-direct from Yiwu',
        'Polybag packed; OEM/ODM custom designs welcome',
    ],
    'Rhinestones': [
        'Brilliant-cut {material} rhinestones — flatback for easy application',
        'Vivid color and sparkle — perfect for apparel and crafts',
        'Top-selling bling supply for fashion and decor brands',
        'Low MOQ {moq} pcs at factory-direct Yiwu pricing',
        'Bulk bag packed; custom sizes and colors available',
    ],
    'Fidget Toy': [
        'Colorful {material} fidget toy — relieves stress and boosts focus',
        'Safe, non-toxic material — suitable for kids and adults',
        'Top-selling sensory toy for retail and online stores',
        'Factory-direct wholesale from Yiwu — MOQ {moq} pcs',
        'Bulk polybag packed; custom shapes and colors available',
    ],
}

def gen_bullets(ptype, material, plating, moq):
    tpl = BULLET_TEMPLATES.get(ptype, BULLET_TEMPLATES['Pendant'])
    return [t.format(material=material or 'quality', plating=plating or 'polished', moq=moq or 12) for t in tpl]

# ---------- 主流程 ----------
def main():
    with open(DATA, 'r', encoding='utf-8') as f:
        data = json.load(f)
    products = data['products']
    print(f'现有产品: {len(products)}')

    # 分析本地图片
    print('分析本地图片...')
    local_files = sorted([f for f in os.listdir(LOCAL_DIR) if f.endswith('.jpg')])
    img_analysis = {}
    for fname in local_files:
        path = os.path.join(LOCAL_DIR, fname)
        try:
            features = analyze_image(path)
            ptype, ptype_cn = classify_product(features)
            color, color_cn = detect_color(features)
            img_id = int(fname.replace('.jpg', ''))
            img_analysis[img_id] = {
                'file': fname, 'features': features,
                'ptype': ptype, 'ptype_cn': ptype_cn,
                'color': color, 'color_cn': color_cn,
            }
        except Exception as e:
            print(f'  错误 {fname}: {e}')

    print(f'已分析 {len(img_analysis)} 张图片')
    sorted_img_ids = sorted(img_analysis.keys())

    # 分类名称
    cat_names = {
        'fashion-jewelry': 'Fashion Jewelry',
        'bags-accessories': 'Bags & Accessories',
        'hair-accessories': 'Hair Accessories',
        'garment-accessories': 'Garment Accessories',
        'home-decor-crafts': 'Home Decor & Crafts',
        'toys-gift': 'Toys & Gift',
    }

    # 生成产品数据
    new_products = []
    seen_names = set()
    name_counter = collections.Counter()

    for i, product in enumerate(products):
        if i >= len(sorted_img_ids):
            new_products.append(product)
            continue

        img_id = sorted_img_ids[i]
        img_data = img_analysis[img_id]
        f = img_data['features']

        ptype = img_data['ptype']
        ptype_cn = img_data['ptype_cn']
        color = img_data['color']
        color_cn = img_data['color_cn']

        # 分配分类
        cat_slug = assign_category(ptype, f, i)

        # 材质和镀层
        material, plating = infer_material_plating(ptype, f)

        # 生成唯一名称(确保不重复)
        name = None
        for attempt in range(20):
            candidate = make_unique_name(ptype, color, material, plating, i + attempt * 1000)
            if candidate not in seen_names:
                name = candidate
                seen_names.add(name)
                break
        
        # 兜底: 如果还是重复，添加序号
        if name is None:
            base = make_unique_name(ptype, color, material, plating, i)
            counter = 1
            while f'{base} {counter}' in seen_names:
                counter += 1
            name = f'{base} {counter}'
            seen_names.add(name)

        # 关键词
        kw_variants = KW_VARIANTS.get(ptype, KW_VARIANTS['Pendant'])
        keywords = kw_variants[i % len(kw_variants)]

        # 卖点
        moq = product.get('moq', 12)
        bullets = gen_bullets(ptype, material, plating, moq)

        # 中文名
        cn_parts = []
        if color_cn and color_cn not in ('混色',):
            cn_parts.append(color_cn)
        cn_parts.append(ptype_cn)
        name_cn = ''.join(cn_parts)

        new_product = {
            'id': product['id'],
            'image': f'/images/products/{img_data["file"]}',
            'images': [f'/images/products/{img_data["file"]}'],
            'category': {'name': cat_names[cat_slug], 'slug': cat_slug},
            'name': name,
            'nameCn': name_cn,
            'description': f'{name}. ' + ' '.join(bullets) + f' Wholesale direct from Yiwu, China. SKU {product.get("sku", "")}.',
            'sku': product.get('sku', f'YW-{cat_slug[:3].upper()}-{i+1:03d}'),
            'moq': moq,
            'priceMin': product.get('priceMin', 0.5),
            'priceMax': product.get('priceMax', 2.0),
            'material': material,
            'plating': plating,
            'stockStatus': 'IN_STOCK',
            'seller': 'Yiwu Yeatru trading company',
            'keywords': keywords,
            'bulletPoints': bullets,
        }
        new_products.append(new_product)

    # 统计分类分布
    cat_dist = collections.Counter(p['category']['slug'] for p in new_products)
    print('\n分类分布:')
    for slug, count in cat_dist.most_common():
        print(f'  {cat_names.get(slug, slug)}: {count}')

    # 检查重名
    dupes = {n: c for n, c in collections.Counter(p['name'] for p in new_products).items() if c > 1}
    if dupes:
        print(f'\n警告: {len(dupes)} 个重名')
    else:
        print('所有产品名称唯一 ✓')

    # 写回
    data['products'] = new_products
    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'\n已更新 {len(new_products)} 个产品')

    # 样本
    print('\n=== 产品样本 ===')
    for cat_slug in cat_names:
        cat_products = [p for p in new_products if p['category']['slug'] == cat_slug]
        if cat_products:
            print(f'\n{cat_names[cat_slug]} ({len(cat_products)}):')
            for p in cat_products[:2]:
                print(f'  {p["name"]}')
                print(f'    图片: {p["image"]} | 关键词: {p["keywords"][:3]}')

if __name__ == '__main__':
    main()
