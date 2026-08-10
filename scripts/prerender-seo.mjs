import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distPath = path.join(projectRoot, 'dist');
const indexPath = path.join(distPath, 'index.html');

const escapeHtml = (value) => value
  .toString()
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const replaceMeta = (html, attribute, key, content) => {
  const pattern = new RegExp(`<meta(?=[^>]*\\b${attribute}="${escapeRegExp(key)}")[^>]*>`, 'i');
  if (!pattern.test(html)) throw new Error(`Missing ${attribute}="${key}" in dist/index.html`);
  return html.replace(pattern, `<meta data-rh="true" ${attribute}="${key}" content="${escapeHtml(content)}">`);
};

const replaceCanonical = (html, canonical) => {
  const pattern = /<link(?=[^>]*\brel="canonical")[^>]*>/i;
  if (!pattern.test(html)) throw new Error('Missing canonical link in dist/index.html');
  return html.replace(pattern, `<link data-rh="true" rel="canonical" href="${escapeHtml(canonical)}">`);
};

const replacePageSchema = (html, schema) => {
  const pattern = /<script(?=[^>]*\bid="route-page-schema")[^>]*>[\s\S]*?<\/script>/i;
  if (!pattern.test(html)) throw new Error('Missing route-page-schema in dist/index.html');
  const json = JSON.stringify(schema).replaceAll('<', '\\u003c');
  return html.replace(pattern, `<script data-rh="true" id="route-page-schema" type="application/ld+json">${json}</script>`);
};

const appendHeadTags = (html, tags) => tags.length === 0
  ? html
  : html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);

const replaceRoot = (html, content) => {
  const pattern = /<div id="root"><\/div>/i;
  if (!pattern.test(html)) throw new Error('Missing empty root element in dist/index.html');
  return html.replace(pattern, `<div id="root">${content}</div>`);
};

const staticFigure = (image) => image ? `
  <figure>
    <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy">
    <figcaption>${escapeHtml(image.caption)} <span>${escapeHtml(image.credit)}</span></figcaption>
  </figure>` : '';

const staticBlogIndex = (posts, blogPostPath) => `
  <main class="dp-journal">
    <header>
      <p>The Bangalore Edit · DezignPool Journal</p>
      <h1>Rooms, materials and the city between them.</h1>
      <p>Research-led field notes for living well in Bangalore, grounded in climate, construction and residential design.</p>
    </header>
    <section aria-label="Published journal articles">
      ${posts.map((post) => `
        <article>
          <a href="${escapeHtml(blogPostPath(post))}">
            <img src="${escapeHtml(post.hero.src)}" alt="${escapeHtml(post.hero.alt)}" width="${post.hero.width}" height="${post.hero.height}" loading="lazy">
            <h2>${escapeHtml(post.title)}</h2>
          </a>
          <p>${escapeHtml(post.description)}</p>
          <time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(post.publishedAt)}</time>
        </article>`).join('')}
    </section>
  </main>`;

const staticBlogArticle = (post) => `
  <main class="dp-article">
    <article>
      <header>
        <p>${escapeHtml(post.category)}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p>${escapeHtml(post.dek)}</p>
        <p>By ${escapeHtml(post.author.name)} · <time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(post.publishedAt)}</time></p>
        ${staticFigure(post.hero)}
      </header>
      ${post.sections.map((section) => `
        <section id="${escapeHtml(section.id)}">
          ${section.eyebrow ? `<p>${escapeHtml(section.eyebrow)}</p>` : ''}
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph.text)}</p>`).join('')}
          ${section.checklist ? `<ul>${section.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
          ${section.pullQuote ? `<blockquote>${escapeHtml(section.pullQuote)}</blockquote>` : ''}
          ${staticFigure(section.image)}
        </section>`).join('')}
      <section>
        <h2>Sources &amp; method</h2>
        <p>${escapeHtml(post.methodology)}</p>
        <ol>${post.sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a> — ${escapeHtml(source.publisher)}</li>`).join('')}</ol>
      </section>
    </article>
  </main>`;

const sitemapXml = (routes) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${escapeHtml(route.canonical)}</loc>${route.modifiedAt || route.publishedAt ? `
    <lastmod>${escapeHtml(route.modifiedAt ?? route.publishedAt)}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;

const rssXml = (posts, blogPostPath, siteUrl) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Bangalore Edit by DezignPool</title>
    <link>${siteUrl}/blog</link>
    <description>Research-led stories on Bangalore interiors, climate, materials and residential design.</description>
    <language>en-IN</language>
${posts.map((post) => `    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${siteUrl}${escapeHtml(blogPostPath(post))}</link>
      <guid isPermaLink="true">${siteUrl}${escapeHtml(blogPostPath(post))}</guid>
      <pubDate>${new Date(`${post.publishedAt}T06:00:00+05:30`).toUTCString()}</pubDate>
      <description>${escapeHtml(post.description)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;

const outputName = (routePath) => routePath === '/'
  ? 'index.html'
  : `${routePath.slice(1).replaceAll('/', '-')}.html`;

const vite = await createServer({
  root: projectRoot,
  configFile: false,
  logLevel: 'silent',
  appType: 'custom',
  server: { middlewareMode: true },
});

try {
  const {
    SITE_URL,
    getIndexableRouteMeta,
    imageForMeta,
    pageSchemaForMeta,
    robotsForMeta,
  } = await vite.ssrLoadModule('/src/config/seo.ts');
  const {
    allBlogPosts,
    blogPostPath,
    findBlogPost,
  } = await vite.ssrLoadModule('/src/content/blog/index.ts');
  const routes = getIndexableRouteMeta();
  const paths = new Set(routes.map((route) => route.path));
  const canonicals = new Set(routes.map((route) => route.canonical));

  const requiredPaths = ['/', '/about', '/services', '/projects', '/calculator', '/interior-calculator', '/privacy', '/blog'];
  if (routes.length < 13 || paths.size !== routes.length || canonicals.size !== routes.length || requiredPaths.some((routePath) => !paths.has(routePath))) {
    throw new Error(`Expected at least 13 unique SEO routes including the journal, received ${routes.length}`);
  }

  const template = await readFile(indexPath, 'utf8');
  await mkdir(distPath, { recursive: true });

  for (const route of routes) {
    const image = imageForMeta(route);
    let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
    html = replaceMeta(html, 'name', 'description', route.description);
    html = replaceMeta(html, 'name', 'robots', robotsForMeta(route));
    html = replaceMeta(html, 'property', 'og:type', route.type ?? 'website');
    html = replaceMeta(html, 'property', 'og:url', route.canonical);
    html = replaceMeta(html, 'property', 'og:title', route.title);
    html = replaceMeta(html, 'property', 'og:description', route.description);
    html = replaceMeta(html, 'property', 'og:image', image);
    html = replaceMeta(html, 'property', 'og:image:secure_url', image);
    html = replaceMeta(html, 'property', 'og:image:type', image.endsWith('.png') ? 'image/png' : 'image/webp');
    html = replaceMeta(html, 'name', 'twitter:title', route.title);
    html = replaceMeta(html, 'name', 'twitter:description', route.description);
    html = replaceMeta(html, 'name', 'twitter:image', image);
    html = replaceCanonical(html, route.canonical);
    html = replacePageSchema(html, pageSchemaForMeta(route));
    html = appendHeadTags(html, [
      route.publishedAt ? `<meta property="article:published_time" content="${escapeHtml(route.publishedAt)}">` : '',
      route.modifiedAt ? `<meta property="article:modified_time" content="${escapeHtml(route.modifiedAt)}">` : '',
      route.author ? `<meta property="article:author" content="${escapeHtml(route.author)}">` : '',
    ].filter(Boolean));

    if (route.path === '/blog') {
      html = replaceRoot(html, staticBlogIndex(allBlogPosts, blogPostPath));
    } else if (route.path.startsWith('/blog/')) {
      const post = findBlogPost(route.path.split('/')[2]);
      if (!post) throw new Error(`Missing blog content for ${route.path}`);
      html = replaceRoot(html, staticBlogArticle(post));
    }

    const expectedTitle = `<title>${escapeHtml(route.title)}</title>`;
    const expectedDescription = `<meta data-rh="true" name="description" content="${escapeHtml(route.description)}">`;
    const expectedCanonical = `<link data-rh="true" rel="canonical" href="${route.canonical}">`;
    if (!html.includes(expectedTitle) || !html.includes(expectedDescription) || !html.includes(expectedCanonical)) {
      throw new Error(`Route metadata validation failed for ${route.path}`);
    }

    await writeFile(path.join(distPath, outputName(route.path)), html, 'utf8');
  }

  await writeFile(path.join(distPath, 'sitemap.xml'), sitemapXml(routes), 'utf8');
  await writeFile(path.join(distPath, 'feed.xml'), rssXml(allBlogPosts, blogPostPath, SITE_URL), 'utf8');

  console.log(`SEO prerender: wrote and validated ${routes.length} route documents.`);
} finally {
  await vite.close();
}
