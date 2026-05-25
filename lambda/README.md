# Lambda source — Buffalo Bark Machine backend

Source for the three AWS Lambda functions that power
`/BuffaloBarkMachine.html`. **Not deployed by the Eleventy build** —
this directory is a backup / readable artifact so the source isn't
only inside AWS Lambda.

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

## Resources

| Resource | Name / ARN |
|---|---|
| API Gateway | `PostReaderAPI` (id `gdnpzn2q0l`), region `us-east-1` |
| DynamoDB table | `posts` (single HASH key `id` of type String, on-demand billing) |
| SNS topic | `arn:aws:sns:us-east-1:153765355464:New_Posts` |
| S3 bucket (audio) | `pollymp3pail` |
| IAM role | `MyLambdaPollyRole` (policy `MyLambdaPollyPolicy`) |
| Runtime | Python 3.12 on all three functions |

## Lambdas

| File | Function name | Trigger | Env vars |
|---|---|---|---|
| `PostReader_NewPosts.py` | `PostReader_NewPosts` | API Gateway POST `/` | `DB_TABLE_NAME`, `SNS_TOPIC` |
| `PostReader_GetPosts.py` | `PostReader_GetPosts` | API Gateway GET `/` | `DB_TABLE_NAME` |
| `PostReader_ConvertToAudio.py` | `PostReader_ConvertToAudio` | SNS subscription on `New_Posts` | `DB_TABLE_NAME`, `BUCKET_NAME` |

## Redeploying a function

```bash
# Edit the .py file, then:
zip -j /tmp/fn.zip lambda/PostReader_ConvertToAudio.py
aws lambda update-function-code \
  --function-name PostReader_ConvertToAudio \
  --zip-file fileb:///tmp/fn.zip
```

For more substantial changes (dependencies, multiple files), build a
proper deployment package per AWS Lambda Python docs.
