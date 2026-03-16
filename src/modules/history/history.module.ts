import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { History } from "./entities/history.entity";
import { HistoryService } from "./history.service";
import { HistoryRepository } from "./repositories/history-repository";
/*
https://docs.nestjs.com/modules
*/

@Module({
  imports: [TypeOrmModule.forFeature([History])],
  exports: [HistoryService],
  controllers: [],
  providers: [HistoryService, HistoryRepository],
})
export class HistoryModule {}
