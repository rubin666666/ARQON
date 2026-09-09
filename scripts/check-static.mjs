import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir = fs.readFileSync('.pages-output', 'utf8').trim();
for (const [route, lang] of [
  ['index.html', 'uk'],
  ['en/index.html', 'en'],
]) {
  const html = fs.readFileSync(path.join(dir, route), 'utf8');
  assert.ok(html.includes(`<html lang="${lang}"`));
  assert.ok(html.includes('rel="canonical"'));
  assert.ok(html.includes('hrefLang="en"') || html.includes('hreflang="en"'));
  assert.ok(!html.includes('src="/_next/'));
  assert.ok(html.includes('id="calculator"'));
  for (const match of html.matchAll(/(?:src|href)="([^"?#]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/ARQON/')) continue;
    const relative = url.slice('/ARQON/'.length);
    if (relative === '' || relative === 'en/') continue;
    const file = path.join(dir, relative);
    assert.ok(fs.existsSync(file), `Missing ${url} in ${route}`);
  }
  console.log(`Static ${route}: metadata and assets verified`);
}
assert.ok(fs.existsSync(path.join(dir, '.nojekyll')));
