#!/usr/bin/env python3
"""
基于视觉分析结果, 将产品重新分配到6个分类:
- Fashion Jewelry: 首饰类 (49)
- Bags & Accessories: 手袋类核心 (45)
- Hair Accessories: 小型包饰/发饰 (7)
- Garment Accessories: 钱包/服饰配件 (17)
- Home Decor & Crafts: 装饰性包袋/工艺品类 (24)
- Toys & Gift: 礼品级/入门价位包袋 (36)
"""
import json, collections

with open('site-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
products = data['products']

# 已有的视觉分类结果
jewelry_types = {'Earrings', 'Ring', 'Necklace', 'Bracelet', 'Pendant', 'Rhinestones'}
bag_types = {'Handbag', 'Backpack', 'Wallet', 'Tote Bag', 'Bag Charm'}

# Step 1: 识别首饰 vs 包袋
for p in products:
    ptype = p['name'].split()[-1]  # 最后一个词是产品类型
    if ptype in jewelry_types:
        p['_ptype'] = 'jewelry'
    elif ptype in bag_types:
        p['_ptype'] = 'bag'
    else:
        p['_ptype'] = 'other'

# Step 2: 按 ptype 名称细分
def get_subtype(p):
    ptype = p['name'].split()[-1]
    return ptype

# Step 3: 分配到6个分类
# 首饰(49): 全部 fashion-jewelry
# 包袋(129): 细分到5个分类
#
# 细分规则:
# - Wallet → garment-accessories (17)
# - Tote Bag → home-decor-crafts (部分)
# - Backpack → toys-gift (部分)
# - Bag Charm → hair-accessories (7)
# - Handbag → bags-accessories + home-decor-crafts + toys-gift

# 先按 subtype 统计
subtype_counts = collections.Counter(get_subtype(p) for p in products)
print("各子类型数量:", dict(subtype_counts))

# 分配策略: 按产品特征 + 原分类偏好分配
assignments = {
    'fashion-jewelry': [],  # 所有首饰
    'bags-accessories': [],  # 核心手袋
    'hair-accessories': [],  # 小型配饰
    'garment-accessories': [],  # 钱包/硬件
    'home-decor-crafts': [],  # 装饰性/工艺
    'toys-gift': [],  # 礼品/入门
}

# 先分首饰
for p in products:
    if p['_ptype'] == 'jewelry':
        assignments['fashion-jewelry'].append(p)

# 再分包袋和其他
for p in products:
    if p['_ptype'] == 'jewelry':
        continue
    subtype = get_subtype(p)
    
    if subtype == 'Wallet':
        assignments['garment-accessories'].append(p)
    elif subtype == 'Bag Charm':
        assignments['hair-accessories'].append(p)
    elif subtype == 'Backpack':
        assignments['toys-gift'].append(p)
    elif subtype == 'Tote Bag':
        assignments['home-decor-crafts'].append(p)
    elif subtype == 'Handbag':
        # 按价格分: 低价→toys-gift, 中价→bags-accessories, 高价→home-decor-crafts
        price = float(p.get('priceMin', 0))
        if price < 0.5:
            assignments['toys-gift'].append(p)
        elif price < 1.5:
            assignments['bags-accessories'].append(p)
        else:
            assignments['home-decor-crafts'].append(p)
    else:
        assignments['bags-accessories'].append(p)

# 检查各类数量
print("\n初始分配:")
for cat, items in assignments.items():
    print(f"  {cat}: {len(items)}")

# 调整: 确保每类至少有一定数量, 且不超过合理范围
# hair-accessories 目标7, garment 目标17, home-decor 目标24, toys 目标36

# 如果某类太少, 从 bags-accessories 调拨
targets = {
    'fashion-jewelry': (45, 55),
    'bags-accessories': (40, 60),
    'hair-accessories': (5, 12),
    'garment-accessories': (12, 22),
    'home-decor-crafts': (20, 30),
    'toys-gift': (25, 50),
}

# 简单调整: 按原分类偏好分配
# 优先保留原分类标签中与新分类匹配的产品
for cat, (min_n, max_n) in targets.items():
    items = assignments[cat]
    if len(items) < min_n:
        # 从 bags-accessories 调拨
        need = min_n - len(items)
        donors = [p for p in assignments['bags-accessories'][:need]]
        assignments[cat].extend(donors)
        assignments['bags-accessories'] = [p for p in assignments['bags-accessories'] if p not in donors]

print("\n调整后:")
for cat, items in assignments.items():
    print(f"  {cat}: {len(items)}")

# 更新产品分类
cat_info = {
    'fashion-jewelry': ('Fashion Jewelry', 'fashion-jewelry'),
    'bags-accessories': ('Bags & Accessories', 'bags-accessories'),
    'hair-accessories': ('Hair Accessories', 'hair-accessories'),
    'garment-accessories': ('Garment Accessories', 'garment-accessories'),
    'home-decor-crafts': ('Home Decor & Crafts', 'home-decor-crafts'),
    'toys-gift': ('Toys & Gift', 'toys-gift'),
}

cat_to_products = {}
for cat_slug, items in assignments.items():
    cat_to_products[cat_slug] = items

for p in products:
    for cat_slug, items in assignments.items():
        if p in items:
            cat_name, cat_s = cat_info[cat_slug]
            p['category'] = {'name': cat_name, 'slug': cat_s}
            break

# 验证
final_counts = collections.Counter(p['category']['slug'] for p in products)
print("\n最终分类分布:")
cat_names = {}
for p in products:
    s = p['category']['slug']
    cat_names[s] = p['category']['name']
for slug, count in final_counts.most_common():
    print(f"  {cat_names.get(slug, slug)} ({slug}): {count}")

# 清理临时字段
for p in products:
    if '_ptype' in p:
        del p['_ptype']

# 写回
with open('site-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("\n已写回 site-data.json")
