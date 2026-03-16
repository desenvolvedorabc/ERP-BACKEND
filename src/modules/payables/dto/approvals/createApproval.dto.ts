import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, ValidateIf } from "class-validator";

export class CreateApprovalDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf(({ userId }) => !userId)
  collaboratorId?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf(({ collaboratorId }) => !collaboratorId)
  userId?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  payableId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  constructor({
    collaboratorId,
    payableId,
    password,
    userId,
  }: {
    collaboratorId?: number | null;
    payableId: number;
    password: string;
    userId?: number;
  }) {
    this.collaboratorId = collaboratorId;
    this.payableId = payableId;
    this.password = password;
    this.userId = userId;
  }
}
