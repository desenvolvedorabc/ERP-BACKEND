import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ValidateShareBudgetPlanDto {
  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o username",
  })
  @ApiProperty()
  @IsString()
  username: string;

  @IsNotEmpty({
    message: "Informe a senha",
  })
  @ApiProperty()
  @IsString()
  password: string;
}
