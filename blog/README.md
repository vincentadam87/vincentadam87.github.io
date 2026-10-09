# Blog publishing workflow

The Markdown files in `content/blog/` are the source of truth for the blog. The files in this directory are generated public pages, except for this README.

## Create or update a post

Create a directory in `content/blog/` whose name becomes the URL slug. Put the Markdown source in that directory as `index.md`:

```text
content/blog/my-new-post/index.md
```

Post-specific assets live alongside `index.md`:

```text
content/blog/my-new-post/
├── index.md
└── figure.png
```

The build copies everything in that companion directory, including nested directories, into the generated post directory. Reference assets with normal relative Markdown paths:

```markdown
![Figure](figure.png)
```

Include front matter at the top of the file:

```markdown
---
title: "My New Post"
date: 2026-10-20
updated: 2026-10-22
tags:
  - technology
  - ai
---

Write the post here.
```

The `updated` field is optional. The `tags` field is kept as metadata for future filtering.

## Build the blog

From the repository root, install the build dependency once:

```bash
npm install
```

Then regenerate the main site shell and blog:

```bash
npm run build
```

Use `npm run build:blog` only when you want to regenerate blog output without rebuilding the main `index.html` shell.

The build reads every Markdown file in `content/blog/` and generates:

- `blog/index.html`
- `blog/<slug>/index.html` for each post
- post assets copied from `content/blog/<slug>/` except `index.md`
- `data/blog-posts.json`

For example, `content/blog/my-new-post/index.md` becomes available at:

```text
/blog/my-new-post/
```

Commit the generated `blog/` and `data/` files along with the Markdown source when publishing through GitHub Pages.

The shared header, navigation, theme button, footer, and stylesheet reference are defined in `templates/site-shell.mjs`. Edit that template when changing the site-wide shell, then run `npm run build`.

The Research, Consulting, and Blog tabs are currently hardcoded in that shared template by design. Navigation can later be moved into configuration if the site needs a larger or data-driven menu.

The optional text below the Blog heading is controlled by `BLOG_INTRO` near the top of `scripts/build_blog.mjs`. It is empty by default.

## Preview locally

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8000/blog/
```
