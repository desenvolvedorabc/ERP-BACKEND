import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class ApproveDataDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  payableId: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  obs: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
