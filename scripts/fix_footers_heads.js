const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'public', 'views');

const routeMap = {
  'home': '/',
  'about': '/about',
  'project': '/project-management',
  'project management': '/project-management',
  'blog': '/blog',
  'contact': '/contact us',
  'contact us': '/contact us',
  'programming': '/programming',
  'data analytics': '/data-analytics',
  'data analysis': '/data-analytics',
  'data analytics': '/data-analytics',
  'digital marketing': '/digital-marketing',
  'graphic design': '/graphic-design',
  'ui/ux design': '/ui-ux',
  'ux/ui design': '/ui-ux',
  'ui/ux': '/ui-ux',
  'video editing': '/video-editing',
  'cyber security': '/cybersecurity',
  'cybersecurity': '/cybersecurity',
  'courses': '/courses'
};

function mapLinkText(text) {
  if (!text) return null;
  const cleaned = text.replace(/\(.*\)/, '').trim().toLowerCase();
  return routeMap[cleaned] || null;
}

function fixFooter(html) {
  const footerStart = html.search(/<footer[\s\S]*?>/i);
  const footerEnd = html.search(/<\/footer>/i);
  if (footerStart === -1 || footerEnd === -1) return { changed: false, html };

  const before = html.slice(0, footerStart);
  const footer = html.slice(footerStart, footerEnd + 9);
  const after = html.slice(footerEnd + 9);

  // Replace placeholder href="#" for anchors whose text maps to a known route
  const updatedFooter = footer.replace(/<a\s+href=\"#\"\s*>([^<]+)<\/a>/gi, (m, p1) => {
    const mapped = mapLinkText(p1);
    if (mapped) return `<a href="${mapped}">${p1}</a>`;
    return m; // leave unchanged
  });

  // Also replace some common local file references to route paths
  const fileToRouteReplacements = [
    { from: /index\.html/gi, to: '/' },
    { from: /about(?: us)?\.html/gi, to: '/about' },
    { from: /courses\.html/gi, to: '/courses' },
    { from: /programming\.html/gi, to: '/programming' },
    { from: /project-management\.html/gi, to: '/project-management' },
    { from: /blog\.html/gi, to: '/blog' },
    { from: /contact(?: us)?(?: \.html)?/gi, to: '/contact us' },
    { from: /cyber-?security\.html/gi, to: '/cybersecurity' },
    { from: /data-analytics\.html/gi, to: '/data-analytics' },
    { from: /digital-marketing\.html/gi, to: '/digital-marketing' },
    { from: /graphic-design\.html/gi, to: '/graphic-design' },
    { from: /ui-ux\.html/gi, to: '/ui-ux' },
    { from: /video-editing\.html/gi, to: '/video-editing' }
  ];

  let replaced = updatedFooter;
  for (const r of fileToRouteReplacements) {
    replaced = replaced.replace(r.from, r.to);
  }

  // Clean up anchor duplicates or odd spacing
  const cleanedFooter = replaced.replace(/href=\"\s*\/\s*\"/g, 'href="/"');

  const newHtml = before + cleanedFooter + after;
  return { changed: newHtml !== html, html: newHtml };
}

function fixHead(html) {
  // Remove Font Awesome 4.x includes
  let newHtml = html.replace(/<link[^>]*font-awesome(?:.4|4\.|4)\.0[^>]*>/gi, '');

  // Remove duplicate Font Awesome v6 lines keeping one
  const fa6Matches = newHtml.match(/<link[^>]*font-awesome[^>]*6[^>]*>/gi) || [];
  if (fa6Matches.length > 1) {
    // keep first occurrence, remove others
    let first = fa6Matches[0];
    let idx = newHtml.indexOf(first);
    let before = newHtml.slice(0, idx + first.length);
    let after = newHtml.slice(idx + first.length);
    after = after.replace(/<link[^>]*font-awesome[^>]*6[^>]*>/gi, '');
    newHtml = before + after;
  }

  // Ensure main stylesheet reference exists and is /css/styles.css
  if (!/\/css\/styles\.css/gi.test(newHtml)) {
    // attempt to inject before closing </head>
    newHtml = newHtml.replace(/<\/head>/i, '    <link rel="stylesheet" href="/css/styles.css">\n</head>');
  } else {
    // replace local styles.css or courses css with /css/styles.css
    newHtml = newHtml.replace(/href=\"(?:courses css\/styles\.css|styles\.css)\"/gi, 'href="/css/styles.css"');
  }

  // Ensure preload + google fonts exist for Inter + Space Grotesk at top
  if (!/Space\+Grotesk|Inter/gi.test(newHtml)) {
    const preload = '    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" as="style">\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">\n';
    newHtml = newHtml.replace(/<head>/i, `<head>\n${preload}`);
  } else {
    // normalize to the Inter + Space Grotesk include and preload
    newHtml = newHtml.replace(/<link[^>]*fonts.googleapis.com[^>]*>/gi, '');
    const preload = '    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" as="style">\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">\n';
    newHtml = newHtml.replace(/<head>/i, `<head>\n${preload}`);
  }

  return { changed: newHtml !== html, html: newHtml };
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changedAny = false;

  const headResult = fixHead(content);
  if (headResult.changed) {
    content = headResult.html;
    changedAny = true;
  }

  const footerResult = fixFooter(content);
  if (footerResult.changed) {
    content = footerResult.html;
    changedAny = true;
  }

  if (changedAny) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(process.cwd(), filePath)}`);
  }
}

function walk(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.html$/.test(item)) processFile(full);
  });
}

console.log('Starting footer & head normalization...');
walk(viewsDir);
console.log('Done.');
