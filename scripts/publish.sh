#!/bin/bash

# Universal CLI History MCP - Publish Script

echo "🚀 Publishing Universal CLI History MCP Server"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if logged in to npm
if ! npm whoami &> /dev/null; then
    echo "❌ Error: Not logged in to npm. Run 'npm login' first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Clean and install
echo "📦 Installing dependencies..."
npm ci

# Build project
echo "🔨 Building project..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Build failed."
    exit 1
fi

# Dry run first
echo "🔍 Running dry publish..."
npm publish --dry-run

# Confirm publish
read -p "Continue with actual publish? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publish cancelled."
    exit 0
fi

# Publish to npm
echo "🚀 Publishing to npm..."
npm publish

if [ $? -eq 0 ]; then
    echo "✅ Successfully published to npm!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Create a GitHub release"
    echo "2. Update documentation"
    echo "3. Share on social media"
    echo "4. Add to MCP registry"
else
    echo "❌ Failed to publish to npm."
    exit 1
fi