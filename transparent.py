import os
from PIL import Image

def flood_fill_transparent(image_path, threshold=240):
    print(f"Processing: {image_path}")
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        return

    # Open image and convert to RGBA
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Visited grid
    visited = [[False for _ in range(height)] for _ in range(width)]
    
    # Queue for BFS
    queue = []

    # Helper to check if pixel is "white" (above threshold for R, G, B)
    def is_white(x, y):
        r, g, b, a = pixels[x, y]
        # Ignore already transparent pixels
        if a == 0:
            return False
        return r >= threshold and g >= threshold and b >= threshold

    # Initialize queue with boundary pixels
    # Top and bottom rows
    for x in range(width):
        for y in [0, height - 1]:
            if is_white(x, y) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True
    # Left and right columns
    for y in range(height):
        for x in [0, width - 1]:
            if is_white(x, y) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True

    # BFS to make connected boundary white pixels transparent
    count = 0
    while queue:
        cx, cy = queue.pop(0)
        
        # Make transparent
        pixels[cx, cy] = (0, 0, 0, 0)
        count += 1

        # Check 4 neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[nx][ny] and is_white(nx, ny):
                    queue.append((nx, ny))
                    visited[nx][ny] = True

    # Save the modified image temporarily to apply bounding box crop
    img.save(image_path, "PNG")
    print(f"Done background transparency. Made {count} boundary pixels transparent.")

    # Now, crop the transparent image to its non-transparent content boundary
    crop_to_content(image_path)

def crop_to_content(image_path):
    img = Image.open(image_path)
    # getbbox returns (left, upper, right, lower) bounding box of non-zero pixels
    bbox = img.getbbox()
    if bbox:
        # Crop to content
        cropped_img = img.crop(bbox)
        # Add a tiny padding around the cropped content so it doesn't touch the very edge
        # (gives it breathing room like SVG icons)
        w, h = cropped_img.size
        padding = max(2, int(min(w, h) * 0.05)) # 5% padding
        padded_img = Image.new("RGBA", (w + padding * 2, h + padding * 2), (0, 0, 0, 0))
        padded_img.paste(cropped_img, (padding, padding))
        
        padded_img.save(image_path, "PNG")
        print(f"Cropped and padded image saved: {image_path} (new size: {padded_img.size})")
    else:
        print(f"No non-transparent content found to crop in: {image_path}")

if __name__ == "__main__":
    assets_dir = r"D:\deadpool-live\assets"
    
    # Re-copy raw files from brain folder to ensure we start from the original images (with white backgrounds)
    import shutil
    brain_dir = r"C:\Users\sazan\.gemini\antigravity\brain\037d6463-4b6b-4c2e-9525-837f7437068b"
    
    shutil.copy(os.path.join(brain_dir, "media__1781525366309.png"), os.path.join(assets_dir, "jeffcord.png"))
    shutil.copy(os.path.join(brain_dir, "media__1781525372566.png"), os.path.join(assets_dir, "xmen.png"))
    print("Original files re-copied.")

    # Run transparency and cropping
    flood_fill_transparent(os.path.join(assets_dir, "jeffcord.png"), threshold=240)
    flood_fill_transparent(os.path.join(assets_dir, "xmen.png"), threshold=240)
