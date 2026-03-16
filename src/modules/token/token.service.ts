/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common'
import { TokenRepository } from './repositories/token-repository'
import { CreatingTokenError, FetchingTokendError, TokenNotFoundError } from './errors'
import { addSeconds, isAfter, parseISO } from 'date-fns'
import { HttpService } from '../apiBradesco/http.service'
import { GetTokenResponseDTO } from './dto/getTokenResponse.dto'
import { Token } from './entities/token.entity'

@Injectable()
export class TokenService {
  constructor(
    private tokenRepository: TokenRepository,
    private readonly httpService: HttpService,
  ) {}

  async getToken(): Promise<Token> {
    let payload: Token
    try {
      payload = await this.tokenRepository._findFirst()
      if (payload) {
        if (typeof payload.expirationDate === 'string') {
          payload = {
            ...payload,
            expirationDate: parseISO(payload.expirationDate),
          }
        }
        if (isAfter(new Date(), payload?.expirationDate ?? 0)) {
          payload = await this.getTokenFromAPI()
        }
      } else {
        payload = await this.getTokenFromAPI()
      }
    } catch (error) {
      console.error(error)
      throw new FetchingTokendError()
    }
    if (!payload) {
      throw new TokenNotFoundError()
    }
    return payload
  }

  private async getTokenFromAPI() {
    await this.tokenRepository._clear()
    const data = {
      grant_type: 'client_credentials',
      client_secret: process.env.BRADESCO_CLIENT_SECRET!,
      client_id: process.env.BRADESCO_CLIENT_KEY!,
    }
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    const formBody = Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')

    const response = await this.httpService.post<GetTokenResponseDTO, string>(
      '/auth/server-mtls/v2/token',
      formBody,
      headers,
    )
    return { token: response.access_token } as Token
  }

  private async store(data: GetTokenResponseDTO): Promise<void> {
    try {
      await this.tokenRepository._create({
        token: data.access_token,
        expirationDate: addSeconds(new Date(), data.expires_in - 10),
      })
    } catch (error) {
      console.error(error)
      throw new CreatingTokenError()
    }
  }
}
