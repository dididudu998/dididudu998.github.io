#!/bin/bash
# Deploy Astro Fuwari blog to GitHub Pages
# This script handles the _astro/ -> astro/ rename for GitHub Pages compatibility

set -e

echo "==> Building Astro site..."
pnpm build

echo "==> Renaming _astro/ to astro/ for GitHub Pages..."
cd dist

if [ -d "_astro" ]; then
  mv _astro astro
  # Update all references from /_astro/ to /astro/
  find . -name "*.html" -exec sed -i 's|/_astro/|/astro/|g' {} +
  find . -name "*.js" -exec sed -i 's|/_astro/|/astro/|g' {} +
  find . -name "*.css" -exec sed -i 's|/_astro/|/astro/|g' {} +
  echo "   Done renaming."
fi

echo "==> Deploying to GitHub Pages..."
rm -rf .git
git init
git add -A
git commit -m "Deploy Fuwari blog $(date +%Y-%m-%d)"
git branch -M master
git remote add origin git@github.com:dididudu998/dididudu998.github.io.git
git push --force origin master

echo "==> Deploy complete!"
