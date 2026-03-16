import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBradescoService } from './apiBradesco.service'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { ApiBearerAuth } from '@nestjs/swagger'
import { balanceParamsDTO } from './dtos/balanceParams.dto'
import { statementParamsDTO } from './dtos/statementParams.dto'
import { StatementResponseDTO } from './dtos/statementResponse.dto'
/*
https://docs.nestjs.com/controllers#controllers
*/

@Controller('apiBradesco')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class apiBradescoController {
  constructor(private readonly apiBradescoService: ApiBradescoService) {}

  @Get('/balance')
  async getBalance(@Query() params: balanceParamsDTO): Promise<{ balance: number }> {
    return await this.apiBradescoService.getBalance(params)
  }

  @Get('/statement')
  async getStatement(@Query() params: statementParamsDTO): Promise<StatementResponseDTO> {
    return await this.apiBradescoService.getStatement(params)
  }
}
