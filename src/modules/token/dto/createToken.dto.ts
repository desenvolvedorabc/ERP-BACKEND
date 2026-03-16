import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateTokenDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsDate()
  @IsNotEmpty()
  expirationDate: Date;
}
