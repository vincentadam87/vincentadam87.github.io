import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import { renderSiteShell } from '../templates/site-shell.mjs';

const root = process.cwd();
// These paths default to the real site, but can be overridden by the smoke test
// so asset copying and Markdown rendering can be tested in isolation.
const sourceDir = path.resolve(process.env.BLOG_SOURCE_DIR || path.join(root, 'content', 'blog'));
const outputDir = path.resolve(process.env.BLOG_OUTPUT_DIR || path.join(root, 'blog'));
const dataDir = path.resolve(process.env.BLOG_DATA_DIR || path.join(root, 'data'));

// Optional text shown below the Blog heading. Leave empty to hide it.
const BLOG_INTRO = '';

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) throw new Error('Every blog post must start with YAML front matter.');
  const metadata = {};
  let listKey = null;
  for (const line of match[1].split('\n')) {
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && listKey) {
      metadata[listKey].push(item[1].replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const field = line.match(/^([\w-]+):\s*(.*)$/);
    if (!field) continue;
    const [, key, rawValue] = field;
    if (!rawValue) {
      metadata[key] = [];
      listKey = key;
    } else {
      metadata[key] = rawValue.replace(/^['"]|['"]$/g, '');
      listKey = null;
    }
  }
  return { metadata, content: match[2] };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date(`${date}T00:00:00`));
}

function postMeta(post) {
  const updated = post.updated && post.updated !== post.date
    ? ` · Updated ${formatDate(post.updated)}` : '';
  const tags = (post.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  return `<p class="post-meta"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>${updated}</p>
    <div class="post-tags" aria-label="Tags">${tags}</div>`;
}

// Each post is a directory named after its stable URL slug. Its source is
// index.md; every other file in that directory is treated as a post asset.
const entries = await readdir(sourceDir, { withFileTypes: true });
const posts = [];
for (const entry of entries.filter(entry => entry.isDirectory())) {
  const slug = entry.name;
  const sourceFile = path.join(sourceDir, slug, 'index.md');
  const markdown = await readFile(sourceFile, 'utf8');
  const { metadata, content } = parseFrontMatter(markdown);
  if (!metadata.title || !metadata.date) throw new Error(`${sourceFile} needs title and date metadata.`);
  posts.push({ ...metadata, slug, content });
}

// Generated output is disposable. Preserve only the documentation file in the
// public blog directory, then recreate the index, routes, and copied assets.
posts.sort((a, b) => b.date.localeCompare(a.date));
await mkdir(outputDir, { recursive: true });
for (const entry of await readdir(outputDir)) {
  if (entry !== 'README.md') await rm(path.join(outputDir, entry), { recursive: true, force: true });
}
await mkdir(dataDir, { recursive: true });

const postCards = posts.map(post => `<article class="post-card">
  <h2><a href="/blog/${encodeURIComponent(post.slug)}/">${escapeHtml(post.title)}</a></h2>
  ${postMeta(post)}
</article>`).join('\n');
const blogIntro = BLOG_INTRO ? `<p class="blog-intro">${escapeHtml(BLOG_INTRO)}</p>` : '';

await writeFile(path.join(outputDir, 'index.html'), renderSiteShell({
  title: 'Blog — Vincent Adam',
  body: `<div class="page-section blog-index">
    <h1>Blog</h1>
    ${blogIntro}
    <div class="post-list">${postCards}</div>
  </div>`,
  page: 'blog',
  scripts: '  <script src="/js/blog.js?v=2"></script>\n'
}));

for (const post of posts) {
  const postDir = path.join(outputDir, post.slug);
  await mkdir(postDir, { recursive: true });
  const assetDir = path.join(sourceDir, post.slug);
  try {
    for (const asset of await readdir(assetDir)) {
      if (asset === 'index.md') continue;
      await cp(path.join(assetDir, asset), path.join(postDir, asset), {
        recursive: true,
        force: true
      });
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(path.join(postDir, 'index.html'), renderSiteShell({
    title: `${post.title} — Vincent Adam`, page: 'post', slug: post.slug,
    body: `<article class="page-section blog-post">
      <a class="back-to-blog" href="/blog/">← All posts</a>
      <h1>${escapeHtml(post.title)}</h1>
      ${postMeta(post)}
      <div class="post-content">${marked.parse(post.content, { breaks: false })}</div>
    </article>`,
    scripts: '  <script src="/js/blog.js?v=2"></script>\n'
  }));
}

const manifest = posts.map(({ content, ...post }) => ({
  ...post, source: `/content/blog/${post.slug}/index.md`
}));
await writeFile(path.join(dataDir, 'blog-posts.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Built ${posts.length} blog post${posts.length === 1 ? '' : 's'}.`);
