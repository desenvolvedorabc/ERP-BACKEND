import { IntersectionType, PartialType } from "@nestjs/swagger";
import { CreateCollaboratorDto } from "./create-collaborator.dto";
import { CompleteRegistrationCollaborator } from "./complete-registration-collaborator";

export class UpdateCollaboratorDto extends PartialType(
  IntersectionType(CreateCollaboratorDto, CompleteRegistrationCollaborator),
) {}
