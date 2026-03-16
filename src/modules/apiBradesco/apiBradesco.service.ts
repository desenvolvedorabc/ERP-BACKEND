/*
https://docs.nestjs.com/providers#services
*/

import { BadGatewayException, Injectable } from '@nestjs/common'
import { balanceParamsDTO } from './dtos/balanceParams.dto'
import { BalanceResponseDTO } from './dtos/balanceResponse.dto'
import { statementParamsDTO } from './dtos/statementParams.dto'
import { StatementResponseDTO } from './dtos/statementResponse.dto'
import { HttpService } from './http.service'
import { HeaderService } from './header.service'
import { TokenService } from '../token/token.service'
import { parseMonetaryToNumber } from 'src/common/utils/parseMonetaryToNumber'

@Injectable()
export class ApiBradescoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly headerService: HeaderService,
    private readonly tokenService: TokenService,
  ) {}

  async getBalance(params: balanceParamsDTO): Promise<{ balance: number }> {
    const response = await this.get<BalanceResponseDTO, balanceParamsDTO>('saldos', params)

    const freeBalance = response.saldoCC.lstLancamentosSaldos.find((ls) => ls.codigoProduto === 984)

    let balance: number = parseMonetaryToNumber(freeBalance.valorLancamento)
    if (freeBalance.sinalSaldo === '-') {
      balance = balance * -1
    }

    return { balance }
  }

  async getStatement(params: statementParamsDTO): Promise<StatementResponseDTO> {
    return await this.get<StatementResponseDTO, statementParamsDTO>('extratos', params)
  }

  private async get<T, K extends object>(url: string, params: K) {
    try {
      const token = await this.tokenService.getToken()

      const headers = this.headerService.generateHeader(token.token)

      const response = await this.httpService.get<T, K>(
        '/v1/fornecimento-extratos-contas/extratos',
        params,
        headers,
      )

      return response
    } catch (error) {
      throw new BadGatewayException('Instabilidade na API do Bradesco, tente novamente mais tarde.')
    }
  }
}
