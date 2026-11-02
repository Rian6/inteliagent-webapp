import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const releaseDirectory = process.env.MOBILE_RELEASE_DIR || resolve(dirname(fileURLToPath(import.meta.url)), '../../.local/mobile-releases');
const apkName = /^inteliagent-\d+-[a-f0-9]{12}\.apk$/;
export function mobileReleaseMiddleware(directory = releaseDirectory, fetchVersion = fetch) {
  return async (req, res, next) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/mobile/releases/check' || pathname === '/mobile/releases/latest.json') {
      try {
        const upstream = await fetchVersion('http://127.0.0.1:5174' + req.url, { signal:AbortSignal.timeout(15000) });
        res.writeHead(upstream.status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' });
        res.end(req.method==='HEAD'?undefined:await upstream.text());
      } catch { res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Serviço de versões indisponível'})); }
      return;
    }
    if (pathname !== '/inteliagent-push-dev.apk' && !pathname.startsWith('/mobile/releases/')) return next();
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    try {
      const latest = JSON.parse(await readFile(resolve(directory, 'latest.json'), 'utf8'));
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (pathname === '/mobile/releases/latest.json') {
        const body = JSON.stringify(latest);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) });
        res.end(req.method === 'HEAD' ? undefined : body);
        return;
      }
      const requested = pathname.split('/').pop();
      const current = pathname === '/inteliagent-push-dev.apk' || requested === 'latest.apk';
      const filename = current ? latest.downloadUrl.split('/').pop() : requested;
      if (!apkName.test(filename)) throw Error('Invalid APK filename');
      const path = resolve(directory, filename);
      const info = await stat(path);
      let start = 0, end = info.size - 1, status = 200;
      if (req.headers.range) {
        const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
        start = Number(range?.[1]); end = range?.[2] ? Number(range[2]) : end;
        if (!range || !Number.isSafeInteger(start) || start > end || end >= info.size) {
          res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }); res.end(); return;
        }
        status = 206;
        res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
      }
      res.writeHead(status, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': `attachment; filename="${current ? `inteliagent-${latest.version}.apk` : filename}"`,
        'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes',
        'Cache-Control': current ? 'no-store' : 'public, max-age=31536000, immutable',
      });
      if (req.method === 'HEAD') res.end();
      else createReadStream(path, { start, end }).on('error', () => res.destroy()).pipe(res);
    } catch {
      res.writeHead(404, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ error: 'Nenhuma versão disponível.' }));
    }
  };
}
export default function mobileReleases() {
  return { name: 'inteliagent-mobile-releases',
    configureServer(server) { server.middlewares.use(mobileReleaseMiddleware()); },
    configurePreviewServer(server) { server.middlewares.use(mobileReleaseMiddleware()); },
  };
}
