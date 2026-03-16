import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class MassApprovalDataDTO {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  obs: string;
}
