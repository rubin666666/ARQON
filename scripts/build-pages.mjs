import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const base = (process.env.PAGES_BASE_PATH ?? '/ARQON').replace(/\/$/, '');
if (base && !/^\/[A-Za-z0-9._/-]+$/.test(base))
  throw new Error('Invalid Pages base path');
const shared = {
  configFile: false,
  base: base + '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('.'),
      'next/image': path.resolve('components/static-image.tsx'),
    },
  },
  define: { 'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify(base) },
  css: { postcss: { plugins: [tailwindcss()] } },
};
await build({
  ...shared,
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    manifest: true,
    rolldownOptions: { input: 'scripts/pages-client.tsx' },
  },
});
await build({
  ...shared,
  publicDir: false,
  build: {
    ssr: 'scripts/pages-render.tsx',
    outDir: 'work/pages-ssr',
    emptyOutDir: true,
    rolldownOptions: { output: { entryFileNames: 'render.mjs' } },
  },
});
const { renderPage } = await import(
  pathToFileURL(path.resolve('work/pages-ssr/render.mjs')).href
);
const manifest = JSON.parse(
  fs.readFileSync('dist/client/.vite/manifest.json', 'utf8'),
);
const entry = Object.values(manifest).find((item) => item.isEntry);
if (!entry) throw new Error('Pages entry missing');
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
for (const en of [false, true]) {
  const { body, metadata } = renderPage(en);
  const lang = en ? 'en' : 'uk';
  const origin = metadata.metadataBase.toString().replace(/\/$/, '');
  const head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(metadata.title)}</title><meta name="description" content="${escape(metadata.description)}"><meta name="robots" content="${metadata.robots.index ? 'index,follow' : 'noindex,nofollow'}"><link rel="canonical" href="${origin}${metadata.alternates.canonical}"><link rel="alternate" hreflang="uk" href="${origin}${base}/"><link rel="alternate" hreflang="en" href="${origin}${base}/en/"><link rel="alternate" hreflang="x-default" href="${origin}${base}/"><link rel="icon" href="${base}/favicon.svg"><meta property="og:title" content="${escape(metadata.openGraph.title)}"><meta property="og:type" content="website"><meta property="og:locale" content="${metadata.openGraph.locale}"><meta property="og:url" content="${origin}${metadata.alternates.canonical}">${(entry.css || []).map((css) => `<link rel="stylesheet" href="${base}/${css}">`).join('')}`;
  const html = `<!doctype html><html lang="${lang}"><head>${head}<script>try{var t=localStorage.getItem('arqon-theme');document.documentElement.classList.toggle('dark',t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))}catch(e){}</script></head><body><div id="arqon-root">${body}</div><script type="module" src="${base}/${entry.file}"></script></body></html>`;
  const destination = en
    ? 'dist/client/en/index.html'
    : 'dist/client/index.html';
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html);
}
fs.writeFileSync('dist/client/.nojekyll', '');
fs.writeFileSync(
  'dist/client/404.html',
  `<!doctype html><html lang="uk"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ARQON — 404</title><body style="font:18px Arial;padding:10%;background:#f7f8f7"><h1>ARQON</h1><p>Сторінку не знайдено / Page not found</p><a href="${base}/">На головну / Home</a></body></html>`,
);
fs.writeFileSync('.pages-output', 'dist/client');
console.log('Pages output: dist/client');
