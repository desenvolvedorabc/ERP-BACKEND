/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, Injectable } from '@nestjs/common'
import * as path from 'path'
import * as fs from 'fs'
import axios, { AxiosInstance, isAxiosError } from 'axios'
import * as https from 'https'
import { InternalServerError } from 'src/common/errors'

@Injectable()
export class HttpService {
  private readonly http: AxiosInstance
  constructor() {
    const httpsAgent = this.createHttpsAgent()

    this.http = axios.create({
      baseURL: process.env.BRADESCO_BASE_URL!,
      httpsAgent,
    })
  }

  private createHttpsAgent(): https.Agent {
    const publicKeyBase64 = process.env.BRADESCO_PUBLIC_KEY
    const privateKeyBase64 = process.env.BRADESCO_PRIVATE_KEY
    const caBase64 = process.env.BRADESCO_CA_BASE64

    if (!publicKeyBase64 || !privateKeyBase64) {
      return new https.Agent({ rejectUnauthorized: false })
    }

    try {
      const cert = Buffer.from(publicKeyBase64, 'base64')
      const key = Buffer.from(privateKeyBase64, 'base64')
      const ca = caBase64 ? Buffer.from(caBase64, 'base64') : undefined

      return new https.Agent({
        cert,
        key,
        ca,
        rejectUnauthorized: false,
      })
    } catch (error) {
      console.error('❌ Erro ao decodificar certificados mTLS:', error)
      throw new InternalServerError()
    }
  }

  async get<T, K>(url: string, params: K, headers?: object, baseURL?: string) {
    try {
      const res = await this.http.get(url, {
        headers,
        params,
        baseURL,
      })

      return (await res.data) as T
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Fetch error:', error.response.data)
        console.error(error.message)
        throw new HttpException(
          JSON.stringify(error.response.data.message ?? error.message),
          error.status,
        )
      }
    }
  }

  async post<T, K extends BodyInit>(
    url: string,
    data: K,
    headers: Record<string, string>,
    baseURL?: string,
  ) {
    try {
      const res = await this.http.post(url, data, {
        headers,
        baseURL,
      })

      return (await res.data) as T
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Fetch error:', error.response.data)
        console.error(error.message)
        throw new HttpException(
          JSON.stringify(error.response.data.message ?? error.message),
          error.status,
        )
      }
    }
  }

  private generateFile(data: any) {
    const filePath = path.join('./logs', `response.json`)
    fs.writeFileSync(filePath, data)
  }
}
