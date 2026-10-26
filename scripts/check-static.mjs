import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir = fs.readFileSync('.pages-output', 'utf8').trim();
const site = JSON.parse(fs.readFileSync('config/site.json', 'utf8'));
const modelIds = new Set(site.models.map((model) => model.id));
const manifest = JSON.parse(
  fs.readFileSync(path.join(dir, '.vite/manifest.json'), 'utf8'),
);
const entry = Object.values(manifest).find((item) => item.isEntry);
assert.ok(entry, 'Pages JavaScript entry is missing');
const staticDependencies = new Set();
const pending = [...(entry.imports ?? [])];
while (pending.length) {
  const key = pending.pop();
  if (staticDependencies.has(key)) continue;
  staticDependencies.add(key);
  pending.push(...(manifest[key]?.imports ?? []));
}
assert.ok(
  !(entry.dynamicImports ?? []).includes('_fontkit.es-X_Tjfain.js'),
  'PDF fontkit must not be loaded directly by the page entry',
);
assert.ok(
  (entry.dynamicImports ?? []).some((key) => /engineering-report/.test(key)) &&
    (entry.dynamicImports ?? []).some((key) => /lib\/report/.test(key)),
  'PDF generators must remain lazy-loaded',
);
assert.ok(
  ![...staticDependencies].some((key) => /fontkit|engineering-report|lib\/report/.test(key)),
  'PDF code leaked into the initial static import graph',
);
const ukCanonical = new URL(
  (fs.readFileSync(path.join(dir, 'index.html'), 'utf8').match(/<link rel="canonical" href="([^"]+)"/) ?? [])[1],
);
assert.equal(ukCanonical.origin, site.origin);
const basePath = ukCanonical.pathname.replace(/\/$/, '');
const expectedRobots = site.readyForIndexing ? 'index,follow' : 'noindex,nofollow';
const htmlByRoute = new Map();
for (const [route, lang] of [
  ['index.html', 'uk'],
  ['en/index.html', 'en'],
]) {
  const html = fs.readFileSync(path.join(dir, route), 'utf8');
  htmlByRoute.set(route, html);
  assert.ok(html.includes(`<html lang="${lang}"`));
  assert.ok(html.includes(`<meta name="robots" content="${expectedRobots}">`));
  assert.ok(html.includes('hrefLang="en"') || html.includes('hreflang="en"'));
  assert.ok(!html.includes('src="/_next/'));
  assert.ok(html.includes('id="calculator"'));
  assert.ok(html.includes('id="products"'));
  assert.ok(html.includes('id="technology"'));
  assert.ok(html.includes('id="about"'));
  assert.ok(html.includes(lang === 'en' ? 'Open calculator' : 'Відкрити калькулятор'));
  assert.ok(html.includes(lang === 'en' ? 'Model gallery' : 'Галерея моделей'));
  assert.ok(html.includes(lang === 'en' ? 'aria-label="Українська"' : 'aria-label="English"'));
  const canonical = new URL(
    (html.match(/<link rel="canonical" href="([^"]+)"/) ?? [])[1],
  );
  assert.equal(canonical.origin, site.origin);
  assert.equal(
    canonical.pathname,
    lang === 'en' ? `${basePath}/en/` : `${basePath}/`,
  );
  for (const [alternate, pathname] of [
    ['uk', `${basePath}/`],
    ['en', `${basePath}/en/`],
    ['x-default', `${basePath}/`],
  ]) {
    const alternateHref = html.match(
      new RegExp(`<link rel="alternate" hreflang="${alternate}" href="([^"]+)"`),
    )?.[1];
    assert.ok(alternateHref, `Missing ${alternate} alternate in ${route}`);
    const alternateUrl = new URL(alternateHref);
    assert.equal(alternateUrl.origin, site.origin);
    assert.equal(alternateUrl.pathname, pathname);
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs in ${route}`);
  const idSet = new Set(ids);
  for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) {
    const target = decodeURIComponent(fragment);
    assert.ok(
      idSet.has(target) || modelIds.has(target),
      `Unresolved in-page link #${target} in ${route}`,
    );
  }
  for (const match of html.matchAll(/(?:src|href)="([^"?#]+)"/g)) {
    const url = new URL(match[1], site.origin);
    if (url.origin !== site.origin || !url.pathname.startsWith(`${basePath}/`)) continue;
    const relative = url.pathname.slice(`${basePath}/`.length);
    if (relative === '' || relative === 'en/') continue;
    assert.ok(fs.existsSync(path.join(dir, relative)), `Missing ${url.pathname} in ${route}`);
  }
  console.log(`Static ${route}: metadata and assets verified`);
}
assert.ok(fs.existsSync(path.join(dir, '.nojekyll')));
const notFound = fs.readFileSync(path.join(dir, '404.html'), 'utf8');
assert.ok(notFound.includes(`${basePath}/`), '404 page must link to the deployed base path');
assert.notEqual(htmlByRoute.get('index.html'), htmlByRoute.get('en/index.html'));
console.log('Static navigation, locale routes, launch gates, and lazy PDF chunks verified');
