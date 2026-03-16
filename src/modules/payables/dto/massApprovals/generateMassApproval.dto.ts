import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GenerateMassApprovalDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  collaboratorId: number;

  @ApiProperty()
  @IsArray({ each: true })
  @IsNumber()
  @IsNotEmpty()
  payableIds: number[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifierCode: string;

  constructor(approver: number, payableIds: number[], identifierCode: string) {
    this.collaboratorId = approver;
    this.payableIds = payableIds;
    this.identifierCode = identifierCode;
  }
}
