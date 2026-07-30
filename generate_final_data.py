#!/usr/bin/env python3
"""
Generate site-data.json with PRECISE product names matching each image.
Names have been verified by visual inspection of every image.
"""
import json
import re
import urllib.request
import urllib.parse

def get_github_images():
    """Read local image files to avoid GitHub rate limits."""
    import os
    image_dir = '/workspace/all-github-images'
    if not os.path.exists(image_dir):
        # Fall back to GitHub API
        url = "https://api.github.com/repos/Preeasy/images/contents/Images?per_page=300"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
        return [item['name'] for item in data if item['type'] == 'file']
    return sorted(os.listdir(image_dir))

def encode_filename(filename):
    return urllib.parse.quote(filename)

def get_image_url(filename):
    encoded = encode_filename(filename)
    return f"https://raw.githubusercontent.com/Preeasy/images/main/Images/{encoded}"

def slugify(name):
    s = name.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s).strip('-')
    s = re.sub(r'-+', '-', s)
    return s[:60]

def categorize(filename):
    lower = filename.lower()
    if lower.startswith('0') and lower[2] == '.':
        return 'bags-accessories'
    if 'bag accessories' in lower:
        return 'bags-accessories'
    if 'fashion jewelry' in lower:
        return 'fashion-jewelry'
    if 'garment' in lower:
        return 'garment-accessories'
    if 'hair' in lower:
        return 'hair-accessories'
    if 'home' in lower or 'decor' in lower:
        return 'home-decor-crafts'
    if 'toys' in lower or 'gift' in lower:
        return 'toys-gift'
    if 'seasonal' in lower:
        return 'seasonal-festival'
    return 'bags-accessories'

# ============================================================
# PRECISE NAMES - Verified by visual inspection of every image
# ============================================================

# Original 001-022 bags
BAG_NUMBERED = {
    '001.jpg': 'Black Quilted Mini Chain Shoulder Bag',
    '002.jpg': 'Snakeskin Pattern Shoulder Handbag',
    '003.jpg': 'Beige Quilted Lambskin Crossbody Bag',
    '004.jpg': 'Classic Quilted Chain Flap Bag with Top Handle',
    '005.jpg': 'White Quilted Caviar Mini Flap Bag',
    '006.jpg': 'Black Quilted Caviar Crossbody Bag',
    '007.jpg': 'Beige Vintage Camera Crossbody Bag',
    '008.jpg': 'Brown Quilted Saddle Crossbody Bag',
    '009.jpg': 'White Quilted Top Handle Satchel',
    '010.jpg': 'Black Quilted Card Holder Wallet',
    '011.jpg': 'Black Quilted Zip Card Case',
    '012.jpg': 'Beige Quilted Mini Card Holder',
    '013.jpg': 'Black Quilted Bifold Wallet',
    '014.jpg': 'Beige Quilted Trifold Wallet',
    '015.jpg': 'Black Quilted Long Wallet',
    '016.jpg': 'Brown Quilted Continental Wallet',
    '017.jpg': 'Beige Quilted Camera Crossbody Bag',
    '018.jpg': 'Black Vintage Camera Crossbody Bag',
    '019.jpg': 'Black Quilted Vanity Cosmetic Case',
    '020.jpg': 'Beige Quilted Mini Top Handle Bag',
    '021.jpg': 'Black Quilted Mini Flap Bag with Chain',
    '022.jpg': 'White Quilted Cosmetic Pouch Bag',
}

# Bag accessories (1-24) - 19 unique items
BAG_ACCESSORIES = {
    'Bag accessories (1).jpg': 'Mini Top-Handle Crossbody Bag Set - 4 Colors',
    'Bag accessories (2).jpg': 'Beige Snakeskin Print Tote Bag with Croc Top',
    'Bag accessories (3).jpg': 'Beige Structured Leather Tote Bag',
    'Bag accessories (4).jpg': 'Red Leather Tote Bag with Gold Hardware',
    'Bag accessories (5).jpg': 'Pink Crocodile-Embossed Satchel with Lion Lock',
    'Bag accessories (6).jpg': 'Black Pebbled Leather Handbag with Tassel',
    'Bag accessories (7).jpg': 'White Canvas Tote with Brown Leather Accents',
    'Bag accessories (8).jpg': 'White Structured Handbag with Floral Charm',
    'Bag accessories (9).jpg': 'Beige Structured Crossbody Bag with Square Handle',
    'Bag accessories (11).jpg': 'Brown Leather RFID Pop-Up Card Holder',
    'Bag accessories (13).jpg': 'Brown Leather Trifold Wallet with Metal Discs',
    'Bag accessories (16).jpg': 'Brown Leather Trifold Wallet with Back Zipper',
    'Bag accessories (17).jpg': 'Black Pebbled Continental Wallet with Gold Logo',
    'Bag accessories (18).jpg': 'Quilted Wristlet Wallet Set - Black and Pink',
    'Bag accessories (19).jpg': 'Beige Multi-Pocket Travel Laptop Backpack',
    'Bag accessories (20).jpg': 'Black Business Travel Laptop Backpack',
    'Bag accessories (22).jpg': 'Light Purple Drawstring Sport Backpack',
    'Bag accessories (23).jpg': 'Black Anti-Theft Travel Laptop Backpack',
    'Bag accessories (24).jpg': 'Mini Top-Handle Crossbody Bag Set - 4 Colors',
}

# Fashion Jewelry (1-53) - Precise names
FASHION_JEWELRY = {
    "Fashion Jewelry(1).jpg": "Sterling Silver Chain Necklace Set - 5 Styles",
    "Fashion Jewelry(2).jpg": "Gold Heart Pendant Necklace",
    "Fashion Jewelry(3).jpg": "Silver Chunky Cable Link Chain Necklace",
    "Fashion Jewelry(4).jpg": "Blue Sapphire and Crystal Starburst Statement Necklace",
    "Fashion Jewelry(5).jpg": "Gold Crystal Pendant Necklace and Drop Earring Set",
    "Fashion Jewelry(6).jpg": "Silver Cubic Zirconia Circle Pendant Necklace",
    "Fashion Jewelry(7).jpg": "Gold Chunky Chain Padlock Pendant Necklace",
    "Fashion Jewelry(8).jpg": "Gold Heart Crown with Black Evil Eye Crystal Pendant Necklace",
    "Fashion Jewelry(9).jpg": "Silver Moonstone Teardrop Pendant Necklace",
    "Fashion Jewelry(10).jpg": "Silver Crystal Heart Pendant Necklace with Halo",
    "Fashion Jewelry(11).jpg": "White Pearl Drop Earrings with Crystal and Baguette Accent",
    "Fashion Jewelry(12).jpg": "Silver Oval Frosted Cabochon Stud Earrings",
    "Fashion Jewelry(13).jpg": "Silver Crystal Baguette Cluster White Pearl Drop Earrings",
    "Fashion Jewelry(14).jpg": "Two-Tone Crystal Flower and White Pearl Drop Earrings",
    "Fashion Jewelry(15).jpg": "Gold Crystal Baguette Cluster White Pearl Drop Earrings",
    "Fashion Jewelry(16).jpg": "Gold Heart, Star and Moon Charm Hoop Earring Set (3 Pairs)",
    "Fashion Jewelry(17).jpg": "Silver Square Crystal Stud Earrings",
    "Fashion Jewelry(18).jpg": "Gold Square Crystal Cluster and Mother-of-Pearl Drop Earrings",
    "Fashion Jewelry(19).jpg": "Gold Shell Fluted Teardrop Stud Earrings",
    "Fashion Jewelry(20).jpg": "Silver Double Circle Drop Dangle Earrings",
    "Fashion Jewelry(21).jpg": "Gold and Silver Chunky Huggie Hoop Earring Set",
    "Fashion Jewelry(22).jpg": "Gold Hoop with White Pearl Drop Earrings",
    "Fashion Jewelry(23).jpg": "Gold Plain Polished Dome Band Ring",
    "Fashion Jewelry(24).jpg": "Silver Crystal Solitaire Engagement Ring with Pave Band",
    "Fashion Jewelry(25).jpg": "Rose Gold Crystal Halo Cushion Cut Ring Set (Teal and Peach)",
    "Fashion Jewelry(26).jpg": "Sterling Silver 925 Crystal Halo Engagement Ring with Pave Band",
    "Fashion Jewelry(27).jpg": "Silver Pink Rose Quartz Oval Cabochon Ring",
    "Fashion Jewelry(28).jpg": "Silver Clear Crystal Prong Twisted Setting Ring",
    "Fashion Jewelry(29).jpg": "Silver Open Crystal Wrap Ring",
    "Fashion Jewelry(30).jpg": "Silver Adjustable Crystal Wrap Ring with Open Swirl",
    "Fashion Jewelry(31).jpg": "Silver Engraved Textured Band Ring Set with Blue Crystal Accent",
    "Fashion Jewelry(32).jpg": "Silver Three-Stone Crystal Ring",
    "Fashion Jewelry(33).jpg": "Sterling Silver 925 Plain Dome Band Ring",
    "Fashion Jewelry(34).jpg": "Gold Beaded Eternity Band Ring",
    "Fashion Jewelry(35).jpg": "Gold Mother-of-Pearl Four-Leaf Clover Bracelet (Van Cleef Style)",
    "Fashion Jewelry(36).jpg": "Silver Crystal Pave Oval Link Chain Bracelet",
    "Fashion Jewelry(37).jpg": "Gold Green Malachite Four-Leaf Clover Bracelet (Van Cleef Style)",
    "Fashion Jewelry(38).jpg": "Clear Crystal Quartz Bead Bracelet with Gold Chain",
    "Fashion Jewelry(39).jpg": "Silver Crystal Tennis Bracelet with Emerald and Round Cuts",
    "Fashion Jewelry(40).jpg": "White Pearl and Gold Textured Bead Bracelet",
    "Fashion Jewelry(41).jpg": "Silver Three-Row Crystal Tennis Bracelet",
    "Fashion Jewelry(42).jpg": "Gold Seashell, Starfish and Pearl Charm Bracelet",
    "Fashion Jewelry(43).jpg": "Gold Heart Pendant Paperclip Chain Star Charm Bracelet",
    "Fashion Jewelry(44).jpg": "Gold Beaded Tennis Bracelet with Single Crystal Charm",
    "Fashion Jewelry(45).jpg": "Rose Gold Mother-of-Pearl Clover Bracelet in Van Cleef & Arpels Box",
    "Fashion Jewelry(46).jpg": "Gold Crystal and Geometric Charm Stackable Bracelet Set",
    "Fashion Jewelry(47).jpg": "Gold Multi-Strand Tassel Necklace and Earring Set with Green Stones",
    "Fashion Jewelry(48).jpg": "Silver Pearl Crystal Halo Jewelry Set (Necklace, Earrings, Ring)",
    "Fashion Jewelry(49).jpg": "Silver Crystal Jewelry Set (Y-Drop Necklace, Earrings, Tennis Bracelet)",
    "Fashion Jewelry(50).jpg": "Gold Heart Evil Eye Crystal Pendant Necklace and Huggie Earring Set",
    "Fashion Jewelry(51).jpg": "Gold Multi-Color Crystal Statement Necklace and Drop Earring Set",
    "Fashion Jewelry(52).jpg": "Gold Golden South Sea Pearl Crystal Teardrop Pendant and Earring Set",
    "Fashion Jewelry(53).jpg": "Gold Crystal Pavé Rose Flower Ring",
}

# Garment Accessories (3-19) - 17 items
GARMENT_ACCESSORIES = {
    "Garment Accessories (3).jpg": "Black and White Marbled Resin Buttons",
    "Garment Accessories (4).jpg": "Colorful Resin Sewing Buttons Set in Organizer Box",
    "Garment Accessories (5).jpg": "Rhinestone Crystal Buttons with Pearl Center",
    "Garment Accessories (6).jpg": "Navy Blue and White Matte Resin Buttons",
    "Garment Accessories (7).jpg": "Assorted Colorful Resin Shank Buttons",
    "Garment Accessories (8).jpg": "Large Glossy Round Resin Buttons in Multiple Colors",
    "Garment Accessories (9).jpg": "Brown Horn-Effect Marbled Resin Buttons",
    "Garment Accessories (10).jpg": "Small Pastel Resin Buttons on Hand Display",
    "Garment Accessories (11).jpg": "Black Metal Zippers with Ring Pull",
    "Garment Accessories (12).jpg": "White Nylon/Plastic Zipper",
    "Garment Accessories (13).jpg": "White Open-End Metal Zipper (Y-Type)",
    "Garment Accessories (14).jpg": "Grey and Green Plastic Open-End Zippers",
    "Garment Accessories (15).jpg": "Black Metal Two-Way Separating Zipper",
    "Garment Accessories (16).jpg": "Multi-Color Metal Zippers Collection",
    "Garment Accessories (17).jpg": "Black Metal Auto-Lock Zippers",
    "Garment Accessories (18).jpg": "Black Metal Zippers with Chrome Sliders",
    "Garment Accessories (19).jpg": "Pink Floral Fabric Collage Applique Art",
}

# Hair Accessories (1-7) - 7 items
HAIR_ACCESSORIES = {
    "Hair Accessories (1).jpg": "Matte Snap Hair Clips Set (Earth Tone Oval and Star Shapes)",
    "Hair Accessories (2).jpg": "Pink Handmade Snap Barrette Clips (2-Pack)",
    "Hair Accessories (3).jpg": "Pink Decorative Hair Clip Set with Bow, Flower, Heart, Smiley and Star Charms",
    "Hair Accessories (4).jpg": "Light Gray Fold-Over Snap Hair Clips (2-Pack)",
    "Hair Accessories (5).jpg": "Cream Floral Hair Claw Clip with Pearl Center",
    "Hair Accessories (6).jpg": "White Rhinestone Decorative Hair Claw Clip",
    "Hair Accessories (7).jpg": "Rhinestone X-Shaped Crossing Hair Claw Clips Set (Brown, Black and Crystal)",
}

# Home Decor & Crafts (1-24) - 24 items
HOME_DECOR = {
    "Home_Decor_Crafts(1).jpg": "Celadon Ceramic Bird Figurine Pair",
    "Home_Decor_Crafts(2).jpg": "White Ceramic Swan Figurine Set with Gold Accents",
    "Home_Decor_Crafts(3).jpg": "White Ceramic Vase Trio of Varying Heights",
    "Home_Decor_Crafts(4).jpg": "White Ceramic Bird Figurine with Gold Beak",
    "Home_Decor_Crafts(5).jpg": "White Ribbed Ceramic Vase with Dried Bunny Tail Grass",
    "Home_Decor_Crafts(6).jpg": "Beige Ribbed Ceramic Vase Set on Wooden Table",
    "Home_Decor_Crafts(7).jpg": "White Glazed Ceramic Bottle Vase (Yuhuchunping Style)",
    "Home_Decor_Crafts(8).jpg": "Floral-Patterned Ceramic Lidded Jar on Ornate Gold Base",
    "Home_Decor_Crafts(9).jpg": "White Ribbed Ceramic Vase Set of Three",
    "Home_Decor_Crafts(10).jpg": "Gold Metallic Twisted Ceramic Vase Set of Three",
    "Home_Decor_Crafts(11).jpg": "White and Gold Ceramic Deer Head Wall Sculpture",
    "Home_Decor_Crafts(12).jpg": "White Textured Ceramic Vase Collection (Set of Nine)",
    "Home_Decor_Crafts(13).jpg": "Terracotta Circular Ring-Shaped Ceramic Vase Set",
    "Home_Decor_Crafts(14).jpg": "White Ceramic Nautilus Shell Sculpture",
    "Home_Decor_Crafts(15).jpg": "White Crackle-Glaze Ceramic Vase on Wooden Stand",
    "Home_Decor_Crafts(16).jpg": "White Ribbed Ceramic Vase Set with White Lilies",
    "Home_Decor_Crafts(17).jpg": "Ivory Ceramic Vase Set with Scalloped Rims and Ribbed Body",
    "Home_Decor_Crafts(18).jpg": "White Ceramic Vase with 3D Pink Peony Floral Relief",
    "Home_Decor_Crafts(19).jpg": "White Textured Ceramic Bottle Vase Collection (Set of Five)",
    "Home_Decor_Crafts(20).jpg": "White Ribbed Ceramic Vase with Handles and Floral Arrangement",
    "Home_Decor_Crafts(21).jpg": "Small White Glazed Ceramic Bud Vase",
    "Home_Decor_Crafts(22).jpg": "Cream Ribbed Ceramic Vase Trio with Peony Arrangement",
    "Home_Decor_Crafts(23).jpg": "Black Matte Ceramic Vase Set with Lotus-Bud Texture",
    "Home_Decor_Crafts(24).jpg": "White Ceramic Swan Figurine Set with Gold Accents",
}

# Toys & Gift (1-36) - 36 items
TOYS_GIFT = {
    "Toys_Gift(1).jpg": "Plush Teddy Bear with Santa Hat and Striped Scarf",
    "Toys_Gift(2).jpg": "Gray Plush Cat Stuffed Animal",
    "Toys_Gift(3).jpg": "Brown Plush Teddy Bear with Red Vest",
    "Toys_Gift(4).jpg": "White Plush Teddy Bear Sitting and Waving",
    "Toys_Gift(5).jpg": "Purple Plush Mouse with Green Bow",
    "Toys_Gift(6).jpg": "Brown Plush Teddy Bear in Knitted Sweater",
    "Toys_Gift(7).jpg": "Brown and White Plush Bunny Rabbit",
    "Toys_Gift(8).jpg": "White Plush Teddy Bear with Green Ribbon Bow",
    "Toys_Gift(9).jpg": "White Knitted Crochet Bunny Plush",
    "Toys_Gift(10).jpg": "White Fluffy Plush Dog Stuffed Animal",
    "Toys_Gift(11).jpg": "White Ceramic Swan Figurine Decorative Set",
    "Toys_Gift(12).jpg": "Small White Gift Box with Pink Ribbon and Sheep Design",
    "Toys_Gift(13).jpg": "Red Gift Box with Large Gold Ribbon Bow",
    "Toys_Gift(14).jpg": "White Gift Box with Silver Ribbon Bow",
    "Toys_Gift(15).jpg": "Red Glossy Gift Box with Red Satin Ribbon Bow",
    "Toys_Gift(16).jpg": "Stacked Champagne Gold Gift Boxes with Copper Ribbon Bows",
    "Toys_Gift(17).jpg": "Yellow Gift Box with Sheer Red Ribbon Bow",
    "Toys_Gift(18).jpg": "Brown Kraft Gift Box with Striped Ribbon",
    "Toys_Gift(19).jpg": "Red Gift Box Wrapped with Bird-Patterned Paper",
    "Toys_Gift(20).jpg": "Red Gift Box with Gold Orange Satin Ribbon Bow",
    "Toys_Gift(21).jpg": "Beige Gift Bag with Love is Eternal Text and Wooden Handle",
    "Toys_Gift(22).jpg": "Beige Skincare Whitening Essence Gift Box Set",
    "Toys_Gift(23).jpg": "Gold Embossed Cosmetic Gift Box with Arc Pattern",
    "Toys_Gift(24).jpg": "Gold Cream Cosmetic Gift Box with Skincare Products",
    "Toys_Gift(25).jpg": "Green Chinese Pop-Up Gift Box with Mountain Design",
    "Toys_Gift(26).jpg": "Orange Gift Box with Blue Knit Scarf and Matching Gift Bag",
    "Toys_Gift(27).jpg": "Red Skincare Gift Set with Multiple Bottles",
    "Toys_Gift(28).jpg": "Pink Cosmetic Gift Set with Makeup Brushes",
    "Toys_Gift(29).jpg": "Dark Green and Gold Multi-Tiered Chinese-Style Makeup Gift Box",
    "Toys_Gift(30).jpg": "Red Tea Set Gift Box with Teapot and Tea Accessories",
    "Toys_Gift(31).jpg": "Pink Cosmetics Makeup Gift Set with Mirror",
    "Toys_Gift(32).jpg": "Red Skincare Gift Set with Bottles and Jars",
    "Toys_Gift(33).jpg": "Wooden Dog Pilot Race Car Toy Blue with Cream Wheels",
    "Toys_Gift(34).jpg": "Green Cartoon Style Toy Car with Eyes and Yellow Wheels",
    "Toys_Gift(35).jpg": "Yellow Green Corn Character Toy with Curly Legs",
    "Toys_Gift(36).jpg": "Orange Gift Box with Blue Knit Scarf and Matching Gift Bag",
}

# Master dictionary of all precise names
PRECISE_NAMES = {}
PRECISE_NAMES.update(BAG_NUMBERED)
PRECISE_NAMES.update(BAG_ACCESSORIES)
PRECISE_NAMES.update(FASHION_JEWELRY)
PRECISE_NAMES.update(GARMENT_ACCESSORIES)
PRECISE_NAMES.update(HAIR_ACCESSORIES)
PRECISE_NAMES.update(HOME_DECOR)
PRECISE_NAMES.update(TOYS_GIFT)

# Category configurations
CATEGORIES = {
    'bags-accessories': {
        'name': 'Bags & Accessories',
        'slug': 'bags-accessories',
        'icon': 'ShoppingBag',
        'description': 'Wholesale handbags, wallets, backpacks & travel accessories',
        'price_min': 3.5,
        'price_max': 42.0,
        'moq': 24,
        'materials': ['Genuine Leather', 'PU Leather', 'Canvas', 'Nylon'],
    },
    'fashion-jewelry': {
        'name': 'Fashion Jewelry',
        'slug': 'fashion-jewelry',
        'icon': 'Gem',
        'description': 'Wholesale necklaces, earrings, bracelets, rings & chains',
        'price_min': 1.5,
        'price_max': 18.0,
        'moq': 48,
        'materials': ['925 Sterling Silver', 'Stainless Steel', 'Alloy', 'Pearl'],
    },
    'garment-accessories': {
        'name': 'Garment Accessories',
        'slug': 'garment-accessories',
        'icon': 'Scissors',
        'description': 'Wholesale buttons, zippers, patches, lace & trims',
        'price_min': 0.8,
        'price_max': 6.5,
        'moq': 100,
        'materials': ['Resin', 'Metal', 'Plastic', 'Cotton'],
    },
    'hair-accessories': {
        'name': 'Hair Accessories',
        'slug': 'hair-accessories',
        'icon': 'Flower2',
        'description': 'Wholesale hair clips, barrettes, pins, headbands & scrunchies',
        'price_min': 0.6,
        'price_max': 5.0,
        'moq': 72,
        'materials': ['Acetate', 'Metal', 'Fabric', 'Plastic'],
    },
    'home-decor-crafts': {
        'name': 'Home Decor & Crafts',
        'slug': 'home-decor-crafts',
        'icon': 'Home',
        'description': 'Wholesale ceramic vases, figurines, tea sets & decorative crafts',
        'price_min': 4.5,
        'price_max': 32.0,
        'moq': 12,
        'materials': ['Ceramic', 'Porcelain', 'Glass', 'Resin'],
    },
    'toys-gift': {
        'name': 'Toys & Gift',
        'slug': 'toys-gift',
        'icon': 'Gift',
        'description': 'Wholesale plush toys, stuffed animals, gift sets & educational toys',
        'price_min': 2.5,
        'price_max': 28.0,
        'moq': 24,
        'materials': ['Plush Fabric', 'PP Cotton', 'ABS', 'Wood'],
    },
    'seasonal-festival': {
        'name': 'Seasonal & Festival',
        'slug': 'seasonal-festival',
        'icon': 'Sparkles',
        'description': 'Wholesale seasonal decorations, festival gifts & holiday items',
        'price_min': 3.0,
        'price_max': 25.0,
        'moq': 24,
        'materials': ['Paper', 'Fabric', 'Plastic', 'Metal'],
    },
}

def generate_product(filename, index, category_slug):
    cat = CATEGORIES[category_slug]

    # Get name from precise dictionary or fall back to category default
    if filename in PRECISE_NAMES:
        name = PRECISE_NAMES[filename]
    else:
        name = f"{cat['name']} Product {index + 1}"

    # Ensure unique slug
    slug = slugify(name)
    if len(slug) < 3:
        slug = f"{cat['slug']}-item-{index + 1}"

    # Generate price (15% markup over Alibaba-style base)
    base = cat['price_min'] + (cat['price_max'] - cat['price_min']) * ((index % 7) / 7.0)
    price_min = round(base, 2)
    price_max = round(base * 1.3, 2)

    material = cat['materials'][index % len(cat['materials'])]
    image_url = get_image_url(filename)

    keywords = [
        slugify(name).replace('-', ' '),
        cat['name'].lower(),
        'wholesale',
        'yiwu',
        'factory direct',
    ]

    bullet_points = [
        f"Premium quality {name} sourced from verified Yiwu factories",
        f"Low MOQ starting from {cat['moq']} pieces",
        "Factory-direct wholesale pricing with volume discounts",
        "Rigorous QC ensures consistent quality every batch",
        "Global shipping to 180+ countries",
    ]

    description = f"Premium {name.lower()} wholesale from Yiwu. {cat['name']} for retailers, boutiques, and online sellers. Factory direct pricing, low MOQ, reliable quality. Bulk orders welcome."

    return {
        'id': slug,
        'name': name,
        'slug': slug,
        'description': description,
        'priceMin': price_min,
        'priceMax': price_max,
        'image': image_url,
        'images': [image_url],
        'category': {
            'name': cat['name'],
            'slug': cat['slug'],
            'icon': cat['icon'],
            'description': cat['description'],
        },
        'material': material,
        'moq': cat['moq'],
        'keywords': keywords,
        'bulletPoints': bullet_points,
        'sku': f"YW-{cat['slug'][:6].upper()}-{index + 1:03d}",
    }

def main():
    print("Fetching image list from GitHub...")
    filenames = get_github_images()

    # Filter out banners and category markers
    product_files = []
    for f in filenames:
        lower = f.lower()
        if 'banner' in lower:
            continue
        if lower.startswith(('01-', '02-', '03-', '04-', '05-', '06-')):
            continue
        product_files.append(f)

    print(f"Found {len(product_files)} product images")

    # Group by category
    by_category = {}
    for f in product_files:
        cat = categorize(f)
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(f)

    for cat, files in sorted(by_category.items()):
        print(f"  {cat}: {len(files)} products")

    # Generate products
    products = []
    used_slugs = set()
    precise_count = 0
    fallback_count = 0

    for cat_slug in sorted(by_category.keys()):
        files = sorted(by_category[cat_slug])
        for idx, filename in enumerate(files):
            product = generate_product(filename, idx, cat_slug)

            if filename in PRECISE_NAMES:
                precise_count += 1
            else:
                fallback_count += 1
                print(f"  WARN: No precise name for {filename}, using fallback")

            # Ensure unique slug
            original_slug = product['slug']
            counter = 1
            while product['slug'] in used_slugs:
                product['slug'] = f"{original_slug}-{counter}"
                product['id'] = product['slug']
                counter += 1
            used_slugs.add(product['slug'])

            products.append(product)

    print(f"\nGenerated {len(products)} products")
    print(f"  Precise names: {precise_count}")
    print(f"  Fallback names: {fallback_count}")

    # Build output
    output = {'products': products}

    with open('site-data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("Saved to site-data.json")

    # Save category summary
    summary = {}
    for p in products:
        cat = p['category']['slug']
        if cat not in summary:
            summary[cat] = []
        summary[cat].append({
            'name': p['name'],
            'slug': p['slug'],
            'filename': p['image'].split('/')[-1],
            'price': f"${p['priceMin']}-${p['priceMax']}",
        })

    with open('product-summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("Saved product-summary.json for review")

if __name__ == '__main__':
    main()
