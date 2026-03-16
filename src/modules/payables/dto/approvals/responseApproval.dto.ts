import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Approvals } from "../../entities/approval.entity";

export class ResponseApprovalDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNumber()
  collaboratorId: number;

  @ApiProperty()
  @IsBoolean()
  approved: boolean;

  @ApiProperty()
  @IsString()
  obs: string;

  constructor(approval: Approvals) {
    this.id = approval.id;
    this.collaboratorId = approval.collaboratorId;
    this.approved = approval.approved;
    this.obs = approval.obs;
  }
}
