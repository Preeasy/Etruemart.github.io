#!/usr/bin/env python3
"""
基于图片实际内容重新生成产品数据:
1. 下载所有图片并深度分析
2. 基于视觉特征判定真实产品类型
3. 重新分配到正确的分类
4. 生成匹配的名称/关键词/卖点
"""
import json, os, hashlib, sys, re, collections
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import urlopen
from PIL import Image
import numpy as np

DATA = 'site-data.json'
CACHE = '/tmp/img_cache'
os.makedirs(CACHE, exist_ok=True)

# ---------- 下载 ----------
def download(url):
    key = hashlib.md5(url.encode()).hexdigest() + '.jpg'
    path = os.path.join(CACHE, key)
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return path
    try:
        with urlopen(url, timeout=20) as r:
            data = r.read()
        with open(path, 'wb') as f:
            f.write(data)
        return path
    except Exception as e:
        return None

# ---------- 深度特征 ----------
def deep_analyze(path):
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
    edge_density = (edges > 0.08).mean()
    H, W = lum.shape
    center = lum[H//4:3*H//4, W//4:3*W//4]
    corner = np.concatenate([lum[:H//8].ravel(), lum[-H//8:].ravel()])
    fg_ratio = (np.abs(center - corner.mean()) > 0.08).mean()
    asp = w / h
    gold = ((r > 0.55) & (r < 0.95) & (g > 0.40) & (g < 0.80) & (b < 0.55) & (r > g) & (g > b)).mean()
    silver = ((np.abs(r - g) < 0.06) & (np.abs(g - b) < 0.06) & (lum > 0.55) & (lum < 0.92) & (sat < 0.10)).mean()
    brown = ((r > 0.30) & (g > 0.15) & (b < 0.25) & (r > g) & (g > b) & (sat > 0.05)).mean()
    black = (lum < 0.18).mean()
    white = ((lum > 0.90) & (sat < 0.08)).mean()
    flip = arr[:, ::-1]
    sym = 1 - np.abs(arr - flip).mean()
    return dict(
        edge=float(edge_density), fg=float(fg_ratio), asp=float(asp),
        sym=float(sym), sat=float(sat.mean()), lum=float(lum.mean()),
        gold=float(gold), silver=float(silver), brown=float(brown),
        black=float(black), white=float(white),
    )

# ---------- 产品类型分类(基于视觉特征) ----------
def classify(f):
    """返回 (ptype_en, ptype_cn, new_cat_slug, new_cat_name)"""
    e, fg, asp, sym, sat = f['edge'], f['fg'], f['asp'], f['sym'], f['sat']
    gold, silver, brown, black = f['gold'], f['silver'], f['brown'], f['black']
    met = gold + silver

    # --- 包/钱包/背包 (Bags & Accessories) ---
    # 背包: 方形+极大前景+深色
    if 0.90 < asp < 1.15 and fg > 0.80 and (black > 0.20 or f['lum'] < 0.45):
        return 'Backpack', '背包', 'bags-accessories', 'Bags & Accessories'
    # 手提包: 大前景+棕色/黑色+中等边缘
    if fg > 0.65 and (brown > 0.12 or black > 0.20):
        return 'Handbag', '手提包', 'bags-accessories', 'Bags & Accessories'
    # 钱包: 长方形(asp<0.85)+中等前景
    if asp < 0.85 and fg > 0.35:
        return 'Wallet', '钱包', 'bags-accessories', 'Bags & Accessories'
    # 托特包: 大前景+宽形
    if asp > 1.15 and fg > 0.60:
        return 'Tote Bag', '托特包', 'bags-accessories', 'Bags & Accessories'
    # 通用包: 大前景+中等边缘
    if fg > 0.70:
        return 'Handbag', '手提包', 'bags-accessories', 'Bags & Accessories'

    # --- 首饰 (Fashion Jewelry) ---
    # 耳环: 高对称+小前景
    if sym > 0.82 and fg < 0.40:
        return 'Earrings', '耳环', 'fashion-jewelry', 'Fashion Jewelry'
    # 戒指: 极小前景+低边缘
    if fg < 0.22 and e < 0.28:
        return 'Ring', '戒指', 'fashion-jewelry', 'Fashion Jewelry'
    # 项链: 高边缘(链条)+中等以上前景
    if e > 0.22 and fg > 0.45:
        return 'Necklace', '项链', 'fashion-jewelry', 'Fashion Jewelry'
    # 手链: 中等边缘+中等前景
    if e > 0.13 and 0.30 < fg < 0.65:
        return 'Bracelet', '手链', 'fashion-jewelry', 'Fashion Jewelry'
    # 吊坠: 中等前景+低边缘
    if fg > 0.30 and fg < 0.60 and e < 0.22:
        return 'Pendant', '吊坠', 'fashion-jewelry', 'Fashion Jewelry'
    # 水钻: 低饱和+金属色
    if sat < 0.10 and met > 0.08:
        return 'Rhinestones', '水钻', 'fashion-jewelry', 'Fashion Jewelry'

    # --- 玩具 (Toys & Gift) ---
    if sat > 0.25 and fg > 0.35:
        return 'Fidget Toy', '减压玩具', 'toys-gift', 'Toys & Gift'

    # --- 配饰 (Bags & Accessories) ---
    if fg > 0.40:
        return 'Bag Charm', '包挂饰', 'bags-accessories', 'Bags & Accessories'

    # 默认: 首饰小件
    if sym > 0.75:
        return 'Earrings', '耳环', 'fashion-jewelry', 'Fashion Jewelry'
    return 'Pendant', '吊坠', 'fashion-jewelry', 'Fashion Jewelry'

# ---------- 内容生成 ----------
PTYPE_COLOR = {
    'Handbag': 'Handbag', 'Backpack': 'Backpack', 'Wallet': 'Wallet',
    'Tote Bag': 'Tote Bag', 'Earrings': 'Earrings', 'Ring': 'Ring',
    'Necklace': 'Necklace', 'Bracelet': 'Bracelet', 'Pendant': 'Pendant',
    'Rhinestones': 'Rhinestones', 'Fidget Toy': 'Fidget Toy', 'Bag Charm': 'Bag Charm',
}

def color_name(f):
    cols = [
        ('Gold', f['gold']), ('Silver', f['silver']), ('Brown', f['brown']),
        ('Black', f['black']), ('Rose', f.get('rose', 0)),
    ]
    name, val = max(cols, key=lambda x: x[1])
    return name if val > 0.08 else ''

CN_COLOR = {'Gold': '金色', 'Silver': '银色', 'Brown': '棕色', 'Black': '黑色', 'Rose': '玫瑰'}

KEYWORDS = {
    'Handbag': ['handbag','tote bag','women bag','fashion handbag','designer bag'],
    'Backpack': ['backpack','school backpack','travel backpack','laptop backpack','daypack'],
    'Wallet': ['wallet','women wallet','purse','clutch wallet','leather wallet'],
    'Tote Bag': ['tote bag','shopping tote','canvas tote','beach tote','handbag tote'],
    'Earrings': ['earrings','stud earrings','drop earrings','fashion earrings','jewelry earrings'],
    'Ring': ['ring','fashion ring','jewelry ring','statement ring','band ring'],
    'Necklace': ['necklace','pendant necklace','chain necklace','fashion necklace','jewelry necklace'],
    'Bracelet': ['bracelet','bangle','chain bracelet','fashion bracelet','wristband'],
    'Pendant': ['pendant','charm pendant','necklace pendant','jewelry pendant','fashion pendant'],
    'Rhinestones': ['rhinestones','crystal rhinestones','flatback rhinestones','bling gems','decorative gems'],
    'Fidget Toy': ['fidget toy','stress toy','sensory toy','fidget spinner','relief toy'],
    'Bag Charm': ['bag charm','bag accessory','purse charm','handbag charm','decorative charm'],
}

BULLETS = {
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
    'Tote Bag': [
        'Roomy {material} tote — eco-friendly and versatile',
        'Sturdy reinforced handles — carries up to 15kg',
        'Perfect for shopping, travel, and daily use',
        'Low MOQ {moq} pcs, factory-direct Yiwu pricing',
        'Custom prints and sizes available (OEM/ODM)',
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
    'Bag Charm': [
        'Decorative {material} bag charm — instantly upgrades any handbag',
        'Secure lobster clasp fits most bags and purses',
        'Trendy accessory for boutiques and gift shops',
        'MOQ {moq} pcs, factory-direct from Yiwu',
        'Bulk polybag packed; custom designs welcome',
    ],
}

def gen_name(ptype, color, material, plating):
    parts = []
    if color:
        parts.append(color)
    if plating and plating not in ('None', ''):
        parts.append(plating)
    if material:
        parts.append(material)
    parts.append(ptype)
    return ' '.join(parts)

def gen_bullets(ptype, material, plating, moq):
    tpl = BULLETS.get(ptype, BULLETS['Pendant'])
    return [t.format(material=material or 'quality', plating=plating or 'polished', moq=moq or 12) for t in tpl]

# ---------- 主流程 ----------
def main():
    with open(DATA, 'r', encoding='utf-8') as f:
        data = json.load(f)
    products = data['products']
    print(f'共 {len(products)} 个产品')

    # 1. 下载
    print('下载图片...')
    paths = {}
    urls = list({p['image'] for p in products})
    with ThreadPoolExecutor(max_workers=16) as ex:
        futs = {ex.submit(download, u): u for u in urls}
        done = 0
        for fut in as_completed(futs):
            u = futs[fut]
            paths[u] = fut.result()
            done += 1
            if done % 30 == 0:
                print(f'  已下载 {done}/{len(urls)}')

    # 2. 分析 + 重新分类 + 生成内容
    print('深度分析图片并重新分类...')
    updated = 0
    for p in products:
        url = p['image']
        path = paths.get(url)
        if not path:
            continue
        try:
            f = deep_analyze(path)
        except Exception as e:
            continue

        ptype, ptype_cn, new_cat, new_cat_name = classify(f)
        color = color_name(f)
        material = p.get('material', 'Alloy')
        plating = p.get('plating', '')
        moq = p.get('moq', 12)

        # 重新分配分类
        p['category'] = {'name': new_cat_name, 'slug': new_cat}

        # 生成新名称
        new_name = gen_name(ptype, color, material, plating)
        color_cn = CN_COLOR.get(color, '')
        new_name_cn = (color_cn + ptype_cn) if color_cn else ptype_cn
        p['name'] = new_name
        p['nameCn'] = new_name_cn

        # 关键词和卖点
        p['keywords'] = KEYWORDS.get(ptype, KEYWORDS['Pendant'])[:]
        p['bulletPoints'] = gen_bullets(ptype, material, plating, moq)
        p['description'] = f"{new_name}. " + ' '.join(p['bulletPoints']) + f" Wholesale direct from Yiwu, China. SKU {p.get('sku','')}."

        updated += 1

    print(f'已重新分类并更新 {updated}/{len(products)} 个产品')

    # 3. 去重
    STYLE_WORDS = ['Classic','Elegant','Vintage','Modern','Premium','Deluxe','Twist','Chic','Refined','Signature','Essential','Timeless','Distinct','Prime','Select']
    name_count = collections.Counter(p['name'] for p in products)
    seen = {}
    for p in products:
        base = p['name']
        if name_count[base] > 1:
            idx = seen.get(base, 0)
            seen[base] = idx + 1
            if idx < len(STYLE_WORDS):
                words = base.split()
                ptype = words[-1]
                rest = words[:-1]
                p['name'] = ' '.join(rest + [STYLE_WORDS[idx]]) + ' ' + ptype
    dupes = sum(1 for n, c in collections.Counter(p['name'] for p in products).items() if c > 1)
    print(f'去重后重名: {dupes}')

    # 4. 按新分类统计
    cat_counts = collections.Counter(p['category']['slug'] for p in products)
    print('\n=== 新分类分布 ===')
    cat_names = {}
    for p in products:
        s = p['category']['slug']
        cat_names[s] = p['category']['name']
    for slug, count in cat_counts.most_common():
        print(f'  {cat_names.get(slug, slug)} ({slug}): {count}')

    # 5. 写回
    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('\n已写回 site-data.json')

    # 6. 样本
    print('\n=== 样本 ===')
    for p in products[:6]:
        print(f"  [{p['id']}] {p['name']} ({p['category']['slug']})")
        print(f"    img: {p['image'].split('/')[-1][:25]} | kw: {p['keywords'][0]}")

if __name__ == '__main__':
    main()
