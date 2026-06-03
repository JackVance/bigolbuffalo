# Locals

Project about-pages for things that **don't have a live demo on bigolbuffalo**
— typically projects whose source / write-up is the thing you want to show,
not a running interactive app.

Every file dropped in here is auto-tagged `locals` (via `Locals.json`
directory data file) and auto-listed under the "Locals Only" subheader
on `/Bython.html` — no manual edits to Bython.html required per project.

## How to add a Local project

1. Use the `about-page` skill to draft the file. It produces a self-contained
   HTML page with the architecture diagram, flow steps, tech stack, etc.
2. Save it as `<ProjectName>-about.html` in this directory.
3. Front matter must include:

```yaml
---
layout: layouts/standalone.njk
title: About <ProjectName>
projectName: <ProjectName>             # display name on Bython.html
shortDescription: <one-liner>          # appears under the link
aboutUrl: /Bython.html
aboutLabel: Back to Bython
---
```

4. `npm run deploy`. The Bython page now shows the new entry.

## What goes here vs. at root

| Project type | Where the about page lives |
|---|---|
| Interactive page on bigolbuffalo (has a live UI) | Root of `src/` (or inside its component directory) |
| Just docs + source — no live demo here | `src/Locals/` |

Example of the first: `BuffaloBarkMachine-about.html` lives next to
`BuffaloBarkMachine.html` — the bark machine has a live UI on the site.

Example of the second (hypothetical): an about page for a private CLI
tool you wrote, where the bigolbuffalo audience just gets the write-up
and a source link.
