import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollaboratorsController } from "./collaborators.controller";
import { CollaboratorsService } from "./collaborators.service";
import { Collaborator } from "./entities/collaborator.entity";
import { CollaboratorHistory } from "./entities/collaborator-history.entity";
import { CollaboratorsRepository } from "./repositories/typeorm/collaborators-repository";
import { CollaboratorHistoryRepository } from "./repositories/collaborator-history-repository";
import { CollaboratorHistoryService } from "./services/collaborator-history.service";
import { ImportCollaboratorHistoryService } from "./services/import-collaborator-history.service";
import { ImportCollaboratorsService } from "./services/import-collaborators.service";
import { UsersModule } from "../users/users.module";
import { ApprovalValidationService } from "src/common/services/approval-validation.service";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [
    TypeOrmModule.forFeature([Collaborator, CollaboratorHistory]),
    UsersModule,
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
      },
    }),
  ],
  controllers: [CollaboratorsController],
  providers: [
    CollaboratorsService,
    CollaboratorsRepository,
    CollaboratorHistoryRepository,
    CollaboratorHistoryService,
    ImportCollaboratorHistoryService,
    ImportCollaboratorsService,
    ApprovalValidationService,
  ],
  exports: [CollaboratorsService],
})
export class CollaboratorsModule {}
