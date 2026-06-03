---
name: about-page
description: Draft an "about this page" companion document for a project page on bigolbuffalo.com. Use when the user asks to draft, add, or write an about page for a specific project (e.g. "add an about page for the bark machine", "draft an about doc explaining how the dashboard works", "write a behind-the-scenes for X"). Produces a -about.html companion file with the established layouts/standalone.njk pattern: site header/footer wrapper, dark-on-gray color palette, SVG architecture diagram with directional arrow conventions, numbered flow steps that match the diagram edges, tech stack table, and a scoped GitHub link. Wires the aboutUrl front matter on both the source page and the new about page so the topnav has a right-aligned italic "About this page" link that toggles back and forth.
---

# About Page

## When to use

The user wants a behind-the-scenes / "how it works" / about document for a *specific*
project page that already exists on bigolbuffalo (the Stock Dashboard, Buffalo Bark
Machine, etc.). Triggers include:

- "Add an about page for X"
- "Draft an about doc for X"
- "Explain how X works on its own page"
- "Write a behind-the-scenes for X"

Do *not* use for:
- The site's homepage or generic site about
- Article pages under `src/Bison/` (those are essays, not project pages)

## Canonical examples

Two pages already follow this pattern — use them as the reference:

- `src/StockDashboard-about.html` — about page for `/StockDashboard.html`
- `src/BuffaloBarkMachine/BuffaloBarkMachine-about.html` — about page for `/BuffaloBarkMachine.html`

When in doubt about CSS spacing, accent shades, or section depth, check those first.
Don't reinvent.

## File location

| Source page | About page goes at |
|---|---|
| Top-level page (e.g. `src/StockDashboard.html`) | `src/<PageName>-about.html` |
| Consolidated component (e.g. `src/BuffaloBarkMachine/...`) | `src/<ComponentDir>/<PageName>-about.html` |

Eleventy emits the about page at `/<PageName>-about.html` either way (the parent
`src.json` or directory data file handles the permalink).

## Page front matter

```yaml
---
layout: layouts/standalone.njk
title: About <Project Name>
aboutUrl: /<PageName>.html
aboutLabel: Back to <whatever fits the project — "the dashboard", "the machine", etc.>
---
```

`standalone.njk` is required — it gives the page the site's topnav and footer
*without* the standard `.content` wrapper, so the page's own design isn't
clobbered by the gray content box.

## Wiring the link on the source page

Edit `src/<PageName>.html` (the page being documented) and add to its front
matter:

```yaml
aboutUrl: /<PageName>-about.html
```

Don't add `aboutLabel` here. Defaulting to "About this page" keeps the label
consistent everywhere it appears in the site.

Result: the topnav of the source page gets a right-aligned italic
"*About this page*" link. The about page's topnav gets a corresponding
"Back to <project>" link. Visually symmetric.

## Required sections, in order

Every about page must have these six sections, in this order:

1. `<h1>About <Project Name></h1>` and `<p class="subtitle">one-line tagline</p>`
2. **What This Is** — 1–2 paragraphs of plain-language description. No
   architecture detail yet. What would the project tell a non-technical reader?
3. **Architecture at a Glance** — SVG diagram + legend + `<p class="diagram-caption">`.
   See SVG section below.
4. **What Happens When You Click "X"** — ordered list using `<ol class="flow-steps">`,
   where X is the primary user action ("Add Symbol & Run", "Say it!", etc.).
   Each step is numbered; numbers should match the edge labels in the SVG.
5. **Tech Stack** — `<table class="stack-table">` with Layer/Tools columns.
   Include language, runtime, AWS services used, key libraries.
6. **Source Code** — link to the *scoped* GitHub path for this project,
   never to the whole bigolbuffalo repo. E.g.:
   - `github.com/JackVance/bigolbuffalo/tree/main/src/BuffaloBarkMachine`
   - `github.com/JackVance/stock-eval-dashboard` (for the external Lambda dashboard)

Optional additional sections (use only if they meaningfully apply):
- **Where the Computation Happens** — split client-side vs server-side work
- **Where the Data Comes From** — table of data inputs with sources and notes
- **Hosting & Cost** — 1–2 paragraphs, with a $/mo estimate and rationale

## CSS palette

Always include this `:root` block at the top of the page's inline `<style>`:

```css
:root {
    --accent-blue: #83b0d6;
    --accent-green: #00cc96;
    --accent-red-light: #ec6c5b;
}
body {
    background-color: #696969;  /* match site's .content gray */
    color: white;
}
```

`#696969` is non-negotiable — it's the site's `.content` gray. Don't
introduce a different shade (e.g., #2a2a2a) without a clear reason; visual
consistency with the rest of the site matters more than picking a "perfect"
dark mode.

For the rest of the inline CSS (`.main-content`, `.about-section`,
`.arch-svg`, `.stack-table`, `.flow-steps`, `.legend`, `.diagram-caption`),
copy directly from `template.html` in this skill directory. Don't rewrite.

## SVG architecture diagram

The diagram is the centerpiece. It must show **information flow**, not
hierarchy.

### Layout

- `viewBox="0 0 840 <height>"` — width is always 840; height depends on depth
  (490 for shallow flows, 620+ for multi-tier with workers and storage)
- Use `<defs><marker id="arrow">` for the arrowhead (see template)
- Nodes are 160–200px wide, 60px tall, with rounded corners (`rx="6"`)

### Color coding (always use these)

| Category | Node fill | Stroke | Example services |
|---|---|---|---|
| Client | `#00CC96` fill-opacity 0.15 | `#00CC96` | Browser, mobile app |
| AWS edge / routing | `#83B0D6` fill-opacity 0.15 | `#83B0D6` | CloudFront, API Gateway, SNS, Route 53 |
| Compute | `#DE3B3E` fill-opacity 0.18 | `#EC6C5B` | Lambda, EC2, ECS |
| Storage | `#EC6C5B` fill-opacity 0.15 | `#EC6C5B` | DynamoDB, S3, RDS |
| External | `#FFFFFF` fill-opacity 0.08 | `#FFFFFF` stroke-opacity 0.4 | yfinance, SEC EDGAR, third-party APIs |

The legend below the diagram must include only the categories actually used.

### Arrow direction conventions

- **Single-headed** (`marker-end="url(#arrow)"`) — one-way operations:
  publish, upload, trigger, fire-and-forget writes
- **Double-headed** (`marker-start="url(#arrow)" marker-end="url(#arrow)"`) —
  true request/response: HTTPS, RPC, query+result

### Edge numbering

Every edge gets a numeric prefix in its label, matching the corresponding
step in the "What Happens When You Click X" section.

- Use `1, 2, 3...` for the primary path
- Use `1a, 1b...` for parallel branches at the same step
- Use `2'` (prime) for an alternate user path (e.g., a separate GET endpoint)

Example label: `<text class="edge-label" x="500" y="270" text-anchor="middle">3. put_item (PROCESSING)</text>`

### Diagram caption

Always end with a `<p class="diagram-caption">` explaining the arrow
convention and what the numbers refer to. One sentence is enough.

## Building the SVG diagram (step by step)

1. List every component as a row in your head: client → routing → compute →
   storage/external
2. Sketch positions in a 840-wide canvas. Allow 100px vertical per row.
   Center nodes horizontally; use left/right offsets for parallel branches.
3. Draw nodes first (`<rect>` + two `<text>` lines per node), then edges
   (`<line>` with appropriate marker attributes), then edge labels
4. Walk the flow once aloud — does the numbering match the steps below?
   Does every directional arrow correspond to a fire-and-forget operation?
   Do double-headed arrows correspond to request/response?
5. Add the legend with only used categories. Add the caption.

## Verification checklist

After deploying:

```powershell
$path = "/<PageName>-about.html"
$origin = "http://bigolbuffalo.com.s3-website-us-east-1.amazonaws.com"
$r = Invoke-WebRequest -UseBasicParsing "$origin$path"
"size: {0}" -f $r.Content.Length
$r.Content -match '<svg class="arch-svg"'        # SVG present
$r.Content -match 'class="topnav"'                # site nav present
$r.Content -match 'Back to'                       # reverse aboutUrl present

$src = Invoke-WebRequest -UseBasicParsing "$origin/<PageName>.html"
$src.Content -match '"right"[^>]*>About this page<'   # forward link present
```

The about link must appear *only* on the source page — check one other page
to confirm no leak.

## What not to do

- Don't add the about link to `_data/site.json` nav. The whole point of
  the `aboutUrl` mechanism is per-page opt-in.
- Don't link the GitHub repo root from a project-specific about page. Scope
  the link to the project's directory or external repo.
- Don't write multi-paragraph "What This Is" sections. Two paragraphs max.
- Don't use SVG `<text>` outside the `arch-svg` styling class — it'll
  inherit the wrong font.
- Don't put a `<a class="back-link">` inside the page body — the topnav's
  reverse `aboutUrl` link replaces it.
- Don't depend on external CSS (`css/style.css` etc.). The about page must
  be standalone — all styling inline.

## Reference

The full boilerplate (CSS + section scaffolding + sample SVG with the
correct marker, color classes, and node positioning) lives in
`template.html` in this skill directory. Copy that, then fill in the
project-specific content.
