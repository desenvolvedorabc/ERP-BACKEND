import { Module } from "@nestjs/common";
import { RemessaGateway } from "./remessa.gateway";
import { RetornoGateway } from "./retorno.gateway";

@Module({
  providers: [RemessaGateway, RetornoGateway],
  exports: [RemessaGateway, RetornoGateway],
})
export class CnabModule {}
