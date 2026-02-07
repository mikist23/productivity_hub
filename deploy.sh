#!/bin/bash

echo "🚀 Productivity App - Quick Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the my-app directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Running production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Ready for deployment! Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Ready for deployment'"
    echo "3. git push origin main"
    echo "4. Deploy to Vercel (or run 'vercel --prod')"
    echo ""
    echo "🎉 Your productivity app is ready to launch!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi