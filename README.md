# bigolbuffalo.com

Static site for **bigolbuffalo.com**, built with [Eleventy](https://www.11ty.dev/) and hosted on Amazon S3.

## Project layout

```
src/
  _data/site.json           site-wide data (title, nav items, contact, GA id)
  _includes/
    layouts/
      base.njk              HTML shell (head, analytics, body)
      page.njk              base + topnav + .content wrapper + footer
    partials/
      analytics.njk         Google Analytics gtag snippet
      topnav.njk            renders nav from site.nav
      footer.njk            contact + donate link
  src.json                  directory-wide settings (flat .html permalinks)
  index.html                homepage (uses base.njk — has its own splash layout)
  EnterTheBison.html        article archive
  BuffaloBarkMachine.html   Polly TTS demo
  Bython.html               Python projects
  error.html                404 page
  basedorgayorretarded.html one-off page
  Bison/
    ArchetypalBison.html
    aPoem.html
    Consciousness.html
    EgoVsExecution.html
  genstyle.css              stylesheet (passthrough copy)
  scripts.js                Buffalo Bark Machine JS (passthrough copy)
  BuffaloPorn/              images (passthrough copy)
eleventy.config.js          Eleventy config
_site/                      build output (gitignored — what gets uploaded to S3)
```

## Adding a new article

1. Drop a new `.html` file in `src/Bison/` with this front matter:
   ```
   ---
   layout: layouts/page.njk
   title: Your Article Title
   ---
   <h1>Your Article Title</h1>
   <p>...</p>
   ```
2. Add a link to it in `src/EnterTheBison.html`.

That's it. No need to copy a header/footer or the GA snippet — they're injected automatically.

## Adding a new top-level page

Same as above, but drop the file directly in `src/`. If it should appear in the nav, add an entry to `src/_data/site.json` under `nav`.

## Local development

```
npm install
npm run serve          # http://localhost:8080, live reload
npm run build          # writes _site/
npm run clean          # remove _site/
```

## Deploying

```
npm run deploy
```

That runs `scripts/deploy.mjs`, which does three things:

1. `npx eleventy` — build `_site/`
2. `aws s3 sync _site/ s3://bigolbuffalo.com/ --delete` — push to S3
3. `aws cloudfront create-invalidation --distribution-id E2LU60HYKV3X5S --paths "/*"` — flush the CloudFront cache so visitors see the new version immediately

Without step 3 the CDN keeps serving the old content for up to a day. CloudFront gives you 1,000 free invalidation paths per month; `/*` counts as 1 path, so cost is effectively zero.

## Infrastructure (already wired up)

- **S3 bucket**: `bigolbuffalo.com` in `us-east-1`. Configured as a static website with index document `index.html` and error document `error.html`. Used as a custom HTTP origin behind CloudFront (NOT a bucket origin with OAC — keeping it as a website endpoint preserves index-document and error-page routing).
- **CloudFront distribution**: `E2LU60HYKV3X5S` (domain `d12i18v5yfe2zb.cloudfront.net`). Viewer protocol redirects HTTP to HTTPS. Origin is the S3 website endpoint over HTTP only.
- **ACM certificate**: in `us-east-1` covering `bigolbuffalo.com` and `www.bigolbuffalo.com`. Auto-renews. Free (non-exportable).
- **Route 53**: hosted zone for `bigolbuffalo.com`. Apex and `www` are A/AAAA aliases pointing at the CloudFront distribution.
