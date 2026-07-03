from PIL import Image

# Open the image
img = Image.open('frontend/src/assets/2.png')

# Increase size by 150% (1.5x)
new_size = (int(img.width * 1.5), int(img.height * 1.5))
img_resized = img.resize(new_size, Image.Resampling.LANCZOS)

# Save the resized image
img_resized.save('frontend/src/assets/2.png')
print(f"✓ Logo resized from {img.size} to {new_size}")
