import json
import urllib.request

def check_image_exists(url):
    """检查Pexels图片是否存在"""
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=5)
        return response.status == 200
    except:
        return False

# 玩具类别的Pexels图片ID（来自真实搜索结果）
toy_image_ids = [
    8617550, 10412871, 1330638, 776116, 8385963, 11477550, 13417045,
    8638841, 8638838, 8286617, 8617568, 8617573, 33633049, 8148534,
    8837622, 457035, 450109, 1383873, 422285, 422290, 448539, 457036,
    # 更多Pexels图片ID（从公开可用的搜索结果）
    8873927, 7075824, 8466698, 7694031, 4796382, 4796385, 7273664,
    7516652, 11829368, 4796386, 4796394, 4796404, 5806823, 12729114,
    12634522, 3936818, 3735149, 14549046, 3936818, 16304863, 16660690,
    17795179, 18070747, 19072230, 16660695, 16660678, 16660670, 16660676
]

# 珠宝类别的Pexels图片ID
jewelry_image_ids = [
    28976815, 29013500, 12753202, 7314460, 28933799, 5737286,
    28933800, 28933801, 29043373, 14579309, 14587263, 12133990,
    7679447, 7413284, 13340660, 8705767, 8705779, 5301351,
    8886925, 13155692, 13155693, 10164658,
    # 更多珠宝图片
    6910466, 6910464, 6910471, 6910478, 6910481, 6910462,
    1191531, 1191532, 6910471, 1415483167, 1415483185,
    17079272, 25313814, 14588894, 1191530
]

# 包包类别的Pexels图片ID
bag_image_ids = [
    5352628, 35666033, 22434759, 8335273, 9327162, 22432991,
    7953286, 23223830, 27849638, 8989582, 21897118, 21897320,
    21897132, 36367484, 36933384, 18601568, 135620, 16117896,
    27954772, 8201205,
    # 更多包包图片
    904350, 1488463, 1488464, 1152077, 1152994, 904350, 7679720
]

# 服装配饰类别的Pexels图片ID
garment_image_ids = [
    28933801, 29043373, 28933799, 12753202, 7314460, 28933800,
    5737286, 29013500, 28976815, 14579309,
    # 帽子、围巾等
    7679720, 1124465, 1126990, 904350, 904338, 6766234, 6766235
]

# 发饰类别的Pexels图片ID
hair_image_ids = [
    8617550, 10412871, 1330638, 8385963, 776116, 457035,
    8837622, 11477550, 422290, 1383873,
    # 更多发饰图片
    3993449, 7256120, 7256120, 6724388
]

# 家居装饰类别的Pexels图片ID
home_image_ids = [
    8617550, 10412871, 1330638, 8385963, 776116, 457035,
    8837622, 11477550, 422290, 1383873,
    # 蜡烛、装饰等
    3933272, 1640776, 4040635, 3933272
]

# 合并并检查所有图片
all_categories = {
    'toys-gift': toy_image_ids,
    'fashion-jewelry': jewelry_image_ids,
    'hair-accessories': hair_image_ids,
    'bags-accessories': bag_image_ids,
    'garment-accessories': garment_image_ids,
    'home-decor-crafts': home_image_ids
}

print("Checking which image IDs are valid...")
valid_categories = {}

for cat, ids in all_categories.items():
    valid_urls = []
    for img_id in ids:
        url = f"https://images.pexels.com/photos/{img_id}/pexels-photo-{img_id}.jpeg"
        if check_image_exists(url):
            valid_urls.append(url)
            print(f"  [{cat}] {img_id} - OK")
    valid_categories[cat] = valid_urls
    print(f"{cat}: {len(valid_urls)} valid images\n")

# 保存结果
with open('valid_pexels_images.json', 'w', encoding='utf-8') as f:
    json.dump(valid_categories, f, indent=2)

print(f"Saved valid images to valid_pexels_images.json")
