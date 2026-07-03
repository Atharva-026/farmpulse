from PIL import Image

# Open the favicon
favicon = Image.open('frontend/public/favicon.png')

# Increase size by 150% (1.5x)
new_size = (int(favicon.width * 1.5), int(favicon.height * 1.5))
favicon_resized = favicon.resize(new_size, Image.Resampling.LANCZOS)

# Save the resized favicon
favicon_resized.save('frontend/public/favicon.png')
print(f"✓ Favicon resized from {favicon.size} to {new_size}")
