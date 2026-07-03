/**
 * Jekyll to Astro/Fuwari Migration Script
 */
const fs = require('fs');
const path = require('path');

const JEKYLL_DIR = path.join('D:', 'QoderWork-Space', 'blog-jekyll', '_posts');
const ASTRO_POSTS_DIR = path.join('D:', 'QoderWork-Space', 'blog-astro', 'src', 'content', 'posts');

// Ensure output dir exists
fs.mkdirSync(ASTRO_POSTS_DIR, { recursive: true });

const categoryMap = {
  'dailyrecord': 'dailyrecord',
  'life': 'life',
  'tech': 'tech',
  '一些记录': '一些记录',
  '学习': '学习',
  '看书': '看书'
};

let totalMigrated = 0;
let totalSkipped = 0;

function parseFrontMatter(content) {
  content = content.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { frontMatter: {}, body: content };

  const fmStr = match[1];
  const body = match[2];
  const fm = {};
  const lines = fmStr.split('\n');
  let currentKey = null;
  let inList = false;

  for (const line of lines) {
    if (line.trim() === '') continue;
    if (inList && line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim();
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(value);
      continue;
    }
    inList = false;
    const kvMatch = line.match(/^(\w[\w_]*)\s*:\s*(.*)?$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = (kvMatch[2] || '').trim();
      currentKey = key;
      if (value.startsWith('[') && value.endsWith(']')) {
        const items = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        fm[key] = items.filter(s => s.length > 0);
        inList = false;
      } else if (value === '' || value === undefined) {
        fm[key] = [];
        inList = true;
      } else {
        value = value.replace(/^['"]|['"]$/g, '');
        fm[key] = value;
        inList = false;
      }
    }
  }
  return { frontMatter: fm, body };
}

function extractDateFromFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function convertJekyllBody(body) {
  // Convert Jekyll highlight blocks
  body = body.replace(
    /\{%\s*highlight\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endhighlight\s*%\}/g,
    (_, lang, code) => `\`\`\`${lang}\n${code.trim()}\n\`\`\``
  );
  // Remove Jekyll includes
  body = body.replace(/\{%\s*include\s+[^%]*%\}/g, '');
  // Remove raw/endraw
  body = body.replace(/\{%\s*raw\s*%\}/g, '');
  body = body.replace(/\{%\s*endraw\s*%\}/g, '');
  // Remove site.baseurl
  body = body.replace(/\{\{[^}]*site\.baseurl[^}]*\}\}/g, '');
  return body;
}

function generateFuwariFrontMatter(fm, date, category) {
  let output = '---\n';
  const titleStr = String(fm.title || 'Untitled').replace(/"/g, '\\"');
  output += `title: "${titleStr}"\n`;
  output += `published: ${date}\n`;
  output += `draft: false\n`;

  // Description
  if (fm.description) {
    const descStr = String(fm.description).trim();
    if (descStr.length > 0) {
      output += `description: "${descStr.replace(/"/g, '\\"')}"\n`;
    }
  }

  // Category (singular in Fuwari)
  const cat = fm.category || category || 'uncategorized';
  output += `category: "${String(cat)}"\n`;

  // Tags
  if (fm.tags && Array.isArray(fm.tags) && fm.tags.length > 0) {
    const tagList = fm.tags.map(t => `"${String(t).replace(/"/g, '\\"')}"`).join(', ');
    output += `tags: [${tagList}]\n`;
  }

  output += '---\n';
  return output;
}

function migratePosts() {
  const subdirs = fs.readdirSync(JEKYLL_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const subdir of subdirs) {
    const category = categoryMap[subdir] || subdir;
    const dirPath = path.join(JEKYLL_DIR, subdir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.markdown'));

    for (const file of files) {
      const date = extractDateFromFilename(file);
      if (!date) {
        console.log(`  SKIP (no date): ${subdir}/${file}`);
        totalSkipped++;
        continue;
      }

      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontMatter, body } = parseFrontMatter(content);

      if (!frontMatter.title) {
        console.log(`  SKIP (no title): ${subdir}/${file}`);
        totalSkipped++;
        continue;
      }

      const convertedBody = convertJekyllBody(body);
      const fuwariFm = generateFuwariFrontMatter(frontMatter, date, category);
      const output = fuwariFm + '\n' + convertedBody;

      // Fuwari uses slug-based filenames
      const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.markdown$/, '.md');
      const outputFile = slug;
      const outputPath = path.join(ASTRO_POSTS_DIR, outputFile);

      // Handle duplicates
      let finalPath = outputPath;
      let counter = 1;
      while (fs.existsSync(finalPath)) {
        const ext = path.extname(outputFile);
        const name = path.basename(outputFile, ext);
        finalPath = path.join(ASTRO_POSTS_DIR, `${name}-${counter}${ext}`);
        counter++;
      }

      fs.writeFileSync(finalPath, output, 'utf-8');
      totalMigrated++;
    }
  }
}

console.log('Starting migration from Jekyll to Astro/Fuwari...\n');
migratePosts();
console.log(`\nMigration complete!`);
console.log(`  Migrated: ${totalMigrated} posts`);
console.log(`  Skipped:  ${totalSkipped} posts`);
