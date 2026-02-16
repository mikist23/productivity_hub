@echo off
title GoalPilot - Quick Deployment
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the my-app directory
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Installation failed!
    pause
    exit /b 1
)

echo.
echo 🏗️ Running production build...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo 📋 Ready for deployment! Next steps:
echo 1. git add .
echo 2. git commit -m "Ready for deployment"
echo 3. git push origin main
echo 4. Deploy to Vercel ^(or run 'vercel --prod'^)
echo.
echo 🎉 Your GoalPilot is ready to launch!
echo.
pause
