# Vincent Adam website

This repository contains the source and generated output for the personal website hosted on GitHub Pages.

## Structure

```text
content/
├── site/                  # Markdown for the main SPA pages
│   ├── home.md
│   ├── research.md
│   └── consulting.md
└── blog/                  # Markdown posts and post-specific assets
    └── <slug>/
        └── index.md

templates/
└── site-shell.mjs         # Shared header, navigation, theme, and footer

scripts/
├── build_site.mjs         # Generates the main index.html shell
└── build_blog.mjs         # Generates blog HTML and metadata

index.html                 # Generated main-site shell
blog/                      # Generated public blog routes
data/blog-posts.json       # Generated blog metadata
css/                       # Shared styles
js/                        # Runtime SPA, theme, and footer behavior
assets/                    # Icons and static assets
```

The main site still uses its existing hash-based SPA. For example, `/#research` loads `content/site/research.md` into the generated `index.html` shell. Blog pages are statically generated with stable URLs such as `/blog/return-to-blogging/`.

The current Research, Consulting, and Blog tabs are intentionally defined directly in `templates/site-shell.mjs`. To add, remove, or rename a tab, edit that template and run `npm run build`. The build smoke test checks that the current required tabs remain present.

## Editing content

Edit Markdown source files, not generated HTML.

For a blog post, create a directory whose name becomes the slug:

```text
content/blog/my-new-post/index.md
content/blog/my-new-post/figure.png
```

Reference `figure.png` with a normal relative Markdown link. The build copies all post materials except `index.md` into the generated route.

Main-site content can be edited directly in:

```text
content/site/home.md
content/site/research.md
content/site/consulting.md
```

## Build

Install the build dependency once:

```bash
npm install
```

Regenerate the complete site:

```bash
npm run build
```

Run the complete build check, including the build smoke tests:

```bash
npm run check
```

The smoke tests verify the generated files, rendered post content, metadata, navigation, theme scripts, and copying of post assets. Asset copying is tested with a temporary fixture, so no test-only files are added to the real blog.

This generates:

- `index.html`
- `blog/index.html`
- `blog/<slug>/index.html`
- `data/blog-posts.json`
- copied post assets

The generated files should be committed because GitHub Pages serves the repository directly from the `master` branch.

## Local preview

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit:

```text
http://127.0.0.1:8000/
http://127.0.0.1:8000/blog/
```
