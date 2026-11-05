import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';

process.env.NODE_ENV = 'production';
const template = await readFile('dist/index.html', 'utf8');
const marker = '<div id="root"></div>';
if (!template.includes(marker)) throw Error('Missing root marker for landing prerender');
const server = await createServer({
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: 'custom',
});
try {
  const { render } = await server.ssrLoadModule('/scripts/render-landing.jsx');
  const content = render();
  if (!content.includes('suporte@inteliagent.com.br') || !content.includes('<h1')) {
    throw Error('Landing prerender is missing its public content');
  }
  const privateShell = template
    .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex,nofollow" />')
    .replace(/<link rel="canonical"[^>]*>/, '')
    .replace(/<title>[^<]*<\/title>/, '<title>Inteliagent | Acessar a plataforma</title>')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  await writeFile('dist/app.html', privateShell);
  await writeFile('dist/index.html', template.replace(marker, `<div id="root" data-prerendered="true">${content}</div>`));
  console.log('Public landing prerendered; private application shell set to noindex.');
} finally {
  await server.close();
}
