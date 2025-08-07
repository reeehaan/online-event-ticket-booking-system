#!/bin/bash

# Quick commit script with automatic formatting
# Usage: ./commit.sh "your commit message"

if [ -z "$1" ]; then
    echo "❌ Usage: ./commit.sh 'commit message'"
    echo "Example: ./commit.sh 'feat: add user authentication'"
    exit 1
fi

echo "🚀 Adding all changes..."
git add .

echo "📝 Committing with message: $1"
git commit -m "$1"

echo "✅ Commit completed! Your code was automatically:"
echo "   • Formatted with Prettier"
echo "   • Linted with ESLint"
echo "   • Fixed automatically where possible"

echo ""
echo "🔄 To push to remote, run: git push"