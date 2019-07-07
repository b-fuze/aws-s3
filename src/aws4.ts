import { createHmac, createHash } from "crypto"
import {
  IConfig,
  EMethod,
  IHeaders,
  TQueryMap,

  queryString,
  datePad,
} from "./interfaces"

const _hmac = (content: string | Buffer, key: string | Buffer) => {
  const hmacProducer = createHmac("sha256", key)
  hmacProducer.update(content)

  return hmacProducer
}

const hmacRaw = (content: string | Buffer, key: string | Buffer) => _hmac(content, key).digest()
const hmacHex = (content: string | Buffer, key: string | Buffer) => _hmac(content, key).digest("hex")

const shaHash = (content: string) => {
  const hashProducer = createHash("sha256")
  hashProducer.update(content)

  return hashProducer.digest("hex")
}

export function sign(
  method: EMethod,
  path: string,
  query: TQueryMap,
  time: Date,
  headers: Map<string, string>,
  config: IConfig,
) {
  const sortedHeaders = Array.from(headers)
    .map(h => [h[0].toLowerCase(), h[1].trim()])
    .sort((a, b) => {
      const astr = a[0]
      const bstr = b[0]
      return astr < bstr
        ? -1
        : 1
    })

  const signedHeaders = sortedHeaders.map(h => h[0]).join(";")
  const canonicalStr = ""
    + method + "\n"
    + path + "\n"
    + queryString(query) + "\n"
    + sortedHeaders.map(h => h[0] + ":" + h[1]).join("\n") + "\n\n"
    + signedHeaders + "\n"
    + "UNSIGNED-PAYLOAD"

  const timestampStart = ""
    + time.getUTCFullYear()
    + datePad(time.getUTCMonth() + 1)
    + datePad(time.getUTCDate())

  const timestamp = time.toISOString().replace(/[:-]/g, "").replace(/\.\d+Z/, "Z")

  const scope = ""
    + timestampStart + "/"
    + config.AWS_REGION.toLowerCase() + "/"
    + "s3" + "/"
    + "aws4_request"

  const stringToSign = ""
    + "AWS4-HMAC-SHA256" + "\n"
    + timestamp + "\n"
    + scope + "\n"
    + shaHash(canonicalStr)

  const dateKey = hmacRaw(timestampStart, "AWS4" + config.AWS_SECRET_ACCESS_KEY)
  const dateRegionKey = hmacRaw(config.AWS_REGION, dateKey)
  const dateRegionServiceKey = hmacRaw("s3", dateRegionKey)
  const signingKey = hmacRaw("aws4_request", dateRegionServiceKey)

  const signature = hmacHex(stringToSign, signingKey)
  return {
    signature,
    scope,
    signedHeaders,
  }
}
