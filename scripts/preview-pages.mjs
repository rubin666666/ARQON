import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(fs.readFileSync('.pages-output', 'utf8').trim());
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
  '.rsc': 'text/x-component',
};
http
  .createServer((req, res) => {
    try {
      let route = decodeURIComponent(
        new URL(req.url, 'http://localhost').pathname,
      );
      if (route === '/ARQON') {
        res.writeHead(302, { Location: '/ARQON/' });
        return res.end();
      }
      if (route.startsWith('/ARQON/')) route = route.slice(6);
      let file = path.resolve(root, '.' + route);
      if (!file.startsWith(root + path.sep) && file !== root) {
        res.writeHead(403);
        return res.end();
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory())
        file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(400);
      res.end('Bad request');
    }
  })
  .listen(4173, '127.0.0.1', () =>
    console.log('Local: http://localhost:4173/ARQON/'),
  );
