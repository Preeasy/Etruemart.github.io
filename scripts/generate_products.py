import os
import json
import random
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill

IMAGE_BASE_URL = "https://raw.githubusercontent.com/Preeasy/images/main/Images/"

CATEGORY_CONFIG = {
    "Fashion Jewelry": {
        "slug": "fashion-jewelry",
        "subcategories": ["Necklaces", "Earrings", "Rings", "Bracelets", "Brooches", "Pendants"],
        "materials": ["Zinc Alloy", "Copper", "Stainless Steel", "Brass", "Silver Plated", "Gold Plated", "Rose Gold Plated", "Rhinestone", "Crystal", "Pearl", "Acrylic", "Resin"],
        "prices": [(0.35, 0.65), (0.55, 0.95), (0.85, 1.35), (0.45, 0.85), (0.75, 1.25), (1.25, 2.15)],
        "moqs": [12, 24, 48, 100],
        "names_en": [
            "Fashion Pendant Necklace", "Dainty Chain Necklace", "Layered Choker Necklace",
            "Statement Earrings", "Drop Dangle Earrings", "Hoop Earrings", "Stud Earrings",
            "Adjustable Ring", "Stackable Ring", "Statement Ring", "Wedding Band",
            "Charm Bracelet", "Chain Bracelet", "Bangle Bracelet", "Cuff Bracelet",
            "Brooch Pin", "Floral Brooch", "Crystal Brooch", "Lapel Pin",
            "Pendant Charm", "Lock Pendant", "Heart Pendant", "Star Pendant",
            "Tassel Necklace", "Layered Bracelet", "Gemstone Ring", "Diamond Stud",
            "Gold Bracelet", "Silver Necklace", "Pearl Earrings", "Crystal Pendant",
            "Rhinestone Necklace", "Alloy Earrings", "Copper Ring", "Resin Bracelet"
        ],
        "names_cn": [
            "时尚吊坠项链", "精致链条项链", "叠戴颈链",
            "夸张耳环", "垂坠耳环", "圆环耳环", "耳钉",
            "可调节戒指", "叠戴戒指", "夸张戒指", "婚戒",
            "吊坠手链", "链条手链", "手镯", "开口手镯",
            "胸针", "花朵胸针", "水晶胸针", "领针",
            "吊坠", "锁形吊坠", "心形吊坠", "星星吊坠",
            "流苏项链", "叠戴手链", "宝石戒指", "钻石耳钉",
            "金手链", "银项链", "珍珠耳环", "水晶吊坠",
            "水钻项链", "合金耳环", "铜戒指", "树脂手链"
        ]
    },
    "Garment Accessories": {
        "slug": "garment-accessories",
        "subcategories": ["Buttons", "Zippers", "Lace Trim", "Patches", "Ribbons", "Buckles"],
        "materials": ["Metal", "Plastic", "Resin", "Fabric", "Silk", "Polyester", "Cotton"],
        "prices": [(0.05, 0.15), (0.12, 0.28), (0.35, 0.75), (0.45, 0.95), (0.18, 0.45), (0.25, 0.55)],
        "moqs": [100, 200, 500, 1000],
        "names_en": [
            "Metal Snap Button", "Plastic Button", "Pearl Button", "Decorative Button",
            "Metal Zipper", "Nylon Zipper", "Invisible Zipper", "Two-Way Zipper",
            "Lace Trim Ribbon", "Floral Lace", "Scalloped Lace", "Guipure Lace",
            "Embroidery Patch", "Iron-On Patch", "Velcro Patch", "Woven Patch",
            "Satin Ribbon", "Grosgrain Ribbon", "Organza Ribbon", "Printed Ribbon",
            "Metal Buckle", "Plastic Buckle", "Belt Buckle", "Shoe Buckle",
            "Hook Eye", "Snap Fastener", "Eyelet", "Rivet",
            "Elastic Band", "Cord", "Label", "Tag"
        ],
        "names_cn": [
            "金属按扣", "塑料纽扣", "珍珠纽扣", "装饰纽扣",
            "金属拉链", "尼龙拉链", "隐形拉链", "双向拉链",
            "蕾丝花边", "花朵蕾丝", "扇形蕾丝", "镂空蕾丝",
            "刺绣布贴", "烫印布贴", "魔术贴", "织唛布贴",
            "缎带", "罗纹带", "雪纱带", "印花丝带",
            "金属扣", "塑料扣", "皮带扣", "鞋扣",
            "风纪扣", "四合扣", "鸡眼扣", "铆钉",
            "松紧带", "绳带", "标签", "吊牌"
        ]
    },
    "Hair Accessories": {
        "slug": "hair-accessories",
        "subcategories": ["Hair Clips", "Headbands", "Hair Ties", "Hair Pins", "Scrunchies", "Barrettes"],
        "materials": ["Metal", "Plastic", "Fabric", "Rhinestone", "Pearl", "Silk", "Velvet"],
        "prices": [(0.45, 0.85), (0.85, 1.55), (0.25, 0.55), (0.35, 0.75), (0.55, 1.05), (0.65, 1.25)],
        "moqs": [24, 48, 100],
        "names_en": [
            "Hair Clip", "Alligator Clip", "Duckbill Clip", "Snap Clip",
            "Headband", "Alice Band", "Padded Headband", "Sparkle Headband",
            "Hair Tie", "Elastic Hair Tie", "Silk Hair Tie", "Velvet Hair Tie",
            "Hair Pin", "Bobby Pin", "Decorative Hair Pin", "U-Shaped Hair Pin",
            "Scrunchie", "Silk Scrunchie", "Velvet Scrunchie", "Printed Scrunchie",
            "Barrette", "French Barrette", "Crystal Barrette", "Floral Barrette",
            "Hair Comb", "Hair Stick", "Hair Bow", "Hair Net",
            "Hair Clip Set", "Headwrap", "Hair Extension", "Wig Accessory"
        ],
        "names_cn": [
            "发夹", "鳄鱼夹", "鸭嘴夹", "弹簧夹",
            "发箍", "爱丽丝发箍", "软垫发箍", "闪亮发箍",
            "发绳", "弹力发绳", "丝绸发绳", "天鹅绒发绳",
            "发簪", "一字夹", "装饰发针", "U形发针",
            "大肠发圈", "丝绸发圈", "天鹅绒发圈", "印花发圈",
            "法式发夹", "法国夹", "水晶发夹", "花朵发夹",
            "发梳", "发簪", "蝴蝶结", "发网",
            "发夹套装", "发带", "假发配件", "头套配件"
        ]
    },
    "Bag Accessories": {
        "slug": "bags-accessories",
        "subcategories": ["Bag Charms", "Keychains", "Belt Buckles", "Bag Straps", "Bag Handles", "Dust Bags"],
        "materials": ["Metal", "PVC", "Leather", "PU Leather", "Fabric", "Acrylic", "Resin"],
        "prices": [(0.85, 1.65), (0.55, 1.15), (0.65, 1.35), (2.55, 4.55), (1.85, 3.55), (0.45, 0.95)],
        "moqs": [24, 48, 100],
        "names_en": [
            "Bag Charm", "Keychain Charm", "Pom Pom Charm", "Tassel Charm",
            "Keychain", "Metal Keychain", "PVC Keychain", "Leather Keychain",
            "Belt Buckle", "Pin Buckle", "Plate Buckle", "Box Buckle",
            "Bag Strap", "Leather Strap", "Chain Strap", "Adjustable Strap",
            "Bag Handle", "Leather Handle", "Chain Handle", "Fabric Handle",
            "Dust Bag", "Cotton Dust Bag", "Satin Dust Bag", "Drawstring Dust Bag",
            "Bag Hook", "Bag Lock", "Zipper Pull", "Bag Label",
            "Bag Feet", "Bag Lining", "Bag Hardware", "Bag Accessory Set"
        ],
        "names_cn": [
            "包挂件", "钥匙扣挂件", "毛球挂件", "流苏挂件",
            "钥匙扣", "金属钥匙扣", "PVC钥匙扣", "皮革钥匙扣",
            "皮带扣", "针扣", "板扣", "箱扣",
            "包带", "皮革包带", "链条包带", "可调节包带",
            "包把手", "皮革把手", "链条把手", "布制把手",
            "防尘袋", "棉防尘袋", "绸缎防尘袋", "抽绳防尘袋",
            "包挂钩", "包锁", "拉链头", "包标",
            "包底钉", "包衬", "包五金", "箱包配件套装"
        ]
    },
    "Home Decor & Crafts": {
        "slug": "home-decor-crafts",
        "subcategories": ["Beads", "Rhinestones", "Craft Supplies", "Decorative Items", "Candles", "Vases"],
        "materials": ["Glass", "Crystal", "Acrylic", "Plastic", "Wood", "Ceramic", "Metal", "Resin"],
        "prices": [(0.15, 0.45), (0.05, 0.25), (0.85, 1.75), (1.55, 3.25), (0.75, 1.55), (2.25, 4.75)],
        "moqs": [50, 100, 200, 500],
        "names_en": [
            "Glass Beads", "Acrylic Beads", "Crystal Beads", "Wooden Beads",
            "Flatback Rhinestone", "Hotfix Rhinestone", "Crystal Rhinestone", "Acrylic Rhinestone",
            "Craft Kit", "DIY Kit", "Jewelry Making Kit", "Beading Kit",
            "Decorative Figurine", "Wall Decor", "Table Decor", "Shelf Decor",
            "Scented Candle", "Soy Candle", "Tea Light", "Candle Holder",
            "Ceramic Vase", "Glass Vase", "Metal Vase", "Wooden Vase",
            "Planter", "Flower Pot", "Photo Frame", "Picture Frame",
            "Wall Clock", "Table Lamp", "Night Light", "String Light"
        ],
        "names_cn": [
            "玻璃珠子", "亚克力珠子", "水晶珠子", "木珠",
            "平底水钻", "热熔水钻", "水晶水钻", "亚克力水钻",
            "手工套件", "DIY套件", "珠宝制作套件", "串珠套件",
            "装饰摆件", "墙面装饰", "桌面装饰", "架子装饰",
            "香薰蜡烛", "大豆蜡烛", "茶蜡", "烛台",
            "陶瓷花瓶", "玻璃花瓶", "金属花瓶", "木质花瓶",
            "花盆", "花器", "相框", "画框",
            "挂钟", "台灯", "夜灯", "串灯"
        ]
    },
    "Toys & Gift": {
        "slug": "toys-gift",
        "subcategories": ["Stress Relief Toys", "Fidget Toys", "Educational Toys", "Gift Sets", "Party Supplies", "Seasonal Decor"],
        "materials": ["TPR", "Silicone", "ABS", "EVA", "Plush", "Wood", "Metal"],
        "prices": [(0.55, 1.15), (0.45, 0.95), (1.25, 2.75), (2.25, 4.75), (0.35, 0.85), (0.85, 1.85)],
        "moqs": [24, 48, 100, 200],
        "names_en": [
            "Stress Ball", "Squishy Toy", "Fidget Spinner", "Pop It",
            "Rubik Cube", "Puzzle", "Building Blocks", "Learning Toy",
            "Gift Box Set", "Jewelry Gift Set", "Accessory Gift Set", "Holiday Gift Set",
            "Party Favor", "Party Hat", "Party Banner", "Party Balloon",
            "Christmas Decor", "Halloween Decor", "Easter Decor", "Valentine Decor",
            "Plush Toy", "Keychain Toy", "Mini Figure", "Novelty Toy",
            "Slime", "Play Dough", "Water Toy", "Bubble Wand",
            "Board Game", "Card Game", "Doll", "Action Figure"
        ],
        "names_cn": [
            "解压球", "捏捏乐", "指尖陀螺", "泡泡乐",
            "魔方", "拼图", "积木", "益智玩具",
            "礼盒套装", "珠宝礼盒", "饰品礼盒", "节日礼盒",
            "派对用品", "派对帽", "派对横幅", "派对气球",
            "圣诞装饰", "万圣节装饰", "复活节装饰", "情人节装饰",
            "毛绒玩具", "钥匙扣玩具", "迷你人偶", "新奇玩具",
            "史莱姆", "橡皮泥", "水上玩具", "泡泡棒",
            "桌游", "卡牌游戏", "玩偶", "动作人偶"
        ]
    }
}

NUMBERED_IMAGE_ASSIGNMENT = {
    '001.jpg': 'Fashion Jewelry',
    '002.jpg': 'Fashion Jewelry',
    '003.jpg': 'Fashion Jewelry',
    '004.jpg': 'Fashion Jewelry',
    '005.jpg': 'Garment Accessories',
    '006.jpg': 'Garment Accessories',
    '007.jpg': 'Garment Accessories',
    '008.jpg': 'Hair Accessories',
    '009.jpg': 'Hair Accessories',
    '010.jpg': 'Bag Accessories',
    '011.jpg': 'Bag Accessories',
    '012.jpg': 'Bag Accessories',
    '013.jpg': 'Home Decor & Crafts',
    '014.jpg': 'Home Decor & Crafts',
    '015.jpg': 'Home Decor & Crafts',
    '016.jpg': 'Toys & Gift',
    '017.jpg': 'Toys & Gift',
    '018.jpg': 'Toys & Gift',
    '019.jpg': 'Toys & Gift',
    '020.jpg': 'Fashion Jewelry',
    '021.jpg': 'Fashion Jewelry',
    '022.jpg': 'Fashion Jewelry',
}


def categorize_files(images_dir):
    files = sorted(os.listdir(images_dir))
    categorized = {}
    for cat_name in CATEGORY_CONFIG.keys():
        categorized[cat_name] = []

    for f in files:
        if not f.endswith('.jpg') or f.startswith('banner'):
            continue

        matched = False

        if f in NUMBERED_IMAGE_ASSIGNMENT:
            cat_name = NUMBERED_IMAGE_ASSIGNMENT[f]
            categorized[cat_name].append(f)
            matched = True
        else:
            for cat_name in CATEGORY_CONFIG.keys():
                if f.startswith(cat_name):
                    categorized[cat_name].append(f)
                    matched = True
                    break

            if not matched:
                if f.startswith('Bag accessories'):
                    categorized['Bag Accessories'].append(f)
                    matched = True
                elif f.startswith('Home_Decor_Crafts'):
                    categorized['Home Decor & Crafts'].append(f)
                    matched = True
                elif f.startswith('Toys_Gift'):
                    categorized['Toys & Gift'].append(f)
                    matched = True

        if not matched:
            # 以分类缩写命名的图片（如 01-fashion-jewelry.jpg）
            if f.startswith('01-fashion') or f.startswith('01-fashion-jewelry'):
                categorized['Fashion Jewelry'].append(f)
                matched = True
            elif f.startswith('02-garment'):
                categorized['Garment Accessories'].append(f)
                matched = True
            elif f.startswith('03-hair'):
                categorized['Hair Accessories'].append(f)
                matched = True
            elif f.startswith('04-bag'):
                categorized['Bag Accessories'].append(f)
                matched = True
            elif f.startswith('05-home'):
                categorized['Home Decor & Crafts'].append(f)
                matched = True
            elif f.startswith('06-seasonal') or f.startswith('06-toys'):
                categorized['Toys & Gift'].append(f)
                matched = True

        if not matched:
            print(f"Warning: Unmatched file: {f}")

    return categorized


def generate_products(categorized_files):
    products = []
    sku_counter = 1

    for cat_name, files in categorized_files.items():
        if cat_name == 'uncategorized' or not files:
            continue

        config = CATEGORY_CONFIG[cat_name]
        num_files = len(files)

        for i in range(num_files):
            # 当前图片作为主图，相邻同类图片作为附加主图
            main_file = files[i]
            extra_indices = []
            for offset in [-2, -1, 1, 2]:
                idx = i + offset
                if 0 <= idx < num_files and idx != i:
                    extra_indices.append(idx)
            product_image_files = [main_file] + [files[idx] for idx in extra_indices[:4]]

            name_idx = i % len(config['names_en'])
            name_en = config['names_en'][name_idx]
            name_cn = config['names_cn'][name_idx]

            # 加上型号编号以区分每个产品
            model_no = f" #{sku_counter:03d}"
            name_en = name_en + model_no
            name_cn = name_cn + model_no

            subcat_idx = i % len(config['subcategories'])
            subcategory = config['subcategories'][subcat_idx]

            material_idx = i % len(config['materials'])
            material = config['materials'][material_idx]

            price_range = config['prices'][i % len(config['prices'])]
            price_min = round(random.uniform(price_range[0], price_range[1] * 0.8), 2)
            price_max = round(random.uniform(price_range[1] * 0.8, price_range[1]), 2)

            moq = config['moqs'][i % len(config['moqs'])]

            sku = f"YW-{config['slug'].upper().replace('-', '')}-{str(sku_counter).zfill(3)}"
            sku_counter += 1

            main_image = IMAGE_BASE_URL + main_file.replace(' ', '%20')
            images = [IMAGE_BASE_URL + f.replace(' ', '%20') for f in product_image_files]

            product = {
                "id": 1783332968000 + len(products),
                "image": main_image,
                "images": images,
                "category": {
                    "name": cat_name,
                    "slug": config['slug'],
                    "subcategory": subcategory
                },
                "name": name_en,
                "nameCn": name_cn,
                "sku": sku,
                "material": material,
                "moq": moq,
                "priceMin": price_min,
                "priceMax": price_max,
                "description": f"Premium wholesale {name_en.lower()} from Yiwu. {cat_name} for retailers, boutiques, and online sellers. Material: {material}. Factory direct pricing, low MOQ {moq} pcs, reliable quality. Bulk orders welcome.",
                "origin": "China",
                "packSize": random.choice([12, 24, 48, 100]),
                "stockStatus": "IN_STOCK",
                "rating": round(random.uniform(4.5, 4.9), 1),
                "reviewCount": random.randint(20, 150),
                "salesCount": random.randint(100, 1500),
                "seller": "Yiwu Yeatru trading company"
            }
            products.append(product)

    return products


def generate_site_data(products):
    return {
        "version": 2,
        "updatedAt": "2026-07-27T00:00:00Z",
        "logo": "https://raw.githubusercontent.com/Preeasy/images/main/Images/01-fashion-jewelry.jpg",
        "siteName": "eTrue Mark",
        "categories": list(CATEGORY_CONFIG.keys()),
        "products": products
    }


def generate_excel(products, output_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Product List"

    headers = ["产品图片", "SKU号", "产品名称（中文）", "产品名称（En）", "MOQ", "价格", "产品一级分类", "二级分类"]

    header_font = Font(bold=True, color="FFFFFF", size=11)
    header_fill = PatternFill(start_color="1E3A5F", end_color="1E3A5F", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )

    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border

    for row_idx, product in enumerate(products, 2):
        main_image = product['image']
        sku = product['sku']
        name_cn = product.get('nameCn', '')
        name_en = product['name']
        moq = product['moq']
        price = f"${product['priceMin']} - ${product['priceMax']}"
        main_category = product['category']['name']
        sub_category = product['category'].get('subcategory', '')

        ws.cell(row=row_idx, column=1, value=main_image).border = thin_border
        ws.cell(row=row_idx, column=2, value=sku).border = thin_border
        ws.cell(row=row_idx, column=3, value=name_cn).border = thin_border
        ws.cell(row=row_idx, column=4, value=name_en).border = thin_border
        ws.cell(row=row_idx, column=5, value=moq).border = thin_border
        ws.cell(row=row_idx, column=6, value=price).border = thin_border
        ws.cell(row=row_idx, column=7, value=main_category).border = thin_border
        ws.cell(row=row_idx, column=8, value=sub_category).border = thin_border

    ws.column_dimensions['A'].width = 50
    ws.column_dimensions['B'].width = 22
    ws.column_dimensions['C'].width = 25
    ws.column_dimensions['D'].width = 30
    ws.column_dimensions['E'].width = 10
    ws.column_dimensions['F'].width = 18
    ws.column_dimensions['G'].width = 22
    ws.column_dimensions['H'].width = 20

    wb.save(output_path)


def main():
    images_dir = '/tmp/images_repo/Images'

    print("Categorizing files...")
    categorized = categorize_files(images_dir)
    for cat, files in categorized.items():
        print(f"  {cat}: {len(files)} images")

    total_images = sum(len(files) for files in categorized.values())
    print(f"\nTotal images: {total_images}")

    print("\nGenerating products...")
    products = generate_products(categorized)
    print(f"Generated {len(products)} products")

    print("\nSaving site-data.json...")
    site_data = generate_site_data(products)
    with open('/workspace/site-data.json', 'w', encoding='utf-8') as f:
        json.dump(site_data, f, indent=2, ensure_ascii=False)

    print("Saving product_list.xlsx...")
    generate_excel(products, '/workspace/product_list.xlsx')

    print("\nDone!")
    print(f"Products: {len(products)}")
    print(f"Site data saved to: /workspace/site-data.json")
    print(f"Excel saved to: /workspace/product_list.xlsx")


if __name__ == '__main__':
    main()
