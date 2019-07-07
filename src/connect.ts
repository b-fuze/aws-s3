import { request } from "https"
import { EMethod, IHeaders, IConfig, TQueryMap, datePad } from "./interfaces"
import { sign } from "./aws4"
import { URL } from "url"

export function connect(
  url: string,
  method: EMethod,
  userHeaders: IHeaders,
  config: IConfig,
  promise = true,
  singleChunk = true,
) {
  const parsedUrl = new URL(url)
  parsedUrl.searchParams.sort() // Alphabetically sort query params

  const time = new Date()
  const timeStringHeader = time.toISOString().replace(/[:-]/g, "").replace(/\.\d+Z/, "Z")

  const signedHeaders = new Map(Object.entries({
    "x-amz-date": timeStringHeader,
    host: parsedUrl.hostname,
  }))

  const {
    signature,
    scope,
    signedHeaders: fullySignedHeaders,
  } = sign(
    method,
    parsedUrl.pathname,
    <TQueryMap> <unknown> parsedUrl.searchParams,
    time,
    signedHeaders,
    config,
  )

  const headers = {
    ...(<any> Object).fromEntries(Array.from(signedHeaders)),
    ...userHeaders,
  }

  let promiseFinished: (data: Buffer) => void = null
  let promiseFailed: (reason: any) => void = null

  const req = request(url, {
    method,
    path: parsedUrl.pathname + parsedUrl.search,
    headers: {
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      "Authorization": `AWS4-HMAC-SHA256 Credential=${ config.AWS_ACCESS_KEY_ID }/${ scope }, SignedHeaders=${ fullySignedHeaders }, Signature=${ signature }`,
      ...headers,
    },
  }, res => {
      const buffers: Buffer[] = []
      let totalLength = 0

      const statusCode = res.statusCode
      if (!(statusCode >= 200 && statusCode < 300)) {
        return promiseFailed("Status code: " + statusCode)
      }

      res.on("data", chunk => {
        totalLength += chunk.length
        buffers.push(chunk)
      })

      res.on("end", () => {
        promiseFinished(Buffer.concat(buffers, totalLength))
      })
  })

  return {
    request: req,
    promise: new Promise<Buffer>((resolve, reject) => {
      promiseFinished = resolve
      promiseFailed = reject
    }),
  }
}
