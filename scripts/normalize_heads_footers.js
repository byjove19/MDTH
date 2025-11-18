const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'public', 'views');

const fontPreload = '    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" as="style">\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">\n';
const fa6 = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">';
const mainCss = '<link rel="stylesheet" href="/css/styles.css">';

function normalizeHead(content) {
  // Ensure font preload and font link in head
  content = content.replace(/<head>/i, match => match + '\n' + fontPreload);

  // Remove any other fonts.googleapis links to avoid duplicates
  content = content.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');
  // Insert the preload+font again at head start (remove duplicates)
  content = content.replace(/<head>\s*\n\s*/, '<head>\n' + fontPreload);

  // Ensure a single FA6 link
  // remove existing FA links
  content = content.replace(/<link[^>]*font-awesome[^>]*>/gi, '');
  // insert FA6 before closing </head>
  content = content.replace(/<\/head>/i, '\n    ' + fa6 + '\n</head>');

  // Ensure main stylesheet exists and is single
  content = content.replace(/<link[^>]*href=\"[^\"]*styles\.css[^\"]*\"[^>]*>/gi, '');
  content = content.replace(/<\/head>/i, '\n    ' + mainCss + '\n</head>');

  // Remove duplicate whitespace
  content = content.replace(/(\n\s*){3,}/g, '\n\n');

  return content;
}

function normalizeFooter(content) {
  // Replace href="#" where link text maps to known routes
  content = content.replace(/<a\s+href=\"#\"\s*>([^<]+)<\/a>/gi, (m, p1) => {
    const txt = p1.trim().toLowerCase();
    const map = {
      'home': '/',
      'about': '/about',
      'project': '/project-management',
      'blog': '/blog',
      'contact': '/contact us',
      'programming': '/programming',
      'data analytics': '/data-analytics',
      'digital marketing': '/digital-marketing',
      'graphic design': '/graphic-design',
      'ui/ux design': '/ui-ux',
      'video editing': '/video-editing',
      'cyber security': '/cybersecurity',
      'courses': '/courses'
    };
    if (map[txt]) return `<a href="${map[txt]}">${p1}</a>`;
    return m;
  });

  return content;
}

function process(file) {
  const full = path.join(viewsDir, file);
  let content = fs.readFileSync(full, 'utf8');
  const before = content;
  content = normalizeHead(content);
  content = normalizeFooter(content);
  if (content !== before) {
    fs.writeFileSync(full, content, 'utf8');
    console.log('Normalized:', file);
  }
}

fs.readdirSync(viewsDir).filter(f => f.endsWith('.html')).forEach(process);
console.log('Done normalizing heads and footers.');
