@echo off
echo ========================================
echo   Force Chrome Extension Reload
echo ========================================
echo.
echo Step 1: Removing old dist folder...
rmdir /s /q "C:\Users\Tahir\Desktop\Extension\dist" 2>nul
echo.
echo Step 2: Rebuilding extension...
cd /d "C:\Users\Tahir\Desktop\Extension"
call npm run build
echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Now do this in Chrome:
echo 1. Go to: chrome://extensions/
echo 2. Click REMOVE on "Subscription Guardian"
echo 3. Click "Load unpacked"
echo 4. Select: C:\Users\Tahir\Desktop\Extension\dist
echo 5. Reload any test pages (Ctrl+Shift+R)
echo.
pause
