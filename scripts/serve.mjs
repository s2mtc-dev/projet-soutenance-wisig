import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.argv[2] ?? process.env.UNIFLOW_PORT ?? 4173);
const host = process.env.UNIFLOW_HOST ?? '127.0.0.1';

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function resolveRequest(url) {
  const parsed = new URL(url, `http://${host}:${port}`);
  const requested = normalize(decodeURIComponent(parsed.pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidate = resolve(join(root, requested));
  if (!candidate.startsWith(root)) {
    return null;
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    return join(candidate, 'index.html');
  }
  return existsSync(candidate) ? candidate : join(root, 'index.html');
}

const server = createServer((request, response) => {
  const file = resolveRequest(request.url ?? '/');
  if (!file || !existsSync(file)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`UniFlow running at http://${host}:${port}/`);
});
