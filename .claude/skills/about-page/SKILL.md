---
name: about-page-bigolbuffalo
description: Bigolbuffalo-specific adapter for the global about-page skill. When the user asks to draft an about page for a project page on bigolbuffalo.com (phrases like "add an about page for the bark machine", "draft an about doc for the stock dashboard"), invoke this skill alongside the global `about-page` skill. The global skill provides the universal patterns (section order, accent palette, SVG diagram conventions). This skill provides the bigolbuffalo-specific overrides: Eleventy front matter pointing to layouts/standalone.njk, src/ output paths, aboutUrl topnav wiring on both source and about pages, and GitHub link scoping to the bigolbuffalo repo.
---

# About Page — bigolbuffalo adapter

This is a thin override that adapts the global `about-page` skill to
bigolbuffalo's Eleventy setup. **Read the global skill first** for all
design rules (section structure, CSS palette, SVG conventions). Then
apply the bigolbuffalo-specific overrides below.

## Pinned palette (overrides global)

Bigolbuffalo's about pages use these specific values. Use them verbatim
even if the global about-page skill's palette has been changed
upstream — design consistency across the site's existing about pages
matters more than tracking whatever the global default has become.

```css
:root {
    --accent-blue: #83b0d6;
    --accent-green: #00cc96;
    --accent-red-light: #ec6c5b;
}
body {
    background-color: #696969;  /* matches the site's .content gray */
    color: white;
}
```

SVG node fills/strokes (also pinned):

| Category | Node fill | Stroke |
|---|---|---|
| Client | `#00CC96` fill-opacity 0.15 | `#00CC96` |
| Edge / routing | `#83B0D6` fill-opacity 0.15 | `#83B0D6` |
| Compute | `#DE3B3E` fill-opacity 0.18 | `#EC6C5B` |
| Storage | `#EC6C5B` fill-opacity 0.15 | `#EC6C5B` |
| External | `#FFFFFF` fill-opacity 0.08 | `#FFFFFF` stroke-opacity 0.4 |

Arrowhead marker fill: `#83B0D6`.

If the user explicitly asks for a different palette (e.g., for a new
project with a distinct visual identity), that overrides this pinning.
But don't pull in upstream global changes silently.

## Output format

**Don't** produce standalone HTML. Produce an Eleventy template with
front matter:

```yaml
---
layout: layouts/standalone.njk
title: About <Project Name>
aboutUrl: /<PageName>.html
aboutLabel: Back to <whatever fits — "the dashboard", "the machine", etc.>
---
<style>
    /* paste the CSS from global template.html, minus the html/body
       reset (Eleventy + standalone.njk already handle that) */
</style>

<div class="main-content">
    <!-- sections from global skill -->
</div>
```

`layouts/standalone.njk` is required — it wraps the content in the
site's topnav + footer without the `.content` box. `layouts/page.njk`
would clobber the about page's own design.

## File location

| Source page lives at | About page goes at |
|---|---|
| `src/<PageName>.html` (top-level) | `src/<PageName>-about.html` |
| `src/<ComponentDir>/<PageName>.html` (consolidated component) | `src/<ComponentDir>/<PageName>-about.html` |

The parent `src.json` permalink rule (or, for consolidated components,
the directory data file) ensures both pages ship at root URLs
(`/<PageName>.html` and `/<PageName>-about.html`).

## Topnav wiring

The site's `_includes/partials/topnav.njk` reads an optional `aboutUrl`
front-matter field and renders a right-aligned italic link only on pages
that opt in.

On the **source page**, add:
```yaml
aboutUrl: /<PageName>-about.html
```
Leave the label default ("About this page").

On the **about page**, add (as shown in the front-matter example above):
```yaml
aboutUrl: /<PageName>.html
aboutLabel: Back to <project>
```

Result: clicking "About this page" on the source jumps to the about
page; the about page's topnav shows "Back to <project>" for symmetric
navigation. The link appears *only* on these two pages — every other
page in the site stays unchanged.

## Canonical examples

Two pages already follow this pattern — use them as the reference:

- `src/StockDashboard-about.html` ↔ `src/StockDashboard.html`
- `src/BuffaloBarkMachine/BuffaloBarkMachine-about.html` ↔
  `src/BuffaloBarkMachine/BuffaloBarkMachine.html`

When in doubt about an edge case, check those first.

## GitHub link scoping

The "Source Code" section must link to a scoped path under bigolbuffalo,
never to the repo root. Pattern:

```
https://github.com/JackVance/bigolbuffalo/tree/main/<project-path>
```

Examples:
- Bark machine → `github.com/JackVance/bigolbuffalo/tree/main/src/BuffaloBarkMachine`
- A future project under `src/MyProject/` → `github.com/JackVance/bigolbuffalo/tree/main/src/MyProject`

For projects whose code lives in a separate repo (e.g., the Lambda
dashboard at `github.com/JackVance/stock-eval-dashboard`), link to that
external repo instead.

## Deploy and verify

After writing the file:

```powershell
npm run deploy
```

Then verify against the S3 origin (bypasses CloudFront cache so you see
the new content immediately):

```powershell
$origin = "http://bigolbuffalo.com.s3-website-us-east-1.amazonaws.com"
$r = Invoke-WebRequest -UseBasicParsing "$origin/<PageName>-about.html"
$r.Content -match '<svg class="arch-svg"'        # SVG present
$r.Content -match 'class="topnav"'                # site nav present
$r.Content -match 'Back to'                       # reverse aboutUrl present

# Source page should now have the forward link
$src = Invoke-WebRequest -UseBasicParsing "$origin/<PageName>.html"
$src.Content -match '"right"[^>]*>About this page<'

# Confirm no leakage to other pages
$other = Invoke-WebRequest -UseBasicParsing "$origin/EnterTheBison.html"
-not ($other.Content -match 'class="right"')      # should be clean
```

CloudFront edge cache takes 1–5 min to catch up after `npm run deploy`
— the deploy script triggers an invalidation, but checking against the
S3 origin URL above gives instant feedback.

## What not to do

- Don't link to `_data/site.json` `nav` — the whole point of `aboutUrl`
  is per-page opt-in, not global nav membership.
- Don't include `<!DOCTYPE html>` or `<head>` — `layouts/standalone.njk`
  wraps that for you.
- Don't use `layouts/page.njk` — its `.content` div clobbers the
  page's design.
- Don't reset `html, body { margin: 0 }` in the page's inline style —
  the global stylesheet handles it.
