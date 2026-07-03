from PIL import Image, ImageDraw

# Create a new square image with transparent background
size = 3000
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Draw white circle in the center
circle_radius = 1450
center = (size // 2, size // 2)
bbox = [
    center[0] - circle_radius,
    center[1] - circle_radius,
    center[0] + circle_radius,
    center[1] + circle_radius
]
draw.ellipse(bbox, fill=(255, 255, 255, 255))

# Draw green leaf (upper part of circle)
leaf_color = (102, 187, 106, 255)  # Green color
# Top leaf
top_leaf = [
    (center[0], center[1] - circle_radius + 150),  # top point
    (center[0] - 400, center[1] - 300),
    (center[0], center[1] + 400),
    (center[0] + 400, center[1] - 300),
]
draw.polygon(top_leaf, fill=leaf_color)

# Draw darker green stem/root (lower part)
darker_green = (66, 133, 66, 255)
bottom_leaf = [
    (center[0], center[1] + 400),
    (center[0] - 300, center[1] + 900),
    (center[0] + 300, center[1] + 900),
]
draw.polygon(bottom_leaf, fill=darker_green)

# Draw center dot (yellow/gold)
dot_radius = 100
dot_bbox = [
    center[0] - dot_radius,
    center[1] - dot_radius,
    center[0] + dot_radius,
    center[1] + dot_radius
]
draw.ellipse(dot_bbox, fill=(255, 193, 7, 255))

# Save the image
img.save('frontend/src/assets/2.png')
print("✓ Logo created with white circle background inside!")
