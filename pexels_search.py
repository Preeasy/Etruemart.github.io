import json
import urllib.request
import urllib.parse
import re
import time

def search_pexels_images(query, count=50):
    """从Pexels搜索页获取真实图片URL"""
    search_url = f"https://www.pexels.com/search/{urllib.parse.quote(query)}/"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=10)
        html = response.read().decode('utf-8', errors='ignore')
        # 提取所有pexels图片URL
        pattern = r'https://images\.pexels\.com/photos/\d+/pexels-photo-\d+\.jpeg'
        urls = list(set(re.findall(pattern, html)))
        return urls[:count]
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

# 为每个类别获取大量唯一图片
categories = {
    'toys-gift': [
        'fidget toy', 'pop it', 'sensory toy', 'squishy toy', 'wooden toy',
        'building blocks', 'plush toy', 'toy car', 'puzzle', 'stress ball',
        'rubber duck', 'toy', 'doll', 'teddy bear', 'toy blocks',
        'kids toy', 'baby toy', 'fidget spinner', 'pop it toy', 'silicone toy'
    ],
    'fashion-jewelry': [
        'gold necklace', 'silver necklace', 'pearl necklace', 'pendant necklace',
        'gold earrings', 'hoop earrings', 'silver earrings', 'pearl earrings',
        'gold ring', 'silver ring', 'wedding ring', 'diamond ring', 'stackable ring',
        'gold bracelet', 'silver bracelet', 'chain bracelet', 'bangle',
        'brooch', 'jewelry set', 'gold jewelry', 'silver jewelry', 'luxury jewelry'
    ],
    'hair-accessories': [
        'hair clip', 'hairpin', 'headband', 'scrunchie', 'hair bow',
        'hair tie', 'barrette', 'hair accessory', 'hair band', 'ponytail holder'
    ],
    'bags-accessories': [
        'handbag', 'leather bag', 'shoulder bag', 'tote bag', 'clutch bag',
        'crossbody bag', 'backpack', 'purse', 'wallet', 'pouch',
        'designer bag', 'fashion bag', 'evening bag', 'messenger bag', 'bag',
        'leather wallet', 'card holder', 'coin purse', 'bag charm', 'keychain'
    ],
    'garment-accessories': [
        'belt', 'leather belt', 'scarf', 'winter scarf', 'silk scarf',
        'hat', 'winter hat', 'beanie', 'cap', 'gloves',
        'winter gloves', 'socks', 'tie', 'bow tie', 'cufflinks',
        'buttons', 'zipper', 'lace trim', 'ribbon', 'sewing accessories',
        'garment accessory', 'fashion accessory'
    ],
    'home-decor-crafts': [
        'candle', 'scented candle', 'vase', 'flower vase', 'photo frame',
        'wall clock', 'table lamp', 'floor lamp', 'potted plant', 'succulent',
        'wall decor', 'home decor', 'craft supplies', 'craft', 'diy craft',
        'knitting', 'yarn', 'sewing kit', 'art supplies', 'stationery'
    ]
}

# 收集所有唯一图片
all_images = {}
print("Searching Pexels for category images...")

for cat, queries in categories.items():
    cat_images = []
    for query in queries:
        urls = search_pexels_images(query, count=15)
        for url in urls:
            if url not in cat_images:
                cat_images.append(url)
        time.sleep(0.5)
    all_images[cat] = cat_images
    print(f"{cat}: {len(cat_images)} unique images")

# 保存结果
with open('pexels_images.json', 'w', encoding='utf-8') as f:
    json.dump(all_images, f, indent=2, ensure_ascii=False)

print("\nDone! Saved to pexels_images.json")
