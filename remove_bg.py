from PIL import Image

# Open the image
img = Image.open('frontend/src/assets/2.png')

# Convert to RGBA if not already
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Get image data
data = img.getdata()

# Create new image data with white background made transparent
new_data = []
for item in data:
    # If pixel is white or near-white (R, G, B all > 240), make it transparent
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((255, 255, 255, 0))  # Transparent
    else:
        new_data.append(item)

# Put the new data back
img.putdata(new_data)

# Save the modified image
img.save('frontend/src/assets/2.png')
print("✓ Background removed successfully! Logo is now transparent.")
