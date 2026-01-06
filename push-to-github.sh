#!/bin/bash
# Push FlixPicks Tizen app to GitHub
# Usage: ./push-to-github.sh YOUR_USERNAME [REPO_NAME]
# Example: ./push-to-github.sh myusername
# Example: ./push-to-github.sh myusername flixpicks-tizen-app

set -e

if [ -z "$1" ]; then
    echo "❌ Error: GitHub username required"
    echo ""
    echo "Usage: $0 YOUR_USERNAME [REPO_NAME]"
    echo "Example: $0 myusername"
    echo "Example: $0 myusername flixpicks-tizen-app"
    exit 1
fi

GITHUB_USER="$1"
REPO_NAME="${2:-flixpicks-tizen-app}"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "🚀 FlixPicks Tizen App - Push to GitHub"
echo "======================================="
echo ""
echo "Repository: ${REPO_URL}"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    CURRENT_URL=$(git remote get-url origin)
    echo "⚠️  Remote 'origin' already exists: ${CURRENT_URL}"
    read -p "Replace with ${REPO_URL}? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "${REPO_URL}"
        echo "✅ Remote updated"
    else
        echo "Cancelled"
        exit 0
    fi
else
    git remote add origin "${REPO_URL}"
    echo "✅ Remote added"
fi

echo ""
echo "📤 Pushing to GitHub..."
echo ""

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📱 To install on your Samsung S90C TV:"
    echo "   1. Open TizenBrew on your TV"
    echo "   2. Go to 'Install from GitHub'"
    echo "   3. Enter: ${GITHUB_USER}/${REPO_NAME}"
    echo ""
    echo "🎉 Done!"
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo "  - Repository doesn't exist on GitHub (create it first)"
    echo "  - Authentication required (use GitHub CLI or SSH keys)"
    echo "  - Branch name mismatch (repository might use 'master' instead of 'main')"
    echo ""
    echo "To create the repository on GitHub:"
    echo "  1. Go to: https://github.com/new"
    echo "  2. Repository name: ${REPO_NAME}"
    echo "  3. Make it public (or ensure TizenBrew has access)"
    echo "  4. Don't initialize with README, .gitignore, or license"
    echo "  5. Then run this script again"
    exit 1
fi

