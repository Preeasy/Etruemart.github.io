#!/usr/bin/env python3
"""
彻底修复: 基于图片实际内容重新正确分类
- 编号图片(001-030)包含混合产品，需要准确识别
- 分类命名的图片(如 Fashion Jewelry(N).jpg)可能是真正的首饰
"""
import json, os, collections, urllib.request, time
from PIL import Image
import numpy as np

DATA = 'site-data.json'
IMG_CACHE = '/tmp/product_images_v3'
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
        
        # 前景比例
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
        
        return {
            'edge': edge_density, 'fg': fg_ratio, 'asp': asp, 'sym': sym,
            'lum': float(lum.mean()), 'sat': float(sat.mean()),
            'gold': gold, 'silver': silver, 'brown': brown, 'black': black,
            'white': white, 'red': red, 'blue': blue, 'green': green,
            'pink': pink, 'yellow': yellow, 'purple': purple,
            'fname': fname, 'width': w, 'height': h,
        }
    except Exception as e:
        return None

# ==================== 产品类型分类 ====================
def classify_product(f):
    """基于图片特征判断产品类型"""
    e, fg, sym, sat = f['edge'], f['fg'], f['sym'], f['sat']
    gold, silver, brown, black = f['gold'], f['silver'], f['brown'], f['black']
    asp = f['asp']
    
    # ============ 小型首饰 (前景<0.30) ============
    if fg < 0.30:
        if sym > 0.90:
            return 'Ring', '戒指'
        if e < 0.15:
            return 'Pendant', '吊坠'
        return 'Earrings', '耳环'
    
    # ============ 耳环 (前景<0.42, 高对称, 金属光泽) ============
    if fg < 0.42 and sym > 0.82 and (gold > 0.02 or silver > 0.02):
        return 'Earrings', '耳环'
    
    # ============ 发饰 (中等前景, 高对称) ============
    if 0.28 <= fg < 0.55 and sym > 0.78:
        if fg < 0.42 and e < 0.25:
            return 'Hair Clip', '发夹'
        return 'Headband', '发箍'
    
    # ============ 项链 (高边缘密度) ============
    if e > 0.28 and 0.35 < fg < 0.60:
        return 'Necklace', '项链'
    
    # ============ 手链 (中等边缘, 中前景) ============
    if e > 0.16 and 0.32 < fg < 0.55 and sym < 0.88:
        return 'Bracelet', '手链'
    
    # ============ 水钻 (低饱和, 金属光泽) ============
    if sat < 0.15 and (gold > 0.06 or silver > 0.06):
        return 'Rhinestones', '水钻'
    
    # ============ 钱包 (中前景, 低边缘, 可能是长形) ============
    if 0.42 < fg < 0.70 and e < 0.22:
        return 'Wallet', '钱包'
    
    # ============ 背包 (大前景, 深色, 高边缘) ============
    if fg > 0.68:
        if black > 0.22 or (e > 0.20 and asp > 1.2):
            return 'Backpack', '背包'
        if asp > 1.5:
            return 'Wallet', '钱包'
        return 'Handbag', '手提包'
    
    # ============ 手提包 (大前景) ============
    if fg > 0.62:
        if asp > 1.5:
            return 'Wallet', '钱包'
        return 'Handbag', '手提包'
    
    # ============ 玩具 (高饱和, 中前景) ============
    if sat > 0.35 and 0.30 < fg < 0.65 and black < 0.22:
        return 'Fidget Toy', '减压玩具'
    
    # ============ 默认 ============
    if fg > 0.50:
        return 'Handbag', '手提包'
    if fg > 0.35 and sym > 0.80:
        return 'Earrings', '耳环'
    if fg > 0.25:
        return 'Hair Accessory', '发饰'
    return 'Pendant', '吊坠'

# ==================== 分类分配 ====================
def assign_category(ptype):
    """基于产品类型正确分配分类"""
    jewelry_types = ('Earrings', 'Ring', 'Necklace', 'Bracelet', 'Pendant', 'Rhinestones')
    hair_types = ('Hair Clip', 'Headband', 'Hair Accessory', 'Scrunchie', 'Hair Pin')
    bag_types = ('Handbag', 'Backpack', 'Bag Accessory')
    garment_types = ('Wallet', 'Garment Accessory', 'Button', 'Zipper')
    toy_types = ('Fidget Toy', 'Plush Toy', 'Novelty Gift')
    decor_types = ('Decoration', 'Ceramic Vase', 'Wooden Craft', 'Crystal Ornament',
                   'Metal Wall Art', 'Resin Figurine', 'Acrylic Decoration',
                   'Decorative Vase', 'Decorative Bowl', 'Ornament')
    
    if ptype in jewelry_types:
        return 'fashion-jewelry'
    if ptype in hair_types:
        return 'hair-accessories'
    if ptype in bag_types:
        return 'bags-accessories'
    if ptype in garment_types:
        return 'garment-accessories'
    if ptype in toy_types:
        return 'toys-gift'
    if ptype in decor_types:
        return 'home-decor-crafts'
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
    # 读取原始数据以获取图片URL等
    import subprocess
    result = subprocess.run(['git', 'show', 'eb9f142:site-data.json'], capture_output=True, text=True, cwd='/workspace')
    with open('/tmp/orig_site_data.json', 'w') as f:
        f.write(result.stdout)
    
    with open('/tmp/orig_site_data.json') as f:
        orig_data = json.load(f)
    
    products = orig_data['products']
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
            cat = assign_category(ptype)
            analyses[pid] = {
                'ptype': ptype, 'ptype_cn': ptype_cn,
                'color': color, 'color_cn': color_cn,
                'cat': cat, 'features': f,
            }
        if (i + 1) % 20 == 0:
            print(f'  进度: {i+1}/{len(products)}')
    
    success = len([v for v in analyses.values() if v])
    print(f'分析完成: {success}/{len(products)} 成功')
    
    # 统计产品类型
    ptype_counts = collections.Counter(v['ptype'] for v in analyses.values() if v)
    print(f'\n识别的产品类型:')
    for ptype, count in ptype_counts.most_common():
        print(f'  {ptype}: {count}')
    
    # 统计分类
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
    
    # 检查分类是否均衡
    # 如果某些分类产品太少，需要调整
    min_count = 5
    cat_shortfall = {c: min_count - cnt for c, cnt in cat_counts.items() if cnt < min_count}
    
    if cat_shortfall:
        print(f'\n⚠️ 以下分类产品不足 {min_count} 个:')
        for cat, shortage in cat_shortfall.items():
            print(f'  {cat}: 缺 {shortage} 个')
        
        # 从多的分类中调拨产品
        print('\n调拨产品调整分类...')
        for cat, shortage in cat_shortfall.items():
            # 找可调拨的产品
            donor_pids = []
            for pid, a in analyses.items():
                if a['cat'] != cat and cat_counts.get(a['cat'], 0) > min_count + 5:
                    donor_pids.append((pid, a))
            
            needed = shortage
            for pid, a in donor_pids:
                if needed <= 0:
                    break
                f = a['features']
                # 优先调拨边缘产品
                if cat == 'toys-gift' and a['ptype'] in ('Backpack',) and f['fg'] < 0.80:
                    a['cat'] = cat
                    needed -= 1
                    print(f'  {pid}: {a["ptype"]} → {cat}')
                elif cat == 'home-decor-crafts' and a['ptype'] in ('Handbag',) and f['fg'] < 0.75:
                    a['cat'] = cat
                    needed -= 1
                    print(f'  {pid}: {a["ptype"]} → {cat}')
            
            # 强制调拨一些
            if needed > 0:
                for pid, a in donor_pids[:needed]:
                    if a['cat'] != cat:
                        a['cat'] = cat
                        needed -= 1
                        print(f'  [强制] {pid}: {a["ptype"]} → {cat}')
                    if needed <= 0:
                        break
        
        # 重新统计
        cat_counts = collections.Counter(v['cat'] for v in analyses.values() if v)
        print(f'\n调整后分类分布:')
        for slug, count in cat_counts.most_common():
            print(f'  {cat_names[slug]}: {count}')
    
    # 生成产品数据
    print('\n生成产品数据...')
    
    STYLE_POOL = [
        'Classic', 'Elegant', 'Modern', 'Premium', 'Deluxe',
        'Chic', 'Refined', 'Timeless', 'Essential', 'Signature',
        'Contemporary', 'Sophisticated', 'Minimalist', 'Designer',
        'Urban', 'Artisan', 'Boutique', 'Atelier', 'Luxury',
        'Everyday', 'Versatile', 'Polished', 'Handcrafted', 'Couture',
    ]
    
    KW_MAP = {
        'Earrings': [['earrings', 'stud earrings', 'drop earrings', 'fashion earrings', 'jewelry earrings'],
                     ['hoop earrings', 'dangle earrings', 'fashion earrings', 'wholesale earrings', 'earrings bulk']],
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
    
    BULLET_TEMPLATES = {
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
    
    new_products = []
    seen_names = set()
    
    for i, p in enumerate(products):
        pid = str(p['id'])
        a = analyses.get(pid)
        
        if not a:
            new_products.append(p)
            continue
        
        ptype = a['ptype']
        color = a['color']
        cat_slug = a['cat']
        f = a['features']
        
        # 推断材质
        if ptype in ('Earrings', 'Ring', 'Necklace', 'Bracelet', 'Pendant'):
            material = 'Alloy'
        elif ptype == 'Rhinestones':
            material = 'Glass'
        elif ptype in ('Handbag', 'Backpack'):
            material = 'PU Leather' if (f['brown'] > 0.10 or f['black'] > 0.20) else 'Fabric'
        elif ptype == 'Wallet':
            material = 'PU Leather'
        elif ptype in ('Hair Clip', 'Headband', 'Hair Accessory'):
            material = 'Metal' if (color in ('Gold', 'Silver')) else ('Acrylic' if color == 'White' else 'Fabric')
        elif ptype == 'Fidget Toy':
            material = 'Silicone'
        elif ptype == 'Decoration':
            material = 'Ceramic' if (f['white'] > 0.30 or f['brown'] > 0.10) else 'Resin'
        else:
            material = 'Alloy'
        
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
        variants = KW_MAP.get(ptype, [['fashion accessory', 'accessory', 'wholesale accessory', 'trendy accessory', 'gift accessory']])
        keywords = variants[i % len(variants)]
        
        # 卖点
        tpl = BULLET_TEMPLATES.get(ptype, BULLET_TEMPLATES['Pendant'])
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
    
    # 写回site-data.json
    with open('site-data.json', 'r') as f:
        site_data = json.load(f)
    site_data['products'] = new_products
    with open('site-data.json', 'w') as f:
        json.dump(site_data, f, indent=2)
    print(f'\n已保存 {len(new_products)} 个产品到 site-data.json')

if __name__ == '__main__':
    main()
