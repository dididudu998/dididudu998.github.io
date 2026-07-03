@echo off
REM Deploy Astro Fuwari blog to GitHub Pages
REM Handles the _astro/ -> astro/ rename for GitHub Pages compatibility

echo ==^> Building Astro site...
call pnpm build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    exit /b 1
)

echo ==^> Renaming _astro to astro for GitHub Pages...
cd dist

if exist "_astro" (
    move _astro astro >nul
    REM Use PowerShell to do the find-replace
    powershell -Command "Get-ChildItem -Recurse -Include *.html,*.js,*.css | ForEach-Object { (Get-Content $_.FullName -Raw) -replace '/_astro/', '/astro/' | Set-Content $_.FullName -NoNewline }"
    echo    Done renaming.
)

echo ==^> Deploying to GitHub Pages...
if exist ".git" rmdir /s /q .git
git init
git add -A
git commit -m "Deploy Fuwari blog"
git branch -M master
git remote add origin git@github.com:dididudu998/dididudu998.github.io.git
git push --force origin master

echo ==^> Deploy complete!
