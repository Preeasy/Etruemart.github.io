#!/usr/bin/env python3
"""
Fix product data using the REAL existing category CUIDs in prisma/seed-data.json.

Correct schema:
  - Product.id is a UUID/CUID STRING (not int)
  - Product.categoryId is a CUID STRING matching categories[].id (not int!)
  - Product.category field is legacy/denorm (often None/dict); we populate it with name string for convenience.
  - Categories[].id is CUID string (cmsem... / cat-...).

Fixes applied:
  1. PRICE: Replace 800 wrong prices with AA-730 true USD values.
  2. NAME: Use AA-730 English description as the product title.
  3. DESCRIPTION: Populate with AA-730 professional English description.
  4. CATEGORY: Derive correct categoryId from SKU prefix (→ existing 92 categories).
  5. MOQ/Variants: Apply AA-730's MOQ, color, size, case pack.
  6. NEW SKUs: Append 30 products from 产品清单.xlsx (YS-* 款号), with UUID ids.
"""
import json, re, datetime, os, uuid

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(PROJ, 'scripts', 'data-exports')

# ====================== LOAD SOURCES ======================
with open(os.path.join(OUTDIR, 'aa730-products.json'), 'r', encoding='utf-8') as f:
    aa730 = json.load(f)
aa730_lookup = {k.lower(): v for k, v in aa730.items()}

with open(os.path.join(OUTDIR, 'site-images-products.json'), 'r', encoding='utf-8') as f:
    site_pics = json.load(f)

with open(os.path.join(PROJ, 'prisma', 'seed-data.json'), 'r', encoding='utf-8') as f:
    seed = json.load(f)
products = seed['products']
categories = seed.get('categories', [])
users = seed.get('users', [])

# Build category lookups: exact name → entry, id → entry
CAT_BY_NAME = {}
CAT_BY_ID = {}
for c in categories:
    nm = str(c.get('name') or '').strip()
    cid = str(c.get('id') or '')
    if nm:
        CAT_BY_NAME[nm] = c
    if cid:
        CAT_BY_ID[cid] = c

# Build product SKU index
SKU_INDEX = {}
for i, p in enumerate(products):
    s = str(p.get('sku') or '').strip()
    if s:
        SKU_INDEX.setdefault(s.lower(), []).append(i)

# ====================== SKU PREFIX → EXISTING CATEGORY NAME MAP ======================
# Map every YCS-<PREFIX>-NNN to the NAME of a CLOSEST-MATCHING existing category.
# Only categories that exist in the 92-item list are permitted (so categoryId CUID resolves).
PREFIX_CATEGORY = {
    # ===== Fashion Jewelry & Accessories (prefix → existing category name) =====
    'ACC':   'Accessories',
    'JWL':   'Fashion Jewelry',
    'MCS':   'Phone Accessories',
    'WAT':   'Fashion Jewelry',
    'HAT':   'Accessories',
    'SCA':   'Garment Accessories',
    'HAIR':  'Beauty & Personal Care',
    'BCS':   'Beauty & Personal Care',

    # ===== Bags =====
    'BAC':   'Bags',
    'BAG':   'Bags',
    'SKN':   'Bags',
    'HB':    'Bags',
    'LUG':   'Bags',

    # ===== Beauty / Personal Care / Health =====
    'BEA':   'Beauty & Personal Care',
    'MSF':   'Beauty & Personal Care',

    # ===== Apparel / Clothing / Shoes =====
    'CLT':   'Apparel & Shoes',
    'CLO':   'Clothing',
    'CL':    'Clothing',
    'UMB':   'Apparel & Shoes',
    'UND':   'Clothing',
    'SHO':   'Shoes',

    # ===== Kitchen / Tableware =====
    'CUP':   'Kitchen Supplies',
    'KW':    'Kitchen Supplies',
    'HAN':   'Kitchen Supplies',
    'HMK':   'Kitchen Supplies',
    'MUG':   'Kitchen Supplies',

    # ===== Home / Living / Storage / Cleaning / Decor / Appliances =====
    'HOM':   'Home & Living',
    'STO':   'Storage & Organization',
    'SFN':   'Home & Living',
    'CLN':   'Home & Living',
    'TOWEL': 'Home & Living',
    'HMK2':  'Home & Living',

    # ===== Electronics =====
    'ELE':   'Electronics',
    'ET':    'Electronics',

    # ===== Toys / Kids / Baby / Gifts / Pets =====
    'TOY':   'Toys',
    'KID':   'Mother, Baby & Toys',
    'PET':   'Pet Supplies',
    'GIF':   'Gift',

    # ===== Sports / Outdoor / Fitness =====
    'FIT':   'Sports & Outdoor',
    'BIK':   'Sports & Outdoor',
    'GAR':   'Home & Living',  # Garden → Home & Living (closest)
    'CAM':   'Sports & Outdoor',
    'SPO':   'Sports & Outdoor',

    # ===== Office / Stationery =====
    'STA':   'Stationery & Office',
    'OFC':   'Office Supplies',

    # ===== Auto / Tools / Hardware =====
    'OTH':   'Other',
    'ART':   'Auto & Tools',
    'AUT':   'Auto & Tools',
    'MOT':   'Auto & Tools',  # Motorcycle / Auto parts
    'HWR':   'Hardware & Home',  # Hardware
    'LOC':   'Hardware & Home',  # Locks

    # ===== Kitchen (extended prefixes) =====
    'KST':   'Kitchen Supplies',
    'KUT':   'Kitchen Supplies',

    # ===== Household / Decor / Home Appliances / Lighting =====
    'MHD':   'Home & Living',   # Merchandise / Home
    'HAB':   'Home & Living',   # Home & Bath
    'DGO':   'Home & Living',
    'MCH':   'Home & Living',
    'LED':   'Home Appliances',  # LED Lights
    'FAN':   'Home Appliances',  # Electric fans
    'KBM':   'Home & Living',
    'FTB':   'Home & Living',
    'SWI':   'Home & Living',

    # ===== Beauty / Personal Care =====
    'BTY':   'Beauty & Personal Care',
    'MSS':   'Beauty & Personal Care',  # Massage
    'PCR':   'Beauty & Personal Care',  # Personal Care
    'MSK':   'Beauty & Personal Care',  # Masks

    # ===== Electronics / Audio / Phone / Computer =====
    'AUS':   'Electronics',  # Audio
    'AVD':   'Electronics',  # Audio/Video
    'LAP':   'Electronics',  # Laptops
    'TAB':   'Electronics',  # Tablets
    'PHO':   'Phone Accessories',
    'BBC':   'Electronics',  # Bluetooth / Cable related

    # ===== Small Accessories / Merch =====
    'SMA':   'Accessories',   # Small Accessories
    'KAP':   'Accessories',

    # ===== Apparel / Socks / Underwear =====
    'SOC':   'Clothing',

    # ===== Outdoor =====
    'OUT':   'Sports & Outdoor',

    # ===== Musical Instruments =====
    'MUS':   'Musical Instruments',
}

def resolve_category_id(prefix):
    """Return (category_id_cuid, category_name_str) based on SKU prefix."""
    cat_name = PREFIX_CATEGORY.get(prefix.upper())
    if not cat_name and len(prefix) >= 3:
        cat_name = PREFIX_CATEGORY.get(prefix[:3].upper())
    if cat_name and cat_name in CAT_BY_NAME:
        c = CAT_BY_NAME[cat_name]
        return str(c['id']), cat_name
    # Fallback: "Other"
    fallback = CAT_BY_NAME.get('Other') or categories[0]
    return str(fallback['id']), str(fallback.get('name') or 'Other')

def slugify(s):
    s = str(s or '').lower().strip()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')

# ====================== STEP 1: FIX 800+ MATCHED PRODUCTS ======================
n_price = n_name = n_desc = n_cat = n_moq = 0
for sku_l, indices in SKU_INDEX.items():
    row = aa730_lookup.get(sku_l)
    if not row:
        continue
    cp = row.get('price')
    if not isinstance(cp, (int, float)):
        continue
    cp = round(float(cp), 2)
    cdesc = str(row.get('desc_en') or '').strip()
    moqv = row.get('moq')
    moqv = int(moqv) if isinstance(moqv, (int, float)) else None
    var_color = str(row.get('var_color') or '').strip() or None
    var_size  = str(row.get('var_size')  or '').strip() or None
    casepack  = row.get('case_pack')

    # Derive category from YCS-PREFIX (first 3-char chunk after YCS)
    m = re.match(r'ycs-([a-z]+)', sku_l)
    sub = m.group(1).split('-')[0] if m else ''
    target_cid, target_cname = resolve_category_id(sub)

    for idx in indices:
        p = products[idx]
        try:  old_price = float(p.get('price') or 0)
        except: old_price = 0
        # Fix price
        if abs(old_price - cp) > 0.01:
            p['price'] = cp
            p['priceMin'] = cp
            p['priceMax'] = cp
            p['originalPrice'] = round(cp * 1.4, 2)
            p['updatedAt'] = now_iso()
            n_price += 1
        # Fix description (use AA-730 professional English desc — always preferred)
        if cdesc and cdesc != (str(p.get('description') or '').strip()):
            p['description'] = cdesc
            n_desc += 1
            p['updatedAt'] = now_iso()
        # Fix name: AA-730 English title preferred (short, SEO-friendly)
        if cdesc and len(cdesc.split()) >= 2:
            if p.get('name') != cdesc:
                p['name'] = cdesc
                tail = str(p.get('sku') or str(p.get('id') or ''))
                p['slug'] = slugify(cdesc + ' ' + tail)[:90]
                n_name += 1
                p['updatedAt'] = now_iso()
        # Fix categoryId & category name (string denorm)
        if p.get('categoryId') != target_cid:
            p['categoryId'] = target_cid
            n_cat += 1
            p['updatedAt'] = now_iso()
        # Ensure legacy "category" field always has the string name for convenience
        if not isinstance(p.get('category'), str) or p.get('category') != target_cname:
            p['category'] = target_cname
        # Fix MOQ
        if moqv is not None and (not p.get('moq') or p.get('moq') in (1, '1')):
            p['moq'] = moqv
            n_moq += 1
            p['updatedAt'] = now_iso()
        # Variants
        if var_color and not p.get('color'):
            p['color'] = var_color
        if var_size and not p.get('size'):
            p['size'] = var_size
        if casepack and not p.get('packSize'):
            p['packSize'] = str(casepack)

# ====================== STEP 2: ADD 30 NEW SKUs (产品清单.xlsx YS-*款号) ======================
added = []
PREFIX_FOR_NEW = {
    'CL': 'Clothing',
    'HB': 'Bags',
    'ET': 'Electronics',
    'KW': 'Kitchen Supplies',
}
def resolve_new(prefix_short):
    nm = PREFIX_FOR_NEW.get(prefix_short, 'Other')
    if nm in CAT_BY_NAME:
        c = CAT_BY_NAME[nm]
        return str(c['id']), nm
    fb = CAT_BY_NAME.get('Other') or categories[0]
    return str(fb['id']), str(fb.get('name') or 'Other')

ENGLISH_FOR_PREFIX = {
    'CL': 'Bulk Apparel & Fashion Clothing Set',
    'HB': 'Trendy Fashion Handbag for Wholesale',
    'ET': 'Premium Consumer Electronics Device',
    'KW': 'Kitchenware Cooking & Dining Product',
}
for sp in site_pics:
    sku = str(sp.get('sku') or '').strip()
    sku_l = sku.lower()
    if sku_l in aa730_lookup or sku_l in SKU_INDEX:
        continue  # Already exists
    try:
        price = round(float(sp.get('price') or 0), 2)
    except:
        price = 0
    if price <= 0:
        continue
    m2 = re.match(r'ys-([a-z]+)', sku_l)
    subraw = m2.group(1).upper() if m2 else ''
    if   subraw.startswith('CL'): pfx = 'CL'
    elif subraw.startswith('HB'): pfx = 'HB'
    elif subraw.startswith('ET'): pfx = 'ET'
    elif subraw.startswith('KW'): pfx = 'KW'
    else:                          pfx = subraw[:2]
    cid, cname = resolve_new(pfx)
    english_ext = ENGLISH_FOR_PREFIX.get(pfx, 'Wholesale Bulk MOQ Product')
    product_name_en = f'{sku} Premium {english_ext} - B2B Wholesale'
    vendor = str(sp.get('vendor') or 'Verified Supplier, Yiwu China')
    spec   = str(sp.get('spec') or '')
    moqv = sp.get('moq')
    try:    moqv = int(moqv) if moqv else None
    except: moqv = None
    pack_s = sp.get('pack_size')
    desc_parts = [product_name_en]
    if spec:
        clean = spec.replace('【', ' ').replace('】', ' ').replace('|', ' · ').strip()
        desc_parts.append('Specifications: ' + clean)
    desc_parts.append('Supplier: ' + vendor + ' | Item Code: ' + sku)
    if moqv:
        desc_parts.append('Minimum Order Quantity (MOQ): ' + str(moqv) + ' pieces')
    if pack_s:
        desc_parts.append('Pack Size: ' + str(pack_s))
    desc_parts.append(
        'Factory-direct wholesale pricing. Designed for B2B importers: '
        'Europe, USA, Middle East, Africa, Latin America. OEM/ODM welcome, sample orders available.'
    )
    description = ' | '.join(desc_parts)
    keywords = f'{pfx} wholesale, China factory direct, bulk MOQ, B2B sourcing, {cname.lower()}, OEM ODM'
    sup_city = vendor.split('市')[0] if '市' in vendor else 'Yiwu, Zhejiang'
    pid = str(uuid.uuid4())
    p_new = {
        'id': pid,
        'sku': sku,
        'name': product_name_en,
        'slug': slugify(product_name_en + ' ' + sku)[:90],
        'description': description,
        'price': price,
        'priceMin': price,
        'priceMax': price,
        'originalPrice': round(price * 1.4, 2),
        'image': '',
        'images': [],
        'category': cname,
        'categoryId': cid,
        'stock': 9999,
        'rating': 4.8,
        'reviewCount': 0,
        'salesCount': 0,
        'isPublished': True,
        'shippingCost': 0,
        'shippingMethod': 'FOB Ningbo / Shanghai',
        'material': 'Factory Standard (OEM customizable)',
        'plating': None,
        'process': 'OEM / ODM Available',
        'color': 'As pictured / Customizable',
        'size': None,
        'packSize': str(pack_s) if pack_s else None,
        'pkgLength': None,
        'pkgWidth': None,
        'pkgHeight': None,
        'pkgWeight': None,
        'keywords': keywords,
        'origin': 'China',
        'supplierCity': sup_city,
        'stockStatus': 'In Stock',
        'moq': moqv or 50,
        'aplus': True,
        'createdAt': now_iso(),
        'updatedAt': now_iso(),
        'authorId': 1,
        'isParent': False,
        'parentId': None,
        'variantChildren': [],
    }
    products.append(p_new)
    added.append(p_new)

# ====================== STEP 3: SANITY — remove any product with invalid categoryId ======================
# Make sure every product.categoryId resolves to a real entry in categories list
valid_ids = set(CAT_BY_ID.keys())
fallback_id = list(CAT_BY_NAME.get('Other', categories[0]).keys())
fallback_cat = CAT_BY_NAME.get('Other') or categories[0]
fbcid = str(fallback_cat['id'])
fbname = str(fallback_cat.get('name') or 'Other')
for p in products:
    cid = str(p.get('categoryId') or '')
    if cid not in valid_ids:
        p['categoryId'] = fbcid
    if not isinstance(p.get('category'), str):
        # try fill in by categoryId
        if p['categoryId'] in CAT_BY_ID:
            p['category'] = CAT_BY_ID[p['categoryId']].get('name') or fbname
        else:
            p['category'] = fbname

# ====================== STEP 4: SAVE ======================
out_path = os.path.join(PROJ, 'prisma', 'seed-data.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(
        {'users': users, 'categories': categories, 'products': products},
        f, ensure_ascii=False, indent=2
    )

print("=" * 70)
print("✅ PRODUCT DATA FIX REPORT")
print("=" * 70)
print(f"  价格修正 (→ AA-730 真实美元价)   : {n_price} SKUs")
print(f"  标题修正 (→ AA-730 英文品名)     : {n_name} SKUs")
print(f"  描述修正 (→ AA-730 专业英文描述) : {n_desc} SKUs")
print(f"  分类修正 (→ 92 分类表正确CUID)   : {n_cat} SKUs")
print(f"  MOQ 修正  (→ AA-730 MOQ)         : {n_moq} SKUs")
print(f"\n  新增商品 (YS-* 款号)             : {len(added)} SKUs")
for a in added:
    print(f"    ✨  {a['sku']:>15}  ${a['price']:<8}  [{a['category']}]  {a['name'][:75]}")
print(f"\n  修复后商品总数 : {len(products)}")
print(f"  分类总数       : {len(categories)}")
prices = [p['price'] for p in products if isinstance(p.get('price'), (int, float)) and p['price'] > 0]
if prices:
    sp = sorted(prices)
    print(f"  美元价格范围   : ${min(prices):.2f}  ~  ${max(prices):.2f}")
    print(f"  中位价         : ${sp[len(sp)//2]:.2f}")
    print(f"  Top 10 最低:   ", [f'${v:.2f}' for v in sp[:10]])
    print(f"  Top 10 最高:   ", [f'${v:.2f}' for v in sp[-10:]])
# Category distribution sanity check
from collections import Counter
cdist = Counter()
for p in products:
    cname = p.get('category') if isinstance(p.get('category'), str) else 'Unknown'
    cdist[cname] += 1
print(f"\n  商品分类分布 (Top 15):")
for nm, cnt in cdist.most_common(15):
    print(f"     {cnt:>4}  {nm}")
print(f"\n✅ 已写入: {out_path}")
