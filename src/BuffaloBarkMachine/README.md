# Buffalo Bark Machine

Self-contained serverless text-to-speech demo. Type some text, pick an Amazon
Polly voice, get back a playable MP3.

This directory contains **everything** that makes it work — frontend, backend
Lambdas, architecture docs — so the whole component can be lifted out as a
standalone project if needed.

## Contents

```
BuffaloBarkMachine/
├── README.md                          this file
├── BuffaloBarkMachine.html            page UI (form + results table)
├── BuffaloBarkMachine-about.html      about page (architecture + flow)
├── scripts.js                         client-side JS (jQuery POST/GET, UI updates)
├── BuffaloBarkMachine.json            Eleventy directory data file (permalink override)
└── backend/
    ├── PostReader_NewPosts.py         Lambda: POST handler
    ├── PostReader_GetPosts.py         Lambda: GET handler
    └── PostReader_ConvertToAudio.py   Lambda: SNS-triggered worker
```

## Eleventy notes (specific to this directory)

- `BuffaloBarkMachine.json` overrides the parent `src/src.json` permalink so
  files here ship to root (`/BuffaloBarkMachine.html`) rather than nested
  (`/BuffaloBarkMachine/BuffaloBarkMachine.html`). Inbound links keep working.
- `scripts.js` is passthrough-copied to `/scripts.js` (mapped in
  `eleventy.config.js`).
- `README.md` and `backend/` are added to `eleventyConfig.ignores` — they
  don't ship to the web.

## Architecture

```
Browser ──POST──► API Gateway (PostReaderAPI) ──► PostReader_NewPosts
                                                       │
                                                       ├─► DynamoDB.put_item("posts", {id, voice, text, status: PROCESSING})
                                                       └─► SNS.publish("New_Posts", id)
                                                                 │
                                                                 ▼
                                                  PostReader_ConvertToAudio
                                                       │
                                                       ├─► Polly.synthesize_speech
                                                       ├─► S3.upload("pollymp3pail/<id>.mp3", public-read)
                                                       └─► DynamoDB.update_item(status=UPDATED, url=<s3 url>)

Browser ──GET ?postId=X──► API Gateway ──► PostReader_GetPosts ──► DynamoDB.scan / query("posts")
```

## AWS resources

| Resource | Name / ARN |
|---|---|
| API Gateway | `PostReaderAPI` (id `gdnpzn2q0l`), region `us-east-1` |
| DynamoDB table | `posts` (single HASH key `id` of type String, on-demand billing) |
| SNS topic | `arn:aws:sns:us-east-1:153765355464:New_Posts` |
| S3 bucket (audio) | `pollymp3pail` |
| IAM role | `MyLambdaPollyRole` (policy `MyLambdaPollyPolicy`) |
| Runtime | Python 3.12 on all three functions |

## Backend functions

| File | Function name | Trigger | Env vars |
|---|---|---|---|
| `backend/PostReader_NewPosts.py` | `PostReader_NewPosts` | API Gateway POST `/` | `DB_TABLE_NAME`, `SNS_TOPIC` |
| `backend/PostReader_GetPosts.py` | `PostReader_GetPosts` | API Gateway GET `/` | `DB_TABLE_NAME` |
| `backend/PostReader_ConvertToAudio.py` | `PostReader_ConvertToAudio` | SNS subscription on `New_Posts` | `DB_TABLE_NAME`, `BUCKET_NAME` |

## Redeploying a Lambda

```bash
# Edit the .py file, then:
zip -j /tmp/fn.zip src/BuffaloBarkMachine/backend/PostReader_ConvertToAudio.py
aws lambda update-function-code \
  --function-name PostReader_ConvertToAudio \
  --zip-file fileb:///tmp/fn.zip
```

## Extracting as a standalone project

The whole component is self-contained in this directory. To pull it out:

1. Copy `src/BuffaloBarkMachine/` to a new repo.
2. The HTML files reference the site's `layouts/page.njk` and the
   `aboutUrl` topnav slot — strip the front matter or rewrite for whatever
   the new project's layout system is.
3. `scripts.js` references `/scripts.js` as its served path; adjust if needed.
4. Backend Lambdas are AWS-side, independent of where the frontend is hosted.
