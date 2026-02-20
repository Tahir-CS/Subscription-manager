# Extension Icons

## Current Status
This folder needs icon PNG files for the extension to display properly.

## Required Files
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## Quick Solution

### Option 1: Use Online Converter
1. Open `icon.svg` in this folder
2. Go to https://cloudconvert.com/svg-to-png
3. Upload the SVG
4. Convert to PNG at 128x128
5. Use https://www.iloveimg.com/resize-image to create 48x48 and 16x16 versions
6. Save as `icon128.png`, `icon48.png`, `icon16.png`

### Option 2: Use Favicon Generator
1. Go to https://favicon.io/favicon-converter/
2. Upload any shield or lock image
3. Generate favicon pack
4. Rename files to match our naming convention
5. Place in this folder

### Option 3: Use Emoji (Quick Hack)
1. Go to https://emoji.supply/kitchen/
2. Select shield emoji 🛡️
3. Download at 128x128
4. Resize to create smaller versions
5. Place in this folder

### Option 4: Manual Design (Best Quality)
Use Figma, Canva, or Photoshop:
- Create 128x128 canvas
- Purple/blue gradient background (#667eea to #764ba2)
- White shield shape in center
- Checkmark or lock symbol
- Export at 128x128, 48x48, 16x16

## Design Guidelines
- **Colors**: Purple (#667eea), Blue (#764ba2), White
- **Style**: Modern, clean, minimalist
- **Symbol**: Shield, lock, or checkmark
- **Background**: Gradient or solid color
- **Border**: Rounded corners optional

## Temporary Workaround
If you need to test immediately without icons:
1. Create any 16x16, 48x48, and 128x128 PNG files
2. Save with correct names in this folder
3. Rebuild the extension

The extension will work without icons, but won't look professional.

## Testing Icons
After adding icons:
1. Rebuild: `npm run build`
2. Reload extension in Chrome
3. Check toolbar - icon should appear
4. Check extension popup - icon should be visible
