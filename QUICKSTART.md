# 🚀 Quick Start Guide

Get Subscription Guardian running in 5 minutes.

## Prerequisites

- Node.js 16+ and npm
- Google Chrome browser
- Text editor (VS Code recommended)

## Installation Steps

### 1. Install Dependencies (2 min)

```bash
cd subscription-guardian
npm install
```

This will install:
- React & ReactDOM
- TypeScript
- Webpack & loaders
- Chrome types

### 2. Build the Extension (1 min)

```bash
npm run build
```

This creates a `dist/` folder with the compiled extension.

**For development mode** (auto-rebuild on changes):
```bash
npm run dev
```

### 3. Load in Chrome (1 min)

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `dist` folder
5. ✅ Extension loaded!

### 4. Test It (1 min)

1. Open `demo/subscription-page.html` in Chrome
2. See the detection alert pop up
3. Click "Track This Subscription"
4. Open extension popup (click icon) to see dashboard

---

## Common Issues

### Build Fails

**Error**: `Cannot find module 'webpack'`
**Fix**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Error**: TypeScript errors
**Fix**: Run `npm run type-check` to see details

### Extension Not Loading

**Issue**: "Manifest file is missing or unreadable"
**Fix**: Make sure you selected the `dist` folder, not the root folder

**Issue**: Extension loads but doesn't work
**Fix**: 
1. Check `chrome://extensions/` for errors
2. Click "Errors" button if present
3. Rebuild with `npm run build`

### Detection Not Working

**Issue**: No alert appears on subscription pages
**Fix**:
1. Open Chrome DevTools (F12)
2. Check Console for errors
3. Make sure page contains keywords like "subscription" or "free trial"
4. Reload the page

---

## Development Workflow

### Making Changes

1. **Content Script** (detection logic):
   - Edit `src/content/content.ts`
   - Changes affect page scanning

2. **Background Worker** (notifications, storage):
   - Edit `src/background/background.ts`
   - Changes affect alarms and messaging

3. **Popup UI** (dashboard):
   - Edit `src/popup/App.tsx`
   - Changes affect the extension popup

4. **Detection Algorithm**:
   - Edit `src/utils/detector.ts`
   - Changes affect risk scoring and keyword matching

### Testing Changes

```bash
# Rebuild
npm run build

# In Chrome:
# 1. Go to chrome://extensions/
# 2. Click the reload icon on your extension
# 3. Reload any test pages
```

### Debugging

**Content Script**:
- Open DevTools on the webpage (F12)
- Check Console for logs prefixed with 🔍

**Background Worker**:
- Go to `chrome://extensions/`
- Click "Service worker" link
- Console opens for background script

**Popup**:
- Right-click extension icon
- Select "Inspect popup"
- DevTools opens for popup

---

## File Structure Quick Reference

```
src/
├── background/
│   └── background.ts       # Chrome alarms, notifications, storage
├── content/
│   └── content.ts          # Page detection, in-page alerts
├── popup/
│   ├── App.tsx             # Dashboard UI
│   └── index.tsx           # React mount
├── types/
│   └── index.ts            # TypeScript interfaces
└── utils/
    ├── detector.ts         # Detection algorithms
    └── storage.ts          # Chrome storage wrapper
```

---

## Next Steps

### For Hackathon Demo

1. **Record demo video**:
   - Show detection on demo page
   - Show dashboard with subscriptions
   - Show notification (simulate time)

2. **Create pitch deck**:
   - Problem statement
   - Solution overview
   - Technical architecture
   - Impact potential

3. **Polish README**:
   - Add screenshots
   - Add demo GIF
   - Update statistics

### For Production

1. **Create icons**:
   - Design 16x16, 48x48, 128x128 PNG files
   - Use shield emoji or gradient design
   - Place in `public/icons/`

2. **Test on real sites**:
   - Netflix, Spotify, Adobe, etc.
   - Adjust detection keywords as needed

3. **Prepare for Chrome Web Store**:
   - Create promotional images (1280x800, 640x400)
   - Write store description
   - Create privacy policy page

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Type checking only
npm run type-check

# Clean build
rm -rf dist/ && npm run build
```

---

## Getting Help

- Check error logs in Chrome DevTools
- Review the main README.md for architecture details
- Check demo/README.md for testing guidance
- Open an issue on GitHub (if open source)

---

**Pro Tip**: Keep Chrome DevTools open while developing. Errors will appear there immediately.

**Time-Saving Tip**: Use `npm run dev` during development so you don't have to manually rebuild after every change.
