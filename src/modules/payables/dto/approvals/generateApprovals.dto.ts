import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GenerateApprovalsDTO {
  @ApiProperty()
  @IsArray({ each: true })
  @IsNumber()
  @IsNotEmpty()
  approvers: number[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  payableId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifierCode: string;

  constructor(approvers: number[], payableId: number, identifierCode: string) {
    this.approvers = approvers;
    this.payableId = payableId;
    this.identifierCode = identifierCode;
  }
}
