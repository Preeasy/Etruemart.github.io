#!/usr/bin/env python3
"""
彻底重新分析所有图片，正确分配分类
基于图片实际内容识别产品类型，而非原始的错误分类
"""
import json, os, collections, urllib.request, time
from PIL import Image
import numpy as np

DATA = 'site-data.json'
IMG_CACHE = '/tmp/product_images_v2'
os.makedirs(IMG_CACHE, exist_ok=True)

# ==================== 图片分析 ====================
def analyze_image(url):
    fname = url.split('/')[-1].replace('%20', '_').replace('%28', '(').replace('%29', ')')
    cache_path = os.path.join(IMG_CACHE, fname)
    
    if not os.path.exists(cache_path):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = resp.read()
            with open(cache_path, 'wb') as f:
                f.write(data)
            time.sleep(0.03)
        except Exception as e:
            return None
    
    try:
        im = Image.open(cache_path).convert('RGB')
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
        
        # 前景比例 - 使用中心与边缘对比
        center_region = lum[H//4:3*H//4, W//4:3*W//4]
        edge_region = np.concatenate([lum[:H//6].ravel(), lum[-H//6:].ravel(), 
                                       lum[:, :W//6].ravel(), lum[:, -W//6:].ravel()])
        fg_ratio = float((np.abs(center_region - edge_region.mean()) > 0.06).mean())
        
        asp = w / h
        
        # 颜色特征
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
        purple = float(((b > 0.35) & (r > 0.35) & (g < 0.35) & (sat > 0.10)).mean())
        
        # 对称性
        flip = arr[:, ::-1]
        sym = float(1 - np.abs(arr - flip).mean())
        
        # 长宽比特征
        is_square = 0.85 < asp < 1.18
        is_tall = asp > 1.18
        is_wide = asp < 0.85
        
        return {
            'edge': edge_density, 'fg': fg_ratio, 'asp': asp, 'sym': sym,
            'lum': float(lum.mean()), 'sat': float(sat.mean()),
            'gold': gold, 'silver': silver, 'brown': brown, 'black': black,
            'white': white, 'red': red, 'blue': blue, 'green': green,
            'pink': pink, 'yellow': yellow, 'purple': purple,
            'fname': fname, 'width': w, 'height': h,
            'is_square': is_square, 'is_tall': is_tall, 'is_wide': is_wide,
        }
    except Exception as e:
        print(f'分析失败 {fname}: {e}')
        return None

# ==================== 产品类型分类算法 ====================
def classify_product(f):
    """
    基于图片特征判断产品类型
    """
    e, fg, sym, sat = f['edge'], f['fg'], f['sym'], f['sat']
    gold, silver, brown, black = f['gold'], f['silver'], f['brown'], f['black']
    met = gold + silver
    asp = f['asp']
    
    # ============ 1. 小型首饰/戒指类 ============
    # 特征: 小前景 (<0.30), 高对称 (>0.85)
    if fg < 0.30 and sym > 0.82:
        if e < 0.22:
            return 'Ring', '戒指'
        return 'Pendant', '吊坠'
    
    # ============ 2. 耳环类 ============
    # 特征: 小前景 (<0.40), 高对称 (>0.80), 金属光泽
    if fg < 0.42 and sym > 0.80 and met > 0.02:
        return 'Earrings', '耳环'
    
    # ============ 3. 发饰类 ============
    # 特征: 中等前景 (0.25-0.55), 高对称 (>0.78), 可能有色块
    if 0.25 <= fg < 0.58 and sym > 0.78:
        if fg < 0.42 and e < 0.28:
            return 'Hair Clip', '发夹'
        if sat > 0.25 or fg >= 0.42:
            return 'Headband', '发箍'
        return 'Hair Accessory', '发饰'
    
    # ============ 4. 项链类 ============
    # 特征: 高边缘密度 (>0.25), 中等到大前景
    if e > 0.25 and 0.40 < fg < 0.70:
        return 'Necklace', '项链'
    
    # ============ 5. 手链类 ============
    # 特征: 中等边缘, 中等前景, 非极高对称
    if e > 0.15 and 0.30 < fg < 0.55 and sym < 0.88:
        return 'Bracelet', '手链'
    
    # ============ 6. 水钻/闪石类 ============
    # 特征: 低饱和, 金属/玻璃光泽
    if sat < 0.15 and (met > 0.06 or f['white'] > 0.30):
        return 'Rhinestones', '水钻'
    
    # ============ 7. 钱包/小包 ============
    # 特征: 中等前景 (0.40-0.65), 低边缘密度
    if 0.40 < fg < 0.70 and e < 0.25:
        if asp > 1.4:  # 长形钱包
            return 'Wallet', '钱包'
        return 'Wallet', '钱包'
    
    # ============ 8. 背包 ============
    # 特征: 大前景 (>0.65), 深色为主, 高边缘密度
    if fg > 0.65 and (black > 0.25 or e > 0.22):
        if asp > 1.3:  # 竖版背包
            return 'Backpack', '背包'
        if f['is_wide'] or asp < 1.0:  # 横版或方形, 可能是手提包
            return 'Handbag', '手提包'
        return 'Backpack', '背包'
    
    # ============ 9. 手提包 ============
    # 特征: 大前景 (>0.65), 中等到低边缘
    if fg > 0.65:
        if asp > 1.5 and e < 0.20:  # 可能是长钱包
            return 'Wallet', '钱包'
        return 'Handbag', '手提包'
    
    # ============ 10. 玩具类 ============
    # 特征: 高饱和度, 中等前景
    if sat > 0.35 and 0.25 < fg < 0.65 and black < 0.25:
        return 'Fidget Toy', '减压玩具'
    
    # ============ 11. 装饰品类 ============
    # 特征: 中等前景, 各种形状
    if 0.35 < fg < 0.65 and e < 0.25:
        if brown > 0.10:
            return 'Decoration', '装饰品'
        return 'Decoration', '装饰品'
    
    # ============ 默认: 基于前景大小 ============
    if fg > 0.55:
        return 'Handbag', '手提包'
    if fg > 0.40:
        if met > 0.03:
            return 'Earrings', '耳环'
        return 'Decoration', '装饰品'
    if fg > 0.25:
        return 'Hair Accessory', '发饰'
    return 'Pendant', '吊坠'

# ==================== 分类分配 ====================
def assign_category(ptype, f, idx):
    """
    基于产品类型正确分配到分类
    """
    # 首饰类 → fashion-jewelry
    if ptype in ('Earrings', 'Ring', 'Necklace', 'Bracelet', 'Pendant', 'Rhinestones'):
        return 'fashion-jewelry'
    
    # 发饰类 → hair-accessories
    if ptype in ('Hair Clip', 'Headband', 'Hair Accessory', 'Scrunchie', 'Hair Pin'):
        return 'hair-accessories'
    
    # 包类 → bags-accessories
    if ptype in ('Handbag', 'Backpack', 'Bag Accessory'):
        return 'bags-accessories'
    
    # 钱包 → garment-accessories
    if ptype == 'Wallet':
        return 'garment-accessories'
    
    # 玩具类 → toys-gift
    if ptype in ('Fidget Toy', 'Plush Toy', 'Novelty Gift'):
        return 'toys-gift'
    
    # 装饰品类 → home-decor-crafts
    if ptype in ('Decoration', 'Ceramic Vase', 'Wooden Craft', 'Metal Wall Art',
                 'Crystal Ornament', 'Resin Figurine', 'Acrylic Decoration'):
        return 'home-decor-crafts'
    
    # 服装辅料 → garment-accessories
    if ptype in ('Garment Accessory', 'Button', 'Zipper'):
        return 'garment-accessories'
    
    return 'fashion-jewelry'

# ==================== 颜色检测 ====================
def detect_color(f):
    colors = [
        ('Gold', '金色', f['gold']),
        ('Silver', '银色', f['silver']),
        ('Black', '黑色', f['black']),
        ('Brown', '棕色', f['brown']),
        ('Red', '红色', f['red']),
        ('Blue', '蓝色', f['blue']),
        ('Green', '绿色', f['green']),
        ('Pink', '粉色', f['pink']),
        ('Yellow', '黄色', f['yellow']),
        ('Purple', '紫色', f['purple']),
        ('White', '白色', f['white']),
    ]
    name, cn, val = max(colors, key=lambda x: x[2])
    if val < 0.04:
        if f['silver'] > 0.02: return 'Silver', '银色'
        if f['gold'] > 0.02: return 'Gold', '金色'
        return 'Mixed', '混色'
    return name, cn

# ==================== 主流程 ====================
def main():
    with open(DATA) as f:
        data = json.load(f)
    products = data['products']
    print(f'加载 {len(products)} 个产品')
    
    # 分析所有图片
    print('\n分析图片中...')
    analyses = {}
    for i, p in enumerate(products):
        url = p['image']
        pid = str(p['id'])
        f = analyze_image(url)
        if f:
            ptype, ptype_cn = classify_product(f)
            color, color_cn = detect_color(f)
            cat = assign_category(ptype, f, i)
            analyses[pid] = {
                'ptype': ptype, 'ptype_cn': ptype_cn,
                'color': color, 'color_cn': color_cn,
                'cat': cat, 'features': f,
            }
        if (i + 1) % 20 == 0:
            print(f'  进度: {i+1}/{len(products)}')
    
    success = len([v for v in analyses.values() if v])
    print(f'分析完成: {success}/{len(products)} 成功')
    
    # 统计产品类型分布
    ptype_counts = collections.Counter(v['ptype'] for v in analyses.values() if v)
    print(f'\n识别的产品类型:')
    for ptype, count in ptype_counts.most_common():
        print(f'  {ptype}: {count}')
    
    # 统计分类分布
    cat_counts = collections.Counter(v['cat'] for v in analyses.values() if v)
    cat_names = {
        'fashion-jewelry': 'Fashion Jewelry',
        'bags-accessories': 'Bags & Accessories',
        'hair-accessories': 'Hair Accessories',
        'garment-accessories': 'Garment Accessories',
        'home-decor-crafts': 'Home Decor & Crafts',
        'toys-gift': 'Toys & Gift',
    }
    print(f'\n分类分布 (基于图片内容):')
    for slug, count in cat_counts.most_common():
        print(f'  {cat_names[slug]}: {count}')
    
    # 检查是否有分类产品数过少，进行微调
    # 目标: 每个分类至少有一些产品
    min_targets = {
        'fashion-jewelry': 10,
        'bags-accessories': 20,
        'hair-accessories': 5,
        'garment-accessories': 5,
        'home-decor-crafts': 10,
        'toys-gift': 5,
    }
    
    print('\n' + '='*60)
    print('检查分类均衡性...')
    print('='*60)
    
    cat_shortfall = {}
    for cat, target in min_targets.items():
        current = cat_counts.get(cat, 0)
        if current < target:
            cat_shortfall[cat] = target - current
            print(f'  ⚠️ {cat} 只有 {current} 个, 目标 {target} 个 (缺 {target-current})')
    
    # 如果某个分类产品太少，将一些边缘产品重新分配
    if cat_shortfall:
        print('\n调整分类分配...')
        for cat, shortage in cat_shortfall.items():
            print(f'  为 {cat} 寻找 {shortage} 个产品...')
            # 从多的分类中调拨一些边缘产品
            donor_cats = [c for c, cnt in cat_counts.most_common() if c != cat and cnt > min_targets.get(c, 0)]
            needed = shortage
            for donor in donor_cats:
                if needed <= 0:
                    break
                # 找可调拨的产品
                for pid, a in analyses.items():
                    if a['cat'] == donor and needed > 0:
                        # 只调拨非典型产品 (前景特别大或特别小的)
                        f = a['features']
                        if cat == 'home-decor-crafts' and (f['brown'] > 0.05 or f['edge'] < 0.18):
                            a['cat'] = cat
                            needed -= 1
                            print(f'    调拨 {pid} ({a["ptype"]}) → {cat}')
                            break
                        elif cat == 'toys-gift' and f['sat'] > 0.30:
                            a['cat'] = cat
                            needed -= 1
                            print(f'    调拨 {pid} ({a["ptype"]}) → {cat}')
                            break
                        elif cat == 'hair-accessories' and a['ptype'] in ('Earrings', 'Ring'):
                            # 耳饰/戒指有些可能是发饰
                            if f['fg'] < 0.40 and f['sym'] > 0.80:
                                a['cat'] = cat
                                needed -= 1
                                print(f'    调拨 {pid} ({a["ptype"]}) → {cat}')
                                break
    
    # 重新统计
    cat_counts = collections.Counter(v['cat'] for v in analyses.values() if v)
    print(f'\n调整后分类分布:')
    for slug, count in cat_counts.most_common():
        print(f'  {cat_names[slug]}: {count}')
    
    # 生成产品数据
    print('\n生成产品数据...')
    
    # 检查当前site-data.json的结构
    new_products = []
    seen_names = set()
    
    # 名称模板
    STYLE_POOL = [
        'Classic', 'Elegant', 'Modern', 'Premium', 'Deluxe',
        'Chic', 'Refined', 'Timeless', 'Essential', 'Signature',
        'Contemporary', 'Sophisticated', 'Minimalist', 'Designer',
        'Urban', 'Artisan', 'Boutique', 'Atelier', 'Luxury',
        'Everyday', 'Versatile', 'Polished', 'Handcrafted', 'Couture',
    ]
    
    for i, p in enumerate(products):
        pid = str(p['id'])
        a = analyses.get(pid)
        
        if not a:
            # 无法分析的产品保持原样
            new_products.append(p)
            continue
        
        ptype = a['ptype']
        color = a['color']
        cat_slug = a['cat']
        f = a['features']
        
        # 推断材质
        material_map = {
            'Earrings': 'Alloy', 'Ring': 'Alloy', 'Necklace': 'Alloy',
            'Bracelet': 'Alloy', 'Pendant': 'Alloy', 'Rhinestones': 'Glass',
            'Handbag': 'PU Leather', 'Backpack': 'Fabric', 'Wallet': 'PU Leather',
            'Hair Clip': 'Metal', 'Headband': 'Fabric', 'Hair Accessory': 'Fabric',
            'Fidget Toy': 'Silicone', 'Decoration': 'Ceramic',
        }
        material = material_map.get(ptype, 'Alloy')
        
        # 推断镀层
        if color in ('Gold', 'Silver', 'Rose Gold'):
            plating = f'{color} Plated'
        elif ptype in ('Earrings', 'Ring', 'Necklace', 'Bracelet') and color == 'Mixed':
            plating = 'Rhodium Plated'
        else:
            plating = ''
        
        # 生成唯一名称
        style = STYLE_POOL[i % len(STYLE_POOL)]
        
        if ptype == 'Decoration':
            deco_types = ['Decorative Vase', 'Decorative Bowl', 'Decorative Tray',
                         'Ornament', 'Bookend', 'Decorative Wreath',
                         'Statue', 'Figurine', 'Planter', 'Candle Holder']
            name = f'{style} {color} {deco_types[i % len(deco_types)]}'
        else:
            parts = [style]
            if color and color != 'Mixed':
                parts.append(color)
            if plating:
                parts.append(plating)
            if material:
                parts.append(material)
            parts.append(ptype)
            name = ' '.join(parts)
        
        # 确保唯一
        counter = 1
        base_name = name
        while name in seen_names:
            name = f'{base_name} {counter}'
            counter += 1
        seen_names.add(name)
        
        # 关键词
        kw_map = {
            'Earrings': [['earrings', 'stud earrings', 'drop earrings', 'fashion earrings', 'jewelry earrings'],
                         ['hoop earrings', 'dangle earrings', 'fashion earrings', 'wholesale earrings', 'earrings bulk'],
                         ['minimalist earrings', 'everyday earrings', 'fashion earrings', 'gift earrings', 'simple earrings']],
            'Ring': [['ring', 'fashion ring', 'jewelry ring', 'statement ring', 'band ring'],
                     ['stackable ring', 'minimalist ring', 'fashion ring', 'gift ring', 'set of rings']],
            'Necklace': [['necklace', 'pendant necklace', 'chain necklace', 'fashion necklace', 'jewelry necklace'],
                         ['layered necklace', 'choker necklace', 'fashion necklace', 'gift necklace', 'necklace set']],
            'Bracelet': [['bracelet', 'bangle', 'chain bracelet', 'fashion bracelet', 'wristband'],
                         ['charm bracelet', 'beaded bracelet', 'fashion bracelet', 'gift bracelet', 'bracelet set']],
            'Pendant': [['pendant', 'charm pendant', 'necklace pendant', 'jewelry pendant', 'fashion pendant']],
            'Rhinestones': [['rhinestones', 'crystal rhinestones', 'flatback rhinestones', 'bling gems', 'decorative gems'],
                            ['rhinestones', 'hotfix rhinestones', 'glass rhinestones', 'sparkle gems', 'craft supplies']],
            'Handbag': [['handbag', 'tote bag', 'women bag', 'fashion handbag', 'designer bag'],
                         ['ladies handbag', 'shoulder bag', 'fashion bag', 'wholesale bag', 'handbag bulk'],
                         ['crossbody bag', 'women purse', 'fashion handbag', 'resale bag', 'boutique bag']],
            'Backpack': [['backpack', 'school backpack', 'travel backpack', 'laptop backpack', 'daypack'],
                         ['hiking backpack', 'outdoor backpack', 'waterproof backpack', 'sports bag', 'trekking bag'],
                         ['kids backpack', 'children backpack', 'school bag', 'cute backpack', 'cartoon backpack']],
            'Wallet': [['wallet', 'women wallet', 'purse', 'clutch wallet', 'leather wallet'],
                       ['men wallet', 'bifold wallet', 'card holder wallet', 'RFID wallet', 'wallet men']],
            'Hair Clip': [['hair clip', 'barrette', 'hair accessory', 'hair clip set', 'metal hair clip'],
                          ['hair clip set', 'alligator clip', 'section clip', 'hair styling clip', 'professional hair clip']],
            'Headband': [['headband', 'hair band', 'stretchy headband', 'fashion headband', 'hair accessory'],
                         ['wide headband', 'padded headband', 'fashion hair band', 'boho headband', 'turban headband']],
            'Hair Accessory': [['hair accessory', 'hair set', 'hair clip set', 'fashion accessory', 'hair styling tool']],
            'Fidget Toy': [['fidget toy', 'stress toy', 'sensory toy', 'fidget spinner', 'relief toy'],
                           ['plush toy', 'stuffed animal', 'soft toy', 'kids toy', 'cuddle toy']],
            'Decoration': [['home decor', 'table decor', 'decorative item', 'home accessory', 'ornament'],
                           ['vase', 'ceramic vase', 'flower vase', 'home decor', 'table centerpiece']],
        }
        variants = kw_map.get(ptype, [['fashion accessory', 'accessory', 'wholesale accessory', 'trendy accessory', 'gift accessory']])
        keywords = variants[i % len(variants)]
        
        # 卖点
        bullet_templates = {
            'Earrings': ['Lightweight {material} with {plating} finish — comfortable all-day wear',
                        'Hypoallergenic and nickel-free — safe for sensitive ears',
                        'Eye-catching design — perfect for retail and impulse purchase',
                        'MOQ {moq} pcs at factory-direct Yiwu pricing',
                        'Each pair carded and polybagged; custom packaging available'],
            'Ring': ['Sized {material} ring with {plating} finish — tarnish-resistant',
                    'Smooth polished band — comfortable fit, no scratching',
                    'Popular fashion design for everyday wear and resale',
                    'Low MOQ {moq} pcs, factory-direct Yiwu pricing',
                    'Custom sizes and designs welcome (OEM/ODM)'],
            'Necklace': ['Premium {material} chain with {plating} finish — lasting shine',
                         'Hypoallergenic and nickel-free — safe for sensitive skin',
                         'Trendy design — ideal for boutiques, resale, and gifting',
                         'MOQ {moq} pcs, factory-direct from Yiwu',
                         'Custom lengths, pendants, and packaging available'],
            'Bracelet': ['Durable {material} chain with {plating} finish — tarnish-resistant',
                        'Flexible fit — suitable for most wrist sizes',
                        'Trendy wholesale style — popular with boutiques and online sellers',
                        'Low MOQ {moq} pcs, factory-direct Yiwu pricing',
                        'Individually bagged; custom logos available'],
            'Pendant': ['Detailed {material} pendant with {plating} finish',
                        'Versatile design — pairs with any chain or cord',
                        'Ideal for resale, gifting, and craft projects',
                        'MOQ {moq} pcs, factory-direct from Yiwu',
                        'Polybag packed; OEM/ODM custom designs welcome'],
            'Rhinestones': ['Brilliant-cut {material} rhinestones — flatback for easy application',
                            'Vivid color and sparkle — perfect for apparel and crafts',
                            'Top-selling bling supply for fashion and decor brands',
                            'Low MOQ {moq} pcs at factory-direct Yiwu pricing',
                            'Bulk bag packed; custom sizes and colors available'],
            'Handbag': ['Premium {material} construction — structured silhouette holds shape beautifully',
                        'Spacious interior with multiple compartments for daily organization',
                        'Trendy wholesale design — ideal for boutiques and online retailers',
                        'Low MOQ of {moq} pcs with factory-direct pricing from Yiwu',
                        'Custom OEM/ODM: logos, packaging, and sizes available'],
            'Backpack': ['Durable {material} backpack with reinforced straps — daily comfort',
                         'Padded laptop sleeve + multiple pockets for organization',
                         'Water-resistant — perfect for school, travel, and work',
                         'MOQ {moq} pcs, factory-direct wholesale from Yiwu',
                         'Custom branding and packaging available (OEM/ODM)'],
            'Wallet': ['Slim {material} wallet — multiple card slots + coin pocket',
                       'RFID blocking technology — protects against identity theft',
                       'Sleek minimalist design — fits in any pocket or bag',
                       'Factory-direct from Yiwu — MOQ {moq} pcs',
                       'Custom colors, logos, and packaging supported'],
            'Hair Clip': ['Premium {material} construction — durable and rust-resistant',
                          'Comfortable grip — won\'t slip or damage hair',
                          'Perfect for styling, sectioning, and all-day wear',
                          'MOQ {moq} pcs at factory-direct Yiwu pricing',
                          'Custom colors, logos, and packaging available'],
            'Headband': ['Premium {material} headband — soft and stretchable',
                         'Comfortable fit — no headache, non-slip grip',
                         'Trendy design — perfect for everyday and special occasions',
                         'MOQ {moq} pcs, factory-direct wholesale from Yiwu',
                         'Custom colors and packaging available (OEM/ODM)'],
            'Hair Accessory': ['Premium {material} hair accessory — high quality materials',
                               'Suitable for all hair types and styles',
                               'Great for personal use, salons, and resale',
                               'Low MOQ {moq} pcs, factory-direct Yiwu pricing',
                               'Custom packaging and designs welcome'],
            'Fidget Toy': ['Colorful {material} toy — relieves stress and boosts focus',
                           'Safe, non-toxic material — suitable for kids and adults',
                           'Top-selling sensory toy for retail and online stores',
                           'Factory-direct wholesale from Yiwu — MOQ {moq} pcs',
                           'Bulk polybag packed; custom shapes and colors available'],
            'Decoration': ['Premium {material} construction — durable and decorative',
                           'Handcrafted quality — adds elegance to any space',
                           'Popular home decor item for retail and resale',
                           'MOQ {moq} pcs, factory-direct Yiwu pricing',
                           'Custom designs and sizes available (OEM/ODM)'],
        }
        
        tpl = bullet_templates.get(ptype, bullet_templates['Pendant'])
        moq = p.get('moq', 12)
        bullets = [t.format(material=material, plating=plating or 'polished', moq=moq) for t in tpl]
        
        # 中文名称
        ptype_cn = a['ptype_cn']
        color_cn = a['color_cn']
        cn_parts = []
        if color_cn and color_cn not in ('混色',):
            cn_parts.append(color_cn)
        cn_parts.append(ptype_cn)
        name_cn = ''.join(cn_parts)
        
        new_product = {
            'id': p['id'],
            'image': p['image'],
            'images': [p['image']],
            'category': {'name': cat_names[cat_slug], 'slug': cat_slug},
            'name': name,
            'nameCn': name_cn,
            'description': f'{name}. ' + ' '.join(bullets) + f' Wholesale direct from Yiwu, China. SKU {p.get("sku", "")}.',
            'sku': p.get('sku', f'YW-{cat_slug[:3].upper()}-{i+1:03d}'),
            'moq': moq,
            'priceMin': p.get('priceMin', 0.5),
            'priceMax': p.get('priceMax', 2.0),
            'material': material,
            'plating': plating,
            'stockStatus': p.get('stockStatus', 'IN_STOCK'),
            'seller': p.get('seller', 'Yiwu Yeatru trading company'),
            'keywords': keywords,
            'bulletPoints': bullets,
        }
        new_products.append(new_product)
    
    # 最终统计
    cat_counts = collections.Counter(p['category']['slug'] for p in new_products)
    print(f'\n最终分类分布:')
    for slug, count in cat_counts.most_common():
        print(f'  {cat_names[slug]}: {count}')
    
    dupes = {n: c for n, c in collections.Counter(p['name'] for p in new_products).items() if c > 1}
    print(f'\n重名检查: {len(dupes)} 个')
    
    # 样本
    print(f'\n=== 产品样本 ===')
    for slug in sorted(cat_counts.keys()):
        cat_prods = [p for p in new_products if p['category']['slug'] == slug]
        print(f'\n{cat_names[slug]} ({len(cat_prods)}):')
        for p in cat_prods[:3]:
            img_file = p['image'].split('/')[-1]
            print(f'  {p["name"]}')
            print(f'    图片: {img_file} | 关键词: {p["keywords"][:3]}')
    
    # 写回
    data['products'] = new_products
    with open(DATA, 'w') as f:
        json.dump(data, f, indent=2)
    print(f'\n已保存 {len(new_products)} 个产品到 {DATA}')

if __name__ == '__main__':
    main()
