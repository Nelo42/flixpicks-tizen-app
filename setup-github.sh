#!/bin/bash
# Setup script for GitHub repository initialization
# This prepares the FlixPicks Tizen app for TizenBrew installation

set -e

echo "🚀 FlixPicks Tizen App - GitHub Setup"
echo "======================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: git is not installed"
    exit 1
fi

# Check if already a git repo
if [ -d .git ]; then
    echo "⚠️  Git repository already initialized"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Initialize git if not already
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
fi

# Check for required files
echo ""
echo "📋 Checking required files..."
REQUIRED_FILES=("appinfo.json" "config.xml" "index.html" "icon.png")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "❌ Missing required files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

echo "✅ All required files present"

# Show what will be committed
echo ""
echo "📝 Files to be committed:"
git add -n . 2>/dev/null | head -20 || echo "   (No new files to add)"
echo ""

# Ask for confirmation
read -p "Add all files and create initial commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Add files
echo ""
echo "📤 Adding files to git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit - FlixPicks Tizen app for TizenBrew

- Tizen API version 2.3 (compatible with Samsung S90C 2023)
- Ready for TizenBrew installation
- Includes appinfo.json for automatic certificate handling"

echo ""
echo "✅ Repository ready for GitHub!"
echo ""
echo "📋 Next steps:"
echo "   1. Create a new repository on GitHub (e.g., 'flixpicks-tizen-app')"
echo "   2. Run the following commands:"
echo ""
echo "      git remote add origin https://github.com/YOUR_USERNAME/flixpicks-tizen-app.git"
echo "      git branch -M main"
echo "      git push -u origin main"
echo ""
echo "   3. On your Samsung TV with TizenBrew:"
echo "      - Open TizenBrew app"
echo "      - Go to 'Install from GitHub'"
echo "      - Enter: YOUR_USERNAME/flixpicks-tizen-app"
echo ""
echo "🎉 Done!"

