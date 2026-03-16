import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PayableStatus } from "../../enums";

export class ApprovePayableDTO {
  @ApiProperty()
  @IsEnum(PayableStatus)
  payableStatus: PayableStatus;

  @ApiProperty()
  @IsOptional()
  @IsString()
  obs: string;
}
