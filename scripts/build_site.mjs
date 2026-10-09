import { writeFile } from 'node:fs/promises';
import { renderSiteShell } from '../templates/site-shell.mjs';

// The main page keeps its existing hash-based SPA behavior; only its shared
// shell is generated here so it stays in sync with the blog shell.
const html = renderSiteShell({
  title: 'Vincent Adam',
  scripts: `  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="/js/spa.js?v=2"></script>
  <!-- Cloudflare Web Analytics -->
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "f0e70be9fe4542d1b89629605d80c52c"}'></script>
  <!-- End Cloudflare Web Analytics -->
`
});

await writeFile('index.html', html);
console.log('Built main site shell.');
