import { TokenController } from './token.controller'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Token } from './entities/token.entity'
import { TokenService } from './token.service'
import { TokenRepository } from './repositories/token-repository'
import { HttpService } from '../apiBradesco/http.service'
/*
https://docs.nestjs.com/modules
*/

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  exports: [TokenService],
  controllers: [TokenController],
  providers: [TokenService, TokenRepository, HttpService],
})
export class TokenModule {}
