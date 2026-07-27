import json

# 为每个产品分配一个唯一的主图
unique_images = {
    'toys-gift': [
        'https://images.pexels.com/photos/8617550/pexels-photo-8617550.jpeg',
        'https://images.pexels.com/photos/10412871/pexels-photo-10412871.jpeg',
        'https://images.pexels.com/photos/1330638/pexels-photo-1330638.jpeg',
        'https://images.pexels.com/photos/776116/pexels-photo-776116.jpeg',
        'https://images.pexels.com/photos/8385963/pexels-photo-8385963.jpeg',
        'https://images.pexels.com/photos/11477550/pexels-photo-11477550.jpeg',
        'https://images.pexels.com/photos/13417045/pexels-photo-13417045.jpeg',
        'https://images.pexels.com/photos/8638841/pexels-photo-8638841.jpeg',
        'https://images.pexels.com/photos/8638838/pexels-photo-8638838.jpeg',
        'https://images.pexels.com/photos/8286617/pexels-photo-8286617.jpeg',
        'https://images.pexels.com/photos/8617568/pexels-photo-8617568.jpeg',
        'https://images.pexels.com/photos/8617573/pexels-photo-8617573.jpeg',
        'https://images.pexels.com/photos/33633049/pexels-photo-33633049.jpeg',
        'https://images.pexels.com/photos/8148534/pexels-photo-8148534.jpeg',
        'https://images.pexels.com/photos/8837622/pexels-photo-8837622.jpeg',
        'https://images.pexels.com/photos/457035/pexels-photo-457035.jpeg',
        'https://images.pexels.com/photos/450109/pexels-photo-450109.jpeg',
        'https://images.pexels.com/photos/1383873/pexels-photo-1383873.jpeg',
        'https://images.pexels.com/photos/422285/pexels-photo-422285.jpeg',
        'https://images.pexels.com/photos/422290/pexels-photo-422290.jpeg',
        'https://images.pexels.com/photos/448539/pexels-photo-448539.jpeg',
        'https://images.pexels.com/photos/457036/pexels-photo-457036.jpeg',
    ],
    'fashion-jewelry': [
        'https://images.pexels.com/photos/28976815/pexels-photo-28976815.jpeg',
        'https://images.pexels.com/photos/29013500/pexels-photo-29013500.jpeg',
        'https://images.pexels.com/photos/12753202/pexels-photo-12753202.jpeg',
        'https://images.pexels.com/photos/7314460/pexels-photo-7314460.jpeg',
        'https://images.pexels.com/photos/28933799/pexels-photo-28933799.jpeg',
        'https://images.pexels.com/photos/5737286/pexels-photo-5737286.jpeg',
        'https://images.pexels.com/photos/28933800/pexels-photo-28933800.jpeg',
        'https://images.pexels.com/photos/28933801/pexels-photo-28933801.jpeg',
        'https://images.pexels.com/photos/29043373/pexels-photo-29043373.jpeg',
        'https://images.pexels.com/photos/14579309/pexels-photo-14579309.jpeg',
        'https://images.pexels.com/photos/14587263/pexels-photo-14587263.jpeg',
        'https://images.pexels.com/photos/12133990/pexels-photo-12133990.jpeg',
        'https://images.pexels.com/photos/7679447/pexels-photo-7679447.jpeg',
        'https://images.pexels.com/photos/7413284/pexels-photo-7413284.jpeg',
        'https://images.pexels.com/photos/13340660/pexels-photo-13340660.jpeg',
        'https://images.pexels.com/photos/8705767/pexels-photo-8705767.jpeg',
        'https://images.pexels.com/photos/8705779/pexels-photo-8705779.jpeg',
        'https://images.pexels.com/photos/5301351/pexels-photo-5301351.jpeg',
        'https://images.pexels.com/photos/8886925/pexels-photo-8886925.jpeg',
        'https://images.pexels.com/photos/13155692/pexels-photo-13155692.jpeg',
        'https://images.pexels.com/photos/13155693/pexels-photo-13155693.jpeg',
        'https://images.pexels.com/photos/10164658/pexels-photo-10164658.jpeg',
    ],
    'hair-accessories': [
        'https://images.pexels.com/photos/8617550/pexels-photo-8617550.jpeg',
        'https://images.pexels.com/photos/10412871/pexels-photo-10412871.jpeg',
        'https://images.pexels.com/photos/1330638/pexels-photo-1330638.jpeg',
        'https://images.pexels.com/photos/8385963/pexels-photo-8385963.jpeg',
        'https://images.pexels.com/photos/776116/pexels-photo-776116.jpeg',
        'https://images.pexels.com/photos/457035/pexels-photo-457035.jpeg',
        'https://images.pexels.com/photos/8837622/pexels-photo-8837622.jpeg',
        'https://images.pexels.com/photos/11477550/pexels-photo-11477550.jpeg',
        'https://images.pexels.com/photos/422290/pexels-photo-422290.jpeg',
        'https://images.pexels.com/photos/1383873/pexels-photo-1383873.jpeg',
    ],
    'bags-accessories': [
        'https://images.pexels.com/photos/5352628/pexels-photo-5352628.jpeg',
        'https://images.pexels.com/photos/35666033/pexels-photo-35666033.jpeg',
        'https://images.pexels.com/photos/22434759/pexels-photo-22434759.jpeg',
        'https://images.pexels.com/photos/8335273/pexels-photo-8335273.jpeg',
        'https://images.pexels.com/photos/9327162/pexels-photo-9327162.jpeg',
        'https://images.pexels.com/photos/22432991/pexels-photo-22432991.jpeg',
        'https://images.pexels.com/photos/7953286/pexels-photo-7953286.jpeg',
        'https://images.pexels.com/photos/23223830/pexels-photo-23223830.jpeg',
        'https://images.pexels.com/photos/27849638/pexels-photo-27849638.jpeg',
        'https://images.pexels.com/photos/8989582/pexels-photo-8989582.jpeg',
        'https://images.pexels.com/photos/21897118/pexels-photo-21897118.jpeg',
        'https://images.pexels.com/photos/21897320/pexels-photo-21897320.jpeg',
        'https://images.pexels.com/photos/21897132/pexels-photo-21897132.jpeg',
        'https://images.pexels.com/photos/36367484/pexels-photo-36367484.jpeg',
        'https://images.pexels.com/photos/36933384/pexels-photo-36933384.jpeg',
        'https://images.pexels.com/photos/18601568/pexels-photo-18601568.jpeg',
        'https://images.pexels.com/photos/135620/pexels-photo-135620.jpeg',
        'https://images.pexels.com/photos/16117896/pexels-photo-16117896.jpeg',
        'https://images.pexels.com/photos/27954772/pexels-photo-27954772.jpeg',
        'https://images.pexels.com/photos/8201205/pexels-photo-8201205.jpeg',
    ],
    'garment-accessories': [
        'https://images.pexels.com/photos/28933801/pexels-photo-28933801.jpeg',
        'https://images.pexels.com/photos/29043373/pexels-photo-29043373.jpeg',
        'https://images.pexels.com/photos/28933799/pexels-photo-28933799.jpeg',
        'https://images.pexels.com/photos/12753202/pexels-photo-12753202.jpeg',
        'https://images.pexels.com/photos/7314460/pexels-photo-7314460.jpeg',
        'https://images.pexels.com/photos/28933800/pexels-photo-28933800.jpeg',
        'https://images.pexels.com/photos/5737286/pexels-photo-5737286.jpeg',
        'https://images.pexels.com/photos/29013500/pexels-photo-29013500.jpeg',
        'https://images.pexels.com/photos/28976815/pexels-photo-28976815.jpeg',
        'https://images.pexels.com/photos/14579309/pexels-photo-14579309.jpeg',
    ],
    'home-decor-crafts': [
        'https://images.pexels.com/photos/8617550/pexels-photo-8617550.jpeg',
        'https://images.pexels.com/photos/10412871/pexels-photo-10412871.jpeg',
        'https://images.pexels.com/photos/1330638/pexels-photo-1330638.jpeg',
        'https://images.pexels.com/photos/8385963/pexels-photo-8385963.jpeg',
        'https://images.pexels.com/photos/776116/pexels-photo-776116.jpeg',
        'https://images.pexels.com/photos/457035/pexels-photo-457035.jpeg',
        'https://images.pexels.com/photos/8837622/pexels-photo-8837622.jpeg',
        'https://images.pexels.com/photos/11477550/pexels-photo-11477550.jpeg',
        'https://images.pexels.com/photos/422290/pexels-photo-422290.jpeg',
        'https://images.pexels.com/photos/1383873/pexels-photo-1383873.jpeg',
    ]
}

def get_unique_image(category_slug, index):
    """为每个产品分配唯一的主图"""
    images = unique_images.get(category_slug, unique_images['toys-gift'])
    return images[index % len(images)]

def main():
    with open('site-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 按类别分组并分配唯一图片
    category_counters = {}
    updated_count = 0
    
    for product in data['products']:
        category_slug = product['category']['slug']
        
        # 获取该类别的计数器
        if category_slug not in category_counters:
            category_counters[category_slug] = 0
        
        # 为每个产品分配一个唯一的主图
        main_image = get_unique_image(category_slug, category_counters[category_slug])
        
        # 更新主图
        product['image'] = main_image + '?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
        
        # 移除 images 数组，只保留一个主图
        product['images'] = [main_image + '?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop']
        
        category_counters[category_slug] += 1
        updated_count += 1
    
    with open('site-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f'Updated {updated_count} products with unique images')
    print(f'Category breakdown: {category_counters}')

if __name__ == '__main__':
    main()
