# AWS S3 Client
A minimal no-dep S3 client for NodeJS (v12+)

## Install
```
npm i -S @b-fuze/aws-s3
```

## Usage
```javascript
import { Bucket } from "@b-fuze/aws-s3"

const bucket = new Bucket("my-bucket", {
  AWS_ACCESS_KEY_ID: "access-key-id",
  AWS_SECRET_ACCESS_KEY: "secret-access-key",
  AWS_REGION: "region",
})

bucket.putBuffer("/object/key.ext", someBuffer)
  .then(() => {
    console.log("Success")
  })
```

## API

### class Bucket
Base Bucket class

#### `bucket.get(object: string)`
 - `object`: Object key

Get an object from the bucket

Returns a promise that resolves to a buffer of the object

#### `bucket.putBuffer(object: string, buffer: Buffer)`
 - `object`: Object key
 - `buffer`: Buffer with data

Returns a promise that resolves on success

#### `bucket.putStream(object: string, stream: ReadableStream, size: number)`
 - `object`: Object key
 - `stream`: Stream with data
 - `size`: Total size of stream

Returns a promise that resolves on success

#### `bucket.delete(object: string)`
 - `object`: Object key

Returns a promise that resolves on success

## Development
Run the following to build aws-s3
```
npm run build
```
