---
name: about-page-bigolbuffalo
description: Bigolbuffalo-specific adapter for the global about-page skill. Invoke when (1) the user asks to draft a new about page for a project page on bigolbuffalo.com (phrases like "add an about page for the bark machine", "draft an about doc for the stock dashboard"), OR (2) the user has copied a standalone-HTML about page from another project's repo into src/Locals/ (or elsewhere in src/) and needs it adapted to bigolbuffalo's Eleventy form (phrases like "adapt this standalone HTML for bigolbuffalo", "I dropped a file from another project, please convert it", "fix up the about page I just copied in", "the other project generated it with the global skill, duplicate it here"). The global skill provides universal patterns (section order, accent palette, SVG diagram conventions); this skill provides the bigolbuffalo-specific overrides (Eleventy front matter pointing to layouts/standalone.njk, src/ output paths, aboutUrl topnav wiring on both source and about pages, GitHub link scoping) AND documents the four-step transform for converting incoming standalone HTML files into the Eleventy form.
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

## Adapting incoming standalone HTML from another project

A common workflow: a project lives in its own repo, the user ran the
**global** `about-page` skill there to produce a complete standalone
HTML file, and they've now copied that file into `src/Locals/` (or
elsewhere under `src/`) here. The file is in **standalone-HTML form**
— it has `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>` wrappers and
self-contained styling — and needs four small transforms before it'll
integrate with the site (auto-listing on `/Bython.html`, site topnav
+ footer wrap, no CSS conflicts).

### Trigger

If a file under `src/` starts with `<!DOCTYPE html>` rather than YAML
front matter (`---` on the first line), it's in standalone form and
needs the conversion below.

### Idempotency

If the file already starts with YAML front matter, **stop — do not
re-adapt**. It's already in Eleventy form.

### The four transforms

#### Transform 1: replace the head wrappers with front matter

The standalone file opens with:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About <Project Name></title>
    <style>
```

Replace everything from `<!DOCTYPE html>` through the **opening**
`<style>` tag with YAML front matter plus a bare `<style>` tag
(preserving the CSS inside):

```yaml
---
layout: layouts/standalone.njk
title: About <Project Name>
projectName: <projectName>
shortDescription: <one-liner>
aboutUrl: /Bython.html
aboutLabel: Back to Bython
---
<style>
```

See "Deriving the front-matter fields" below for the placeholder values.

#### Transform 2: drop the html/body CSS reset

Inside the `<style>` block, the standalone form includes a reset rule:

```css
html, body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
}
```

Delete this block entirely. The site's `genstyle.css` already sets
body margin and font-family; this rule conflicts.

Leave all the other CSS (`:root`, `body { background-color: ... }`,
`.main-content`, `.about-section`, `.arch-svg`, `.stack-table`,
`.flow-steps`, `.legend`, `.diagram-caption`) intact.

#### Transform 3: drop </head></body> between style and content

The standalone form has:
```html
    </style>
</head>
<body>
<div class="main-content">
```

Replace with:
```html
    </style>
<div class="main-content">
```

The layout provides `<head>` and `<body>` wrappers.

#### Transform 4: drop closing </body></html>

The standalone form ends with:
```html
    </div>
</div>
</body>
</html>
```

Replace with just:
```html
    </div>
</div>
```

The layout provides the closing tags.

### Deriving the front-matter fields

| Field | Where it comes from |
|---|---|
| `title` | The contents of the original `<title>...</title>` (e.g. `About genome-eval`) |
| `projectName` | The filename with `-about.html` stripped (e.g. `genome-eval-about.html` → `genome-eval`) |
| `shortDescription` | The contents of the original `<p class="subtitle">...</p>` near the top of the body. If no subtitle is present, ask the user. |
| `aboutUrl` | `/Bython.html` for files in `src/Locals/`. For other locations, see the "File location" table below. |
| `aboutLabel` | `Back to Bython` for `src/Locals/`. For other locations, match whichever page wraps the about page (e.g., `Back to the dashboard`). |

### Worked example

Adapting `genome-eval-about.html` — the canonical example, applied in
commit `e0b8033`.

Original first 7 lines:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About genome-eval</title>
    <style>
```

After Transform 1:
```yaml
---
layout: layouts/standalone.njk
title: About genome-eval
projectName: genome-eval
shortDescription: How a raw consumer-DNA file becomes an evidence-graded notebook of findings — entirely on your own machine.
aboutUrl: /Bython.html
aboutLabel: Back to Bython
---
<style>
```

(`shortDescription` was lifted verbatim from the file's
`<p class="subtitle">` near the top of the body.)

The rest of the file is the `<style>` block with Transform 2 applied
(the `html, body { margin: 0; ... }` rule deleted), then `</style>`,
then `<div class="main-content">...</div>`. Original `</body></html>`
at the end is dropped.

### After adapting

Run `npm run deploy` and follow the verification block in the "Deploy
and verify" section below — check that the about page renders with
the site topnav (including "Back to Bython" right-aligned italic),
and that `/Bython.html` now lists the new entry under the "Locals
Only" subheader.

## File location

| Project type | About page goes at |
|---|---|
| Live interactive page with sibling source (`src/<PageName>.html`) | `src/<PageName>-about.html` |
| Consolidated component (`src/<ComponentDir>/<PageName>.html`) | `src/<ComponentDir>/<PageName>-about.html` |
| **Non-interactive — write-up + source only, no live UI on the site** | `src/Locals/<ProjectName>-about.html` |

The parent `src.json` permalink rule (or, for consolidated components,
the directory data file) ensures the file ships at the URL you'd
expect for its directory.

### Locals (non-interactive projects)

For projects that don't have a live UI on bigolbuffalo — typically things
where the value to a visitor is the architecture write-up and a source-code
link, not a running app — drop the about page in `src/Locals/`.

Files in that directory are auto-tagged `locals` (via the directory
data file `src/Locals/Locals.json`) and auto-listed under a "Locals
Only" subheader on `/Bython.html` — no manual edits to Bython.html
required per project.

Front matter for a Local project requires two extra fields beyond the
normal about-page front matter, used to render the Bython.html listing:

```yaml
---
layout: layouts/standalone.njk
title: About <ProjectName>
projectName: <ProjectName>             # display label on Bython.html
shortDescription: <one-liner>          # appears under the link
aboutUrl: /Bython.html
aboutLabel: Back to Bython
---
```

`aboutUrl` points back to `/Bython.html` because that's the page that
listed it — clicking "Back" in the topnav takes the visitor back to the
project index.

See `src/Locals/README.md` for the full pattern.

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
