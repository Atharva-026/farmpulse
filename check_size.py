from PIL import Image

logo = Image.open('d:\farmpulse\frontend\src\assets\2.png')
favicon = Image.open('d:\farmpulse\frontend\public\favicon.png')

print(f"Logo size: {logo.size}")
print(f"Favicon size: {favicon.size}")
