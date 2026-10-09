function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

export function renderSiteShell({ title, body = '', page = '', slug = '', scripts = '' }) {
  const postAttribute = slug ? ` data-post-slug="${escapeHtml(slug)}"` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script>
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.documentElement.classList.add('dark-theme');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body${page ? ` data-page="${escapeHtml(page)}"` : ''}${postAttribute}>
  <header>
    <nav class="container">
      <a href="/#home" class="logo">Vincent Adam</a>
      <!-- Navigation is intentionally defined here for now. Rebuild after changing tabs. -->
      <ul class="menu">
        <li><a href="/#research">Research</a></li>
        <li><a href="/#consulting">Consulting</a></li>
        <li><a href="/blog/">Blog</a></li>
      </ul>
      <button id="theme-toggle" aria-label="Toggle theme"><span id="theme-icons"></span></button>
    </nav>
  </header>
  <main id="content" class="container">${body}</main>
  <footer><div id="footer-links" class="container footer-links"></div></footer>
${scripts}</body>
</html>
`;
}
