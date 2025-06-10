import os
import requests

save_dir = "public/images"
os.makedirs(save_dir, exist_ok=True)

with open("image_urls.txt", "r", encoding="utf-8") as f:
    urls = [line.strip() for line in f if line.strip()]

for url in urls:
    filename = url.split("/")[-1].split("?")[0]
    local_path = os.path.join(save_dir, filename)
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        with open(local_path, "wb") as img_file:
            img_file.write(resp.content)
        print(f"Downloaded: {url} -> {local_path}")
    except Exception as e:
        print(f"Failed: {url} ({e})") 