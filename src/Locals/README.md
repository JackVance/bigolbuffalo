# Locals

Project about-pages for things that **don't have a live demo on bigolbuffalo**
— typically projects whose source / write-up is the thing you want to show,
not a running interactive app.

Every file dropped in here is auto-tagged `locals` (via `Locals.json`
directory data file) and auto-listed under the "Locals Only" subheader
on `/Bython.html` — no manual edits to Bython.html required per project.

## How to add a Local project

Two flows depending on where the project lives.

### Flow A — author directly in bigolbuffalo

For projects that don't have their own separate repo, or for which you
want bigolbuffalo to be the canonical home of the about page.

1. Ask Claude to use the `about-page-bigolbuffalo` skill to draft the
   file. It produces an Eleventy-ready page with the architecture
   diagram, flow steps, tech stack, etc.
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

### Flow B — author in the project's own repo, host the page here

For projects that have their own repo and you want the standalone
HTML to live there as canonical (so visitors to the source repo can
open `about.html` directly), with a mirror on bigolbuffalo for the
Bython listing.

1. In the project's own repo, ask Claude to use the **global**
   `about-page` skill. It produces a complete standalone HTML file
   (`<!DOCTYPE html>`, full `<head>`, etc.). Commit there.
2. Copy that HTML file into `src/Locals/<ProjectName>-about.html` in
   this repo.
3. In a Claude Code session here, say "adapt the local about page"
   (or similar — see the `about-page-bigolbuffalo` skill's trigger
   phrases). The skill applies four small transforms: drops the
   DOCTYPE/html/head/body wrappers, removes the conflicting
   `html, body` CSS reset, and adds the Eleventy front matter with
   `projectName`, `shortDescription`, etc. derived from the source.
4. `npm run deploy`.

If the source-project's about page later changes, re-copy and re-adapt
to keep this mirror in sync. The bigolbuffalo file is not canonical —
the source-project file is.

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
