#!/usr/bin/env node

import { readFileSync } from "fs"
import { resolve as resolvePath } from "path"
import { IConfig, EMethod, TQueryMap } from "./interfaces"
import { connect } from "./connect"

// Load some settings:
// const config: IConfig = require(resolvePath(__dirname, "../config.json"))

export class Bucket {
  constructor(
    public bucket: string,
    public config: IConfig,
  ) { }

  get(object: string) {
    const { request, promise } = connect(
      `https://${ this.bucket }.s3-${ this.config.AWS_REGION }.amazonaws.com${ object }`,
      EMethod.GET,
      {},
      this.config,
    )

    request.end()
    return promise
  }

  putBuffer(object: string, buffer: Buffer) {
    const { request, promise } = connect(
      `https://${ this.bucket }.s3-${ this.config.AWS_REGION }.amazonaws.com${ object }`,
      EMethod.PUT,
      {
        "content-length": buffer.length,
      },
      this.config,
    )

    request.write(buffer)
    request.end()
    return promise
  }

  putStream(object: string, stream: NodeJS.ReadableStream, size: number) {
    const { request, promise } = connect(
      `https://${ this.bucket }.s3-${ this.config.AWS_REGION }.amazonaws.com${ object }`,
      EMethod.PUT,
      {
        "content-length": size,
      },
      this.config,
    )

    stream.pipe(request)
    return promise
  }

  delete(object: string) {
    const { request, promise } = connect(
      `https://${ this.bucket }.s3-${ this.config.AWS_REGION }.amazonaws.com${ object }`,
      EMethod.DELETE,
      {},
      this.config,
    )

    request.end()
    return promise
  }
}
