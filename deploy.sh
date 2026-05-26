#!/bin/bash

# Supermarket SaaS - Quick Deploy Script
# This script helps you deploy to free platforms

echo "🚀 Supermarket SaaS - Deployment Setup"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "📝 Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit"
else
  echo "✅ Git repository already initialized"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  CREATE DATABASE (MongoDB Atlas)"
echo "   - Go to: https://www.mongodb.com/cloud/atlas"
echo "   - Create a free cluster"
echo "   - Get your connection string"
echo ""

echo "2️⃣  DEPLOY BACKEND (Railway)"
echo "   - Go to: https://railway.app"
echo "   - Connect your GitHub repo"
echo "   - Add MONGODB_URI environment variable"
echo "   - Note your backend URL"
echo ""

echo "3️⃣  DEPLOY FRONTEND (Vercel)"
echo "   - Go to: https://vercel.com"
echo "   - Connect your GitHub repo"
echo "   - Set VITE_API_BASE_URL to your backend URL"
echo "   - Your app will be live!"
echo ""

echo "4️⃣  UPDATE BACKEND CORS"
echo "   - Backend will auto-accept vercel.app domains"
echo ""

echo "📚 Full Guide: See DEPLOYMENT_GUIDE.md"
echo ""
