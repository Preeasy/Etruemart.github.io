#!/usr/bin/env python3
"""
改进的图像识别脚本：使用更精细的颜色和形状特征分析
结合文件名和图片特征来推断产品类型
"""
import os
import json
from PIL import Image
import numpy as np
from collections import Counter

IMAGE_DIR = "/tmp/images_repo/Images"

def analyze_image_detailed(image_path):
    """详细分析图片特征"""
    try:
        img = Image.open(image_path).convert('RGB')
        w, h = img.size
        
        # 缩放到中等尺寸
        img_small = img.resize((224, 224))
        arr = np.array(img_small, dtype=np.float32)
        
        # === 1. 颜色分析 ===
        avg_r = arr[:,:,0].mean()
        avg_g = arr[:,:,1].mean()
        avg_b = arr[:,:,2].mean()
        brightness = (avg_r + avg_g + avg_b) / 3
        
        max_rgb = np.maximum(np.maximum(arr[:,:,0], arr[:,:,1]), arr[:,:,2])
        min_rgb = np.minimum(np.minimum(arr[:,:,0], arr[:,:,1]), arr[:,:,2])
        saturation = np.where(max_rgb > 10, (max_rgb - min_rgb) / (max_rgb + 0.001), 0).mean()
        
        # === 2. 金属色调检测 ===
        # 金色: R > G > B, 且R > 120
        gold_mask = (arr[:,:,0] > 120) & (arr[:,:,0] > arr[:,:,1] + 10) & (arr[:,:,1] > arr[:,:,2] + 10)
        gold_ratio = float(gold_mask.sum() / (224*224))
        
        # 银色/白钢色: R≈G≈B, 都 > 160
        silver_mask = (np.abs(arr[:,:,0] - arr[:,:,1]) < 15) & \
                      (np.abs(arr[:,:,1] - arr[:,:,2]) < 15) & \
                      (arr[:,:,0] > 160) & (arr[:,:,0] < 245)
        silver_ratio = float(silver_mask.sum() / (224*224))
        
        # 玫瑰金: R > G > B, R > 180, G > 120, B < 150
        rosegold_mask = (arr[:,:,0] > 180) & (arr[:,:,1] > 120) & (arr[:,:,1] < 180) & (arr[:,:,2] < 150) & (arr[:,:,0] > arr[:,:,1] + 20)
        rosegold_ratio = float(rosegold_mask.sum() / (224*224))
        
        # 古铜色: R > G > B, R 60-150
        bronze_mask = (arr[:,:,0] > 60) & (arr[:,:,0] < 180) & (arr[:,:,0] > arr[:,:,1] + 15) & (arr[:,:,1] > arr[:,:,2] + 10)
        bronze_ratio = float(bronze_mask.sum() / (224*224))
        
        # === 3. 形状分析 ===
        gray = np.mean(arr, axis=2)
        
        # 边缘检测
        grad_x = np.abs(np.diff(gray, axis=1))
        grad_y = np.abs(np.diff(gray, axis=0))
        edge_density = float((grad_x.mean() + grad_y.mean()) / 2)
        
        # 中心区域亮度 vs 边缘亮度
        center_region = gray[60:164, 60:164]
        edge_region = np.concatenate([
            gray[0:30,:].flatten(),
            gray[194:224,:].flatten(),
            gray[:,0:30].flatten(),
            gray[:,194:224].flatten()
        ])
        center_brightness = float(center_region.mean())
        edge_brightness = float(edge_region.mean())
        contrast = float(abs(center_brightness - edge_brightness))
        
        # === 4. 物体检测（通过前景/背景分离） ===
        # 用Otsu方法找到前景
        bg_val = edge_brightness
        fg_mask = np.abs(gray - bg_val) > 20
        fg_ratio = float(fg_mask.sum() / (224*224))
        
        # 前景的宽高比
        if fg_mask.sum() > 0:
            rows = np.any(fg_mask, axis=1)
            cols = np.any(fg_mask, axis=0)
            fg_height = rows.sum()
            fg_width = cols.sum()
            fg_aspect = float(fg_width / max(fg_height, 1))
        else:
            fg_aspect = 1.0
        
        # === 5. 色彩多样性 ===
        pixels = arr.reshape(-1, 3)
        quantized = (pixels // 24 * 24).astype(np.int32)
        unique_colors = len(set(map(tuple, quantized[::5])))
        
        # === 6. 圆形度检测 ===
        # 检测前景是否接近圆形
        if fg_mask.sum() > 100:
            cy, cx = np.indices(fg_mask.shape)
            fg_points = fg_mask
            if fg_points.sum() > 0:
                center_y = (cy * fg_points).sum() / fg_points.sum()
                center_x = (cx * fg_points).sum() / fg_points.sum()
                distances = np.sqrt((cy - center_y)**2 + (cx - center_x)**2) * fg_points
                mean_dist = distances.sum() / fg_points.sum()
                if mean_dist > 0:
                    std_dist = np.sqrt(((distances - mean_dist * fg_points)**2 * fg_points).sum() / fg_points.sum())
                    circularity = 1 - min(float(std_dist / mean_dist), 1)
                else:
                    circularity = 0
            else:
                circularity = 0
        else:
            circularity = 0
        
        # === 7. 对称性检测 ===
        left_half = arr[:, :112]
        right_half = arr[:, 112:][:, ::-1]
        symmetry = float(1 - np.abs(left_half - right_half).mean() / 255)
        
        return {
            'width': w, 'height': h,
            'aspect_ratio': float(w / h),
            'brightness': float(brightness),
            'saturation': float(saturation),
            'gold_ratio': gold_ratio,
            'silver_ratio': silver_ratio,
            'rosegold_ratio': rosegold_ratio,
            'bronze_ratio': bronze_ratio,
            'edge_density': edge_density,
            'center_brightness': center_brightness,
            'edge_brightness': edge_brightness,
            'contrast': contrast,
            'fg_ratio': fg_ratio,
            'fg_aspect': fg_aspect,
            'unique_colors': unique_colors,
            'circularity': circularity,
            'symmetry': symmetry,
        }
    except Exception as e:
        print(f"Error analyzing {image_path}: {e}")
        return None

def classify_product(features, filename):
    """根据详细特征分类产品"""
    if features is None:
        return "Product", "产品", "General"
    
    # 根据文件名确定大类
    fname = filename.lower()
    
    # 确定大类
    if 'fashion' in fname or 'jewelry' in fname:
        base_category = "jewelry"
    elif 'garment' in fname:
        base_category = "garment"
    elif 'bag' in fname:
        base_category = "bag"
    elif 'hair' in fname:
        base_category = "hair"
    elif 'toy' in fname or 'gift' in fname:
        base_category = "toy"
    elif 'home' in fname or 'decor' in fname or 'craft' in fname:
        base_category = "home"
    elif 'seasonal' in fname or 'festival' in fname:
        base_category = "seasonal"
    else:
        base_category = "unknown"
    
    # 根据特征确定具体产品类型
    gold = features['gold_ratio']
    silver = features['silver_ratio']
    rosegold = features['rosegold_ratio']
    bronze = features['bronze_ratio']
    edge = features['edge_density']
    colors = features['unique_colors']
    aspect = features['fg_aspect']
    sat = features['saturation']
    brightness = features['brightness']
    circularity = features['circularity']
    symmetry = features['symmetry']
    contrast = features['contrast']
    fg_ratio = features['fg_ratio']
    
    if base_category == "jewelry":
        # 首饰分类
        # 判断金属色调
        if gold > 0.1 and gold > silver and gold > rosegold:
            metal = "Gold"
            metal_cn = "金色"
        elif rosegold > 0.08 and rosegold > gold:
            metal = "Rose Gold"
            metal_cn = "玫瑰金"
        elif silver > 0.1 and silver > gold:
            metal = "Silver"
            metal_cn = "银色"
        elif bronze > 0.1:
            metal = "Bronze"
            metal_cn = "古铜色"
        else:
            metal = ""
            metal_cn = ""
        
        # 判断首饰类型（通过形状特征）
        if aspect > 1.8:
            # 宽高比大 - 项链或手链
            if contrast > 30 and edge > 25:
                return f"{metal} Necklace".strip(), f"{metal_cn}项链".strip(), "jewelry"
            else:
                return f"{metal} Bracelet".strip(), f"{metal_cn}手链".strip(), "jewelry"
        elif aspect < 0.6:
            # 高大于宽 - 可能是垂坠式耳环或长项链
            if circularity < 0.4:
                return f"{metal} Drop Earrings".strip(), f"{metal_cn}垂坠耳环".strip(), "jewelry"
            else:
                return f"{metal} Pendant Necklace".strip(), f"{metal_cn}吊坠项链".strip(), "jewelry"
        elif circularity > 0.6:
            # 圆形 - 耳环或戒指
            if fg_ratio < 0.15:
                return f"{metal} Ring".strip(), f"{metal_cn}戒指".strip(), "jewelry"
            else:
                return f"{metal} Hoop Earrings".strip(), f"{metal_cn}圆环耳环".strip(), "jewelry"
        elif symmetry > 0.75 and aspect < 1.3:
            # 对称且接近正方形 - 耳钉或耳环
            if brightness > 180:
                return f"{metal} Stud Earrings".strip(), f"{metal_cn}耳钉".strip(), "jewelry"
            else:
                return f"{metal} Earrings".strip(), f"{metal_cn}耳环".strip(), "jewelry"
        elif edge > 35 and colors > 20:
            # 复杂纹理 - 可能是串珠或复杂设计
            return f"{metal} Beaded Jewelry".strip(), f"{metal_cn}串珠首饰".strip(), "jewelry"
        elif aspect > 1.2:
            return f"{metal} Chain Bracelet".strip(), f"{metal_cn}链条手链".strip(), "jewelry"
        elif brightness > 200:
            return f"{metal} Crystal Jewelry".strip(), f"{metal_cn}水晶首饰".strip(), "jewelry"
        elif sat > 0.25:
            return f"{metal} Fashion Jewelry".strip(), f"{metal_cn}时尚首饰".strip(), "jewelry"
        else:
            return f"{metal} Jewelry Set".strip(), f"{metal_cn}首饰套装".strip(), "jewelry"
    
    elif base_category == "garment":
        # 服装配件
        if brightness > 180 and silver > 0.1:
            return "Silver Button", "银色纽扣", "garment"
        elif gold > 0.1:
            if aspect > 1.5:
                return "Gold Zipper", "金色拉链", "garment"
            else:
                return "Gold Button", "金色纽扣", "garment"
        elif edge > 30:
            return "Metal Buckle", "金属扣", "garment"
        elif aspect > 1.5:
            return "Elastic Band", "松紧带", "garment"
        else:
            return "Garment Accessory", "服装配件", "garment"
    
    elif base_category == "bag":
        # 箱包配件
        if gold > 0.15 or silver > 0.15:
            if aspect > 1.5:
                return "Chain Strap", "链条肩带", "bag"
            elif circularity > 0.5:
                return "Bag Ring", "包环", "bag"
            else:
                return "Bag Buckle", "包扣", "bag"
        elif edge > 35:
            return "Bag Hardware", "箱包五金", "bag"
        elif aspect > 1.8:
            return "Bag Strap", "包带", "bag"
        else:
            return "Bag Accessory", "箱包配件", "bag"
    
    elif base_category == "hair":
        # 发饰
        if brightness > 180 and colors < 10:
            return "Pearl Hair Pin", "珍珠发夹", "hair"
        elif sat > 0.3:
            return "Colorful Hair Clip", "彩色发夹", "hair"
        elif aspect > 1.5:
            return "Hair Band", "发箍", "hair"
        elif circularity > 0.5:
            return "Hair Tie", "发圈", "hair"
        else:
            return "Hair Accessory", "发饰", "hair"
    
    elif base_category == "toy":
        # 玩具礼品
        if colors > 25 and sat > 0.25:
            return "Colorful Toy", "彩色玩具", "toy"
        elif brightness > 180:
            return "Plush Toy", "毛绒玩具", "toy"
        elif aspect > 1.5:
            return "Gift Item", "礼品", "toy"
        else:
            return "Novelty Gift", "创意礼品", "toy"
    
    elif base_category == "home":
        if edge > 35:
            return "Decorative Craft", "装饰工艺品", "home"
        elif brightness > 180:
            return "Home Decor", "家居装饰", "home"
        else:
            return "Craft Item", "工艺品", "home"
    
    elif base_category == "seasonal":
        if sat > 0.3:
            return "Festival Decoration", "节日装饰", "seasonal"
        else:
            return "Seasonal Item", "季节性产品", "seasonal"
    
    # 未知类别 - 根据特征推断
    # 对于没有明确分类的图片，全部归为首饰类
    if gold > 0.1:
        if aspect > 1.5:
            return "Gold Chain", "金色链条", "jewelry"
        elif circularity > 0.6:
            return "Gold Pendant", "金色吊坠", "jewelry"
        else:
            return "Gold Jewelry", "金色首饰", "jewelry"
    elif silver > 0.1:
        if aspect > 1.5:
            return "Silver Chain", "银色链条", "jewelry"
        elif circularity > 0.6:
            return "Silver Pendant", "银色吊坠", "jewelry"
        else:
            return "Silver Jewelry", "银色首饰", "jewelry"
    elif sat > 0.3 and colors > 20:
        return "Fashion Accessory", "时尚配饰", "jewelry"
    elif brightness > 180:
        return "Fashion Jewelry", "时尚首饰", "jewelry"
    elif edge > 35:
        return "Metal Hardware", "金属五金", "garment"
    else:
        return "Fashion Jewelry", "时尚首饰", "jewelry"

def process_all_images():
    """处理所有图片"""
    results = []
    image_dir = IMAGE_DIR
    
    files = sorted([f for f in os.listdir(image_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    # 跳过分类标题图
    category_headers = {f for f in files if f.startswith(('01-', '02-', '03-', '04-', '05-', '06-'))}
    product_images = [f for f in files if f not in category_headers]
    
    print(f"Found {len(product_images)} product images")
    
    for i, filename in enumerate(product_images):
        filepath = os.path.join(image_dir, filename)
        features = analyze_image_detailed(filepath)
        name_en, name_cn, category = classify_product(features, filename)
        
        results.append({
            'filename': filename,
            'name_en': name_en,
            'name_cn': name_cn,
            'category': category,
            'features': features,
        })
        
        if (i + 1) % 30 == 0:
            print(f"  Processed {i+1}/{len(product_images)} images")
    
    return results

if __name__ == '__main__':
    results = process_all_images()
    
    output_path = '/tmp/image_recognition_results.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\nResults saved to {output_path}")
    print(f"Total: {len(results)} images processed")
    
    name_counter = Counter(r['name_en'] for r in results)
    print("\nProduct type distribution:")
    for name, count in name_counter.most_common():
        print(f"  {name}: {count}")
    
    print("\nSample results (first 20):")
    for r in results[:20]:
        f = r.get('features', {})
        print(f"  {r['filename']} -> {r['name_en']} ({r['name_cn']}) [cat={r['category']}, gold={f.get('gold_ratio',0):.2f}, silver={f.get('silver_ratio',0):.2f}, aspect={f.get('fg_aspect',0):.2f}, circ={f.get('circularity',0):.2f}]")
