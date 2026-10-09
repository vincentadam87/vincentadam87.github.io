import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { marked } from 'marked';

const root = process.cwd();

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function requireText(text, expected, file) {
  assert.ok(text.includes(expected), `${file} should contain ${expected}`);
}

const mainShell = await readFile(path.join(root, 'index.html'), 'utf8');
const blogIndex = await readFile(path.join(root, 'blog', 'index.html'), 'utf8');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'blog-posts.json'), 'utf8'));
const postDirectories = (await readdir(path.join(root, 'content', 'blog'), { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

for (const file of ['index.html', 'blog/index.html', 'data/blog-posts.json']) {
  assert.ok(await exists(path.join(root, file)), `${file} should exist`);
}

requireText(mainShell, 'href="/#research"', 'index.html');
requireText(mainShell, 'href="/#consulting"', 'index.html');
requireText(mainShell, 'id="theme-toggle"', 'index.html');
requireText(mainShell, '/js/spa.js?v=2', 'index.html');

// Discover posts from the source tree and derive every expected route and
// assertion from each post's own Markdown, rather than hardcoding a slug or
// editorial content in the test.
assert.ok(postDirectories.length > 0, 'the content/blog directory should contain at least one post');
assert.equal(manifest.length, postDirectories.length);
for (const slug of postDirectories) {
  const sourcePost = await readFile(path.join(root, 'content', 'blog', slug, 'index.md'), 'utf8');
  const sourceTitle = sourcePost.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
  const sourceDate = sourcePost.match(/^date:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
  const sourceBody = sourcePost.match(/^---\s*\n[\s\S]*?\n---\s*\n?([\s\S]*)$/)?.[1];
  assert.ok(sourceTitle, `${slug} should have a title`);
  assert.ok(sourceDate, `${slug} should have a date`);
  assert.ok(sourceBody, `${slug} should have a body`);

  const generatedPath = path.join(root, 'blog', slug, 'index.html');
  const generatedPost = await readFile(generatedPath, 'utf8');
  assert.ok(await exists(generatedPath), `${generatedPath} should exist`);
  requireText(blogIndex, sourceTitle, 'blog/index.html');
  requireText(blogIndex, `/blog/${slug}/`, 'blog/index.html');
  requireText(generatedPost, marked.parse(sourceBody, { breaks: false }).trim(), generatedPath);
  requireText(generatedPost, `datetime="${sourceDate}"`, generatedPath);
  assert.ok(manifest.some(post => post.slug === slug), `${slug} should be in the metadata manifest`);
}

// Use a temporary post to verify tags, Markdown rendering, and companion
// assets without adding test-only material to the real blog.
const fixtureRoot = await fsTempDirectory();
try {
  const fixtureSource = path.join(fixtureRoot, 'source');
  const fixtureOutput = path.join(fixtureRoot, 'output');
  const fixtureData = path.join(fixtureRoot, 'data');
  const fixturePost = path.join(fixtureSource, 'fixture-post');
  await mkdir(fixturePost, { recursive: true });
  await writeFile(path.join(fixturePost, 'index.md'), '---\ntitle: "Fixture Post"\ndate: 2026-01-01\ntags:\n  - test\n---\n\nFixture content.\n');
  await writeFile(path.join(fixturePost, 'figure.txt'), 'fixture asset');

  execFileSync(process.execPath, ['scripts/build_blog.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      BLOG_SOURCE_DIR: fixtureSource,
      BLOG_OUTPUT_DIR: fixtureOutput,
      BLOG_DATA_DIR: fixtureData
    },
    stdio: 'ignore'
  });

  const fixtureHtml = await readFile(path.join(fixtureOutput, 'fixture-post', 'index.html'), 'utf8');
  requireText(fixtureHtml, 'Fixture content.', 'fixture post');
  requireText(fixtureHtml, '>test</span>', 'fixture post tags');
  assert.ok(await exists(path.join(fixtureOutput, 'fixture-post', 'figure.txt')), 'post assets should be copied');
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('Build smoke tests passed.');

async function fsTempDirectory() {
  const directory = await import('node:fs/promises');
  return directory.mkdtemp(path.join(os.tmpdir(), 'vincent-blog-build-'));
}
