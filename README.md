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

## Deploying to S3

After `npm run build`, sync the `_site/` directory to the bucket:

```
aws s3 sync _site/ s3://bigolbuffalo.com/ --delete
```

`--delete` removes files from the bucket that no longer exist in `_site/`. Omit it the first time if you want to be cautious.

## HTTPS (CloudFront)

S3 website endpoints don't terminate TLS for custom domains, which is why
`https://bigolbuffalo.com` doesn't resolve today. To fix it:

1. Request a free certificate for `bigolbuffalo.com` (and `www.bigolbuffalo.com`)
   in **AWS Certificate Manager** in **us-east-1** (CloudFront requires us-east-1).
2. Create a **CloudFront distribution** with the S3 bucket as the origin.
   Use the REST endpoint (`bigolbuffalo.com.s3.amazonaws.com`) with an
   Origin Access Control, not the website endpoint — or, if you need
   directory-index redirect behavior, keep the website endpoint as a custom
   HTTP origin.
3. Attach the ACM cert and set the Alternate Domain Name to `bigolbuffalo.com`.
4. Set **Viewer Protocol Policy** = "Redirect HTTP to HTTPS".
5. In Route 53 (or your DNS), point `bigolbuffalo.com` at the CloudFront
   distribution (`d1234.cloudfront.net`) via an ALIAS / CNAME record.

After that, all the internal links in this site (which are now relative paths
like `/EnterTheBison.html`) will inherit whichever scheme the visitor used.
