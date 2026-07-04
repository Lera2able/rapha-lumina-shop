import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const sitemapPath = path.join(repoRoot, 'public', 'sitemap.xml');

const siteUrl = 'https://raphalumina.com';
const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/enlightened', changefreq: 'weekly', priority: '0.9' },
  { path: '/teacher', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/size-guide', changefreq: 'monthly', priority: '0.6' },
  { path: '/shipping', changefreq: 'monthly', priority: '0.6' },
  { path: '/returns', changefreq: 'monthly', priority: '0.6' },
  { path: '/refund-policy', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'monthly', priority: '0.5' },
  { path: '/faq', changefreq: 'monthly', priority: '0.6' },
];

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function loadEnvFile(fileName) {
  const filePath = path.join(repoRoot, fileName);

  try {
    const content = await readFile(filePath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env files. Process env may still provide the values.
  }
}

function createUrlEntry({ path: routePath, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(`${siteUrl}${routePath}`)}</loc>`,
    `    <lastmod>${xmlEscape(lastmod)}</lastmod>`,
    `    <changefreq>${xmlEscape(changefreq)}</changefreq>`,
    `    <priority>${xmlEscape(priority)}</priority>`,
    '  </url>',
  ].join('\n');
}

async function fetchProductsForSitemap() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[generate-sitemap] Missing Supabase env vars. Writing sitemap with static routes only.');
    return [];
  }

  const apiUrl = new URL('/rest/v1/products', supabaseUrl);
  apiUrl.searchParams.set('select', 'id,updated_at,created_at');
  apiUrl.searchParams.set('order', 'updated_at.desc.nullslast,created_at.desc.nullslast');

  const response = await fetch(apiUrl, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase product fetch failed with status ${response.status}`);
  }

  const products = await response.json();
  if (!Array.isArray(products)) return [];

  return products
    .filter((product) => product?.id)
    .map((product) => ({
      path: `/product/${product.id}`,
      lastmod: String(product.updated_at || product.created_at || today).slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    }));
}

async function generateSitemap() {
  await loadEnvFile('.env');
  await loadEnvFile('.env.local');

  let productRoutes = [];

  try {
    productRoutes = await fetchProductsForSitemap();
  } catch (error) {
    console.warn(
      `[generate-sitemap] Could not fetch product URLs, continuing with static routes only: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const entries = [
    ...staticRoutes.map((route) => createUrlEntry({ ...route, lastmod: today })),
    ...productRoutes.map((route) => createUrlEntry(route)),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  await mkdir(path.dirname(sitemapPath), { recursive: true });
  await writeFile(sitemapPath, xml, 'utf8');

  console.log(
    `[generate-sitemap] Wrote sitemap with ${staticRoutes.length} static route(s) and ${productRoutes.length} product route(s).`,
  );
}

await generateSitemap();
