/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common'
import { apiBradescoController } from './apiBradesco.controller'
import { ApiBradescoService } from './apiBradesco.service'
import { HttpService } from './http.service'
import { HeaderService } from './header.service'
import { TokenModule } from '../token/token.module'

@Module({
  imports: [TokenModule],
  controllers: [apiBradescoController],
  exports: [ApiBradescoService],
  providers: [ApiBradescoService, HttpService, HeaderService],
})
export class ApiBradescoModule {}
