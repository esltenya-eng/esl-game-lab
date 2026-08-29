/**
 * Build-time prerenderer for /game/<id> pages.
 *
 * Reads every persisted game from Firestore's `catalog_games` collection
 * (populated by services/catalogService.ts as real users view games), then
 * uses a headless Chromium (via puppeteer-core, driving the Alpine `chromium`
 * package installed in the Docker builder stage -- see Dockerfile) to render
 * the actual React app for each /game/<id> URL against the just-built dist/
 * output, and saves the resulting HTML to dist/game/<id>/index.html.
 *
 * Routing note: `serve` (see Dockerfile CMD) applies its `rewrites` config
 * BEFORE checking whether a real file exists at the requested path -- a
 * blanket `/game/**` -> /index.html rewrite would always win and the
 * prerendered files would never be served (confirmed by testing locally).
 * So instead of a rewrite, this script also copies dist/index.html to
 * dist/404.html. `serve` auto-serves 404.html (with a real 404 status) for
 * any path that isn't a real file -- which means:
 *   - /game/<prerendered-id>  -> the real static file, 200, full content
 *   - /game/<not-yet-built-id> -> the SPA shell via 404.html, 404 status,
 *     and the client-side app still boots and fetches the game from
 *     Firestore itself (same cold-open behavior as before)
 *   - any genuinely bogus path -> same SPA-shell-with-404 fallback
 * This 404.html copy happens unconditionally, even if prerendering itself
 * is skipped below -- it's what makes /game/<id> deep links return a
 * correct status code instead of the old soft-404 (see PR #48).
 *
 * Hard constraint: this script must NEVER fail the build. It's best-effort
 * enrichment on top of an app that already works without it -- missing
 * Firebase credentials, an unreachable Firestore, or a puppeteer/Chromium
 * launch failure should all just mean "skip prerendering, ship the plain
 * SPA like before," logged clearly, exit 0.
 */

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SITE_ORIGIN = 'https://esl-game-lab.com';

const REQUIRED_FIREBASE_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

async function fetchCatalogGames() {
  const missing = REQUIRED_FIREBASE_ENV.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.warn(`[prerender] Skipping: missing env var(s) ${missing.join(', ')}`);
    return null;
  }
  try {
    const app = initializeApp({
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    });
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'catalog_games'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.warn(`[prerender] Skipping: Firestore read failed (${err.message})`);
    return null;
  }
}

// Minimal static file server for dist/: serve a real file if the path
// matches one, otherwise fall back to index.html so the SPA's client-side
// router can take over -- close enough to `serve`'s own behavior for the
// sole purpose of this script (rendering known /game/<id> routes).
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

async function startStaticServer() {
  const server = createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(DIST_DIR, urlPath);
      const st = await stat(filePath).catch(() => null);
      if (!st || st.isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, port: server.address().port };
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHowToSchema(game) {
  const steps = game.teacher_directions?.medium?.length ? game.teacher_directions.medium : game.how_to_play || [];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: game.game_title,
    description: game.game_description || '',
    step: steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
  };
  // Escape "</" so a step string can never prematurely close the <script> tag it's embedded in.
  return JSON.stringify(schema).replace(/<\//g, '<\\/');
}

// Rewrites the prerendered page's <head> so a non-JS crawler sees real,
// game-specific metadata instead of the generic homepage tags.
function injectGameMeta(html, game, url) {
  const title = `${game.game_title} — ESL Game Lab`;
  const description = (game.game_description || '').slice(0, 155);
  const schemaScript = `<script type="application/ld+json">${buildHowToSchema(game)}</script>`;

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace('</head>', `${schemaScript}</head>`);
}

function findChromiumExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  return null; // caller decides whether to skip
}

async function launchBrowser() {
  const executablePath = findChromiumExecutable();
  if (!executablePath) {
    console.warn('[prerender] Skipping: PUPPETEER_EXECUTABLE_PATH is not set (no Chromium available)');
    return null;
  }
  try {
    return await puppeteer.launch({ executablePath, headless: true });
  } catch (err) {
    console.warn(`[prerender] Skipping: Chromium launch failed (${err.message})`);
    return null;
  }
}

async function ensure404Fallback() {
  const indexHtml = await readFile(path.join(DIST_DIR, 'index.html'));
  await writeFile(path.join(DIST_DIR, '404.html'), indexHtml);
}

async function main() {
  await ensure404Fallback();

  const games = await fetchCatalogGames();
  if (!games || games.length === 0) {
    console.log('[prerender] No games to prerender. Shipping the plain SPA, unchanged.');
    return;
  }

  const browser = await launchBrowser();
  if (!browser) {
    console.log('[prerender] No usable browser. Shipping the plain SPA, unchanged.');
    return;
  }

  console.log(`[prerender] Prerendering up to ${games.length} game page(s)...`);
  const { server, port } = await startStaticServer();
  const okUrls = [];

  try {
    for (const game of games) {
      if (!game.id || !game.game_title) continue;
      let page;
      try {
        page = await browser.newPage();
        await page.goto(`http://127.0.0.1:${port}/game/${game.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('[data-prerender-ready], [data-prerender-notfound]', { timeout: 15000 });

        if (await page.$('[data-prerender-notfound]')) {
          console.warn(`[prerender] Skipping ${game.id}: app reports not-found`);
          continue;
        }

        const html = await page.content();
        const url = `${SITE_ORIGIN}/game/${game.id}`;
        const outDir = path.join(DIST_DIR, 'game', game.id);
        await mkdir(outDir, { recursive: true });
        await writeFile(path.join(outDir, 'index.html'), injectGameMeta(html, game, url));
        okUrls.push(url);
      } catch (err) {
        console.warn(`[prerender] Failed for ${game.id}: ${err.message}`);
      } finally {
        if (page) await page.close().catch(() => {});
      }
    }
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }

  console.log(`[prerender] Wrote ${okUrls.length}/${games.length} static game page(s).`);

  // Regenerate sitemap.xml with the homepage plus every successfully prerendered game.
  // Games that failed to prerender are intentionally left out -- no point pointing
  // crawlers at a URL that still just serves the plain SPA shell.
  const allUrls = [`${SITE_ORIGIN}/`, ...okUrls];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls
    .map(
      (u) =>
        `  <url>\n    <loc>${u}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${u === `${SITE_ORIGIN}/` ? '1.0' : '0.8'}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;
  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
  console.log(`[prerender] sitemap.xml now lists ${allUrls.length} URL(s).`);
}

main()
  .then(() => {
    // The Firestore client can leave background reconnect/retry timers alive
    // (observed locally: the process hangs indefinitely after a successful
    // run whenever fetchCatalogGames actually opened a connection), so force
    // a clean exit rather than let a stray build step hang in CI.
    process.exit(0);
  })
  .catch((err) => {
    console.error('[prerender] Unexpected error -- shipping the plain SPA, unchanged:', err);
    process.exit(0); // never fail the build over this
  });
