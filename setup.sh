#!/bin/bash
# Installation and startup script for the Trading Bot

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Hyperliquid Trading Signal Bot - Setup Script         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo

# Step 2: Check for .env file
echo "🔐 Checking configuration..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials"
    echo "Instructions:"
    echo "  1. Get bot token from @BotFather on Telegram"
    echo "  2. Get chat ID from your bot"
    echo "  3. Edit .env file with these values"
    echo "  4. Run this script again"
    exit 1
fi

echo "✅ Configuration file found"
echo

# Step 3: Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"
echo

# Step 4: Start bot
echo "🚀 Starting bot..."
echo "Press Ctrl+C to stop"
echo

npm start
