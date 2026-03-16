import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ApprovalCredentialsDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  payableId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
