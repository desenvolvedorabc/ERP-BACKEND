import { Module } from "@nestjs/common";
import { ProgramsService } from "./programs.service";
import { ProgramsController } from "./programs.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Program } from "./entities/program.entity";
import { ProgramsRepository } from "./repositories/typeorm/programs-repository";

@Module({
  imports: [TypeOrmModule.forFeature([Program])],
  controllers: [ProgramsController],
  providers: [ProgramsService, ProgramsRepository],
  exports: [ProgramsService, ProgramsRepository],
})
export class ProgramsModule {}
