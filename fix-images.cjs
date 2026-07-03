/**
 * Fix image paths in Astro/Fuwari posts and create placeholders for missing images
 */
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join('D:', 'QoderWork-Space', 'blog-astro', 'src', 'content', 'posts');
const PUBLIC_DIR = path.join('D:', 'QoderWork-Space', 'blog-astro', 'public');

let fixedPaths = 0;
let placeholdersCreated = 0;

// Collect all image references
const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
const allRefs = new Map(); // path -> [files]

for (const file of fs.readdirSync(POSTS_DIR)) {
  if (!file.endsWith('.md')) continue;
  const filePath = path.join(POSTS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  const matches = [...content.matchAll(imgRegex)];
  for (const match of matches) {
    let imgPath = match[2];

    // Skip external URLs
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) continue;

    // Normalize: add leading / if missing
    if (!imgPath.startsWith('/')) {
      imgPath = '/' + imgPath;
      // Replace in content
      content = content.replace(match[0], `![${match[1]}](${imgPath})`);
      modified = true;
      fixedPaths++;
    }

    // Track reference
    if (!allRefs.has(imgPath)) allRefs.set(imgPath, []);
    allRefs.get(imgPath).push(file);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

console.log(`Fixed ${fixedPaths} relative image paths to absolute.\n`);

// Check for missing images and create placeholders
const placeholderPath = path.join(PUBLIC_DIR, 'images', 'tupian', 'infobloxoption.jpg');
const placeholderBuf = fs.readFileSync(placeholderPath);

for (const [imgPath, files] of allRefs) {
  const fullPath = path.join(PUBLIC_DIR, imgPath);
  if (!fs.existsSync(fullPath)) {
    // Create directory if needed
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    // Copy placeholder
    fs.copyFileSync(placeholderPath, fullPath);
    console.log(`  PLACEHOLDER: ${imgPath} (referenced in: ${files.join(', ')})`);
    placeholdersCreated++;
  }
}

console.log(`\nCreated ${placeholdersCreated} placeholder images.`);
