import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { DisableBy } from "../enum";

export class DisableCollaboratorDto {
  @ApiProperty({
    enum: DisableBy,
  })
  @IsEnum(DisableBy)
  @IsOptional()
  disableBy: DisableBy = null;
}
