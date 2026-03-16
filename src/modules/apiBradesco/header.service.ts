/*
https://docs.nestjs.com/providers#services
*/
'deploy'
import { Injectable } from '@nestjs/common'
import * as path from 'path'
import * as fs from 'fs'
import { format } from 'date-fns'

@Injectable()
export class HeaderService {
  generateHeader(bearerToken: string): any {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    }
    return headers
  }

  generateXBradSignature(
    bearerToken: string,
    endPoint: string,
    params: object,
    nonce: string,
    timestamp: string,
  ): any {
    const buildedParams = this.buildParams(params)

    const text = ['GET', endPoint, buildedParams, '', bearerToken, nonce, timestamp, 'SHA256'].join(
      '\n',
    )

    return {
      message: text,
    }
  }

  private getTimeStamp(): string {
    return format(new Date(), "yyyy-MM-dd'T'HH:mm") + ':00-00:00'
  }

  private buildParams(params: object) {
    return Object.entries(params)
      .flatMap(([key, value]) => `${key}=${value}`)
      .join('&')
  }

  private generateFile(data: any, name: string) {
    const filePath = path.join('./logs', `${name}`)
    fs.writeFileSync(filePath, typeof data === 'string' ? data : JSON.stringify(data))
  }
}
