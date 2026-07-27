import json
import urllib.request
import urllib.parse
import time

def get_unsplash_images(query, count=30):
    """使用Unsplash Source API获取图片URL（无需密钥）"""
    images = []
    # Unsplash Source API: https://source.unsplash.com/
    # 这个API会重定向到真实的Unsplash图片
    for _ in range(count):
        try:
            url = f"https://source.unsplash.com/400x400/?{urllib.parse.quote(query)}&sig={int(time.time() * 1000) + _}"
            req = urllib.request.Request(url, method='GET', headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req, timeout=5)
            # 获取重定向后的URL
            final_url = response.geturl()
            if final_url and 'images.unsplash.com' in final_url:
                images.append(final_url)
        except Exception as e:
            pass
        time.sleep(0.1)
    return images

# 但Unsplash Source API已弃用。让我使用其他方法

# 方法2: 使用 loremflickr.com (基于Flickr的图片服务)
def get_loremflickr_images(query, count=30):
    images = []
    for i in range(count):
        # loremflickr会基于关键词返回Flickr上的相关图片
        url = f"https://loremflickr.com/400/400/{urllib.parse.quote(query)}?lock={i+1}"
        images.append(url)
    return images

# 方法3: 使用 placehold.co 生成带文字的占位符
def get_placeholder_image(text, color='cccccc', text_color='000000'):
    encoded_text = urllib.parse.quote(text[:15])
    return f"https://placehold.co/400x400/{color}/{text_color}?text={encoded_text}&font=roboto"

# 测试哪种方法可行
print("Testing different image sources...")

# 测试LoremFlickr
test_url = "https://loremflickr.com/400/400/jewelry?lock=1"
try:
    req = urllib.request.Request(test_url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req, timeout=5)
    print(f"  LoremFlickr: {response.status} -> {response.geturl()}")
except Exception as e:
    print(f"  LoremFlickr: FAILED - {e}")

# 测试 placehold.co
test_url = "https://placehold.co/400x400/cccccc/000000.png?text=test"
try:
    req = urllib.request.Request(test_url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req, timeout=5)
    print(f"  placehold.co: {response.status}")
except Exception as e:
    print(f"  placehold.co: FAILED - {e}")
