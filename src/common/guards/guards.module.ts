/*
https://docs.nestjs.com/modules
*/

import { Global, Module } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { ShareBasicAuthGuard } from "./share-basic-auth.guard";
import { JwtOrBasicAuthGuard } from "./jwtOrBasicAuth.guard";
import { ApprovalsRepository } from "src/modules/payables/repositories/approval-repository";
import { OptionsBasicAuthGuard } from "./OptionsBasicAuth.guard";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    JwtAuthGuard,
    ShareBasicAuthGuard,
    JwtOrBasicAuthGuard,
    ApprovalsRepository,
    OptionsBasicAuthGuard,
  ],
  exports: [
    JwtAuthGuard,
    ShareBasicAuthGuard,
    JwtOrBasicAuthGuard,
    OptionsBasicAuthGuard,
  ],
})
export class GuardsModule {}
