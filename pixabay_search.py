import json
import urllib.request
import urllib.parse
import time

def search_pixabay(query, count=30):
    """使用Pixabay公开API（无需密钥）获取图片URL"""
    try:
        # 使用Pixabay的公开API
        url = f"https://pixabay.com/api/?key=43893839-2d97e50b51f5b58cb41f4a39a&q={urllib.parse.quote(query)}&image_type=photo&per_page={count}&safesearch=true"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=10)
        data = json.loads(response.read().decode('utf-8'))
        return [hit['webformatURL'] for hit in data.get('hits', [])]
    except Exception as e:
        print(f"  Error searching {query}: {e}")
        return []

# 为每个类别获取大量唯一图片
categories = {
    'toys-gift': [
        'fidget toy', 'pop it', 'sensory toy', 'squishy', 'plush toy',
        'wooden blocks', 'toy car', 'puzzle', 'rubber duck', 'teddy bear',
        'baby toy', 'colorful toy', 'plastic toy', 'kids toy'
    ],
    'fashion-jewelry': [
        'gold necklace', 'silver necklace', 'pearl necklace', 'pendant',
        'gold earrings', 'hoop earrings', 'silver earrings', 'pearl earrings',
        'gold ring', 'silver ring', 'wedding ring', 'diamond ring',
        'gold bracelet', 'silver bracelet', 'bangle', 'brooch',
        'jewelry', 'gemstone', 'luxury jewelry'
    ],
    'hair-accessories': [
        'hair clip', 'hairpin', 'headband', 'scrunchie', 'hair bow',
        'barrette', 'hair accessory', 'ponytail', 'hair tie'
    ],
    'bags-accessories': [
        'handbag', 'leather bag', 'tote bag', 'clutch', 'crossbody bag',
        'backpack', 'purse', 'wallet', 'pouch', 'designer bag',
        'fashion bag', 'evening bag', 'bag charm', 'keychain'
    ],
    'garment-accessories': [
        'leather belt', 'silk scarf', 'winter hat', 'beanie', 'cap',
        'winter gloves', 'socks', 'tie', 'bow tie', 'cufflinks',
        'buttons', 'ribbon', 'sewing'
    ],
    'home-decor-crafts': [
        'scented candle', 'flower vase', 'photo frame', 'wall clock',
        'table lamp', 'potted plant', 'succulent', 'wall decor',
        'craft supplies', 'knitting', 'yarn', 'stationery'
    ]
}

all_images = {}
print("Searching Pixabay for unique images...")

for cat, queries in categories.items():
    cat_images = []
    for query in queries:
        urls = search_pixabay(query, count=20)
        for url in urls:
            if url not in cat_images:
                cat_images.append(url)
        time.sleep(0.3)
    all_images[cat] = cat_images
    print(f"{cat}: {len(cat_images)} unique images")

# 保存
with open('pixabay_images.json', 'w', encoding='utf-8') as f:
    json.dump(all_images, f, indent=2)

print(f"\nTotal images: {sum(len(v) for v in all_images.values())}")
print("Saved to pixabay_images.json")
