"""
预下载所有产品的图片到本地 /public/images/products/
- 优先级: LoremFlickr（相关） > Picsum（兜底）
- 并行下载提高速度
- 重试3次
"""

import json
import urllib.parse
import urllib.request
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

OUTPUT_DIR = '/workspace/public/images/products'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 基于产品名匹配的关键词
KEYWORD_MAP = {
    'toys-gift': {
        'squishy': 'squishy', 'fidget': 'fidget', 'pop it': 'squishy',
        'building blocks': 'toy', 'wooden': 'toy', 'gift': 'gift',
        'doll': 'doll', 'puzzle': 'puzzle', 'plush': 'plush',
        'robot': 'toy', 'magic': 'toy', 'rose': 'flower',
    },
    'fashion-jewelry': {
        'necklace': 'necklace', 'earring': 'earring', 'ring': 'ring',
        'bracelet': 'bracelet', 'pendant': 'pendant', 'brooch': 'brooch',
        'chain': 'necklace', 'hoop': 'earring', 'bangle': 'bangle',
        'stud': 'earring', 'pearl': 'pearl', 'vintage': 'jewelry',
        'flower': 'brooch', 'gold': 'jewelry', 'silver': 'jewelry',
    },
    'hair-accessories': {
        'clip': 'clip', 'pin': 'pin', 'headband': 'headband',
        'bow': 'bow', 'scrunchie': 'hair', 'comb': 'comb',
        'tie': 'tie', 'barrette': 'barrette',
    },
    'bags-accessories': {
        'bag': 'bag', 'tote': 'bag', 'clutch': 'bag',
        'wallet': 'wallet', 'crossbody': 'bag', 'backpack': 'backpack',
        'shoulder': 'bag', 'travel': 'bag', 'pouch': 'bag',
        'purse': 'bag', 'duffel': 'bag', 'handbag': 'handbag',
    },
    'garment-accessories': {
        'belt': 'belt', 'scarf': 'scarf', 'hat': 'hat',
        'gloves': 'gloves', 'tie': 'tie', 'sunglasses': 'sunglasses',
        'watch': 'watch', 'cufflink': 'cufflink', 'bandana': 'bandana',
        'beanie': 'hat', 'cap': 'hat',
    },
    'home-decor-crafts': {
        'candle': 'candle', 'vase': 'vase', 'frame': 'frame',
        'clock': 'clock', 'pillow': 'pillow', 'rug': 'rug',
        'curtain': 'curtain', 'lantern': 'lantern', 'planter': 'vase',
        'bowl': 'vase', 'statue': 'sculpture', 'mirror': 'mirror',
        'lamp': 'lamp', 'flower': 'flower', 'garland': 'flower',
        'wreath': 'wreath', 'craft': 'craft',
    }
}

DEFAULTS = {
    'toys-gift': 'toy',
    'fashion-jewelry': 'jewelry',
    'hair-accessories': 'hair',
    'bags-accessories': 'bag',
    'garment-accessories': 'fashion',
    'home-decor-crafts': 'decor',
}

def find_keyword(product_name, category_slug):
    name_lower = product_name.lower()
    config = KEYWORD_MAP.get(category_slug, {})
    for kw, img_key in config.items():
        if kw in name_lower:
            return img_key
    return DEFAULTS.get(category_slug, 'product')

def try_download(url, timeout=8):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            if len(data) > 1000:  # 至少1KB
                return data
    except Exception as e:
        return None
    return None

def get_image_bytes(keyword, product_id):
    # 尝试多种 LoremFlickr URL 形式
    base_urls = [
        f"https://loremflickr.com/400/400/{keyword}?random={product_id}",
        f"https://loremflickr.com/400/400/{keyword}?lock={product_id}",
        f"https://loremflickr.com/400/400/{urllib.parse.quote(keyword)}?random={product_id}",
    ]
    for url in base_urls:
        data = try_download(url)
        if data:
            return data
    # 兜底: Picsum
    name_hash = abs(hash(keyword + str(product_id))) % 10000
    seed = f"{keyword}-{name_hash}"
    picsum_urls = [
        f"https://picsum.photos/seed/{urllib.parse.quote(seed)}/400/400",
        f"https://picsum.photos/seed/{seed}/400/400",
    ]
    for url in picsum_urls:
        data = try_download(url)
        if data:
            return data
    return None

def process_product(idx, product):
    product_id = product.get('id', idx)
    category_slug = product['category']['slug']
    product_name = product.get('name', f'product-{idx}')

    keyword = find_keyword(product_name, category_slug)
    out_path = os.path.join(OUTPUT_DIR, f"{product_id}.jpg")

    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return product_id, True, 'cached'

    data = get_image_bytes(keyword, product_id)
    if data:
        with open(out_path, 'wb') as f:
            f.write(data)
        return product_id, True, f'downloaded {len(data)}b'
    return product_id, False, 'failed'

def main():
    with open('site-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    products = data['products']
    print(f"Processing {len(products)} products...")

    success = 0
    failed = []
    cached = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(process_product, idx, p): (idx, p)
            for idx, p in enumerate(products)
        }
        for future in as_completed(futures):
            idx, p = futures[future]
            try:
                pid, ok, msg = future.result()
                if ok:
                    if 'cached' in msg:
                        cached += 1
                    success += 1
                else:
                    failed.append((pid, p['name']))
            except Exception as e:
                failed.append((p.get('id', idx), str(e)))

    print(f"\nSuccess: {success}/{len(products)}")
    print(f"Cached: {cached}")
    print(f"Failed: {len(failed)}")
    if failed:
        print("Failed products:")
        for pid, name in failed[:10]:
            print(f"  {pid}: {name}")

if __name__ == '__main__':
    main()
